import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Award, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import gloryWoty from "@assets/GLORY WOTY_1762527738446.png";
import teresaReschImage from "@assets/teresa-resch-woty.png";
import maggieKangImage from "@assets/maggie-kang-woty.png";
import madisonTevlinImage from "@assets/madison-tevlin-woty.png";
import dianaMatheson from "@assets/diana-matheson-woty.png";
import sharonBollenbach from "@assets/sharon-bollenbach-woty.png";
import reetuGupta from "@assets/reetu-gupta-woty.png";
import stephanieLitt from "@assets/stephanie-litt-woty.png";
import treasaLeighBrown from "@assets/treasa-leigh-brown-woty.png";
import lindsayHousman from "@assets/lindsay-housman-woty.png";
import allyZeifman from "@assets/ally-zeifman-woty.png";

interface WomanOfTheYear {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

const womenOfTheYear: WomanOfTheYear[] = [
  {
    id: "teresa-resch",
    name: "Teresa Resch",
    title: "President, Toronto Tempo",
    bio: "Teresa Resch is the inaugural President of the WNBA Toronto franchise, which will begin play in 2026 season. Resch has been a leader in basketball development at the global scale for nearly 20 years. For 11 seasons she was a senior leader at the Toronto Raptors, bringing basketball to the forefront of Canadian sport.",
    image: teresaReschImage
  },
  {
    id: "maggie-kang",
    name: "Maggie Kang",
    title: "Filmmaker; KPop Demon Hunters",
    bio: "She shattered expectations with Kpop Demon Hunters, transforming a bold cultural vision into a global phenomenon that redefined animated storytelling. Blending Korean identity, girl power, and fearless creativity, her work proves that authenticity and representation are the future of global cinema.",
    image: maggieKangImage
  },
  {
    id: "madison-tevlin",
    name: "Madison Tevlin",
    title: "Media personality; advocate",
    bio: "With humour, confidence, and unapologetic authenticity, she's redefining what representation looks like—turning visibility into influence and advocacy into action. From viral sensation to cultural leader, her work across film, fashion, and media is opening doors for a more inclusive and empowered future.",
    image: madisonTevlinImage
  },
  {
    id: "diana-matheson",
    name: "Diana Matheson",
    title: "Co-founder; Northern Super League",
    bio: "She turned a single Olympic goal into a movement, transforming Canadian soccer from inspiration into infrastructure. As co-founder of the Northern Super League, she's redefining the future of women's sports and proving that vision, persistence, and inclusivity can build a legacy that changes the game for generations.",
    image: dianaMatheson
  },
  {
    id: "sharon-bollenbach",
    name: "Sharon Bollenbach",
    title: "Executive Director; FIFA World Cup 2026 at City of Toronto",
    bio: "Leading Toronto's preparations for the FIFA World Cup 2026, she's orchestrating one of the largest events in the city's history with precision, vision, and purpose. Her leadership is turning a global spotlight into a lasting legacy by showcasing Toronto's excellence on the world stage and redefining what it means to host greatness.",
    image: sharonBollenbach
  },
  {
    id: "reetu-gupta",
    name: "Reetu Gupta",
    title: "Ambassadress, The Gupta Group and The Easton's Group of Hotels",
    bio: "A trailblazer in business and beyond, she's redefining leadership through purpose, inclusion, and impact, building empires that empower others along the way. From transforming Canada's hospitality landscape to breaking barriers in professional sports ownership, her vision proves that equity and excellence can thrive side by side.",
    image: reetuGupta
  },
  {
    id: "stephanie-litt",
    name: "Stephanie Litt",
    title: "Co-founder and CEO; MycoFutures",
    bio: "She's transforming the materials industry with science, creativity, and purpose, proving that sustainability and innovation can thrive together. As co-founder and CEO of MycoFutures, she's turning fungi into the future of leather and redefining what responsible luxury looks like on a global scale.",
    image: stephanieLitt
  },
  {
    id: "treasa-leigh-brown",
    name: "Treasa Leigh Brown",
    title: "Founder, Professionelle House",
    bio: "She's redefining power, access, and community by building spaces where women (especially women of colour) can truly thrive. Through Professionelle House, she's transforming entrepreneurship into a movement rooted in equity, collaboration, and collective success.",
    image: treasaLeighBrown
  },
  {
    id: "lindsay-housman",
    name: "Lindsay Housman",
    title: "Founder, Hettas",
    bio: "She's rewriting the playbook for performance footwear by designing from the ground up for women. Through Hettas, she's merging science, sport, and equity to empower female athletes and set a new standard for innovation in women-centered design.",
    image: lindsayHousman
  },
  {
    id: "ally-zeifman-mamalider",
    name: "Ally Zeifman Mamalider",
    title: "President, Organic Traditions",
    bio: "She's redefining what it means to lead a legacy brand by merging heritage, innovation, and purpose to create a new era of wellness. Through her leadership at Organic Traditions, she's transforming a family-founded company into a global superfood powerhouse driven by integrity, inclusion, and impact.",
    image: allyZeifman
  }
];

export default function Audience() {
  const [expandedWoman, setExpandedWoman] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitQuestionMutation = useMutation({
    mutationFn: async ({ womanId, womanName, question }: { womanId: string; womanName: string; question: string }) => {
      const storedUserId = localStorage.getItem("currentUserId");
      const userId = storedUserId ? parseInt(storedUserId) : 1;
      
      const response = await apiRequest("/api/questions", "POST", {
        userId,
        panelName: `WOTY - ${womanName}`,
        question
      });
      
      return response;
    },
    onSuccess: (_, variables) => {
      setQuestions(prev => ({ ...prev, [variables.womanId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question submitted successfully!",
        description: "Your question has been submitted to our Woman of the Year.",
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

  const handleQuestionSubmit = (womanId: string, womanName: string) => {
    const question = questions[womanId];
    if (question?.trim()) {
      submitQuestionMutation.mutate({ womanId, womanName, question: question.trim() });
    }
  };

  const getCategoryColor = (title: string) => {
    if (title.includes('President') || title.includes('Tempo')) return 'from-pink-500 to-pink-600';
    if (title.includes('Filmmaker')) return 'from-purple-500 to-purple-600';
    if (title.includes('Media personality')) return 'from-orange-500 to-orange-600';
    if (title.includes('Northern Super League')) return 'from-blue-500 to-blue-600';
    if (title.includes('FIFA World Cup')) return 'from-teal-500 to-teal-600';
    if (title.includes('Ambassadress')) return 'from-indigo-500 to-indigo-600';
    if (title.includes('CEO') && title.includes('Myco')) return 'from-green-500 to-green-600';
    if (title.includes('Professionelle')) return 'from-red-500 to-red-600';
    if (title.includes('Hettas')) return 'from-yellow-500 to-yellow-600';
    if (title.includes('Organic')) return 'from-purple-500 to-purple-600';
    return 'from-purple-500 to-purple-600';
  };

  const getCategoryLabel = (title: string) => {
    if (title.includes('President') || title.includes('Tempo')) return 'Sports Leadership';
    if (title.includes('Filmmaker')) return 'Film & Entertainment';
    if (title.includes('Media personality')) return 'Media & Advocacy';
    if (title.includes('Northern Super League')) return 'Professional Sports';
    if (title.includes('FIFA World Cup')) return 'International Sports';
    if (title.includes('Ambassadress')) return 'Hospitality & Business';
    if (title.includes('CEO') && title.includes('Myco')) return 'Innovation & Sustainability';
    if (title.includes('Professionelle')) return 'Entrepreneurship';
    if (title.includes('Hettas')) return 'Product Innovation';
    if (title.includes('Organic')) return 'Wellness & Health';
    return 'Leadership';
  };

  return (
    <div className="min-h-screen pb-20 relative z-10 bg-gradient-to-br from-purple-500 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-4 sticky top-0 z-50">
        <div className="flex flex-col items-center text-center space-y-2">
          <img src={gloryWoty} alt="GLORY Women of the Year" className="h-20 w-auto drop-shadow-2xl" />
          <p className="text-sm text-white/90">2025 Nominees & Winners</p>
        </div>
      </header>

      <main className="pt-4 px-4">
        <div className="space-y-4">
          {/* GLORY WOTY Banner */}
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">GLORY Women of the Year 2025</h2>
              <p className="text-sm text-gray-600">
                Celebrating extraordinary women making a difference in their communities and industries
              </p>
            </CardContent>
          </Card>

          {/* Nominees Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 px-1">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">Nominees</h3>
            </div>

            {womenOfTheYear.map((woman) => (
              <Card key={woman.id} className="bg-white shadow-lg" data-testid={`card-woty-${woman.id}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0">
                      <img 
                        src={woman.image} 
                        alt={woman.name}
                        className="w-full h-full object-cover"
                        data-testid={`img-woty-${woman.id}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900" data-testid={`text-name-${woman.id}`}>{woman.name}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedWoman(expandedWoman === woman.id ? null : woman.id)}
                          data-testid={`button-toggle-${woman.id}`}
                        >
                          {expandedWoman === woman.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Badge className={`bg-gradient-to-r ${getCategoryColor(woman.title)} text-white border-0 mb-2`} data-testid={`badge-category-${woman.id}`}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        {getCategoryLabel(woman.title)}
                      </Badge>
                    </div>
                  </div>

                  {!expandedWoman || expandedWoman !== woman.id ? (
                    <p className="text-sm text-gray-700 line-clamp-2" data-testid={`text-preview-${woman.id}`}>
                      {woman.bio}
                    </p>
                  ) : null}

                  {/* Expanded View */}
                  {expandedWoman === woman.id && (
                    <div className="space-y-4 border-t pt-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">Title</p>
                        <p className="text-sm text-gray-900" data-testid={`text-title-${woman.id}`}>{woman.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">About</p>
                        <p className="text-sm text-gray-700" data-testid={`text-bio-${woman.id}`}>
                          {woman.bio}
                        </p>
                      </div>

                      {/* Ask Question Section */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <Send className="w-4 h-4 mr-2" />
                          Ask a Question
                        </h4>
                        <div className="space-y-3">
                          <Textarea
                            placeholder={`Ask ${woman.name} a question...`}
                            value={questions[woman.id] || ""}
                            onChange={(e) => setQuestions(prev => ({ ...prev, [woman.id]: e.target.value }))}
                            className="resize-none"
                            rows={3}
                            data-testid={`input-question-${woman.id}`}
                          />
                          <Button
                            onClick={() => handleQuestionSubmit(woman.id, woman.name)}
                            disabled={!questions[woman.id]?.trim() || submitQuestionMutation.isPending}
                            size="sm"
                            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                            data-testid={`button-submit-${woman.id}`}
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
