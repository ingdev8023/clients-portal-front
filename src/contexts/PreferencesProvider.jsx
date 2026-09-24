import { useCallback, useEffect, useMemo, useState } from 'react';
import { translate } from '../i18n/translations';
import { PreferencesContext } from './preferences-context';

const readPreference = (key, fallback, allowed) => {
  const stored = window.localStorage.getItem(key);
  return allowed.includes(stored) ? stored : fallback;
};

export default function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() => readPreference('portal-language', 'en', ['en', 'es']));
  const [theme, setTheme] = useState(() => readPreference('portal-theme', 'dark', ['dark', 'light']));

  // Mirror persisted preferences to the root element so copy and theme tokens
  // update together without each page owning duplicate preference state.
  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('portal-language', language);
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('portal-theme', theme);
  }, [theme]);

  const t = useCallback((key, variables) => translate(language, key, variables), [language]);
  const toggleLanguage = useCallback(() => setLanguage((current) => current === 'en' ? 'es' : 'en'), []);
  const toggleTheme = useCallback(() => setTheme((current) => current === 'dark' ? 'light' : 'dark'), []);
  const value = useMemo(() => ({ language, theme, setLanguage, toggleLanguage, toggleTheme, t }), [language, theme, t, toggleLanguage, toggleTheme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}
