// src/stores/useAuthStore.ts
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  role: "ADMIN" | "LANDLORD" | "TENANT";
  firstName?: string;
  middleName?: string;
  lastName?: string;
  avatarUrl?: string ;
  birthdate?: string;
  gender?: string;
  bio?: string;
  phoneNumber?: string;
  messengerUrl?: string;
  facebookUrl?: string;
  isDisabled: boolean;
  isVerified?: boolean;
  lastLogin?: string;
  lastPasswordChange?: string;
  hasSeenOnboarding: boolean;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;      
  validated: boolean;    
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setValidated: (validated: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, 
  validated: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setLoading: (loading) => set({ loading }),
  setValidated: (validated) => set({ validated }),
}));
