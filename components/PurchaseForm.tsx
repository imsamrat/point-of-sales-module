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
import { X, Save, Loader2, Truck, CreditCard } from "lucide-react";
import { PaymentManagement } from "./PaymentManagement";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface Purchase {
  id: string;
  supplierId: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  invoiceNumber: string | null;
  notes: string | null;
  supplier: Supplier;
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

interface PurchaseFormProps {
  purchase?: Purchase;
  onClose: () => void;
  onSuccess: () => void;
}

export function PurchaseForm({
  purchase,
  onClose,
  onSuccess,
}: PurchaseFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseDate: "",
    totalAmount: "",
    invoiceNumber: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentManagement, setShowPaymentManagement] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
    if (purchase) {
      setFormData({
        supplierId: purchase.supplierId,
        purchaseDate: new Date(purchase.purchaseDate)
          .toISOString()
          .split("T")[0],
        totalAmount: purchase.totalAmount.toString(),
        invoiceNumber: purchase.invoiceNumber || "",
        notes: purchase.notes || "",
      });
    } else {
      // Set default date to today
      setFormData((prev) => ({
        ...prev,
        purchaseDate: new Date().toISOString().split("T")[0],
      }));
    }
  }, [purchase]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.supplierId ||
      !formData.totalAmount ||
      !formData.purchaseDate
    ) {
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
      const url = purchase ? `/api/purchases/${purchase.id}` : "/api/purchases";
      const method = purchase ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierId: formData.supplierId,
          purchaseDate: formData.purchaseDate,
          totalAmount: amount,
          invoiceNumber: formData.invoiceNumber || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description:
            data.message ||
            `Purchase ${purchase ? "updated" : "created"} successfully`,
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
            `Failed to ${purchase ? "update" : "create"} purchase`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: `An unexpected error occurred while ${
          purchase ? "updating" : "creating"
        } the purchase`,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6" />
              {purchase ? "Edit Purchase" : "Add New Purchase"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="supplierId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Supplier *
                </label>
                <select
                  id="supplierId"
                  value={formData.supplierId}
                  onChange={(e) =>
                    handleInputChange("supplierId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="purchaseDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Purchase Date *
                </label>
                <input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    handleInputChange("purchaseDate", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="totalAmount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Total Amount (৳) *
                </label>
                <input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    handleInputChange("totalAmount", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="invoiceNumber"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Invoice Number
                </label>
                <input
                  id="invoiceNumber"
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    handleInputChange("invoiceNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter invoice number"
                />
              </div>
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
                placeholder="Enter any additional notes"
              />
            </div>

            {purchase && (
              <div className="flex justify-center pt-4">
                <Button
                  type="button"
                  onClick={() => setShowPaymentManagement(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Payments
                </Button>
              </div>
            )}

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
                    {purchase ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {purchase ? "Update Purchase" : "Create Purchase"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showPaymentManagement && purchase && (
        <PaymentManagement
          purchase={purchase}
          onClose={() => setShowPaymentManagement(false)}
          onSuccess={() => {
            setShowPaymentManagement(false);
            onSuccess(); // Refresh the parent component
          }}
        />
      )}
    </div>
  );
}
