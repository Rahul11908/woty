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
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
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
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-500 text-white">
                          {getUserInitials(message.sender.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.fullName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(message.createdAt || new Date())}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Share your thoughts with fellow attendees..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                  className="self-end"
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
                <div className="grid grid-cols-1 gap-3">
                  {eventAttendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getUserInitials(attendee.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{attendee.fullName}</p>
                        <p className="text-sm text-gray-500">@{attendee.username}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {attendee.isOnline && (
                          <Circle className="w-2 h-2 text-green-500 fill-current" />
                        )}
                        <span className="text-xs text-gray-500">
                          {attendee.isOnline ? "Online" : "Offline"}
                        </span>
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