import { useState, useEffect } from "react";
import { Calendar, Clock, Users, MessageSquare, Send, ChevronDown, ChevronUp, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { analytics } from "@/lib/analytics";
import gloryLogo from "@assets/GLORY WOTY_1762527738446.png";
import teresaReschMagazinePhoto from "@assets/teresa-resch-magazine.png";
import cinderellaStoriesPodcastPhoto from "@assets/cinderella-stories-podcast.png";

interface Panel {
  id: string;
  title: string;
  time: string;
  description: string;
  panelists: Array<{
    name: string;
    title: string;
    bio: string;
    photo?: string;
  }>;
  moderator: {
    name: string;
    title: string;
    bio: string;
    photo?: string;
  };
}

// Speaker Photo Component
const SpeakerPhoto = ({ name, photo, size = "normal" }: { name: string; photo?: string; size?: "small" | "normal" | "preview" }) => {
  const sizeClasses = size === "small" ? "w-6 h-6" : size === "preview" ? "w-12 h-12" : "w-16 h-16";
  
  if (photo) {
    return (
      <img 
        src={photo} 
        alt={name}
        loading="lazy"
        className={`${sizeClasses} rounded-full avatar-image-flat border-2 border-gray-200`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }
  
  // Generate initials from name
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  // Generate consistent color based on name
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600', 
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-red-500 to-red-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
    'from-pink-500 to-pink-600'
  ];
  
  const colorIndex = name.length % colors.length;
  
  const textSize = size === "small" ? "text-xs" : size === "preview" ? "text-sm" : "text-sm";
  
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center border-2 border-gray-200 text-white font-semibold ${textSize}`}>
      {initials}
    </div>
  );
};

// Speaker photo URLs - Using actual photos when available
const speakerPhotos: Record<string, string> = {
  "Teresa Resch": teresaReschMagazinePhoto,
  "Cinderella Stories": cinderellaStoriesPodcastPhoto,
};

const panels: Panel[] = [
  {
    id: "panel1",
    title: "Cinderella Stories with Special Guest Teresa Resch",
    time: "6:30 pm - 7:00 pm",
    description: "Join GLORY Media for a live Episode of our hit podcast Cinderella Stories, featuring Special Guest, Toronto Tempo President Teresa Resch as she gears up to launch the leagues first Canadian franchise.",
    panelists: [
      {
        name: "Teresa Resch",
        title: "Toronto Tempo President",
        bio: "Teresa Resch is the inaugural President of the WNBA Toronto franchise, which will begin play in 2026 season. Resch has been a leader in basketball development at the global scale for nearly 20 years. For 11 seasons she was a senior leader at the Toronto Raptors, bringing basketball to the forefront of Canadian sport.",
        photo: speakerPhotos["Teresa Resch"]
      }
    ],
    moderator: {
      name: "Cinderella Stories",
      title: "GLORY Media Podcast",
      bio: "Cinderella Stories is your front-row seat to the drama, drive, and dynamism of women's sports. Hosted by seasoned sports journalists Ashley Docking and Savannah Hamilton, this podcast dives into buzzer-beaters, breakout stars, bracket-shaking upsets, and the culture powering women's hoops.",
      photo: speakerPhotos["Cinderella Stories"]
    }
  }
];

export default function Profile() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ [key: string]: string }>({});
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user ID from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedUserId = localStorage.getItem("currentUserId");
    
    if (storedUser && storedUserId) {
      try {
        const user = JSON.parse(storedUser);
        const userId = parseInt(storedUserId);
        
        // Use the stored user ID if it's valid
        if (userId && userId > 0) {
          setCurrentUserId(userId);
        } else {
          console.error("Invalid user ID in localStorage");
          setCurrentUserId(1);
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        setCurrentUserId(1);
      }
    } else {
      console.log("No stored user found, using default user ID 1");
      setCurrentUserId(1);
    }
  }, []);

  const submitQuestionMutation = useMutation({
    mutationFn: async ({ panelId, panelName, question }: { panelId: string; panelName: string; question: string }) => {
      console.log("Submitting question with data:", { userId: currentUserId, panelName, question });
      
      const response = await apiRequest("/api/questions", "POST", {
        userId: currentUserId,
        panelName,
        question
      });
      
      console.log("Question submission response:", response);
      return response;
    },
    onSuccess: (_, variables) => {
      setQuestions(prev => ({ ...prev, [variables.panelId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question submitted successfully!",
        description: "Your question has been submitted and will be considered for the panel discussion.",
      });
    },
    onError: (error) => {
      console.error("Question submission error:", error);
      toast({
        title: "Failed to submit question",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleQuestionSubmit = (panelId: string, panelTitle: string) => {
    const question = questions[panelId];
    if (question?.trim() && currentUserId) {
      console.log("Attempting to submit question:", { panelId, panelTitle, question: question.trim(), currentUserId });
      submitQuestionMutation.mutate({ panelId, panelName: panelTitle, question: question.trim() });
    } else {
      console.error("Cannot submit question - missing data:", { question: question?.trim(), currentUserId });
      toast({
        title: "Cannot submit question",
        description: "Please make sure you're logged in and have entered a question.",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Program</h1>
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
          {/* Event Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  2025 Women of the Year
                </h2>
                <p className="text-gray-600 mb-4">
                  November 18th - Canopy by Hilton Toronto Yorkville
                </p>
                <p className="text-sm text-gray-700 font-bold italic">
                  Celebrating excellence with 2025's most influential and innovative Women in Canada.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Overview */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Schedule</h3>

              {/* Master of Ceremonies */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Master of Ceremonies</h4>
                <div className="flex items-center space-x-4">
                  <SpeakerPhoto name="Lance Chung" size="normal" />
                  <div>
                    <p className="font-semibold text-blue-900 text-lg">Lance Chung</p>
                    <p className="text-blue-700">Editor-in-Chief, GLORY Media</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium w-44 flex-shrink-0">6:00 pm - 6:30 pm</span>
                  <span className="text-gray-600">VIP Arrival and Welcome Cocktail</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium w-44 flex-shrink-0">6:30 pm - 7:00 pm</span>
                  <span className="text-gray-600">Live Podcast - Cinderella Stories with Special Guest Teresa Resch</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium w-44 flex-shrink-0">7:00 pm - 9:00 pm</span>
                  <span className="text-gray-600">Networking and Cocktail Reception</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Podcast */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-center">Live Podcast - Submit Your Questions</h3>
            {panels.map((panel, index) => (
              <Card key={panel.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Live Podcast</Badge>
                        <span className="text-sm text-gray-500">{panel.time}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{panel.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{panel.description}</p>
                      
                      {/* Special Guest Preview - Horizontal Layout */}
                      {expandedPanel !== panel.id && (
                        <div className="flex items-center space-x-3 mt-3">
                          <span className="text-sm text-gray-500 font-medium">Special Guest:</span>
                          <div className="flex space-x-2">
                            {panel.panelists.slice(0, 3).map((panelist) => (
                              <SpeakerPhoto key={panelist.name} name={panelist.name} photo={panelist.photo} size="preview" />
                            ))}
                            {panel.panelists.length > 3 && (
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm text-gray-600 font-medium">+{panel.panelists.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const isExpanding = expandedPanel !== panel.id;
                        setExpandedPanel(expandedPanel === panel.id ? null : panel.id);
                        if (isExpanding) {
                          analytics.trackPanelExpanded(panel.id, panel.title);
                        }
                      }}
                    >
                      {expandedPanel === panel.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedPanel === panel.id && (
                    <div className="space-y-4 border-t pt-4">
                      {/* Podcast/Show */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Podcast</h5>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <SpeakerPhoto name={panel.moderator.name} photo={panel.moderator.photo} />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{panel.moderator.name}</p>
                              <p className="text-xs text-gray-600 mb-1">{panel.moderator.title}</p>
                              <p className="text-xs text-gray-600">{panel.moderator.bio}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Special Guest */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Special Guest</h5>
                        <div className="space-y-2">
                          {panel.panelists.map((panelist, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <SpeakerPhoto name={panelist.name} photo={panelist.photo} />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{panelist.name}</p>
                                  <p className="text-xs text-gray-600 mb-1">{panelist.title}</p>
                                  <p className="text-xs text-gray-600">{panelist.bio}</p>
                                </div>
                              </div>
                            </div>
                          ))}
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
                            placeholder={`Ask a question for "${panel.title}"...`}
                            value={questions[panel.id] || ""}
                            onChange={(e) => setQuestions(prev => ({ ...prev, [panel.id]: e.target.value }))}
                            className="resize-none"
                            rows={3}
                          />
                          <Button
                            onClick={() => {
                              analytics.trackButtonClick('submit_question', 'program_panel', { panelId: panel.id, panelTitle: panel.title });
                              handleQuestionSubmit(panel.id, panel.title);
                            }}
                            disabled={!questions[panel.id]?.trim() || submitQuestionMutation.isPending}
                            size="sm"
                            className="w-full transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg"
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
                                <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                                Submit Question
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
