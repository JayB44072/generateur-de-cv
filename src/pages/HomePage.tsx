import { FileText, Download, Zap, Shield, Star, ArrowRight, Check } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import FeedbackSection from '../components/FeedbackSection';

interface HomePageProps {
  onNavigate: (page: 'templates' | 'editor' | 'pricing') => void;
  onAuthOpen: () => void;
}

const stats = [
  { value: '12 000+', labelFr: 'Utilisateurs', labelEn: 'Users' },
  { value: '50', labelFr: 'Modèles', labelEn: 'Templates' },
  { value: '48 000+', labelFr: 'Téléchargements', labelEn: 'Downloads' },
];

const features = [
  {
    icon: FileText,
    titleFr: '50 Modèles Professionnels',
    titleEn: '50 Professional Templates',
    descFr: 'Des designs classiques aux créations haut de gamme inspirées de Pinterest et Canva.',
    descEn: 'Classic designs to high-end creations inspired by Pinterest and Canva.',
  },
  {
    icon: Zap,
    titleFr: 'Éditeur Live Instantané',
    titleEn: 'Instant Live Editor',
    descFr: 'Voyez votre CV se mettre à jour en temps réel pendant que vous tapez.',
    descEn: 'See your CV update in real-time as you type.',
  },
  {
    icon: Download,
    titleFr: 'Téléchargement PDF',
    titleEn: 'PDF Download',
    descFr: 'Exportez votre CV en PDF haute qualité en un seul clic.',
    descEn: 'Export your CV to high-quality PDF in one click.',
  },
  {
    icon: Shield,
    titleFr: 'Sauvegarde Automatique',
    titleEn: 'Auto-Save',
    descFr: 'Vos données sont sauvegardées automatiquement et synchronisées sur tous vos appareils.',
    descEn: 'Your data is automatically saved and synced across all your devices.',
  },
];

const testimonials = [
  {
    name: 'Aminata K.',
    role: 'Développeuse Web',
    avatar: 'A',
    color: 'bg-blue-500',
    textFr: '"J\'ai décroché mon premier emploi grâce à whitedukeSaaS. Le modèle Silicon Dark a impressionné mon recruteur !"',
    textEn: '"I landed my first job thanks to whitedukeSaaS. The Silicon Dark template impressed my recruiter!"',
  },
  {
    name: 'Kofi M.',
    role: 'Manager Marketing',
    avatar: 'K',
    color: 'bg-emerald-500',
    textFr: '"L\'IA a transformé mon CV en quelques secondes. Maintenant je reçois 3x plus de réponses."',
    textEn: '"The AI transformed my CV in seconds. Now I receive 3x more responses."',
  },
  {
    name: 'Fatou D.',
    role: 'Architecte',
    avatar: 'F',
    color: 'bg-orange-500',
    textFr: '"Le modèle Berlin Bauhaus est exactement ce dont j\'avais besoin. Ultra professionnel."',
    textEn: '"The Berlin Bauhaus template was exactly what I needed. Ultra professional."',
  },
];

export default function HomePage({ onNavigate, onAuthOpen }: HomePageProps) {
  const { lang } = useLang();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-950 dark:to-slate-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-200/40 dark:bg-slate-800/30 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 border border-blue-200 dark:border-blue-800">
            <Star size={14} className="fill-current" />
            {lang === 'fr' ? '#1 SaaS de CV en Afrique Francophone' : '#1 CV SaaS in Francophone Africa'}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            {lang === 'fr' ? 'Créez un CV qui' : 'Create a CV that'}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              {lang === 'fr' ? 'décroche des entretiens' : 'lands interviews'}
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {lang === 'fr'
              ? '50+ modèles professionnels. Éditeur live. Téléchargement PDF. Amélioration par IA.'
              : '50+ professional templates. Live editor. PDF download. AI-powered enhancement.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={onAuthOpen}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] text-lg"
            >
              {lang === 'fr' ? 'Créer mon CV gratuitement' : 'Create my CV for free'}
              <ArrowRight size={20} />
            </button>
            <button
              onClick={() => onNavigate('templates')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-2xl transition-all border border-gray-200 dark:border-gray-700 shadow-sm text-lg"
            >
              <FileText size={20} />
              {lang === 'fr' ? 'Voir les modèles' : 'View templates'}
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {lang === 'fr' ? stat.labelFr : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Preview strip */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {lang === 'fr' ? '50 Designs pour chaque ambition' : '50 Designs for every ambition'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {lang === 'fr' ? 'Du classique académique au haut de gamme Pinterest' : 'From classic academic to Pinterest high-end'}
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {[
            { color: '#1B365D', name: 'Classic Navy', bg: '#FFFFFF' },
            { color: '#334155', name: 'Urban Slate', bg: '#FFFFFF' },
            { color: '#0F172A', name: 'Silicon Dark', bg: '#0F172A' },
            { color: '#C2410C', name: 'Terracotta', bg: '#FFFFFF' },
            { color: '#1E293B', name: 'Zurich Elegance', bg: '#FDFBF7' },
            { color: '#0A192F', name: 'Riviera Navy', bg: '#FFFFFF' },
            { color: '#111827', name: 'Tokyo Mint', bg: '#E6F4F1' },
            { color: '#F43F5E', name: 'Cyberpunk', bg: '#020617' },
          ].map((tpl, i) => (
            <div key={i}
              onClick={() => onNavigate('templates')}
              className="shrink-0 w-36 h-48 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform snap-start"
              style={{ backgroundColor: tpl.bg }}
            >
              <div className="h-1/3 flex flex-col justify-end px-3 pb-2" style={{ backgroundColor: tpl.color }}>
                <div className="h-2 w-20 bg-white/80 rounded mb-0.5" />
                <div className="h-1 w-14 bg-white/50 rounded" />
              </div>
              <div className="p-3 space-y-1.5">
                {[80, 65, 75, 55].map((w, j) => (
                  <div key={j} className="h-1 rounded" style={{ backgroundColor: tpl.bg === '#0F172A' || tpl.bg === '#020617' ? '#334155' : '#E5E7EB', width: `${w}%` }} />
                ))}
              </div>
              <p className="px-3 text-xs font-medium" style={{ color: tpl.bg === '#0F172A' || tpl.bg === '#020617' ? '#94A3B8' : '#374151' }}>{tpl.name}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => onNavigate('templates')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            {lang === 'fr' ? 'Voir tous les 50 modèles' : 'See all 50 templates'} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {lang === 'fr' ? 'Tout ce dont vous avez besoin' : 'Everything you need'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {lang === 'fr' ? 'Un outil complet pour créer le CV parfait' : 'A complete tool to create the perfect CV'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon size={22} className="text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {lang === 'fr' ? f.titleFr : f.titleEn}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {lang === 'fr' ? f.descFr : f.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {lang === 'fr' ? 'Ils ont décroché leur emploi' : 'They landed their job'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-current" />)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                  {lang === 'fr' ? t.textFr : t.textEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {lang === 'fr' ? 'Prêt à créer votre CV parfait ?' : 'Ready to create your perfect CV?'}
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            {lang === 'fr' ? 'Rejoignez 12 000+ professionnels qui font confiance à whitedukeSaaS.' : 'Join 12,000+ professionals who trust whitedukeSaaS.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onAuthOpen}
              className="px-8 py-4 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-2xl transition-all shadow-lg hover:scale-[1.02]"
            >
              {lang === 'fr' ? 'Commencer gratuitement' : 'Start for free'}
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="px-8 py-4 bg-transparent hover:bg-blue-700 text-white font-bold rounded-2xl transition-all border-2 border-white/40 hover:border-white"
            >
              {lang === 'fr' ? 'Voir les tarifs' : 'View pricing'}
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              lang === 'fr' ? '✓ Gratuit pour commencer' : '✓ Free to start',
              lang === 'fr' ? '✓ Sans carte bancaire' : '✓ No credit card',
              lang === 'fr' ? '✓ Sauvegarde automatique' : '✓ Auto-save',
            ].map((item, i) => (
              <span key={i} className="text-blue-200 text-sm">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Zone avis de la communauté */}
      <FeedbackSection />

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <FileText size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-sm">whitedukeSaaS</span>
            </div>
            <p className="text-sm">© 2026 whitedukeSaaS. {lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Check size={12} className="text-green-400" /> {lang === 'fr' ? 'SSL Sécurisé' : 'SSL Secured'}</span>
              <span className="flex items-center gap-1"><Shield size={12} className="text-blue-400" /> {lang === 'fr' ? 'Données protégées' : 'Data protected'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
