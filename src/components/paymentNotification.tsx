import { useEffect, useState } from 'react';
import { CheckCircle2, X, Crown, Sparkles } from 'lucide-react';
import { Subscription } from '../lib/supabase';

interface PaymentNotificationProps {
  subscription: Subscription;
  onDismiss: () => void;
}

const METHOD_LABELS: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  orange: 'Orange Money',
  paypal: 'PayPal',
  card: 'Carte bancaire',
};

const TIER_COLORS: Record<string, string> = {
  premium: 'from-blue-600 to-blue-800',
  ai: 'from-amber-500 to-orange-600',
};

const TIER_LABELS: Record<string, string> = {
  premium: 'Premium',
  ai: 'Élite IA',
};

export default function PaymentNotification({ subscription, onDismiss }: PaymentNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Enter animation
    requestAnimationFrame(() => setVisible(true));

    // Auto-dismiss after 7 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 400);
  };

  const gradientClass = TIER_COLORS[subscription.tier] ?? 'from-blue-600 to-blue-800';

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 ${
        visible && !leaving
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95'
      }`}
      style={{ maxWidth: '360px', width: 'calc(100vw - 3rem)' }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Progress bar */}
        <div className={`h-1 bg-gradient-to-r ${gradientClass} animate-[shrink_7s_linear_forwards]`} />

        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shrink-0 shadow-md`}>
              {subscription.tier === 'ai'
                ? <Sparkles size={22} className="text-white" />
                : <Crown size={22} className="text-white" />
              }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  Paiement confirmé ✓
                </p>
                <button
                  onClick={handleDismiss}
                  className="p-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 ml-2 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200">{subscription.amount.toLocaleString()} FCFA</span>
                {' '}débités via {METHOD_LABELS[subscription.payment_method]}
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                  Envoyé à <span className="font-semibold text-gray-900 dark:text-white">whiteDukeSaaS</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                  Forfait <span className={`font-bold ${subscription.tier === 'ai' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {TIER_LABELS[subscription.tier]}
                  </span> activé
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                  Réf: <span className="font-mono text-gray-700 dark:text-gray-300">{subscription.transaction_id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
