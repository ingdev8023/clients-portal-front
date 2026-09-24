import { useContext } from 'react';
import { PreferencesContext } from '../contexts/preferences-context';

export function usePreferences() {
  return useContext(PreferencesContext);
}
