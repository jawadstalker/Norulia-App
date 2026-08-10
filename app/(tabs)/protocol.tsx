import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import {
  Brain,
  Target,
  Zap,
  Shield,
  ChevronRight,
  ChevronDown,
  Check,
  PartyPopper,
} from 'lucide-react-native';
import { Spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');

const DAILY_TASKS: Record<string, { fa: string[]; en: string[] }> = {
  cognitive: {
    fa: [
      '۱۰ دقیقه تمرین حافظه کاری',
      'حل یک پازل منطقی',
      '۵ دقیقه تمرین تمرکز و تنفس',
      'مرور یادداشت‌های روز قبل',
    ],
    en: [
      '10 min working memory drill',
      'Solve one logic puzzle',
      '5 min focused breathing',
      'Review yesterday’s notes',
    ],
  },
  focus: {
    fa: [
      '۲۵ دقیقه کار بدون حواس‌پرتی (پومودورو)',
      'خاموش کردن اعلان‌های گوشی برای ۱ ساعت',
      'یک جلسه تمرین Stroop در بخش بازی‌ها',
      'نوشتن ۳ اولویت اصلی امروز',
    ],
    en: [
      '25 min distraction-free work (Pomodoro)',
      'Mute phone notifications for 1 hour',
      'One Stroop game session',
      'Write down 3 priorities for today',
    ],
  },
  memory: {
    fa: [
      'یادآوری ۵ آیتم از لیست دیروز',
      'تمرین حافظه دنباله‌ای',
      'خواندن یک متن کوتاه و بازگویی آن',
      'هدف ۷ ساعت خواب امشب',
    ],
    en: [
      'Recall 5 items from yesterday’s list',
      'Memory sequence exercise',
      'Read a short passage and retell it',
      'Aim for 7 hours of sleep tonight',
    ],
  },
  stress: {
    fa: [
      '۵ دقیقه تنفس عمیق',
      '۱۰ دقیقه پیاده‌روی',
      'نوشتن یک حس مثبت امروز',
      'یک وقفه‌ی کوتاه بدون صفحه‌نمایش',
    ],
    en: [
      '5 min deep breathing',
      '10 min walk',
      'Write down one positive moment today',
      'One short screen-free break',
    ],
  },
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const STORAGE_KEY = (date: string) => `@neurolia_protocol_tasks_${date}`;

type TaskState = Record<string, Record<number, boolean>>;

export default function ProtocolScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [taskState, setTaskState] = useState<TaskState>({});
  const [loaded, setLoaded] = useState(false);
  const rowDir = isRTL ? 'row-reverse' : 'row';

  const protocols = [
    {
      id: 'cognitive',
      title: t.cognitiveEnhancement || 'Cognitive Enhancement',
      desc: t.cognitiveTraining || 'Personalized brain training protocols',
      icon: Brain,
      color: colors.primary,
      progress: 70,
    },
    {
      id: 'focus',
      title: t.focusTraining || 'Focus Training',
      desc: t.improveAttention || 'Improve concentration and attention',
      icon: Target,
      color: colors.success,
      progress: 45,
    },
    {
      id: 'memory',
      title: t.memoryBoost || 'Memory Boost',
      desc: t.enhanceMemory || 'Enhance memory retention',
      icon: Zap,
      color: colors.warning,
      progress: 80,
    },
    {
      id: 'stress',
      title: t.stressManagement || 'Stress Management',
      desc: t.buildResilience || 'Build resilience and coping skills',
      icon: Shield,
      color: colors.error,
      progress: 55,
    },
  ];

  const avgProgress = Math.round(
    protocols.reduce((sum, protocol) => sum + protocol.progress, 0) / protocols.length
  );

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY(todayKey()));
        if (raw) {
          setTaskState(JSON.parse(raw));
        }
      } catch (error) {
        console.error('Error loading protocol tasks:', error);
      } finally {
        setLoaded(true);
      }
    };
    loadTasks();
  }, []);

  const persist = async (next: TaskState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY(todayKey()), JSON.stringify(next));
    } catch (error) {
      console.error('Error saving protocol tasks:', error);
    }
  };

  const toggleTask = (protocolId: string, taskIndex: number, totalTasks: number) => {
    const current = taskState[protocolId] || {};
    const wasDone = !!current[taskIndex];
    const nextForProtocol = { ...current, [taskIndex]: !wasDone };
    const next: TaskState = { ...taskState, [protocolId]: nextForProtocol };
    setTaskState(next);
    persist(next);
    const doneCount = Object.values(nextForProtocol).filter(Boolean).length;
    if (!wasDone && doneCount === totalTasks) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const toggleExpand = (protocolId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setExpandedId((current) => (current === protocolId ? null : protocolId));
  };

  const getDoneCount = (protocolId: string) =>
    Object.values(taskState[protocolId] || {}).filter(Boolean).length;

  return (
    <LinearGradient
      colors={isDark ? ['#0a0a0f', '#14141e'] : ['#eef2ff', '#ffffff']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.heroCard,
              { borderColor: 'rgba(255,255,255,0.18)' },
            ]}
          >
            <View style={[styles.heroBlobA, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.heroBlobB, { backgroundColor: '#FFFFFF' }]} />
            <MotiView
              from={{ opacity: 0, scale: 0.85, translateY: 12 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 140 }}
              style={styles.avatarWrapper}
            >
              <LinearGradient
                colors={['#FFFFFF', 'rgba(255,255,255,0.4)']}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Image
                    source={require('../../assets/avatars/model3.png')}
                    style={styles.avatar}
                  />
                </View>
              </LinearGradient>
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 450, delay: 120 }}
              style={styles.heroTextContainer}
            >
              <Text style={[styles.title, isRTL && styles.textRTL]}>
                {t.smartProtocol || 'Smart Personal Protocol'}
              </Text>
              <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
                {t.aiPoweredProtocols || 'AI powered personalized cognitive programs'}
              </Text>
              <View
                style={[
                  styles.progressBadge,
                  { backgroundColor: 'rgba(255,255,255,0.18)' },
                ]}
              >
                <Text style={styles.progressBadgeText}>{avgProgress}%</Text>
                <Text style={styles.progressBadgeLabel}>
                  {language === 'fa' ? 'پیشرفت کلی' : 'overall progress'}
                </Text>
              </View>
            </MotiView>
          </LinearGradient>
        </MotiView>

        {protocols.map((item, index) => {
          const tasks = DAILY_TASKS[item.id][language === 'fa' ? 'fa' : 'en'];
          const doneCount = getDoneCount(item.id);
          const allDone = loaded && doneCount === tasks.length;
          const isExpanded = expandedId === item.id;
          const EventIcon = item.icon;

          return (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 150 + index * 100 }}
            >
              <Card
                style={{
                  ...styles.card,
                  backgroundColor: isDark ? colors.surface : '#ffffff',
                  shadowColor: item.color,
                }}
              >
                <View
                  style={[
                    styles.cardHeader,
                    { flexDirection: rowDir },
                  ]}
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: item.color + '18' },
                    ]}
                  >
                    <EventIcon size={26} color={item.color} />
                  </View>
                  <View
                    style={[
                      styles.textContent,
                      {
                        marginLeft: isRTL ? 0 : Spacing.md,
                        marginRight: isRTL ? Spacing.md : 0,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.titleRow,
                        { flexDirection: rowDir },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cardTitle,
                          {
                            color: colors.text,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.progressLabel,
                          { color: item.color },
                        ]}
                      >
                        {item.progress}%
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.cardDesc,
                        {
                          color: colors.textSecondary,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {item.desc}
                    </Text>
                    <View
                      style={[
                        styles.progressBackground,
                        {
                          backgroundColor: isDark ? '#2A2A38' : '#e9e9f2',
                        },
                      ]}
                    >
                      <MotiView
                        from={{ width: '0%' }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{
                          type: 'timing',
                          duration: 900,
                          delay: 300 + index * 100,
                        }}
                        style={[
                          styles.progress,
                          { backgroundColor: item.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleExpand(item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={item.title}
                  style={[
                    styles.button,
                    {
                      flexDirection: rowDir,
                      backgroundColor: allDone ? colors.success : item.color,
                    },
                  ]}
                >
                  {allDone ? (
                    <>
                      <PartyPopper size={18} color="#FFFFFF" />
                      <Text style={styles.buttonText}>
                        {language === 'fa' ? 'امروز کامل شد!' : 'Completed today!'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.buttonText}>
                        {t.startProtocol || 'Start Protocol'}
                      </Text>
                      {loaded && (
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>
                            {doneCount}/{tasks.length}
                          </Text>
                        </View>
                      )}
                      {isExpanded ? (
                        <ChevronDown size={18} color="#FFFFFF" />
                      ) : (
                        <ChevronRight
                          size={18}
                          color="#FFFFFF"
                          style={isRTL ? styles.chevronRTL : undefined}
                        />
                      )}
                    </>
                  )}
                </TouchableOpacity>

                <AnimatePresence>
                  {isExpanded && (
                    <MotiView
                      from={{ opacity: 0, translateY: -6 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      exit={{ opacity: 0, translateY: -6 }}
                      transition={{ type: 'timing', duration: 220 }}
                      style={styles.checklist}
                    >
                      <Text
                        style={[
                          styles.checklistHeading,
                          {
                            color: colors.textSecondary,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {language === 'fa' ? 'کارهای امروز' : "Today's tasks"}
                      </Text>
                      {tasks.map((taskLabel, taskIndex) => {
                        const isDone = !!taskState[item.id]?.[taskIndex];
                        return (
                          <TouchableOpacity
                            key={taskIndex}
                            activeOpacity={0.7}
                            onPress={() =>
                              toggleTask(item.id, taskIndex, tasks.length)
                            }
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isDone }}
                            style={[
                              styles.taskRow,
                              { flexDirection: rowDir },
                            ]}
                          >
                            <View
                              style={[
                                styles.checkbox,
                                {
                                  backgroundColor: isDone ? item.color : 'transparent',
                                  borderColor: isDone ? item.color : colors.border,
                                },
                              ]}
                            >
                              {isDone && (
                                <Check size={14} color="#FFFFFF" strokeWidth={3} />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.taskLabel,
                                {
                                  color: isDone ? colors.textTertiary : colors.text,
                                  textDecorationLine: isDone ? 'line-through' : 'none',
                                  textAlign: isRTL ? 'right' : 'left',
                                },
                              ]}
                            >
                              {taskLabel}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </MotiView>
                  )}
                </AnimatePresence>
              </Card>
            </MotiView>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 80,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroCard: {
    width: width - Spacing.lg * 2,
    minHeight: 330,
    marginHorizontal: Spacing.lg,
    paddingTop: 42,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  heroBlobA: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.08,
    top: -60,
    right: -40,
  },
  heroBlobB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.08,
    bottom: -30,
    left: -30,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 106,
    height: 106,
    borderRadius: 53,
  },
  heroTextContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 5,
    maxWidth: 300,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: Spacing.md,
    gap: 5,
  },
  progressBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBadgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  card: {
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContent: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    flex: 1,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 8,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  progressBackground: {
    height: 6,
    borderRadius: 10,
    marginTop: 12,
    overflow: 'hidden',
  },
  progress: {
    height: 6,
    borderRadius: 10,
  },
  button: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chevronRTL: {
    transform: [{ scaleX: -1 }],
  },
  checklist: {
    marginTop: Spacing.md,
    gap: 4,
  },
  checklistHeading: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  taskRow: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskLabel: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },
});