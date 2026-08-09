import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const USER_KEY = '@neurolia_user';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  // فقط برای بررسی session ذخیره‌شده
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load saved session.
   */
  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem(USER_KEY);

      console.log(
        '[AUTH] Saved user:',
        savedUser ? 'YES' : 'NO'
      );

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('[AUTH] Error loading user:', error);

      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  /**
   * Login
   *
   * This is currently a mock login.
   * User becomes authenticated ONLY after this
   * function is successfully called.
   */
  const login = async (
    email: string,
    password: string
  ) => {
    setIsLoading(true);

    try {
      console.log('[AUTH] Login started');

      // Mock API delay
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const mockUser: User = {
        id: '1',
        name: 'کاربر نورولیا',
        email,
        level: 5,
        xp: 1250,
        streak: 12,
      };

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(mockUser)
      );

      setUser(mockUser);

      console.log('[AUTH] Login successful');
    } catch (error) {
      console.error('[AUTH] Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register
   */
  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);

    try {
      console.log('[AUTH] Registration started');

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      const mockUser: User = {
        id: '1',
        name,
        email,
        level: 1,
        xp: 0,
        streak: 0,
      };

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(mockUser)
      );

      setUser(mockUser);

      console.log('[AUTH] Registration successful');
    } catch (error) {
      console.error(
        '[AUTH] Registration failed:',
        error
      );

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      console.log('[AUTH] Logout');

      await AsyncStorage.removeItem(USER_KEY);

      setUser(null);
    } catch (error) {
      console.error('[AUTH] Logout failed:', error);

      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,

    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}
