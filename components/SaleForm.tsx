"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { ThermalReceipt } from "./ThermalReceipt";
import { useToast } from "./ui/use-toast";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  barcode?: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface CustomerData {
  name: string;
  phone: string;
  address: string;
}

export function SaleForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    address: "",
  });
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const { toast } = useToast();
  const { data: session } = useSession();

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
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          variant: "warning",
          title: "Insufficient Stock",
          description: "Not enough stock available for this product",
        });
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          total: product.sellingPrice,
        },
      ]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock) {
      toast({
        variant: "warning",
        title: "Insufficient Stock",
        description: "Not enough stock available for this product",
      });
      return;
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast({
        variant: "warning",
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
      });
      return;
    }
    setShowCustomerForm(true);
  };

  const handleCheckout = async () => {
    // Validate customer phone if customer data is provided
    if ((customer.name || customer.address) && !customer.phone.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description:
          "Customer phone is required when providing customer information",
      });
      return;
    }

    setIsLoading(true);
    try {
      const saleData: any = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        total: getTotal(),
      };

      // Include customer data if phone is provided
      if (customer.phone.trim()) {
        saleData.customer = {
          name: customer.name.trim() || undefined,
          phone: customer.phone.trim(),
          address: customer.address.trim() || undefined,
        };
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const saleResult = await response.json();

        // Prepare receipt data
        const receiptInfo = {
          customer: customer.phone.trim()
            ? {
                name: customer.name.trim() || undefined,
                phone: customer.phone.trim(),
              }
            : undefined,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          total: getTotal(),
          saleId: saleResult.sale?.id,
          date: new Date().toLocaleString(),
          cashier: session?.user?.name || "Unknown",
        };

        setReceiptData(receiptInfo);
        setShowReceipt(true);

        toast({
          variant: "success",
          title: "Sale Completed",
          description: "The sale has been processed successfully!",
        });
        setCart([]);
        setShowCart(false);
        setShowCustomerForm(false);
        setCustomer({ name: "", phone: "", address: "" });
        fetchProducts(); // Refresh products to update stock
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Sale Failed",
          description:
            error.error || "An error occurred while processing the sale",
        });
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      toast({
        variant: "destructive",
        title: "Sale Failed",
        description: "An unexpected error occurred while processing the sale",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">New Sale</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowCart(!showCart)} className="relative">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({cart.length})
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Select products to add to cart</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        ৳{product.sellingPrice} • Stock: {product.stock}
                      </p>
                    </div>
                    <Button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        {(showCart || cart.length > 0) && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>Review your items</CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            ৳{item.price} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            size="sm"
                            variant="outline"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeFromCart(item.productId)}
                            size="sm"
                            variant="destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium">
                            ৳{item.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>৳{getTotal().toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={handleCompleteSale}
                        className="w-full mt-4"
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Process"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Customer Information Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Enter customer details to complete the sale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter customer name"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address <span className="text-gray-500">(Optional)</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter address"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => setShowCustomerForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckout}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm Sale"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <ThermalReceipt
          data={receiptData}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
