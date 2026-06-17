import { useState } from 'react';
import { X, Crown, Check, Sparkles, Lock } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './paymentModal';
import PaymentNotification from './paymentNotification';
import { Subscription } from '../lib/supabase';

export type PaywallReason = 'premium_template' | 'ai_feature' | 'download_premium' | 'custom_section';

interface PaywallModalProps {
  reason: PaywallReason;
  onClose: () => void;
  onAuthOpen?: () => void;
}

export default function PaywallModal({ reason, onClose, onAuthOpen }: PaywallModalProps) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [payModal, setPayModal] = useState<{ open: boolean; tier: 'premium' | 'ai' } | null>(null);
  const [notification, setNotification] = useState<Subscription | null>(null);

  const isAIReason = reason === 'ai_feature';
  const needsLogin = !user;

  const reasonText: Record<PaywallReason, string> = {
    premium_template: t.paywall.templateLocked,
    ai_feature: t.paywall.aiRequired,
    download_premium: t.paywall.downloadLocked,
    custom_section: t.paywall.customSectionLocked,
  };

  if (payModal?.open) {
    return (
      <>
        <PaymentModal
          tier={payModal.tier}
          onClose={() => setPayModal(null)}
          onAuthOpen={onAuthOpen}
          onSuccess={sub => {
            setPayModal(null);
            setNotification(sub);
            onClose();
          }}
        />
        {notification && (
          <PaymentNotification subscription={notification} onDismiss={() => setNotification(null)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X size={16} className="text-gray-600 dark:text-gray-300" />
          </button>

          {/* Hero */}
          <div className={`px-8 pt-8 pb-6 ${isAIReason
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
            : 'bg-gradient-to-r from-blue-600 to-blue-800'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                {isAIReason ? <Sparkles size={24} className="text-white" /> : <Crown size={24} className="text-white" />}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">{t.paywall.title}</h2>
            <p className="text-white/80 text-sm mt-1">{reasonText[reason]}</p>
          </div>

          {/* Plans */}
          <div className="p-6 space-y-3">
            {needsLogin && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <Lock size={18} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Connexion requise</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Créez un compte pour débloquer ces fonctionnalités.</p>
                  <button
                    onClick={() => { onClose(); onAuthOpen?.(); }}
                    className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300 underline hover:no-underline"
                  >
                    {t.auth.signupBtn} →
                  </button>
                </div>
              </div>
            )}

            {/* Premium plan */}
            {!isAIReason && (
              <div className="border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Crown size={18} className="text-blue-600" />
                    <span className="font-bold text-gray-900 dark:text-white">Premium</span>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">1 500 FCFA/mois</span>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {t.paywall.features.premium.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check size={14} className="text-blue-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setPayModal({ open: true, tier: 'premium' })}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  {lang === 'fr' ? 'Passer à Premium — 1 500 FCFA/mois' : 'Go Premium — 1,500 FCFA/month'}
                </button>
              </div>
            )}

            {/* Elite AI plan */}
            <div className="border-2 border-amber-400 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                {t.common.eliteAI}
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  <span className="font-bold text-gray-900 dark:text-white">Élite IA</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">2 000 FCFA/mois</span>
              </div>
              <ul className="space-y-1.5 mb-4">
                {t.paywall.features.ai.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Check size={14} className="text-amber-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setPayModal({ open: true, tier: 'ai' })}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg text-sm transition-all shadow-sm"
              >
                {lang === 'fr' ? 'Passer à Élite IA — 2 000 FCFA/mois' : 'Go Elite AI — 2,000 FCFA/month'}
              </button>
            </div>

            <button onClick={onClose} className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              {t.paywall.close}
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <PaymentNotification subscription={notification} onDismiss={() => setNotification(null)} />
      )}
    </>
  );
}
