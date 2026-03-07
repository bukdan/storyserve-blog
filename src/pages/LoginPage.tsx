import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Akun berhasil dibuat! Cek email untuk verifikasi.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Berhasil masuk!');
        navigate('/admin');
      }
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
          <p className="text-muted-foreground mt-2">{isSignUp ? 'Buat akun baru' : 'Masuk ke akun Anda'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required maxLength={100} />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Masuk'}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button className="text-accent hover:underline font-medium" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Masuk' : 'Daftar'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
