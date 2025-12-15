import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom"; // Add navigation
import { toast } from "sonner"; // Use toast for errors

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useAuth(); // <--- CHANGED from onLogin to login
  const navigate = useNavigate();

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async (e) => { // <--- Made Async
    e.preventDefault();
    try {
        await login(form.email, form.password); // <--- Uses 'login'
        toast.success("Welcome back!");
        navigate("/"); // Redirect to dashboard after login
    } catch (error) {
        toast.error("Invalid email or password");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      
      {/* We wrap everything in the form so 'Enter' key works */}
      <form onSubmit={submitForm}> 
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                onChange={handleForm}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                onChange={handleForm}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
          >
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}