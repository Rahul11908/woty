import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Send, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, MessageWithSender } from "@shared/schema";

interface NetworkProps {
  currentUser: User | null;
}

export default function Network({ currentUser }: NetworkProps) {
  const [, setLocation] = useLocation();
  const [newMessage, setNewMessage] = useState("");
  const currentUserId = currentUser?.id || null;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: groupMessages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ["/api/group-chat/messages", currentUserId],
    queryFn: async () => {
      const url = currentUserId 
        ? `/api/group-chat/messages?userId=${currentUserId}`
        : "/api/group-chat/messages";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const messages = await response.json();
      return messages.sort((a: MessageWithSender, b: MessageWithSender) => 
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
    },
    refetchInterval: 5000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("/api/group-chat/messages", "POST", {
        senderId: currentUserId,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/group-chat/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && currentUserId) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-400 to-pink-500',
      'from-purple-400 to-purple-500',
      'from-blue-400 to-blue-500',
      'from-teal-400 to-teal-500',
      'from-orange-400 to-orange-500',
      'from-green-400 to-green-500',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen pb-20 relative z-10 bg-gradient-to-br from-purple-500 to-orange-400">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Network</h1>
            <p className="text-sm text-white/90">Connect with attendees & speakers</p>
          </div>
        </div>
      </header>

      {/* Discussion Content */}
      <div className="px-4 pt-4">
        <div className="space-y-4">
          {/* Group Discussion Header */}
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Group Discussion</h3>
              </div>
              <p className="text-sm text-gray-600">
                Connect with all attendees in the group chat
              </p>
            </CardContent>
          </Card>

          {/* Messages */}
          {messagesLoading ? (
            <Card className="bg-white shadow-lg" data-testid="card-loading-messages">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-gray-600" data-testid="text-loading-messages">Loading messages...</p>
              </CardContent>
            </Card>
          ) : groupMessages.length === 0 ? (
            <Card className="bg-white shadow-lg" data-testid="card-empty-messages">
              <CardContent className="pt-6 pb-6 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600" data-testid="text-no-messages">No messages yet</p>
                <p className="text-sm text-gray-500" data-testid="text-start-conversation">Be the first to start the conversation!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {groupMessages.map((message) => (
                <Card key={message.id} className="bg-white shadow-lg" data-testid={`card-message-${message.id}`}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start space-x-3">
                      {message.sender.avatar ? (
                        <img 
                          src={message.sender.avatar} 
                          alt={message.sender.fullName}
                          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                          data-testid={`avatar-sender-${message.id}`}
                        />
                      ) : (
                        <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarColor(message.sender.fullName)} rounded-full flex items-center justify-center flex-shrink-0`} data-testid={`avatar-sender-${message.id}`}>
                          <span className="text-white font-bold text-base">{getInitials(message.sender.fullName)}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm text-gray-900" data-testid={`text-sender-${message.id}`}>{message.sender.fullName}</p>
                          <p className="text-xs text-gray-500" data-testid={`text-time-${message.id}`}>
                            {new Date(message.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700" data-testid={`text-content-${message.id}`}>{message.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Message Input */}
          <Card className="bg-white shadow-lg sticky bottom-20">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-end space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="resize-none min-h-[40px]"
                  rows={1}
                  data-testid="input-group-message"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  data-testid="button-send-message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
