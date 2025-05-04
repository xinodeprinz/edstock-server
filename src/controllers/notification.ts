import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // App password from Google account
  },
});

/**
 * Sends email notifications to all SUPER_ADMIN users about products with low stock
 * @param threshold Stock quantity threshold, defaults to 10
 */
export const notifyLowStock = async (threshold: number = 10): Promise<void> => {
  try {
    // Get all products with stock below threshold
    const lowStockProducts = await prisma.products.findMany({
      where: {
        stockQuantity: {
          lt: threshold,
        },
      },
      include: {
        category: true,
      },
    });

    // If no products have low stock, exit the function
    if (lowStockProducts.length === 0) {
      console.log("No products with low stock found");
      return;
    }

    // Get all super admin users
    const superAdmins = await prisma.users.findMany({
      where: {
        role: "SUPER_ADMIN",
      },
    });

    // If no super admins found, log an error and exit
    if (superAdmins.length === 0) {
      console.error("No super admin users found to notify");
      return;
    }

    // Prepare email content
    const emailSubject = "ALERT: Low Stock Products Report";

    // Create HTML table of low stock products
    let emailContent = `
      <h2>Low Stock Alert</h2>
      <p>The following products are running low on stock (below ${threshold} units):</p>
      <table border="1" cellpadding="5" style="border-collapse: collapse;">
        <tr style="background-color: #f2f2f2;">
          <th>Product ID</th>
          <th>Name</th>
          <th>Category</th>
          <th>Current Stock</th>
          <th>SKU</th>
          <th>Supplier</th>
        </tr>
    `;

    lowStockProducts.forEach((product) => {
      emailContent += `
        <tr>
          <td>${product.productId}</td>
          <td>${product.name}</td>
          <td>${product.category.name}</td>
          <td style="color: ${
            product.stockQuantity <= 5 ? "red" : "orange"
          }; font-weight: bold;">
            ${product.stockQuantity}
          </td>
          <td>${product.sku || "N/A"}</td>
          <td>${product.supplier || "N/A"}</td>
        </tr>
      `;
    });

    emailContent += `
      </table>
      <p>Please take appropriate action to restock these items.</p>
      <p>This is an automated notification from your inventory management system.</p>
    `;

    // Send email to each super admin
    for (const admin of superAdmins) {
      await transporter.sendMail({
        from: `"Edstock - Inventory System" <${process.env.EMAIL_USER}>`,
        to: admin.email,
        subject: emailSubject,
        html: emailContent,
      });

      console.log(
        `Low stock notification sent to ${admin.name} (${admin.email})`
      );
    }

    console.log(
      `Successfully sent low stock notifications for ${lowStockProducts.length} products`
    );
  } catch (error) {
    console.error("Error sending low stock notifications:", error);
    throw error;
  }
};
