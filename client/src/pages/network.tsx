import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Users, Circle, MessageSquare, Edit, Upload, Trash2, FileText, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import type { User, MessageWithSender, Survey } from "@shared/schema";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (1)_1751985925815.png";
import bobParkPhoto from "@assets/Bob Park_1752262505617.png";
import andiPetrilloPhoto from "@assets/Andi Petrillo_1752262505617.png";
import saroyaTinkerPhoto from "@assets/Saroya Tinker_1752262505617.png";
import dianaMatheson1Photo from "@assets/Diana Matheson_1752262505617.png";
import dianaMatheson2Photo from "@assets/Diana Matheson (2)_1752262505617.png";
import jesseMartschPhoto from "@assets/Jesse Marsch_1752262505617.png";
import ellenHyslopPhoto from "@assets/Ellen Hyslop_1752262505617.png";
import sharonBollenbachPhoto from "@assets/Sharon Bollenbach_1752262505617.png";
import kyleMcMannPhoto from "@assets/Kyle McMann_1752262505617.png";
import dwayneDeRosarioPhoto from "@assets/Dwayne De Rosario_1752262505617.png";
import teresaReschPhoto from "@assets/Teresa Resch_1752262505617.png";
import marcusHansonPhoto from "@assets/Marcus Hanson_1752262505617.png";
import lanceChungPhoto from "@assets/Lance Chung_1752260577401.png";
import anastasiaBucsisPhoto from "@assets/Anastasia Bucsis_1752260577401.png";
import alysonWalkerPhoto from "@assets/Alyson Walker_1752260577401.png";

export default function Network() {
  const [newMessage, setNewMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    jobTitle: "",
    company: "",
    avatar: ""
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number>(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Initialize current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setCurrentUserId(user?.id || 1);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserId");
        setCurrentUserId(1);
      }
    }

    // Listen for user updates
    const handleUserUpdated = (event: CustomEvent) => {
      const updatedUser = event.detail;
      setCurrentUser(updatedUser);
      setCurrentUserId(updatedUser?.id || 1);
    };

    window.addEventListener('userUpdated', handleUserUpdated as EventListener);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdated as EventListener);
    };
  }, []);

  const { data: groupMessages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/group-chat/messages"],
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const { data: eventAttendees = [], isLoading: attendeesLoading } = useQuery<User[]>({
    queryKey: ["/api/event-attendees"],
  });

  // Query to get fresh user data from the server
  const { data: freshUserData, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: [`/api/users/${currentUserId}`],
    enabled: !!currentUserId,
  });

  // Query to get latest surveys
  const { data: surveys = [] } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
  });

  // If user doesn't exist in database, reset to user ID 1
  useEffect(() => {
    if (userError && currentUserId !== 1) {
      console.log("User not found, resetting to user ID 1");
      setCurrentUserId(1);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("currentUserId");
    }
  }, [userError, currentUserId]);

  // Use fresh data from server or fallback to localStorage data
  const displayUser = freshUserData || currentUser;



  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("/api/group-chat/messages", "POST", {
        content,
        senderId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages"] });
      setNewMessage("");
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest(`/api/group-chat/messages/${messageId}`, "DELETE", {
        adminUserId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages"] });
    },
  });

  // Check if current user is admin (has @glory.media email)
  const isAdmin = displayUser?.email?.endsWith('@glory.media') || false;

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  // Initialize edit form when user data changes
  useEffect(() => {
    if (displayUser && !isEditingProfile) {
      setEditForm({
        fullName: displayUser.fullName || "",
        jobTitle: displayUser.jobTitle || "",
        company: displayUser.company || "",
        avatar: displayUser.avatar || ""
      });
    }
  }, [displayUser, isEditingProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: typeof editForm) => {
      const response = await apiRequest(`/api/users/${currentUserId}`, "PATCH", updatedData);
      return response;
    },
    onSuccess: (updatedUser) => {
      // Update localStorage with the updated user data
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Dispatch custom event to notify other parts of the app
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
      
      // Refresh all relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUserId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/event-attendees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      setIsEditingProfile(false);
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setEditForm(prev => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const formatMessageTime = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Speaker photo mapping for Network attendees
  const speakerPhotos: Record<string, string> = {
    "Bob Park": bobParkPhoto,
    "Andi Petrillo": andiPetrilloPhoto,
    "Saroya Tinker": saroyaTinkerPhoto,
    "Diana Matheson": dianaMatheson1Photo,
    "Jesse Marsch": jesseMartschPhoto,
    "Ellen Hyslop": ellenHyslopPhoto,
    "Sharon Bollenbach": sharonBollenbachPhoto,
    "Kyle McMann": kyleMcMannPhoto,
    "Dwayne De Rosario": dwayneDeRosarioPhoto,
    "Teresa Resch": teresaReschPhoto,
    "Marcus Hanson": marcusHansonPhoto,
    "Lance Chung": lanceChungPhoto,
    "Anastasia Bucsis": anastasiaBucsisPhoto,
    "Alyson Walker": alysonWalkerPhoto,
  };

  // Get user photo URL based on their name
  const getUserPhoto = (fullName: string) => {
    if (!fullName) return "";
    // First check if we have a speaker photo
    if (speakerPhotos[fullName]) {
      return speakerPhotos[fullName];
    }
    // Fallback to generic photo path
    const photoFileName = fullName.toLowerCase().replace(/\s+/g, '-') + '.jpg';
    return `/photos/${photoFileName}`;
  };

  // Generate consistent color for user avatars
  const getUserAvatarColor = (name: string) => {
    if (!name) return 'from-gray-500 to-gray-600';
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
    return colors[colorIndex];
  };

  const getUserRoleBadge = (userRole: string, email?: string) => {
    // Check for @glory.media emails and override role
    if (email && email.endsWith('@glory.media')) {
      return { label: "GLORY Team", color: "bg-orange-600 text-white border-orange-600" };
    }
    
    switch (userRole) {
      case "panelist":
        return { label: "Panelist", color: "bg-blue-600 text-white" };
      case "moderator":
        return { label: "Moderator", color: "bg-purple-600 text-white" };
      case "glory_team":
        return { label: "GLORY Team", color: "bg-orange-600 text-white border-orange-600" };
      default:
        return { label: "Attendee", color: "bg-gray-600 text-white" };
    }
  };

  // Get the latest survey
  const latestSurvey = surveys.find(survey => survey.status === 'active') || surveys[surveys.length - 1];

  const handleSurveyClick = () => {
    if (latestSurvey) {
      setIsSurveyDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Event Chat</h1>
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

      {/* User Profile Display */}
      {userLoading ? (
        <div className="bg-white shadow-sm mx-4 mt-4 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ) : displayUser ? (
        <div className="bg-white shadow-sm mx-4 mt-4 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={displayUser.avatar} 
                    alt={displayUser.fullName}
                  />
                  <AvatarFallback 
                    className={`text-white text-lg font-semibold bg-gradient-to-br ${getUserAvatarColor(displayUser.fullName)}`}
                  >
                    {getUserInitials(displayUser.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{displayUser.fullName || "User"}</h2>
                {displayUser.jobTitle && (
                  <p className="text-sm text-gray-600">{displayUser.jobTitle}</p>
                )}
                {displayUser.company && (
                  <p className="text-sm text-gray-500">{displayUser.company}</p>
                )}
                {displayUser.email && (
                  <p className="text-xs text-gray-400 mt-1">{displayUser.email}</p>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  <Badge 
                    className={`text-xs ${getUserRoleBadge(displayUser.userRole || "attendee", displayUser.email).color}`}
                  >
                    {getUserRoleBadge(displayUser.userRole || "attendee", displayUser.email).label}
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-shrink-0 flex space-x-2">
                {/* Survey Button */}
                {latestSurvey && (
                  <Dialog open={isSurveyDialogOpen} onOpenChange={setIsSurveyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3">
                        <FileText className="h-4 w-4 mr-1" />
                        Survey
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <FileText className="w-5 h-5" />
                          <span>{latestSurvey.title}</span>
                        </DialogTitle>
                        <DialogDescription>
                          {latestSurvey.description}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Survey Available</span>
                          </div>
                          <p className="text-sm text-blue-700 mb-3">
                            Please take a moment to complete this survey. Your feedback is important to us!
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-blue-600">
                              Type: {latestSurvey.type === 'during_event' ? 'During Event' : 'Post Event'}
                            </div>
                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                              {latestSurvey.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-amber-600" />
                            <span className="font-medium text-amber-900">Email Follow-up</span>
                          </div>
                          <p className="text-sm text-amber-700">
                            If you can't complete the survey now, it will also be sent to your email following the event.
                          </p>
                        </div>

                        <div className="flex space-x-3 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsSurveyDialogOpen(false)}
                            className="flex-1"
                          >
                            Later
                          </Button>
                          <Button 
                            onClick={() => {
                              // For now, just close the dialog - in a real implementation, 
                              // this would navigate to the survey or open a survey form
                              setIsSurveyDialogOpen(false);
                              alert("Survey feature will be fully implemented in the next phase. Thank you for your interest!");
                            }}
                            className="flex-1"
                          >
                            Take Survey
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Edit Profile Button */}
                <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your profile information and photo. Changes will be saved automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Avatar Upload */}
                      <div className="grid gap-2">
                        <Label htmlFor="avatar">Profile Photo</Label>
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage 
                              src={editForm.avatar} 
                              alt={editForm.fullName}
                            />
                            <AvatarFallback 
                              className={`text-white text-lg font-semibold bg-gradient-to-br ${getUserAvatarColor(editForm.fullName)}`}
                            >
                              {getUserInitials(editForm.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                              id="avatar-upload"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => document.getElementById('avatar-upload')?.click()}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Full Name */}
                      <div className="grid gap-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm(prev => ({...prev, fullName: e.target.value}))}
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Job Title */}
                      <div className="grid gap-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={editForm.jobTitle}
                          onChange={(e) => setEditForm(prev => ({...prev, jobTitle: e.target.value}))}
                          placeholder="Enter your job title"
                        />
                      </div>

                      {/* Company */}
                      <div className="grid gap-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={editForm.company}
                          onChange={(e) => setEditForm(prev => ({...prev, company: e.target.value}))}
                          placeholder="Enter your company"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleUpdateProfile}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm mx-4 mt-4 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              {/* This fallback is no longer needed since we get user directly from localStorage */}
              {currentUser ? (
                <>
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage 
                        src={currentUser.avatar} 
                        alt={currentUser.fullName}
                      />
                      <AvatarFallback className={`text-white text-lg font-semibold bg-gradient-to-br ${getUserAvatarColor(currentUser.fullName)}`}>
                        {getUserInitials(currentUser.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{currentUser.fullName}</h2>
                    {currentUser.jobTitle && <p className="text-sm text-gray-600">{currentUser.jobTitle}</p>}
                    {currentUser.company && <p className="text-sm text-gray-500">{currentUser.company}</p>}
                    {currentUser.email && <p className="text-xs text-gray-400 mt-1">{currentUser.email}</p>}
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge 
                        className={`text-xs ${getUserRoleBadge(currentUser.userRole || "attendee", currentUser.email).color}`}
                      >
                        {getUserRoleBadge(currentUser.userRole || "attendee", currentUser.email).label}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <p>Please log in to view your profile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="px-4 mt-4 space-y-6">
        {/* Group Chat Section */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Group Discussion</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area with Fixed Height and Scrolling */}
            <div className="h-80 overflow-y-auto mb-4 pr-2">
              <div className="space-y-3">
                {messagesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-gray-500">Loading messages...</div>
                  </div>
                ) : groupMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  groupMessages.map((message) => (
                    <div key={message.id} className="flex space-x-3 group">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage 
                          src={message.sender?.avatar || getUserPhoto(message.sender?.fullName || "")} 
                          alt={message.sender?.fullName || "User"}
                        />
                        <AvatarFallback className={`text-xs bg-gradient-to-br ${getUserAvatarColor(message.sender?.fullName || "")} text-white`}>
                          {getUserInitials(message.sender?.fullName || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {message.sender?.fullName || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatMessageTime(message.createdAt || new Date())}
                            </span>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteMessageMutation.mutate(message.id)}
                              disabled={deleteMessageMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 break-words">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-h-[44px] max-h-32 resize-none"
                rows={1}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                size="sm"
                className="px-4 py-2 h-11"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Event Attendees Section */}
        <div className="pb-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Event Attendees</span>
                <Badge variant="outline">{eventAttendees.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendeesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="text-gray-500">Loading attendees...</div>
                </div>
              ) : (
                <div className="h-96 overflow-y-auto pr-2">
                  <div className="space-y-3">
                    {eventAttendees.map((attendee) => (
                      <div key={attendee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow w-full">
                        <div className="flex items-start space-x-4">
                          <div className="relative flex-shrink-0">
                            <Avatar className="w-16 h-16">
                              <AvatarImage 
                                src={attendee.avatar || getUserPhoto(attendee.fullName)} 
                                alt={attendee.fullName}
                              />
                              <AvatarFallback className={`bg-gradient-to-br ${getUserAvatarColor(attendee.fullName)} text-white font-semibold text-lg`}>
                                {getUserInitials(attendee.fullName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">{attendee.fullName}</h4>
                                <p className="text-sm text-gray-600 mb-2">{attendee.jobTitle}</p>
                                <p className="text-sm text-gray-500 mb-3">{attendee.companyName}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    className={`text-xs ${getUserRoleBadge(attendee.userRole || "attendee", attendee.email).color}`}
                                  >
                                    {getUserRoleBadge(attendee.userRole || "attendee", attendee.email).label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}