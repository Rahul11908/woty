import { Link, useLocation } from "wouter";
import { MessageCircle, Lightbulb, User, Settings } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && (location === "/" || location === "/network")) {
      return true;
    }
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center">
        <Link href="/network">
          <a className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            isActive("/network") ? "text-primary" : "text-gray-500 hover:text-primary"
          }`}>
            <MessageCircle className="w-6 h-6" />
            <span className="text-xs font-medium">Network</span>
          </a>
        </Link>

        <Link href="/ge">
          <a className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            isActive("/ge") ? "text-primary" : "text-gray-500 hover:text-primary"
          }`}>
            <Lightbulb className="w-6 h-6" />
            <span className="text-xs font-medium">GE</span>
          </a>
        </Link>

        <Link href="/profile">
          <a className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            isActive("/profile") ? "text-primary" : "text-gray-500 hover:text-primary"
          }`}>
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </a>
        </Link>

        <Link href="/admin">
          <a className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
            isActive("/admin") ? "text-primary" : "text-gray-500 hover:text-primary"
          }`}>
            <Settings className="w-6 h-6" />
            <span className="text-xs font-medium">Admin</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
