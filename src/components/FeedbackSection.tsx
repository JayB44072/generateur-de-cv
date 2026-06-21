import { useEffect, useState } from 'react';
import { Star, MessageSquare, Send, Smile } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackRow {
  id: string;
  full_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ratingLabels = ['', 'Pas du tout', 'Peut mieux faire', 'Correct', 'Bien !', 'Excellent !'];

function StarRow({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star key={i} size={12} className={i < value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'} />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)} j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function FeedbackSection() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(profile?.full_name || '');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  async function fetchFeedback() {
    setLoading(true);
    const { data } = await supabase
      .from('feedback')
      .select('id, full_name, rating, comment, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setItems(data ?? []);
    setLoading(false);
  }

  const avgRating = items.length
    ? Math.round((items.reduce((s, r) => s + r.rating, 0) / items.length) * 10) / 10
    : 0;

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim().length < 3) return;
    setSubmitting(true);
    await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      full_name: name.trim() || 'Anonyme',
      rating,
      comment: comment.trim(),
    });
    setSubmitting(false);
    setDone(true);
    await fetchFeedback();
    setTimeout(() => { setDone(false); setShowForm(false); setRating(0); setComment(''); }, 2500);
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-4">
            <MessageSquare size={13} />
            Avis de la communauté
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Ce qu'ils pensent du site</h2>
          {items.length > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-3xl font-black text-amber-500">{avgRating}</span>
              <div className="flex flex-col items-start gap-0.5">
                <StarRow value={Math.round(avgRating)} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{items.length} avis</span>
              </div>
            </div>
          )}
        </div>

        {/* Bouton donner un avis */}
        {!showForm && (
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
            >
              <Star size={15} />
              Laisser un avis
            </button>
          </div>
        )}

        {/* Formulaire inline */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            {done ? (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Smile size={24} className="text-green-500" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white">Merci pour votre avis !</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Votre avis</h3>

                {/* Étoiles */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(i)} className="transition-transform hover:scale-110">
                        <Star size={28} className={`transition-colors ${i <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                      </button>
                    ))}
                  </div>
                  {(hovered || rating) > 0 && (
                    <span className="text-sm font-medium text-amber-500">{ratingLabels[hovered || rating]}</span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Votre prénom (optionnel)"
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div /> {/* spacer */}
                </div>

                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Partagez votre expérience avec le générateur de CV..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div className="flex gap-3">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || comment.trim().length < 3 || submitting}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                    Publier
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Liste des avis */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-8">Soyez le premier à laisser un avis !</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {item.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{item.full_name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(item.created_at)}</p>
                    </div>
                  </div>
                  <StarRow value={item.rating} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
