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
import {
  X,
  Plus,
  Save,
  Loader2,
  DollarSign,
  Calendar,
  CreditCard,
  Receipt,
  User,
} from "lucide-react";

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
  sale: {
    id: string;
    total: number;
    discount: number;
    createdAt: string;
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
  };
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

interface DuePaymentManagementProps {
  due: Due;
  onClose: () => void;
  onSuccess: () => void;
}

export function DuePaymentManagement({
  due,
  onClose,
  onSuccess,
}: DuePaymentManagementProps) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentDate: "",
    paymentMethod: "cash",
    reference: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set default payment date to today
    setPaymentForm((prev) => ({
      ...prev,
      paymentDate: new Date().toISOString().split("T")[0],
    }));
  }, []);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentForm.amount || !paymentForm.paymentDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in amount and payment date",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Payment amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > due.pendingAmount) {
      toast({
        title: "Validation Error",
        description: `Payment amount cannot exceed pending balance of ৳${due.pendingAmount.toFixed(
          2
        )}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/dues/${due.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          paymentDate: paymentForm.paymentDate,
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference || null,
          notes: paymentForm.notes || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment added successfully",
          variant: "success",
        });
        onSuccess();
        setShowAddPayment(false);
        setPaymentForm({
          amount: "",
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod: "cash",
          reference: "",
          notes: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to add payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <DollarSign className="h-4 w-4" />;
      case "bank_transfer":
        return <CreditCard className="h-4 w-4" />;
      case "check":
        return <Receipt className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "text-green-600 bg-green-100";
      case "bank_transfer":
        return "text-blue-600 bg-blue-100";
      case "check":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                Customer Payment Management
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track payments from {due.customer?.name || "Unknown Customer"} -
                Sale #{due.saleId.slice(-8)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Customer Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {due.customer?.name || "Unknown Customer"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {due.customer?.phone || "No phone"}
                  </p>
                  {due.customer?.address && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {due.customer.address}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Due Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Due Amount
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(due.totalAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Paid
                </div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(due.paidAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Amount
                </div>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(due.pendingAmount)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Status
                </div>
                <div
                  className={`text-lg font-bold capitalize ${
                    due.status === "paid"
                      ? "text-green-600"
                      : due.status === "partial"
                      ? "text-orange-600"
                      : "text-red-600"
                  }`}
                >
                  {due.status}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Payment Button */}
          {due.pendingAmount > 0 && (
            <div className="mb-6">
              <Button
                onClick={() => setShowAddPayment(!showAddPayment)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          )}

          {/* Add Payment Form */}
          {showAddPayment && due.pendingAmount > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Record New Payment</CardTitle>
                <CardDescription>
                  Record a payment received from the customer. Maximum amount:{" "}
                  {formatCurrency(due.pendingAmount)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Payment Amount (৳) *
                      </label>
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        max={due.pendingAmount}
                        value={paymentForm.amount}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="paymentDate"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Payment Date *
                      </label>
                      <input
                        id="paymentDate"
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            paymentDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="paymentMethod"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        value={paymentForm.paymentMethod}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            paymentMethod: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                        <option value="card">Card</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="reference"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Reference (Optional)
                      </label>
                      <input
                        id="reference"
                        type="text"
                        value={paymentForm.reference}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            reference: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Check number, transaction ID, etc."
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={paymentForm.notes}
                      onChange={(e) =>
                        setPaymentForm((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Additional payment notes"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowAddPayment(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Recording Payment...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Record Payment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>
                All payments received from this customer for this due
              </CardDescription>
            </CardHeader>
            <CardContent>
              {due.payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No payments recorded yet
                </div>
              ) : (
                <div className="space-y-4">
                  {due.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${getPaymentMethodColor(
                            payment.paymentMethod
                          )}`}
                        >
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.paymentDate).toLocaleDateString()}
                            <span className="capitalize">
                              • {payment.paymentMethod.replace("_", " ")}
                            </span>
                            {payment.reference && (
                              <span>• Ref: {payment.reference}</span>
                            )}
                          </div>
                          {payment.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {payment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Recorded: {new Date(payment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
