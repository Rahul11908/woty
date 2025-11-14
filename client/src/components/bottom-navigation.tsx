import { Link, useLocation } from "wouter";
import { MessageCircle, Star, Calendar, Settings, User as UserIcon } from "lucide-react";
import { User } from "@shared/schema";
import analytics from "@/lib/analytics";
import wotyIcon from "@assets/woty-header.png";

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
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md glass-card border-t border-white/20 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        <Link 
          href="/profile" 
          data-testid="nav-program"
          onClick={() => handleTabClick('Program')}
          className="flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110"
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isActive("/profile") ? "gradient-pink shadow-lg" : ""
          }`}>
            <Calendar className={`w-5 h-5 transition-transform duration-300 ${
              isActive("/profile") ? "text-white" : "text-gray-600"
            }`} />
          </div>
          <span className={`text-xs font-medium ${
            isActive("/profile") ? "text-gray-800" : "text-gray-600"
          }`}>Program</span>
        </Link>

        <Link 
          href="/network" 
          data-testid="nav-network"
          onClick={() => handleTabClick('Network')}
          className="flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110"
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isActive("/network") ? "gradient-purple shadow-lg" : ""
          }`}>
            <MessageCircle className={`w-5 h-5 transition-transform duration-300 ${
              isActive("/network") ? "text-white" : "text-gray-600"
            }`} />
          </div>
          <span className={`text-xs font-medium ${
            isActive("/network") ? "text-gray-800" : "text-gray-600"
          }`}>Network</span>
        </Link>

        <Link 
          href="/audience" 
          data-testid="nav-woty"
          onClick={() => handleTabClick('WOTY')}
          className="flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110"
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isActive("/audience") ? "gradient-orange shadow-lg" : ""
          }`}>
            <div className="w-5 h-5 flex items-center justify-center">
              <img 
                src={wotyIcon} 
                alt="WOTY" 
                className="w-full h-full object-contain"
                style={{ filter: isActive("/audience") ? 'brightness(0) invert(1)' : 'invert(0.4)' }}
              />
            </div>
          </div>
          <span className={`text-xs font-medium ${
            isActive("/audience") ? "text-gray-800" : "text-gray-600"
          }`}>WOTY</span>
        </Link>

        <Link 
          href="/sponsors" 
          data-testid="nav-sponsors"
          onClick={() => handleTabClick('Sponsors')}
          className="flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110"
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isActive("/sponsors") ? "gradient-teal shadow-lg" : ""
          }`}>
            <Star className={`w-5 h-5 transition-transform duration-300 ${
              isActive("/sponsors") ? "text-white" : "text-gray-600"
            }`} />
          </div>
          <span className={`text-xs font-medium ${
            isActive("/sponsors") ? "text-gray-800" : "text-gray-600"
          }`}>Sponsors</span>
        </Link>

        <Link 
          href="/user-profile" 
          data-testid="nav-profile"
          onClick={() => handleTabClick('Profile')}
          className="flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110"
        >
          <div className={`p-2 rounded-xl transition-all duration-300 ${
            isActive("/user-profile") ? "gradient-purple shadow-lg" : ""
          }`}>
            <UserIcon className={`w-5 h-5 transition-transform duration-300 ${
              isActive("/user-profile") ? "text-white" : "text-gray-600"
            }`} />
          </div>
          <span className={`text-xs font-medium ${
            isActive("/user-profile") ? "text-gray-800" : "text-gray-600"
          }`}>Profile</span>
        </Link>

        {isAdmin && (
          <Link 
            href="/admin" 
            data-testid="nav-admin"
            onClick={() => handleTabClick('Admin')}
            className="flex flex-col items-center space-y-1 p-2 transition-all duration-300 transform hover:scale-110"
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isActive("/admin") ? "gradient-pink shadow-lg" : ""
            }`}>
              <Settings className={`w-5 h-5 transition-transform duration-300 ${
                isActive("/admin") ? "text-white" : "text-gray-600"
              }`} />
            </div>
            <span className={`text-xs font-medium ${
              isActive("/admin") ? "text-gray-800" : "text-gray-600"
            }`}>Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
