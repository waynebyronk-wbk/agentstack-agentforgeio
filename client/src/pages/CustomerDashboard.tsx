import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, CreditCard, Download, LogOut } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "past_due";
  amount: number;
  renewalDate: string;
  startDate: string;
}

interface Order {
  id: string;
  date: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  product: string;
  invoice: string;
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [subscriptions] = useState<Subscription[]>([
    {
      id: "sub_123",
      plan: "Pro - Monthly",
      status: "active",
      amount: 99,
      renewalDate: "2026-05-19",
      startDate: "2026-04-19",
    },
  ]);

  const [orders] = useState<Order[]>([
    {
      id: "order_001",
      date: "2026-04-19",
      amount: 99,
      status: "completed",
      product: "Pro - Monthly",
      invoice: "INV-001",
    },
  ]);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Please log in to view your account</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
            <p className="text-gray-400">Manage your subscriptions and billing</p>
          </div>
          <Button
            onClick={() => logout()}
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="border border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-lg font-semibold text-white">{user.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-lg font-semibold text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Member Since</p>
              <p className="text-lg font-semibold text-white">
                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Active Subscriptions</h2>
          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <Card
                  key={sub.id}
                  className={`border ${
                    sub.status === "active"
                      ? "border-green-500/30 bg-green-900/20"
                      : "border-red-500/30 bg-red-900/20"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{sub.plan}</CardTitle>
                        <CardDescription>
                          Started on {new Date(sub.startDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">${sub.amount}</div>
                        <div className="text-sm text-gray-400">per month</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {sub.status === "active" ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-white capitalize">
                        {sub.status === "active" ? "Active" : "Cancelled"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Renews on {new Date(sub.renewalDate).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">Manage Subscription</Button>
                      <Button variant="outline" className="border-slate-600">
                        Cancel Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border border-slate-700 bg-slate-800/50">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400 mb-4">No active subscriptions</p>
                <Button className="bg-blue-600 hover:bg-blue-700">Browse Plans</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Billing History */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Billing History</h2>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Product</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-white">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-white">{order.product}</td>
                      <td className="py-3 px-4 text-white font-semibold">${order.amount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === "completed"
                              ? "bg-green-900/50 text-green-400"
                              : order.status === "pending"
                              ? "bg-yellow-900/50 text-yellow-400"
                              : "bg-red-900/50 text-red-400"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="border border-slate-700 bg-slate-800/50">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">No billing history</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Payment Methods</h2>
          <Card className="border border-slate-700 bg-slate-800/50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="font-semibold text-white">Visa ending in 4242</p>
                    <p className="text-sm text-gray-400">Expires 12/26</p>
                  </div>
                </div>
                <Button variant="outline" className="border-slate-600">
                  Update
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Support */}
        <Card className="border border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Contact our support team for assistance</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">Contact Support</Button>
            <Button variant="outline" className="border-slate-600">
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
