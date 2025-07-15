import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Trophy } from "lucide-react";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (2)_1751991903966.png";

export default function Homepage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <a href="https://www.glory.media" target="_blank" rel="noopener noreferrer">
              <img src={gloryLogo} alt="2025 GLORY Sports Summit" className="h-32 w-auto hover:opacity-80 transition-opacity cursor-pointer" />
            </a>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              2025 GLORY Sports Summit
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Connect with sports industry leaders, share insights, and shape the future of sports
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
            <Card className="border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="group-hover:text-gray-700 transition-colors">
                  Connect with industry professionals and build meaningful relationships
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <CalendarDays className="w-12 h-12 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">Panel Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="group-hover:text-gray-700 transition-colors">
                  Engage with expert panels and submit your questions for live discussions
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
              <CardHeader className="text-center">
                <Trophy className="w-12 h-12 text-orange-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-lg group-hover:text-orange-600 transition-colors">Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="group-hover:text-gray-700 transition-colors">
                  Learn from the best in sports business, media, and innovation
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-4">
              <Button
                onClick={() => setLocation("/create-profile")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center">
                  Register for Event
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
              
              <Button
                onClick={() => setLocation("/login")}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 text-lg py-6 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                Already Have an Account? Sign In
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className="mt-16 text-center space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Join the Conversation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience real-time networking, participate in panel discussions, and connect with fellow sports industry professionals in our interactive summit platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}