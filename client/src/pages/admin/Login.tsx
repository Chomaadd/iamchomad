import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input, Button, Label } from "@/components/ui/core";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";

export default function Login() {
  const { login, isLoggingIn, user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  if (user) return <Redirect to="/admin" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Redirect happens naturally via the user state change
    } catch (error: any) {
      toast({ title: "Access Denied", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md border-2 border-primary p-8 md:p-12 bg-card editorial-shadow-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold tracking-tighter mb-2">ELEGANCE.</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Authorized Access Only</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input 
              id="username" 
              required 
              value={credentials.username}
              onChange={e => setCredentials({...credentials, username: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={credentials.password}
              onChange={e => setCredentials({...credentials, password: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isLoggingIn}>
            {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
          </Button>
        </form>
      </div>
    </div>
  );
}
