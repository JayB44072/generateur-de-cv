import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, FileText, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

interface AuthModalProps {
  onClose: () => void;
}

type View = 'login' | 'signup' | 'forgot';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const { t, lang } = useLang();

  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password match state — only meaningful when confirmPassword has been typed
  const passwordTouched = confirmPassword.length > 0;
  const passwordsMatch = password === confirmPassword;
  const confirmBorderClass = !passwordTouched
    ? 'border-gray-300 dark:border-gray-700'
    : passwordsMatch
    ? 'border-green-500 dark:border-green-500 ring-1 ring-green-400/40'
    : 'border-red-400 dark:border-red-500 ring-1 ring-red-400/40';

  const reset = (newView: View) => {
    setView(newView);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (view === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err === 'invalid_credentials' ? t.auth.errorInvalidCredentials : t.auth.errorGeneric);
      } else {
        setSuccess(t.auth.loginSuccess);
        setTimeout(onClose, 900);
      }
    } else if (view === 'signup') {
      if (!passwordsMatch) {
        setError(lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        setError(err === 'email_taken' ? t.auth.errorEmailTaken : t.auth.errorGeneric);
      } else {
        setSuccess(t.auth.signupSuccess);
        setTimeout(onClose, 1200);
      }
    } else if (view === 'forgot') {
      const { error: err } = await resetPassword(email);
      if (err) {
        setError(t.auth.errorGeneric);
      } else {
        setSuccess(
          lang === 'fr'
            ? 'Un lien de réinitialisation a été envoyé à votre adresse email.'
            : 'A reset link has been sent to your email address.'
        );
      }
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(t.auth.errorGeneric);
      setGoogleLoading(false);
    }
    // On success, browser redirects — no need to setLoading(false)
  };

  // ─── Header labels ────────────────────────────────────────────
  const titles = {
    login: { fr: 'Connexion', en: 'Login' },
    signup: { fr: 'Créer un compte', en: 'Create account' },
    forgot: { fr: 'Mot de passe oublié', en: 'Forgot password' },
  };

  const subtitles = {
    login: {
      fr: "Pas encore de compte ?",
      en: "Don't have an account?",
      link: { fr: "S'inscrire", en: 'Sign up' },
      target: 'signup' as View,
    },
    signup: {
      fr: 'Déjà un compte ?',
      en: 'Already have an account?',
      link: { fr: 'Se connecter', en: 'Log in' },
      target: 'login' as View,
    },
    forgot: null,
  };

  const subtitle = subtitles[view];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 pt-8 pb-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Back button for forgot view */}
          {view === 'forgot' && (
            <button
              onClick={() => reset('login')}
              className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FileText size={20} />
            </div>
            <span className="font-bold text-xl">whitedukeSaaS</span>
          </div>

          <h2 className="text-2xl font-bold">
            {lang === 'fr' ? titles[view].fr : titles[view].en}
          </h2>

          {subtitle && (
            <p className="text-blue-200 text-sm mt-1">
              {lang === 'fr' ? subtitle.fr : subtitle.en}{' '}
              <button
                onClick={() => reset(subtitle.target)}
                className="text-white font-semibold underline hover:no-underline"
              >
                {lang === 'fr' ? subtitle.link.fr : subtitle.link.en}
              </button>
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">

          {/* Google button — login & signup only */}
          {view !== 'forgot' && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {lang === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                  {lang === 'fr' ? 'ou par email' : 'or with email'}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>
            </>
          )}

          {/* Full name — signup only */}
          {view === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t.auth.fullName}
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                  placeholder="Nom Complet"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              {t.auth.email}
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          {/* Password — login & signup only */}
          {view !== 'forgot' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {t.auth.password}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm password — signup only */}
          {view === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                {lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 text-sm transition-all border ${confirmBorderClass} ${
                    passwordTouched && passwordsMatch ? 'focus:ring-green-400/40' : passwordTouched ? 'focus:ring-red-400/40' : 'focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                {/* Match indicator icon */}
                {passwordTouched && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {passwordsMatch
                      ? <CheckCircle2 size={15} className="text-green-500" />
                      : <AlertCircle size={15} className="text-red-400" />
                    }
                  </div>
                )}
              </div>
              {/* Inline hint */}
              {passwordTouched && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {lang === 'fr' ? 'Les mots de passe ne correspondent pas.' : 'Passwords do not match.'}
                </p>
              )}
              {passwordTouched && passwordsMatch && (
                <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  {lang === 'fr' ? 'Les mots de passe correspondent.' : 'Passwords match.'}
                </p>
              )}
            </div>
          )}

          {/* Forgot password link — login view only */}
          {view === 'login' && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => reset('forgot')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {t.auth.forgotPassword}
              </button>
            </div>
          )}

          {/* Error / success */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-start gap-2">
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (view === 'signup' && passwordTouched && !passwordsMatch)}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-sm text-sm mt-1"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t.common.loading}
              </span>
            ) : view === 'login' ? t.auth.loginBtn
              : view === 'signup' ? t.auth.signupBtn
              : (lang === 'fr' ? 'Envoyer le lien' : 'Send reset link')}
          </button>

          {/* Forgot password back link */}
          {view === 'forgot' && !success && (
            <button
              type="button"
              onClick={() => reset('login')}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} />
              {lang === 'fr' ? 'Retour à la connexion' : 'Back to login'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
