import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pos.com" },
    update: {},
    create: {
      email: "admin@pos.com",
      name: "Admin User",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create regular user
  const userPassword = await hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@pos.com" },
    update: {},
    create: {
      email: "user@pos.com",
      name: "Regular User",
      password: userPassword,
      role: "user",
    },
  });

  // Create sample categories
  const electronicsCategory = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: {
      name: "Electronics",
      description: "Electronic devices and accessories",
    },
  });

  const foodCategory = await prisma.category.upsert({
    where: { name: "Food" },
    update: {},
    create: {
      name: "Food",
      description: "Food and beverages",
    },
  });

  // Create sample products
  const products = [
    {
      name: "Laptop",
      description: "High-performance laptop",
      purchasePrice: 800.0,
      sellingPrice: 999.99,
      stock: 10,
      categoryId: electronicsCategory.id,
      barcode: "1234567890123",
    },
    {
      name: "Mouse",
      description: "Wireless mouse",
      purchasePrice: 20.0,
      sellingPrice: 29.99,
      stock: 50,
      categoryId: electronicsCategory.id,
      barcode: "1234567890124",
    },
    {
      name: "Keyboard",
      description: "Mechanical keyboard",
      purchasePrice: 50.0,
      sellingPrice: 79.99,
      stock: 25,
      categoryId: electronicsCategory.id,
      barcode: "1234567890125",
    },
    {
      name: "Monitor",
      description: "27-inch 4K monitor",
      purchasePrice: 300.0,
      sellingPrice: 399.99,
      stock: 15,
      categoryId: electronicsCategory.id,
      barcode: "1234567890126",
    },
    {
      name: "Coffee",
      description: "Premium coffee beans",
      purchasePrice: 15.0,
      sellingPrice: 19.99,
      stock: 100,
      categoryId: foodCategory.id,
      barcode: "1234567890127",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { barcode: product.barcode },
      update: {},
      create: product,
    });
  }

  // Create sample employees
  const employees = [
    {
      name: "John Doe",
      email: "john@pos.com",
      position: "Sales Associate",
      salary: 35000,
    },
    {
      name: "Jane Smith",
      email: "jane@pos.com",
      position: "Manager",
      salary: 55000,
    },
  ];

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { email: employee.email },
      update: {},
      create: employee,
    });
  }

  console.log("Database seeded successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
