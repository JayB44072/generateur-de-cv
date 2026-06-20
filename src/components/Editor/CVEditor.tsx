import { useState, useEffect, useCallback } from 'react';
import { Download, Eye, Edit3, Layers, Cloud, CloudOff, CheckCircle, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { supabase, CVContent, CVDataRow, defaultCVContent } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LanguageContext';
import { templates, getTemplateById } from '../../data/templates';
import CVRenderer from '../CVRenderer';
import PaywallModal, { PaywallReason } from '../PaywallModal';
import { PersonalStep, ExperienceStep, EducationStep, SkillsStep, LanguagesStep, CustomSectionsStep } from './FormSteps';
import { downloadCVAsPDF } from '../../lib/downloadCV';
import AIDesignAssistant from '../AIDesignAssistant';
type Step = 'personal' | 'experience' | 'education' | 'skills' | 'languages';
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type MobileTab = 'edit' | 'preview';

interface CVEditorProps {
  initialTemplateId?: number;
  editCvId?: string | null;
  forceNew?: boolean;
  onOpenTemplates: () => void;
  onAuthOpen: () => void;
  onCvLoaded?: () => void;
}

const DEBOUNCE_MS = 1500;

export default function CVEditor({ initialTemplateId = 1, editCvId, forceNew = false, onOpenTemplates, onAuthOpen, onCvLoaded }: CVEditorProps) {
  const { user, profile } = useAuth();
  const { t, lang } = useLang();
  const [step, setStep] = useState<Step>('personal');
  const [mobileTab, setMobileTab] = useState<MobileTab>('edit');
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [cvId, setCvId] = useState<string | null>(null);
  const [cvTitle, setCvTitle] = useState('Mon CV');
  const [content, setContent] = useState<CVContent>(defaultCVContent);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [paywall, setPaywall] = useState<{ open: boolean; reason: PaywallReason }>({ open: false, reason: 'premium_template' });
  const [previewScale, setPreviewScale] = useState(0.6);
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const template = getTemplateById(templateId) ?? templates[0];
  const userTier = profile?.subscription_tier ?? 'free';
  const showWatermark = userTier === 'free';

  // Load CV data from Supabase on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      // If editing a specific CV
      if (editCvId) {
        const { data } = await supabase
          .from('cv_data')
          .select('*')
          .eq('id', editCvId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          const row = data as CVDataRow;
          setCvId(row.id);
          setTemplateId(row.template_id);
          setCvTitle(row.cv_title);
          setContent(row.cv_content as CVContent);
          onCvLoaded?.();
          return;
        }
      }

      // If forcing a new CV or no editCvId
      if (forceNew) {
        // Create a new CV with the selected template
        const { data: newRow } = await supabase
          .from('cv_data')
          .insert({
            template_id: initialTemplateId,
            cv_title: lang === 'fr' ? 'Mon nouveau CV' : 'My new CV',
            cv_content: defaultCVContent,
          })
          .select()
          .single();
        if (newRow) {
          setCvId(newRow.id);
          setTemplateId(initialTemplateId);
          setContent(defaultCVContent);
          onCvLoaded?.();
        }
        return;
      }

      // Default behavior: load most recent CV
      const { data } = await supabase
        .from('cv_data')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        const row = data as CVDataRow;
        setCvId(row.id);
        setTemplateId(row.template_id);
        setCvTitle(row.cv_title);
        setContent(row.cv_content as CVContent);
      } else {
        // Create initial CV
        const { data: newRow } = await supabase
          .from('cv_data')
          .insert({ template_id: initialTemplateId, cv_title: cvTitle, cv_content: defaultCVContent })
          .select()
          .single();
        if (newRow) setCvId(newRow.id);
      }
    })();
  }, [user, editCvId, forceNew, initialTemplateId]);

  // Auto-save with debounce
  const triggerSave = useCallback((newContent: CVContent, newTemplateId: number, newTitle: string) => {
    if (!user || !cvId) return;
    if (saveTimer) clearTimeout(saveTimer);
    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from('cv_data')
        .update({ cv_content: newContent, template_id: newTemplateId, cv_title: newTitle })
        .eq('id', cvId)
        .eq('user_id', user.id);
      setSaveStatus(error ? 'error' : 'saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, DEBOUNCE_MS);
    setSaveTimer(timer);
  }, [user, cvId, saveTimer]);

  const handleContentChange = (newContent: CVContent) => {
    setContent(newContent);
    triggerSave(newContent, templateId, cvTitle);
  };

  const handleTemplateChange = (newId: number) => {
    setTemplateId(newId);
    triggerSave(content, newId, cvTitle);
  };

  const handleTitleChange = (newTitle: string) => {
    setCvTitle(newTitle);
    triggerSave(content, templateId, newTitle);
  };

  const [downloading, setDownloading] = useState(false);

  const canDownload = () => {
    if (userTier === 'free' && template.tier !== 'free') return false;
    return true;
  };

  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!canDownload()) {
      setPaywall({ open: true, reason: 'download_premium' });
      return;
    }
    // Sur mobile, s'assurer que le preview est visible dans le DOM avant la capture
    setMobileTab('preview');
    setDownloading(true);
    setDownloadError(null);
    // Laisser un tick au navigateur pour monter le panel si nécessaire
    await new Promise(r => setTimeout(r, 80));
    try {
      const safeName = cvTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mon-cv';
      await downloadCVAsPDF('cv-preview-print', `${safeName}.pdf`);
    } catch (err) {
      console.error('Erreur PDF', err);
      setDownloadError('Échec de la génération du PDF. Réessayez ou changez de navigateur.');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  const steps: { key: Step; label: string }[] = [
    { key: 'personal', label: t.editor.steps.personal },
    { key: 'experience', label: t.editor.steps.experience },
    { key: 'education', label: t.editor.steps.education },
    { key: 'skills', label: t.editor.steps.skills },
    { key: 'languages', label: t.editor.steps.languages },
  ];

  const stepIndex = steps.findIndex(s => s.key === step);

  const saveIcon = {
    idle: null,
    saving: <Loader2 size={12} className="animate-spin text-blue-500" />,
    saved: <CheckCircle size={12} className="text-green-500" />,
    error: <CloudOff size={12} className="text-red-500" />,
  }[saveStatus];

  const saveLabel = {
    idle: '',
    saving: t.editor.saveStatus.saving,
    saved: t.editor.saveStatus.saved,
    error: t.editor.saveStatus.error,
  }[saveStatus];

  const renderStepContent = () => {
    switch (step) {
      case 'personal': return <PersonalStep content={content} onChange={handleContentChange} />;
      case 'experience': return <ExperienceStep content={content} onChange={handleContentChange} />;
      case 'education': return <EducationStep content={content} onChange={handleContentChange} />;
      case 'skills': return <SkillsStep content={content} onChange={handleContentChange} />;
      case 'languages': return <LanguagesStep content={content} onChange={handleContentChange} />;
    }
  };

  // ─── Form Panel ────────────────────────────────────────────────
  const FormPanel = (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-blue-600" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">{t.editor.formTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {saveIcon && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                {saveIcon}
                <span>{saveLabel}</span>
              </div>
            )}
            {!user && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Cloud size={12} />
                <button onClick={onAuthOpen} className="underline hover:no-underline">Connexion pour sauvegarder</button>
              </div>
            )}
          </div>
        </div>

        {/* CV title */}
        <input
          value={cvTitle}
          onChange={e => handleTitleChange(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t.editor.cvTitle}
        />

        {/* Template quick-select bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={onOpenTemplates}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Layers size={12} /> {t.editor.changeTemplate}
          </button>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            {templates.slice(0, 10).map(tpl => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateChange(tpl.id)}
                title={tpl.name}
                className={`shrink-0 w-7 h-7 rounded-lg border-2 transition-all ${
                  templateId === tpl.id ? 'border-blue-500 scale-110' : 'border-transparent hover:border-gray-300'
                }`}
                style={{ backgroundColor: tpl.primaryColor }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
        {steps.map((s, i) => (
          <button
            key={s.key}
            onClick={() => setStep(s.key)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              step === s.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="mr-1 opacity-60">{i + 1}.</span>{s.label}
          </button>
        ))}
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderStepContent()}
        {/* Custom sections at bottom */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <CustomSectionsStep
            content={content}
            onChange={handleContentChange}
            onPaywall={() => setPaywall({ open: true, reason: 'custom_section' })}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => setStep(steps[Math.max(0, stepIndex - 1)].key)}
          disabled={stepIndex === 0}
          className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← {t.common.prev}
        </button>
        <div className="flex gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === stepIndex ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`} />
          ))}
        </div>
        {stepIndex < steps.length - 1 ? (
          <button
            onClick={() => setStep(steps[stepIndex + 1].key)}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            {t.common.next} →
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-xl transition-colors"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? 'Génération…' : t.editor.download}
          </button>
        )}
      </div>
    </div>
  );

  // ─── Preview Panel ──────────────────────────────────────────────
  const PreviewPanel = (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950">
      {/* Preview header */}
      <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-blue-600" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white">{t.editor.previewTitle}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            #{template.id} {template.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewScale(s => Math.max(0.3, s - 0.1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center">{Math.round(previewScale * 100)}%</span>
          <button onClick={() => setPreviewScale(s => Math.min(1.2, s + 0.1))}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <ZoomIn size={14} />
          </button>
          <button onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors">
            {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {downloading ? '…' : 'PDF'}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950 border-b border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
          {downloadError}
        </div>
      )}

      {/* Preview area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        <div
          id="cv-preview-print"
          style={{
            width: '210mm',
            minHeight: '297mm',
            transformOrigin: 'top center',
            transform: `scale(${previewScale})`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            borderRadius: '4px',
          }}
          className="bg-white overflow-hidden print:shadow-none print:rounded-none"
        >
          <CVRenderer template={template} content={content} showWatermark={showWatermark} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Desktop split view */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          {FormPanel}
        </div>
        <div className="w-1/2 flex flex-col overflow-hidden">
          {PreviewPanel}
        </div>
      </div>

      {/* Mobile tab view */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        {/* Tab bar */}
        <div className="flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              mobileTab === 'edit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Edit3 size={16} /> {t.editor.editTab}
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              mobileTab === 'preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Eye size={16} /> {t.editor.previewTab}
          </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {/* Les deux panels restent montés dans le DOM pour que cv-preview-print soit toujours accessible */}
          <div className={`absolute inset-0 overflow-hidden ${mobileTab === 'edit' ? 'block' : 'hidden'}`}>
            {FormPanel}
          </div>
          <div className={`absolute inset-0 overflow-hidden ${mobileTab === 'preview' ? 'block' : 'hidden'}`}>
            {PreviewPanel}
          </div>
        </div>
      </div>

      {/* AI Design Assistant floating button */}
      <AIDesignAssistant
        currentTemplateId={templateId}
        onSelectTemplate={handleTemplateChange}
        content={content}
      />

      {/* Paywall */}
      {paywall.open && (
        <PaywallModal
          reason={paywall.reason}
          onClose={() => setPaywall(p => ({ ...p, open: false }))}
          onAuthOpen={onAuthOpen}
        />
      )}

      {/* Print styles supprimés — PDF généré via html-to-image + jsPDF */}
    </div>
  );
}
