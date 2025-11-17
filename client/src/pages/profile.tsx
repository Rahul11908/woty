import { useState, useEffect } from "react";
import { Calendar, Mic, Clock, Users, Wine, Radio, Send, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import teresaReschImage from "@assets/teresa-resch-woty.png";
import cinderellaStoriesLogo from "@assets/cinderella-stories-podcast.png";
import lanceChungImage from "@assets/lancechung_1763403855426.jpg";
import wotyLogoImage from "@assets/Untitled design-5_1763407874091.png";

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
    title: "Doors open and Welcome Cocktail",
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
    time: "7:15 pm",
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
  const [question, setQuestion] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedUserId = localStorage.getItem("currentUserId");
    
    if (storedUser && storedUserId) {
      try {
        const userId = parseInt(storedUserId);
        if (userId && userId > 0) {
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, []);

  const submitQuestionMutation = useMutation({
    mutationFn: async ({ question }: { question: string }) => {
      const response = await apiRequest("/api/questions", "POST", {
        userId: currentUserId,
        panelName: "Cinderella Stories with Teresa Resch",
        question
      });
      return response;
    },
    onSuccess: () => {
      setQuestion("");
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question submitted successfully!",
        description: "Your question has been submitted for the live podcast session.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit question",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleQuestionSubmit = () => {
    if (question?.trim() && currentUserId) {
      submitQuestionMutation.mutate({ question: question.trim() });
    }
  };

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
          {/* GLORY WOTY Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src={wotyLogoImage} 
              alt="GLORY Women of the Year" 
              className="w-full max-w-md rounded-2xl shadow-lg"
            />
          </div>

          {/* Host */}
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Mic className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Host</h3>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                  <img 
                    src={lanceChungImage} 
                    alt="Lance Chung" 
                    className="w-full h-full object-cover"
                  />
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
                  Join GLORY Media for a special live episode of our hit podcast Cinderella Stories, featuring Women of the Year honoree and Toronto Tempo President, Teresa Resch.
                </p>

                <div className="space-y-4">
                  {/* Podcast Information */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Podcast</h5>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-64 h-64 rounded-2xl overflow-hidden bg-gray-200">
                          <img 
                            src={cinderellaStoriesLogo} 
                            alt="Cinderella Stories Podcast" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full">
                          <h6 className="font-bold text-base text-gray-900 mb-1">Cinderella Stories</h6>
                          <p className="text-sm text-gray-600 font-medium mb-2">GLORY Media Podcast</p>
                          <p className="text-xs text-gray-600">Cinderella Stories is your front-row seat to the drama, drive, and dynamism of women's sports. Hosted by seasoned sports journalists Ashley Docking and Savannah Hamilton, this podcast dives into buzzer-beaters, breakout stars, bracket-shaking upsets, and the culture powering women's hoops.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Guest */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Special Guest</h5>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gray-200">
                          <img 
                            src={teresaReschImage} 
                            alt="Teresa Resch" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-full">
                          <p className="font-medium text-sm">Teresa Resch</p>
                          <p className="text-xs text-gray-600 mb-1">Toronto Tempo President</p>
                          <p className="text-xs text-gray-600">Teresa Resch is the inaugural President of the WNBA Toronto franchise, which will begin play in 2026 season. Resch has been a leader in basketball development at the global scale for nearly 20 years. For 11 seasons she was a senior leader at the Toronto Raptors, bringing basketball to the forefront of Canadian sport.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question Submission */}
                  <div className="border-t pt-4">
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Submit a Question
                    </h5>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Ask a question for the live podcast session..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="resize-none"
                        rows={3}
                        data-testid="input-podcast-question"
                      />
                      <Button
                        onClick={handleQuestionSubmit}
                        disabled={!question?.trim() || submitQuestionMutation.isPending}
                        size="sm"
                        className="w-full"
                        data-testid="button-submit-question"
                      >
                        {submitQuestionMutation.isPending ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Question
                          </>
                        )}
                      </Button>
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
