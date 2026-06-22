import { useState } from 'react';
import { Check, Crown, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/paymentModal';
import PaymentNotification from '../components/paymentNotification';
import { Subscription } from '../lib/supabase';

interface PricingPageProps {
  onNavigate: (page: 'editor') => void;
  onAuthOpen: () => void;
}

export default function PricingPage({ onNavigate, onAuthOpen }: PricingPageProps) {
  const { t, lang } = useLang();
  const { user, profile, purchasedTiers, setActiveTier } = useAuth();
  const currentTier = profile?.subscription_tier ?? 'free';

  const [payModal, setPayModal] = useState<{ open: boolean; tier: 'premium' | 'ai' }>({ open: false, tier: 'premium' });
  const [notification, setNotification] = useState<Subscription | null>(null);
  const [switching, setSwitching] = useState<string | null>(null);

  const handlePlanAction = async (tierKey: 'free' | 'premium' | 'ai') => {
    if (!user) { onAuthOpen(); return; }
    if (tierKey === 'free') {
      setSwitching('free');
      await setActiveTier('free');
      setSwitching(null);
      return;
    }
    if (purchasedTiers.includes(tierKey)) {
      // Already purchased — just switch
      setSwitching(tierKey);
      await setActiveTier(tierKey);
      setSwitching(null);
    } else {
      setPayModal({ open: true, tier: tierKey });
    }
  };

  const plans = [
    {
      key: 'free' as const,
      icon: <Zap size={22} className="text-gray-500" />,
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      data: t.pricing.free,
      border: 'border-gray-200 dark:border-gray-800',
      headerBg: '',
      headerFg: false,
      badge: null,
      accentColor: 'text-gray-600 dark:text-gray-400',
      checkColor: 'text-gray-500',
      btnClass: (active: boolean, purchased: boolean) =>
        active
          ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default'
          : purchased
          ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100',
    },
    {
      key: 'premium' as const,
      icon: <Crown size={22} className="text-white" />,
      iconBg: 'bg-white/20',
      data: t.pricing.premium,
      border: 'border-blue-500 shadow-xl shadow-blue-500/10',
      headerBg: 'bg-blue-600',
      headerFg: true,
      badge: 'badge' in t.pricing.premium ? t.pricing.premium.badge : null,
      accentColor: 'text-blue-600',
      checkColor: 'text-blue-500',
      btnClass: (active: boolean, purchased: boolean) =>
        active
          ? 'bg-blue-200 dark:bg-blue-900/50 text-blue-600 cursor-default'
          : purchased
          ? 'bg-blue-100 dark:bg-blue-950/30 border border-blue-400 text-blue-700 dark:text-blue-400 hover:bg-blue-200'
          : 'bg-blue-600 text-white hover:bg-blue-700',
    },
    {
      key: 'ai' as const,
      icon: <Sparkles size={22} className="text-white" />,
      iconBg: 'bg-white/20',
      data: t.pricing.ai,
      border: 'border-orange-400 shadow-xl shadow-orange-500/10',
      headerBg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      headerFg: true,
      badge: 'badge' in t.pricing.ai ? t.pricing.ai.badge : null,
      accentColor: 'text-orange-600',
      checkColor: 'text-orange-500',
      btnClass: (active: boolean, purchased: boolean) =>
        active
          ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600 cursor-default'
          : purchased
          ? 'bg-orange-50 dark:bg-orange-950/20 border border-orange-400 text-orange-700 dark:text-orange-400 hover:bg-orange-100'
          : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700',
    },
  ];

  const getButtonLabel = (key: 'free' | 'premium' | 'ai', active: boolean, purchased: boolean) => {
    if (switching === key) return <RefreshCw size={14} className="animate-spin mx-auto" />;
    if (active) return lang === 'fr' ? '✓ Forfait actuel' : '✓ Current plan';
    if (purchased) return lang === 'fr' ? `Activer ${key === 'ai' ? 'Élite IA' : key === 'premium' ? 'Premium' : 'Gratuit'}` : `Switch to ${key}`;
    if (key === 'free') return t.pricing.free.cta;
    return key === 'premium' ? t.pricing.premium.cta : t.pricing.ai.cta;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">{t.pricing.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">{t.pricing.subtitle}</p>
          {user && purchasedTiers.length > 1 && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-full text-sm text-green-700 dark:text-green-400">
              <Check size={14} />
              {lang === 'fr'
                ? `Vous avez accès à ${purchasedTiers.length - 1} forfait(s) payant(s)`
                : `You have access to ${purchasedTiers.length - 1} paid plan(s)`}
            </div>
          )}
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map(plan => {
            const isCurrent = currentTier === plan.key;
            const isPurchased = purchasedTiers.includes(plan.key);

            return (
              <div key={plan.key}
                className={`relative bg-white dark:bg-gray-900 rounded-3xl border-2 ${plan.border} overflow-hidden flex flex-col transition-all hover:scale-[1.01]`}>
                {plan.badge && (
                  <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm z-10">
                    {plan.badge}
                  </div>
                )}
                {isPurchased && !isCurrent && (
                  <div className="absolute top-4 left-4 text-xs font-bold px-2 py-1 rounded-full bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 z-10">
                    {lang === 'fr' ? '✓ Acheté' : '✓ Owned'}
                  </div>
                )}

                {/* Header */}
                <div className={`px-6 pt-6 pb-5 ${plan.headerBg} ${plan.headerFg ? 'text-white' : ''}`}>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${plan.iconBg}`}>
                    {plan.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${plan.headerFg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {plan.data.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${plan.headerFg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.data.price}
                    </span>
                    <span className={`text-sm ${plan.headerFg ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                      {plan.data.period}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="px-6 py-5 flex-1">
                  <ul className="space-y-3">
                    {plan.data.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check size={14} className={`shrink-0 mt-0.5 ${plan.checkColor}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handlePlanAction(plan.key)}
                    disabled={isCurrent || switching !== null}
                    className={`w-full py-3 text-sm font-bold rounded-2xl transition-all ${plan.btnClass(isCurrent, isPurchased)}`}
                  >
                    {getButtonLabel(plan.key, isCurrent, isPurchased)}
                  </button>
                  {isCurrent && (
                    <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">
                      {lang === 'fr' ? 'Forfait actif' : 'Active plan'}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {lang === 'fr' ? 'Comparaison des fonctionnalités' : 'Feature comparison'}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="bg-white dark:bg-gray-900 min-w-[480px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 sm:px-6 py-4 text-gray-900 dark:text-white font-semibold">
                    {lang === 'fr' ? 'Fonctionnalité' : 'Feature'}
                  </th>
                  <th className="text-center px-3 sm:px-4 py-4 text-gray-700 dark:text-gray-300">Gratuit</th>
                  <th className="text-center px-3 sm:px-4 py-4 text-blue-600">Premium</th>
                  <th className="text-center px-3 sm:px-4 py-4 text-orange-500">Élite IA</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { fr: '30 modèles classiques', en: '30 classic templates', free: true, premium: true, ai: true },
                  { fr: '20 modèles premium', en: '20 premium templates', free: false, premium: true, ai: true },
                  { fr: 'Téléchargement PDF', en: 'PDF download', free: 'watermark', premium: true, ai: true },
                  { fr: 'Sauvegarde automatique', en: 'Auto-save', free: true, premium: true, ai: true },
                  { fr: 'Sections personnalisées', en: 'Custom sections', free: false, premium: true, ai: true },
                  { fr: 'Amélioration IA des textes', en: 'AI text enhancement', free: false, premium: false, ai: true },
                  { fr: 'Générateur de compétences IA', en: 'AI skills generator', free: false, premium: false, ai: true },
                  { fr: '🌍 Traduction CV (12 langues)', en: '🌍 CV translation (12 languages)', free: false, premium: false, ai: true },
                  { fr: 'Support prioritaire', en: 'Priority support', free: false, premium: true, ai: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="px-4 sm:px-6 py-3 text-gray-700 dark:text-gray-300">{lang === 'fr' ? row.fr : row.en}</td>
                    {[row.free, row.premium, row.ai].map((v, j) => (
                      <td key={j} className="text-center px-3 sm:px-4 py-3">
                        {v === true
                          ? <Check size={16} className={['text-gray-500', 'text-blue-500', 'text-orange-500'][j] + ' mx-auto'} />
                          : v === 'watermark'
                          ? <span className="text-xs text-gray-400">⚠ filigrane</span>
                          : <span className="text-gray-300 dark:text-gray-700">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {payModal.open && (
        <PaymentModal
          tier={payModal.tier}
          onClose={() => setPayModal(p => ({ ...p, open: false }))}
          onAuthOpen={onAuthOpen}
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
    </div>
  );
}
