import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Users, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConversationItem from "@/components/conversation-item";
import SuggestedConnection from "@/components/suggested-connection";
import type { ConversationWithParticipant, User } from "@shared/schema";

export default function Network() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationWithParticipant[]>({
    queryKey: ["/api/conversations", { userId: 1 }],
  });

  const { data: suggestedConnections = [], isLoading: suggestionsLoading } = useQuery<User[]>({
    queryKey: ["/api/suggested-connections", { userId: 1 }],
  });

  const filteredConversations = conversations.filter(conv =>
    conv.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3L9 4L3 10L9 16L10 17L11 16L17 10L11 4L10 3Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">GLORY Sports Summit</h1>
              <p className="text-xs text-gray-500">Beta</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 relative">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-4 px-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-100 border-0 focus:ring-2 focus:ring-primary focus:bg-white"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <Button className="flex-shrink-0 flex items-center space-x-2 bg-primary text-white">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Chat</span>
            </Button>
            <Button variant="secondary" className="flex-shrink-0 flex items-center space-x-2">
              <Circle className="w-4 h-4 text-green-500 fill-current" />
              <span className="text-sm font-medium">Online</span>
            </Button>
            <Button variant="secondary" className="flex-shrink-0 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Groups</span>
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Conversations</h2>
          
          {conversationsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-100">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No conversations found matching your search." : "No conversations yet. Start a new chat!"}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem key={conversation.id} conversation={conversation} />
            ))
          )}
        </div>

        {/* Suggested Connections */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Connections</h3>
          {suggestionsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {suggestedConnections.slice(0, 4).map((user) => (
                <SuggestedConnection key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <Button 
        size="icon"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 hover:scale-105 transition-all"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
