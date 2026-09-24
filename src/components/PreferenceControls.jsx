import { Languages, Moon, Sun } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';

export default function PreferenceControls() {
  const { language, theme, toggleLanguage, toggleTheme, t } = usePreferences();
  const languageLabel = language === 'en' ? t('preferences.spanish') : t('preferences.english');
  const themeLabel = theme === 'dark' ? t('preferences.light') : t('preferences.dark');

  return (
    <div className="preference-controls">
      <button className="preference-button" type="button" onClick={toggleLanguage} aria-label={languageLabel} title={languageLabel}>
        <Languages size={18} /><span>{language.toUpperCase()}</span>
      </button>
      <button className="preference-button" type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
