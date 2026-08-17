import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

const USER_KEY = '@neurolia_user';

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const savedUser =
          await AsyncStorage.getItem(USER_KEY);

        if (!mounted) {
          return;
        }

        if (savedUser) {
          try {
            const parsedUser =
              JSON.parse(savedUser);

            setUser(parsedUser);
          } catch (parseError) {
            console.error(
              '[AUTH] Invalid saved user:',
              parseError
            );

            await AsyncStorage.removeItem(
              USER_KEY
            );

            if (mounted) {
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          '[AUTH] Failed to load user:',
          error
        );

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      _password: string
    ) => {
      setIsLoading(true);

      try {
        /*
         * Mock API delay.
         *
         * Kept for the current mock authentication
         * flow, but isolated from rendering.
         */
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 1500);
        });

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
      } catch (error) {
        console.error(
          '[AUTH] Login failed:',
          error
        );

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      _password: string
    ) => {
      setIsLoading(true);

      try {
        /*
         * Mock API delay.
         */
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 1500);
        });

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
      } catch (error) {
        console.error(
          '[AUTH] Registration failed:',
          error
        );

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(
        USER_KEY
      );

      setUser(null);
    } catch (error) {
      console.error(
        '[AUTH] Logout failed:',
        error
      );

      throw error;
    }
  }, []);

  const isAuthenticated =
    user !== null;

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}