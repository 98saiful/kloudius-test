import { createMMKV } from 'react-native-mmkv';

import { AuthSession } from '../types/auth';

const storage = createMMKV({
  id: 'auth-app-storage',
});

const SESSION_KEY = 'auth_session';

export const authStorage = {
  saveSession: (session: AuthSession) => {
    storage.set(SESSION_KEY, JSON.stringify(session));
  },
  getSession: (): AuthSession | null => {
    const raw = storage.getString(SESSION_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      storage.remove(SESSION_KEY);
      return null;
    }
  },
  clearSession: () => {
    storage.remove(SESSION_KEY);
  },
};
