import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import FeedbackModal from './components/FeedbackModal';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import AccountPage from './pages/AccountPage';
import TemplateGallery from './components/TemplateGallery';
import CVEditor from './components/Editor/CVEditor';

type Page = 'home' | 'templates' | 'editor' | 'pricing' | 'account';

const FEEDBACK_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function AppContent() {
  const { loading, profile } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [authOpen, setAuthOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(1);
  const [editCvId, setEditCvId] = useState<string | null>(null);
  const [forceNew, setForceNew] = useState(false);

  // Popup "noter le site" toutes les 10 min pour les forfaits gratuits uniquement
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const isFree = !profile || profile.subscription_tier === 'free';
    if (!isFree) return;
    // Première apparition après 10 min, puis toutes les 10 min
    timerRef.current = setInterval(() => setFeedbackOpen(true), FEEDBACK_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [profile?.subscription_tier]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">WD</span>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* Navbar is hidden in editor to maximize space on mobile */}
      {page !== 'editor' && (
        <Navbar
          currentPage={page}
          onNavigate={setPage}
          onAuthOpen={() => setAuthOpen(true)}
        />
      )}

      {page === 'editor' && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar
            currentPage={page}
            onNavigate={setPage}
            onAuthOpen={() => setAuthOpen(true)}
          />
        </div>
      )}

      <main className={page === 'editor' ? 'pt-16 h-screen overflow-hidden' : ''}>
        {page === 'home' && (
          <HomePage
            onNavigate={(p) => setPage(p)}
            onAuthOpen={() => setAuthOpen(true)}
          />
        )}

        {page === 'templates' && (
          <TemplateGallery
            selectedId={selectedTemplateId}
            onSelect={(id) => {
              setSelectedTemplateId(id);
              setForceNew(true);
              setEditCvId(null);
            }}
            onStartEditing={() => setPage('editor')}
            onAuthOpen={() => setAuthOpen(true)}
          />
        )}

        {page === 'editor' && (
          <div className="h-full">
            <CVEditor
              key={editCvId ?? (forceNew ? 'new' : 'default')}
              initialTemplateId={selectedTemplateId}
              editCvId={editCvId}
              forceNew={forceNew}
              onOpenTemplates={() => setPage('templates')}
              onAuthOpen={() => setAuthOpen(true)}
              onCvLoaded={() => { setForceNew(false); setEditCvId(null); }}
            />
          </div>
        )}

        {page === 'pricing' && (
          <PricingPage
            onNavigate={(p) => setPage(p)}
            onAuthOpen={() => setAuthOpen(true)}
          />
        )}

        {page === 'account' && (
          <AccountPage
            onNavigate={(p, cvId) => {
              if (cvId) {
                setEditCvId(cvId);
                setForceNew(false);
              } else {
                setForceNew(true);
                setEditCvId(null);
              }
              setPage(p);
            }}
          />
        )}
      </main>

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} />
      )}

      {feedbackOpen && (
        <FeedbackModal onClose={() => setFeedbackOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
