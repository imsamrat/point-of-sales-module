"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { useToast } from "./ui/use-toast";
import { X, Save, Loader2, Receipt, User, DollarSign } from "lucide-react";

interface Sale {
  id: string;
  total: number;
  discount: number;
  createdAt: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
    address: string | null;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      sellingPrice: number;
    };
  }>;
  user: {
    name: string;
    email: string;
  };
}

interface Due {
  id: string;
  saleId: string;
  customerId: string | null;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
    address: string | null;
  } | null;
  sale: Sale;
  payments: Array<{
    id: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string | null;
    notes: string | null;
    createdAt: string;
  }>;
}

interface DueFormProps {
  due?: Due;
  onClose: () => void;
  onSuccess: () => void;
}

export function DueForm({ due, onClose, onSuccess }: DueFormProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [formData, setFormData] = useState({
    saleId: "",
    totalAmount: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
    if (due) {
      setFormData({
        saleId: due.saleId,
        totalAmount: due.totalAmount.toString(),
        notes: due.notes || "",
      });
    }
  }, [due]);

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales");
      if (response.ok) {
        const data = await response.json();
        // Filter out sales that already have dues
        const response2 = await fetch("/api/dues");
        if (response2.ok) {
          const dues = await response2.json();
          const dueSaleIds = new Set(dues.map((d: Due) => d.saleId));
          const availableSales = data.filter(
            (sale: Sale) => !dueSaleIds.has(sale.id)
          );
          setSales(availableSales);
        } else {
          setSales(data);
        }
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.saleId || !formData.totalAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.totalAmount);
    if (amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Total amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const url = due ? `/api/dues/${due.id}` : "/api/dues";
      const method = due ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          saleId: formData.saleId,
          totalAmount: amount,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description:
            data.message || `Due ${due ? "updated" : "created"} successfully`,
          variant: "success",
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description:
            data.message ||
            data.error ||
            `Failed to ${due ? "update" : "create"} due`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred while ${
          due ? "updating" : "creating"
        } the due`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaleChange = (saleId: string) => {
    const selectedSale = sales.find((sale) => sale.id === saleId);
    if (selectedSale) {
      setFormData((prev) => ({
        ...prev,
        saleId,
        totalAmount: (selectedSale.total - selectedSale.discount).toString(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        saleId,
      }));
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              {due ? "Edit Customer Due" : "Add Customer Due"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="saleId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Sale *
                </label>
                <select
                  id="saleId"
                  value={formData.saleId}
                  onChange={(e) => handleSaleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={!!due} // Can't change sale for existing due
                >
                  <option value="">
                    {due ? "Current Sale" : "Select a sale"}
                  </option>
                  {sales.map((sale) => (
                    <option key={sale.id} value={sale.id}>
                      {sale.customer?.name || "Unknown Customer"} -{" "}
                      {formatCurrency(sale.total - sale.discount)} (
                      {new Date(sale.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {formData.saleId && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    {(() => {
                      const selectedSale =
                        sales.find((s) => s.id === formData.saleId) ||
                        due?.sale;
                      if (selectedSale) {
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {selectedSale.customer?.name ||
                                  "Unknown Customer"}
                              </span>
                              <span className="text-gray-500">
                                ({selectedSale.customer?.phone || "No phone"})
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Sale Total: {formatCurrency(selectedSale.total)}
                              {selectedSale.discount > 0 && (
                                <span>
                                  {" "}
                                  - Discount:{" "}
                                  {formatCurrency(selectedSale.discount)}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Items: {selectedSale.items.length} product(s)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="totalAmount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Due Amount (৳) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalAmount}
                    onChange={(e) =>
                      handleInputChange("totalAmount", e.target.value)
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Amount the customer still owes
                </p>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter any additional notes about this due"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {due ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {due ? "Update Due" : "Create Due"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
