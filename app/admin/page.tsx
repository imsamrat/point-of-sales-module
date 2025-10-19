"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  DollarSign,
  Package,
  CreditCard,
  TrendingUp,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import { Header } from "../../components/layout/Header";
import { Sidebar } from "../../components/layout/Sidebar";

interface DashboardData {
  totalSales: number;
  inventoryCount: number;
  totalExpenses: number;
  recentTransactions: number;
  salesData: Array<{ date: string; sales: number; expenses: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
  recentActivities: Array<{
    id: string;
    type: "sale" | "product" | "expense" | "employee";
    description: string;
    amount?: number;
    user: string;
    time: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from multiple endpoints
      const [salesRes, inventoryRes, expensesRes, transactionsRes] =
        await Promise.all([
          fetch("/api/sales"),
          fetch("/api/inventory"),
          fetch("/api/expenses"),
          fetch("/api/sales?limit=10"),
        ]);

      const [sales, inventory, expenses, transactions] = await Promise.all([
        salesRes.json(),
        inventoryRes.json(),
        expensesRes.json(),
        transactionsRes.json(),
      ]);

      // Calculate totals
      const totalSales = sales.reduce(
        (sum: number, sale: any) => sum + sale.total,
        0
      );
      const totalExpenses = expenses.reduce(
        (sum: number, expense: any) => sum + expense.amount,
        0
      );

      // Generate mock sales data for charts (in real app, this would come from analytics API)
      const salesData = generateSalesData(timeRange);

      // Generate category data
      const categoryData = [
        { name: "Electronics", value: 35, color: "#8884d8" },
        { name: "Clothing", value: 25, color: "#82ca9d" },
        { name: "Food", value: 20, color: "#ffc658" },
        { name: "Books", value: 12, color: "#ff7300" },
        { name: "Other", value: 8, color: "#00ff00" },
      ];

      // Generate recent activities
      const recentActivities = generateRecentActivities();

      setData({
        totalSales,
        inventoryCount: inventory.length,
        totalExpenses,
        recentTransactions: transactions.length,
        salesData,
        categoryData,
        recentActivities,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSalesData = (range: string) => {
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        sales: Math.floor(Math.random() * 5000) + 1000,
        expenses: Math.floor(Math.random() * 2000) + 500,
      });
    }

    return data;
  };

  const generateRecentActivities = () => {
    return [
      {
        id: "1",
        type: "sale" as const,
        description: "New sale completed",
        amount: 299.99,
        user: "John Doe",
        time: "2 minutes ago",
      },
      {
        id: "2",
        type: "product" as const,
        description: "Added new product: iPhone 15",
        user: "Admin",
        time: "15 minutes ago",
      },
      {
        id: "3",
        type: "expense" as const,
        description: "Office supplies purchase",
        amount: 150.0,
        user: "Jane Smith",
        time: "1 hour ago",
      },
      {
        id: "4",
        type: "employee" as const,
        description: "New employee hired: Mike Johnson",
        user: "HR Manager",
        time: "2 hours ago",
      },
      {
        id: "5",
        type: "sale" as const,
        description: "Bulk order processed",
        amount: 1250.0,
        user: "Sarah Wilson",
        time: "3 hours ago",
      },
    ];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />;
      case "product":
        return <Package className="h-4 w-4" />;
      case "expense":
        return <CreditCard className="h-4 w-4" />;
      case "employee":
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "sale":
        return "text-green-600 bg-green-100";
      case "product":
        return "text-blue-600 bg-blue-100";
      case "expense":
        return "text-red-600 bg-red-100";
      case "employee":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {range === "7d" ? "7D" : range === "30d" ? "30D" : "90D"}
              </button>
            ))}
          </div>
          <Button onClick={fetchDashboardData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
              Total Sales
            </CardTitle>
            <div className="p-2 bg-green-500 rounded-full">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(data.totalSales)}
            </div>
            <div className="flex items-center text-xs text-green-700 dark:text-green-300 mt-1">
              <TrendingUpIcon className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Inventory Items
            </CardTitle>
            <div className="p-2 bg-blue-500 rounded-full">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {data.inventoryCount}
            </div>
            <div className="flex items-center text-xs text-blue-700 dark:text-blue-300 mt-1">
              <Activity className="h-3 w-3 mr-1" />
              {data.inventoryCount > 50 ? "Well stocked" : "Low stock alert"}
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
              Total Expenses
            </CardTitle>
            <div className="p-2 bg-red-500 rounded-full">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(data.totalExpenses)}
            </div>
            <div className="flex items-center text-xs text-red-700 dark:text-red-300 mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3.2% from last month
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full -mr-10 -mt-10"></div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Recent Transactions
            </CardTitle>
            <div className="p-2 bg-purple-500 rounded-full">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {data.recentTransactions}
            </div>
            <div className="flex items-center text-xs text-purple-700 dark:text-purple-300 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Last 24 hours
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/10 rounded-full -mr-10 -mt-10"></div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sales Trend
                </CardTitle>
                <CardDescription>
                  Revenue and expenses over time
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorExpenses"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    className="text-xs"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === "sales" ? "Sales" : "Expenses",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Sales by Category
            </CardTitle>
            <CardDescription>Product category performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Percentage"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {data.categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest sales and activities</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(activity.amount)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Employees
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
