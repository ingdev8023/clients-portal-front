import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './auth-context';
import {
  getAuthenticatedUser,
  getProfile,
  signInWithPassword,
  signOutLocally,
  subscribeToAuthChanges,
} from '../models/authModel';
import { toUserMessage } from '../lib/errors';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let active = true;

    getAuthenticatedUser()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        if (!currentUser) setLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setAuthError(toUserMessage(error, 'Unable to verify your session.'));
        setLoading(false);
      });

    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return null;
    }

    setLoading(true);
    setAuthError('');
    try {
      const nextProfile = await getProfile(user.id);
      setProfile(nextProfile);
      return nextProfile;
    } catch (error) {
      setProfile(null);
      setAuthError(toUserMessage(error, 'Your account profile could not be loaded.'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;

    getProfile(user.id)
      .then((nextProfile) => {
        if (!active) return;
        setProfile(nextProfile);
        setAuthError('');
      })
      .catch((error) => {
        if (!active) return;
        setProfile(null);
        setAuthError(toUserMessage(error, 'Your account profile could not be loaded.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const nextUser = await signInWithPassword(email, password);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutLocally();
    } finally {
      setUser(null);
      setProfile(null);
      setAuthError('');
    }
  }, []);

  const value = useMemo(
    () => ({ user, profile, loading, authError, signIn, signOut, refreshProfile }),
    [user, profile, loading, authError, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
