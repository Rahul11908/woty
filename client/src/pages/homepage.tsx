import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Trophy } from "lucide-react";
import gloryLogo from "@assets/GLORY WOTY_1762527738446.png";

export default function Homepage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative z-10">
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center animate-fadeInUp">
            <img src={gloryLogo} alt="2025 GLORY Sports Summit" className="h-40 w-auto drop-shadow-2xl" />
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

          {/* Event Details */}
          <div className="mt-12 text-center space-y-4 glass-card-light rounded-2xl p-6 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-xl font-semibold text-gray-800">Join the Conversation</h2>
            <p className="text-gray-600 text-sm">
              Experience real-time networking, participate in panel discussions, and connect with fellow sports industry professionals in our interactive summit platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}