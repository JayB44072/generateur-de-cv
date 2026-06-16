import { useState } from 'react';
import { FileText, Moon, Sun, Globe, Crown, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLang } from '../contexts/LanguageContext';
import SubscriptionSwitcher from './SubscriptionSwitcher';

type Page = 'home' | 'templates' | 'editor' | 'pricing' | 'account';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onAuthOpen: () => void;
}

const tierBadge = { free: null, premium: 'bg-blue-500', ai: 'bg-gradient-to-r from-amber-500 to-orange-500' };
const tierLabel = { free: 'Free', premium: 'Premium', ai: 'Élite IA' };

export default function Navbar({ currentPage, onNavigate, onAuthOpen }: NavbarProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks: { key: Exclude<Page, 'home'>; label: string }[] = [
    { key: 'templates', label: t.nav.templates },
    { key: 'pricing', label: t.nav.pricing },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg tracking-tight">
              white<span className="text-blue-600">duke</span>
              <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded px-1 ml-0.5">SaaS</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => onNavigate(link.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.key
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Globe size={13} className="text-gray-500 dark:text-gray-400 ml-1" />
              {(['fr', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                    lang === l
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth section */}
            {user && profile ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(profile.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                    </span>
                  </div>
                  {profile.subscription_tier !== 'free' && (
                    <span className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-semibold ${tierBadge[profile.subscription_tier]}`}>
                      <Crown size={10} />
                      {tierLabel[profile.subscription_tier]}
                    </span>
                  )}
                  <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {profile.full_name ?? user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <SubscriptionSwitcher />
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); onNavigate('account'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <User size={14} /> {t.nav.myAccount}
                    </button>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut size={14} /> {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onAuthOpen}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={onAuthOpen}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  {t.nav.signup}
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-3 space-y-1">
            {navLinks.map(link => (
              <button
                key={link.key}
                onClick={() => { onNavigate(link.key); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === link.key
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="flex items-center gap-2 px-4 pt-2">
              <Globe size={14} className="text-gray-500 dark:text-gray-400" />
              {(['fr', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded text-xs font-semibold ${lang === l ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {!user && (
              <div className="flex gap-2 px-4 pt-1">
                <button onClick={() => { onAuthOpen(); setMenuOpen(false); }}
                  className="flex-1 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  {t.nav.signup}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
