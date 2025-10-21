import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/suppliers - Get all suppliers
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suppliers = await db.supplier.findMany({
      include: {
        purchases: {
          select: {
            totalAmount: true,
            paidAmount: true,
            pendingAmount: true,
            status: true,
          },
        },
        _count: {
          select: {
            purchases: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate summary for each supplier
    const suppliersWithSummary = suppliers.map((supplier) => {
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

      return {
        ...supplier,
        summary: {
          totalPurchases,
          totalAmount,
          totalPaid,
          totalPending,
        },
      };
    });

    return NextResponse.json(suppliersWithSummary);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create suppliers
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

    const supplier = await db.supplier.create({
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
      message: "Supplier created successfully",
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
