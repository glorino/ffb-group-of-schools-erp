import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getDefaultSchoolId } from "@/lib/school";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    // Check for overdue books and calculate penalties
    const now = new Date();
    const updatedBorrowings = borrowings.map(b => {
      const dueDate = new Date(b.dueDate);
      if (b.status === "borrowed" && now > dueDate) {
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / 86400000);
        const penaltyPerDay = 100; // ₦100 per day
        return {
          ...b,
          isOverdue: true,
          daysOverdue,
          penalty: daysOverdue * penaltyPerDay,
        };
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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { id, action } = body;

    if (action === "return") {
      const borrowing = await prisma.libraryBorrowing.findUnique({ where: { id } });
      if (!borrowing) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const now = new Date();
      const dueDate = new Date(borrowing.dueDate);
      const daysOverdue = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / 86400000));
      const penalty = daysOverdue * 100; // ₦100 per day

      await prisma.libraryBorrowing.update({
        where: { id },
        data: { status: "returned", returnDate: now, penalty },
      });

      // Update available copies
      await prisma.libraryBook.update({
        where: { id: borrowing.bookId },
        data: { available: { increment: 1 } },
      });

      return NextResponse.json({ success: true, penalty, daysOverdue });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
