import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import gloryLogo from "@assets/GLORY WOTY_1762527738446.png";

interface WomanOfTheYear {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
}

const womenOfTheYear: WomanOfTheYear[] = [];

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
    onError: (error) => {
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

  return (
    <div className="min-h-screen pb-20 relative z-10">
      {/* Header */}
      <header className="glass-card border-b border-white/20 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-orange rounded-full flex items-center justify-center shadow-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-800">Meet the WOTY</h1>
          </div>
          <div className="w-32 h-14">
            <img 
              src={gloryLogo} 
              alt="GLORY Women of the Year Logo" 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        <div className="space-y-6">
          {/* Women of the Year Cards */}
          <div className="space-y-4">
            {womenOfTheYear.length === 0 ? (
              <Card>
                <CardContent className="pt-6 pb-6 text-center">
                  <p className="text-gray-600">
                    Women of the Year information will be updated soon.
                  </p>
                </CardContent>
              </Card>
            ) : (
              womenOfTheYear.map((woman) => (
              <Card key={woman.id} data-testid={`card-woty-${woman.id}`}>
                <CardContent className="pt-6">
                  {/* Collapsed View - Image, Name and Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <img 
                        src={woman.image} 
                        alt={woman.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        data-testid={`img-woty-${woman.id}`}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900" data-testid={`text-name-${woman.id}`}>
                          {woman.name}
                        </h3>
                        <p className="text-sm text-gray-600" data-testid={`text-title-${woman.id}`}>
                          {woman.title}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedWoman(expandedWoman === woman.id ? null : woman.id)}
                      data-testid={`button-toggle-${woman.id}`}
                    >
                      {expandedWoman === woman.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded View - Bio and Question */}
                  {expandedWoman === woman.id && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      <div>
                        <p className="text-sm text-gray-700" data-testid={`text-bio-${woman.id}`}>
                          {woman.bio}
                        </p>
                      </div>

                      {/* Ask Question Section */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Ask our WOTY a question</h4>
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
                            className="w-full"
                            data-testid={`button-submit-question-${woman.id}`}
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
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
