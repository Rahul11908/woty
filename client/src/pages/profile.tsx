import { Calendar, Mic, Clock, Users, Wine, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import teresaReschImage from "@assets/teresa-resch-woty.png";

interface ScheduleItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  icon: string;
  color: string;
}

const scheduleItems: ScheduleItem[] = [
  {
    id: "arrival",
    time: "6:00 pm",
    duration: "30 min",
    title: "VIP Arrival and Welcome Cocktail",
    icon: "wine",
    color: "from-purple-400 to-purple-500"
  },
  {
    id: "podcast",
    time: "6:30 pm",
    duration: "30 min",
    title: "Live Podcast - Cinderella Stories with Special Guest Teresa Resch",
    icon: "mic",
    color: "from-pink-400 to-pink-500"
  },
  {
    id: "networking",
    time: "7:00 pm",
    duration: "2 hrs",
    title: "Networking and Cocktail Reception",
    icon: "users",
    color: "from-teal-400 to-teal-500"
  }
];

const IconComponent = ({ iconName, className }: { iconName: string; className?: string }) => {
  switch (iconName) {
    case "wine":
      return <Wine className={className} />;
    case "mic":
      return <Mic className={className} />;
    case "users":
      return <Users className={className} />;
    default:
      return <Calendar className={className} />;
  }
};

export default function Profile() {
  return (
    <div className="min-h-screen pb-40 relative z-10 bg-gradient-to-br from-purple-500 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Event Program</h1>
            <p className="text-sm text-white/90">GLORY Women of the Year 2025</p>
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        <div className="space-y-4">
          {/* Master of Ceremonies */}
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Mic className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Master of Ceremonies</h3>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">LC</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Lance Chung</p>
                  <p className="text-sm text-gray-600">Editor-in-Chief, GLORY Media</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-1">
              <Clock className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">Schedule</h3>
            </div>
            
            {scheduleItems.map((item) => (
              <Card key={item.id} className="bg-white shadow-lg">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-md flex-shrink-0`}>
                      <IconComponent iconName={item.icon} className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">{item.time}</span>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                          {item.duration}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{item.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Podcast Session */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center space-x-2 px-1">
              <Radio className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">Live Podcast Session</h3>
            </div>

            <Card className="bg-white shadow-lg">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 text-purple-700" />
                    <span className="text-sm font-medium text-purple-900">6:30 pm - 7:00 pm</span>
                  </div>
                  <Badge className="bg-red-500 text-white hover:bg-red-600">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      <span>LIVE</span>
                    </span>
                  </Badge>
                </div>

                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  Cinderella Stories with Teresa Resch
                </h4>

                <p className="text-sm text-gray-700 mb-4">
                  Join GLORY Media for a live Episode of our hit podcast Cinderella Stories, featuring Teresa Resch, Toronto Tempo President.
                </p>

                {/* Special Guest */}
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Special Guest</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img 
                        src={teresaReschImage} 
                        alt="Teresa Resch" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Teresa Resch</p>
                      <p className="text-sm text-gray-600">Toronto Tempo President</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
