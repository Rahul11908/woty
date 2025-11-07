import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, User, Building2, Briefcase, Camera, ArrowLeft } from "lucide-react";
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
import gloryLogo from "@assets/GLORY WOTY_1762527738446.png";

const createProfileSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateProfileData = z.infer<typeof createProfileSchema>;

export default function CreateProfile() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showTerms, setShowTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<CreateProfileData>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
      jobTitle: "",
      avatar: "",
      hasAcceptedTerms: false,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateProfileData) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      return await apiRequest("/api/users", "POST", userData);
    },
    onSuccess: (user) => {
      toast({
        title: "Profile created successfully!",
        description: `Welcome to 2025 GLORY Sports Summit, ${user.fullName}!`,
      });
      // Store user session and redirect to main app
      localStorage.setItem("currentUserId", user.id.toString());
      localStorage.setItem("currentUser", JSON.stringify(user));
      
      // Dispatch custom event to notify App.tsx of user login
      window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));
      
      // Small delay to ensure App.tsx receives the event before redirect
      setTimeout(() => {
        setLocation("/network");
      }, 100);
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
      {/* Back Button */}
      <Button
        onClick={() => setLocation("/")}
        variant="ghost"
        className="fixed top-4 left-4 text-gray-800 hover:text-gray-900 z-50 font-bold p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <ArrowLeft className="w-6 h-6" />
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-64 h-32">
              <a href="https://www.glory.media" target="_blank" rel="noopener noreferrer">
                <img 
                  src={gloryLogo} 
                  alt="GLORY Logo" 
                  className="w-full h-full object-contain hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
            </div>
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
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter your full name" {...field} className="pl-10" />
                      </div>
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
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input type="email" placeholder="Enter your email" {...field} className="pl-10" />
                      </div>
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
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter your company" {...field} className="pl-10" />
                      </div>
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
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Enter your job title" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Enter password (minimum 8 characters)"
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Confirm your password"
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
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
                        className="w-full h-full avatar-image-flat"
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
                            <ScrollArea className="h-96">
                              <div className="space-y-4 text-sm">
                                <p className="text-xs text-gray-500">
                                  Effective Date: July 14th, 2025<br />
                                  Produced by 2294462 Ontario Inc. (O/A GLORY Media)<br />
                                  Registered in Ontario, Canada
                                </p>
                                
                                <p>
                                  <strong>1. Acceptance of Terms</strong><br />
                                  By accessing or using the 2025 GLORY Sports Summit web app ("App"), you agree to comply with and be bound by these Usage Terms and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use the App.
                                </p>
                                
                                <p>
                                  <strong>2. Eligibility</strong><br />
                                  Use of the App is limited to individuals who are 16 years of age or older. If you are under 18, you must have the consent of a parent or legal guardian.
                                </p>
                                
                                <p>
                                  <strong>3. Privacy & Data Protection</strong><br />
                                  GLORY Media is committed to protecting your privacy. All data collected through the App will be handled in compliance with the Personal Information Protection and Electronic Documents Act (PIPEDA) and applicable Ontario privacy laws.
                                </p>
                                
                                <p>
                                  <strong>3.1 Data Collection</strong><br />
                                  We may collect the following personal information:
                                  • Name and contact information<br />
                                  • Event preferences and usage data<br />
                                  • Voluntary survey responses or interaction data<br />
                                  This information is collected for the purpose of:
                                  • Providing access to App features<br />
                                  • Improving user experience<br />
                                  • Offering customer support<br />
                                  • Internal analytics and reporting for GLORY Media only
                                </p>
                                
                                <p>
                                  <strong>3.2 No Third-Party Sharing</strong><br />
                                  Your personal information will not be shared, sold, rented, or disclosed to third parties without your explicit consent, unless required by law or in the event of a legal investigation.
                                </p>
                                
                                <p>
                                  <strong>3.3 Data Security</strong><br />
                                  We use secure protocols, data encryption, and firewalls to protect your personal information. Despite these precautions, no system is completely secure. Use of the App is at your own risk.
                                </p>
                                
                                <p>
                                  <strong>4. User Conduct</strong><br />
                                  By using the App, you agree to:
                                  • Use the App only for lawful purposes<br />
                                  • Not misuse, hack, or interfere with the App's services<br />
                                  • Not upload or transmit any harmful or malicious content<br />
                                  GLORY Media reserves the right to suspend or terminate access for users who violate these terms.
                                </p>
                                
                                <p>
                                  <strong>5. Intellectual Property</strong><br />
                                  All content, features, and designs in the App, including text, graphics, logos, and videos, are the intellectual property of GLORY Media or its partners and are protected under Canadian copyright law. You may not copy, reproduce, or distribute any content without written permission.
                                </p>
                                
                                <p>
                                  <strong>6. Third-Party Links</strong><br />
                                  The App may contain links to third-party websites. GLORY Media is not responsible for the content or privacy practices of these external sites. Use them at your own discretion.
                                </p>
                                
                                <p>
                                  <strong>7. Changes to Terms</strong><br />
                                  GLORY Media may update these terms from time to time. Continued use of the App after changes are posted constitutes your acceptance of the revised terms. You are encouraged to review these terms regularly.
                                </p>
                                
                                <p>
                                  <strong>8. Limitation of Liability</strong><br />
                                  To the extent permitted by law, GLORY Media shall not be liable for any damages or losses resulting from your use of or inability to use the App, including but not limited to loss of data, business interruption, or personal injury.
                                </p>
                                
                                <p>
                                  <strong>9. Governing Law</strong><br />
                                  These Terms are governed by and construed in accordance with the laws of the Province of Ontario and the laws of Canada applicable therein. Any disputes shall be resolved in the courts located in Toronto, Ontario.
                                </p>
                                
                                <p>
                                  <strong>10. Newsletter and Communications</strong><br />
                                  By using this App and accepting these terms, you provide explicit consent to receive newsletters, updates, event announcements, and promotional communications from GLORY Media. You may unsubscribe from these communications at any time by following the unsubscribe instructions in any email or by contacting us directly.
                                </p>
                                
                                <p>
                                  <strong>11. Contact Information</strong><br />
                                  For any questions or concerns about these Usage Terms or your personal data, please contact:<br />
                                  2294462 Ontario Inc. (O/A GLORY Media)<br />
                                  501-800 Bathurst Street, Toronto, Ontario<br />
                                  Email: info@glory.media
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