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

/* ============================================================
   TYPES
============================================================ */

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    username: string,
    phone: string
  ) => Promise<void>;

  register: (
    name: string,
    username: string,
    phone: string
  ) => Promise<void>;

  logout: () => Promise<void>;
}

/* ============================================================
   SERVER TYPES
============================================================ */

interface LoginResponse {
  success?: boolean;
  message?: string;

  user?: {
    id?: string | number;
    username?: string;
  };
}

/* ============================================================
   CONTEXT
============================================================ */

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

/* ============================================================
   STORAGE
============================================================ */

const USER_KEY = '@neurolia_user';

/* ============================================================
   API
============================================================ */

const API_URL =
  'https://iliyacore.ir/neurolia/login_api.php';

/* ============================================================
   AUTH PROVIDER
============================================================ */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /* ==========================================================
     LOAD SAVED USER
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const savedUser =
          await AsyncStorage.getItem(USER_KEY);

        if (!mounted) {
          return;
        }

        if (!savedUser) {
          setUser(null);
          return;
        }

        try {
          const parsedUser =
            JSON.parse(savedUser);

          /*
           * مطمئن می‌شویم اطلاعات اصلی کاربر وجود دارد.
           */

          if (
            !parsedUser ||
            !parsedUser.id ||
            !parsedUser.name
          ) {
            throw new Error(
              'Saved user data is invalid.'
            );
          }

          setUser(parsedUser as User);
        } catch (error) {
          console.error(
            '[AUTH] Invalid saved user:',
            error
          );

          await AsyncStorage.removeItem(
            USER_KEY
          );

          if (mounted) {
            setUser(null);
          }
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

  /* ==========================================================
     LOGIN
  ========================================================== */

  const login = useCallback(
    async (
      username: string,
      phone: string
    ) => {
      const cleanUsername =
        username.trim();

      const cleanPhone =
        phone.trim();

      /* --------------------------------------------------------
         VALIDATION
      -------------------------------------------------------- */

      if (!cleanUsername) {
        throw new Error(
          'لطفاً نام کاربری را وارد کنید.'
        );
      }

      if (!cleanPhone) {
        throw new Error(
          'لطفاً شماره تلفن را وارد کنید.'
        );
      }

      setIsLoading(true);

      try {
        console.log(
          '[AUTH] Sending login request...'
        );

        /* ------------------------------------------------------
           REQUEST
        ------------------------------------------------------ */

        const response =
          await fetch(API_URL, {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Accept:
                'application/json',
            },

            body: JSON.stringify({
              username:
                cleanUsername,

              phone:
                cleanPhone,
            }),
          });

        /* ------------------------------------------------------
           READ RESPONSE
        ------------------------------------------------------ */

        const rawText =
          await response.text();

        console.log(
          '[AUTH] HTTP status:',
          response.status
        );

        console.log(
          '[AUTH] Raw response:',
          rawText
        );

        let data: LoginResponse;

        try {
          data =
            JSON.parse(rawText);
        } catch (jsonError) {
          console.error(
            '[AUTH] Invalid JSON from server:',
            jsonError
          );

          throw new Error(
            'پاسخ سرور معتبر نیست. لطفاً اتصال سرور را بررسی کنید.'
          );
        }

        console.log(
          '[AUTH] Login response:',
          data
        );

        /* ------------------------------------------------------
           CHECK SERVER RESPONSE
        ------------------------------------------------------ */

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              'نام کاربری یا شماره تلفن اشتباه است.'
          );
        }

        /* ------------------------------------------------------
           CHECK USER
        ------------------------------------------------------ */

        if (
          !data.user ||
          data.user.id === undefined ||
          data.user.id === null ||
          !data.user.username
        ) {
          console.error(
            '[AUTH] Invalid user object:',
            data.user
          );

          throw new Error(
            'اطلاعات کاربر از سرور ناقص است.'
          );
        }

        /* ------------------------------------------------------
           CREATE APP USER
        ------------------------------------------------------ */

        const appUser: User = {
          id: String(
            data.user.id
          ),

          name:
            data.user.username,

          /*
           * چون type فعلی User احتمالاً
           * فیلد email دارد، username را
           * موقتاً در آن قرار می‌دهیم.
           */

          email:
            data.user.username,

          level: 1,

          xp: 0,

          streak: 0,
        };

        /* ------------------------------------------------------
           SAVE USER
        ------------------------------------------------------ */

        await AsyncStorage.setItem(
          USER_KEY,
          JSON.stringify(appUser)
        );

        console.log(
          '[AUTH] User saved:',
          appUser
        );

        /* ------------------------------------------------------
           UPDATE STATE
        ------------------------------------------------------ */

        setUser(appUser);
      } catch (error) {
        console.error(
          '[AUTH] Login failed:',
          error
        );

        /*
         * اگر Error استاندارد باشد،
         * همان پیام را به AuthScreen می‌دهیم.
         */

        if (error instanceof Error) {
          throw error;
        }

        throw new Error(
          'ورود انجام نشد. لطفاً دوباره تلاش کنید.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /* ==========================================================
     REGISTER
  ========================================================== */

  const register = useCallback(
    async (
      _name: string,
      _username: string,
      _phone: string
    ) => {
      /*
       * فعلاً API ثبت‌نام در PHP وجود ندارد.
       *
       * بنابراین از اینجا کاربر جدید
       * ساخته نمی‌شود.
       */

      throw new Error(
        'ثبت‌نام فعلاً از طریق سرور فعال نشده است.'
      );
    },
    []
  );

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const logout = useCallback(
    async () => {
      try {
        /*
         * حذف کاربر ذخیره‌شده
         */

        await AsyncStorage.removeItem(
          USER_KEY
        );

        /*
         * پاک کردن state
         */

        setUser(null);

        console.log(
          '[AUTH] User logged out.'
        );
      } catch (error) {
        console.error(
          '[AUTH] Logout failed:',
          error
        );

        throw new Error(
          'خروج از حساب انجام نشد.'
        );
      }
    },
    []
  );

  /* ==========================================================
     AUTH STATE
  ========================================================== */

  const isAuthenticated =
    user !== null;

  /* ==========================================================
     CONTEXT VALUE
  ========================================================== */

  const value =
    useMemo<AuthContextType>(
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

  /* ==========================================================
     PROVIDER
  ========================================================== */

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ============================================================
   USE AUTH
============================================================ */

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