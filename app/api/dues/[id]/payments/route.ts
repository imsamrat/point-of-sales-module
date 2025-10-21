import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

// POST /api/dues/[id]/payments - Add a payment to a due
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { amount, paymentDate, paymentMethod, reference, notes } = body;

    if (!amount || !paymentDate) {
      return NextResponse.json(
        { error: "Amount and payment date are required" },
        { status: 400 }
      );
    }

    const existingDue = await db.due.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!existingDue) {
      return NextResponse.json({ error: "Due not found" }, { status: 404 });
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (paymentAmount > existingDue.pendingAmount) {
      return NextResponse.json(
        {
          error: `Payment amount cannot exceed pending balance of ৳${existingDue.pendingAmount.toFixed(
            2
          )}`,
        },
        { status: 400 }
      );
    }

    // Create the payment
    const payment = await db.duePayment.create({
      data: {
        dueId: params.id,
        amount: paymentAmount,
        paymentDate: new Date(paymentDate),
        paymentMethod: paymentMethod || "cash",
        reference: reference || null,
        notes: notes || null,
      },
    });

    // Update the due's paid and pending amounts
    const newPaidAmount = existingDue.paidAmount + paymentAmount;
    const newPendingAmount = existingDue.pendingAmount - paymentAmount;

    // Determine new status
    let newStatus = "pending";
    if (newPendingAmount === 0) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partial";
    }

    // Update the due
    const updatedDue = await db.due.update({
      where: { id: params.id },
      data: {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
        status: newStatus,
      },
      include: {
        customer: true,
        sale: {
          include: {
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

    return NextResponse.json(
      {
        payment,
        due: updatedDue,
        message: "Payment added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
