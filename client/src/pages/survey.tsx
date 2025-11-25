import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SurveyWithQuestions, SurveyQuestion } from "@shared/schema";

const surveyResponseSchema = z.object({
  answers: z.array(z.object({
    questionId: z.number(),
    answerText: z.string().optional(),
    selectedOption: z.string().optional(),
  }))
});

export default function Survey() {
  const { surveyId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Get current user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      setCurrentUserId(parseInt(storedUserId));
    }
  }, []);

  // Check if user has already responded
  const { data: userResponse } = useQuery({
    queryKey: [`/api/surveys/${surveyId}/user-response/${currentUserId}`],
    enabled: !!(surveyId && currentUserId),
  });

  // Get survey with questions
  const { data: survey, isLoading: surveyLoading } = useQuery<SurveyWithQuestions>({
    queryKey: [`/api/surveys/${surveyId}`],
    enabled: !!surveyId,
  });

  const form = useForm({
    resolver: zodResolver(surveyResponseSchema),
    defaultValues: {
      answers: []
    },
  });

  const submitSurveyMutation = useMutation({
    mutationFn: async (responses: { questionId: number; answerText?: string; selectedOption?: string }[]) => {
      return await apiRequest(`/api/surveys/${surveyId}/responses`, "POST", {
        userId: currentUserId,
        answers: responses
      });
    },
    onSuccess: () => {
      toast({
        title: "Survey submitted successfully!",
        description: "Thank you for your feedback. Your responses have been recorded.",
      });
      setHasSubmitted(true);
      queryClient.invalidateQueries({ queryKey: [`/api/surveys/${surveyId}/user-response/${currentUserId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit survey",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!survey?.questions) return;

    const responses = survey.questions.map(question => ({
      questionId: question.id,
      answerText: question.questionType === 'text' ? answers[question.id] : undefined,
      selectedOption: question.questionType !== 'text' ? answers[question.id] : undefined,
    })).filter(response => response.answerText || response.selectedOption);

    // Validate required questions
    const requiredQuestions = survey.questions.filter(q => q.isRequired);
    const missingRequired = requiredQuestions.filter(q => !answers[q.id]);

    if (missingRequired.length > 0) {
      toast({
        title: "Missing required fields",
        description: "Please answer all required questions before submitting.",
        variant: "destructive",
      });
      return;
    }

    submitSurveyMutation.mutate(responses);
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const currentAnswer = answers[question.id] || '';

    switch (question.questionType) {
      case 'text':
        return (
          <Textarea
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      case 'multiple_choice':
        const options = question.options as string[] || [];
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            className="space-y-2"
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'rating':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
            className="flex space-x-4"
          >
            {[1, 2, 3, 4, 5].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`${question.id}-${rating}`} />
                <Label htmlFor={`${question.id}-${rating}`} className="font-normal">
                  {rating}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return (
          <Input
            placeholder="Type your answer here..."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          />
        );
    }
  };

  if (surveyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey Not Found</h2>
            <p className="text-gray-600 mb-4">The survey you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => setLocation("/network")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Network
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((userResponse as any)?.hasResponded || hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Survey Already Completed</h2>
            <p className="text-gray-600 mb-4">Thank you! You have already submitted your response to this survey.</p>
            <Button onClick={() => setLocation("/network")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Network
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <FileText className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">{survey.title}</CardTitle>
            </div>
            {survey.description && (
              <p className="text-gray-600">{survey.description}</p>
            )}
            <div className="flex items-center justify-center space-x-4 mt-4">
              <div className="text-sm text-gray-500">
                Type: {survey.type === 'during_event' ? 'During Event' : 'Post Event'}
              </div>
              <div className="text-sm text-gray-500">
                Questions: {survey.questions?.length || 0}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Questions */}
        <div className="space-y-6">
          {survey.questions?.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-500 mt-1">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {question.questionText}
                        {question.isRequired && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </h3>
                      {renderQuestion(question)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Button */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setLocation("/network")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Network
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={submitSurveyMutation.isPending}
                className="min-w-[120px]"
              >
                {submitSurveyMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Submit Survey</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}