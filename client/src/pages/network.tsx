import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Send, Users, Circle, MessageSquare, Edit, Upload, Trash2, FileText, CheckCircle, User as UserIcon, Share2, ZoomIn, X, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import lanceChungPhoto from "@assets/Lance Chung_1752262505617.png";
import anastasiaBucsisPhoto from "@assets/Anastasia Bucsis_1752262505617.png";
import alysonWalkerPhoto from "@assets/Alyson Walker_1752262505617.png";

interface NetworkProps {
  currentUser: User | null;
}

export default function Network({ currentUser }: NetworkProps) {
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSurveyDialogOpen, setIsSurveyDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isUserProfileDialogOpen, setIsUserProfileDialogOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState("");
  const [selectedPhotoUser, setSelectedPhotoUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    jobTitle: "",
    company: "",
    avatar: ""
  });
  const currentUserId = currentUser?.id || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Initialize edit form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        fullName: currentUser.fullName || "",
        jobTitle: currentUser.jobTitle || "",
        company: currentUser.company || "",
        avatar: currentUser.avatar || ""
      });
    }
  }, [currentUser]);

  const { data: groupMessages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/group-chat/messages", currentUserId],
    queryFn: async () => {
      const url = currentUserId 
        ? `/api/group-chat/messages?userId=${currentUserId}`
        : "/api/group-chat/messages";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
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

  // Fetch selected user data for profile dialog
  const { data: selectedUser } = useQuery({
    queryKey: [`/api/users/${selectedUserId}`],
    enabled: !!selectedUserId && isUserProfileDialogOpen,
  });

  const { toast } = useToast();

  // Social sharing functions
  const shareOnLinkedIn = () => {
    const text = "Join me at the 2025 GLORY Sports Summit! An amazing networking event for sports industry professionals.";
    const url = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareOnInstagram = () => {
    // Instagram doesn't have direct URL sharing, so we'll copy text to clipboard
    const text = "Join me at the 2025 GLORY Sports Summit! An amazing networking event for sports industry professionals. #GLORYSportsSummit #Networking #SportsIndustry";
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard!",
        description: "Text copied! Now you can paste it in your Instagram story or post.",
      });
    });
  };

  // Function to open user profile dialog
  const openUserProfile = (userId: number) => {
    setSelectedUserId(userId);
    setIsUserProfileDialogOpen(true);
  };

  const openPhotoViewer = (photoUrl: string, user: User) => {
    setSelectedPhotoUrl(photoUrl);
    setSelectedPhotoUser(user);
    setIsPhotoViewerOpen(true);
  };



  // Use fresh data from server or fallback to prop data
  const displayUser = freshUserData || currentUser;



  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentUserId) {
        throw new Error("User not authenticated");
      }
      await apiRequest("/api/group-chat/messages", "POST", {
        content,
        senderId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages", currentUserId] });
      setNewMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest(`/api/group-chat/messages/${messageId}`, "DELETE", {
        adminUserId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages", currentUserId] });
    },
  });

  // Message reactions
  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
      await apiRequest(`/api/messages/${messageId}/reactions`, "POST", {
        userId: currentUserId,
        emoji
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages", currentUserId] });
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: number; emoji: string }) => {
      await apiRequest(`/api/messages/${messageId}/reactions`, "DELETE", {
        userId: currentUserId,
        emoji
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages", currentUserId] });
    },
  });

  // Check if current user is admin (has @glory.media email)
  const isAdmin = displayUser?.email?.endsWith('@glory.media') || false;

  const handleSendMessage = () => {
    if (newMessage.trim() && currentUserId) {
      sendMessageMutation.mutate(newMessage.trim());
    } else if (!currentUserId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send messages",
        variant: "destructive",
      });
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

      {/* Compact User Profile Display */}
      {userLoading ? (
        <div className="bg-white shadow-sm mx-4 mt-4 rounded-lg overflow-hidden">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (displayUser || currentUser) ? (
        <div className="bg-white shadow-sm mx-4 mt-4 rounded-lg overflow-hidden">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => openPhotoViewer(
                    displayUser?.avatar || getUserPhoto(displayUser?.fullName || ""), 
                    displayUser || currentUser!
                  )}
                >
                  <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200 avatar-image-flat">
                    <AvatarImage 
                      src={displayUser?.avatar || getUserPhoto(displayUser?.fullName || "")} 
                      alt={displayUser?.fullName}
                      loading="lazy"
                    />
                    <AvatarFallback 
                      className={`text-white text-sm font-semibold bg-gradient-to-br ${getUserAvatarColor(displayUser?.fullName || "")}`}
                    >
                      {getUserInitials(displayUser?.fullName || "")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {displayUser?.fullName}
                  </h3>
                </div>
              </div>
              
              {/* Survey Button */}
              {latestSurvey && (
                <Dialog open={isSurveyDialogOpen} onOpenChange={setIsSurveyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white border-0 flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Survey</span>
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
                              setIsSurveyDialogOpen(false);
                              if (latestSurvey) {
                                setLocation(`/survey/${latestSurvey.id}`);
                              }
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
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Profile Dialog */}
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

                      {/* LinkedIn Profile (read-only for LinkedIn users) */}
                      {(displayUser.linkedinId || displayUser.linkedinProfileUrl) && (
                        <div className="grid gap-2">
                          <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="linkedinProfile"
                              value={displayUser.linkedinProfileUrl || "Connected via LinkedIn"}
                              disabled
                              className="bg-gray-100 text-gray-600 flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                if (displayUser.linkedinProfileUrl && displayUser.linkedinProfileUrl.includes('linkedin.com/in/') && !displayUser.linkedinProfileUrl.includes('vKYpQ5vr3z')) {
                                  window.open(displayUser.linkedinProfileUrl, '_blank');
                                } else {
                                  // Search for user on LinkedIn by name
                                  const searchQuery = encodeURIComponent(displayUser.fullName || "");
                                  const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${searchQuery}`;
                                  window.open(searchUrl, '_blank');
                                }
                              }}
                            >
                              Find Profile
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            LinkedIn profile is automatically synced from your LinkedIn account
                          </p>
                        </div>
                      )}
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

      <main className="px-4 mt-4 space-y-6">
        {/* Group Chat Section */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Group Discussion</span>
              </CardTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900 mb-3">Share on Social Media</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-blue-600 border-blue-100 hover:bg-blue-50"
                      onClick={shareOnLinkedIn}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-blue-600 border-blue-100 hover:bg-blue-50"
                      onClick={shareOnFacebook}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-pink-600 border-pink-100 hover:bg-pink-50"
                      onClick={shareOnInstagram}
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
                      <div className="relative group">
                        <Avatar 
                          className="w-8 h-8 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                          onClick={() => message.sender?.id && openUserProfile(message.sender.id)}
                        >
                          <AvatarImage 
                            src={message.sender?.avatar || getUserPhoto(message.sender?.fullName || "")} 
                            alt={message.sender?.fullName || "User"}
                          />
                          <AvatarFallback className={`text-xs bg-gradient-to-br ${getUserAvatarColor(message.sender?.fullName || "")} text-white`}>
                            {getUserInitials(message.sender?.fullName || "")}
                          </AvatarFallback>
                        </Avatar>
                        {/* Small photo zoom button for messages */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -top-1 -right-1 w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 hover:bg-black/80 text-white rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            const photoUrl = message.sender?.avatar || getUserPhoto(message.sender?.fullName || "");
                            if (photoUrl && message.sender) {
                              openPhotoViewer(photoUrl, message.sender);
                            }
                          }}
                        >
                          <ZoomIn className="w-2 h-2" />
                        </Button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span 
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                              onClick={() => message.sender?.id && openUserProfile(message.sender.id)}
                            >
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
                        
                        {/* Message Reactions */}
                        <div className="mt-2 flex items-center space-x-1">
                          {/* Reaction buttons */}
                          <div className="flex space-x-1">
                            {['👍', '❤️', '😊', '😮', '👏'].map((emoji) => (
                              <Button
                                key={emoji}
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-gray-100 transition-colors text-sm"
                                onClick={() => {
                                  if (!currentUserId) {
                                    toast({
                                      title: "Authentication Required",
                                      description: "Please log in to react to messages",
                                      variant: "destructive",
                                    });
                                    return;
                                  }
                                  
                                  // Check if user already reacted with this emoji
                                  const userReacted = message.reactions?.find(r => r.emoji === emoji)?.hasUserReacted;
                                  
                                  if (userReacted) {
                                    removeReactionMutation.mutate({ messageId: message.id, emoji });
                                  } else {
                                    addReactionMutation.mutate({ messageId: message.id, emoji });
                                  }
                                }}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                          
                          {/* Display existing reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex space-x-1 ml-2">
                              {message.reactions.map((reaction) => (
                                <Button
                                  key={reaction.emoji}
                                  variant="outline"
                                  size="sm"
                                  className={`h-6 px-2 text-xs ${
                                    reaction.hasUserReacted ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    if (!currentUserId) {
                                      toast({
                                        title: "Authentication Required",
                                        description: "Please log in to react to messages",
                                        variant: "destructive",
                                      });
                                      return;
                                    }
                                    
                                    if (reaction.hasUserReacted) {
                                      removeReactionMutation.mutate({ messageId: message.id, emoji: reaction.emoji });
                                    } else {
                                      addReactionMutation.mutate({ messageId: message.id, emoji: reaction.emoji });
                                    }
                                  }}
                                >
                                  {reaction.emoji} {reaction.count}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
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
                className="px-4 py-2 h-11 transform hover:scale-105 active:scale-95 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {sendMessageMutation.isPending ? (
                  <div className="animate-spin w-4 h-4">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : (
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                )}
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
                    {eventAttendees.map((attendee, index) => (
                      <div 
                        key={attendee.id} 
                        className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 w-full group"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="relative flex-shrink-0">
                            <div className="relative group">
                              <Avatar 
                                className="w-16 h-16 cursor-pointer hover:ring-4 hover:ring-blue-300 hover:scale-110 transition-all duration-300"
                                onClick={() => openUserProfile(attendee.id)}
                              >
                                <AvatarImage 
                                  src={attendee.avatar || getUserPhoto(attendee.fullName)} 
                                  alt={attendee.fullName}
                                />
                                <AvatarFallback className={`bg-gradient-to-br ${getUserAvatarColor(attendee.fullName)} text-white font-semibold text-lg`}>
                                  {getUserInitials(attendee.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              {attendee.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                              {/* Photo zoom button */}
                              <Button
                                size="sm"
                                variant="secondary"
                                className="absolute top-0 right-0 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 hover:bg-black/80 text-white rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const photoUrl = attendee.avatar || getUserPhoto(attendee.fullName);
                                  if (photoUrl) {
                                    openPhotoViewer(photoUrl, attendee);
                                  }
                                }}
                              >
                                <ZoomIn className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 
                                  className="font-semibold text-gray-900 text-lg mb-1 cursor-pointer hover:text-blue-600 hover:underline transition-all duration-300 group-hover:translate-x-1"
                                  onClick={() => openUserProfile(attendee.id)}
                                >
                                  {attendee.fullName}
                                </h4>
                                {/* Show job title - fallback to LinkedIn headline if no job title */}
                                {(attendee.jobTitle || attendee.linkedinHeadline) && (
                                  <p className="text-sm text-gray-600 mb-1">
                                    {attendee.jobTitle || attendee.linkedinHeadline}
                                  </p>
                                )}
                                {/* Show company */}
                                {attendee.company && (
                                  <p className="text-sm text-gray-500 mb-1">{attendee.company}</p>
                                )}
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

      {/* User Profile Dialog */}
      <Dialog open={isUserProfileDialogOpen} onOpenChange={setIsUserProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              <span>User Profile</span>
            </DialogTitle>
            <DialogDescription>
              View user information and connect with fellow summit attendees.
            </DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-4">
              {/* User Avatar and Basic Info */}
              <div className="flex items-start space-x-4">
                <div className="relative group">
                  <Avatar className="w-20 h-20 cursor-pointer hover:scale-105 transition-transform duration-300">
                    <AvatarImage 
                      src={selectedUser.avatar || getUserPhoto(selectedUser.fullName)} 
                      alt={selectedUser.fullName}
                    />
                    <AvatarFallback className={`text-white text-xl font-semibold bg-gradient-to-br ${getUserAvatarColor(selectedUser.fullName)}`}>
                      {getUserInitials(selectedUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Photo zoom button for user profile dialog */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-0 right-0 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 hover:bg-black/80 text-white rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      const photoUrl = selectedUser.avatar || getUserPhoto(selectedUser.fullName);
                      if (photoUrl) {
                        openPhotoViewer(photoUrl, selectedUser);
                      }
                    }}
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedUser.fullName}</h2>
                  {selectedUser.jobTitle && (
                    <p className="text-sm text-gray-600 mt-1">{selectedUser.jobTitle}</p>
                  )}
                  {selectedUser.company && (
                    <p className="text-sm text-gray-500 mt-1">{selectedUser.company}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <Badge 
                      className={`text-xs ${getUserRoleBadge(selectedUser.userRole || "attendee", selectedUser.email).color}`}
                    >
                      {getUserRoleBadge(selectedUser.userRole || "attendee", selectedUser.email).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid gap-3">
                {/* Show job title - fallback to LinkedIn headline if no job title */}
                {(selectedUser.jobTitle || selectedUser.linkedinHeadline) && (
                  <div className="grid gap-1">
                    <Label className="text-sm font-medium text-gray-700">Position</Label>
                    <p className="text-sm text-gray-600">{selectedUser.jobTitle || selectedUser.linkedinHeadline}</p>
                  </div>
                )}
                
                {/* Show company */}
                {selectedUser.company && (
                  <div className="grid gap-1">
                    <Label className="text-sm font-medium text-gray-700">Company</Label>
                    <p className="text-sm text-gray-600">{selectedUser.company}</p>
                  </div>
                )}

                {/* Show bio if available */}
                {selectedUser.bio && (
                  <div className="grid gap-1">
                    <Label className="text-sm font-medium text-gray-700">Bio</Label>
                    <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                  </div>
                )}

                {/* Show LinkedIn networking button for all users */}
                <div className="grid gap-1">
                  <Label className="text-sm font-medium text-gray-700">Connect</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50 w-fit"
                    onClick={() => {
                      if (selectedUser.linkedinProfileUrl && selectedUser.linkedinProfileUrl.includes('linkedin.com/in/') && !selectedUser.linkedinProfileUrl.includes('vKYpQ5vr3z')) {
                        // Direct LinkedIn profile link
                        window.open(selectedUser.linkedinProfileUrl, '_blank');
                      } else {
                        // Search for user on LinkedIn by name and company
                        let searchQuery = selectedUser.fullName || "";
                        if (selectedUser.company) {
                          searchQuery += ` ${selectedUser.company}`;
                        }
                        const encodedQuery = encodeURIComponent(searchQuery);
                        const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}`;
                        window.open(searchUrl, '_blank');
                      }
                    }}
                  >
                    Find on LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading user profile...</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-0">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
              onClick={() => setIsPhotoViewerOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>

            {/* User Info Header */}
            {selectedPhotoUser && (
              <div className="absolute top-4 left-4 z-10 bg-black/70 text-white px-4 py-2 rounded-lg">
                <h3 className="font-semibold">{selectedPhotoUser.fullName}</h3>
                {selectedPhotoUser.jobTitle && (
                  <p className="text-sm opacity-80">{selectedPhotoUser.jobTitle}</p>
                )}
                {selectedPhotoUser.company && (
                  <p className="text-xs opacity-60">{selectedPhotoUser.company}</p>
                )}
              </div>
            )}

            {/* Large Profile Image */}
            <div className="relative w-full h-full flex items-center justify-center p-8">
              {selectedPhotoUrl ? (
                <img
                  src={selectedPhotoUrl}
                  alt={selectedPhotoUser?.fullName || "Profile photo"}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{ maxHeight: '70vh' }}
                />
              ) : (
                <div className="w-96 h-96 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
                  {selectedPhotoUser ? selectedPhotoUser.fullName.split(' ').map(n => n[0]).join('') : '?'}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedPhotoUser && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => openUserProfile(selectedPhotoUser.id)}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => {
                    if (selectedPhotoUser.linkedinProfileUrl && selectedPhotoUser.linkedinProfileUrl.includes('linkedin.com/in/') && !selectedPhotoUser.linkedinProfileUrl.includes('vKYpQ5vr3z')) {
                      window.open(selectedPhotoUser.linkedinProfileUrl, '_blank');
                    } else {
                      let searchQuery = selectedPhotoUser.fullName || "";
                      if (selectedPhotoUser.company) {
                        searchQuery += ` ${selectedPhotoUser.company}`;
                      }
                      const encodedQuery = encodeURIComponent(searchQuery);
                      const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodedQuery}`;
                      window.open(searchUrl, '_blank');
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Find on LinkedIn
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}