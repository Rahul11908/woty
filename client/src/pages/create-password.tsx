import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const createPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreatePasswordFormData = z.infer<typeof createPasswordSchema>;

export default function CreatePasswordPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
  });

  const createPasswordMutation = useMutation({
    mutationFn: async (data: CreatePasswordFormData) => {
      return await apiRequest("/api/create-password", "POST", {
        password: data.password,
      });
    },
    onSuccess: (user) => {
      toast({
        title: "Password Created",
        description: "Your password has been set successfully. Welcome to the Summit!",
      });
      
      // Store user session and trigger app refresh
      localStorage.setItem("currentUser", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));
      
      // Small delay to ensure the event is processed
      setTimeout(() => {
        setLocation("/network");
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreatePasswordFormData) => {
    setIsLoading(true);
    try {
      await createPasswordMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Password</CardTitle>
          <CardDescription>
            Complete your LinkedIn sign-up by creating a password for future logins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating Password..." : "Create Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}