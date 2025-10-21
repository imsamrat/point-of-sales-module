import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { db } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/purchases/[id]/payments - Get all payments for a purchase
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await db.purchasePayment.findMany({
      where: { purchaseId: params.id },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/purchases/[id]/payments - Add new payment to purchase
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can add payments
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { amount, paymentDate, paymentMethod, reference, notes } =
      await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid payment amount is required" },
        { status: 400 }
      );
    }

    // Check if purchase exists and get current payment status
    const purchase = await db.purchase.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    const totalPaid = purchase.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const newTotalPaid = totalPaid + parseFloat(amount);

    if (newTotalPaid > purchase.totalAmount) {
      return NextResponse.json(
        { error: "Payment amount exceeds remaining balance" },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await db.purchasePayment.create({
      data: {
        purchaseId: params.id,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod: paymentMethod || "cash",
        reference,
        notes,
      },
    });

    // Update purchase status
    const newPendingAmount = Math.max(0, purchase.totalAmount - newTotalPaid);
    const newStatus = newPendingAmount === 0 ? "paid" : "partial";

    await db.purchase.update({
      where: { id: params.id },
      data: {
        paidAmount: newTotalPaid,
        pendingAmount: newPendingAmount,
        status: newStatus,
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment added successfully",
    });
  } catch (error) {
    console.error("Error adding payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
