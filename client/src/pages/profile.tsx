import { useState } from "react";
import { Calendar, Clock, Users, MessageSquare, Send, ChevronDown, ChevronUp, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
const SpeakerPhoto = ({ name, photo, size = "normal" }: { name: string; photo?: string; size?: "small" | "normal" }) => {
  const sizeClasses = size === "small" ? "w-6 h-6" : "w-16 h-16";
  
  if (photo) {
    return (
      <img 
        src={photo} 
        alt={name}
        className={`${sizeClasses} rounded-full object-cover border-2 border-gray-200`}
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
  
  const textSize = size === "small" ? "text-xs" : "text-sm";
  
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center border-2 border-gray-200 text-white font-semibold ${textSize}`}>
      {initials}
    </div>
  );
};

// Speaker photo URLs - Replace these with actual photos when available
const speakerPhotos: Record<string, string> = {
  // Panel 1
  "Dwayne De Rosario": "/photos/dwayne-de-rosario.jpg",
  "Sharon Bollenbach": "/photos/sharon-bollenbach.jpg", 
  "Marcus Hanson": "/photos/marcus-hanson.jpg",
  "Ellen Hyslop": "/photos/ellen-hyslop.jpg",
  
  // Panel 2
  "Diana Matheson": "/photos/diana-matheson.jpg",
  "Anastasia Bucsis": "/photos/anastasia-bucsis.jpg",
  "Lance Chung": "/photos/lance-chung.jpg",
  
  // Panel 3
  "Teresa Resch": "/photos/teresa-resch.jpg",
  "Kyle McMann": "/photos/kyle-mcmann.jpg",
  "Saroya Tinker": "/photos/saroya-tinker.jpg",
  "Alyson Walker": "/photos/alyson-walker.jpg",
  
  // Panel 4
  "Jesse Marsch": "/photos/jesse-marsch.jpg",
  "Bob Park": "/photos/bob-park.jpg",
  "Kevin Blue": "/photos/kevin-blue.jpg",
  "Andi Petrillo": "/photos/andi-petrillo.jpg"
};

const panels: Panel[] = [
  {
    id: "panel1",
    title: "Breaking Through: The Canadian Soccer Identity",
    time: "2:10 PM – 2:50 PM",
    description: "From grassroots leagues to the global pitch, Canadian soccer has come a long way—but the journey is far from over. As Toronto prepares to become a host city for the 2026 FIFA World Cup, this panel explores the evolution of soccer in Canada.",
    panelists: [
      {
        name: "Dwayne De Rosario",
        title: "Former Player",
        bio: "Dwayne 'DeRo' De Rosario is a proud Scarborough native and one of Canada's most decorated and influential soccer figures, with a career spanning nearly two decades at the highest levels.",
        photo: speakerPhotos["Dwayne De Rosario"]
      },
      {
        name: "Sharon Bollenbach",
        title: "Executive Director, FIFA World Cup at the City of Toronto",
        bio: "With over 30 years of leadership experience in sport administration and event management, Sharon leads Toronto's preparations for hosting the FIFA World Cup 2026™.",
        photo: speakerPhotos["Sharon Bollenbach"]
      },
      {
        name: "Marcus Hanson",
        title: "CEO, First Touch Football",
        bio: "Marcus is the founder and CEO of First Touch Football Canada, helping Canadian soccer players earn scholarships and opportunities with top clubs.",
        photo: speakerPhotos["Marcus Hanson"]
      }
    ],
    moderator: {
      name: "Ellen Hyslop",
      title: "Co-Founder, The Gist",
      bio: "Ellen is a co-founder and head of content at The GIST, a fan-first sports media brand that has reinvented the dialogue around sports.",
      photo: speakerPhotos["Ellen Hyslop"]
    }
  },
  {
    id: "panel2",
    title: "More Than a Game: Partnership, Purpose, and Canadian Sports",
    time: "2:55 PM – 3:30 PM",
    description: "Diana Matheson and Anastasia Bucsis discuss the power of soccer to drive cultural change, the urgency of professionalizing the women's game in Canada, and leadership in sports.",
    panelists: [
      {
        name: "Diana Matheson",
        title: "Former Player, Co-founder Project 8",
        bio: "Two-time Olympic bronze medalist and co-founder of Project 8 Sports, now Founder and Chief Growth Officer at the Northern Super League.",
        photo: speakerPhotos["Diana Matheson"]
      },
      {
        name: "Anastasia Bucsis",
        title: "Former Olympian, CBC Sports journalist",
        bio: "Two-time Olympic Speedskater and CBC Sports journalist who launched and hosted the podcast 'Player's Own Voice.'",
        photo: speakerPhotos["Anastasia Bucsis"]
      }
    ],
    moderator: {
      name: "Lance Chung",
      title: "Editor-in-Chief, GLORY Media",
      bio: "Lance is the Editor-in-Chief of GLORY Media and master of ceremonies for the Summit with years of experience interviewing today's top minds.",
      photo: speakerPhotos["Lance Chung"]
    }
  },
  {
    id: "panel3",
    title: "From The Ground Up: How To Build a Global Sports Nation",
    time: "4:00 PM - 4:40 PM",
    description: "Leaders building Toronto's sports future explore what it means to turn a city into a global sports hub through major league expansion, global partnerships, and grassroots development.",
    panelists: [
      {
        name: "Teresa Resch",
        title: "President, Toronto Tempo",
        bio: "Inaugural President of the Toronto Tempo, the first WNBA franchise outside of the USA, beginning play in 2026 season.",
        photo: speakerPhotos["Teresa Resch"]
      },
      {
        name: "Kyle McMann",
        title: "SVP, Global Business Development, NHL",
        bio: "Responsible for generating revenue through strategic partnerships and helping the NHL on its path to upwards of $6 billion in annual revenues.",
        photo: speakerPhotos["Kyle McMann"]
      },
      {
        name: "Saroya Tinker",
        title: "DEI, PWHL",
        bio: "Former professional hockey player who sparks change, pushes limits, breaks barriers, and creates a more equitable future in hockey.",
        photo: speakerPhotos["Saroya Tinker"]
      }
    ],
    moderator: {
      name: "Alyson Walker",
      title: "SVP, Wasserman",
      bio: "Sports, media, and entertainment executive with extensive experience across amateur & professional sports, driving revenue and audience growth.",
      photo: speakerPhotos["Alyson Walker"]
    }
  },
  {
    id: "panel4",
    title: "Canada Soccer Preparation for FIFA World Cup",
    time: "4:45 PM - 5:30 PM",
    description: "Head Coach Jesse Marsch shares what it's like to lead a national team with the hopes of a country behind it, joined by key supporters discussing investment in sport.",
    panelists: [
      {
        name: "Jesse Marsch",
        title: "Head Coach, Men's National Team",
        bio: "Current head coach of the Canadian men's national soccer team, known for his high-tempo, high-press coaching style.",
        photo: speakerPhotos["Jesse Marsch"]
      },
      {
        name: "Bob Park",
        title: "Chief Brand Officer, GE Appliances Canada",
        bio: "Leads corporate communications, branding, and digital strategy across a billion-dollar portfolio of appliance brands.",
        photo: speakerPhotos["Bob Park"]
      }
    ],
    moderator: {
      name: "Andi Petrillo",
      title: "CBC Sports Journalist",
      bio: "Host of CBC Sports each weekend, known for her work as part of the studio team for CBC's Hockey Night in Canada.",
      photo: speakerPhotos["Andi Petrillo"]
    }
  }
];

export default function Profile() {
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();

  const submitQuestionMutation = useMutation({
    mutationFn: async ({ panelName, question }: { panelName: string; question: string }) => {
      await apiRequest("POST", "/api/questions", {
        userId: 1, // In real app, get from auth context
        panelName,
        question
      });
    },
    onSuccess: (_, variables) => {
      setQuestions(prev => ({ ...prev, [variables.panelName]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    }
  });

  const handleQuestionSubmit = (panelId: string, panelTitle: string) => {
    const question = questions[panelId];
    if (question?.trim()) {
      submitQuestionMutation.mutate({ panelName: panelTitle, question: question.trim() });
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Program</h1>
              <p className="text-xs text-gray-500">GLORY Sports Summit 2025</p>
            </div>
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
                  GLORY Sports Summit 2025
                </h2>
                <p className="text-gray-600 mb-3">
                  July 15th • Sutton Place Hotel, Toronto
                </p>
                <Badge variant="secondary" className="mb-4">4 Panel Discussions</Badge>
                <p className="text-sm text-gray-600">
                  Exploring the intersection of sports and culture through a distinctly Canadian lens
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Overview */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Today's Schedule</h3>
              
              {/* MC Section */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Master of Ceremonies</h4>
                <div className="flex items-center space-x-3">
                  <SpeakerPhoto name="Lance Chung" photo={speakerPhotos["Lance Chung"]} />
                  <div>
                    <p className="font-medium text-sm text-blue-900">Lance Chung</p>
                    <p className="text-xs text-blue-700">Editor-in-Chief, GLORY Media</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">1:00 PM - 2:00 PM</span>
                  <span className="text-gray-600">Arrivals + Networking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">3:30 PM - 3:55 PM</span>
                  <span className="text-gray-600">Networking Break</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">6:00 PM - 8:00 PM</span>
                  <span className="text-gray-600">Cocktail Reception</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Panel Discussions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Panel Discussions</h3>
            {panels.map((panel, index) => (
              <Card key={panel.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Panel #{index + 1}</Badge>
                        <span className="text-sm text-gray-500">{panel.time}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{panel.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{panel.description}</p>
                      
                      {/* Speaker Preview - Horizontal Layout */}
                      {expandedPanel !== panel.id && (
                        <div className="flex items-center space-x-2 mt-3">
                          <span className="text-xs text-gray-500">Speakers:</span>
                          <div className="flex space-x-1">
                            <SpeakerPhoto name={panel.moderator.name} photo={panel.moderator.photo} size="small" />
                            {panel.panelists.slice(0, 3).map((panelist) => (
                              <SpeakerPhoto key={panelist.name} name={panelist.name} photo={panelist.photo} size="small" />
                            ))}
                            {panel.panelists.length > 3 && (
                              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-600">+{panel.panelists.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedPanel(expandedPanel === panel.id ? null : panel.id)}
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
                      {/* Moderator */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Moderator</h5>
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

                      {/* Panelists */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Panelists</h5>
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
                            onClick={() => handleQuestionSubmit(panel.id, panel.title)}
                            disabled={!questions[panel.id]?.trim() || submitQuestionMutation.isPending}
                            size="sm"
                            className="w-full"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {submitQuestionMutation.isPending ? "Submitting..." : "Submit Question"}
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
