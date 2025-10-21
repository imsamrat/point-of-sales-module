import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/suppliers/[id] - Get supplier details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supplier = await db.supplier.findUnique({
      where: { id: params.id },
      include: {
        purchases: {
          include: {
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
          orderBy: { purchaseDate: "desc" },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Calculate summary
    const totalPurchases = supplier.purchases.length;
    const totalAmount = supplier.purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );
    const totalPaid = supplier.purchases.reduce(
      (sum, purchase) => sum + purchase.paidAmount,
      0
    );
    const totalPending = supplier.purchases.reduce(
      (sum, purchase) => sum + purchase.pendingAmount,
      0
    );

    return NextResponse.json({
      ...supplier,
      summary: {
        totalPurchases,
        totalAmount,
        totalPaid,
        totalPending,
      },
    });
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/suppliers/[id] - Update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update suppliers
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, phone, address, contactPerson } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Supplier name is required" },
        { status: 400 }
      );
    }

    const supplier = await db.supplier.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        address,
        contactPerson,
      },
    });

    return NextResponse.json({
      success: true,
      supplier,
      message: "Supplier updated successfully",
    });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/suppliers/[id] - Delete supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete suppliers
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if supplier has associated purchases
    const supplier = await db.supplier.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            purchases: true,
          },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    if (supplier._count.purchases > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete supplier with associated purchases. Please delete the purchases first.",
        },
        { status: 400 }
      );
    }

    await db.supplier.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `Supplier ${supplier.name} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
