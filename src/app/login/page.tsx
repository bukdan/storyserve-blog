'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (isSignUp) {
      result = await register(email.trim(), password, name.trim());
    } else {
      result = await login(email.trim(), password);
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(isSignUp ? 'Akun berhasil dibuat!' : 'Berhasil masuk!');
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold">
            TheMag<span className="text-accent">.</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {isSignUp ? 'Buat akun baru' : 'Masuk ke akun Anda'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            className="text-accent hover:underline font-medium"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </div>
    </div>
  );
}
