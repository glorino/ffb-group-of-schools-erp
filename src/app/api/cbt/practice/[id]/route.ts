import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-rbac";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER",
      "ADMINISTRATOR",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
      "TEACHER",
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;
    const body = await request.json();
    const { question, options, answer, topic, difficulty } = body;

    if (!question || !options || !answer) {
      return NextResponse.json(
        { error: "question, options, and answer are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.cBTQuestion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const updated = await prisma.cBTQuestion.update({
      where: { id },
      data: {
        question,
        options,
        answer,
        ...(topic && { topic }),
        ...(difficulty && { difficulty }),
      },
    });

    return NextResponse.json({ question: updated });
  } catch (error: any) {
    console.error("PUT /api/cbt/practice/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth([
      "OWNER",
      "ADMINISTRATOR",
      "PRINCIPAL",
      "VICE_PRINCIPAL",
      "TEACHER",
    ]);
    if (authResult.error) return authResult.error;

    const { id } = await params;

    const existing = await prisma.cBTQuestion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    await prisma.cBTQuestion.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/cbt/practice/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}
