import { useState } from "react";
import { Settings, Users, BarChart3, Shield, Calendar, FileText, Plus, Mail, Eye, Edit, Trash2, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertSurveySchema, insertSurveyQuestionSchema, type Survey, type SurveyWithQuestions } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (1)_1751985925815.png";

const surveyFormSchema = insertSurveySchema.extend({
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
});

const questionFormSchema = insertSurveyQuestionSchema.extend({
  options: z.array(z.string()).optional(),
});

type SurveyFormData = z.infer<typeof surveyFormSchema>;
type QuestionFormData = z.infer<typeof questionFormSchema>;

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyWithQuestions | null>(null);
  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Survey queries
  const { data: surveys = [] } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
  });

  const { data: surveyStats } = useQuery({
    queryKey: ["/api/surveys", selectedSurvey?.id, "stats"],
    enabled: !!selectedSurvey?.id,
  });

  // Analytics queries
  const { data: analyticsSummary } = useQuery({
    queryKey: ["/api/analytics/summary"],
  });

  const { data: dailyMetrics = [] } = useQuery({
    queryKey: ["/api/analytics/daily"],
  });

  // Survey form
  const surveyForm = useForm<SurveyFormData>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "during_event",
      status: "draft",
      emailSubject: "",
      emailBody: "",
    },
  });

  // Question form
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: "",
      questionType: "text",
      isRequired: false,
      order: 1,
      options: [],
    },
  });

  // Create survey mutation
  const createSurveyMutation = useMutation({
    mutationFn: async (data: SurveyFormData) => {
      return await apiRequest("/api/surveys", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Survey created successfully!",
        description: "You can now add questions to your survey.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      setShowCreateSurvey(false);
      surveyForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating survey",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData & { surveyId: number }) => {
      const { surveyId, options, ...questionData } = data;
      const payload = {
        ...questionData,
        options: options && options.length > 0 ? options : null,
      };
      return await apiRequest(`/api/surveys/${surveyId}/questions`, "POST", payload);
    },
    onSuccess: () => {
      toast({
        title: "Question added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      setShowAddQuestion(false);
      questionForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error adding question",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete survey mutation
  const deleteSurveyMutation = useMutation({
    mutationFn: async (surveyId: number) => {
      return await apiRequest(`/api/surveys/${surveyId}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Survey deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      setSelectedSurvey(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting survey",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitSurvey = (data: SurveyFormData) => {
    createSurveyMutation.mutate(data);
  };

  const onSubmitQuestion = (data: QuestionFormData) => {
    if (!selectedSurvey) return;
    
    const options = data.questionType === 'multiple_choice' 
      ? (data.options || []).filter(opt => opt.trim() !== '')
      : [];
    
    addQuestionMutation.mutate({
      ...data,
      surveyId: selectedSurvey.id,
      options,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="w-16 h-8">
            <img 
              src={gloryLogo} 
              alt="GLORY Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="surveys">Surveys</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-semibold">342</h3>
                  <p className="text-sm text-gray-600">Total Attendees</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="text-xl font-semibold">{surveys.length}</h3>
                  <p className="text-sm text-gray-600">Active Surveys</p>
                </CardContent>
              </Card>
            </div>

            {/* System Status */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">API Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Survey System</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Email Service</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      Ready
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveys" className="space-y-6">
            {/* Survey Management Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Survey Management</h2>
              <Dialog open={showCreateSurvey} onOpenChange={setShowCreateSurvey}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Survey
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Survey</DialogTitle>
                    <DialogDescription>
                      Create a survey to gather feedback from attendees.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...surveyForm}>
                    <form onSubmit={surveyForm.handleSubmit(onSubmitSurvey)} className="space-y-4">
                      <FormField
                        control={surveyForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Survey title..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={surveyForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Survey description..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={surveyForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Survey Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="during_event">During Event</SelectItem>
                                <SelectItem value="post_event">Post Event</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={surveyForm.control}
                        name="emailSubject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Subject (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your feedback is important..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateSurvey(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createSurveyMutation.isPending}>
                          {createSurveyMutation.isPending ? "Creating..." : "Create Survey"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Surveys List */}
            <div className="space-y-4">
              {surveys.map((survey) => (
                <Card key={survey.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedSurvey(survey as SurveyWithQuestions)}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{survey.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={survey.type === 'during_event' ? 'default' : 'secondary'}>
                            {survey.type === 'during_event' ? 'During Event' : 'Post Event'}
                          </Badge>
                          <Badge variant={
                            survey.status === 'active' ? 'default' : 
                            survey.status === 'completed' ? 'secondary' : 'outline'
                          }>
                            {survey.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSurveyMutation.mutate(survey.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {surveys.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No surveys yet</h3>
                    <p className="text-gray-600 mb-4">Create your first survey to start collecting feedback.</p>
                    <Button onClick={() => setShowCreateSurvey(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Survey
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Survey Details Modal */}
            {selectedSurvey && (
              <Dialog open={!!selectedSurvey} onOpenChange={() => setSelectedSurvey(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedSurvey.title}</DialogTitle>
                    <DialogDescription>{selectedSurvey.description}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Questions Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Questions</h4>
                        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Question
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Question</DialogTitle>
                            </DialogHeader>
                            <Form {...questionForm}>
                              <form onSubmit={questionForm.handleSubmit(onSubmitQuestion)} className="space-y-4">
                                <FormField
                                  control={questionForm.control}
                                  name="questionText"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question</FormLabel>
                                      <FormControl>
                                        <Textarea placeholder="Enter your question..." {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={questionForm.control}
                                  name="questionType"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Question Type</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="text">Text Answer</SelectItem>
                                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                          <SelectItem value="rating">Rating (1-5)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {questionForm.watch('questionType') === 'multiple_choice' && (
                                  <FormField
                                    control={questionForm.control}
                                    name="options"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Options (one per line)</FormLabel>
                                        <FormControl>
                                          <Textarea 
                                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                                            onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                                            value={field.value?.join('\n') || ''}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}

                                <FormField
                                  control={questionForm.control}
                                  name="isRequired"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>Required question</FormLabel>
                                      </div>
                                    </FormItem>
                                  )}
                                />

                                <div className="flex justify-end space-x-2">
                                  <Button type="button" variant="outline" onClick={() => setShowAddQuestion(false)}>
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={addQuestionMutation.isPending}>
                                    {addQuestionMutation.isPending ? "Adding..." : "Add Question"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedSurvey.questions?.map((question, index) => (
                          <Card key={question.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium">
                                    {index + 1}. {question.questionText}
                                    {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline">{question.questionType}</Badge>
                                    {question.options && (
                                      <span className="text-xs text-gray-500">
                                        {question.options.length} options
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )) || <p className="text-gray-500 text-center py-8">No questions added yet</p>}
                      </div>
                    </div>

                    {/* Survey Actions */}
                    <div className="flex justify-between border-t pt-4">
                      <Button variant="outline" onClick={() => setSelectedSurvey(null)}>
                        Close
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Send to Attendees
                        </Button>
                        <Button>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Survey
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Platform Analytics</h3>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Total Users</h4>
                  <p className="text-2xl font-bold">{analyticsSummary?.totalUsers || 0}</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Active Today</h4>
                  <p className="text-2xl font-bold">{analyticsSummary?.activeUsersToday || 0}</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Total Messages</h4>
                  <p className="text-2xl font-bold">{analyticsSummary?.totalMessages || 0}</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Avg Session</h4>
                  <p className="text-2xl font-bold">
                    {analyticsSummary?.avgSessionDuration 
                      ? `${Math.floor(analyticsSummary.avgSessionDuration / 60)}m ${analyticsSummary.avgSessionDuration % 60}s`
                      : '0s'
                    }
                  </p>
                </Card>
              </div>

              {/* User Engagement Chart */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">User Engagement (Last 7 Days)</h4>
                {analyticsSummary?.userEngagement && analyticsSummary.userEngagement.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsSummary.userEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="activeUsers" 
                          stroke="#8884d8" 
                          name="Active Users"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="messages" 
                          stroke="#82ca9d" 
                          name="Messages"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No engagement data available yet
                  </div>
                )}
              </Card>

              {/* Popular Pages */}
              <Card className="p-4">
                <h4 className="font-medium mb-4">Popular Pages</h4>
                {analyticsSummary?.popularPages && analyticsSummary.popularPages.length > 0 ? (
                  <div className="space-y-2">
                    {analyticsSummary.popularPages.map((page, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span className="font-medium">{page.page}</span>
                        <span className="text-sm text-muted-foreground">{page.views} views</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No page view data available yet</div>
                )}
              </Card>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Connection Statistics</h4>
                  <p className="text-xl font-bold">{analyticsSummary?.totalConnections || 0}</p>
                  <p className="text-sm text-muted-foreground">Total connections made</p>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Daily Metrics</h4>
                  {dailyMetrics.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Today's Activity:</span> {dailyMetrics[dailyMetrics.length - 1]?.activeUsers || 0} users
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Page Views:</span> {dailyMetrics[dailyMetrics.length - 1]?.totalPageViews || 0}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">New Users:</span> {dailyMetrics[dailyMetrics.length - 1]?.newUsers || 0}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No daily metrics available</p>
                  )}
                </Card>
              </div>

              {/* Survey Analytics Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Survey Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {surveys.length > 0 ? (
                    <div className="space-y-4">
                      {surveys.map((survey) => (
                        <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{survey.title}</h4>
                            <p className="text-sm text-gray-600">{survey.status}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSurvey(survey as SurveyWithQuestions)}
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Stats
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No survey data available yet</p>
                      <p className="text-sm text-gray-500">Create and deploy surveys to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground">
                <p>Analytics are updated in real-time as users interact with the platform.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}