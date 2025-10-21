import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/purchases/[id] - Get purchase details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const purchase = await db.purchase.findUnique({
      where: { id: params.id },
      include: {
        supplier: true,
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/purchases/[id] - Update purchase
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update purchases
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { supplierId, purchaseDate, totalAmount, invoiceNumber, notes } =
      await request.json();

    if (!supplierId || !totalAmount) {
      return NextResponse.json(
        { error: "Supplier and total amount are required" },
        { status: 400 }
      );
    }

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Get current purchase to calculate new pending amount
    const currentPurchase = await db.purchase.findUnique({
      where: { id: params.id },
      include: { payments: true },
    });

    if (!currentPurchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    const totalPaid = currentPurchase.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const newPendingAmount = Math.max(0, parseFloat(totalAmount) - totalPaid);

    const purchase = await db.purchase.update({
      where: { id: params.id },
      data: {
        supplierId,
        purchaseDate: purchaseDate
          ? new Date(purchaseDate)
          : currentPurchase.purchaseDate,
        totalAmount: parseFloat(totalAmount),
        pendingAmount: newPendingAmount,
        status:
          newPendingAmount === 0
            ? "paid"
            : newPendingAmount < parseFloat(totalAmount)
            ? "partial"
            : "pending",
        invoiceNumber,
        notes,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      purchase,
      message: "Purchase updated successfully",
    });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/purchases/[id] - Delete purchase
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete purchases
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const purchase = await db.purchase.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        supplier: {
          select: { name: true },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    await db.purchase.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `Purchase from ${purchase.supplier.name} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
