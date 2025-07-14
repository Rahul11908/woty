import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, X, Upload, ExternalLink, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface UserProfileProps {
  currentUser: User | null;
}

export default function UserProfile({ currentUser }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    jobTitle: "",
    company: "",
    bio: "",
    avatar: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize edit form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditForm({
        fullName: currentUser.fullName || "",
        jobTitle: currentUser.jobTitle || "",
        company: currentUser.company || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || ""
      });
    }
  }, [currentUser]);

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof editForm) => {
      return await apiRequest(`/api/users/${currentUser?.id}`, "PUT", profileData);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${currentUser?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelEdit = () => {
    if (currentUser) {
      setEditForm({
        fullName: currentUser.fullName || "",
        jobTitle: currentUser.jobTitle || "",
        company: currentUser.company || "",
        bio: currentUser.bio || "",
        avatar: currentUser.avatar || ""
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserAvatarColor = (name: string) => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-indigo-400',
      'from-green-400 to-teal-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
      'from-indigo-400 to-purple-400',
      'from-teal-400 to-blue-400',
      'from-orange-400 to-red-400'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getUserRoleBadge = (role: string, email?: string) => {
    if (email?.endsWith("@glory.media")) {
      return { label: "GLORY Team", color: "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500" };
    }
    
    switch (role?.toLowerCase()) {
      case 'speaker':
        return { label: "Speaker", color: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-500" };
      case 'panelist':
        return { label: "Panelist", color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-500" };
      case 'moderator':
        return { label: "Moderator", color: "bg-gradient-to-r from-purple-500 to-violet-500 text-white border-purple-500" };
      case 'organizer':
        return { label: "Organizer", color: "bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-500" };
      case 'vip':
        return { label: "VIP", color: "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-yellow-500" };
      default:
        return { label: "Attendee", color: "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-gray-500" };
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={isEditing ? editForm.avatar : currentUser.avatar} 
                  alt={currentUser.fullName}
                />
                <AvatarFallback className={`text-2xl bg-gradient-to-br ${getUserAvatarColor(currentUser.fullName)} text-white`}>
                  {getUserInitials(currentUser.fullName)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-center items-center space-x-2">
              <Badge 
                className={`${getUserRoleBadge(currentUser.userRole || "attendee", currentUser.email).color} px-3 py-1`}
              >
                {getUserRoleBadge(currentUser.userRole || "attendee", currentUser.email).label}
              </Badge>
            </div>

            {!isEditing && (
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                {/* Edit Mode */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="mt-1"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={editForm.jobTitle}
                      onChange={(e) => setEditForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g. Marketing Director"
                    />
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                    <Input
                      id="company"
                      value={editForm.company}
                      onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                      className="mt-1"
                      placeholder="e.g. GLORY Media"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                      className="mt-1"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  {/* LinkedIn Info (Read-only) */}
                  {currentUser.linkedinId && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">LinkedIn ID</Label>
                      <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-600">{currentUser.linkedinId}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          This information is synced from your LinkedIn account and cannot be edited here.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    disabled={updateProfileMutation.isPending}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">{currentUser.fullName}</h2>
                    {currentUser.jobTitle && (
                      <p className="text-lg text-gray-600 mt-1">{currentUser.jobTitle}</p>
                    )}
                    {currentUser.company && (
                      <p className="text-md text-gray-500 mt-1">{currentUser.company}</p>
                    )}
                    {currentUser.email && (
                      <p className="text-sm text-gray-500 mt-2">{currentUser.email}</p>
                    )}
                  </div>

                  {currentUser.bio && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">About</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{currentUser.bio}</p>
                    </div>
                  )}

                  {/* LinkedIn Connection */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Professional Network</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        if (currentUser.linkedinProfileUrl && currentUser.linkedinProfileUrl.includes('linkedin.com/in/') && !currentUser.linkedinProfileUrl.includes('vKYpQ5vr3z')) {
                          window.open(currentUser.linkedinProfileUrl, '_blank');
                        } else {
                          let searchQuery = currentUser.fullName || "";
                          if (currentUser.company) {
                            searchQuery += ` ${currentUser.company}`;
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

                  {/* Account Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Account Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member since:</span>
                        <span className="text-gray-900">
                          {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      {currentUser.linkedinId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">LinkedIn Connected:</span>
                          <span className="text-green-600 font-medium">Yes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}