import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input, Button, Label } from "@/components/ui/core";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock } from "lucide-react";
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
      toast({ title: "Login Successful" });
    } catch (error: any) {
      toast({ title: "Access Denied", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-5">
            <Lock size={22} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight mb-1" data-testid="text-login-title">CHOIRIL AHMAD</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Admin Access</p>
        </div>

        <div className="border border-border rounded-lg p-6 md:p-8 bg-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs uppercase tracking-wider">Username</Label>
              <Input
                id="username"
                required
                value={credentials.username}
                onChange={e => setCredentials({...credentials, username: e.target.value})}
                className="h-11"
                data-testid="input-username"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={credentials.password}
                onChange={e => setCredentials({...credentials, password: e.target.value})}
                className="h-11"
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoggingIn} data-testid="button-login">
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authenticate"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
