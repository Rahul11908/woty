import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Login() {
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<string>("");

  const handleContinue = () => {
    if (selectedOption === "create") {
      setLocation("/create-profile");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              2025 GLORY Sports Summit
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to GLORY
          </CardTitle>
          <CardDescription className="text-gray-600">
            Connect with sports industry professionals and join the conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              How would you like to proceed?
            </label>
            <Select value={selectedOption} onValueChange={setSelectedOption}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Create a new profile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleContinue}
            disabled={!selectedOption}
            className="w-full"
          >
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}