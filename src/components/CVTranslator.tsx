import { useState } from 'react';
import { Languages, Sparkles, Lock, X, CheckCircle, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PaywallModal from './PaywallModal';
import { CVContent } from '../lib/supabase';

const TARGET_LANGUAGES = [
  { code: 'en', label: 'Anglais', flag: '🇬🇧' },
  { code: 'ar', label: 'Arabe', flag: '🇸🇦' },
  { code: 'es', label: 'Espagnol', flag: '🇪🇸' },
  { code: 'de', label: 'Allemand', flag: '🇩🇪' },
  { code: 'pt', label: 'Portugais', flag: '🇵🇹' },
  { code: 'it', label: 'Italien', flag: '🇮🇹' },
  { code: 'zh', label: 'Chinois', flag: '🇨🇳' },
  { code: 'ru', label: 'Russe', flag: '🇷🇺' },
  { code: 'nl', label: 'Néerlandais', flag: '🇳🇱' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
  { code: 'ha', label: 'Haoussa', flag: '🇳🇬' },
  { code: 'yo', label: 'Yoruba', flag: '🇳🇬' },
];

interface Props {
  content: CVContent;
  onApply: (translated: CVContent) => void;
}

async function translateCV(content: CVContent, targetLang: string, targetLabel: string): Promise<CVContent> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `Tu es un traducteur professionnel de CV. Traduis tous les textes de ce CV JSON en ${targetLabel}.
RÈGLES :
- Traduis UNIQUEMENT les valeurs textuelles (title, summary, position, company, degree, field, institution, description, name des compétences/langues/sections).
- Conserve EXACTEMENT les clés JSON, les dates, les emails, les téléphones, les URLs, les IDs.
- Réponds UNIQUEMENT avec le JSON traduit, sans markdown, sans explication.

CV JSON à traduire :
${JSON.stringify(content)}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000 },
      }),
    }
  );

  const data = await response.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  // Extraire le JSON (enlever éventuels blocs markdown)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Réponse invalide');
  return JSON.parse(jsonMatch[0]) as CVContent;
}

export default function CVTranslator({ content, onApply }: Props) {
  const { profile } = useAuth();
  const isAI = profile?.subscription_tier === 'ai';

  const [open, setOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [selected, setSelected] = useState(TARGET_LANGUAGES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = () => {
    if (!isAI) { setPaywallOpen(true); return; }
    setOpen(true);
  };

  const handleTranslate = async () => {
    setLoading(true);
    setError('');
    try {
      const translated = await translateCV(content, selected.code, selected.label);
      onApply(translated);
      setDone(true);
      setTimeout(() => { setDone(false); setOpen(false); }, 1800);
    } catch {
      setError('Erreur lors de la traduction. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant dans l'éditeur */}
      <button
        onClick={handleOpen}
        title={isAI ? 'Traduire le CV' : 'Fonctionnalité Élite IA'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
          isAI
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }`}
      >
        {isAI ? <Languages size={13} /> : <Lock size={13} />}
        Traduire
        {!isAI && <Sparkles size={11} className="text-orange-400" />}
      </button>

      {/* Modal de traduction */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
              <X size={16} />
            </button>

            {done ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle size={28} className="text-green-500" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">CV traduit en {selected.label} !</p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Languages size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white text-base">Traduire mon CV</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tout le contenu sera traduit par IA</p>
                  </div>
                </div>

                {/* Sélecteur de langue */}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Langue cible</label>
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-900 dark:text-white hover:border-purple-400 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{selected.flag}</span>
                      {selected.label}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                      {TARGET_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => { setSelected(lang); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selected.code === lang.code ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3 leading-relaxed">
                  ✨ L'IA traduit le titre, le profil, les expériences, les formations et les compétences. Les dates, emails et URLs ne sont pas modifiés.
                </p>

                {error && (
                  <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={handleTranslate}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                    {loading ? 'Traduction…' : `Traduire en ${selected.label}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {paywallOpen && (
        <PaywallModal
          reason="ai_feature"
          onClose={() => setPaywallOpen(false)}
          onAuthOpen={() => {}}
        />
      )}
    </>
  );
}
