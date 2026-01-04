import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Ingredients from "./pages/Ingredients";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Finances from "./pages/Finances";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Recipes from "./pages/Recipes";
import Accounts from "./pages/Accounts";
import Customers from "./pages/Customers";
import Whitelist from "./pages/Whitelist";


function ProtectedLayout() {
  const [location] = useLocation();
  
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar currentPath={location} />
        
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-4 lg:p-8">
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/ingredients" component={Ingredients} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/sales" component={Sales} />
              <Route path="/customers" component={Customers} />
              <Route path="/finances" component={Finances} />
              <Route path="/reports" component={Reports} />
              <Route path="/accounts" component={Accounts} />
              <Route path="/categories" component={Categories} />
              <Route path="/recipes" component={Recipes} />
              <Route path="/whitelist" component={Whitelist} />
              <Route path="/" component={Dashboard} />
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={ProtectedLayout} />
      <Route path="/ingredients" component={ProtectedLayout} />
      <Route path="/inventory" component={ProtectedLayout} />
      <Route path="/sales" component={ProtectedLayout} />
      <Route path="/customers" component={ProtectedLayout} />
      <Route path="/finances" component={ProtectedLayout} />
      <Route path="/reports" component={ProtectedLayout} />
      <Route path="/accounts" component={ProtectedLayout} />
      <Route path="/categories" component={ProtectedLayout} />
      <Route path="/recipes" component={ProtectedLayout} />
      <Route path="/whitelist" component={ProtectedLayout} />
      <Route path="/" component={ProtectedLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
