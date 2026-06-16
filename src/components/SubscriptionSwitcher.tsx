import { useState } from 'react';
import { Crown, Sparkles, Zap, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { SubscriptionTier } from '../lib/supabase';
import PaymentModal from './PaymentModal';
import PaymentNotification from './PaymentNotification';
import { Subscription } from '../lib/supabase';

const TIER_INFO: Record<SubscriptionTier, { label: string; icon: React.ReactNode; color: string; bg: string; price: string }> = {
  free: {
    label: 'Gratuit', price: '0 FCFA',
    icon: <Zap size={16} className="text-gray-500" />,
    color: 'text-gray-700 dark:text-gray-300',
    bg: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  },
  premium: {
    label: 'Premium', price: '1 500 FCFA/mois',
    icon: <Crown size={16} className="text-blue-600" />,
    color: 'text-blue-700 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  },
  ai: {
    label: 'Élite IA', price: '2 000 FCFA/mois',
    icon: <Sparkles size={16} className="text-orange-500" />,
    color: 'text-orange-700 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
  },
};

export default function SubscriptionSwitcher() {
  const { profile, purchasedTiers, setActiveTier } = useAuth();
  const { lang } = useLang();
  const [payModal, setPayModal] = useState<{ open: boolean; tier: 'premium' | 'ai' }>({ open: false, tier: 'premium' });
  const [notification, setNotification] = useState<Subscription | null>(null);
  const [switching, setSwitching] = useState(false);

  const currentTier = profile?.subscription_tier ?? 'free';
  const allTiers: SubscriptionTier[] = ['free', 'premium', 'ai'];

  const handleSwitch = async (tier: SubscriptionTier) => {
    if (tier === currentTier) return;
    if (!purchasedTiers.includes(tier)) {
      if (tier !== 'free') {
        setPayModal({ open: true, tier: tier as 'premium' | 'ai' });
      }
      return;
    }
    setSwitching(true);
    await setActiveTier(tier);
    setSwitching(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {lang === 'fr' ? 'Mon abonnement' : 'My subscription'}
          </p>
          {switching && <RefreshCw size={14} className="text-blue-500 animate-spin" />}
        </div>

        <div className="space-y-2">
          {allTiers.map(tier => {
            const info = TIER_INFO[tier];
            const isPurchased = purchasedTiers.includes(tier);
            const isCurrent = tier === currentTier;

            return (
              <button
                key={tier}
                onClick={() => handleSwitch(tier)}
                disabled={isCurrent || switching}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all ${
                  isCurrent
                    ? info.bg + ' ' + info.color
                    : isPurchased
                    ? 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300'
                    : 'border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-600 opacity-60 cursor-pointer'
                }`}
              >
                <div className="shrink-0">{info.icon}</div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{info.label}</p>
                  <p className="text-xs opacity-70">{info.price}</p>
                </div>
                {isCurrent && (
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    <Check size={12} />
                    {lang === 'fr' ? 'Actif' : 'Active'}
                  </div>
                )}
                {!isCurrent && isPurchased && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {lang === 'fr' ? 'Activer' : 'Switch'}
                  </span>
                )}
                {!isCurrent && !isPurchased && tier !== 'free' && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {lang === 'fr' ? 'Acheter' : 'Buy'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {payModal.open && (
        <PaymentModal
          tier={payModal.tier}
          onClose={() => setPayModal(p => ({ ...p, open: false }))}
          onSuccess={sub => {
            setPayModal(p => ({ ...p, open: false }));
            setNotification(sub);
          }}
        />
      )}

      {notification && (
        <PaymentNotification
          subscription={notification}
          onDismiss={() => setNotification(null)}
        />
      )}
    </>
  );
}
