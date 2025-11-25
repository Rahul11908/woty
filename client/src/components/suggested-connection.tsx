import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface SuggestedConnectionProps {
  user: User;
}

export default function SuggestedConnection({ user }: SuggestedConnectionProps) {
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) {
        throw new Error("No authenticated user found");
      }
      const currentUser = JSON.parse(storedUser);
      
      await apiRequest("POST", "/api/connections", {
        requesterId: currentUser.id,
        addresseeId: user.id,
        status: "pending"
      });
    },
    onSuccess: () => {
      setConnectionStatus('pending');
      queryClient.invalidateQueries({ queryKey: ["/api/suggested-connections"] });
    }
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const getButtonText = () => {
    switch (connectionStatus) {
      case 'pending': return 'Pending...';
      case 'connected': return 'Connected';
      default: return 'Connect';
    }
  };

  const getButtonVariant = () => {
    switch (connectionStatus) {
      case 'pending': return 'secondary' as const;
      case 'connected': return 'outline' as const;
      default: return 'default' as const;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
      <img 
        src={(user.avatar && user.avatar.trim() !== '') ? user.avatar : `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150`}
        alt={`${user.fullName} profile`}
        loading="lazy"
        className="w-16 h-16 rounded-full mx-auto mb-3 avatar-image-flat"
      />
      <h4 className="font-medium text-gray-900 text-sm">{user.fullName}</h4>
      <p className="text-xs text-gray-600 mb-3">{user.jobTitle || 'Sports Professional'}</p>
      <div className="space-y-2">
        <Button 
          className="w-full text-sm font-medium"
          variant={getButtonVariant()}
          onClick={handleConnect}
          disabled={connectMutation.isPending || connectionStatus !== 'none'}
        >
          {getButtonText()}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs text-blue-600 border-blue-600 hover:bg-blue-50"
          onClick={() => {
            if (user.linkedinProfileUrl && user.linkedinProfileUrl.includes('linkedin.com/in/') && !user.linkedinProfileUrl.includes('vKYpQ5vr3z')) {
              // Direct LinkedIn profile link
              window.open(user.linkedinProfileUrl, '_blank');
            } else {
              // Search for user on LinkedIn by name and company
              let searchQuery = user.fullName || "";
              if (user.company) {
                searchQuery += ` ${user.company}`;
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
  );
}
