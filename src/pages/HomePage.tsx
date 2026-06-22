import { useEffect, useRef, useState, useCallback } from 'react';
import { FileText, Download, Zap, Shield, Star, ArrowRight, Check, Sparkles, Award, Globe } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import FeedbackSection from '../components/FeedbackSection';

interface HomePageProps {
  onNavigate: (page: 'templates' | 'editor' | 'pricing') => void;
  onAuthOpen: () => void;
}

// ── CSS global ────────────────────────────────────────────────────────────────
const PAGE_STYLE = `
@keyframes float-a {
  0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
  33%      { transform: translateY(-22px) rotate(6deg) scale(1.06); }
  66%      { transform: translateY(-10px) rotate(-4deg) scale(0.97); }
}
@keyframes float-b {
  0%,100% { transform: translateY(0px) rotate(0deg); }
  50%      { transform: translateY(-30px) rotate(12deg); }
}
@keyframes float-c {
  0%,100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  25%      { transform: translateY(-15px) translateX(10px) rotate(-8deg); }
  75%      { transform: translateY(-25px) translateX(-8px) rotate(5deg); }
}
@keyframes blob-drift {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(40px,-30px) scale(1.08); }
  66%      { transform: translate(-20px,20px) scale(0.95); }
}
@keyframes blob-drift-2 {
  0%,100% { transform: translate(0,0) scale(1); }
  40%      { transform: translate(-50px,30px) scale(1.12); }
  70%      { transform: translate(25px,-15px) scale(0.9); }
}
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes fade-up {
  from { opacity:0; transform: translateY(32px); }
  to   { opacity:1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes morph {
  0%,100% { border-radius: 40% 60% 60% 40% / 50% 40% 60% 50%; }
  25%      { border-radius: 60% 40% 50% 60% / 40% 60% 40% 60%; }
  50%      { border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%; }
  75%      { border-radius: 40% 60% 60% 40% / 60% 50% 40% 50%; }
}
@keyframes morph-fast {
  0%,100% { border-radius: 30% 70% 70% 30% / 60% 30% 70% 40%; }
  50%      { border-radius: 70% 30% 30% 70% / 40% 70% 30% 60%; }
}
.animate-fade-up { animation: fade-up .65s cubic-bezier(.22,1,.36,1) both; }
.reveal-section  { opacity:0; transform:translateY(36px); transition:opacity .7s ease,transform .7s ease; }
.reveal-section.visible { opacity:1; transform:none; }
.shimmer-text {
  background: linear-gradient(90deg,#2563eb 0%,#60a5fa 40%,#2563eb 60%,#1d4ed8 100%);
  background-size: 200% auto;
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 4s linear infinite;
}
.shape-follow {
  position: absolute;
  pointer-events: none;
  transition: transform .08s linear, border-radius .3s ease, opacity .3s ease;
  will-change: transform;
}
.shape-react {
  transition: transform .25s cubic-bezier(.22,1,.36,1), border-radius .4s ease, box-shadow .3s ease;
  will-change: transform;
}
`;

// ── Hook scroll reveal ────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal-section').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

// ── Compteur animé ────────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const start = Date.now(), dur = 1600;
      const tick = () => {
        const p = Math.min(1, (Date.now() - start) / dur);
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString('fr-FR')}{suffix}</span>;
}

// ── Hero avec curseur interactif ──────────────────────────────────────────────
function HeroSection({ onAuthOpen, onNavigate, lang }: {
  onAuthOpen: () => void;
  onNavigate: (p: 'templates') => void;
  lang: string;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  // Formes qui suivent le curseur (avec délai/inertie différents)
  const follower1 = useRef<HTMLDivElement>(null);
  const follower2 = useRef<HTMLDivElement>(null);
  const f1pos = useRef({ x: 0, y: 0 });
  const f2pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const hero = heroRef.current; if (!hero) return;

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    hero.addEventListener('mousemove', onMove);

    const loop = () => {
      const { x, y } = mouse.current;

      // Curseur custom
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x - 10}px,${y - 10}px)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${x - 24}px,${y - 24}px)`;
      }

      // Follower 1 — inertie lente (blob violet)
      f1pos.current.x += (x - f1pos.current.x) * 0.055;
      f1pos.current.y += (y - f1pos.current.y) * 0.055;
      if (follower1.current) {
        follower1.current.style.left = `${f1pos.current.x - 40}px`;
        follower1.current.style.top  = `${f1pos.current.y - 40}px`;
      }

      // Follower 2 — inertie très lente (blob bleu)
      f2pos.current.x += (x - f2pos.current.x) * 0.025;
      f2pos.current.y += (y - f2pos.current.y) * 0.025;
      if (follower2.current) {
        follower2.current.style.left = `${f2pos.current.x - 60}px`;
        follower2.current.style.top  = `${f2pos.current.y - 60}px`;
      }

      // Parallaxe des shapes statiques
      const px = (x / (hero.offsetWidth  || 1) - .5);
      const py = (y / (hero.offsetHeight || 1) - .5);
      hero.querySelectorAll<HTMLElement>('[data-depth]').forEach(el => {
        const d = parseFloat(el.dataset.depth || '0');
        el.style.transform = `translate(${px * d * 40}px,${py * d * 40}px)`;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      hero.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Shapes qui changent de forme au contact du curseur
  const [hoveredShape, setHoveredShape] = useState<number | null>(null);

  const SHAPES = [
    { x: 8,  y: 15, s: 44, anim: 'float-a', delay: 0,   op: 0.18, color: '#2563eb', depth: 1.2 },
    { x: 86, y: 10, s: 32, anim: 'float-b', delay: 1.2, op: 0.14, color: '#6366f1', depth: 0.8 },
    { x: 90, y: 40, s: 56, anim: 'float-c', delay: 0.5, op: 0.10, color: '#2563eb', depth: 1.5 },
    { x: 5,  y: 60, s: 40, anim: 'float-b', delay: 2,   op: 0.12, color: '#6366f1', depth: 0.6 },
    { x: 78, y: 65, s: 50, anim: 'float-a', delay: 0.8, op: 0.12, color: '#2563eb', depth: 1.0 },
    { x: 48, y: 4,  s: 26, anim: 'float-c', delay: 1.5, op: 0.10, color: '#818cf8', depth: 0.4 },
    { x: 22, y: 82, s: 36, anim: 'float-a', delay: 0.3, op: 0.10, color: '#2563eb', depth: 0.9 },
    { x: 68, y: 20, s: 28, anim: 'float-b', delay: 1.8, op: 0.09, color: '#6366f1', depth: 0.5 },
    { x: 38, y: 90, s: 42, anim: 'float-c', delay: 2.4, op: 0.10, color: '#2563eb', depth: 1.1 },
    { x: 62, y: 78, s: 22, anim: 'float-a', delay: 1.0, op: 0.08, color: '#818cf8', depth: 0.7 },
    { x: 14, y: 38, s: 20, anim: 'float-b', delay: 3.0, op: 0.08, color: '#6366f1', depth: 0.3 },
    { x: 76, y: 86, s: 34, anim: 'float-c', delay: 0.7, op: 0.09, color: '#2563eb', depth: 1.3 },
  ];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,#eff6ff 0%,#ffffff 50%,#f1f5f9 100%)',
        minHeight: '92vh',
        cursor: 'none',
      }}
    >
      {/* Curseur custom */}
      <div ref={cursorRef} className="shape-follow z-50"
        style={{ width: 20, height: 20, background: '#2563eb', borderRadius: '50%', opacity: .7, top: 0, left: 0 }} />
      <div ref={trailRef} className="shape-follow z-49"
        style={{ width: 48, height: 48, border: '1.5px solid rgba(37,99,235,.35)', borderRadius: '50%', top: 0, left: 0, transition: 'transform .18s linear' }} />

      {/* Follower 1 — blob violet qui suit lentement */}
      <div ref={follower1} className="shape-follow z-10"
        style={{
          width: 80, height: 80,
          background: 'radial-gradient(circle,rgba(99,102,241,.22) 0%,transparent 70%)',
          borderRadius: '50%', filter: 'blur(6px)',
          animation: 'morph 4s ease-in-out infinite',
          top: 0, left: 0,
        }} />

      {/* Follower 2 — blob bleu très lent */}
      <div ref={follower2} className="shape-follow z-10"
        style={{
          width: 120, height: 120,
          background: 'radial-gradient(circle,rgba(37,99,235,.12) 0%,transparent 70%)',
          borderRadius: '50%', filter: 'blur(12px)',
          top: 0, left: 0,
        }} />

      {/* Blobs de gradient fixes animés */}
      <div className="absolute pointer-events-none" style={{
        top: '-8%', right: '-4%', width: 500, height: 500,
        background: 'radial-gradient(circle,rgba(37,99,235,.15) 0%,transparent 70%)',
        animation: 'blob-drift 13s ease-in-out infinite', borderRadius: '50%',
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '-10%', left: '-6%', width: 460, height: 460,
        background: 'radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%)',
        animation: 'blob-drift-2 16s ease-in-out infinite', borderRadius: '50%',
      }} />

      {/* Grille de points décorative */}
      <div className="absolute inset-0 pointer-events-none opacity-[.04]"
        style={{ backgroundImage: 'radial-gradient(#2563eb 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Formes flottantes interactives */}
      {SHAPES.map((sh, i) => (
        <div
          key={i}
          data-depth={sh.depth}
          onMouseEnter={() => setHoveredShape(i)}
          onMouseLeave={() => setHoveredShape(null)}
          style={{
            position: 'absolute',
            left: `${sh.x}%`, top: `${sh.y}%`,
            width: sh.s, height: sh.s,
            background: hoveredShape === i
              ? `radial-gradient(circle,${sh.color}55 0%,${sh.color}22 100%)`
              : `radial-gradient(circle,${sh.color}28 0%,${sh.color}08 100%)`,
            borderRadius: hoveredShape === i ? '30% 70% 50% 60% / 60% 40% 70% 30%' : '50%',
            boxShadow: hoveredShape === i ? `0 0 24px ${sh.color}44` : 'none',
            border: `1px solid ${sh.color}${hoveredShape === i ? '55' : '18'}`,
            animation: `${sh.anim} ${5 + sh.delay * 0.9}s ease-in-out ${sh.delay}s infinite`,
            pointerEvents: 'auto',
            cursor: 'none',
            transition: 'background .3s ease, border-radius .4s ease, box-shadow .3s ease, border .3s ease',
            zIndex: 5,
          }}
        />
      ))}

      {/* Contenu hero */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center"
        style={{ pointerEvents: 'none' }}>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8 border border-blue-200 animate-fade-up"
          style={{ animationDelay: '0ms', pointerEvents: 'auto' }}>
          <Star size={13} className="fill-current" />
          {lang === 'fr' ? '#1 SaaS de CV en Afrique Francophone' : '#1 CV SaaS in Francophone Africa'}
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 animate-fade-up"
          style={{ animationDelay: '80ms' }}>
          {lang === 'fr' ? 'Créez un CV qui' : 'Create a CV that'}
          <br />
          <span className="shimmer-text">
            {lang === 'fr' ? 'décroche des entretiens' : 'lands interviews'}
          </span>
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
          style={{ animationDelay: '160ms' }}>
          {lang === 'fr'
            ? '75+ modèles professionnels. Éditeur live. PDF haute qualité. IA et traduction intégrées.'
            : '75+ professional templates. Live editor. High-quality PDF. Built-in AI and translation.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up"
          style={{ animationDelay: '240ms', pointerEvents: 'auto' }}>
          <button onClick={onAuthOpen}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-blue-500/40 hover:scale-[1.03] text-lg">
            {lang === 'fr' ? 'Créer mon CV gratuitement' : 'Create my CV for free'}
            <ArrowRight size={20} />
          </button>
          <button onClick={() => onNavigate('templates')}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl transition-all border border-gray-200 shadow-sm hover:scale-[1.02] text-lg">
            <FileText size={20} />
            {lang === 'fr' ? 'Voir les modèles' : 'View templates'}
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-fade-up"
          style={{ animationDelay: '320ms', pointerEvents: 'auto' }}>
          {[
            { target: 12000, suffix: '+', fr: 'Utilisateurs',    en: 'Users' },
            { target: 75,    suffix: '',  fr: 'Modèles',         en: 'Templates' },
            { target: 48000, suffix: '+', fr: 'Téléchargements', en: 'Downloads' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                <AnimatedCounter target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-sm text-gray-500 mt-1">{lang === 'fr' ? s.fr : s.en}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-35 pointer-events-none">
        <div className="w-5 h-8 rounded-full border-2 border-blue-400 flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-blue-400 rounded-full" style={{ animation: 'float-b 1.6s ease-in-out infinite' }} />
        </div>
      </div>
    </section>
  );
}

// ── Données sections ──────────────────────────────────────────────────────────
const features = [
  { icon: FileText, fr: '75 Modèles Pros',  en: '75 Pro Templates',
    dFr: 'Classiques, premium et Hermine — inspirés de Pinterest & Canva.',
    dEn: 'Classic, premium and Hermine — inspired by Pinterest & Canva.' },
  { icon: Zap,      fr: 'Éditeur Live',      en: 'Live Editor',
    dFr: 'Votre CV se met à jour en temps réel pendant que vous tapez.',
    dEn: 'Your CV updates in real-time as you type.' },
  { icon: Download, fr: 'PDF Haute Qualité', en: 'High-Quality PDF',
    dFr: 'Export A4 parfait. Connexion requise pour télécharger.',
    dEn: 'Perfect A4 export. Sign in required to download.' },
  { icon: Sparkles, fr: 'IA Intégrée',       en: 'Built-in AI',
    dFr: 'Amélioration de texte, compétences et traduction en 12 langues.',
    dEn: 'Text enhancement, skills and translation into 12 languages.' },
  { icon: Shield,   fr: 'Sauvegarde Auto',   en: 'Auto-Save',
    dFr: 'Données sauvegardées et synchronisées sur tous vos appareils.',
    dEn: 'Data auto-saved and synced across all your devices.' },
  { icon: Globe,    fr: 'Traduction CV IA',  en: 'AI CV Translation',
    dFr: 'Traduisez en anglais, arabe, espagnol… (Élite IA).',
    dEn: 'Translate into English, Arabic, Spanish… (Elite AI).' },
  { icon: Award,    fr: 'Forfaits flexibles', en: 'Flexible Plans',
    dFr: 'Gratuit, Premium ou Élite IA — payez selon vos besoins.',
    dEn: 'Free, Premium or Elite AI — pay as you need.' },
  { icon: Check,    fr: 'Sans filigrane',     en: 'Watermark-free',
    dFr: 'Les forfaits payants exportent votre CV sans aucun filigrane.',
    dEn: 'Paid plans export your CV with no watermark.' },
];

const testimonials = [
  { name: 'Aminata K.', role: 'Développeuse Web',  avatar: 'A', color: 'bg-blue-500',
    fr: '"J\'ai décroché mon premier emploi grâce à whitedukeSaaS. Le modèle Silicon Dark a impressionné mon recruteur !"',
    en: '"I landed my first job thanks to whitedukeSaaS. The Silicon Dark template impressed my recruiter!"' },
  { name: 'Kofi M.',    role: 'Manager Marketing', avatar: 'K', color: 'bg-emerald-500',
    fr: '"L\'IA a transformé mon CV en quelques secondes. Je reçois 3x plus de réponses."',
    en: '"The AI transformed my CV in seconds. Now I receive 3x more responses."' },
  { name: 'Fatou D.',   role: 'Architecte',         avatar: 'F', color: 'bg-orange-500',
    fr: '"Le modèle Berlin Bauhaus est exactement ce dont j\'avais besoin. Ultra professionnel."',
    en: '"The Berlin Bauhaus template was exactly what I needed. Ultra professional."' },
];

// ── Feature card réactive au curseur ─────────────────────────────────────────
function FeatureCard({ f, i, lang }: { f: typeof features[0]; i: number; lang: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = f.icon;

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current; if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    const rx = (y / rect.height) * -14;
    const ry = (x / rect.width) * 14;
    card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
    card.style.boxShadow = `${-ry * .5}px ${rx * .5}px 28px rgba(37,99,235,.18)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    const card = cardRef.current; if (!card) return;
    card.style.transform = '';
    card.style.boxShadow = '';
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group reveal-section"
      style={{ transitionDelay: `${i * 50}ms`, transition: 'transform .25s ease, box-shadow .25s ease', transformStyle: 'preserve-3d' }}>
      <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
        <Icon size={20} className="text-blue-600 group-hover:text-white transition-colors" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{lang === 'fr' ? f.fr : f.en}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{lang === 'fr' ? f.dFr : f.dEn}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage({ onNavigate, onAuthOpen }: HomePageProps) {
  const { lang } = useLang();
  useReveal();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLE }} />
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">

        {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
        <HeroSection onAuthOpen={onAuthOpen} onNavigate={onNavigate} lang={lang} />

        {/* ══ APERÇU MODÈLES ══════════════════════════════════════════════════ */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden reveal-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {lang === 'fr' ? '75 Designs pour chaque ambition' : '75 Designs for every ambition'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {lang === 'fr' ? 'Du classique académique au Hermine Élite IA' : 'From classic academic to Hermine AI Elite'}
            </p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {[
              { color: '#1B365D', name: 'Classic Navy',    bg: '#FFFFFF' },
              { color: '#334155', name: 'Urban Slate',     bg: '#FFFFFF' },
              { color: '#0F172A', name: 'Silicon Dark',    bg: '#0F172A' },
              { color: '#C2410C', name: 'Terracotta',      bg: '#FFFFFF' },
              { color: '#1E293B', name: 'Zurich Elegance', bg: '#FDFBF7' },
              { color: '#6B21A8', name: 'Hermine Violet',  bg: '#FFFFFF' },
              { color: '#065F46', name: 'Hermine Jade',    bg: '#FFFFFF' },
              { color: '#9A3412', name: 'Hermine Terra',   bg: '#FFFFFF' },
              { color: '#0A192F', name: 'Riviera Navy',    bg: '#FFFFFF' },
              { color: '#F43F5E', name: 'Cyberpunk',       bg: '#020617' },
            ].map((tpl, i) => (
              <div key={i} onClick={() => onNavigate('templates')}
                className="shrink-0 w-36 h-48 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-all snap-start"
                style={{ backgroundColor: tpl.bg }}>
                <div className="h-1/3 flex flex-col justify-end px-3 pb-2" style={{ backgroundColor: tpl.color }}>
                  <div className="h-2 w-20 rounded mb-0.5" style={{ backgroundColor: 'rgba(255,255,255,.8)' }} />
                  <div className="h-1 w-14 rounded" style={{ backgroundColor: 'rgba(255,255,255,.5)' }} />
                </div>
                <div className="p-3 space-y-1.5">
                  {[80, 65, 75, 55].map((w, j) => (
                    <div key={j} className="h-1 rounded"
                      style={{ backgroundColor: ['#0F172A','#020617'].includes(tpl.bg) ? '#334155' : '#E5E7EB', width: `${w}%` }} />
                  ))}
                </div>
                <p className="px-3 text-xs font-medium"
                  style={{ color: ['#0F172A','#020617'].includes(tpl.bg) ? '#94A3B8' : '#374151' }}>{tpl.name}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => onNavigate('templates')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
              {lang === 'fr' ? 'Voir tous les modèles' : 'See all templates'} <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white dark:bg-gray-950 reveal-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {lang === 'fr' ? 'Tout ce dont vous avez besoin' : 'Everything you need'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {lang === 'fr' ? 'Un outil complet pour créer le CV parfait' : 'A complete tool to create the perfect CV'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f, i) => <FeatureCard key={i} f={f} i={i} lang={lang} />)}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900 relative overflow-hidden reveal-section">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div style={{ position:'absolute', top:'8%', left:'2%', width:180, height:180,
              border:'2px dashed rgba(37,99,235,.1)', borderRadius:'50%',
              animation:'spin-slow 26s linear infinite' }} />
            <div style={{ position:'absolute', bottom:'6%', right:'3%', width:120, height:120,
              border:'2px dashed rgba(99,102,241,.1)', borderRadius:'50%',
              animation:'spin-slow 18s linear infinite reverse' }} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {lang === 'fr' ? 'Ils ont décroché leur emploi' : 'They landed their job'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i}
                  className="bg-white dark:bg-gray-950 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all reveal-section"
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold`}>{t.avatar}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, j) => <Star key={j} size={12} className="text-amber-400 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed">
                    {lang === 'fr' ? t.fr : t.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ════════════════════════════════════════════════════════ */}
        <section className="py-24 relative overflow-hidden reveal-section"
          style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#2563eb 50%,#1e40af 100%)' }}>
          <div className="absolute inset-0 pointer-events-none opacity-[.06]"
            style={{ backgroundImage: 'radial-gradient(white 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              {lang === 'fr' ? 'Prêt à créer votre CV parfait ?' : 'Ready to create your perfect CV?'}
            </h2>
            <p className="text-blue-200 text-lg mb-10">
              {lang === 'fr' ? 'Rejoignez 12 000+ professionnels qui font confiance à whitedukeSaaS.' : 'Join 12,000+ professionals who trust whitedukeSaaS.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button onClick={onAuthOpen}
                className="px-10 py-4 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-2xl transition-all shadow-xl hover:scale-[1.04] text-lg">
                {lang === 'fr' ? 'Commencer gratuitement' : 'Start for free'}
              </button>
              <button onClick={() => onNavigate('pricing')}
                className="px-10 py-4 bg-transparent hover:bg-blue-700 text-white font-bold rounded-2xl transition-all border-2 border-white/40 hover:border-white text-lg">
                {lang === 'fr' ? 'Voir les tarifs' : 'View pricing'}
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                lang === 'fr' ? '✓ Gratuit pour commencer' : '✓ Free to start',
                lang === 'fr' ? '✓ Sans carte bancaire'    : '✓ No credit card',
                lang === 'fr' ? '✓ Sauvegarde automatique' : '✓ Auto-save',
              ].map((item, i) => (
                <span key={i} className="text-blue-200 text-sm font-medium">{item}</span>
              ))}
            </div>
          </div>
        </section>

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
                <span className="flex items-center gap-1"><Check size={12} className="text-green-400" /> SSL</span>
                <span className="flex items-center gap-1"><Shield size={12} className="text-blue-400" /> {lang === 'fr' ? 'Données protégées' : 'Data protected'}</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
