import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET /api/dues - List all dues
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    const where: any = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const dues = await db.due.findMany({
      where,
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
        _count: {
          select: {
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(dues);
  } catch (error) {
    console.error("Error fetching dues:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/dues - Create a new due
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { saleId, totalAmount, notes } = body;

    if (!saleId || !totalAmount) {
      return NextResponse.json(
        { error: "Sale ID and total amount are required" },
        { status: 400 }
      );
    }

    // Check if sale exists and doesn't already have a due
    const existingSale = await db.sale.findUnique({
      where: { id: saleId },
      include: { due: true, customer: true },
    });

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    if (existingSale.due) {
      return NextResponse.json(
        { error: "A due already exists for this sale" },
        { status: 400 }
      );
    }

    const amount = parseFloat(totalAmount);
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 }
      );
    }

    const due = await db.due.create({
      data: {
        saleId,
        customerId: existingSale.customerId,
        totalAmount: amount,
        pendingAmount: amount,
        notes: notes || null,
      },
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
        payments: true,
      },
    });

    return NextResponse.json(due, { status: 201 });
  } catch (error) {
    console.error("Error creating due:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
