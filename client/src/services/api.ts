import axios from 'axios';
import type {
  User,
  Character,
  ClanInfo,
  GameStartResponse,
  GameActionResponse,
  Mission,
} from '../types';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('nin-token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (username: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { username, password }),
  login: (username: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { username, password }),
  me: () => api.get<{ user: User }>('/auth/me'),
};

export const characterApi = {
  create: (name: string, village: string, element: string, clan: string, appearance?: string) =>
    api.post<{ character: Character }>('/characters', { name, village, element, clan, appearance }),
  list: () => api.get<{ characters: Character[] }>('/characters'),
  get: (id: string) => api.get<{ character: Character }>(`/characters/${id}`),
  reimagineAvatar: (id: string, context?: string) =>
    api.post<{ character: Character }>(`/characters/${id}/reimagine-avatar`, { context }),
  spendAttrPoint: (id: string, attribute: keyof Pick<Character, 'ninjutsu' | 'taijutsu' | 'genjutsu' | 'velocidade' | 'resistencia' | 'inteligencia'>) =>
    api.post<{ character: Character }>(`/characters/${id}/spend-attr`, { attribute }),
  delete: (id: string) => api.delete(`/characters/${id}`),
  options: () => api.get<{ villages: string[]; elements: string[]; clans: ClanInfo[] }>('/characters/options/creation'),
};

export const gameApi = {
  start: (characterId: string) =>
    api.post<GameStartResponse>('/game/start', { characterId }),
  action: (sessionId: string, action: string, inCombat?: boolean) =>
    api.post<GameActionResponse>('/game/action', { sessionId, action, inCombat }),
};

export const missionApi = {
  list: (characterId: string) =>
    api.get<{ missions: Mission[] }>(`/missions/${characterId}`),
};
