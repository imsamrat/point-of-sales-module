"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { ProductForm } from "../../components/ProductForm";
import { Edit, Trash2, Plus, Package } from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId?: string;
  category?: { id: string; name: string };
  barcode?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    productId: string | null;
    productName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    productId: null,
    productName: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/inventory");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteDialog({
      isOpen: true,
      productId,
      productName,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.productId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/inventory/${deleteDialog.productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchProducts();
        toast({
          title: "Success",
          description: data.message || "Product deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          productId: null,
          productName: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to delete product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      productId: null,
      productName: "",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const getImageSrc = (image: string | undefined) => {
    if (!image) return null;

    // If it's already a data URL, return as is
    if (image.startsWith("data:")) {
      return image;
    }

    // If it's base64 without prefix, add default prefix
    if (
      image.length > 100 &&
      /^[A-Za-z0-9+/=]+$/.test(image.replace(/data:image\/[^;]+;base64,/, ""))
    ) {
      return `data:image/jpeg;base64,${image}`;
    }

    return null;
  };

  const lowStockProducts = products.filter((product) => product.stock < 10);

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  ).sort();

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category?.name === selectedCategory)
    : products;

  // Filter low stock products by selected category
  const filteredLowStockProducts = selectedCategory
    ? lowStockProducts.filter(
        (product) => product.category?.name === selectedCategory
      )
    : lowStockProducts;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <div className="flex gap-3">
          <Button
            onClick={() => (window.location.href = "/categories")}
            variant="outline"
          >
            <Package className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {filteredLowStockProducts.length > 0 && (
        <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Low Stock Alert ({filteredLowStockProducts.length} items)
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              Products with stock below 10 units require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700"
                >
                  <div className="flex items-center gap-3">
                    {getImageSrc(product.image) ? (
                      <img
                        src={getImageSrc(product.image)!}
                        alt={product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product.category?.name || "No category"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        product.stock === 0
                          ? "text-red-600 dark:text-red-400"
                          : product.stock < 5
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {product.stock}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter by Category</CardTitle>
          <CardDescription>
            Select a category to filter products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category!)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your inventory items
            {selectedCategory && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                • Showing {filteredProducts.length} {selectedCategory} products
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {getImageSrc(product.image) ? (
                        <img
                          src={getImageSrc(product.image)!}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            No Image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {product.category?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <Button
                        onClick={() => handleEditProduct(product)}
                        size="sm"
                        variant="outline"
                        className="mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() =>
                          handleDeleteProduct(product.id, product.name)
                        }
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteDialog.productName}`}
        description={`Are you sure you want to delete "${deleteDialog.productName}"? This action cannot be undone and may affect existing sales records.`}
        isLoading={deleteDialog.isDeleting}
      />
    </div>
  );
}
