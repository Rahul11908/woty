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

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/group-chat/messages", {
        content,
        senderId: 1, // Current user ID
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  const formatMessageTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Get user photo URL based on their name
  const getUserPhoto = (fullName: string) => {
    // Convert full name to expected photo filename format
    const photoFileName = fullName.toLowerCase().replace(/\s+/g, '-') + '.jpg';
    return `/photos/${photoFileName}`;
  };

  // Generate consistent color for user avatars
  const getUserAvatarColor = (name: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Event Chat</h1>
              <p className="text-xs text-gray-500">GLORY Sports Summit 2025</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Circle className="w-2 h-2 text-green-500 fill-current" />
            <span className="text-xs">{eventAttendees.length} attendees</span>
          </Badge>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Group Chat Section */}
        <div className="flex-1 p-4">
          <Card className="h-96 flex flex-col">
            <CardHeader className="pb-3">
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
                            src={getUserPhoto(message.sender.fullName)} 
                            alt={message.sender.fullName}
                          />
                          <AvatarFallback className={`text-xs bg-gradient-to-br ${getUserAvatarColor(message.sender.fullName)} text-white`}>
                            {getUserInitials(message.sender.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {message.sender.fullName}
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

            </CardContent>
          </Card>
        </div>

        {/* Message Input Section */}
        <div className="px-4 pb-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Join the Conversation</span>
              </div>
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Share your thoughts with fellow attendees..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 resize-none border-blue-200 focus:border-blue-400"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                  className="self-end bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Attendees Section */}
        <div className="px-4 pb-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {eventAttendees.map((attendee) => (
                    <div key={attendee.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage 
                              src={getUserPhoto(attendee.fullName)} 
                              alt={attendee.fullName}
                            />
                            <AvatarFallback className={`bg-gradient-to-br ${getUserAvatarColor(attendee.fullName)} text-white font-semibold`}>
                              {getUserInitials(attendee.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          {attendee.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{attendee.fullName}</h4>
                          <p className="text-sm text-gray-600 mb-1">{attendee.title}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant={attendee.isOnline ? "default" : "secondary"} className="text-xs">
                              {attendee.isOnline ? "Online" : "Offline"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}