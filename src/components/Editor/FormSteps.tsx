import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { CVContent, Experience, Education, Skill, Language, CustomSection } from '../../lib/supabase';
import { useLang } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import AIButton from '../AIButton';
import PaywallModal from '../PaywallModal';

function uid() { return Math.random().toString(36).slice(2); }

const inputCls = "w-full px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

// ─── Personal Info Step ──────────────────────────────────────────
export function PersonalStep({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const { t } = useLang();
  const { profile } = useAuth();
  const p = content.personalInfo;
  const set = (key: keyof typeof p, val: string) =>
    onChange({ ...content, personalInfo: { ...p, [key]: val } });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange({ ...content, profilePhoto: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const isPremiumTemplate = true; // Photo disponible pour tous les modèles

  return (
    <div className="space-y-4">
      {/* Photo upload */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
          {content.profilePhoto
            ? <img src={content.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                {(p.firstName || 'N')[0]}
              </div>
          }
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{t.editor.personal.profilePhoto}</p>
          <label className="mt-1 inline-block cursor-pointer text-xs text-blue-600 dark:text-blue-400 hover:underline">
            {t.editor.personal.addPhoto}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          {content.profilePhoto && (
            <button onClick={() => onChange({ ...content, profilePhoto: undefined })}
              className="ml-3 text-xs text-red-500 hover:underline">
              Supprimer
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.editor.personal.firstName}</label>
          <input className={inputCls} value={p.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Nom" />
        </div>
        <div>
          <label className={labelCls}>{t.editor.personal.lastName}</label>
          <input className={inputCls} value={p.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Prénom" />
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.editor.personal.jobTitle}</label>
        <input className={inputCls} value={p.title} onChange={e => set('title', e.target.value)} placeholder="Développeur Full-Stack Senior" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.editor.personal.email}</label>
          <input className={inputCls} type="email" value={p.email} onChange={e => set('email', e.target.value)} placeholder="example@gmail.com" />
        </div>
        <div>
          <label className={labelCls}>{t.editor.personal.phone}</label>
          <input className={inputCls} value={p.phone} onChange={e => set('phone', e.target.value)} placeholder="+226 70 00 00 00" />
        </div>
      </div>

      <div>
        <label className={labelCls}>{t.editor.personal.address}</label>
        <input className={inputCls} value={p.address} onChange={e => set('address', e.target.value)} placeholder="Ouagadougou, Burkina Faso" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>{t.editor.personal.website}</label>
          <input className={inputCls} value={p.website} onChange={e => set('website', e.target.value)} placeholder="monsite.com" />
        </div>
        <div>
          <label className={labelCls}>{t.editor.personal.linkedin}</label>
          <input className={inputCls} value={p.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/nom" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls + ' mb-0'}>{t.editor.personal.summary}</label>
          <AIButton
            text={p.summary}
            onImprove={val => set('summary', val)}
            context="résumé professionnel"
          />
        </div>
        <textarea
          className={inputCls + ' resize-none'}
          rows={4}
          value={p.summary}
          onChange={e => set('summary', e.target.value)}
          placeholder={t.editor.personal.summaryPlaceholder}
        />
      </div>

      {/* Portfolio photos (premium) */}
      {(profile?.subscription_tier !== 'free') && (
        <div>
          <label className={labelCls}>{t.editor.personal.portfolioPhotos}</label>
          <div className="flex flex-wrap gap-2">
            {(content.portfolioPhotos ?? []).map((photo, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden">
                <img src={photo} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    const photos = [...(content.portfolioPhotos ?? [])];
                    photos.splice(i, 1);
                    onChange({ ...content, portfolioPhotos: photos });
                  }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                >×</button>
              </div>
            ))}
            <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              <Plus size={20} className="text-gray-400" />
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                  const photos = [...(content.portfolioPhotos ?? []), ev.target?.result as string];
                  onChange({ ...content, portfolioPhotos: photos });
                };
                reader.readAsDataURL(file);
              }} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Experience Step ─────────────────────────────────────────────
export function ExperienceStep({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const newExp: Experience = {
      id: uid(), company: '', position: '', startDate: '', endDate: '', current: false, description: '', location: '',
    };
    onChange({ ...content, experiences: [...content.experiences, newExp] });
    setExpanded(newExp.id);
  };

  const update = (id: string, key: keyof Experience, val: string | boolean) => {
    onChange({
      ...content,
      experiences: content.experiences.map(e => e.id === id ? { ...e, [key]: val } : e),
    });
  };

  const remove = (id: string) => onChange({ ...content, experiences: content.experiences.filter(e => e.id !== id) });

  return (
    <div className="space-y-3">
      {content.experiences.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <p className="text-sm">{t.editor.experience.noItems}</p>
        </div>
      )}
      {content.experiences.map(exp => (
        <div key={exp.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setExpanded(expanded === exp.id ? null : exp.id)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {exp.position || t.editor.experience.position}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{exp.company || t.editor.experience.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={e => { e.stopPropagation(); remove(exp.id); }}
                className="p-1 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={14} />
              </button>
              {expanded === exp.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </button>
          {expanded === exp.id && (
            <div className="px-4 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.editor.experience.position}</label>
                  <input className={inputCls} value={exp.position} onChange={e => update(exp.id, 'position', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{t.editor.experience.company}</label>
                  <input className={inputCls} value={exp.company} onChange={e => update(exp.id, 'company', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.editor.experience.location}</label>
                <input className={inputCls} value={exp.location} onChange={e => update(exp.id, 'location', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.editor.experience.startDate}</label>
                  <input className={inputCls} type="month" value={exp.startDate} onChange={e => update(exp.id, 'startDate', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{t.editor.experience.endDate}</label>
                  <input className={inputCls} type="month" value={exp.endDate} disabled={exp.current} onChange={e => update(exp.id, 'endDate', e.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={e => update(exp.id, 'current', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.editor.experience.current}</span>
              </label>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={labelCls + ' mb-0'}>{t.editor.experience.description}</label>
                  <AIButton text={exp.description} onImprove={val => update(exp.id, 'description', val)}
                    context="description de poste" />
                </div>
                <textarea className={inputCls + ' resize-none'} rows={3}
                  value={exp.description} onChange={e => update(exp.id, 'description', e.target.value)}
                  placeholder={t.editor.experience.descPlaceholder} />
              </div>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> {t.editor.experience.addBtn}
      </button>
    </div>
  );
}

// ─── Education Step ──────────────────────────────────────────────
export function EducationStep({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const newEdu: Education = {
      id: uid(), institution: '', degree: '', field: '', startDate: '', endDate: '', current: false, description: '', location: '',
    };
    onChange({ ...content, educations: [...content.educations, newEdu] });
    setExpanded(newEdu.id);
  };

  const update = (id: string, key: keyof Education, val: string | boolean) => {
    onChange({ ...content, educations: content.educations.map(e => e.id === id ? { ...e, [key]: val } : e) });
  };

  const remove = (id: string) => onChange({ ...content, educations: content.educations.filter(e => e.id !== id) });

  return (
    <div className="space-y-3">
      {content.educations.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <p className="text-sm">{t.editor.education.noItems}</p>
        </div>
      )}
      {content.educations.map(edu => (
        <div key={edu.id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <button type="button"
            onClick={() => setExpanded(expanded === edu.id ? null : edu.id)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{edu.degree || t.editor.education.degree}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{edu.institution || t.editor.education.institution}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={e => { e.stopPropagation(); remove(edu.id); }}
                className="p-1 text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={14} />
              </button>
              {expanded === edu.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </div>
          </button>
          {expanded === edu.id && (
            <div className="px-4 py-4 space-y-3">
              <div>
                <label className={labelCls}>{t.editor.education.institution}</label>
                <input className={inputCls} value={edu.institution} onChange={e => update(edu.id, 'institution', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.editor.education.degree}</label>
                  <input className={inputCls} value={edu.degree} onChange={e => update(edu.id, 'degree', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{t.editor.education.field}</label>
                  <input className={inputCls} value={edu.field} onChange={e => update(edu.id, 'field', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>{t.editor.education.location}</label>
                <input className={inputCls} value={edu.location} onChange={e => update(edu.id, 'location', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{t.editor.education.startDate}</label>
                  <input className={inputCls} type="month" value={edu.startDate} onChange={e => update(edu.id, 'startDate', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>{t.editor.education.endDate}</label>
                  <input className={inputCls} type="month" value={edu.endDate} disabled={edu.current} onChange={e => update(edu.id, 'endDate', e.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={edu.current} onChange={e => update(edu.id, 'current', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.editor.education.current}</span>
              </label>
              <div>
                <label className={labelCls}>{t.editor.education.description}</label>
                <textarea className={inputCls + ' resize-none'} rows={2}
                  value={edu.description} onChange={e => update(edu.id, 'description', e.target.value)}
                  placeholder={t.editor.education.descPlaceholder} />
              </div>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> {t.editor.education.addBtn}
      </button>
    </div>
  );
}

// ─── Skills Step ─────────────────────────────────────────────────
export function SkillsStep({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const { t, lang } = useLang();
  const { profile } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [generating, setGenerating] = useState(false);

  const add = () => {
    const newSkill: Skill = { id: uid(), name: '', level: 3, category: '' };
    onChange({ ...content, skills: [...content.skills, newSkill] });
  };

  const update = (id: string, key: keyof Skill, val: string | number) =>
    onChange({ ...content, skills: content.skills.map(s => s.id === id ? { ...s, [key]: val } : s) });

  const remove = (id: string) => onChange({ ...content, skills: content.skills.filter(s => s.id !== id) });

  const handleGenerateAI = async () => {
    if (profile?.subscription_tier !== 'ai') { setShowPaywall(true); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));

    const jobTitle = content.personalInfo.title.toLowerCase();
    let skillPools: { name: string; level: number }[][] = [
      [
        { name: 'Leadership', level: 4 },
        { name: 'Communication', level: 5 },
        { name: 'Gestion de projet', level: 4 },
        { name: 'Résolution de problèmes', level: 5 },
        { name: 'Travail en équipe', level: 4 },
      ],
    ];
    if (jobTitle.includes('développeur') || jobTitle.includes('developer') || jobTitle.includes('ingénieur') || jobTitle.includes('engineer')) {
      skillPools.push([
        { name: 'JavaScript/TypeScript', level: 5 },
        { name: 'React / Vue.js', level: 4 },
        { name: 'Node.js', level: 4 },
        { name: 'SQL / NoSQL', level: 3 },
        { name: 'Git / CI-CD', level: 4 },
      ]);
    }
    if (jobTitle.includes('marketing') || jobTitle.includes('communication')) {
      skillPools.push([
        { name: 'SEO / SEA', level: 4 },
        { name: 'Analyse de données', level: 3 },
        { name: 'Gestion de campagnes', level: 4 },
        { name: 'Copywriting', level: 5 },
        { name: 'Médias sociaux', level: 4 },
      ]);
    }
    if (jobTitle.includes('manager') || jobTitle.includes('directeur') || jobTitle.includes('director')) {
      skillPools.push([
        { name: 'Management d\'équipe', level: 5 },
        { name: 'Stratégie d\'entreprise', level: 4 },
        { name: 'Budgeting', level: 4 },
        { name: 'Négociation', level: 5 },
        { name: 'Prise de décision', level: 4 },
      ]);
    }
    if (jobTitle.includes('designer') || jobTitle.includes('design') || jobTitle.includes('graphiste')) {
      skillPools.push([
        { name: 'Figma / Sketch', level: 5 },
        { name: 'UI/UX Design', level: 4 },
        { name: 'Adobe Creative Suite', level: 4 },
        { name: 'Prototypage', level: 4 },
        { name: 'Design System', level: 3 },
      ]);
    }

    const selectedPool = skillPools[Math.floor(Math.random() * skillPools.length)];
    const aiSkills: Skill[] = selectedPool.map(s => ({
      id: uid(),
      name: s.name,
      level: s.level,
      category: '',
    }));
    onChange({ ...content, skills: [...content.skills, ...aiSkills] });
    setGenerating(false);
  };

  const levelLabels = t.editor.skills.levels;

  return (
    <div className="space-y-3">
      {content.skills.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <p className="text-sm">{t.editor.skills.noItems}</p>
        </div>
      )}
      <div className="space-y-2">
        {content.skills.map(sk => (
          <div key={sk.id} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <input
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={sk.name}
              onChange={e => update(sk.id, 'name', e.target.value)}
              placeholder={t.editor.skills.name}
            />
            <select
              value={sk.level}
              onChange={e => update(sk.id, 'level', parseInt(e.target.value))}
              className="w-32 shrink-0 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {levelLabels.map((lbl, i) => (
                <option key={i} value={i + 1} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{lbl}</option>
              ))}
            </select>
            <button type="button" onClick={() => remove(sk.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={add}
          className="flex-1 py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
          <Plus size={16} /> {t.editor.skills.addBtn}
        </button>
        <button type="button" onClick={handleGenerateAI} disabled={generating}
          className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all ${
            profile?.subscription_tier === 'ai'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600 hover:border-amber-400'
          }`}>
          {generating ? (
            <>
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{lang === 'fr' ? 'Génération...' : 'Generating...'}</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>{t.editor.skills.generateAI}</span>
            </>
          )}
        </button>
      </div>
      {showPaywall && <PaywallModal reason="ai_feature" onClose={() => setShowPaywall(false)} />}
    </div>
  );
}

// ─── Languages Step ──────────────────────────────────────────────
export function LanguagesStep({ content, onChange }: { content: CVContent; onChange: (c: CVContent) => void }) {
  const { t } = useLang();

  const add = () => {
    const newLang: Language = { id: uid(), name: '', level: 'B2' };
    onChange({ ...content, languages: [...content.languages, newLang] });
  };

  const update = (id: string, key: keyof Language, val: string) =>
    onChange({ ...content, languages: content.languages.map(l => l.id === id ? { ...l, [key]: val } : l) });

  const remove = (id: string) => onChange({ ...content, languages: content.languages.filter(l => l.id !== id) });

  const levels: Language['level'][] = ['Native', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'];
  const levelLabels = t.editor.languages.levelLabels;

  return (
    <div className="space-y-3">
      {content.languages.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <p className="text-sm">{t.editor.languages.noItems}</p>
        </div>
      )}
      <div className="space-y-2">
        {content.languages.map(lang => (
          <div key={lang.id} className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <input
              className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={lang.name}
              onChange={e => update(lang.id, 'name', e.target.value)}
              placeholder={t.editor.languages.name}
            />
            <select
              value={lang.level}
              onChange={e => update(lang.id, 'level', e.target.value)}
              className="w-44 shrink-0 px-3 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {levels.map(lv => (
                <option key={lv} value={lv} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{levelLabels[lv]}</option>
              ))}
            </select>
            <button type="button" onClick={() => remove(lang.id)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> {t.editor.languages.addBtn}
      </button>
    </div>
  );
}

// ─── Custom Sections (Premium only) ─────────────────────────────
export function CustomSectionsStep({ content, onChange, onPaywall }: {
  content: CVContent; onChange: (c: CVContent) => void; onPaywall: () => void;
}) {
  const { t } = useLang();
  const { profile } = useAuth();
  const canAdd = profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'ai';

  const add = () => {
    if (!canAdd) { onPaywall(); return; }
    const newSection: CustomSection = { id: uid(), title: '', content: '' };
    onChange({ ...content, customSections: [...content.customSections, newSection] });
  };

  const update = (id: string, key: keyof CustomSection, val: string) =>
    onChange({ ...content, customSections: content.customSections.map(s => s.id === id ? { ...s, [key]: val } : s) });

  const remove = (id: string) =>
    onChange({ ...content, customSections: content.customSections.filter(s => s.id !== id) });

  return (
    <div className="space-y-3">
      {!canAdd && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-300">
          🔒 {t.paywall.customSectionLocked}
        </div>
      )}
      {content.customSections.map(cs => (
        <div key={cs.id} className="space-y-2 p-4 border border-gray-200 dark:border-gray-700 rounded-2xl">
          <div className="flex items-center justify-between">
            <input className={inputCls + ' flex-1'} value={cs.title}
              onChange={e => update(cs.id, 'title', e.target.value)}
              placeholder={t.editor.customSections.titleLabel} />
            <button type="button" onClick={() => remove(cs.id)}
              className="ml-2 p-1.5 text-red-400 hover:text-red-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <textarea className={inputCls + ' resize-none'} rows={3}
            value={cs.content} onChange={e => update(cs.id, 'content', e.target.value)}
            placeholder={t.editor.customSections.contentLabel} />
        </div>
      ))}
      <button type="button" onClick={add}
        className="w-full py-2.5 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
        <Plus size={16} /> {t.editor.customSections.addBtn}
      </button>
    </div>
  );
}