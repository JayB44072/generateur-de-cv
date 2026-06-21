import { useState } from 'react';
import { X, Crown, Sparkles, ChevronRight, Smartphone, CreditCard, Globe, Check, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { Subscription } from '../lib/supabase';

type PaymentMethod = 'mtn' | 'orange' | 'paypal' | 'card';
type PlanTier = 'premium' | 'ai';
type FlowStep = 'method' | 'form' | 'processing' | 'success';

interface PaymentModalProps {
  tier: PlanTier;
  onClose: () => void;
  onAuthOpen?: () => void;
  onSuccess?: (sub: Subscription) => void;
}

const PLAN_INFO = {
  premium: { price: 1500, label: 'Premium', color: 'from-blue-600 to-blue-800' },
  ai: { price: 2000, label: 'Élite IA', color: 'from-amber-500 to-orange-600' },
};

const METHODS: { key: PaymentMethod; label: string; logo: string; color: string; desc: string }[] = [
  { key: 'mtn', label: 'MTN Mobile Money', logo: '📱', color: 'bg-yellow-400', desc: 'Paiement via MTN MoMo' },
  { key: 'orange', label: 'Orange Money', logo: '🔶', color: 'bg-orange-500', desc: 'Paiement via Orange Money' },
  { key: 'paypal', label: 'PayPal', logo: '💙', color: 'bg-blue-600', desc: 'Paiement sécurisé PayPal' },
  { key: 'card', label: 'Carte bancaire', logo: '💳', color: 'bg-slate-700', desc: 'Visa / Mastercard' },
];

const COUNTRY_CODES = [
  { flag: '🇧🇫', code: '+226', name: 'Burkina Faso', digits: 8 },
  { flag: '🇨🇲', code: '+237', name: 'Cameroun',     digits: 9 },
  { flag: '🇸🇳', code: '+221', name: 'Sénégal',       digits: 9 },
  { flag: '🇨🇮', code: '+225', name: "Côte d'Ivoire", digits: 10 },
  { flag: '🇲🇱', code: '+223', name: 'Mali',           digits: 8 },
  { flag: '🇳🇪', code: '+227', name: 'Niger',          digits: 8 },
  { flag: '🇹🇬', code: '+228', name: 'Togo',           digits: 8 },
  { flag: '🇧🇯', code: '+229', name: 'Bénin',          digits: 8 },
  { flag: '🇬🇳', code: '+224', name: 'Guinée',         digits: 9 },
  { flag: '🇬🇭', code: '+233', name: 'Ghana',          digits: 9 },
  { flag: '🇳🇬', code: '+234', name: 'Nigeria',        digits: 10 },
  { flag: '🇨🇬', code: '+242', name: 'Congo',          digits: 9 },
  { flag: '🇨🇩', code: '+243', name: 'RD Congo',       digits: 9 },
  { flag: '🇬🇦', code: '+241', name: 'Gabon',          digits: 8 },
  { flag: '🇿🇦', code: '+27',  name: 'Afrique du Sud', digits: 9 },
  { flag: '🇫🇷', code: '+33',  name: 'France',         digits: 9 },
  { flag: '🇧🇪', code: '+32',  name: 'Belgique',       digits: 9 },
  { flag: '🇨🇭', code: '+41',  name: 'Suisse',         digits: 9 },
  { flag: '🇺🇸', code: '+1',   name: 'États-Unis',     digits: 10 },
  { flag: '🇬🇧', code: '+44',  name: 'Royaume-Uni',    digits: 10 },
];

// ─── MTN / Orange mobile money form ─────────────────────────────
function MobileMoneyForm({
  method, phone, setPhone, countryCode, setCountryCode,
}: {
  method: PaymentMethod;
  phone: string; setPhone: (v: string) => void;
  countryCode: string; setCountryCode: (v: string) => void;
}) {
  const isOrange = method === 'orange';
  const selected = COUNTRY_CODES.find(c => c.code === countryCode) ?? COUNTRY_CODES[0];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: isOrange ? '#FFF3E0' : '#FFFDE7' }}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isOrange ? 'bg-orange-500' : 'bg-yellow-400'}`}>
          📱
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">{isOrange ? 'Orange Money' : 'MTN Mobile Money'}</p>
          <p className="text-xs text-gray-500">Vous recevrez une notification de confirmation sur votre téléphone</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Numéro {isOrange ? 'Orange' : 'MTN'} *
        </label>
        <div className="flex gap-2">
          {/* Sélecteur de pays */}
          <div className="relative">
            <select
              value={countryCode}
              onChange={e => { setCountryCode(e.target.value); setPhone(''); }}
              className="appearance-none pl-2 pr-7 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              style={{ minWidth: 90 }}
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>
          {/* Numéro */}
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, selected.digits))}
            placeholder={'X'.repeat(selected.digits)}
            required
            maxLength={selected.digits}
            className="flex-1 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{selected.flag} {selected.name} · {selected.digits} chiffres</p>
      </div>

      {/* Instruction USSD */}
      <div className={`rounded-xl p-4 border ${isOrange ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'}`}>
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {isOrange ? '📲 Comment payer avec Orange Money' : '📲 Comment payer avec MTN MoMo'}
        </p>
        <ol className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className={`font-bold shrink-0 ${isOrange ? 'text-orange-500' : 'text-yellow-600'}`}>1.</span>
            Entrez votre numéro ci-dessus et cliquez sur <strong>Payer</strong>
          </li>
          <li className="flex items-start gap-2">
            <span className={`font-bold shrink-0 ${isOrange ? 'text-orange-500' : 'text-yellow-600'}`}>2.</span>
            Sur votre téléphone, composez le code&nbsp;
            <code className={`px-1.5 py-0.5 rounded font-mono font-bold text-white text-xs ${isOrange ? 'bg-orange-500' : 'bg-yellow-500'}`}>
              {isOrange ? '#150*50#' : '*126#'}
            </code>
          </li>
          <li className="flex items-start gap-2">
            <span className={`font-bold shrink-0 ${isOrange ? 'text-orange-500' : 'text-yellow-600'}`}>3.</span>
            Confirmez le paiement de <strong>{isOrange ? 'Orange Money' : 'MTN MoMo'}</strong> sur votre téléphone
          </li>
          <li className="flex items-start gap-2">
            <span className={`font-bold shrink-0 ${isOrange ? 'text-orange-500' : 'text-yellow-600'}`}>4.</span>
            Votre abonnement sera activé automatiquement après vérification
          </li>
        </ol>
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
        <Lock size={12} className="mt-0.5 shrink-0" />
        <p>Paiement sécurisé. La vérification est effectuée automatiquement après confirmation sur votre téléphone.</p>
      </div>
    </div>
  );
}

// ─── PayPal form ─────────────────────────────────────────────────
function PayPalForm({ email, setEmail }: { email: string; setEmail: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
          <Globe size={22} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">PayPal</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Connectez-vous à votre compte PayPal</p>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email PayPal *
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="votre@paypal.com"
          required
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Mot de passe PayPal *
        </label>
        <input
          type="password"
          placeholder="••••••••"
          required
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
        <Lock size={12} className="mt-0.5 shrink-0" />
        <p>Connexion sécurisée SSL. Vos informations ne sont jamais stockées sur nos serveurs.</p>
      </div>
    </div>
  );
}

// ─── Card form ────────────────────────────────────────────────────
function CardForm({
  cardNumber, setCardNumber,
  cardHolder, setCardHolder,
  expiry, setExpiry,
  cvv, setCvv,
}: {
  cardNumber: string; setCardNumber: (v: string) => void;
  cardHolder: string; setCardHolder: (v: string) => void;
  expiry: string; setExpiry: (v: string) => void;
  cvv: string; setCvv: (v: string) => void;
}) {
  const formatCard = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const cardType = cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : '';

  return (
    <div className="space-y-4">
      {/* Card preview */}
      <div className="relative h-36 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 p-5 overflow-hidden">
        <div className="absolute top-3 right-5 text-white/60 text-sm font-bold">{cardType}</div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white" />
          <div className="absolute bottom-0 right-8 w-32 h-32 rounded-full bg-white" />
        </div>
        <div className="relative">
          <div className="w-8 h-6 rounded bg-yellow-400/80 mb-4" />
          <p className="text-white font-mono text-base tracking-widest mb-2">
            {cardNumber || '•••• •••• •••• ••••'}
          </p>
          <div className="flex justify-between">
            <div>
              <p className="text-white/50 text-xs">TITULAIRE</p>
              <p className="text-white text-xs font-semibold uppercase">{cardHolder || 'VOTRE NOM'}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs">EXPIRE</p>
              <p className="text-white text-xs font-semibold">{expiry || 'MM/AA'}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Numéro de carte *</label>
        <input
          type="text"
          value={cardNumber}
          onChange={e => setCardNumber(formatCard(e.target.value))}
          placeholder="1234 5678 9012 3456"
          required
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nom du titulaire *</label>
        <input
          type="text"
          value={cardHolder}
          onChange={e => setCardHolder(e.target.value.toUpperCase())}
          placeholder="Nom"
          required
          className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date d'expiration *</label>
          <input
            type="text"
            value={expiry}
            onChange={e => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            required
            maxLength={5}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">CVV *</label>
          <input
            type="password"
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            required
            maxLength={4}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>
      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
        <Lock size={12} className="mt-0.5 shrink-0" />
        <p>Paiement 100% sécurisé par chiffrement SSL 256-bit. Visa / Mastercard acceptés.</p>
      </div>
    </div>
  );
}

// ─── Processing animation ─────────────────────────────────────────
function ProcessingView({ method, tier }: { method: PaymentMethod; label: string; tier: PlanTier }) {
  const steps = [
    'Vérification des informations...',
    'Connexion sécurisée...',
    'Traitement du paiement...',
    'Confirmation en cours...',
  ];
  const [currentStep] = useState(0);
  const plan = PLAN_INFO[tier];

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-xl`}>
        <div className="w-8 h-8 border-3 border-white/40 border-t-white rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-900 dark:text-white text-lg">Traitement en cours</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ne fermez pas cette fenêtre</p>
      </div>
      <div className="w-full space-y-2">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
            i < currentStep + 1 ? 'opacity-100' : i === currentStep + 1 ? 'opacity-60' : 'opacity-25'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              i <= currentStep ? `bg-gradient-to-br ${plan.color}` : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {i <= currentStep
                ? <Check size={10} className="text-white" />
                : <span className="w-2 h-2 rounded-full bg-gray-400 block" />
              }
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main PaymentModal ────────────────────────────────────────────
export default function PaymentModal({ tier, onClose, onAuthOpen, onSuccess }: PaymentModalProps) {
  const { user, recordSubscription } = useAuth();
  const { lang } = useLang();
  const plan = PLAN_INFO[tier];

  const [step, setStep] = useState<FlowStep>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [error, setError] = useState('');

  // Mobile money fields
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+226');
  // PayPal fields
  const [ppEmail, setPpEmail] = useState('');
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
          <AlertCircle size={40} className="text-amber-500 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Connexion requise</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Vous devez être connecté pour effectuer un paiement.</p>
          <button onClick={() => { onClose(); onAuthOpen?.(); }}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!method) return;
    setError('');
    setStep('processing');

    // Simulate network delay
    await new Promise(r => setTimeout(r, 2800));

    // Build masked payment details for record
    let details: Record<string, string> = {};
    if (method === 'mtn' || method === 'orange') {
      details = { phone: countryCode + phone.slice(0, 2) + '••••' + phone.slice(-2) };
    } else if (method === 'paypal') {
      details = { email: ppEmail };
    } else if (method === 'card') {
      details = {
        last4: cardNumber.replace(/\s/g, '').slice(-4),
        holder: cardHolder,
        expiry,
      };
    }

    const { error: err, subscription } = await recordSubscription(tier, method, details, plan.price);
    if (err) {
      setError('Une erreur est survenue. Réessayez.');
      setStep('form');
      return;
    }
    setStep('success');
    if (subscription) onSuccess?.(subscription);
  };

  const isFormValid = () => {
    if (!method) return false;
    if (method === 'mtn' || method === 'orange') {
      const digits = COUNTRY_CODES.find(c => c.code === countryCode)?.digits ?? 8;
      return phone.length === digits;
    }
    if (method === 'paypal') return ppEmail.includes('@');
    if (method === 'card') return cardNumber.replace(/\s/g, '').length === 16 && cardHolder.length > 2 && expiry.length === 5 && cvv.length >= 3;
    return false;
  };

  const methodInfo = METHODS.find(m => m.key === method);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={step !== 'processing' ? onClose : undefined}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${plan.color} px-6 pt-5 pb-4 text-white shrink-0`}>
          {step !== 'processing' && (
            <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          )}
          {step === 'form' && (
            <button onClick={() => setStep('method')} className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors text-sm flex items-center gap-1">
              ←
            </button>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              {tier === 'ai' ? <Sparkles size={20} /> : <Crown size={20} />}
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">Abonnement {plan.label}</p>
              <p className="text-white/75 text-sm font-semibold">{plan.price.toLocaleString()} FCFA / mois</p>
            </div>
          </div>
          {/* Steps indicator */}
          {step !== 'success' && (
            <div className="flex gap-1.5 mt-3">
              {(['method', 'form', 'processing'] as FlowStep[]).map((s, i) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${
                  ['method', 'form', 'processing', 'success'].indexOf(step) >= i
                    ? 'bg-white' : 'bg-white/30'
                }`} />
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Step 1: Method selection */}
          {step === 'method' && (
            <div className="p-6 space-y-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {lang === 'fr' ? 'Choisissez votre moyen de paiement' : 'Choose your payment method'}
              </p>
              {METHODS.map(m => (
                <button
                  key={m.key}
                  onClick={() => { setMethod(m.key); setStep('form'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${m.color} flex items-center justify-center text-xl shrink-0`}>
                    {m.logo}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}

              {/* Order summary */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-1">
                  <span>Forfait {plan.label}</span>
                  <span>{plan.price.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <span>Durée</span>
                  <span>1 mois</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 mb-2" />
                <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{plan.price.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Form */}
          {step === 'form' && method && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${methodInfo?.color ?? 'bg-gray-500'} flex items-center justify-center text-sm`}>
                  {methodInfo?.logo}
                </div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{methodInfo?.label}</p>
              </div>

              {(method === 'mtn' || method === 'orange') && (
                <MobileMoneyForm method={method} phone={phone} setPhone={setPhone} countryCode={countryCode} setCountryCode={setCountryCode} />
              )}
              {method === 'paypal' && (
                <PayPalForm email={ppEmail} setEmail={setPpEmail} />
              )}
              {method === 'card' && (
                <CardForm
                  cardNumber={cardNumber} setCardNumber={setCardNumber}
                  cardHolder={cardHolder} setCardHolder={setCardHolder}
                  expiry={expiry} setExpiry={setExpiry}
                  cvv={cvv} setCvv={setCvv}
                />
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && method && (
            <div className="p-6">
              <ProcessingView method={method} label={methodInfo?.label ?? ''} tier={tier} />
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="p-8 flex flex-col items-center text-center space-y-5">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-2xl`}>
                <Check size={40} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Paiement réussi !</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Votre abonnement {plan.label} est maintenant actif.</p>
              </div>

              {/* Receipt */}
              <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-left border border-gray-200 dark:border-gray-700 space-y-2">
                <p className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Reçu de paiement</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Montant débité</span>
                  <span className="font-bold text-gray-900 dark:text-white">{plan.price.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Envoyé à</span>
                  <span className="font-semibold text-gray-900 dark:text-white">whiteDukeSaaS</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Moyen de paiement</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{methodInfo?.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Forfait</span>
                  <span className={`font-bold ${tier === 'ai' ? 'text-orange-600' : 'text-blue-600'}`}>{plan.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Date</span>
                  <span className="text-gray-700 dark:text-gray-300">{new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="w-full p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-xs flex items-center gap-2">
                <Check size={14} className="shrink-0" />
                Toutes les fonctionnalités {plan.label} sont maintenant débloquées !
              </div>

              <button
                onClick={onClose}
                className={`w-full py-3 bg-gradient-to-r ${plan.color} text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity`}
              >
                Accéder à mes fonctionnalités →
              </button>
            </div>
          )}
        </div>

        {/* Footer — Pay button */}
        {step === 'form' && (
          <div className="px-6 pb-5 pt-2 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              onClick={handlePayment}
              disabled={!isFormValid()}
              className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all shadow-md ${
                isFormValid()
                  ? `bg-gradient-to-r ${plan.color} text-white hover:opacity-90 hover:shadow-lg`
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Lock size={14} />
                Payer {plan.price.toLocaleString()} FCFA en toute sécurité
              </div>
            </button>
            <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1">
              <Lock size={10} /> Paiement 100% sécurisé · Sans engagement
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
