import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";

const createProfileSchema = insertUserSchema;

type CreateProfileData = z.infer<typeof createProfileSchema>;

export default function CreateProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showTerms, setShowTerms] = useState(false);

  const form = useForm<CreateProfileData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      jobTitle: "",
      avatar: "",
      hasAcceptedTerms: false,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateProfileData) => {
      return await apiRequest("/api/users", "POST", data);
    },
    onSuccess: (user) => {
      toast({
        title: "Profile created successfully!",
        description: `Welcome to GLORY Sports Summit, ${user.fullName}!`,
      });
      // Store user session or redirect to main app
      localStorage.setItem("currentUser", JSON.stringify(user));
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Error creating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width/height)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const compressedBase64 = await compressImage(file);
        setImagePreview(compressedBase64);
        form.setValue("avatar", compressedBase64);
      } catch (error) {
        toast({
          title: "Image upload failed",
          description: "Please try a different image.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: CreateProfileData) => {
    if (!data.hasAcceptedTerms) {
      toast({
        title: "Terms of use required",
        description: "Please accept the terms of use to continue.",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              2025 GLORY Sports Summit
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Create Your Profile
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join the sports industry's premier networking event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Profile Picture (Optional)
                </label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="hasAcceptedTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm">
                        I accept the{" "}
                        <Dialog open={showTerms} onOpenChange={setShowTerms}>
                          <DialogTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-sm text-blue-600 underline">
                              Terms of Use
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Terms of Use</DialogTitle>
                              <DialogDescription>
                                Please review and accept the terms of use
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-64">
                              <div className="space-y-4 text-sm">
                                <p>
                                  <strong>GLORY Sports Summit 2025 - Terms of Use</strong>
                                </p>
                                <p>
                                  By creating a profile and participating in the GLORY Sports Summit 2025, you agree to the following terms and conditions:
                                </p>
                                <p>
                                  <strong>1. Event Participation</strong><br />
                                  You confirm your attendance at the GLORY Sports Summit 2025 and agree to participate in networking activities and panel discussions in a professional manner.
                                </p>
                                <p>
                                  <strong>2. Professional Conduct</strong><br />
                                  All participants must maintain professional standards during interactions, networking sessions, and communications within the platform.
                                </p>
                                <p>
                                  <strong>3. Data Usage</strong><br />
                                  Your profile information may be shared with other summit attendees to facilitate networking and professional connections.
                                </p>
                                <p>
                                  <strong>4. Privacy</strong><br />
                                  We respect your privacy and will handle your personal information in accordance with our privacy policy.
                                </p>
                                <p>
                                  <strong>5. Platform Usage</strong><br />
                                  This platform is exclusively for GLORY Sports Summit 2025 attendees and should be used solely for professional networking purposes.
                                </p>
                                <p className="text-xs text-gray-500">
                                  These terms are subject to updates. Please check back periodically for any changes.
                                </p>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        {" "}and event attendance
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Creating Profile..." : "Create Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}