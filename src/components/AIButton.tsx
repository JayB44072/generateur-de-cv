import { useState } from 'react';
import { Sparkles, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import PaywallModal from './PaywallModal';

interface AIButtonProps {
  text: string;
  onImprove: (improved: string) => void;
  context?: string; // e.g. "résumé professionnel", "description de poste", "compétence"
  className?: string;
}

// Remplacer cette fonction :
async function improveWithClaude(text: string, context: string): Promise<string> {
  if (!text.trim()) return text;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const prompt = `Tu es un expert en rédaction de CV professionnels en français. 
Tu améliores les textes de CV pour les rendre plus percutants, professionnels et convaincants.
Tu gardes le même sens mais améliores le style, la clarté et l'impact.
Tu réponds UNIQUEMENT avec le texte amélioré, sans explication ni formatage supplémentaire.
Le texte doit rester concis et adapté à un CV (2-4 phrases max pour un résumé, 1-3 lignes pour une description).

Améliore ce ${context} pour un CV professionnel :

${text}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000 },
      }),
    }
  );

  if (!response.ok) throw new Error('API Gemini error');
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? text;
}

export default function AIButton({ text, onImprove, context = 'texte', className = '' }: AIButtonProps) {
  const { profile } = useAuth();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUseAI = profile?.subscription_tier === 'ai';

  const handleClick = async () => {
    if (!canUseAI) {
      setShowPaywall(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const improved = await improveWithClaude(text, context);
      onImprove(improved);
    } catch {
      setError('Erreur IA. Réessayez.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative inline-flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          title={canUseAI ? t.editor.personal.improveAI : t.ai.lockedDesc}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            canUseAI
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm hover:shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-pointer'
          } ${className}`}
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : canUseAI ? (
            <Sparkles size={12} />
          ) : (
            <Lock size={12} />
          )}
          {loading ? 'Amélioration…' : t.editor.personal.improveAI}
        </button>
        {error && (
          <span className="absolute -bottom-5 right-0 text-xs text-red-500 whitespace-nowrap">{error}</span>
        )}
      </div>

      {showPaywall && (
        <PaywallModal reason="ai_feature" onClose={() => setShowPaywall(false)} />
      )}
    </>
  );
}
