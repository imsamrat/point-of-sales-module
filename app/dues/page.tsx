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
import { DueForm } from "../../components/DueForm";
import { DuePaymentManagement } from "../../components/DuePaymentManagement";
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
  User,
  Phone,
  Mail,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

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

export default function DuesPage() {
  const [dues, setDues] = useState<Due[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDue, setEditingDue] = useState<Due | undefined>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDue, setSelectedDue] = useState<Due | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    dueId: string | null;
    dueInfo: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    dueId: null,
    dueInfo: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      const response = await fetch("/api/dues");
      if (response.ok) {
        const data = await response.json();
        setDues(data);
      } else if (response.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to view dues.",
        });
      }
    } catch (error) {
      console.error("Error fetching dues:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load dues.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDue = () => {
    setEditingDue(undefined);
    setShowForm(true);
  };

  const handleEditDue = (due: Due) => {
    setEditingDue(due);
    setShowForm(true);
  };

  const handleDeleteDue = (dueId: string, dueInfo: string) => {
    setDeleteDialog({
      isOpen: true,
      dueId,
      dueInfo,
      isDeleting: false,
    });
  };

  const handleViewPayments = (due: Due) => {
    setSelectedDue(due);
    setShowPaymentModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.dueId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(`/api/dues/${deleteDialog.dueId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        fetchDues();
        toast({
          title: "Success",
          description: data.message || "Due deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          dueId: null,
          dueInfo: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || data.error || "Failed to delete due",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting due:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the due",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      dueId: null,
      dueInfo: "",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchDues();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDue(undefined);
  };

  const handlePaymentSuccess = () => {
    fetchDues();
    if (selectedDue) {
      // Refresh the selected due data
      fetchDueDetails(selectedDue.id);
    }
  };

  const fetchDueDetails = async (dueId: string) => {
    try {
      const response = await fetch(`/api/dues/${dueId}`);
      if (response.ok) {
        const due = await response.json();
        setSelectedDue(due);
      }
    } catch (error) {
      console.error("Error fetching due details:", error);
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

  const totalDues = dues.length;
  const totalAmount = dues.reduce((sum, due) => sum + due.totalAmount, 0);
  const totalPaid = dues.reduce((sum, due) => sum + due.paidAmount, 0);
  const totalPending = dues.reduce((sum, due) => sum + due.pendingAmount, 0);

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
            <h1 className="text-3xl font-bold">Customer Dues Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track customer payments and outstanding balances
            </p>
          </div>
          <Button onClick={handleAddDue}>
            <Plus className="h-4 w-4 mr-2" />
            Add Due
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dues</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDues}</div>
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
                Pending Amount
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
            <CardTitle>Customer Dues</CardTitle>
            <CardDescription>
              Manage customer outstanding balances and payment tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sale Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {dues.map((due) => (
                    <tr key={due.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {due.customer?.name?.charAt(0)?.toUpperCase() ||
                                  "U"}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {due.customer?.name || "Unknown Customer"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {due.customer?.phone || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(due.sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div>
                          <div className="font-medium">
                            {formatCurrency(due.totalAmount)}
                          </div>
                          <div className="text-xs">
                            Paid: {formatCurrency(due.paidAmount)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            due.status
                          )}`}
                        >
                          {getStatusIcon(due.status)}
                          <span className="ml-1 capitalize">{due.status}</span>
                        </span>
                        {due.pendingAmount > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Pending: {formatCurrency(due.pendingAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleViewPayments(due)}
                            size="sm"
                            variant="outline"
                            title="View Payments"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditDue(due)}
                            size="sm"
                            variant="outline"
                            title="Edit Due"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteDue(
                                due.id,
                                `${
                                  due.customer?.name || "Unknown"
                                } - ${formatCurrency(due.totalAmount)}`
                              )
                            }
                            size="sm"
                            variant="destructive"
                            title="Delete Due"
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
          <DueForm
            due={editingDue}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        {showPaymentModal && selectedDue && (
          <DuePaymentManagement
            due={selectedDue}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title="Delete Due"
          description={`Are you sure you want to delete this due from ${deleteDialog.dueInfo}? This action cannot be undone.`}
          isLoading={deleteDialog.isDeleting}
        />
      </div>
    </ResponsiveLayout>
  );
}
