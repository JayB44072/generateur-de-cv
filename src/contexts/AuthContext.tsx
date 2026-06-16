import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, Subscription, SubscriptionTier } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscriptions: Subscription[];
  purchasedTiers: SubscriptionTier[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  recordSubscription: (
    tier: 'premium' | 'ai',
    method: Subscription['payment_method'],
    details: Record<string, string>,
    amount: number,
  ) => Promise<{ error: string | null; subscription?: Subscription }>;
  setActiveTier: (tier: SubscriptionTier) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateTransactionId(): string {
  return 'TXN-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived: which tiers the user has ever paid for (successfully)
  const purchasedTiers: SubscriptionTier[] = ['free', ...new Set(
    subscriptions
      .filter(s => s.status === 'success')
      .map(s => s.tier as SubscriptionTier)
  )];

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  const fetchSubscriptions = async (userId: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('paid_at', { ascending: false });
    setSubscriptions((data as Subscription[]) ?? []);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchSubscriptions(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          await fetchSubscriptions(session.user.id);
        } else {
          setProfile(null);
          setSubscriptions([]);
        }
        setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) return { error: 'invalid_credentials' };
      return { error: 'generic' };
    }
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      if (error.message.includes('already registered')) return { error: 'email_taken' };
      return { error: 'generic' };
    }
    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) return { error: 'generic' };
    return { error: null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?reset=true`,
    });
    if (error) return { error: 'generic' };
    return { error: null };
  };

  const recordSubscription = async (
    tier: 'premium' | 'ai',
    method: Subscription['payment_method'],
    details: Record<string, string>,
    amount: number,
  ) => {
    if (!user) return { error: 'not_authenticated' };

    const txId = generateTransactionId();

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        tier,
        transaction_id: txId,
        amount,
        payment_method: method,
        payment_details: details,
        status: 'success',
      })
      .select()
      .single();

    if (error) return { error: 'generic' };

    // Update active tier on profile
    await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', user.id);

    // Refresh local state
    await fetchProfile(user.id);
    await fetchSubscriptions(user.id);

    return { error: null, subscription: data as Subscription };
  };

  const setActiveTier = async (tier: SubscriptionTier) => {
    if (!user) return;
    await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', user.id);
    await fetchProfile(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
      await fetchSubscriptions(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, subscriptions, purchasedTiers, loading,
      signIn, signUp, signInWithGoogle, resetPassword, signOut, refreshProfile,
      recordSubscription, setActiveTier,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
