import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../lib/auth";
import { db } from "../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, stock, categoryId, barcode, image } =
      await request.json();

    if (!name || !price || stock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate product by name
    const existingProductByName = await db.product.findFirst({
      where: { name: name.trim() },
    });

    if (existingProductByName) {
      return NextResponse.json(
        {
          error: "Duplicate product",
          message:
            "A product with this name already exists. Please choose a different name.",
        },
        { status: 400 }
      );
    }

    // Check for duplicate product by barcode if provided
    if (barcode && barcode.trim()) {
      const existingProductByBarcode = await db.product.findFirst({
        where: { barcode: barcode.trim() },
      });

      if (existingProductByBarcode) {
        return NextResponse.json(
          {
            error: "Duplicate barcode",
            message:
              "A product with this barcode already exists. Please use a different barcode.",
          },
          { status: 400 }
        );
      }
    }

    const product = await db.product.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: categoryId || null,
        barcode: barcode?.trim(),
        image,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
