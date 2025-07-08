import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (2)_1751991903966.png";

const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailLoginData = z.infer<typeof emailLoginSchema>;

export default function EmailLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<EmailLoginData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: EmailLoginData) => {
      // Check if user exists by email
      const response = await apiRequest("/api/users/by-email", "POST", data);
      return response;
    },
    onSuccess: (user) => {
      toast({
        title: "Welcome back!",
        description: `Welcome to GLORY Sports Summit, ${user.fullName}!`,
      });
      // Store the user data for the session
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
        title: "Email not found",
        description: "No account found with this email. Please check your email or create a new profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EmailLoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-64 h-32">
              <img 
                src={gloryLogo} 
                alt="GLORY Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to access the summit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="Enter your registered email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Verifying..." : "Enter Summit"}
              </Button>
            </form>
          </Form>

          <div className="text-center pt-4 border-t border-gray-200 mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Don't have an account?
            </p>
            <button
              onClick={() => setLocation("/")}
              className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Create new profile
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}