import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/dues/[id] - Get a specific due
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const due = await db.due.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        sale: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    if (!due) {
      return NextResponse.json({ error: "Due not found" }, { status: 404 });
    }

    return NextResponse.json(due);
  } catch (error) {
    console.error("Error fetching due:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/dues/[id] - Update a due
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { totalAmount, notes } = body;

    const existingDue = await db.due.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!existingDue) {
      return NextResponse.json({ error: "Due not found" }, { status: 404 });
    }

    let updateData: any = {
      notes: notes || null,
    };

    if (totalAmount !== undefined) {
      const newTotal = parseFloat(totalAmount);
      if (newTotal <= 0) {
        return NextResponse.json(
          { error: "Total amount must be greater than 0" },
          { status: 400 }
        );
      }

      // Recalculate paid and pending amounts
      const totalPaid = existingDue.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

      updateData.totalAmount = newTotal;
      updateData.pendingAmount = Math.max(0, newTotal - totalPaid);

      // Update status based on new amounts
      if (updateData.pendingAmount === 0) {
        updateData.status = "paid";
      } else if (totalPaid > 0) {
        updateData.status = "partial";
      } else {
        updateData.status = "pending";
      }
    }

    const due = await db.due.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        sale: {
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        payments: {
          orderBy: {
            paymentDate: "desc",
          },
        },
      },
    });

    return NextResponse.json(due);
  } catch (error) {
    console.error("Error updating due:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/dues/[id] - Delete a due
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existingDue = await db.due.findUnique({
      where: { id: params.id },
    });

    if (!existingDue) {
      return NextResponse.json({ error: "Due not found" }, { status: 404 });
    }

    await db.due.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Due deleted successfully" });
  } catch (error) {
    console.error("Error deleting due:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
