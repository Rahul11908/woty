import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Network from "@/pages/network";
import Sponsors from "@/pages/sponsors";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Conversation from "@/pages/conversation";
import Login from "@/pages/login";
import CreateProfile from "@/pages/create-profile";
import EmailLogin from "@/pages/email-login";
import BottomNavigation from "@/components/bottom-navigation";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);

    // Listen for storage changes (when user is created in another tab/component)
    const handleStorageChange = () => {
      const newStoredUser = localStorage.getItem("currentUser");
      if (newStoredUser) {
        try {
          const user = JSON.parse(newStoredUser);
          setCurrentUser(user);
        } catch (error) {
          console.error("Error parsing new stored user:", error);
        }
      }
    };

    // Listen for custom userLogin event from profile creation/login
    const handleUserLogin = (event: CustomEvent) => {
      const user = event.detail;
      setCurrentUser(user);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <Switch>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/create-profile" component={CreateProfile} />
          <Route path="/email-login" component={EmailLogin} />
          <Route component={Login} />
        </Switch>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Switch>
        <Route path="/" component={() => <Network />} />
        <Route path="/network" component={Network} />
        <Route path="/sponsors" component={Sponsors} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route path="/conversation/:id" component={Conversation} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation currentUser={currentUser} />
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
