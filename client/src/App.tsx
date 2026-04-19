import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import SecurityMonitoring from "@/pages/SecurityMonitoring";
import DeviceTracking from "./pages/DeviceTracking";
import ErrorLogs from "./pages/ErrorLogs";
import Customers from "./pages/Customers";
import Invoices from "./pages/Invoices";
import DataLogs from "./pages/DataLogs";
import AuditTrail from "./pages/AuditTrail";
import SystemAlerts from "./pages/SystemAlerts";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import Subscription from "./pages/Subscription";
import RevenueMetrics from "./pages/RevenueMetrics";
import AdminDashboard from "./pages/AdminDashboard";
import NotificationDemo from "./pages/NotificationDemo";
import SecurityMetrics from "./pages/SecurityMetrics";
import TransactionStatus from "./pages/TransactionStatus";
import ComprehensiveMetrics from "./pages/ComprehensiveMetrics";
import PricingPage from "./pages/PricingPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import SubscriptionManagement from "./pages/SubscriptionManagement";

function Router() {
  return (
    <Switch>
      <Route path={"/dashboard"}>
        <DashboardLayout>
          <AdminDashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/"} component={Landing} />
      <Route path={"/security"}>
        <DashboardLayout>
          <SecurityMonitoring />
        </DashboardLayout>
      </Route>
      <Route path={"/devices"}>
        <DashboardLayout>
          <DeviceTracking />
        </DashboardLayout>
      </Route>
      <Route path={"/errors"}>
        <DashboardLayout>
          <ErrorLogs />
        </DashboardLayout>
      </Route>
      <Route path={"/customers"}>
        <DashboardLayout>
          <Customers />
        </DashboardLayout>
      </Route>
      <Route path={"/invoices"}>
        <DashboardLayout>
          <Invoices />
        </DashboardLayout>
      </Route>
      <Route path={"/data-logs"}>
        <DashboardLayout>
          <DataLogs />
        </DashboardLayout>
      </Route>
      <Route path={"/audit"}>
        <DashboardLayout>
          <AuditTrail />
        </DashboardLayout>
      </Route>
      <Route path={"/alerts"}>
        <DashboardLayout>
          <SystemAlerts />
        </DashboardLayout>
      </Route>
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/subscription"}>
        <DashboardLayout>
          <Subscription />
        </DashboardLayout>
      </Route>
      <Route path={"/revenue"}>
        <DashboardLayout>
          <RevenueMetrics />
        </DashboardLayout>
      </Route>
      <Route path={"security-metrics"}>
        <DashboardLayout>
          <SecurityMetrics />
        </DashboardLayout>
      </Route>
      <Route path={"transactions"}>
        <DashboardLayout>
          <TransactionStatus />
        </DashboardLayout>
      </Route>
      <Route path={"metrics"}>
        <DashboardLayout>
          <ComprehensiveMetrics />
        </DashboardLayout>
      </Route>
      <Route path={"pricing"} component={PricingPage} />
      <Route path={"account"}>
        <DashboardLayout>
          <CustomerDashboard />
        </DashboardLayout>
      </Route>
      <Route path={"subscription"}>
        <DashboardLayout>
          <SubscriptionManagement />
        </DashboardLayout>
      </Route>
      <Route path={"demo/notifications"} component={NotificationDemo} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
