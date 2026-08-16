import { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) setError(error);
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-10">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-900 text-ink-50">
          <Sparkles size={28} />
        </div>
        <h1 className="text-center font-serif text-3xl text-ink-900">
          {mode === 'signup' ? 'Welcome to your wardrobe' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-center text-sm text-ink-500">
          {mode === 'signup'
            ? "Let's make getting dressed easier."
            : 'Sign in to continue.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm px-6">
        <div className="space-y-3">
          <div className="relative">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-400"
            />
          </div>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="w-full rounded-2xl border border-ink-200 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-ink-400"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-5"
          disabled={loading}
        >
          {loading ? (
            <Spinner size="sm" className="border-ink-200 border-t-ink-50" />
          ) : (
            <>
              {mode === 'signup' ? 'Create account' : 'Sign in'}
              <ArrowRight size={18} />
            </>
          )}
        </Button>

        <p className="mt-5 text-center text-sm text-ink-500">
          {mode === 'signup' ? 'Already have an account?' : "Don't have one yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signup' ? 'signin' : 'signup');
              setError(null);
            }}
            className="font-semibold text-ink-900 underline underline-offset-2"
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </form>
    </div>
  );
}
