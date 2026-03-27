import { API_BASE_URL } from '../config/env';
import { apiRequest } from '../helpers/api';
import { AuthSession, AuthUser, LoginPayload, SignupPayload } from '../types/auth';

type LoginResponse = {
  access_token: string;
  refresh_token: string;
};

type ProfileResponse = {
  id: number;
  name: string;
  email: string;
};

const headers = {
  'Content-Type': 'application/json',
};

const fetchProfile = async (accessToken: string): Promise<AuthUser> => {
  const profile = (await apiRequest(`${API_BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })) as ProfileResponse;

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
  };
};

export const authApi = {
  login: async ({ email, password }: LoginPayload): Promise<AuthSession> => {
    const loginResult = (await apiRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    })) as LoginResponse;

    const user = await fetchProfile(loginResult.access_token);

    return {
      accessToken: loginResult.access_token,
      refreshToken: loginResult.refresh_token,
      user,
    };
  },

  signup: async ({
    name,
    email,
    password,
  }: SignupPayload): Promise<AuthSession> => {
    await apiRequest(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name,
        email,
        password,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
      }),
    });

    return authApi.login({ email, password });
  },
};
