import { useState } from 'react';
import { Crown, Search, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { templates, TemplateConfig, TemplateTier } from '../data/templates';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PaywallModal, { PaywallReason } from './PaywallModal';
import { defaultCVContent } from '../lib/supabase';

interface TemplateGalleryProps {
  selectedId: number;
  onSelect: (id: number) => void;
  onStartEditing?: () => void;
  onAuthOpen: () => void;
}

const tierIcon: Record<TemplateTier, React.ReactNode> = {
  free: null,
  premium: <Crown size={12} className="text-amber-500" />,
  elite: <Sparkles size={12} className="text-orange-500" />,
};

const tierLabel: Record<TemplateTier, { bg: string; text: string; label: string }> = {
  free: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Gratuit' },
  premium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Premium' },
  elite: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Élite IA' },
};

function TemplateMiniPreview({ template }: { template: TemplateConfig }) {
  const isDark = template.bgColor === '#0F172A' || template.bgColor === '#020617' || template.bgColor === '#0A0F1A' || template.bgColor === '#0F0F23';

  if (template.layout === 'sidebar-left' || template.layout === 'sidebar-right') {
    return (
      <div className="w-full h-full flex" style={{ backgroundColor: template.bgColor }}>
        {template.layout === 'sidebar-left' && (
          <div className="w-2/5 h-full p-2 space-y-1.5" style={{ backgroundColor: template.primaryColor }}>
            <div className="w-8 h-8 rounded-full bg-white/30 mx-auto mt-1" />
            <div className="h-1.5 bg-white/40 rounded mx-1" />
            <div className="h-1 bg-white/25 rounded mx-1" />
            <div className="h-1 bg-white/25 rounded mx-1 w-3/4" />
            <div className="mt-2 space-y-1">
              <div className="h-1 bg-white/20 rounded mx-1" />
              <div className="w-full h-0.5 bg-white/20 rounded mx-1" />
              <div className="h-1 bg-white/20 rounded mx-1 w-4/5" />
              <div className="w-4/5 h-0.5 bg-white/20 rounded mx-1" />
            </div>
          </div>
        )}
        <div className="flex-1 p-2 space-y-1.5">
          <div className="h-1.5 rounded" style={{ backgroundColor: template.accentColor + '90', width: '60%' }} />
          <div className="h-1 rounded bg-gray-300/50" style={{ width: '80%' }} />
          <div className="space-y-1 mt-2">
            {[90, 70, 80].map((w, i) => (
              <div key={i} className="h-1 rounded" style={{ backgroundColor: isDark ? '#334155' : '#E5E7EB', width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-2 space-y-0.5">
            <div className="h-0.5 rounded" style={{ backgroundColor: template.accentColor + '60', width: '40%' }} />
            <div className="h-1 rounded" style={{ backgroundColor: isDark ? '#334155' : '#E5E7EB', width: '90%' }} />
            <div className="h-1 rounded" style={{ backgroundColor: isDark ? '#334155' : '#E5E7EB', width: '75%' }} />
          </div>
        </div>
        {template.layout === 'sidebar-right' && (
          <div className="w-2/5 h-full p-2 space-y-1.5" style={{ backgroundColor: template.secondaryColor }}>
            <div className="h-1.5 bg-gray-400/30 rounded" />
            <div className="h-1 bg-gray-300/30 rounded w-3/4" />
            <div className="mt-2 space-y-1">
              {[80, 60, 70, 50].map((w, i) => (
                <div key={i}>
                  <div className="h-0.5 rounded mb-0.5" style={{ backgroundColor: isDark ? '#475569' : '#D1D5DB', width: `${w}%` }} />
                  <div className="w-full h-0.5 rounded" style={{ backgroundColor: template.accentColor + '60' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (template.layout === 'two-col') {
    return (
      <div className="w-full h-full" style={{ backgroundColor: template.bgColor }}>
        <div className="h-1/4 px-2 pt-2 flex items-center gap-2" style={{ backgroundColor: template.primaryColor }}>
          <div>
            <div className="h-2 w-20 bg-white/80 rounded" />
            <div className="h-1 w-14 bg-white/50 rounded mt-0.5" />
          </div>
        </div>
        <div className="flex h-3/4">
          <div className="w-2/5 p-1.5 space-y-1" style={{ backgroundColor: template.secondaryColor }}>
            {[60, 80, 50, 70].map((w, i) => (
              <div key={i} className="h-1 rounded" style={{ backgroundColor: template.accentColor + '50', width: `${w}%` }} />
            ))}
          </div>
          <div className="flex-1 p-1.5 space-y-1">
            {[90, 70, 85, 60].map((w, i) => (
              <div key={i} className="h-1 rounded" style={{ backgroundColor: isDark ? '#334155' : '#D1D5DB', width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (template.layout === 'asymmetric' || template.layout === 'editorial') {
    return (
      <div className="w-full h-full" style={{ backgroundColor: template.bgColor }}>
        <div className="m-1.5 p-2 rounded-xl" style={{ backgroundColor: template.primaryColor }}>
          <div className="h-2 w-24 bg-white/80 rounded mb-1" />
          <div className="h-1 w-16 bg-white/50 rounded" />
          <div className="flex gap-1.5 mt-1">
            {[40, 50, 35].map((w, i) => (
              <div key={i} className="h-0.5 bg-white/40 rounded" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
        <div className="flex gap-1 px-1.5 pb-1.5">
          <div className="flex-1 space-y-1 p-1.5 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
            <div className="h-1 rounded" style={{ backgroundColor: template.accentColor + '80', width: '60%' }} />
            {[80, 65, 75].map((w, i) => (
              <div key={i} className="h-0.5 rounded" style={{ backgroundColor: isDark ? '#475569' : '#D1D5DB', width: `${w}%` }} />
            ))}
          </div>
          <div className="w-1/3 space-y-1 p-1.5 rounded-xl" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
            <div className="h-1 rounded" style={{ backgroundColor: template.accentColor + '80', width: '70%' }} />
            {[90, 70, 80, 60].map((w, i) => (
              <div key={i} className="h-0.5 rounded" style={{ backgroundColor: isDark ? '#475569' : '#D1D5DB', width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default: single column
  return (
    <div className="w-full h-full" style={{ backgroundColor: template.bgColor }}>
      <div className="h-1/4 px-3 flex flex-col justify-center" style={{ backgroundColor: template.primaryColor }}>
        <div className="h-2 w-20 bg-white/80 rounded mb-1" />
        <div className="h-1 w-14 bg-white/50 rounded" />
        <div className="flex gap-2 mt-1">
          <div className="h-0.5 w-12 bg-white/40 rounded" />
          <div className="h-0.5 w-10 bg-white/40 rounded" />
        </div>
      </div>
      <div className="p-2 space-y-2">
        {[1, 2].map(s => (
          <div key={s}>
            <div className="h-1 rounded mb-1" style={{ backgroundColor: template.accentColor + '80', width: '35%' }} />
            <div className="space-y-0.5">
              {[90, 75, 65].map((w, i) => (
                <div key={i} className="h-0.5 rounded" style={{ backgroundColor: isDark ? '#334155' : '#D1D5DB', width: `${w}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplateGallery({ selectedId, onSelect, onStartEditing, onAuthOpen }: TemplateGalleryProps) {
  const { t, lang } = useLang();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | TemplateTier>('all');
  const [paywall, setPaywall] = useState<{ open: boolean; reason: PaywallReason }>({ open: false, reason: 'premium_template' });

  const userTier = profile?.subscription_tier ?? 'free';

  const filtered = templates.filter(tpl => {
    const matchSearch = (lang === 'fr' ? tpl.nameFr : tpl.name).toLowerCase().includes(search.toLowerCase()) ||
      tpl.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === 'all' || tpl.tier === filter;
    return matchSearch && matchFilter;
  });

  const canUseTemplate = (tpl: TemplateConfig) => {
    if (tpl.tier === 'free') return true;
    if (tpl.tier === 'premium') return userTier === 'premium' || userTier === 'ai';
    if (tpl.tier === 'elite') return userTier === 'ai';
    return false;
  };

  const handleUse = (tpl: TemplateConfig) => {
    if (!canUseTemplate(tpl)) {
      setPaywall({ open: true, reason: 'premium_template' });
      return;
    }
    onSelect(tpl.id);
    onStartEditing?.();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.templates.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{t.templates.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                <span className="font-semibold text-gray-900 dark:text-white">30</span> gratuits ·{' '}
                <span className="font-semibold text-amber-600">10</span> premium ·{' '}
                <span className="font-semibold text-orange-600">10</span> élite IA
              </div>
            </div>
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t.templates.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {([
                { key: 'all', label: t.templates.filterAll },
                { key: 'free', label: t.templates.filterFree },
                { key: 'premium', label: t.templates.filterPremium },
                { key: 'elite', label: t.templates.filterElite },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    filter === f.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(tpl => {
            const locked = !canUseTemplate(tpl);
            const isSelected = tpl.id === selectedId;
            const info = tierLabel[tpl.tier];
            const name = lang === 'fr' ? tpl.nameFr : tpl.name;

            return (
              <div
                key={tpl.id}
                className={`group relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${
                  isSelected
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 shadow-sm'
                } bg-white dark:bg-gray-900`}
                onClick={() => handleUse(tpl)}
              >
                {/* Preview */}
                <div className="aspect-[3/4] relative overflow-hidden">
                  <TemplateMiniPreview template={tpl} />

                  {/* Locked overlay */}
                  {locked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2">
                        <Crown size={18} className="text-amber-500" />
                      </div>
                    </div>
                  )}

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                  )}

                  {/* Hover action */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black/80 to-transparent p-3">
                    <button
                      className="w-full py-1.5 bg-white text-gray-900 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                      onClick={e => { e.stopPropagation(); handleUse(tpl); }}
                    >
                      {t.templates.useTemplate}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                    {tpl.tier !== 'free' && (
                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        {tierIcon[tpl.tier]}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${info.bg} ${info.text}`}>
                      {info.label}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">#{tpl.id}</span>
                  </div>
                  {tpl.tier !== 'free' && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 dark:text-gray-600">
            <Search size={40} className="mx-auto mb-3 opacity-50" />
            <p>Aucun modèle trouvé</p>
          </div>
        )}
      </div>

      {paywall.open && (
        <PaywallModal
          reason={paywall.reason}
          onClose={() => setPaywall(p => ({ ...p, open: false }))}
          onAuthOpen={onAuthOpen}
        />
      )}
    </div>
  );
}
