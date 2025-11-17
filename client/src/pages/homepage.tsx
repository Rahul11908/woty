import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Trophy } from "lucide-react";
import wotyLogoImage from "@assets/Untitled design-5_1763408655994.png";

export default function Homepage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center animate-fadeInUp">
            <img src={wotyLogoImage} alt="GLORY Women of the Year" className="w-64 rounded-xl shadow-lg" />
          </div>

          {/* Main Title */}
          <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 inline-block mx-auto">
              <p className="text-xl text-white max-w-3xl font-medium">
                Celebrate Canada's most innovative and influential women with GLORY Media.
              </p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 my-12">
            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-4">
                <div className="gradient-purple rounded-xl p-3 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">Network</h3>
                  <p className="text-sm text-gray-600">
                    Connect with industry professionals and build meaningful relationships
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start gap-4">
                <div className="gradient-pink rounded-xl p-3 shadow-lg">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">Live Podcast</h3>
                  <p className="text-sm text-gray-600">
                    Enjoy a live recording of Cinderella Stories, Canada's source for all things Women's Sports.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer group animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-start gap-4">
                <div className="gradient-orange rounded-xl p-3 shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">Excellence</h3>
                  <p className="text-sm text-gray-600">
                    Learn from the best in sports business, media, and innovation
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <Button
              data-testid="button-register"
              onClick={() => setLocation("/create-profile")}
              className="w-full gradient-purple text-white text-lg py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-xl border-0"
            >
              Register for Event
            </Button>
            
            <Button
              data-testid="button-signin"
              onClick={() => setLocation("/login")}
              className="w-full glass-card text-gray-800 text-lg py-6 rounded-2xl transform hover:scale-105 transition-all duration-300 shadow-lg border border-white/30"
            >
              Already Have an Account? Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}