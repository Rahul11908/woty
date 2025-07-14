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
import CreatePassword from "@/pages/create-password";
import BottomNavigation from "@/components/bottom-navigation";
import { useState, useEffect } from "react";
import { User } from "@shared/schema";

function Router() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for server-side authentication first (LinkedIn/OAuth users)
    const checkServerAuth = async () => {
      try {
        const response = await fetch("/api/auth/current-user", {
          credentials: 'include'
        });
        
        if (response.ok) {
          const user = await response.json();
          
          // Check if LinkedIn user needs to create a password
          if (user.authProvider === 'linkedin' && !user.hasPassword) {
            // User authenticated with LinkedIn but needs to create password
            setIsLoading(false);
            setCurrentUser(null); // Don't set as authenticated until password is created
            return;
          }
          
          setCurrentUser(user);
          // Store in localStorage for consistency
          localStorage.setItem("currentUser", JSON.stringify(user));
          localStorage.setItem("currentUserId", user.id.toString());
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log("No server-side authentication found");
      }
      
      // Fallback to localStorage check (for email/password users)
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // Verify the stored user is still valid
          const userResponse = await fetch(`/api/users/${user.id}`, {
            credentials: 'include'
          });
          if (userResponse.ok) {
            const validUser = await userResponse.json();
            setCurrentUser(validUser);
            localStorage.setItem("currentUserId", validUser.id.toString());
          } else {
            console.log("Invalid user ID, resetting to user ID 1");
            // Clear invalid stored data
            localStorage.removeItem("currentUser");
            localStorage.removeItem("currentUserId");
          }
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("currentUser");
          localStorage.removeItem("currentUserId");
        }
      }
      setIsLoading(false);
    };
    
    checkServerAuth();

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
          <Route path="/create-password" component={CreatePassword} />
          <Route component={Login} />
        </Switch>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Switch>
        <Route path="/" component={() => <Network currentUser={currentUser} />} />
        <Route path="/network" component={() => <Network currentUser={currentUser} />} />
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
