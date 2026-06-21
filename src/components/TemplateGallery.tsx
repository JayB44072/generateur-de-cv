import { useState, memo } from 'react';
import { Crown, Search, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { templates, TemplateConfig, TemplateTier } from '../data/templates';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PaywallModal, { PaywallReason } from './PaywallModal';
import { defaultCVContent } from '../lib/supabase';
import CVRenderer from './CVRenderer';

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

// Contenu de démonstration enrichi pour que les aperçus reflètent le vrai rendu
const previewContent = {
  ...defaultCVContent,
  profilePhoto: '',
  personalInfo: {
    firstName: 'Sophie',
    lastName: 'Martin',
    title: 'Responsable Marketing Digital',
    email: 'sophie.martin@email.com',
    phone: '+33 6 12 34 56 78',
    address: 'Paris, France',
    website: 'sophiemartin.fr',
    linkedin: 'linkedin.com/in/sophiemartin',
    summary: 'Professionnelle créative avec 6 ans d\'expérience en marketing digital, spécialisée dans la stratégie de contenu et l\'acquisition client.',
  },
  experiences: [
    { id: '1', position: 'Responsable Marketing', company: 'Agence Créative', location: 'Paris', startDate: '2021', endDate: '', current: true, description: 'Pilotage de campagnes digitales multi-canaux.' },
    { id: '2', position: 'Chargée de Communication', company: 'StartupTech', location: 'Lyon', startDate: '2018', endDate: '2021', current: false, description: 'Gestion des réseaux sociaux et création de contenu.' },
  ],
  educations: [
    { id: '1', degree: 'Master Marketing Digital', field: 'Communication', institution: 'Université Paris-Saclay', location: 'Paris', startDate: '2016', endDate: '2018', current: false, description: '' },
    { id: '2', degree: 'Licence Info-Com', field: 'Médias', institution: 'Université Lyon 2', location: 'Lyon', startDate: '2013', endDate: '2016', current: false, description: '' },
  ],
  skills: [
    { id: '1', name: 'Marketing Digital', level: 5, category: 'Métier' },
    { id: '2', name: 'Adobe Creative Suite', level: 4, category: 'Outils' },
    { id: '3', name: 'SEO / SEA', level: 4, category: 'Technique' },
    { id: '4', name: 'Gestion de projet', level: 5, category: 'Gestion' },
  ],
  languages: [
    { id: '1', name: 'Français', level: 'Native' },
    { id: '2', name: 'Anglais', level: 'C1' },
    { id: '3', name: 'Espagnol', level: 'B2' },
  ],
  customSections: [],
};

// Rendu réel du CV à l'échelle de la carte — reflète exactement le vrai résultat PDF
const TemplateMiniPreview = memo(function TemplateMiniPreview({ template }: { template: TemplateConfig }) {
  // L'élément CV fait 210mm ≈ 794px. La carte fait ~180px de large → scale ≈ 0.226
  const CV_W = 794;
  const CV_H = 1123;
  const SCALE = 0.226;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: template.bgColor }}>
      <div style={{
        width: CV_W,
        height: CV_H,
        transform: `scale(${SCALE})`,
        transformOrigin: 'top left',
        pointerEvents: 'none',
        userSelect: 'none',
      }}>
        <CVRenderer template={template} content={previewContent} showWatermark={false} />
      </div>
    </div>
  );
});

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
                <span className="font-semibold text-gray-900 dark:text-white">{templates.filter(t => t.tier === 'free').length}</span> gratuits ·{' '}
                <span className="font-semibold text-amber-600">{templates.filter(t => t.tier === 'premium').length}</span> premium ·{' '}
                <span className="font-semibold text-orange-600">{templates.filter(t => t.tier === 'elite').length}</span> élite IA
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
