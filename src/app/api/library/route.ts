import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "LIBRARIAN", "TEACHER", "STUDENT", "PARENT"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (category) where.category = category;
    if (search) where.OR = [{ title: { contains: search, mode: "insensitive" } }, { author: { contains: search, mode: "insensitive" } }];

    const books = await prisma.libraryBook.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const borrowings = await prisma.libraryBorrowing.findMany({
      where: { status: "borrowed" },
      include: { student: { select: { firstName: true, lastName: true } }, book: { select: { title: true } } },
      orderBy: { dueDate: "asc" },
    });

    const now = new Date();
    const updatedBorrowings = borrowings.map(b => {
      const dueDate = new Date(b.dueDate);
      if (b.status === "borrowed" && now > dueDate) {
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
        const penaltyPerDay = Number(process.env.LATE_PENALTY_PER_DAY) || 100;
        return { ...b, isOverdue: true, daysOverdue, penalty: daysOverdue * penaltyPerDay };
      }
      return { ...b, isOverdue: false, daysOverdue: 0, penalty: 0 };
    });

    const totalBooks = books.reduce((sum, b) => sum + b.copies, 0);
    const availableBooks = books.reduce((sum, b) => sum + b.available, 0);

    return NextResponse.json({
      books,
      borrowings: updatedBorrowings,
      stats: { totalTitles: books.length, totalBooks, availableBooks, borrowed: borrowings.length },
    });
  } catch (error) {
    console.error("GET /api/library error:", error);
    return NextResponse.json({ error: "Failed to fetch library data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "LIBRARIAN"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { title, author, isbn, category, copies, publisher, location } = body;

    if (!title || !author) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

    const schoolId = await getDefaultSchoolId();
    const book = await prisma.libraryBook.create({
      data: {
        schoolId,
        title,
        author,
        isbn: isbn || undefined,
        category: category || "general",
        copies: parseInt(copies) || 1,
        available: parseInt(copies) || 1,
        publisher: publisher || undefined,
        location: location || undefined,
      },
    });

    return NextResponse.json({ success: true, book }, { status: 201 });
  } catch (error) {
    console.error("POST /api/library error:", error);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "LIBRARIAN"]);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { id, action, title, author, isbn, category, copies, publisher, location } = body;

    if (action === "return") {
      const borrowing = await prisma.libraryBorrowing.findUnique({ where: { id } });
      if (!borrowing) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const now = new Date();
      const dueDate = new Date(borrowing.dueDate);
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / 86400000));
      const penalty = daysOverdue * (Number(process.env.LATE_PENALTY_PER_DAY) || 100);

      await prisma.libraryBorrowing.update({
        where: { id },
        data: { status: "returned", returnDate: now, penalty },
      });

      await prisma.libraryBook.update({
        where: { id: borrowing.bookId },
        data: { available: { increment: 1 } },
      });

      return NextResponse.json({ success: true, penalty, daysOverdue });
    }

    if (action === "issue") {
      const { studentId, dueDate } = body;
      if (!id || !studentId || !dueDate) {
        return NextResponse.json({ error: "Missing bookId, studentId, or dueDate" }, { status: 400 });
      }

      const book = await prisma.libraryBook.findUnique({ where: { id } });
      if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });
      if (book.available < 1) return NextResponse.json({ error: "No copies available" }, { status: 400 });

      const borrowing = await prisma.libraryBorrowing.create({
        data: {
          bookId: id,
          studentId,
          dueDate: new Date(dueDate),
          status: "borrowed",
        },
      });

      await prisma.libraryBook.update({
        where: { id },
        data: { available: { decrement: 1 } },
      });

      return NextResponse.json({ success: true, borrowing }, { status: 201 });
    }

    if (action === "update") {
      if (!id) return NextResponse.json({ error: "Book ID is required" }, { status: 400 });

      const book = await prisma.libraryBook.update({
        where: { id },
        data: {
          title: title || undefined,
          author: author || undefined,
          isbn: isbn || undefined,
          category: category || undefined,
          copies: copies ? parseInt(copies) : undefined,
          publisher: publisher || undefined,
          location: location || undefined,
        },
      });

      return NextResponse.json({ success: true, book });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/library error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(["OWNER", "ADMINISTRATOR", "LIBRARIAN"]);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const borrowings = await prisma.libraryBorrowing.findMany({
      where: { bookId: id, status: "borrowed" },
    });
    if (borrowings.length > 0) {
      return NextResponse.json({ error: "Cannot delete book with active borrowings" }, { status: 400 });
    }

    await prisma.libraryBook.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/library error:", error);
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
