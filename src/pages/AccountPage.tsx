import { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { downloadCVAsPDF } from '../lib/downloadCV';
import { FileText, Download, Trash2, Plus, Edit3, Crown, Sparkles, Lock, Check, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { supabase, CVDataRow, CVContent, defaultCVContent, SubscriptionTier } from '../lib/supabase';
import { templates, getTemplateById } from '../data/templates';
import CVRenderer from '../components/CVRenderer';
import SubscriptionSwitcher from '../components/SubscriptionSwitcher';
import PaymentModal from '../components/paymentModal';
import PaymentNotification from '../components/paymentNotification';
import { Subscription } from '../lib/supabase';

interface AccountPageProps {
  onNavigate: (page: 'editor', cvId?: string) => void;
}

const tierBadge = { free: null, premium: 'bg-blue-500', ai: 'bg-gradient-to-r from-amber-500 to-orange-500' };
const tierLabel = { free: 'Gratuit', premium: 'Premium', ai: 'Élite IA' };

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const { user, profile, signOut } = useAuth();
  const { lang, t } = useLang();
  const [cvs, setCVs] = useState<CVDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [deletingCv, setDeletingCv] = useState<string | null>(null);
  const [downloadingCvId, setDownloadingCvId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ open: boolean; tier: 'premium' | 'ai' }>({ open: false, tier: 'premium' });
  const [notification, setNotification] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!user) return;
    loadCVs();
  }, [user]);

  const loadCVs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cv_data')
      .select('*')
      .eq('user_id', user!.id)
      .order('updated_at', { ascending: false });
    setCVs((data as CVDataRow[]) ?? []);
    setLoading(false);
  };

  const handleCreateNewCV = async () => {
    const { data } = await supabase
      .from('cv_data')
      .insert({
        template_id: 1,
        cv_title: lang === 'fr' ? 'Mon nouveau CV' : 'My new CV',
        cv_content: defaultCVContent,
      })
      .select()
      .single();
    if (data) {
      onNavigate('editor', data.id);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    setDeletingCv(cvId);
    await supabase.from('cv_data').delete().eq('id', cvId).eq('user_id', user!.id);
    setCVs(cvs.filter(c => c.id !== cvId));
    setDeletingCv(null);
  };

  const handleDownloadCV = async (cv: CVDataRow) => {
    const template = getTemplateById(cv.template_id) ?? templates[0];
    const showWatermark = profile?.subscription_tier === 'free' && template.tier !== 'free';

    setDownloadingCvId(cv.id);

    // Crée un div temporaire dans le DOM (même stratégie que l'éditeur :
    // overflow:hidden + width/height 0 pour forcer le rendu sans afficher)
    const wrapper = document.createElement('div');
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.style.cssText = 'position:absolute;top:0;left:0;opacity:0;pointer-events:none;z-index:-1;';

    const printEl = document.createElement('div');
    printEl.id = 'cv-account-print';
    printEl.style.cssText = 'width:210mm;min-height:297mm;background:#fff;';

    wrapper.appendChild(printEl);
    document.body.appendChild(wrapper);

    // Monte le CVRenderer React dans cet élément
    const root = createRoot(printEl);
    root.render(
      <CVRenderer
        template={template}
        content={cv.cv_content as CVContent}
        showWatermark={showWatermark}
      />
    );

    // Laisse React finir le rendu et le navigateur peindre
    await new Promise(r => setTimeout(r, 400));

    try {
      const safeName = cv.cv_title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'mon-cv';
      await downloadCVAsPDF('cv-account-print', `${safeName}.pdf`);
    } catch (err) {
      console.error('Erreur PDF compte', err);
      alert(lang === 'fr' ? 'Échec de la génération du PDF. Réessayez.' : 'PDF generation failed. Please retry.');
    } finally {
      root.unmount();
      document.body.removeChild(wrapper);
      setDownloadingCvId(null);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || !user) return;
    await supabase.from('profiles').update({ full_name: newName.trim() }).eq('id', user.id);
    setEditingName(false);
    // Profile will refresh via AuthContext
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError(lang === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 6) {
      setPasswordError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (error) {
      setPasswordError(lang === 'fr' ? 'Erreur lors du changement de mot de passe' : 'Error changing password');
    } else {
      setPasswordSuccess(true);
      setChangingPassword(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const currentTier = profile?.subscription_tier ?? 'free';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {lang === 'fr' ? 'Mon compte' : 'My Account'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
            </div>
            {profile && profile.subscription_tier !== 'free' && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold ${tierBadge[profile.subscription_tier]}`}>
                {profile.subscription_tier === 'ai' ? <Sparkles size={16} /> : <Crown size={16} />}
                {tierLabel[profile.subscription_tier]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - CVs */}
          <div className="lg:col-span-2 space-y-6">
            {/* My CVs */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-600" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {lang === 'fr' ? 'Mes CV' : 'My CVs'}
                  </h2>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                    {cvs.length}
                  </span>
                </div>
                <button
                  onClick={handleCreateNewCV}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Plus size={16} />
                  {lang === 'fr' ? 'Nouveau CV' : 'New CV'}
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <div className="px-6 py-12 text-center">
                    <RefreshCw size={24} className="animate-spin text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-400 mt-2">{lang === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                  </div>
                ) : cvs.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <FileText size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {lang === 'fr' ? 'Aucun CV pour le moment' : 'No CVs yet'}
                    </p>
                    <button
                      onClick={handleCreateNewCV}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      <Plus size={16} />
                      {lang === 'fr' ? 'Créer mon premier CV' : 'Create my first CV'}
                    </button>
                  </div>
                ) : (
                  cvs.map(cv => {
                    const template = getTemplateById(cv.template_id) ?? templates[0];
                    const isPremium = template.tier !== 'free';
                    const canAccess = currentTier !== 'free' || !isPremium;

                    return (
                      <div key={cv.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        {/* Template preview */}
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: template.primaryColor }}
                        >
                          <FileText size={20} className="text-white" />
                        </div>

                        {/* CV info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {cv.cv_title}
                            </p>
                            {isPremium && (
                              <span className={`text-xs px-1.5 py-0.5 rounded text-white ${template.tier === 'elite' ? 'bg-orange-500' : 'bg-blue-500'}`}>
                                {template.tier === 'elite' ? 'Élite' : 'Pro'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {template.name} · {lang === 'fr' ? 'Modifié le' : 'Modified'} {new Date(cv.updated_at).toLocaleDateString(lang)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onNavigate('editor', cv.id)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-600 transition-colors"
                            title={lang === 'fr' ? 'Modifier' : 'Edit'}
                          >
                            <Edit3 size={18} />
                          </button>
                          {canAccess && (
                            <button
                              onClick={() => handleDownloadCV(cv)}
                              disabled={downloadingCvId === cv.id}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
                              title={lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}
                            >
                              {downloadingCvId === cv.id
                                ? <Loader2 size={18} className="animate-spin" />
                                : <Download size={18} />}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteCV(cv.id)}
                            disabled={deletingCv === cv.id}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                            title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                          >
                            {deletingCv === cv.id ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right column - Profile & Subscription */}
          <div className="space-y-6">
            {/* Profile section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {(profile?.full_name ?? user?.email ?? 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                        placeholder={profile?.full_name ?? ''}
                        autoFocus
                      />
                      <button onClick={handleUpdateName} className="p-1.5 text-green-600 hover:bg-green-50 rounded">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingName(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {profile?.full_name ?? user?.email?.split('@')[0]}
                      </p>
                      <button
                        onClick={() => { setNewName(profile?.full_name ?? ''); setEditingName(true); }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Password change */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                {passwordSuccess && (
                  <div className="mb-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400">
                    <Check size={14} className="inline mr-2" />
                    {lang === 'fr' ? 'Mot de passe modifié avec succès' : 'Password changed successfully'}
                  </div>
                )}
                {changingPassword ? (
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm(f => ({ ...f, new: e.target.value }))}
                      placeholder={lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder={lang === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                    />
                    {passwordError && (
                      <p className="text-xs text-red-500">{passwordError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
                      >
                        {lang === 'fr' ? 'Enregistrer' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setChangingPassword(false); setPasswordError(null); }}
                        className="px-3 py-2 text-gray-500 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        {lang === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Lock size={16} className="text-gray-400" />
                    {lang === 'fr' ? 'Changer le mot de passe' : 'Change password'}
                    <ChevronRight size={14} className="ml-auto text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Subscription Switcher */}
            <SubscriptionSwitcher />

            {/* Logout */}
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl transition-colors text-sm font-medium"
            >
              {lang === 'fr' ? 'Se déconnecter' : 'Sign out'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {payModal.open && (
        <PaymentModal
          tier={payModal.tier}
          onClose={() => setPayModal(p => ({ ...p, open: false }))}
          onSuccess={sub => {
            setPayModal(p => ({ ...p, open: false }));
            setNotification(sub);
          }}
        />
      )}

      {notification && (
        <PaymentNotification subscription={notification} onDismiss={() => setNotification(null)} />
      )}
    </div>
  );
}
