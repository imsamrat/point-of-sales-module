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
import { SupplierForm } from "../../components/SupplierForm";
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Package,
  Clock,
} from "lucide-react";
import { useToast } from "../../components/ui/use-toast";
import { DeleteConfirmationDialog } from "../../components/DeleteConfirmationDialog";
import { ResponsiveLayout } from "../../components/layout/ResponsiveLayout";

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contactPerson: string | null;
  createdAt: string;
  summary: {
    totalPurchases: number;
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
  };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<
    Supplier | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    supplierId: string | null;
    supplierName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    supplierId: null,
    supplierName: "",
    isDeleting: false,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else if (response.status === 403) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to view suppliers.",
        });
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load suppliers.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSupplier = () => {
    setEditingSupplier(undefined);
    setShowForm(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDeleteSupplier = (supplierId: string, supplierName: string) => {
    setDeleteDialog({
      isOpen: true,
      supplierId,
      supplierName,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.supplierId) return;

    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));

    try {
      const response = await fetch(
        `/api/suppliers/${deleteDialog.supplierId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchSuppliers();
        toast({
          title: "Success",
          description: data.message || "Supplier deleted successfully",
          variant: "success",
        });
        setDeleteDialog({
          isOpen: false,
          supplierId: null,
          supplierName: "",
          isDeleting: false,
        });
      } else {
        toast({
          title: "Error",
          description:
            data.message || data.error || "Failed to delete supplier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the supplier",
        variant: "destructive",
      });
    } finally {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      supplierId: null,
      supplierName: "",
      isDeleting: false,
    });
  };

  const handleFormSuccess = () => {
    fetchSuppliers();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSupplier(undefined);
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
            <h1 className="text-3xl font-bold">Supplier Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your suppliers and track purchase history
            </p>
          </div>
          <Button onClick={handleAddSupplier}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Suppliers
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Purchases
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {suppliers.reduce(
                  (sum, supplier) => sum + supplier.summary.totalPurchases,
                  0
                )}
              </div>
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
                {formatCurrency(
                  suppliers.reduce(
                    (sum, supplier) => sum + supplier.summary.totalAmount,
                    0
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  suppliers.reduce(
                    (sum, supplier) => sum + supplier.summary.totalPending,
                    0
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>
              Manage supplier information and view purchase summaries
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
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Purchase Summary
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
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {supplier.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {supplier.name}
                            </div>
                            {supplier.contactPerson && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {supplier.contactPerson}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.address && (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {supplier.address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div>
                          <div className="font-medium">
                            {supplier.summary.totalPurchases} purchases
                          </div>
                          <div className="text-xs">
                            Total:{" "}
                            {formatCurrency(supplier.summary.totalAmount)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-green-600">Paid: </span>
                            {formatCurrency(supplier.summary.totalPaid)}
                          </div>
                          {supplier.summary.totalPending > 0 && (
                            <div className="text-sm">
                              <span className="text-orange-600">Pending: </span>
                              {formatCurrency(supplier.summary.totalPending)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditSupplier(supplier)}
                            size="sm"
                            variant="outline"
                            title="Edit Supplier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() =>
                              handleDeleteSupplier(supplier.id, supplier.name)
                            }
                            size="sm"
                            variant="destructive"
                            title="Delete Supplier"
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
          <SupplierForm
            supplier={editingSupplier}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}

        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteDialog.supplierName}`}
          description={`Are you sure you want to delete "${deleteDialog.supplierName}"? This action cannot be undone and will permanently remove their information.`}
          isLoading={deleteDialog.isDeleting}
        />
      </div>
    </ResponsiveLayout>
  );
}
