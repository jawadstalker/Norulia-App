/*
 * ================================================================
 * admin-results.tsx
 * ================================================================
 *
 * صفحه‌ی مدیریتی: لیست همه‌ی کاربرهایی که روی همین دستگاه با آن‌ها
 * وارد اپ شده‌اید و برایشان فایل نتیجه ساخته شده، به همراه نتایج
 * هر بازی برای هرکدام (نام بازی، هدف بازی، امتیاز، شاخص‌ها). از
 * دکمه‌ی «اشتراک‌گذاری» می‌توانید فایل JSON خام هر کاربر را برای
 * خودتان (ایمیل/تلگرام/...) بفرستید.
 *
 * مسیر این صفحه: /games/admin-results
 */

import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { ArrowLeft, Share2, Trash2, Users } from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

import {
  UserGameFile,
  deleteUserGameFile,
  getUserGameFile,
  listUserGameFiles,
  shareUserGameFile,
} from './userGameFiles';

export default function AdminResultsScreen() {
  const router = useRouter();

  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [usernames, setUsernames] = useState<string[]>([]);
  const [filesByUser, setFilesByUser] = useState<
    Record<string, UserGameFile>
  >({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const text =
    language === 'fa'
      ? {
          title: 'نتایج کاربران',
          subtitle:
            'فایل نتایج هر کاربری که با آن وارد اپ شده‌اید',
          empty: 'هنوز هیچ کاربری بازی‌ای انجام نداده است.',
          back: 'بازگشت',
          share: 'اشتراک‌گذاری فایل',
          delete: 'حذف فایل',
          sessions: 'نوبت بازی',
          goal: 'هدف',
          score: 'امتیاز',
        }
      : {
          title: 'User Results',
          subtitle:
            'The result file for each user you have logged in as',
          empty: 'No user has played a game yet.',
          back: 'Back',
          share: 'Share file',
          delete: 'Delete file',
          sessions: 'sessions',
          goal: 'Goal',
          score: 'Score',
        };

  const loadAll = useCallback(async () => {
    try {
      const users = await listUserGameFiles();

      setUsernames(users);

      const entries = await Promise.all(
        users.map(async (username) => {
          const file = await getUserGameFile(username);

          return [username, file] as const;
        })
      );

      setFilesByUser(Object.fromEntries(entries));
    } catch (error) {
      console.warn(
        '[AdminResults] Failed to load user files:',
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAll();
  }, [loadAll]);

  const handleShare = useCallback(
    async (username: string) => {
      try {
        await shareUserGameFile(username);
      } catch (error) {
        console.warn('[AdminResults] Share failed:', error);
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (username: string) => {
      await deleteUserGameFile(username);
      await loadAll();
    },
    [loadAll]
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: colors.surface },
          ]}
        >
          <ArrowLeft
            size={20}
            color={colors.text}
            style={
              isRTL ? { transform: [{ scaleX: -1 }] } : undefined
            }
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {text.title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary },
            ]}
          >
            {text.subtitle}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : usernames.length === 0 ? (
        <View style={styles.centered}>
          <Users size={40} color={colors.textSecondary} />
          <Text
            style={[
              styles.emptyText,
              { color: colors.textSecondary },
            ]}
          >
            {text.empty}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {usernames.map((username) => {
            const file = filesByUser[username];
            const isOpen = expanded === username;

            return (
              <View
                key={username}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setExpanded(isOpen ? null : username)
                  }
                  style={styles.cardHeader}
                >
                  <Text
                    style={[
                      styles.username,
                      { color: colors.text },
                    ]}
                  >
                    {username}
                  </Text>
                  <Text
                    style={[
                      styles.count,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {file?.results.length || 0} {text.sessions}
                  </Text>
                </TouchableOpacity>

                {isOpen &&
                  file?.results
                    .slice()
                    .reverse()
                    .map((record, index) => (
                      <View
                        key={`${record.gameId}_${record.timestamp}_${index}`}
                        style={[
                          styles.recordRow,
                          { borderColor: colors.border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.recordGame,
                            { color: colors.text },
                          ]}
                        >
                          {record.gameName}
                        </Text>
                        <Text
                          style={[
                            styles.recordLine,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {text.goal}: {record.goal}
                        </Text>
                        <Text
                          style={[
                            styles.recordLine,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {text.score}: {record.score}
                        </Text>
                        <Text
                          style={[
                            styles.recordDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {new Date(
                            record.timestamp
                          ).toLocaleString(
                            language === 'fa' ? 'fa-IR' : 'en-US'
                          )}
                        </Text>
                      </View>
                    ))}

                <View style={styles.actions}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleShare(username)}
                    style={[
                      styles.actionButton,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Share2 size={16} color="#fff" />
                    <Text style={styles.actionText}>
                      {text.share}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleDelete(username)}
                    style={[
                      styles.actionButton,
                      styles.deleteButton,
                    ]}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text
                      style={[
                        styles.actionText,
                        { color: '#ef4444' },
                      ]}
                    >
                      {text.delete}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyText: { fontSize: 14, textAlign: 'center' },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: { fontSize: 16, fontWeight: '700' },
  count: { fontSize: 12 },
  recordRow: {
    borderTopWidth: 1,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  recordGame: { fontSize: 14, fontWeight: '600' },
  recordLine: { fontSize: 12, marginTop: 2 },
  recordDate: { fontSize: 11, marginTop: 4, opacity: 0.8 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  deleteButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
