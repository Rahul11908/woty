import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import gloryLogo from "@assets/Orange Modern Fun Photography Business Card (2)_1751991903966.png";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleEnterEvent = () => {
    setLocation("/create-profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
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
            Welcome
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
          
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Already registered?
            </p>
            <button
              onClick={() => setLocation("/email-login")}
              className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Confirm email and enter here
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}