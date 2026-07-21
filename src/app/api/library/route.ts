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

    const totalBooks = books.reduce((sum, b) => sum + b.copies, 0);
    const availableBooks = books.reduce((sum, b) => sum + b.available, 0);

    return NextResponse.json({
      books,
      borrowings,
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
    const { id, title, author, isbn, category, copies, available, location } = body;

    if (!id) return NextResponse.json({ error: "Missing book ID" }, { status: 400 });

    const book = await prisma.libraryBook.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(isbn !== undefined && { isbn }),
        ...(category && { category }),
        ...(copies !== undefined && { copies: parseInt(copies) }),
        ...(available !== undefined && { available: parseInt(available) }),
        ...(location !== undefined && { location }),
      },
    });

    return NextResponse.json({ success: true, book });
  } catch (error) {
    console.error("PUT /api/library error:", error);
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}
