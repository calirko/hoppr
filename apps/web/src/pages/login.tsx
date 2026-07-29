import { SignInIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import { getToken, setToken } from '@/lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (getToken()) {
    return <Navigate to="/connections" replace />;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const emailOrName = data.get('emailOrName') as string;
    const password = data.get('password') as string;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrName, password }),
      });
      const body = await res.json();

      if (!res.ok) {
        toast.error('Login failed', { description: body.error });
        return;
      }

      setToken(body.token);
      navigate('/connections');
    } catch (error) {
      toast.error('An error occurred', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-10">
      <div className="flex items-center gap-4">
        <img src="/hoppr.svg" alt="Hoppr" className="h-14 sm:h-24" />
        <h1 className="font-heading text-4xl sm:text-5xl">Hoppr</h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to Hoppr</CardTitle>
          <CardDescription>
            Enter your email or name and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSubmit}
            id="login-form"
            className="flex flex-col gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="emailOrName">Email or name</Label>
              <Input
                id="emailOrName"
                name="emailOrName"
                type="text"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <InputPassword
                id="password"
                name="password"
                placeholder="Password"
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            form="login-form"
            className="w-full"
            disabled={loading}
          >
            <SignInIcon />
            {loading ? 'Logging in…' : 'Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
