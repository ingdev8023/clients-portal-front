import { createContext } from 'react';
import { translate } from '../i18n/translations';

export const PreferencesContext = createContext({
  language: 'en',
  theme: 'dark',
  setLanguage: () => {},
  toggleLanguage: () => {},
  toggleTheme: () => {},
  t: (key, variables) => translate('en', key, variables),
});
