import { User, Mail, Phone, MapPin, Calendar, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
              <p className="text-xs text-gray-500">Summit Attendee</p>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
                <p className="text-gray-600 mb-2">Sports Analytics Director</p>
                <div className="flex justify-center space-x-2 mb-4">
                  <Badge variant="secondary">VIP Attendee</Badge>
                  <Badge variant="outline">Speaker</Badge>
                </div>
                <Button variant="outline" size="sm">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">john.doe@email.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">New York, NY</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Joined March 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summit Activity */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Summit Activity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">5</h4>
                  <p className="text-sm text-gray-600">Sessions Attended</p>
                </div>
                <div className="text-center">
                  <User className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold">12</h4>
                  <p className="text-sm text-gray-600">Connections Made</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Interests & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Sports Analytics</Badge>
                <Badge variant="secondary">Data Science</Badge>
                <Badge variant="secondary">Performance Metrics</Badge>
                <Badge variant="secondary">AI/ML</Badge>
                <Badge variant="secondary">Fan Experience</Badge>
                <Badge variant="secondary">Technology Innovation</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Rated "AI in Sports" session</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Connected with Sarah Johnson</p>
                    <p className="text-sm text-gray-600">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Attended GE Innovation Showcase</p>
                    <p className="text-sm text-gray-600">Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
