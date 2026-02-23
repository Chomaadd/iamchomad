import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";
import Brand from "./pages/public/Brand";
import Contact from "./pages/public/Contact";
import Music from "./pages/public/Music";

// Admin Pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import ManageBlog from "./pages/admin/ManageBlog";
import ManageBrand from "./pages/admin/ManageBrand";
import ManageMessages from "./pages/admin/ManageMessages";
import ManageMusic from "./pages/admin/ManageMusic";

// Base Fallback
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:id" component={BlogPost} />
      <Route path="/brand" component={Brand} />
      <Route path="/contact" component={Contact} />
      <Route path="/music" component={Music} />

      {/* Admin Routes */}
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/blog" component={ManageBlog} />
      <Route path="/admin/brand" component={ManageBrand} />
      <Route path="/admin/messages" component={ManageMessages} />
      <Route path="/admin/music" component={ManageMusic} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
