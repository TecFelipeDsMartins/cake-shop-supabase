import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Ingredients from "./pages/Ingredients";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Finances from "./pages/Finances";
import Reports from "./pages/Reports";
import Categories from "./pages/Categories";
import Recipes from "./pages/Recipes";


function Router() {
  const [location] = useLocation();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPath={location} />
      
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 lg:p-8">
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/ingredients" component={Ingredients} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/sales" component={Sales} />
            <Route path="/finances" component={Finances} />
            <Route path="/reports" component={Reports} />
            <Route path="/categories" component={Categories} />
            <Route path="/recipes" component={Recipes} />
            <Route path="/" component={Dashboard} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
