import { useState } from 'react';
import { X, Star, Send, Smile } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim().length < 3) return;
    setLoading(true);
    await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      full_name: name.trim() || 'Anonyme',
      rating,
      comment: comment.trim(),
    });
    setLoading(false);
    setDone(true);
    setTimeout(onClose, 2000);
  };

  const ratingLabels = ['', 'Pas du tout', 'Peut mieux faire', 'Correct', 'Bien !', 'Excellent !'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Bandeau couleur */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Smile size={28} className="text-green-500" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Merci pour votre avis !</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Votre retour nous aide à améliorer le service.</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Votre avis compte</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comment trouvez-vous notre générateur de CV ?</h2>
            </div>

            {/* Étoiles */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={34}
                    className={`transition-colors ${i <= (hovered || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                  />
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-center text-sm font-medium text-amber-500">{ratingLabels[hovered || rating]}</p>
            )}

            {/* Nom */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Votre prénom (optionnel)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Anonyme"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Commentaire */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Votre commentaire <span className="text-red-400">*</span></label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Dites-nous ce que vous pensez du site, ce qui pourrait être amélioré..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Plus tard
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || comment.trim().length < 3 || loading}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                Envoyer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
