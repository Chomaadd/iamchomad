import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { HelmetProvider } from "react-helmet-async";

// Public Pages
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";
import Brand from "./pages/public/Brand";
import Contact from "./pages/public/Contact";
import Music from "./pages/public/Music";
import Resume from "./pages/public/Resume";
import ResumePrint from "./pages/public/ResumePrint";
import Links from "./pages/public/Links";
// Admin Pages
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import ManageBlog from "./pages/admin/ManageBlog";
import ManageBrand from "./pages/admin/ManageBrand";
import ManageMessages from "./pages/admin/ManageMessages";
import ManageMusic from "./pages/admin/ManageMusic";
import ManageResume from "./pages/admin/ManageResume";
import ManageLinks from "./pages/admin/ManageLinks";
import Novel from "./pages/public/Novel";
import NovelDetail from "./pages/public/NovelDetail";
import NovelRead from "./pages/public/NovelRead";
import ManageNovel from "./pages/admin/ManageNovel";
import AdminSettings from "./pages/admin/Settings";
import ManageShortUrls from "./pages/admin/ManageShortUrls";
import LinkExpired from "./pages/public/LinkExpired";

// Base Fallback
import NotFound from "@/pages/public/Not-Found";

import { usePageTracker } from "@/hooks/use-analytics";
import { MusicPlayerProvider } from "@/hooks/use-music-player";
import { MiniPlayer } from "@/components/layout/MiniPlayer";

function Router() {
  usePageTracker();
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/brand" component={Brand} />
      <Route path="/contact" component={Contact} />
      <Route path="/music" component={Music} />
      <Route path="/resume" component={Resume} />
      <Route path="/resume/pdf" component={ResumePrint} />
      <Route path="/links" component={Links} />
      <Route path="/novel" component={Novel} />
      <Route path="/novel/:slug/:seasonSlug/:chapterSlug" component={NovelRead} />
      <Route path="/novel/:slug" component={NovelDetail} />
      <Route path="/link-expired" component={LinkExpired} />

      {/* Admin Routes */}
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/blog" component={ManageBlog} />
      <Route path="/admin/brand" component={ManageBrand} />
      <Route path="/admin/messages" component={ManageMessages} />
      <Route path="/admin/music" component={ManageMusic} />
      <Route path="/admin/resume" component={ManageResume} />
      <Route path="/admin/links" component={ManageLinks} />
      <Route path="/admin/novel" component={ManageNovel} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/short-urls" component={ManageShortUrls} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <MusicPlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <MiniPlayer />
            </TooltipProvider>
          </MusicPlayerProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
