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
import { PurchaseForm } from "../../components/PurchaseForm";
import { PaymentManagement } from "../../components/PaymentManagement";
import {
  Plus,
  Edit,
  Trash2,
  Receipt,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Truck,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

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
  supplier: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
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
  _count: {
    payments: number;
  };
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<
    Purchase | undefined
  >();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    purchaseId: string | null;
    purchaseInfo: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    purchaseId: null,
    purchaseInfo: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/purchases");
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      } else if (response.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to view purchases.",
        });
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load purchases.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPurchase = () => {
    setEditingPurchase(undefined);
    setShowForm(true);
  };

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setShowForm(true);
  };

  const handleDeletePurchase = (purchaseId: string, purchaseInfo: string) => {
    setDeleteDialog({
      isOpen: true,
      purchaseId,
      purchaseInfo,
      isDeleting: false,
    });
  };

  const handleViewPayments = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowPaymentModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.purchaseId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(
        `/api/purchases/${deleteDialog.purchaseId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchPurchases();
        toast({
          title: "Success",
          description: data.message || "Purchase deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          purchaseId: null,
          purchaseInfo: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description:
            data.message || data.error || "Failed to delete purchase",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the purchase",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      purchaseId: null,
      purchaseInfo: "",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchPurchases();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPurchase(undefined);
  };

  const handlePaymentSuccess = () => {
    fetchPurchases();
    if (selectedPurchase) {
      // Refresh the selected purchase data
      fetchPurchaseDetails(selectedPurchase.id);
    }
  };

  const fetchPurchaseDetails = async (purchaseId: string) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`);
      if (response.ok) {
        const purchase = await response.json();
        setSelectedPurchase(purchase);
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "partial":
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "partial":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    }
  };

  const totalPurchases = purchases.length;
  const totalAmount = purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );
  const totalPaid = purchases.reduce(
    (sum, purchase) => sum + purchase.paidAmount,
    0
  );
  const totalPending = purchases.reduce(
    (sum, purchase) => sum + purchase.pendingAmount,
    0
  );

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto p-4 sm:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Purchase Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track purchases and manage supplier payments
            </p>
          </div>
          <Button onClick={handleAddPurchase}>
            <Plus className="h-4 w-4 mr-2" />
            Add Purchase
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchases
              </CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Amount
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalAmount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payment
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalPending)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchases</CardTitle>
            <CardDescription>
              Manage purchase records and track payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {purchase.supplier.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {purchase.supplier.name}
                            </div>
                            {purchase.supplier.email && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {purchase.supplier.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {purchase.invoiceNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div>
                          <div className="font-medium">
                            {formatCurrency(purchase.totalAmount)}
                          </div>
                          <div className="text-xs">
                            Paid: {formatCurrency(purchase.paidAmount)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            purchase.status
                          )}`}
                        >
                          {getStatusIcon(purchase.status)}
                          <span className="ml-1 capitalize">
                            {purchase.status}
                          </span>
                        </span>
                        {purchase.pendingAmount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Pending: {formatCurrency(purchase.pendingAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewPayments(purchase)}
                            size="sm"
                            variant="outline"
                            title="View Payments"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditPurchase(purchase)}
                            size="sm"
                            variant="outline"
                            title="Edit Purchase"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeletePurchase(
                                purchase.id,
                                `${purchase.supplier.name} - ${formatCurrency(
                                  purchase.totalAmount
                                )}`
                              )
                            }
                            size="sm"
                            variant="destructive"
                            title="Delete Purchase"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <PurchaseForm
            purchase={editingPurchase}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        {showPaymentModal && selectedPurchase && (
          <PaymentManagement
            purchase={selectedPurchase}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title={`Delete Purchase`}
          description={`Are you sure you want to delete this purchase from ${deleteDialog.purchaseInfo}? This action cannot be undone.`}
          isLoading={deleteDialog.isDeleting}
        />
      </div>
    </ResponsiveLayout>
  );
}
