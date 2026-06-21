export type TemplateTier = 'free' | 'premium' | 'elite';
export type PhotoShape = 'circle' | 'square' | 'rounded' | 'diamond' | 'hexagon' | 'octagon' | 'arch' | 'organic';
export type PhotoPosition = 'header-right' | 'header-center' | 'sidebar-top' | 'inline-left' | 'float' | 'overlay';

export interface TemplateConfig {
  id: number;
  name: string;
  nameFr: string;
  tier: TemplateTier;
  description: string;
  descriptionFr: string;
  primaryColor: string;
  secondaryColor: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'single' | 'two-col' | 'sidebar-left' | 'sidebar-right' | 'asymmetric' | 'editorial' | 'hermine';
  hasPhoto: boolean;
  hasMultiplePhotos: boolean;
  photoShape: PhotoShape;
  photoPosition: PhotoPosition;
  previewBg: string;
  tags: string[];
  sidebarShape?: 'circles' | 'diagonals' | 'blobs' | 'triangles' | 'hexagons' | 'waves';
}

export const templates: TemplateConfig[] = [
  // FREE TEMPLATES (1-30) - All with photo support per new requirement
  {
    id: 1, name: 'Classic Navy', nameFr: 'Marine Classique', tier: 'free',
    description: 'Timeless single-column with navy header', descriptionFr: 'En-tête marine classique, monocolonne',
    primaryColor: '#1B365D', secondaryColor: '#E8EEF7', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#1B365D',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'header-right',
    previewBg: 'bg-blue-900', tags: ['académique', 'administratif'],
  },
  {
    id: 2, name: 'Minimalist Stark', nameFr: 'Minimaliste Stark', tier: 'free',
    description: 'Ultra-clean with wide margins', descriptionFr: 'Monocolonne épuré, marges larges',
    primaryColor: '#000000', secondaryColor: '#F9F9F9', bgColor: '#FFFFFF', textColor: '#000000', accentColor: '#000000',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'header-center',
    previewBg: 'bg-gray-900', tags: ['académique', 'juridique'],
  },
  {
    id: 3, name: 'Corporate Split', nameFr: 'Corporate Bicolonne', tier: 'free',
    description: '30/70 asymmetric two-column layout', descriptionFr: '2 colonnes asymétriques 30/70',
    primaryColor: '#374151', secondaryColor: '#F3F4F6', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#374151',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-gray-700', tags: ['gestion', 'corporate'],
  },
  {
    id: 4, name: 'Executive Clean', nameFr: 'Cadre Exécutif', tier: 'free',
    description: 'Bold top bar with burgundy accents', descriptionFr: 'Barre supérieure épaisse, accents bordeaux',
    primaryColor: '#7A1C1C', secondaryColor: '#FEF2F2', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#7A1C1C',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'inline-left',
    previewBg: 'bg-red-900', tags: ['direction', 'management'],
  },
  {
    id: 5, name: 'Urban Slate', nameFr: 'Ardoise Urbaine', tier: 'free',
    description: 'Compact left sidebar with slate tones', descriptionFr: 'Bandeau latéral ardoise compact',
    primaryColor: '#334155', secondaryColor: '#F1F5F9', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#334155',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-700', tags: ['urbain', 'professionnel'],
  },
  {
    id: 6, name: 'Forest Green', nameFr: 'Vert Forêt', tier: 'free',
    description: 'Clean layout with forest green accents', descriptionFr: 'Mise en page propre, accents vert forêt',
    primaryColor: '#14532D', secondaryColor: '#F0FDF4', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#16A34A',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'header-right',
    previewBg: 'bg-green-800', tags: ['environnement', 'nature'],
  },
  {
    id: 7, name: 'Teal Wave', nameFr: 'Vague Teal', tier: 'free',
    description: 'Centered header with teal theme', descriptionFr: 'En-tête centré, thème bleu canard',
    primaryColor: '#0D9488', secondaryColor: '#F0FDFA', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#0D9488',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-teal-700', tags: ['médical', 'santé'],
  },
  {
    id: 8, name: 'Amber Pro', nameFr: 'Pro Ambre', tier: 'free',
    description: 'Professional with amber highlights', descriptionFr: 'Professionnel avec touches ambrées',
    primaryColor: '#B45309', secondaryColor: '#FFFBEB', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#D97706',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-amber-700', tags: ['commerce', 'vente'],
  },
  {
    id: 9, name: 'Steel Blue', nameFr: 'Bleu Acier', tier: 'free',
    description: 'Modern with steel blue header band', descriptionFr: 'Bandeau en-tête bleu acier moderne',
    primaryColor: '#1E3A5F', secondaryColor: '#EFF6FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#2563EB',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-blue-800', tags: ['ingénierie', 'technique'],
  },
  {
    id: 10, name: 'Warm Bistre', nameFr: 'Bistre Chaleureux', tier: 'free',
    description: 'Warm bistre tones with serif typography', descriptionFr: 'Tons bistre chauds, typographie serif',
    primaryColor: '#78350F', secondaryColor: '#FEF3C7', bgColor: '#FFFEF0', textColor: '#1A1A1A', accentColor: '#92400E',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-yellow-800', tags: ['artisanat', 'gastronomie'],
  },
  {
    id: 11, name: 'Petrol Grey', nameFr: 'Gris Pétrole', tier: 'free',
    description: 'Sophisticated petroleum grey palette', descriptionFr: 'Palette gris pétrole sophistiquée',
    primaryColor: '#1C3444', secondaryColor: '#E8EDF1', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#2E5B7F',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-sky-900', tags: ['consulting', 'finance'],
  },
  {
    id: 12, name: 'Crimson Edge', nameFr: 'Écarlate Vif', tier: 'free',
    description: 'Bold crimson accent lines', descriptionFr: "Lignes d'accent écarlate audacieuses",
    primaryColor: '#9B1C1C', secondaryColor: '#FEF2F2', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#DC2626',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'header-right',
    previewBg: 'bg-red-800', tags: ['marketing', 'communication'],
  },
  {
    id: 13, name: 'Sage Professional', nameFr: 'Sauge Professionnel', tier: 'free',
    description: 'Sage green with balanced two-column', descriptionFr: 'Vert sauge, bicolonne équilibré',
    primaryColor: '#3F6147', secondaryColor: '#ECFDF5', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#16A34A',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-green-700', tags: ['education', 'sciences'],
  },
  {
    id: 14, name: 'Graphite Mono', nameFr: 'Graphite Mono', tier: 'free',
    description: 'Monochromatic graphite minimalism', descriptionFr: 'Minimalisme graphite monochrome',
    primaryColor: '#374151', secondaryColor: '#F9FAFB', bgColor: '#FFFFFF', textColor: '#111827', accentColor: '#6B7280',
    fontFamily: 'font-mono', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-gray-600', tags: ['IT', 'technologie'],
  },
  {
    id: 15, name: 'Indigo Scholar', nameFr: 'Érudit Indigo', tier: 'free',
    description: 'Academic style with indigo header', descriptionFr: 'Style académique, en-tête indigo',
    primaryColor: '#312E81', secondaryColor: '#EEF2FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#4338CA',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'header-right',
    previewBg: 'bg-indigo-900', tags: ['académique', 'recherche'],
  },
  {
    id: 16, name: 'Copper Classic', nameFr: 'Classique Cuivré', tier: 'free',
    description: 'Classic with warm copper accents', descriptionFr: 'Classique avec accents cuivrés chauds',
    primaryColor: '#7C2D12', secondaryColor: '#FFF7ED', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#EA580C',
    fontFamily: 'font-serif', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-orange-800', tags: ['artisanat', 'design'],
  },
  {
    id: 17, name: 'Ocean Breeze', nameFr: 'Brise Océane', tier: 'free',
    description: 'Fresh ocean-themed two-column', descriptionFr: 'Bicolonne fraîche thème océan',
    primaryColor: '#164E63', secondaryColor: '#ECFEFF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#0891B2',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-cyan-800', tags: ['maritime', 'tourisme'],
  },
  {
    id: 18, name: 'Purple Dusk', nameFr: 'Crépuscule Violet', tier: 'free',
    description: 'Refined with deep purple tones', descriptionFr: 'Raffiné avec tons violet profond',
    primaryColor: '#3B0764', secondaryColor: '#FAF5FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#7C3AED',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-purple-900', tags: ['créatif', 'arts'],
  },
  {
    id: 19, name: 'Vintage Rose', nameFr: 'Rose Vintage', tier: 'free',
    description: 'Elegant vintage rose styling', descriptionFr: 'Style vintage rose élégant',
    primaryColor: '#9F1239', secondaryColor: '#FFF1F2', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#E11D48',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-rose-800', tags: ['mode', 'beauté'],
  },
  {
    id: 20, name: 'Tech Grid', nameFr: 'Grille Tech', tier: 'free',
    description: 'Grid-based technical layout', descriptionFr: 'Mise en page technique en grille',
    primaryColor: '#1E293B', secondaryColor: '#F1F5F9', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#0F172A',
    fontFamily: 'font-mono', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-800', tags: ['développeur', 'data'],
  },
  {
    id: 21, name: 'Stone Heritage', nameFr: 'Patrimoine Pierre', tier: 'free',
    description: 'Warm stone tones, heritage feel', descriptionFr: 'Tons pierre chauds, style patrimoine',
    primaryColor: '#44403C', secondaryColor: '#FAFAF9', bgColor: '#FFFFFF', textColor: '#1C1917', accentColor: '#78716C',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-stone-700', tags: ['architecture', 'patrimoine'],
  },
  {
    id: 22, name: 'Sky Clean', nameFr: 'Ciel Épuré', tier: 'free',
    description: 'Airy sky-blue professional layout', descriptionFr: 'Mise en page professionnelle bleu ciel',
    primaryColor: '#0369A1', secondaryColor: '#F0F9FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#0284C7',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-sky-700', tags: ['aviation', 'logistique'],
  },
  {
    id: 23, name: 'Lime Modern', nameFr: 'Lime Moderne', tier: 'free',
    description: 'Fresh lime green modern design', descriptionFr: 'Design moderne vert lime frais',
    primaryColor: '#365314', secondaryColor: '#F7FEE7', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#65A30D',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-lime-700', tags: ['écologie', 'développement durable'],
  },
  {
    id: 24, name: 'Midnight Pro', nameFr: 'Minuit Pro', tier: 'free',
    description: 'Dark-toned sidebar with white content', descriptionFr: 'Bandeau foncé, contenu blanc',
    primaryColor: '#020617', secondaryColor: '#1E293B', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#38BDF8',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-950', tags: ['informatique', 'cybersécurité'],
  },
  {
    id: 25, name: 'Warm Taupe', nameFr: 'Taupe Chaleureux', tier: 'free',
    description: 'Warm taupe palette, single column', descriptionFr: 'Palette taupe chaleureuse, monocolonne',
    primaryColor: '#78716C', secondaryColor: '#FAF9F8', bgColor: '#FDFCFB', textColor: '#1A1A1A', accentColor: '#92877E',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-stone-500', tags: ['généraliste', 'polyvalent'],
  },
  {
    id: 26, name: 'Cobalt Edge', nameFr: 'Tranche Cobalt', tier: 'free',
    description: 'Strong cobalt left border accent', descriptionFr: 'Fort accent cobalt sur la bordure gauche',
    primaryColor: '#1D4ED8', secondaryColor: '#EFF6FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#2563EB',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'header-right',
    previewBg: 'bg-blue-700', tags: ['finance', 'banque'],
  },
  {
    id: 27, name: 'Dusty Rose', nameFr: 'Rose Poudré', tier: 'free',
    description: 'Soft dusty rose with elegant serif', descriptionFr: 'Rose poudré doux avec serif élégant',
    primaryColor: '#9D174D', secondaryColor: '#FDF2F8', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#BE185D',
    fontFamily: 'font-serif', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-pink-700', tags: ['mode', 'luxe'],
  },
  {
    id: 28, name: 'Industrial Grey', nameFr: 'Gris Industriel', tier: 'free',
    description: 'Bold industrial grey with thick borders', descriptionFr: 'Gris industriel avec bordures épaisses',
    primaryColor: '#374151', secondaryColor: '#F3F4F6', bgColor: '#FFFFFF', textColor: '#111827', accentColor: '#4B5563',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'header-right',
    previewBg: 'bg-gray-700', tags: ['industrie', 'BTP'],
  },
  {
    id: 29, name: 'Mint Fresh', nameFr: 'Menthe Fraîche', tier: 'free',
    description: 'Light mint header, clean layout', descriptionFr: 'En-tête menthe légère, mise en page propre',
    primaryColor: '#065F46', secondaryColor: '#ECFDF5', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#059669',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-emerald-700', tags: ['santé', 'bien-être'],
  },
  {
    id: 30, name: 'Classic Gold', nameFr: 'Or Classique', tier: 'free',
    description: 'Traditional with gold decorative elements', descriptionFr: 'Traditionnel avec éléments décoratifs dorés',
    primaryColor: '#92400E', secondaryColor: '#FFFBEB', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#D97706',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-yellow-700', tags: ['droit', 'notariat'],
  },

  // PREMIUM TEMPLATES (31-40) - Premium/Elite with advanced photo treatments
  {
    id: 31, name: 'Tokyo Mint', nameFr: 'Tokyo Menthe', tier: 'premium',
    description: 'Broken asymmetric grid with mint tones', descriptionFr: 'Grille brisée asymétrique, tons menthe',
    primaryColor: '#111827', secondaryColor: '#E6F4F1', bgColor: '#E6F4F1', textColor: '#111827', accentColor: '#0D9488',
    fontFamily: 'font-sans', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'float',
    previewBg: 'bg-teal-100', tags: ['créatif', 'design', 'premium'],
  },
  {
    id: 32, name: 'Zurich Elegance', nameFr: 'Élégance Zurich', tier: 'premium',
    description: 'Editorial magazine luxury style', descriptionFr: 'Style magazine de luxe éditorial',
    primaryColor: '#1E293B', secondaryColor: '#FDFBF7', bgColor: '#FDFBF7', textColor: '#1E293B', accentColor: '#D4AF37',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'float',
    previewBg: 'bg-amber-50', tags: ['luxe', 'haute couture', 'premium'],
  },
  {
    id: 33, name: 'Silicon Dark', nameFr: 'Silicon Sombre', tier: 'elite',
    description: 'Dashboard-style dark layout for tech profiles', descriptionFr: 'Layout dashboard sombre pour profils tech',
    primaryColor: '#8B5CF6', secondaryColor: '#1E293B', bgColor: '#0F172A', textColor: '#E2E8F0', accentColor: '#10B981',
    fontFamily: 'font-mono', layout: 'sidebar-right', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'octagon', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-900', tags: ['tech', 'IA', 'élite'],
  },
  {
    id: 34, name: 'Terracotta Warmth', nameFr: 'Chaleur Terracotta', tier: 'premium',
    description: 'Massive asymmetric header, earthy tones', descriptionFr: 'En-tête massif asymétrique, tons terreux',
    primaryColor: '#C2410C', secondaryColor: '#FEF3C7', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#EA580C',
    fontFamily: 'font-sans', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'arch', photoPosition: 'float',
    previewBg: 'bg-orange-100', tags: ['créatif', 'artiste', 'premium'],
  },
  {
    id: 35, name: 'Berlin Bauhaus', nameFr: 'Bauhaus Berlin', tier: 'elite',
    description: 'Functionalist modular structure for creatives', descriptionFr: 'Structure modulaire fonctionnaliste pour créatifs',
    primaryColor: '#1D4ED8', secondaryColor: '#FEFCE8', bgColor: '#FEFCE8', textColor: '#1A1A1A', accentColor: '#F59E0B',
    fontFamily: 'font-sans', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'overlay',
    previewBg: 'bg-yellow-50', tags: ['architecture', 'design', 'élite'],
  },
  {
    id: 36, name: 'Editorial Vogue', nameFr: 'Vogue Éditorial', tier: 'premium',
    description: 'Asymmetric magazine layout with double photo', descriptionFr: 'Mise en page magazine asymétrique, double photo',
    primaryColor: '#1A1A1A', secondaryColor: '#F5F5DC', bgColor: '#F5F5DC', textColor: '#1A1A1A', accentColor: '#D4AF37',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: true,
    photoShape: 'rounded', photoPosition: 'float',
    previewBg: 'bg-amber-100', tags: ['mode', 'beauté', 'premium'],
  },
  {
    id: 37, name: 'Nordic Minimal', nameFr: 'Minimal Nordique', tier: 'premium',
    description: 'Extreme Scandinavian spacing, zero icons', descriptionFr: 'Espacements scandinaves extrêmes, zéro icône',
    primaryColor: '#475569', secondaryColor: '#F8FAFC', bgColor: '#F8FAFC', textColor: '#475569', accentColor: '#94A3B8',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'diamond', photoPosition: 'header-center',
    previewBg: 'bg-slate-100', tags: ['design', 'minimal', 'premium'],
  },
  {
    id: 38, name: 'Kyoto Moss', nameFr: 'Mousse Kyoto', tier: 'premium',
    description: 'Floating header, double-column with partial underlines', descriptionFr: 'Bandeau flottant, double colonne, soulignements partiels',
    primaryColor: '#3B7A57', secondaryColor: '#F5F0E8', bgColor: '#F5F0E8', textColor: '#1A1A1A', accentColor: '#3B7A57',
    fontFamily: 'font-serif', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'organic', photoPosition: 'float',
    previewBg: 'bg-green-100', tags: ['zen', 'nature', 'premium'],
  },
  {
    id: 39, name: 'Cyberpunk Neon', nameFr: 'Néon Cyberpunk', tier: 'elite',
    description: 'Double-column with neon box shadows', descriptionFr: 'Double colonne avec ombres néon',
    primaryColor: '#F43F5E', secondaryColor: '#020617', bgColor: '#020617', textColor: '#E2E8F0', accentColor: '#06B6D4',
    fontFamily: 'font-mono', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'hexagon', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-950', tags: ['cyberpunk', 'gaming', 'élite'],
  },
  {
    id: 40, name: 'Riviera Navy', nameFr: 'Marine Riviera', tier: 'premium',
    description: 'Club de voile style with gold timeline thread', descriptionFr: 'Style club de voile, fil doré vertical',
    primaryColor: '#0A192F', secondaryColor: '#F8FAFC', bgColor: '#FFFFFF', textColor: '#0A192F', accentColor: '#D4AF37',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'overlay',
    previewBg: 'bg-slate-900', tags: ['luxe', 'marine', 'premium'],
  },

  // PREMIUM/ELITE TEMPLATES (41-50)
  {
    id: 41, name: 'Diamond Grid', nameFr: 'Grille Diamant', tier: 'premium',
    description: 'Hexagonal skill bullets, octagonal photo frame', descriptionFr: 'Puces hexagonales, cadre photo octogonal',
    primaryColor: '#1E40AF', secondaryColor: '#EFF6FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#3B82F6',
    fontFamily: 'font-sans', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'octagon', photoPosition: 'float',
    previewBg: 'bg-blue-100', tags: ['innovation', 'premium'],
  },
  {
    id: 42, name: 'Aurora Borealis', nameFr: 'Aurore Boréale', tier: 'elite',
    description: 'Gradient header with aurora color accents', descriptionFr: 'En-tête dégradé, accents aurore boréale',
    primaryColor: '#065F46', secondaryColor: '#0F172A', bgColor: '#0F172A', textColor: '#D1FAE5', accentColor: '#34D399',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-emerald-950', tags: ['tech', 'premium', 'élite'],
  },
  {
    id: 43, name: 'Parisian Chic', nameFr: 'Chic Parisien', tier: 'premium',
    description: 'French haute couture inspired layout', descriptionFr: 'Mise en page inspirée de la haute couture française',
    primaryColor: '#1A1A2E', secondaryColor: '#FDF8F0', bgColor: '#FDF8F0', textColor: '#1A1A2E', accentColor: '#C9A96E',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: true,
    photoShape: 'rounded', photoPosition: 'float',
    previewBg: 'bg-orange-50', tags: ['mode', 'luxe', 'premium'],
  },
  {
    id: 44, name: 'Quantum Dark', nameFr: 'Quantique Sombre', tier: 'elite',
    description: 'Advanced dark tech with floating panels', descriptionFr: 'Tech sombre avancé avec panneaux flottants',
    primaryColor: '#7C3AED', secondaryColor: '#1E1B4B', bgColor: '#0F0F23', textColor: '#E0E7FF', accentColor: '#A78BFA',
    fontFamily: 'font-mono', layout: 'sidebar-right', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'octagon', photoPosition: 'sidebar-top',
    previewBg: 'bg-violet-950', tags: ['quantique', 'recherche', 'élite'],
  },
  {
    id: 45, name: 'Sahara Gold', nameFr: 'Or Sahara', tier: 'premium',
    description: 'Desert gold tones with floating content blocks', descriptionFr: 'Tons or désert avec blocs de contenu flottants',
    primaryColor: '#92400E', secondaryColor: '#FFFBEB', bgColor: '#FEFDF8', textColor: '#1A1A1A', accentColor: '#F59E0B',
    fontFamily: 'font-serif', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'arch', photoPosition: 'float',
    previewBg: 'bg-amber-100', tags: ['business', 'luxe', 'premium'],
  },
  {
    id: 46, name: 'Arctic White', nameFr: 'Blanc Arctique', tier: 'premium',
    description: 'Pristine white with ice-blue accents', descriptionFr: 'Blanc immaculé avec accents bleu glacé',
    primaryColor: '#0C4A6E', secondaryColor: '#F0F9FF', bgColor: '#FFFFFF', textColor: '#0C4A6E', accentColor: '#38BDF8',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'header-right',
    previewBg: 'bg-sky-50', tags: ['pharma', 'médical', 'premium'],
  },
  {
    id: 47, name: 'Crimson Luxury', nameFr: 'Luxe Cramoisi', tier: 'premium',
    description: 'Deep crimson luxury editorial style', descriptionFr: 'Style éditorial luxueux cramoisi profond',
    primaryColor: '#7F1D1D', secondaryColor: '#FEF2F2', bgColor: '#FFFAFA', textColor: '#1A1A1A', accentColor: '#EF4444',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: true,
    photoShape: 'rounded', photoPosition: 'float',
    previewBg: 'bg-red-50', tags: ['luxe', 'premium', 'haut de gamme'],
  },
  {
    id: 48, name: 'Obsidian Pro', nameFr: 'Obsidienne Pro', tier: 'elite',
    description: 'Deep obsidian with neon highlights', descriptionFr: 'Obsidienne profonde avec surlignages néon',
    primaryColor: '#22D3EE', secondaryColor: '#0F1923', bgColor: '#0A0F1A', textColor: '#E2E8F0', accentColor: '#F0ABFC',
    fontFamily: 'font-mono', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'hexagon', photoPosition: 'sidebar-top',
    previewBg: 'bg-gray-950', tags: ['cyber', 'tech', 'élite'],
  },
  {
    id: 49, name: 'Emerald Elite', nameFr: 'Élite Émeraude', tier: 'elite',
    description: 'Deep emerald with portfolio grid', descriptionFr: 'Émeraude profond avec grille portfolio',
    primaryColor: '#047857', secondaryColor: '#ECFDF5', bgColor: '#F0FDF4', textColor: '#1A1A1A', accentColor: '#10B981',
    fontFamily: 'font-sans', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: true,
    photoShape: 'octagon', photoPosition: 'float',
    previewBg: 'bg-emerald-100', tags: ['finance', 'investissement', 'élite'],
  },
  {
    id: 50, name: 'Golden Era', nameFr: 'Ère Dorée', tier: 'elite',
    description: 'Timeless gold editorial, maximum prestige', descriptionFr: 'Or éditorial intemporel, prestige maximum',
    primaryColor: '#1A1A1A', secondaryColor: '#FDF8E8', bgColor: '#FDF8E8', textColor: '#1A1A1A', accentColor: '#D4AF37',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: true,
    photoShape: 'rounded', photoPosition: 'float',
    previewBg: 'bg-yellow-50', tags: ['prestige', 'direction', 'élite'],
  },

  // ── 5 TEMPLATES INSPIRÉS DU CV HERMINE (sidebar gauche colorée, photo cercle, dots langues) ──

  // Hermine 1 — Violet Royal (Premium) : reproduction fidèle du style Hermine
  {
    id: 51, name: 'Hermine Violet', nameFr: 'Violet Royal', tier: 'premium',
    description: 'Deep purple sidebar with dot-rated languages — Hermine style', descriptionFr: 'Sidebar violet profond, notes langues en points — style Hermine',
    primaryColor: '#5B21B6', secondaryColor: '#EDE9FE', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#7C3AED',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-violet-700', tags: ['médical', 'santé', 'hermine', 'premium'],
  },
  // Hermine 2 — Marine Élégant (Free)
  {
    id: 52, name: 'Hermine Navy', nameFr: 'Marine Élégant', tier: 'free',
    description: 'Navy blue sidebar, Hermine layout — professional medical', descriptionFr: 'Sidebar bleu marine, structure Hermine — médical professionnel',
    primaryColor: '#1B365D', secondaryColor: '#E8EEF7', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#2563EB',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-blue-900', tags: ['médical', 'académique', 'hermine'],
  },
  // Hermine 3 — Émeraude Prestige (Free)
  {
    id: 53, name: 'Hermine Emerald', nameFr: 'Émeraude Prestige', tier: 'free',
    description: 'Emerald green sidebar, Hermine structure', descriptionFr: 'Sidebar vert émeraude, structure Hermine',
    primaryColor: '#065F46', secondaryColor: '#ECFDF5', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#059669',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-emerald-800', tags: ['santé', 'environnement', 'hermine'],
  },
  // Hermine 4 — Bordeaux Raffiné (Premium)
  {
    id: 54, name: 'Hermine Bordeaux', nameFr: 'Bordeaux Raffiné', tier: 'premium',
    description: 'Rich bordeaux sidebar, elegant Hermine layout', descriptionFr: 'Sidebar bordeaux profond, mise en page Hermine élégante',
    primaryColor: '#7A1C1C', secondaryColor: '#FEF2F2', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#DC2626',
    fontFamily: 'font-serif', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-red-900', tags: ['droit', 'direction', 'hermine', 'premium'],
  },
  // Hermine 5 — Minuit Doré (Elite)
  {
    id: 55, name: 'Hermine Gold', nameFr: 'Minuit Doré', tier: 'elite',
    description: 'Midnight black sidebar with gold accents — prestige Hermine', descriptionFr: 'Sidebar minuit avec accents or — Hermine prestige élite',
    primaryColor: '#0F172A', secondaryColor: '#1E293B', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#D4AF37',
    fontFamily: 'font-serif', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-950', tags: ['luxe', 'prestige', 'hermine', 'élite'],
  },

  // ── 15 NOUVEAUX TEMPLATES GÉNÉRAUX (IDs 56–70) ──

  // 56 — Provence Lavande (Free)
  {
    id: 56, name: 'Provence Lavender', nameFr: 'Provence Lavande', tier: 'free',
    description: 'Soft lavender sidebar with airy white content', descriptionFr: 'Sidebar lavande douce, contenu blanc aéré',
    primaryColor: '#6D28D9', secondaryColor: '#F5F3FF', bgColor: '#FEFEFE', textColor: '#1A1A1A', accentColor: '#8B5CF6',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-violet-600', tags: ['créatif', 'arts', 'bien-être'],
  },
  // 57 — Brique Moderne (Free)
  {
    id: 57, name: 'Modern Brick', nameFr: 'Brique Moderne', tier: 'free',
    description: 'Bold brick red header with clean two-column body', descriptionFr: 'En-tête brique audacieux, corps bicolonne épuré',
    primaryColor: '#9A3412', secondaryColor: '#FFF7ED', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#EA580C',
    fontFamily: 'font-sans', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-orange-800', tags: ['BTP', 'industrie', 'artisanat'],
  },
  // 58 — Glacé Blanc (Free)
  {
    id: 58, name: 'Ice White', nameFr: 'Glacé Blanc', tier: 'free',
    description: 'Ultra-minimalist white with subtle grey lines', descriptionFr: 'Blanc ultra-minimaliste, lignes grises subtiles',
    primaryColor: '#374151', secondaryColor: '#F9FAFB', bgColor: '#FFFFFF', textColor: '#111827', accentColor: '#6B7280',
    fontFamily: 'font-sans', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'header-right',
    previewBg: 'bg-gray-100', tags: ['minimaliste', 'moderne', 'généraliste'],
  },
  // 59 — Bambou Zen (Free)
  {
    id: 59, name: 'Bamboo Zen', nameFr: 'Bambou Zen', tier: 'free',
    description: 'Zen bamboo green sidebar with calm layout', descriptionFr: 'Sidebar vert bambou zen, mise en page apaisante',
    primaryColor: '#166534', secondaryColor: '#F0FDF4', bgColor: '#FEFEFE', textColor: '#1A1A1A', accentColor: '#16A34A',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-green-800', tags: ['nature', 'écologie', 'bien-être'],
  },
  // 60 — Sahel Terre (Free)
  {
    id: 60, name: 'Sahel Earth', nameFr: 'Sahel Terre', tier: 'free',
    description: 'Warm African earth tones, two-column layout', descriptionFr: 'Tons terre africains chauds, bicolonne',
    primaryColor: '#92400E', secondaryColor: '#FEF3C7', bgColor: '#FFFEF5', textColor: '#1A1A1A', accentColor: '#B45309',
    fontFamily: 'font-serif', layout: 'two-col', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-amber-800', tags: ['généraliste', 'agriculture', 'commerce'],
  },
  // 61 — Rose Perlé (Free)
  {
    id: 61, name: 'Pearl Rose', nameFr: 'Rose Perlé', tier: 'free',
    description: 'Soft pearl rose with feminine elegance', descriptionFr: 'Rose perlé doux avec élégance féminine',
    primaryColor: '#BE185D', secondaryColor: '#FDF2F8', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#EC4899',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'header-right',
    previewBg: 'bg-pink-700', tags: ['mode', 'beauté', 'luxe'],
  },
  // 62 — Cognac Premium (Premium)
  {
    id: 62, name: 'Cognac Premium', nameFr: 'Cognac Prestige', tier: 'premium',
    description: 'Rich cognac editorial with gold thread details', descriptionFr: 'Éditorial cognac riche, détails fil doré',
    primaryColor: '#78350F', secondaryColor: '#FFFBEB', bgColor: '#FEFDF8', textColor: '#1A1A1A', accentColor: '#D97706',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'float',
    previewBg: 'bg-amber-900', tags: ['luxe', 'hôtellerie', 'gastronomie', 'premium'],
  },
  // 63 — Diamant Bleu (Premium)
  {
    id: 63, name: 'Blue Diamond', nameFr: 'Diamant Bleu', tier: 'premium',
    description: 'Sapphire blue luxury asymmetric design', descriptionFr: 'Design asymétrique luxe bleu saphir',
    primaryColor: '#1E3A8A', secondaryColor: '#EFF6FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#3B82F6',
    fontFamily: 'font-sans', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'octagon', photoPosition: 'float',
    previewBg: 'bg-blue-900', tags: ['finance', 'consulting', 'premium'],
  },
  // 64 — Caraïbes (Free)
  {
    id: 64, name: 'Caribbean', nameFr: 'Caraïbes', tier: 'free',
    description: 'Vibrant Caribbean turquoise sidebar', descriptionFr: 'Sidebar turquoise caraïbe vibrante',
    primaryColor: '#0E7490', secondaryColor: '#ECFEFF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#06B6D4',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-cyan-700', tags: ['tourisme', 'hôtellerie', 'restauration'],
  },
  // 65 — Velours Rouge (Premium)
  {
    id: 65, name: 'Red Velvet', nameFr: 'Velours Rouge', tier: 'premium',
    description: 'Deep red velvet luxury editorial style', descriptionFr: 'Style éditorial luxueux velours rouge profond',
    primaryColor: '#881337', secondaryColor: '#FFF1F2', bgColor: '#FFFAFA', textColor: '#1A1A1A', accentColor: '#E11D48',
    fontFamily: 'font-serif', layout: 'editorial', hasPhoto: true, hasMultiplePhotos: true,
    photoShape: 'arch', photoPosition: 'float',
    previewBg: 'bg-rose-900', tags: ['luxe', 'mode', 'arts', 'premium'],
  },
  // 66 — Encre Noire (Free)
  {
    id: 66, name: 'Black Ink', nameFr: 'Encre Noire', tier: 'free',
    description: 'Bold black ink single column, editorial feel', descriptionFr: 'Encre noire audacieuse monocolonne, esprit éditorial',
    primaryColor: '#0A0A0A', secondaryColor: '#F5F5F5', bgColor: '#FFFFFF', textColor: '#0A0A0A', accentColor: '#525252',
    fontFamily: 'font-serif', layout: 'single', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'square', photoPosition: 'header-right',
    previewBg: 'bg-neutral-900', tags: ['journalisme', 'rédaction', 'académique'],
  },
  // 67 — Pêche Douce (Free)
  {
    id: 67, name: 'Soft Peach', nameFr: 'Pêche Douce', tier: 'free',
    description: 'Delicate peach tones with gentle sidebar', descriptionFr: 'Tons pêche délicats avec sidebar douce',
    primaryColor: '#C2410C', secondaryColor: '#FFF7ED', bgColor: '#FFFBF7', textColor: '#1A1A1A', accentColor: '#F97316',
    fontFamily: 'font-sans', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'rounded', photoPosition: 'sidebar-top',
    previewBg: 'bg-orange-200', tags: ['créatif', 'communication', 'événementiel'],
  },
  // 68 — Volcanique (Premium)
  {
    id: 68, name: 'Volcanic', nameFr: 'Volcanique', tier: 'premium',
    description: 'Dark volcanic with lava orange accents', descriptionFr: 'Volcanique sombre avec accents orange lave',
    primaryColor: '#1C1917', secondaryColor: '#292524', bgColor: '#1C1917', textColor: '#F5F5F4', accentColor: '#F97316',
    fontFamily: 'font-mono', layout: 'sidebar-right', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'octagon', photoPosition: 'sidebar-top',
    previewBg: 'bg-stone-900', tags: ['tech', 'data', 'gaming', 'premium'],
  },
  // 69 — Tokyo Night (Elite)
  {
    id: 69, name: 'Tokyo Night', nameFr: 'Tokyo Nuit', tier: 'elite',
    description: 'Dark Tokyo aesthetic with neon pink and cyan', descriptionFr: 'Esthétique Tokyo nuit, rose néon et cyan',
    primaryColor: '#DB2777', secondaryColor: '#0F172A', bgColor: '#0F0A1E', textColor: '#E2E8F0', accentColor: '#22D3EE',
    fontFamily: 'font-mono', layout: 'sidebar-left', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'hexagon', photoPosition: 'sidebar-top',
    previewBg: 'bg-purple-950', tags: ['tech', 'gaming', 'élite', 'créatif'],
  },
  // 70 — Néon Prisme (Elite)
  {
    id: 70, name: 'Neon Prism', nameFr: 'Néon Prisme', tier: 'elite',
    description: 'Prismatic neon gradient editorial, maximum impact', descriptionFr: 'Éditorial dégradé prismatique néon, impact maximum',
    primaryColor: '#4F46E5', secondaryColor: '#0F172A', bgColor: '#080820', textColor: '#F0F4FF', accentColor: '#A855F7',
    fontFamily: 'font-mono', layout: 'asymmetric', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'octagon', photoPosition: 'float',
    previewBg: 'bg-indigo-950', tags: ['IA', 'startup', 'innovation', 'élite'],
  },

  // ── 5 TEMPLATES LAYOUT HERMINE (réplique fidèle du CV Hermine, couleurs & formes variées) ──

  // 71 — Violet Hermine (Premium) — formes cercles, identique à l'original
  {
    id: 71, name: 'Hermine Classic', nameFr: 'Hermine Classique', tier: 'premium',
    description: 'Exact Hermine layout — deep violet sidebar, circle photo, dot languages', descriptionFr: 'Mise en page Hermine exacte — sidebar violet profond, photo cercle, langues en points',
    primaryColor: '#5B21B6', secondaryColor: '#F5F3FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#7C3AED',
    fontFamily: 'font-sans', layout: 'hermine', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-violet-700', tags: ['hermine', 'médical', 'professionnel', 'premium'],
    sidebarShape: 'circles',
  },
  // 72 — Saphir Hermine (Free) — formes diagonales
  {
    id: 72, name: 'Hermine Sapphire', nameFr: 'Hermine Saphir', tier: 'free',
    description: 'Hermine layout — sapphire blue sidebar with diagonal stripe pattern', descriptionFr: 'Layout Hermine — sidebar bleu saphir avec motif diagonales',
    primaryColor: '#1E3A8A', secondaryColor: '#EFF6FF', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#3B82F6',
    fontFamily: 'font-sans', layout: 'hermine', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-blue-900', tags: ['hermine', 'médical', 'académique'],
    sidebarShape: 'diagonals',
  },
  // 73 — Terracotta Hermine (Free) — formes blob organiques
  {
    id: 73, name: 'Hermine Terracotta', nameFr: 'Hermine Terracotta', tier: 'free',
    description: 'Hermine layout — warm terracotta sidebar with organic blob shapes', descriptionFr: 'Layout Hermine — sidebar terracotta chaleureuse avec formes blob organiques',
    primaryColor: '#9A3412', secondaryColor: '#FFF7ED', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#EA580C',
    fontFamily: 'font-sans', layout: 'hermine', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-orange-800', tags: ['hermine', 'créatif', 'artisanat'],
    sidebarShape: 'blobs',
  },
  // 74 — Jade Hermine (Premium) — formes triangles géométriques
  {
    id: 74, name: 'Hermine Jade', nameFr: 'Hermine Jade', tier: 'premium',
    description: 'Hermine layout — jade green sidebar with geometric triangle pattern', descriptionFr: 'Layout Hermine — sidebar jade vert avec motif triangles géométriques',
    primaryColor: '#065F46', secondaryColor: '#ECFDF5', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#10B981',
    fontFamily: 'font-serif', layout: 'hermine', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-emerald-800', tags: ['hermine', 'santé', 'environnement', 'premium'],
    sidebarShape: 'triangles',
  },
  // 75 — Or & Nuit Hermine (Elite) — formes hexagonales
  {
    id: 75, name: 'Hermine Gold Night', nameFr: 'Hermine Or & Nuit', tier: 'elite',
    description: 'Hermine layout — midnight black sidebar with gold accents and hexagonal pattern', descriptionFr: 'Layout Hermine — sidebar nuit noire, accents or, motif hexagonal élite',
    primaryColor: '#0F172A', secondaryColor: '#1E293B', bgColor: '#FFFFFF', textColor: '#1A1A1A', accentColor: '#D4AF37',
    fontFamily: 'font-serif', layout: 'hermine', hasPhoto: true, hasMultiplePhotos: false,
    photoShape: 'circle', photoPosition: 'sidebar-top',
    previewBg: 'bg-slate-950', tags: ['hermine', 'luxe', 'prestige', 'élite'],
    sidebarShape: 'hexagons',
  },
];

export const getTemplateById = (id: number): TemplateConfig | undefined =>
  templates.find(t => t.id === id);

export const freeTemplates = templates.filter(t => t.tier === 'free');
export const premiumTemplates = templates.filter(t => t.tier === 'premium' || t.tier === 'elite');
export const eliteTemplates = templates.filter(t => t.tier === 'elite');
