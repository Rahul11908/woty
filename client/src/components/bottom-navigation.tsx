import { Link, useLocation } from "wouter";
import { MessageCircle, Lightbulb, Calendar, Settings } from "lucide-react";

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
        <Link href="/network" className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
          isActive("/network") ? "text-primary" : "text-gray-500 hover:text-primary"
        }`}>
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Network</span>
        </Link>

        <Link href="/ge" className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
          isActive("/ge") ? "text-primary" : "text-gray-500 hover:text-primary"
        }`}>
          <Lightbulb className="w-6 h-6" />
          <span className="text-xs font-medium">GE</span>
        </Link>

        <Link href="/profile" className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
          isActive("/profile") ? "text-primary" : "text-gray-500 hover:text-primary"
        }`}>
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-medium">Program</span>
        </Link>

        <Link href="/admin" className={`flex flex-col items-center space-y-1 p-2 transition-colors ${
          isActive("/admin") ? "text-primary" : "text-gray-500 hover:text-primary"
        }`}>
          <Settings className="w-6 h-6" />
          <span className="text-xs font-medium">Admin</span>
        </Link>
      </div>
    </nav>
  );
}
