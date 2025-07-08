import { Lightbulb, TrendingUp, Users, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (1)_1751985925815.png";

export default function GE() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">General Electric</h1>
          </div>
          <div className="w-32 h-14">
            <img 
              src={gloryLogo} 
              alt="GLORY Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        <div className="space-y-6">
          {/* Welcome Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to GE Innovation Hub
                </h2>
                <p className="text-gray-600">
                  Discover cutting-edge sports technology and innovation opportunities
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">25+</h3>
                <p className="text-sm text-gray-600">Innovation Projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">150+</h3>
                <p className="text-sm text-gray-600">Sports Partners</p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming GE Events</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Sports Tech Innovation Showcase</p>
                    <p className="text-sm text-gray-600">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">AI in Athletics Workshop</p>
                    <p className="text-sm text-gray-600">Friday, 10:00 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Innovation Areas */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Innovation Focus Areas</h3>
            <div className="grid grid-cols-1 gap-3">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Performance Analytics</h4>
                  <p className="text-sm text-gray-600">
                    Advanced data analytics and AI-powered insights for athletic performance optimization
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Smart Equipment</h4>
                  <p className="text-sm text-gray-600">
                    IoT-enabled sports equipment with real-time monitoring capabilities
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-2">Sustainability Solutions</h4>
                  <p className="text-sm text-gray-600">
                    Eco-friendly technologies for sustainable sports facilities and events
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
