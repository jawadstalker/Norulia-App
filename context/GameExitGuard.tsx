import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';

import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  AlertTriangle,
} from 'lucide-react-native';

import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

/**
 * ============================================================================
 * GAME EXIT GUARD
 * ============================================================================
 *
 * هر صفحه‌ی بازی وضعیت «در حال بازی بودن» و امتیاز فعلی خودش را با
 * setGuard(active, score) در این context ثبت می‌کند.
 *
 * هر جایی که کاربر ممکن است از بازی خارج شود (دکمه‌ی برگشت داخل صفحه،
 * دکمه‌ی برگشت گوشی، یا زدن روی نوبار پایین) به‌جای خروج مستقیم،
 * confirmExit(exitAction) صدا زده می‌شود. اگر بازی «فعال» باشد، یک
 * مودال تأیید (با امتیاز فعلی) نشان داده می‌شود؛ در غیر این صورت
 * exitAction بلافاصله اجرا می‌شود.
 * ============================================================================
 */

type GuardMetricLabel = { fa: string; en: string };

type GameExitGuardContextType = {
  setGuard: (
    active: boolean,
    value?: number,
    label?: GuardMetricLabel
  ) => void;
  confirmExit: (onExit: () => void) => void;
};

const DEFAULT_LABEL: GuardMetricLabel = {
  fa: 'امتیاز فعلی',
  en: 'Current score',
};

const GameExitGuardContext =
  createContext<GameExitGuardContextType | undefined>(undefined);

export function GameExitGuardProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { colors, isDark } = useTheme();
  const { language, isRTL } = useLanguage();

  const guardRef = useRef({
    active: false,
    value: 0,
    label: DEFAULT_LABEL,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalValue, setModalValue] = useState(0);
  const [modalLabel, setModalLabel] =
    useState<GuardMetricLabel>(DEFAULT_LABEL);

  const pendingExitRef = useRef<(() => void) | null>(null);

  const setGuard = useCallback(
    (
      active: boolean,
      value: number = 0,
      label: GuardMetricLabel = DEFAULT_LABEL
    ) => {
      guardRef.current = { active, value, label };
    },
    []
  );

  const confirmExit = useCallback((onExit: () => void) => {
    if (!guardRef.current.active) {
      onExit();
      return;
    }

    setModalValue(guardRef.current.value);
    setModalLabel(guardRef.current.label);
    pendingExitRef.current = onExit;
    setModalVisible(true);
  }, []);

  const handleCancel = useCallback(() => {
    setModalVisible(false);
    pendingExitRef.current = null;
  }, []);

  const handleConfirm = useCallback(() => {
    const exit = pendingExitRef.current;

    setModalVisible(false);
    pendingExitRef.current = null;
    guardRef.current = {
      active: false,
      value: 0,
      label: DEFAULT_LABEL,
    };

    exit?.();
  }, []);

  const text =
    language === 'fa'
      ? {
          title: 'ترک بازی؟',
          message: 'اگر الان خارج شوی، این نوبت بازی ذخیره نمی‌شود.',
          cancel: 'ادامه‌ی بازی',
          exit: 'خروج',
        }
      : {
          title: 'Leave the game?',
          message: 'If you exit now, this session will not be saved.',
          cancel: 'Keep playing',
          exit: 'Exit',
        };

  const value = useMemo<GameExitGuardContextType>(
    () => ({ setGuard, confirmExit }),
    [setGuard, confirmExit]
  );

  return (
    <GameExitGuardContext.Provider value={value}>
      {children}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.backdrop}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: `${colors.error}18` },
              ]}
            >
              <AlertTriangle size={30} color={colors.error} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {text.title}
            </Text>

            <Text
              style={[
                styles.message,
                { color: colors.textSecondary },
              ]}
            >
              {text.message}
            </Text>

            <View
              style={[
                styles.scoreBox,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreLabel,
                  { color: colors.textSecondary },
                ]}
              >
                {language === 'fa' ? modalLabel.fa : modalLabel.en}
              </Text>
              <Text style={[styles.scoreValue, { color: colors.primary }]}>
                {modalValue}
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleCancel}
                style={[
                  styles.secondaryButton,
                  { borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.secondaryText, { color: colors.text }]}
                >
                  {text.cancel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleConfirm}
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.error },
                ]}
              >
                <Text style={styles.primaryText}>{text.exit}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GameExitGuardContext.Provider>
  );
}

export function useGameExitGuard(): GameExitGuardContextType {
  const context = useContext(GameExitGuardContext);

  if (!context) {
    throw new Error(
      'useGameExitGuard must be used within a GameExitGuardProvider'
    );
  }

  return context;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  scoreBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
