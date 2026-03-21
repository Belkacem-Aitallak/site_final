import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import NewRequest from "@/pages/NewRequest";
import Dashboard from "@/pages/Dashboard";
import Preparations from "@/pages/Preparations";
import InBody from "@/pages/InBody";
import { Sidebar, MobileNav } from "@/components/Sidebar";

function Router() {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-8">
        <div className="container mx-auto max-w-7xl p-4 md:p-8 h-full">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/new-request" component={NewRequest} />
            <Route path="/preparations" component={Preparations} />
            <Route path="/inbody" component={InBody} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
