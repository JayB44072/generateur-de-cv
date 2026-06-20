import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Palette, Layout } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { templates } from '../data/templates';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  suggestedTemplates?: number[];
}

interface AIDesignAssistantProps {
  currentTemplateId: number;
  onSelectTemplate: (id: number) => void;
  content: any;
}

// Compact template catalog to reduce prompt size (id:name(tier,primaryTag))
const TEMPLATE_CATALOG = templates
  .map(t => `${t.id}:${t.nameFr}(${t.tier},${t.tags?.[0] || 'general'})`)
  .join('; ');

async function askClaudeDesign(
  messages: Message[],
  userInput: string,
  content: any
): Promise<{ text: string; suggestedTemplates?: number[] }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return { text: "Clé API manquante dans les variables d'environnement.", suggestedTemplates: [] };
  }

  const systemPrompt = `Tu es un assistant expert en design de CV et d'identité visuelle professionnelle nommé WhiteDukeIA.
Tu aides les utilisateurs à choisir le meilleur modèle de CV d'après les modèles disponibles ci-dessous.
Tu dois expliquer clairement pourquoi chaque modèle recommandé est pertinent : structure, style, type d'emploi, lisibilité, contraste et impression professionnelle.
Si les informations sont insuffisantes, pose une question concise pour clarifier le secteur, le type de poste, le niveau d'expérience ou le style préféré de l'utilisateur.
Tu peux proposer jusqu'à 3 modèles quand cela aide à comparer, mais explique toujours la préférence principale.

Modèles disponibles :
${TEMPLATE_CATALOG}

Profil du candidat : ${content.personalInfo?.title || 'Non défini'} - ${content.personalInfo?.summary ? content.personalInfo.summary.substring(0, 100) + '...' : 'Pas de résumé'}

Réponds en français.
Fais une recommandation argumentée avec des conseils visuels concrets.
Finis par un JSON exact au format : TEMPLATES:[31,32,37]
Ne fournis aucune autre structure JSON ni aucun texte après cette balise.`;

  const validHistory = messages.filter(m => m.text && m.text.trim() !== '');
  const conversationHistory = validHistory.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));

  const allContents = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Compris ! Je suis WhiteDukeIA, prêt à vous aider.' }] },
    ...conversationHistory,
    { role: 'user', parts: [{ text: userInput }] },
  ];

  const doRequest = async (contents: any[], config = { maxOutputTokens: 1200, temperature: 0.6, candidateCount: 1, topP: 0.95 }) => {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: config }),
    });
    return res;
  };

  const response = await doRequest(allContents);

  if (response.status === 429) {
    return { text: "⚠️ L'assistant WhiteDukeIA est très sollicité en ce moment. Veuillez rééssayer dans quelques minutes.", suggestedTemplates: [] };
  }

  if (!response.ok) throw new Error('API Gemini error');
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const templateMatch = text.match(/TEMPLATES:\[([0-9,]+)\]/);
  let suggestedTemplates = templateMatch ? templateMatch[1].split(',').map(Number).filter((n: number) => n > 0 && n <= 50) : undefined;
  let cleaned = text.replace(/TEMPLATES:\[[0-9,]+\]/, '').trim();

  // Si aucune balise TEMPLATES, essayer d'extraire des noms de modèles présents dans le texte
  if (!suggestedTemplates) {
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const foundIds: number[] = [];
    const lower = cleaned.toLowerCase();
    for (const t of templates) {
      const nameFr = t.nameFr.toLowerCase();
      const nameEn = t.name.toLowerCase();
      if (lower.includes(nameFr) || lower.includes(nameEn) || new RegExp(`\\b${escapeRegex(nameFr)}\\b`, 'i').test(cleaned) || new RegExp(`\\b${escapeRegex(nameEn)}\\b`, 'i').test(cleaned)) {
        if (!foundIds.includes(t.id)) foundIds.push(t.id);
      }
      if (foundIds.length >= 3) break;
    }
    if (foundIds.length > 0) suggestedTemplates = foundIds;
  }

  const sentenceCount = cleaned.split(/[\.\!\?]\s+/).filter(s => s.trim().length > 0).length;
  if (sentenceCount < 4 || cleaned.length < 120) {
    const expandPrompt = `La réponse précédente est trop courte. Développe et reformule en 4 à 6 phrases structurées : 1) recommandation principale, 2-3) raisons détaillées (structure, lisibilité, adéquation au poste), 4) conseils visuels concrets, 5) action suivante. Termine par la même balise TEMPLATES:[...] (ne répète pas d'autres JSON). Voici la réponse actuelle : "${cleaned.replace(/\"/g, '\\"')}"`;
    const followup = [ { role: 'user', parts: [{ text: systemPrompt }] }, ...conversationHistory, { role: 'user', parts: [{ text: userInput }] }, { role: 'user', parts: [{ text: expandPrompt }] } ];
    const resp2 = await doRequest(followup, { maxOutputTokens: 1200, temperature: 0.5, candidateCount: 1, topP: 0.95 });
    if (resp2.ok) {
      const d2 = await resp2.json();
      const t2 = d2.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const match2 = t2.match(/TEMPLATES:\[([0-9,]+)\]/);
      const suggested2 = match2 ? match2[1].split(',').map(Number).filter((n: number) => n > 0 && n <= 50) : suggestedTemplates;
      cleaned = t2.replace(/TEMPLATES:\[[0-9,]+\]/, '').trim();
      return { text: cleaned, suggestedTemplates: suggested2 };
    }
  }

  if (!templateMatch) {
    const requestTemplatesPrompt = `La réponse précédente n'incluait pas la balise TEMPLATES. En français, renvoie la recommandation complète (4-6 phrases structurées) et TERMINE par la seule balise TEMPLATES:[id1,id2,...] correspondant aux modèles recommandés.`;
    const followup2 = [ { role: 'user', parts: [{ text: systemPrompt }] }, ...conversationHistory, { role: 'user', parts: [{ text: userInput }] }, { role: 'user', parts: [{ text: requestTemplatesPrompt }] } ];
    const respT = await doRequest(followup2, { maxOutputTokens: 800, temperature: 0.5, candidateCount: 1, topP: 0.9 });
    if (respT.ok) {
      const dt = await respT.json();
      const tt = dt.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const matchT = tt.match(/TEMPLATES:\[([0-9,]+)\]/);
      const suggestedT = matchT ? matchT[1].split(',').map(Number).filter((n: number) => n > 0 && n <= 50) : undefined;
      cleaned = tt.replace(/TEMPLATES:\[[0-9,]+\]/, '').trim();
      return { text: cleaned, suggestedTemplates: suggestedT };
    }
  }

  if (!/[\.\!\?]\s*$/.test(cleaned)) {
    const finishPrompt = `La réponse précédente semble incomplète. Termine correctement la phrase finale et fournis la recommandation complète en 4-6 phrases, puis la balise TEMPLATES:[...]`;
    const followup3 = [ { role: 'user', parts: [{ text: systemPrompt }] }, ...conversationHistory, { role: 'user', parts: [{ text: userInput }] }, { role: 'user', parts: [{ text: finishPrompt }] } ];
    const respF = await doRequest(followup3, { maxOutputTokens: 600, temperature: 0.4, candidateCount: 1, topP: 0.9 });
    if (respF.ok) {
      const df = await respF.json();
      const tf = df.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const matchF = tf.match(/TEMPLATES:\[([0-9,]+)\]/);
      const suggestedF = matchF ? matchF[1].split(',').map(Number).filter((n: number) => n > 0 && n <= 50) : suggestedTemplates;
      cleaned = tf.replace(/TEMPLATES:\[[0-9,]+\]/, '').trim();
      return { text: cleaned, suggestedTemplates: suggestedF };
    }
  }

  return { text: cleaned, suggestedTemplates };
}

export default function AIDesignAssistant({ currentTemplateId, onSelectTemplate, content }: AIDesignAssistantProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '👋 Bonjour ! Je suis votre assistant design WhiteDukeIA. Dites-moi votre secteur, vos goûts ou posez-moi vos questions sur le design de votre CV — je vous recommanderai les meilleurs modèles !' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const canUseAI = profile?.subscription_tier === 'ai' || profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'elite';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await askClaudeDesign(messages, text, content);
      const assistantMsg: Message = {
        role: 'assistant',
        text: result.text,
        suggestedTemplates: result.suggestedTemplates,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Erreur de connexion. Réessayez dans un instant.' }]);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    { label: '🎨 Quel modèle pour mon secteur ?', q: 'Recommande-moi le meilleur modèle pour mon secteur et mon profil.' },
    { label: '⭐ Modèles premium ?', q: 'Quels sont les meilleurs modèles premium et élite ?' },
    { label: '🏆 CV minimaliste moderne ?', q: 'Je veux un CV minimaliste et moderne, que recommandes-tu ?' },
    { label: '🚀 CV créatif impactant ?', q: 'Je veux un CV très créatif et qui sort du lot.' },
  ];

  const currentTpl = templates.find(t => t.id === currentTemplateId);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-semibold text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }}
      >
        <Sparkles size={16} className="animate-pulse" />
        Assistant Design WhiteDukeIA
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col" style={{ width: 340, height: 480, background: 'white', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid rgba(124,58,237,0.2)', overflow: 'hidden' }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }} className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-white" />
          <span className="font-bold text-white text-sm">Assistant Design IA</span>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
          <X size={14} className="text-white" />
        </button>
      </div>

      {currentTpl && (
        <div className="px-3 py-2 flex items-center gap-2 bg-purple-50 border-b border-purple-100">
          <Layout size={12} className="text-purple-600" />
          <span className="text-xs text-purple-700">Modèle actuel : <strong>{currentTpl.nameFr}</strong></span>
          <div className="w-4 h-4 rounded-full ml-auto" style={{ backgroundColor: currentTpl.primaryColor }} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div style={{ maxWidth: '88%', backgroundColor: msg.role === 'user' ? '#7C3AED' : '#F3F4F6', color: msg.role === 'user' ? '#FFF' : '#111827', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '8px 12px', fontSize: 12, lineHeight: 1.55 }}>
              {msg.text}

              {msg.suggestedTemplates && msg.suggestedTemplates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestedTemplates.map(id => {
                    const tpl = templates.find(t => t.id === id);
                    if (!tpl) return null;
                    return (
                      <button key={id} onClick={() => onSelectTemplate(id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105" style={{ backgroundColor: tpl.primaryColor, color: '#FFF', border: currentTemplateId === id ? '2px solid #FFF' : '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <Palette size={10} />
                        {tpl.nameFr}{currentTemplateId === id && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 bg-gray-100 rounded-2xl flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide border-t border-gray-100">
          {QUICK_QUESTIONS.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q.q)} className="shrink-0 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200">
              {q.label}
            </button>
          ))}
        </div>
      )}

      <div className="px-3 py-2 border-t border-gray-100 flex gap-2 items-center">
        {!canUseAI ? (
          <div className="flex-1 text-center"><span className="text-xs text-gray-500">🔒 </span><span className="text-xs text-purple-600 font-medium">Assistant IA — Forfait IA requis</span></div>
        ) : (
          <>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)} placeholder="Décrivez votre style souhaité…" disabled={loading} className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
            <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-colors"><Send size={13} /></button>
          </>
        )}
      </div>
    </div>
  );
}