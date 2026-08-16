import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, SafeAreaView } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleCheck, ClipboardCheck, Home, PartyPopper, PenLine, Sparkles, Users, UserRound, Target, TrendingUp, Clock3, CheckCircle2, Play, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CONTENT_MAX_WIDTH = 760;

const MODES = {
  single: { icon: UserRound, accent: '#7C3AED' },
  dyad: { icon: Users, accent: '#2563EB' },
  group: { icon: Users, accent: '#059669' },
} as const;

type ProtocolMode = 'single' | 'dyad' | 'group';
type ViewMode = 'home' | 'day' | 'report';
interface Bilingual { fa: string; en: string; }
interface Task { text: Bilingual; type: 'checkbox' | 'text'; unit?: Bilingual; }
interface DayEntry { ayah?: string; ayahRef?: string; poem?: string; poemPoet?: string; title?: Bilingual; icon?: string; desc?: Bilingual; tasks: Task[]; }
interface TaskProgress { done: boolean; value: string; }
type DayProgress = TaskProgress[];
type Progress = Record<number, DayProgress>;

const AYAHS: { text: string; ref: string; }[] = [
  { text: 'همانا با سختی، آسانی است.', ref: 'سوره انشراح، آیه ۶' },
  { text: 'خداوند هیچ‌کس را جز به‌اندازه توانش مکلف نمی‌سازد.', ref: 'سوره بقره، آیه ۲۸۶' },
  { text: 'آگاه باشید که تنها با یاد خدا دل‌ها آرام می‌گیرد.', ref: 'سوره رعد، آیه ۲۸' },
  { text: 'و صبرکنندگان را بشارت ده.', ref: 'سوره بقره، آیه ۱۵۵' },
  { text: 'او با شماست، هر کجا که باشید.', ref: 'سوره حدید، آیه ۴' },
  { text: 'از رحمت خدا ناامید نشوید.', ref: 'سوره یوسف، آیه ۸۷' },
  { text: 'پروردگارا، سینه‌ام را گشاده گردان.', ref: 'سوره طه، آیه ۲۵' },
  { text: 'و خداوند با صابران است.', ref: 'سوره بقره، آیه ۱۵۳' },
  { text: 'پس مرا یاد کنید تا شما را یاد کنم.', ref: 'سوره بقره، آیه ۱۵۲' },
  { text: 'و در کارها با یکدیگر مشورت کن.', ref: 'سوره آل‌عمران، آیه ۱۵۹' },
  { text: 'ای بندگان من که بر خود اسراف کرده‌اید، از رحمت خدا ناامید نشوید.', ref: 'سوره زمر، آیه ۵۳' },
  { text: 'و هر کس بر خدا توکل کند، او برایش کافی است.', ref: 'سوره طلاق، آیه ۳' },
  { text: 'همانا با سختی، آسانی است؛ همانا با سختی، آسانی است.', ref: 'سوره انشراح، آیات ۵-۶' },
  { text: 'و خدا دوستدار نیکوکاران است.', ref: 'سوره بقره، آیه ۱۹۵' },
  { text: 'آیا سینه تو را گشاده نساختیم؟', ref: 'سوره انشراح، آیه ۱' },
];

const POEMS: { text: string; poet: string; }[] = [
  { text: 'بنی‌آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند', poet: 'سعدی' },
  { text: 'بشنو از نی چون حکایت می‌کند\nاز جدایی‌ها شکایت می‌کند', poet: 'مولانا' },
  { text: 'این قافله عمر عجب می‌گذرد\nدریاب دمی که با طرب می‌گذرد', poet: 'خیام' },
  { text: 'هر نفس که فرو می‌رود ممد حیات است\nو چون برمی‌آید مفرح ذات', poet: 'سعدی' },
  { text: 'هر کسی کو دور ماند از اصل خویش\nباز جوید روزگار وصل خویش', poet: 'مولانا' },
  { text: 'تن آدمی شریف است به جان آدمیت\nنه همین لباس زیباست نشان آدمیت', poet: 'سعدی' },
];

const SINGLE_TASKS: Task[] = [
  { text: { fa: 'ثبت خلق و خو (۱ تا ۱۰)', en: 'Log your mood (1–10)' }, type: 'checkbox' },
  { text: { fa: 'شناسایی یک فکر منفی', en: 'Identify one negative thought' }, type: 'checkbox' },
  { text: { fa: 'تمرین تنفس عمیق (۵ دقیقه)', en: '5 min deep breathing' }, type: 'checkbox' },
  { text: { fa: 'یک فعالیت لذت‌بخش', en: 'One enjoyable activity' }, type: 'checkbox' },
  { text: { fa: 'نوشتن یک نکته مثبت', en: 'Write one positive note' }, type: 'checkbox' },
];

function buildSingleData(): DayEntry[] {
  const result: DayEntry[] = [];
  for (let i = 0; i < 31; i++) {
    const ayah = AYAHS[i % AYAHS.length];
    const poem = POEMS[i % POEMS.length];
    result.push({ ayah: ayah.text, ayahRef: ayah.ref, poem: poem.text, poemPoet: poem.poet, tasks: SINGLE_TASKS });
  }
  return result;
}

function buildDyadData(): DayEntry[] {
  return [{
    title: { fa: 'جلسه ۱: آشنایی و اعتمادسازی', en: 'Session 1: Getting acquainted' },
    icon: 'users',
    desc: { fa: 'تمرینات جفتی برای ایجاد ارتباط مؤثر', en: 'Paired exercises for effective connection' },
    tasks: [
      { text: { fa: 'ثبت خلق‌وخو (هر دو نفر)', en: 'Log mood (both partners)' }, type: 'checkbox' },
      { text: { fa: 'تمرین جفتی: معرفی و آشنایی', en: 'Pair exercise: introductions' }, type: 'checkbox' },
      { text: { fa: 'نوشتن یک نکته مثبت درباره شریک', en: 'Write one positive note about your partner' }, type: 'text' },
      { text: { fa: 'گفتگوی ساختاریافته (۵ دقیقه)', en: '5 min structured conversation' }, type: 'checkbox' },
      { text: { fa: 'تکلیف مشارکتی برای جلسه بعد', en: 'Shared task for next session' }, type: 'text' },
    ]
  }];
}

function buildGroupData(): DayEntry[] {
  return [{
    title: { fa: 'جلسه ۱: معرفی و قوانین گروه', en: 'Session 1: Intro & group rules' },
    icon: 'group',
    desc: { fa: 'تمرینات گروهی برای ایجاد هماهنگی', en: 'Group exercises to build cohesion' },
    tasks: [
      { text: { fa: 'ثبت خلق‌وخو (میانگین گروه)', en: 'Log mood (group average)' }, type: 'checkbox' },
      { text: { fa: 'تمرین گروهی: معرفی اعضا', en: 'Group exercise: introductions' }, type: 'checkbox' },
      { text: { fa: 'نوشتن یک بازخورد برای گروه', en: 'Write one piece of feedback for the group' }, type: 'text' },
      { text: { fa: 'بحث گروهی (۱۰ دقیقه)', en: '10 min group discussion' }, type: 'checkbox' },
      { text: { fa: 'تکلیف گروهی برای جلسه بعد', en: 'Group task for next session' }, type: 'text' },
    ]
  }];
}

function getData(mode: ProtocolMode): DayEntry[] {
  if (mode === 'single') return buildSingleData();
  if (mode === 'dyad') return buildDyadData();
  return buildGroupData();
}

function getTotalDays(mode: ProtocolMode): number {
  return mode === 'single' ? 31 : 1;
}

const STORAGE_KEY = (mode: ProtocolMode) => `@neurolia_cbt_progress_${mode}`;

function isTaskDone(progress?: TaskProgress): boolean {
  return !!progress?.done || !!progress?.value?.trim();
}

function freshDayProgress(tasks: Task[]): DayProgress {
  return tasks.map(() => ({ done: false, value: '' }));
}

export default function ProtocolScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isRTL, language } = useLanguage();
  const fa = language === 'fa';
  const accent = isDark ? '#C084FC' : '#7C3AED';
  const accentStrong = isDark ? '#A855F7' : '#6D28D9';
  const background = isDark ? '#09090F' : '#F7F5FC';
  const card = isDark ? '#14141D' : '#FFFFFF';
  const cardSecondary = isDark ? '#1A1923' : '#F1EEFA';
  const softAccent = isDark ? 'rgba(168,85,247,0.13)' : 'rgba(124,58,237,0.08)';
  const softAccentStrong = isDark ? 'rgba(168,85,247,0.22)' : 'rgba(124,58,237,0.13)';

  const [mode, setMode] = useState<ProtocolMode>('single');
  const [view, setView] = useState<ViewMode>('home');
  const [currentDay, setCurrentDay] = useState(0);
  const [progress, setProgress] = useState<Progress>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const data = useMemo(() => getData(mode), [mode]);
  const totalDays = getTotalDays(mode);
  const currentEntry = data[currentDay];

  const getDayProgress = useCallback((dayIndex: number): DayProgress => {
    return progress[dayIndex] ?? freshDayProgress(data[dayIndex]?.tasks ?? []);
  }, [progress, data]);

  const getCompletedTasks = useCallback((dayIndex: number): number => {
    const dayProgress = getDayProgress(dayIndex);
    return dayProgress.filter(item => isTaskDone(item)).length;
  }, [getDayProgress]);

  const getDayPercent = useCallback((dayIndex: number): number => {
    const tasks = data[dayIndex]?.tasks ?? [];
    if (!tasks.length) return 0;
    const completed = getCompletedTasks(dayIndex);
    return Math.round((completed / tasks.length) * 100);
  }, [data, getCompletedTasks]);

  const completedDays = useMemo(() => {
    return Array.from({ length: totalDays }, (_, index) => getDayPercent(index) === 100).filter(Boolean).length;
  }, [totalDays, getDayPercent]);

  const overallPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  useEffect(() => {
    let mounted = true;
    const loadProgress = async () => {
      try {
        setIsLoading(true);
        const raw = await AsyncStorage.getItem(STORAGE_KEY(mode));
        if (raw && mounted) {
          const parsed = JSON.parse(raw);
          setProgress(parsed || {});
        } else if (mounted) {
          setProgress({});
        }
      } catch (error) {
        console.log('[Protocol] Failed to load progress:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    loadProgress();
    return () => { mounted = false; };
  }, [mode]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEY(mode), JSON.stringify(progress)).catch(error => {
      console.log('[Protocol] Failed to save progress:', error);
    });
  }, [progress, mode, isLoading]);

  const lightHaptic = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); };
  const successHaptic = () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}); };

  const changeMode = (nextMode: ProtocolMode) => {
    if (nextMode === mode) return;
    lightHaptic();
    setMode(nextMode);
    setView('home');
    setCurrentDay(0);
    setSelectedTask(null);
  };

  const openDay = (dayIndex: number) => {
    lightHaptic();
    setCurrentDay(Math.max(0, Math.min(dayIndex, totalDays - 1)));
    setView('day');
    setSelectedTask(null);
  };

  const handleBack = () => {
    lightHaptic();
    if (view === 'day' || view === 'report') {
      setView('home');
      return;
    }
    router.back();
  };

  const updateTask = (taskIndex: number, changes: Partial<TaskProgress>) => {
    setProgress(previous => {
      const current = previous[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
      const next = [...current];
      next[taskIndex] = { ...next[taskIndex], ...changes };
      return { ...previous, [currentDay]: next };
    });
  };

  const toggleTask = (taskIndex: number) => {
    lightHaptic();
    const current = getDayProgress(currentDay);
    const task = current[taskIndex];
    updateTask(taskIndex, { done: !task?.done });
  };

  const updateTextTask = (taskIndex: number, value: string) => {
    updateTask(taskIndex, { value, done: value.trim().length > 0 });
  };

  const completeDay = () => {
    const tasks = currentEntry?.tasks ?? [];
    if (!tasks.length) return;
    const current = getDayProgress(currentDay);
    const allCompleted = tasks.every((_, index) => isTaskDone(current[index]));
    if (!allCompleted) {
      lightHaptic();
      return;
    }
    successHaptic();
    setShowCelebration(true);
    setTimeout(() => { setShowCelebration(false); }, 1800);
  };

  const resetProtocol = async () => {
    lightHaptic();
    setProgress({});
    try {
      await AsyncStorage.removeItem(STORAGE_KEY(mode));
    } catch (error) {
      console.log('[Protocol] Reset failed:', error);
    }
  };

  const previousDay = () => {
    if (currentDay <= 0) return;
    lightHaptic();
    setCurrentDay(currentDay - 1);
  };

  const nextDay = () => {
    if (currentDay >= totalDays - 1) return;
    lightHaptic();
    setCurrentDay(currentDay + 1);
  };

  const text = (value?: Bilingual) => {
    if (!value) return '';
    return fa ? value.fa : value.en;
  };

  const modeTitle = (selectedMode: ProtocolMode) => {
    if (selectedMode === 'single') return fa ? 'فردی' : 'Personal';
    if (selectedMode === 'dyad') return fa ? 'دونفره' : 'Dyad';
    return fa ? 'گروهی' : 'Group';
  };

  const modeDescription = (selectedMode: ProtocolMode) => {
    if (selectedMode === 'single') return fa ? 'برنامه شخصی روزانه' : 'Personal daily program';
    if (selectedMode === 'dyad') return fa ? 'تمرین‌های دو نفره' : 'Paired exercises';
    return fa ? 'تمرین‌های مشارکتی گروهی' : 'Collaborative group exercises';
  };

  const renderHome = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: 110 }]}
      showsVerticalScrollIndicator={false}
    >
      <MotiView
        from={{ opacity: 0, translateY: 18 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 450 }}
        style={[styles.heroCard, { backgroundColor: colors.primary }]}
      >
        <View style={[styles.heroGlow, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)' }]} />
        <View style={[styles.heroTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.heroTextContainer}>
            <Text style={[styles.heroEyebrow, { textAlign: isRTL ? 'right' : 'left' }]}>
              {fa ? 'پروتکل امروز' : "Today's protocol"}
            </Text>
            <Text style={[styles.heroTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {fa ? 'پروتکل هوشمند' : 'Smart Protocol'}
            </Text>
            <Text style={[styles.heroDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
              {fa ? 'برنامه امروز خود را دنبال کنید و عملکرد ذهنی خود را بهبود دهید.' : 'Follow your daily plan and improve your cognitive performance.'}
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <Target size={30} color="#FFFFFF" strokeWidth={1.8} />
          </View>
        </View>
        <View style={styles.heroProgressSection}>
          <View style={[styles.progressHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.progressLabel}>{fa ? 'پیشرفت امروز' : "Today's progress"}</Text>
            <Text style={styles.progressPercent}>{getDayPercent(currentDay)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <MotiView
              from={{ width: '0%' }}
              animate={{ width: `${getDayPercent(currentDay)}%` }}
              transition={{ type: 'timing', duration: 900, delay: 250 }}
              style={styles.progressFill}
            />
          </View>
        </View>
      </MotiView>

      <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {[
          { icon: Target, label: fa ? 'انجام شده' : 'Completed', value: getCompletedTasks(currentDay), color: colors.primary },
          { icon: Clock3, label: fa ? 'باقی مانده' : 'Remaining', value: (currentEntry?.tasks?.length || 0) - getCompletedTasks(currentDay), color: '#10B981' },
          { icon: TrendingUp, label: fa ? 'روز متوالی' : 'Day streak', value: completedDays, color: '#F59E0B' },
        ].map((stat, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350, delay: 80 + index * 60 }}
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.statIcon, { backgroundColor: isDark ? `${stat.color}26` : `${stat.color}14` }]}>
              <stat.icon size={19} color={stat.color} strokeWidth={2} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </MotiView>
        ))}
      </View>

      <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {fa ? 'فعالیت‌های امروز' : "Today's activities"}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {fa ? 'فعالیت‌ها را به ترتیب انجام دهید' : 'Complete activities in order'}
          </Text>
        </View>
        <View style={[styles.todayBadge, { backgroundColor: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)' }]}>
          <CalendarDays size={16} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.todayBadgeText, { color: colors.primary }]}>{fa ? 'امروز' : 'Today'}</Text>
        </View>
      </View>

      <View style={styles.activitiesList}>
        {currentEntry?.tasks?.map((task, index) => {
          const taskProgress = getDayProgress(currentDay)[index];
          const completed = isTaskDone(taskProgress);
          const Icon = completed ? CheckCircle2 : Play;
          return (
            <MotiView
              key={index}
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 350, delay: 250 + index * 70 }}
            >
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={() => {
                  if (task.type === 'checkbox') {
                    toggleTask(index);
                  } else {
                    setSelectedTask(index);
                  }
                }}
                style={[
                  styles.activityCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: completed ? (isDark ? 'rgba(74,222,128,0.24)' : 'rgba(74,222,128,0.18)') : colors.border,
                  }
                ]}
              >
                <View style={[styles.activityIcon, { backgroundColor: completed ? (isDark ? 'rgba(74,222,128,0.13)' : 'rgba(74,222,128,0.08)') : (isDark ? 'rgba(99,102,241,0.13)' : 'rgba(99,102,241,0.07)') }]}>
                  <Icon size={22} color={completed ? '#22C55E' : colors.primary} strokeWidth={2} />
                </View>
                <View style={[styles.activityInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <View style={[styles.activityTitleRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text numberOfLines={1} style={[styles.activityTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                      {text(task.text)}
                    </Text>
                    {completed && (
                      <View style={[styles.completedBadge, { backgroundColor: isDark ? 'rgba(34,197,94,0.13)' : 'rgba(34,197,94,0.08)' }]}>
                        <Check size={12} color="#22C55E" strokeWidth={2.5} />
                      </View>
                    )}
                  </View>
                  <View style={[styles.activityMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.metaItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <Clock3 size={13} color={colors.textTertiary || '#999'} strokeWidth={2} />
                      <Text style={[styles.metaText, { color: colors.textTertiary || '#999' }]}>
                        {task.type === 'checkbox' ? (fa ? 'چک‌باکس' : 'Checkbox') : (fa ? 'متن' : 'Text')}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.activityAction, { backgroundColor: completed ? (isDark ? 'rgba(34,197,94,0.12)' : 'rgba(34,197,94,0.07)') : (isDark ? 'rgba(99,102,241,0.14)' : 'rgba(99,102,241,0.08)') }]}>
                  {completed ? (
                    <Check size={19} color="#22C55E" strokeWidth={2.4} />
                  ) : (
                    <ChevronRight size={20} color={colors.primary} strokeWidth={2.2} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
                  )}
                </View>
              </TouchableOpacity>
              {index < (currentEntry?.tasks?.length || 0) - 1 && (
                <View style={[styles.activityConnector, { backgroundColor: completed ? '#22C55E' : colors.border, alignSelf: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : 27, marginRight: isRTL ? 27 : 0 }]} />
              )}
            </MotiView>
          );
        })}
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400, delay: 550 }}
        style={[styles.motivationCard, { backgroundColor: isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)', borderColor: isDark ? 'rgba(139,92,246,0.20)' : 'rgba(139,92,246,0.12)' }]}
      >
        <View style={[styles.motivationIcon, { backgroundColor: isDark ? 'rgba(139,92,246,0.16)' : 'rgba(139,92,246,0.09)' }]}>
          <Sparkles size={21} color="#8B5CF6" strokeWidth={2} />
        </View>
        <View style={styles.motivationContent}>
          <Text style={[styles.motivationTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {fa ? 'ادامه بده' : 'Keep going'}
          </Text>
          <Text style={[styles.motivationText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {fa ? 'هر فعالیت کوچک، یک قدم برای عملکرد بهتر ذهنی است.' : 'Every small activity is another step toward better cognitive performance.'}
          </Text>
        </View>
      </MotiView>
    </ScrollView>
  );

  const renderDay = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={[styles.contentContainer, { paddingBottom: 40 }]}>
      <View style={[styles.dayHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={handleBack} style={[styles.backButton, { borderColor: colors.border }]}>
          <ChevronLeft size={24} color={colors.text} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
        </TouchableOpacity>
        <Text style={[styles.dayTitle, { color: colors.text }]}>
          {fa ? `روز ${currentDay + 1}` : `Day ${currentDay + 1}`}
        </Text>
        <View style={{ width: 42 }} />
      </View>

      {currentEntry?.ayah && (
        <View style={[styles.ayahCard, { backgroundColor: cardSecondary }]}>
          <Text style={[styles.ayahText, { color: colors.text }]}>{currentEntry.ayah}</Text>
          <Text style={[styles.ayahRef, { color: colors.textSecondary }]}>{currentEntry.ayahRef}</Text>
        </View>
      )}

      {currentEntry?.poem && (
        <View style={[styles.poemCard, { backgroundColor: cardSecondary }]}>
          <Text style={[styles.poemText, { color: colors.text }]}>{currentEntry.poem}</Text>
          <Text style={[styles.poemPoet, { color: colors.textSecondary }]}>{currentEntry.poemPoet}</Text>
        </View>
      )}

      <View style={styles.tasksContainer}>
        <Text style={[styles.tasksTitle, { color: colors.text }]}>
          {fa ? 'وظایف امروز' : "Today's tasks"}
        </Text>
        {currentEntry?.tasks?.map((task, index) => {
          const taskProgress = getDayProgress(currentDay)[index];
          const completed = isTaskDone(taskProgress);
          return (
            <View key={index} style={[styles.taskItem, { borderColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  if (task.type === 'checkbox') {
                    toggleTask(index);
                  } else {
                    setSelectedTask(index);
                  }
                }}
                style={[styles.taskContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              >
                <View style={[styles.taskCheckbox, { backgroundColor: completed ? colors.primary : 'transparent', borderColor: completed ? colors.primary : colors.border }]}>
                  {completed && <Check size={16} color="#FFFFFF" strokeWidth={2.5} />}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskText, { color: completed ? colors.textSecondary : colors.text, textDecorationLine: completed ? 'line-through' : 'none' }]}>
                    {text(task.text)}
                  </Text>
                  {task.type === 'text' && taskProgress?.value && (
                    <Text style={[styles.taskValue, { color: colors.textSecondary }]}>{taskProgress.value}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={completeDay}
        style={[styles.completeButton, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.completeButtonText}>{fa ? 'تکمیل روز' : 'Complete Day'}</Text>
      </TouchableOpacity>

      {showCelebration && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.celebration}
        >
          <PartyPopper size={48} color={colors.primary} />
          <Text style={[styles.celebrationText, { color: colors.text }]}>{fa ? 'تبریک!' : 'Congratulations!'}</Text>
        </MotiView>
      )}
    </ScrollView>
  );

  const renderTextInputModal = () => {
    if (selectedTask === null || !currentEntry?.tasks?.[selectedTask]) return null;
    const task = currentEntry.tasks[selectedTask];
    const taskProgress = getDayProgress(currentDay)[selectedTask];
    return (
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{text(task.text)}</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: colors.border, color: colors.text }]}
            placeholder={fa ? 'متن خود را وارد کنید...' : 'Enter your text...'}
            placeholderTextColor={colors.textTertiary || '#999'}
            value={taskProgress?.value || ''}
            onChangeText={(value) => updateTextTask(selectedTask, value)}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            onPress={() => setSelectedTask(null)}
            style={[styles.modalButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.modalButtonText}>{fa ? 'بستن' : 'Close'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {view !== 'home' && (
          <TouchableOpacity onPress={handleBack} style={[styles.backButton, { borderColor: colors.border }]}>
            <ChevronLeft size={24} color={colors.text} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {view === 'home' ? (fa ? 'پروتکل' : 'Protocol') : view === 'day' ? (fa ? 'روز' : 'Day') : (fa ? 'گزارش' : 'Report')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {modeTitle(mode)} - {modeDescription(mode)}
          </Text>
        </View>
        {view === 'home' && (
          <TouchableOpacity onPress={resetProtocol} style={[styles.resetButton, { borderColor: colors.border }]}>
            <RotateCcw size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {view === 'home' && renderHome()}
      {view === 'day' && renderDay()}
      {renderTextInputModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { minHeight: 72, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12, alignItems: 'center', justifyContent: 'space-between' },
  headerTitleContainer: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 2 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  resetButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 6 },
  heroCard: { width: '100%', minHeight: 190, borderRadius: 24, padding: 20, overflow: 'hidden', position: 'relative' },
  heroGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, right: -55, top: -60 },
  heroTop: { alignItems: 'flex-start', justifyContent: 'space-between' },
  heroTextContainer: { flex: 1, minWidth: 0, paddingRight: 12 },
  heroEyebrow: { color: 'rgba(255,255,255,0.72)', fontSize: 12, lineHeight: 17, fontWeight: '600', marginBottom: 4 },
  heroTitle: { color: '#FFFFFF', fontSize: 25, lineHeight: 32, fontWeight: '800' },
  heroDescription: { color: 'rgba(255,255,255,0.78)', fontSize: 12.5, lineHeight: 19, marginTop: 7, maxWidth: 300 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  heroProgressSection: { marginTop: 22 },
  progressHeader: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 11.5, fontWeight: '600' },
  progressPercent: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  progressTrack: { width: '100%', height: 7, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.18)' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#FFFFFF' },
  statsRow: { width: '100%', gap: 9, marginTop: 12 },
  statCard: { flex: 1, minHeight: 106, borderRadius: 18, borderWidth: 1, padding: 12, alignItems: 'center', justifyContent: 'center' },
  statIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statValue: { fontSize: 19, lineHeight: 24, fontWeight: '800' },
  statLabel: { fontSize: 10.5, lineHeight: 15, marginTop: 1, textAlign: 'center' },
  sectionHeader: { width: '100%', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 13 },
  sectionTitleContainer: { flex: 1, minWidth: 0 },
  sectionTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
  sectionSubtitle: { fontSize: 11.5, lineHeight: 17, marginTop: 2 },
  todayBadge: { height: 34, paddingHorizontal: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  todayBadgeText: { fontSize: 11, fontWeight: '700' },
  activitiesList: { width: '100%' },
  activityCard: { width: '100%', minHeight: 96, borderRadius: 19, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  activityIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityInfo: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  activityTitleRow: { width: '100%', alignItems: 'center' },
  activityTitle: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  completedBadge: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 5 },
  activityDescription: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  activityMeta: { alignItems: 'center', marginTop: 7, gap: 6 },
  metaItem: { alignItems: 'center', gap: 4 },
  metaText: { fontSize: 9.5, lineHeight: 14 },
  metaDot: { width: 3, height: 3, borderRadius: 2, marginHorizontal: 3 },
  activityAction: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  activityConnector: { width: 2, height: 15, marginVertical: 2, opacity: 0.65 },
  motivationCard: { width: '100%', minHeight: 88, borderRadius: 19, borderWidth: 1, padding: 13, marginTop: 22, flexDirection: 'row', alignItems: 'center' },
  motivationIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  motivationContent: { flex: 1, minWidth: 0, marginHorizontal: 11 },
  motivationTitle: { fontSize: 14, lineHeight: 19, fontWeight: '800' },
  motivationText: { fontSize: 11, lineHeight: 17, marginTop: 3 },
  dayHeader: { width: '100%', minHeight: 52, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  dayTitle: { fontSize: 20, fontWeight: '700' },
  ayahCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
  ayahText: { fontSize: 16, lineHeight: 24, fontWeight: '600', textAlign: 'center' },
  ayahRef: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  poemCard: { padding: 16, borderRadius: 16, marginBottom: 12 },
  poemText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic', textAlign: 'center' },
  poemPoet: { fontSize: 12, marginTop: 8, textAlign: 'center' },
  tasksContainer: { marginTop: 8 },
  tasksTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  taskItem: { borderBottomWidth: 1, paddingVertical: 12 },
  taskContent: { alignItems: 'flex-start', gap: 12 },
  taskCheckbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  taskInfo: { flex: 1 },
  taskText: { fontSize: 15, lineHeight: 21 },
  taskValue: { fontSize: 13, marginTop: 4, opacity: 0.7 },
  completeButton: { paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  completeButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  celebration: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
  celebrationText: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 120, textAlignVertical: 'top' },
  modalButton: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});