import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Network from "@/pages/network";
import GE from "@/pages/ge";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Conversation from "@/pages/conversation";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Switch>
        <Route path="/" component={() => <Network />} />
        <Route path="/network" component={Network} />
        <Route path="/ge" component={GE} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route path="/conversation/:id" component={Conversation} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
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
