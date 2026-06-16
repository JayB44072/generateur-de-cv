import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, ChevronDown, Palette, Layout, Wand2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { templates, TemplateConfig } from '../data/templates';

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

async function askClaudeDesign(
  messages: Message[],
  userInput: string,
  content: any
): Promise<{ text: string; suggestedTemplates?: number[] }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return { text: "Clé API manquante dans les variables d'environnement.", suggestedTemplates: [] };
  }

  const systemPrompt = `Tu es un expert en design de CV et identité visuelle professionnelle. 
Tu aides les utilisateurs à choisir le meilleur modèle de CV et à personnaliser leur design.
Tu t'appelles WhiteDukeIA, l'assistant design de WhiteDuke.
Tu as accès à ces modèles de CV (id, nom, style, secteur recommandé) :
GRATUITS : 1=Marine Classique (académique), 2=Minimaliste Stark (juridique), 3=Corporate Bicolonne (gestion), 4=Cadre Exécutif (direction), 5=Ardoise Urbaine (professionnel), 6=Vert Forêt (environnement), 7=Vague Teal (médical), 8=Pro Ambre (commerce), 9=Bleu Acier (ingénierie), 10=Bistre Chaleureux (artisanat), 14=Graphite Mono (IT), 15=Érudit Indigo (académique), 18=Crépuscule Violet (créatif), 20=Grille Tech (développeur), 24=Minuit Pro (cybersécurité), 26=Tranche Cobalt (finance), 29=Menthe Fraîche (santé).
PREMIUM : 31=Tokyo Menthe (créatif/design), 32=Élégance Zurich (luxe), 34=Terracotta Warmth (artiste), 36=Vogue Éditorial (mode), 37=Minimal Nordique (design), 38=Mousse Kyoto (zen/nature), 40=Marine Riviera (luxe/marine), 43=Chic Parisien (mode), 45=Or Sahara (business), 47=Luxe Cramoisi (haut de gamme).
ÉLITE : 33=Silicon Sombre (tech/IA), 35=Bauhaus Berlin (architecture), 39=Néon Cyberpunk (gaming), 42=Aurore Boréale (tech), 44=Quantique Sombre (recherche), 48=Obsidienne Pro (cyber), 49=Élite Émeraude (finance), 50=Ère Dorée (prestige).

Quand tu recommandes des modèles, retourne un JSON à la fin de ton message dans ce format exact :
TEMPLATES:[31,32,37]

Profil du candidat : ${content.personalInfo?.title || 'Non défini'} - ${content.personalInfo?.summary ? content.personalInfo.summary.substring(0, 100) + '...' : 'Pas de résumé'}

Réponds en français, sois concis et enthousiaste. Donne des conseils visuels concrets. Maximum 3-4 phrases.`;

  // Filtrer les messages pour s'assurer qu'aucun texte n'est vide
  const validHistory = messages.filter(m => m.text && m.text.trim() !== "");

  // Construire l'historique de conversation pour Gemini
  const conversationHistory = validHistory.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const allContents = [
    // Le système prompt est injecté comme premier message utilisateur
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: 'Compris ! Je suis WhiteDukeIA, prêt à vous aider.' }] },
    ...conversationHistory,
    { role: 'user', parts: [{ text: userInput }] },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: allContents,
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    }
  );
  // Si Google bloque (429), on intercepte proprement sans crasher
    if (response.status === 429) {
      return { 
        text: "⚠️ L'assistant WhiteDukeIA est très sollicité en ce moment. Veuillez rééssayer dans une minute.", 
        suggestedTemplates: [] 
      };
    }

  if (!response.ok) throw new Error('API Gemini error');
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Extraire les suggestions de templates (même logique qu'avant)
  const templateMatch = text.match(/TEMPLATES:\[([0-9,]+)\]/);
  const suggestedTemplates = templateMatch
    ? templateMatch[1].split(',').map(Number).filter((n: number) => n > 0 && n <= 50)
    : undefined;

  return { text: text.replace(/TEMPLATES:\[[0-9,]+\]/, '').trim(), suggestedTemplates };
}

const QUICK_QUESTIONS = [
  { label: '🎨 Quel modèle pour mon secteur ?', q: 'Recommande-moi le meilleur modèle pour mon secteur et mon profil.' },
  { label: '⭐ Modèles premium ?', q: 'Quels sont les meilleurs modèles premium et élite ?' },
  { label: '🏆 CV minimaliste moderne ?', q: 'Je veux un CV minimaliste et moderne, que recommandes-tu ?' },
  { label: '🚀 CV créatif impactant ?', q: 'Je veux un CV très créatif et qui sort du lot.' },
];

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
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Erreur de connexion. Réessayez dans un instant.' }]);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col"
      style={{
        width: 340, height: 480,
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        border: '1px solid rgba(124,58,237,0.2)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' }} className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-white" />
          <span className="font-bold text-white text-sm">Assistant Design IA</span>
        </div>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
          <X size={14} className="text-white" />
        </button>
      </div>

      {/* Current template badge */}
      {currentTpl && (
        <div className="px-3 py-2 flex items-center gap-2 bg-purple-50 border-b border-purple-100">
          <Layout size={12} className="text-purple-600" />
          <span className="text-xs text-purple-700">Modèle actuel : <strong>{currentTpl.nameFr}</strong></span>
          <div className="w-4 h-4 rounded-full ml-auto" style={{ backgroundColor: currentTpl.primaryColor }} />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div style={{
              maxWidth: '88%',
              backgroundColor: msg.role === 'user' ? '#7C3AED' : '#F3F4F6',
              color: msg.role === 'user' ? '#FFF' : '#111827',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              padding: '8px 12px',
              fontSize: 12,
              lineHeight: 1.55,
            }}>
              {msg.text}

              {/* Suggested templates */}
              {msg.suggestedTemplates && msg.suggestedTemplates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.suggestedTemplates.map(id => {
                    const tpl = templates.find(t => t.id === id);
                    if (!tpl) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => onSelectTemplate(id)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                        style={{
                          backgroundColor: tpl.primaryColor,
                          color: '#FFF',
                          border: currentTemplateId === id ? '2px solid #FFF' : '2px solid transparent',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        <Palette size={10} />
                        {tpl.nameFr}
                        {currentTemplateId === id && ' ✓'}
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

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="px-3 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide border-t border-gray-100">
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q.q)}
              className="shrink-0 px-2.5 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 border-t border-gray-100 flex gap-2 items-center">
        {!canUseAI ? (
          <div className="flex-1 text-center">
            <span className="text-xs text-gray-500">🔒 </span>
            <span className="text-xs text-purple-600 font-medium">Assistant IA — Forfait IA requis</span>
          </div>
        ) : (
          <>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Décrivez votre style souhaité…"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-colors"
            >
              <Send size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
