import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Users, Circle, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import type { User, MessageWithSender } from "@shared/schema";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (1)_1751985925815.png";

export default function Network() {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: groupMessages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/group-chat/messages"],
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const { data: eventAttendees = [], isLoading: attendeesLoading } = useQuery<User[]>({
    queryKey: ["/api/event-attendees"],
  });

  // Get current user from localStorage (same as App.tsx pattern)
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("currentUserId");
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || 1;
  
  // Remove the redundant API call since we already have currentUser from localStorage
  const userLoading = false;
  const userError = null;



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

  // Get user photo URL based on their name
  const getUserPhoto = (fullName: string) => {
    if (!fullName) return "";
    // Convert full name to expected photo filename format
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
      ) : currentUser ? (
        <div className="bg-white shadow-sm mx-4 mt-4 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage 
                    src={currentUser.avatar} 
                    alt={currentUser.fullName}
                  />
                  <AvatarFallback 
                    className={`text-white text-lg font-semibold bg-gradient-to-br ${getUserAvatarColor(currentUser.fullName)}`}
                  >
                    {getUserInitials(currentUser.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{currentUser.fullName || "User"}</h2>
                {currentUser.jobTitle && (
                  <p className="text-sm text-gray-600">{currentUser.jobTitle}</p>
                )}
                {currentUser.company && (
                  <p className="text-sm text-gray-500">{currentUser.company}</p>
                )}
                {currentUser.email && (
                  <p className="text-xs text-gray-400 mt-1">{currentUser.email}</p>
                )}
                <div className="flex items-center mt-2 space-x-2">
                  <Badge 
                    className={`text-xs ${getUserRoleBadge(currentUser.userRole || "attendee", currentUser.email).color}`}
                  >
                    {getUserRoleBadge(currentUser.userRole || "attendee", currentUser.email).label}
                  </Badge>
                </div>
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
                    <div key={message.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage 
                          src={message.sender?.avatar} 
                          alt={message.sender?.fullName || "User"}
                        />
                        <AvatarFallback className={`text-xs bg-gradient-to-br ${getUserAvatarColor(message.sender?.fullName || "")} text-white`}>
                          {getUserInitials(message.sender?.fullName || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {message.sender?.fullName || "Unknown User"}
                          </span>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatMessageTime(message.createdAt || new Date())}
                          </span>
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
                                src={attendee.avatar} 
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