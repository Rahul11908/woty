import { Link, useLocation } from "wouter";
import { MessageCircle, Star, Calendar, Settings, User as UserIcon } from "lucide-react";
import { User } from "@shared/schema";
import analytics from "@/lib/analytics";

interface BottomNavigationProps {
  currentUser: User;
}

export default function BottomNavigation({ currentUser }: BottomNavigationProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/network")) {
      return true;
    }
    return location === path;
  };

  const isAdmin = currentUser.email?.endsWith("@glory.media") || false;

  const handleTabClick = (tabName: string) => {
    analytics.trackTabChanged(tabName);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        <Link 
          href="/profile" 
          onClick={() => handleTabClick('Program')}
          className={`flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110 ${
            isActive("/profile") ? "text-primary scale-105" : "text-gray-500 hover:text-primary"
          }`}
        >
          <Calendar className={`w-6 h-6 transition-transform duration-300`} />
          <span className="text-xs font-medium">Program</span>
        </Link>

        <Link 
          href="/network" 
          onClick={() => handleTabClick('Network')}
          className={`flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110 ${
            isActive("/network") ? "text-primary scale-105" : "text-gray-500 hover:text-primary"
          }`}
        >
          <MessageCircle className={`w-6 h-6 transition-transform duration-300`} />
          <span className="text-xs font-medium">Network</span>
        </Link>

        <Link 
          href="/sponsors" 
          onClick={() => handleTabClick('Sponsors')}
          className={`flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110 ${
            isActive("/sponsors") ? "text-primary scale-105" : "text-gray-500 hover:text-primary"
          }`}
        >
          <Star className={`w-6 h-6 transition-transform duration-300`} />
          <span className="text-xs font-medium">Sponsors</span>
        </Link>

        <Link 
          href="/user-profile" 
          onClick={() => handleTabClick('Profile')}
          className={`flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110 ${
            isActive("/user-profile") ? "text-primary scale-105" : "text-gray-500 hover:text-primary"
          }`}
        >
          <UserIcon className={`w-6 h-6 transition-transform duration-300`} />
          <span className="text-xs font-medium">Profile</span>
        </Link>

        {isAdmin && (
          <Link 
            href="/admin" 
            onClick={() => handleTabClick('Admin')}
            className={`flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110 ${
              isActive("/admin") ? "text-primary scale-105" : "text-gray-500 hover:text-primary"
            }`}
          >
            <Settings className={`w-6 h-6 transition-transform duration-300`} />
            <span className="text-xs font-medium">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
