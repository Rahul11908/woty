import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleEnterEvent = () => {
    setLocation("/create-profile");
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
          <Button 
            onClick={handleEnterEvent}
            className="w-full"
            size="lg"
          >
            Enter Event
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}