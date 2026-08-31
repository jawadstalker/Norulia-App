import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Home,
  PartyPopper,
  PenLine,
  Sparkles,
  Users,
  UserRound,
  Target,
  TrendingUp,
  Clock3,
  CheckCircle2,
  Play,
  RotateCcw,
  Brain,
  UsersRound,
  Feather,
  Lock,
  ChevronDown,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MODES = {
  single: {
    icon: UserRound,
  },

  dyad: {
    icon: Users,
  },

  group: {
    icon: UsersRound,
  },
} as const;

type ProtocolMode = 'single' | 'dyad' | 'group';
type ViewMode = 'home' | 'day' | 'report';

interface Bilingual {
  fa: string;
  en: string;
}

interface Task {
  text: Bilingual;
  type: 'checkbox' | 'text';
  unit?: Bilingual;
}

interface DayEntry {
  ayah?: string;
  ayahRef?: string;
  poem?: string;
  poemPoet?: string;
  title?: Bilingual;
  icon?: string;
  desc?: Bilingual;
  tasks: Task[];
}

interface TaskProgress {
  done: boolean;
  value: string;
}

type DayProgress = TaskProgress[];
type Progress = Record<number, DayProgress>;

const AYAHS: { text: string; ref: string }[] = [
  {
    text: 'همانا با سختی، آسانی است.',
    ref: 'سوره انشراح، آیه ۶',
  },
  {
    text: 'خداوند هیچ‌کس را جز به‌اندازه توانش مکلف نمی‌سازد.',
    ref: 'سوره بقره، آیه ۲۸۶',
  },
  {
    text: 'آگاه باشید که تنها با یاد خدا دل‌ها آرام می‌گیرد.',
    ref: 'سوره رعد، آیه ۲۸',
  },
  {
    text: 'و صبرکنندگان را بشارت ده.',
    ref: 'سوره بقره، آیه ۱۵۵',
  },
  {
    text: 'او با شماست، هر کجا که باشید.',
    ref: 'سوره حدید، آیه ۴',
  },
  {
    text: 'از رحمت خدا ناامید نشوید.',
    ref: 'سوره یوسف، آیه ۸۷',
  },
  {
    text: 'پروردگارا، سینه‌ام را گشاده گردان.',
    ref: 'سوره طه، آیه ۲۵',
  },
  {
    text: 'و خداوند با صابران است.',
    ref: 'سوره بقره، آیه ۱۵۳',
  },
  {
    text: 'پس مرا یاد کنید تا شما را یاد کنم.',
    ref: 'سوره بقره، آیه ۱۵۲',
  },
  {
    text: 'و در کارها با یکدیگر مشورت کن.',
    ref: 'سوره آل‌عمران، آیه ۱۵۹',
  },
  {
    text:
      'ای بندگان من که بر خود اسراف کرده‌اید، از رحمت خدا ناامید نشوید.',
    ref: 'سوره زمر، آیه ۵۳',
  },
  {
    text: 'و هر کس بر خدا توکل کند، او برایش کافی است.',
    ref: 'سوره طلاق، آیه ۳',
  },
  {
    text:
      'همانا با سختی، آسانی است؛ همانا با سختی، آسانی است.',
    ref: 'سوره انشراح، آیات ۵-۶',
  },
  {
    text: 'و خدا دوستدار نیکوکاران است.',
    ref: 'سوره بقره، آیه ۱۹۵',
  },
  {
    text: 'آیا سینه تو را گشاده نساختیم؟',
    ref: 'سوره انشراح، آیه ۱',
  },
];

const POEMS: { text: string; poet: string }[] = [
  {
    text:
      'بنی‌آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند',
    poet: 'سعدی',
  },
  {
    text:
      'بشنو از نی چون حکایت می‌کند\nاز جدایی‌ها شکایت می‌کند',
    poet: 'مولانا',
  },
  {
    text:
      'این قافله عمر عجب می‌گذرد\nدریاب دمی که با طرب می‌گذرد',
    poet: 'خیام',
  },
  {
    text:
      'هر نفس که فرو می‌رود ممد حیات است\nو چون برمی‌آید مفرح ذات',
    poet: 'سعدی',
  },
  {
    text:
      'هر کسی کو دور ماند از اصل خویش\nباز جوید روزگار وصل خویش',
    poet: 'مولانا',
  },
  {
    text:
      'تن آدمی شریف است به جان آدمیت\nنه همین لباس زیباست نشان آدمیت',
    poet: 'سعدی',
  },
];

const SINGLE_TASKS: Task[] = [
  {
    text: {
      fa: 'ثبت خلق و خو (۱ تا ۱۰)',
      en: 'Log your mood (1–10)',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'شناسایی یک فکر منفی',
      en: 'Identify one negative thought',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'تمرین تنفس عمیق (۵ دقیقه)',
      en: '5 min deep breathing',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'یک فعالیت لذت‌بخش',
      en: 'One enjoyable activity',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'نوشتن یک نکته مثبت',
      en: 'Write one positive note',
    },
    type: 'checkbox',
  },
];

function buildSingleData(): DayEntry[] {
  const result: DayEntry[] = [];

  for (let i = 0; i < 31; i++) {
    const ayah = AYAHS[i % AYAHS.length];
    const poem = POEMS[i % POEMS.length];

    result.push({
      ayah: ayah.text,
      ayahRef: ayah.ref,
      poem: poem.text,
      poemPoet: poem.poet,
      tasks: SINGLE_TASKS,
    });
  }

  return result;
}

function buildDyadData(): DayEntry[] {
  return [
    {
      title: {
        fa: 'جلسه ۱: آشنایی و اعتمادسازی',
        en: 'Session 1: Getting acquainted',
      },

      icon: 'users',

      desc: {
        fa: 'تمرینات جفتی برای ایجاد ارتباط مؤثر',
        en: 'Paired exercises for effective connection',
      },

      tasks: [
        {
          text: {
            fa: 'ثبت خلق‌وخو (هر دو نفر)',
            en: 'Log mood (both partners)',
          },
          type: 'checkbox',
        },
        {
          text: {
            fa: 'تمرین جفتی: معرفی و آشنایی',
            en: 'Pair exercise: introductions',
          },
          type: 'checkbox',
        },
        {
          text: {
            fa: 'نوشتن یک نکته مثبت درباره شریک',
            en: 'Write one positive note about your partner',
          },
          type: 'text',
        },
        {
          text: {
            fa: 'گفتگوی ساختاریافته (۵ دقیقه)',
            en: '5 min structured conversation',
          },
          type: 'checkbox',
        },
        {
          text: {
            fa: 'تکلیف مشارکتی برای جلسه بعد',
            en: 'Shared task for next session',
          },
          type: 'text',
        },
      ],
    },
  ];
}

function buildGroupData(): DayEntry[] {
  return [
    {
      title: {
        fa: 'جلسه ۱: معرفی و قوانین گروه',
        en: 'Session 1: Intro & group rules',
      },

      icon: 'group',

      desc: {
        fa: 'تمرینات گروهی برای ایجاد هماهنگی',
        en: 'Group exercises to build cohesion',
      },

      tasks: [
        {
          text: {
            fa: 'ثبت خلق‌وخو (میانگین گروه)',
            en: 'Log mood (group average)',
          },
          type: 'checkbox',
        },
        {
          text: {
            fa: 'تمرین گروهی: معرفی اعضا',
            en: 'Group exercise: introductions',
          },
          type: 'checkbox',
        },
        {
          text: {
            fa: 'نوشتن یک بازخورد برای گروه',
            en: 'Write one piece of feedback for the group',
          },
          type: 'text',
        },
        {
          text: {
            fa: 'بحث گروهی (۱۰ دقیقه)',
            en: '10 min group discussion',
          },
          type: 'checkbox',
        },
        {
          text: {
            fa: 'تکلیف گروهی برای جلسه بعد',
            en: 'Group task for next session',
          },
          type: 'text',
        },
      ],
    },
  ];
}

function getData(mode: ProtocolMode): DayEntry[] {
  if (mode === 'single') return buildSingleData();
  if (mode === 'dyad') return buildDyadData();

  return buildGroupData();
}

function getTotalDays(mode: ProtocolMode): number {
  return mode === 'single' ? 31 : 1;
}

const STORAGE_KEY = (mode: ProtocolMode) =>
  `@neurolia_cbt_progress_${mode}`;

function isTaskDone(progress?: TaskProgress): boolean {
  return (
    !!progress?.done ||
    !!progress?.value?.trim()
  );
}

function freshDayProgress(tasks: Task[]): DayProgress {
  return tasks.map(() => ({
    done: false,
    value: '',
  }));
}

export default function ProtocolScreen() {
  const router = useRouter();

  const { colors, isDark, isAthlete } = useTheme();
  const { isRTL, language } = useLanguage();

  const fa = language === 'fa';

  const textDirection = fa ? 'rtl' : 'ltr';
  const textAlign = fa ? 'right' : 'left';
  const rowDirection = fa ? 'row-reverse' : 'row';
  const contentAlign = fa ? 'flex-end' : 'flex-start';

  // تعیین رنگ‌ها بر اساس تم - فقط برای آیکون‌ها و progressbar
  const getAccent = () => {
    if (isAthlete) return '#22C55E'; // سبز برای تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 1)'; // آبی برای تم تاریک
    return colors.primary; // رنگ پیش‌فرض
  };

  const getAccentStrong = () => {
    if (isAthlete) return '#22C55E'; // سبز برای تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 1)'; // آبی برای تم تاریک
    return colors.primaryDark || colors.primary; // رنگ پیش‌فرض
  };

  const getSoftAccent = () => {
    if (isAthlete) return 'rgba(34,197,94,0.18)'; // سبز با透明度 برای تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 0.18)'; // آبی با透明度 برای تم تاریک
    return colors.primary + '12'; // رنگ پیش‌فرض
  };

  const getSoftAccentStrong = () => {
    if (isAthlete) return 'rgba(34,197,94,0.28)'; // سبز با透明度 بیشتر برای تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 0.28)'; // آبی با透明度 بیشتر برای تم تاریک
    return colors.primary + '18'; // رنگ پیش‌فرض
  };

  const accent = getAccent();
  const accentStrong = getAccentStrong();
  const softAccent = getSoftAccent();
  const softAccentStrong = getSoftAccentStrong();

  const background = colors.background;
  const card = colors.surface;
  const cardSecondary = colors.surfaceSecondary;

  const softBorder = isDark
    ? colors.border || 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.08)';

  const progressTrack = isDark
    ? colors.border || 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.06)';

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

  const getDayProgress = useCallback(
    (dayIndex: number): DayProgress => {
      return (
        progress[dayIndex] ??
        freshDayProgress(data[dayIndex]?.tasks ?? [])
      );
    },
    [progress, data],
  );

  const getCompletedTasks = useCallback(
    (dayIndex: number): number => {
      const dayProgress = getDayProgress(dayIndex);
      return dayProgress.filter(item => isTaskDone(item)).length;
    },
    [getDayProgress],
  );

  const getDayPercent = useCallback(
    (dayIndex: number): number => {
      const tasks = data[dayIndex]?.tasks ?? [];
      if (!tasks.length) return 0;
      const completed = getCompletedTasks(dayIndex);
      return Math.round((completed / tasks.length) * 100);
    },
    [data, getCompletedTasks],
  );

  const completedDays = useMemo(() => {
    return Array.from(
      { length: totalDays },
      (_, index) => getDayPercent(index) === 100
    ).filter(Boolean).length;
  }, [totalDays, getDayPercent]);

  const overallPercent = totalDays > 0
    ? Math.round((completedDays / totalDays) * 100)
    : 0;

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
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProgress();

    return () => {
      mounted = false;
    };
  }, [mode]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEY(mode), JSON.stringify(progress)).catch(error => {
      console.log('[Protocol] Failed to save progress:', error);
    });
  }, [progress, mode, isLoading]);

  const lightHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const successHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const handleBack = () => {
    lightHaptic();
    if (view === 'day' || view === 'report') {
      setView('home');
      return;
    }
    router.back();
  };

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

  const toggleTask = (taskIndex: number) => {
    lightHaptic();
    setProgress(prev => {
      const current = prev[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
      const updated = [...current];
      updated[taskIndex] = {
        ...updated[taskIndex],
        done: !updated[taskIndex]?.done,
      };
      return {
        ...prev,
        [currentDay]: updated,
      };
    });
  };

  const updateTextTask = (taskIndex: number, value: string) => {
    setProgress(prev => {
      const current = prev[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
      const updated = [...current];
      updated[taskIndex] = {
        ...updated[taskIndex],
        value,
        done: value.trim().length > 0,
      };
      return {
        ...prev,
        [currentDay]: updated,
      };
    });
  };

  const completeDay = () => {
    const tasks = currentEntry?.tasks ?? [];
    if (!tasks.length) return;
    const current = getDayProgress(currentDay);
    const allDone = current.every(item => isTaskDone(item));
    if (!allDone) {
      lightHaptic();
      return;
    }
    successHaptic();
    setProgress(prev => ({
      ...prev,
      [currentDay]: current.map(item => ({
        ...item,
        done: true,
      })),
    }));
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2200);
  };

  const previousDay = () => {
    if (currentDay <= 0) return;
    lightHaptic();
    setCurrentDay(currentDay - 1);
    setSelectedTask(null);
  };

  const nextDay = () => {
    if (currentDay >= totalDays - 1) return;
    lightHaptic();
    setCurrentDay(currentDay + 1);
    setSelectedTask(null);
  };

  const resetProtocol = async () => {
    lightHaptic();
    try {
      await AsyncStorage.removeItem(STORAGE_KEY(mode));
      setProgress({});
      setCurrentDay(0);
      setView('home');
      setSelectedTask(null);
    } catch (error) {
      console.log('[Protocol] Failed to reset:', error);
    }
  };

  const tr = (value?: Bilingual) => {
    if (!value) return '';
    return fa ? value.fa : value.en;
  };

  const getModeTitle = (protocolMode: ProtocolMode) => {
    if (protocolMode === 'single') {
      return fa ? 'برنامه فردی' : 'Individual';
    }
    if (protocolMode === 'dyad') {
      return fa ? 'برنامه دونفره' : 'Two-person';
    }
    return fa ? 'برنامه گروهی' : 'Group';
  };

  const getModeDescription = (protocolMode: ProtocolMode) => {
    if (protocolMode === 'single') {
      return fa
        ? 'تمرین‌های روزانه برای رشد و آرامش ذهن'
        : 'Daily exercises for cognitive and emotional growth';
    }
    if (protocolMode === 'dyad') {
      return fa ? 'تمرین‌های مشترک برای دو نفر' : 'Shared exercises for two people';
    }
    return fa
      ? 'تمرین‌های مشارکتی برای یک گروه'
      : 'Collaborative exercises for a group';
  };

  const getModeIcon = (protocolMode: ProtocolMode) => {
    if (protocolMode === 'single') return Brain;
    if (protocolMode === 'dyad') return Users;
    return UsersRound;
  };

  const getDayLabel = (index: number) => {
    if (mode === 'single') {
      return fa ? `روز ${index + 1}` : `Day ${index + 1}`;
    }
    return fa ? `جلسه ${index + 1}` : `Session ${index + 1}`;
  };

  const currentDayPercent = getDayPercent(currentDay);
  const currentCompletedTasks = getCompletedTasks(currentDay);
  const currentTotalTasks = currentEntry?.tasks?.length ?? 0;

  const renderPageHeader = (title: string, subtitle: string) => (
    <View
      style={[
        styles.pageHeader,
        {
          backgroundColor: background,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleBack}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={fa ? 'بازگشت' : 'Back'}
        style={[
          styles.headerBackButton,
          {
            backgroundColor: card,
            borderColor: softBorder,
          },
        ]}
      >
        <ArrowLeft size={21} color={colors.text} strokeWidth={2.2} />
      </TouchableOpacity>

      <View style={styles.headerTitleContainer}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              textAlign,
              writingDirection: textDirection,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.headerSubtitle,
            {
              color: colors.textSecondary || colors.text + '80',
              textAlign,
              writingDirection: textDirection,
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <View style={styles.headerSidePlaceholder} />
    </View>
  );

  const renderDayNavigation = () => (
    <View
      style={[
        styles.dayNavigation,
        {
          flexDirection: rowDirection,
        },
      ]}
    >
      <TouchableOpacity
        onPress={previousDay}
        disabled={currentDay === 0}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={fa ? 'روز قبلی' : 'Previous day'}
        style={[
          styles.dayNavButton,
          {
            backgroundColor: card,
            borderColor: softBorder,
            opacity: currentDay === 0 ? 0.35 : 1,
          },
        ]}
      >
        <ChevronLeft size={22} color={colors.text} strokeWidth={2.2} />
      </TouchableOpacity>

      <View
        style={[
          styles.dayIndicator,
          {
            backgroundColor: softAccent,
            borderColor: softBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.dayIndicatorText,
            {
              color: accent,
              textAlign,
              writingDirection: textDirection,
            },
          ]}
        >
          {getDayLabel(currentDay)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={nextDay}
        disabled={currentDay >= totalDays - 1}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={fa ? 'روز بعدی' : 'Next day'}
        style={[
          styles.dayNavButton,
          {
            backgroundColor: card,
            borderColor: softBorder,
            opacity: currentDay >= totalDays - 1 ? 0.35 : 1,
          },
        ]}
      >
        <ChevronRight size={22} color={colors.text} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );

  const renderModeCard = (protocolMode: ProtocolMode) => {
    const Icon = getModeIcon(protocolMode);
    const active = mode === protocolMode;
    const modeAccent = accent;

    return (
      <TouchableOpacity
        key={protocolMode}
        activeOpacity={0.82}
        onPress={() => changeMode(protocolMode)}
        style={[
          styles.modeCard,
          {
            backgroundColor: active ? softAccentStrong : card,
            borderColor: active ? modeAccent : softBorder,
          },
        ]}
      >
        <View
          style={[
            styles.modeIcon,
            {
              backgroundColor: active ? modeAccent : cardSecondary,
            },
          ]}
        >
          <Icon
            size={21}
            color={active ? colors.background : modeAccent}
            strokeWidth={2.1}
          />
        </View>

        <Text
          style={[
            styles.modeTitle,
            {
              color: colors.text,
              textAlign,
              writingDirection: textDirection,
            },
          ]}
        >
          {getModeTitle(protocolMode)}
        </Text>

        <Text
          style={[
            styles.modeDescription,
            {
              color: colors.textSecondary || colors.text + '80',
              textAlign,
              writingDirection: textDirection,
            },
          ]}
          numberOfLines={2}
        >
          {getModeDescription(protocolMode)}
        </Text>

        {active && (
          <View
            style={[
              styles.modeActiveIndicator,
              {
                backgroundColor: modeAccent,
              },
            ]}
          >
            <Check size={12} color={colors.background} strokeWidth={3} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDayCard = (dayIndex: number) => {
    const percent = getDayPercent(dayIndex);
    const completed = getCompletedTasks(dayIndex);
    const total = data[dayIndex]?.tasks?.length ?? 0;
    const completedDay = percent === 100;

    return (
      <TouchableOpacity
        key={`day-${dayIndex}`}
        activeOpacity={0.82}
        onPress={() => openDay(dayIndex)}
        style={[
          styles.dayCard,
          {
            backgroundColor: card,
            borderColor: softBorder,
          },
        ]}
      >
        <View
          style={[
            styles.dayCardTop,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          <View
            style={[
              styles.dayNumber,
              {
                backgroundColor: completedDay ? accent : softAccent,
              },
            ]}
          >
            {completedDay ? (
              <Check size={18} color={colors.background} strokeWidth={2.8} />
            ) : (
              <Text
                style={[
                  styles.dayNumberText,
                  {
                    color: accent,
                  },
                ]}
              >
                {dayIndex + 1}
              </Text>
            )}
          </View>

          <View
            style={[
              styles.dayCardInfo,
              {
                alignItems: contentAlign,
              },
            ]}
          >
            <Text
              style={[
                styles.dayTitle,
                {
                  color: colors.text,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {getDayLabel(dayIndex)}
            </Text>

            <Text
              style={[
                styles.dayTasksText,
                {
                  color: colors.textSecondary || colors.text + '80',
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {fa
                ? `${completed} از ${total} فعالیت`
                : `${completed} of ${total} activities`}
            </Text>
          </View>

          <View
            style={[
              styles.dayPercent,
              {
                backgroundColor: percent === 100 ? softAccentStrong : cardSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.dayPercentText,
                {
                  color: percent === 100 ? accent : colors.textSecondary || colors.text + '60',
                },
              ]}
            >
              {percent}%
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: progressTrack,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${percent}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor: background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={accent} />
        <Text
          style={[
            styles.loadingText,
            {
              color: colors.textSecondary || colors.text + '80',
              textAlign,
              writingDirection: textDirection,
            },
          ]}
        >
          {fa ? 'در حال بارگذاری...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: background,
        },
      ]}
    >
      <View
        style={[
          styles.root,
          {
            backgroundColor: background,
          },
        ]}
      >
        {view === 'home' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderPageHeader(
              fa ? 'پروتکل' : 'Protocol',
              fa ? 'برنامه روزانه شما' : 'Your daily program',
            )}

            <MotiView
              from={{
                opacity: 0,
                translateY: 18,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
                scale: 1,
              }}
              transition={{
                type: 'timing',
                duration: 550,
              }}
              style={[
                styles.heroCard,
                {
                  backgroundColor: isDark 
                    ? 'rgba(73, 194, 226, 0.12)'
                    : 'rgba(73, 194, 226, 1)',
                  borderColor: isDark
                    ? 'rgba(73, 194, 226, 0.20)'
                    : 'rgba(73, 194, 226, 0.55)',
                },
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.heroGlowOne,
                  {
                    backgroundColor: isDark
                      ? 'rgba(73, 194, 226, 0.08)'
                      : 'rgba(255,255,255,0.20)',
                  },
                ]}
              />

              <View
                pointerEvents="none"
                style={[
                  styles.heroGlowTwo,
                  {
                    backgroundColor: isDark
                      ? 'rgba(73, 194, 226, 0.05)'
                      : 'rgba(255,255,255,0.14)',
                  },
                ]}
              />

              <View
                style={[
                  styles.heroTopRow,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <MotiView
                  from={{
                    opacity: 0,
                    scale: 0.75,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 14,
                    stiffness: 120,
                    delay: 120,
                  }}
                  style={styles.heroAvatarWrapper}
                >
                  <Image
                    source={require('../../assets/avatars/Laptop.png')}
                    style={styles.heroAvatar}
                    resizeMode="contain"
                  />
                </MotiView>

                <View
                  style={[
                    styles.heroTextBlock,
                    {
                      alignItems: contentAlign,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.heroBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(73, 194, 226, 0.20)'
                          : 'rgba(255,255,255,0.15)',
                        flexDirection: rowDirection,
                      },
                    ]}
                  >
                    <Sparkles
                      size={14}
                      color={isAthlete ? '#22C55E' : (isDark ? 'rgba(73, 194, 226, 1)' : 'rgba(255,255,255,0.95)')}
                      strokeWidth={2.2}
                    />

                    <Text
                      style={[
                        styles.heroBadgeText,
                        {
                          color: isAthlete ? '#22C55E' : (isDark ? 'rgba(73, 194, 226, 1)' : 'rgba(255,255,255,0.95)'),
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'مسیر شما' : 'Your journey'}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.heroTitle,
                      {
                        color: isDark ? colors.text : '#FFFFFF',
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {getModeTitle(mode)}
                  </Text>

                  <Text
                    style={[
                      styles.heroDescription,
                      {
                        color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.82)',
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {getModeDescription(mode)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.heroProgressPanel,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.18)'
                      : 'rgba(255,255,255,0.13)',
                    borderColor: isDark
                      ? 'rgba(73, 194, 226, 0.20)'
                      : 'rgba(255,255,255,0.18)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.heroProgressHeader,
                    {
                      flexDirection: rowDirection,
                    },
                  ]}
                >
                  <View
                    style={{
                      alignItems: contentAlign,
                      flex: 1,
                    }}
                  >
                    <Text
                      style={[
                        styles.heroProgressLabel,
                        {
                          color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.70)',
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'پیشرفت کلی برنامه' : 'Overall progress'}
                    </Text>

                    <Text
                      style={[
                        styles.heroProgressHint,
                        {
                          color: isDark ? colors.textTertiary : 'rgba(255,255,255,0.55)',
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa
                        ? `${completedDays} از ${totalDays} روز تکمیل شده`
                        : `${completedDays} of ${totalDays} days completed`}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.heroProgressValue,
                      {
                        color: isAthlete ? '#22C55E' : (isDark ? colors.text : '#FFFFFF'),
                      },
                    ]}
                  >
                    {overallPercent}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroProgressTrack,
                    {
                      backgroundColor: isDark
                        ? 'rgba(73, 194, 226, 0.15)'
                        : 'rgba(255,255,255,0.18)',
                    },
                  ]}
                >
                  <MotiView
                    from={{
                      width: '0%',
                    }}
                    animate={{
                      width: `${overallPercent}%`,
                    }}
                    transition={{
                      type: 'timing',
                      duration: 800,
                    }}
                    style={[
                      styles.heroProgressFill,
                      {
                        backgroundColor: isAthlete ? '#22C55E' : (isDark ? 'rgba(73, 194, 226, 1)' : '#FFFFFF'),
                      },
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.heroStats,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View
                  style={[
                    styles.heroStat,
                    {
                      borderColor: isDark
                        ? 'rgba(73, 194, 226, 0.15)'
                        : 'rgba(255,255,255,0.14)',
                    },
                  ]}
                >
                  <Target
                    size={17}
                    color={isAthlete ? '#22C55E' : (isDark ? 'rgba(73, 194, 226, 1)' : 'rgba(255,255,255,0.88)')}
                    strokeWidth={2}
                  />

                  <View style={{ alignItems: contentAlign }}>
                    <Text
                      style={[
                        styles.heroStatValue,
                        {
                          color: isDark ? colors.text : '#FFFFFF',
                        },
                      ]}
                    >
                      {totalDays}
                    </Text>

                    <Text
                      style={[
                        styles.heroStatLabel,
                        {
                          color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.58)',
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'روز برنامه' : 'Program days'}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.heroStat,
                    {
                      borderColor: isDark
                        ? 'rgba(73, 194, 226, 0.15)'
                        : 'rgba(255,255,255,0.14)',
                    },
                  ]}
                >
                  <CheckCircle2
                    size={17}
                    color={isAthlete ? '#22C55E' : (isDark ? 'rgba(73, 194, 226, 1)' : 'rgba(255,255,255,0.88)')}
                    strokeWidth={2}
                  />

                  <View style={{ alignItems: contentAlign }}>
                    <Text
                      style={[
                        styles.heroStatValue,
                        {
                          color: isDark ? colors.text : '#FFFFFF',
                        },
                      ]}
                    >
                      {completedDays}
                    </Text>

                    <Text
                      style={[
                        styles.heroStatLabel,
                        {
                          color: isDark ? colors.textSecondary : 'rgba(255,255,255,0.58)',
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'تکمیل شده' : 'Completed'}
                    </Text>
                  </View>
                </View>
              </View>
            </MotiView>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa ? 'نوع پروتکل' : 'Protocol type'}
              </Text>

              <View
                style={[
                  styles.modeGrid,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                {renderModeCard('single')}
                {renderModeCard('dyad')}
                {renderModeCard('group')}
              </View>
            </View>

            <View style={styles.section}>
              <View
                style={[
                  styles.sectionHeader,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View
                  style={{
                    alignItems: contentAlign,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors.text,
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa ? 'گزارش امروز' : "Today's report"}
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      {
                        color: colors.textSecondary || colors.text + '80',
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {getDayLabel(currentDay)}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => {
                    lightHaptic();
                    setView('report');
                  }}
                  style={[
                    styles.reportButton,
                    {
                      backgroundColor: softAccent,
                      flexDirection: rowDirection,
                    },
                  ]}
                >
                  <BarChart3 size={17} color={accent} strokeWidth={2} />
                  <Text
                    style={[
                      styles.reportButtonText,
                      {
                        color: accent,
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa ? 'گزارش کامل' : 'Full report'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.reportCard,
                  {
                    backgroundColor: card,
                    borderColor: softBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reportMain,
                    {
                      flexDirection: rowDirection,
                    },
                  ]}
                >
                  <View style={styles.circularProgress}>
                    <Text
                      style={[
                        styles.circularProgressText,
                        {
                          color: accent,
                          textAlign: 'center',
                        },
                      ]}
                    >
                      {currentDayPercent}%
                    </Text>

                    <Text
                      style={[
                        styles.circularProgressLabel,
                        {
                          color: colors.textSecondary || colors.text + '80',
                          textAlign: 'center',
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'امروز' : 'Today'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.reportStats,
                      {
                        alignItems: contentAlign,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reportStatsTitle,
                        {
                          color: colors.text,
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'وضعیت فعالیت‌ها' : 'Activity status'}
                    </Text>

                    <Text
                      style={[
                        styles.reportStatsValue,
                        {
                          color: colors.textSecondary || colors.text + '80',
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa
                        ? `${currentCompletedTasks} از ${currentTotalTasks} فعالیت انجام شده`
                        : `${currentCompletedTasks} of ${currentTotalTasks} activities completed`}
                    </Text>

                    <View
                      style={[
                        styles.progressTrack,
                        {
                          backgroundColor: progressTrack,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${currentDayPercent}%`,
                            backgroundColor: accent,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View
                style={[
                  styles.sectionHeader,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View
                  style={{
                    alignItems: contentAlign,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors.text,
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa ? 'فعالیت‌های امروز' : "Today's activities"}
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      {
                        color: colors.textSecondary || colors.text + '80',
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa ? 'برای ادامه روی یک فعالیت بزنید' : 'Tap an activity to continue'}
                  </Text>
                </View>
              </View>

              {currentEntry?.tasks?.map((task, index) => {
                const taskProgress = getDayProgress(currentDay)[index];
                const done = isTaskDone(taskProgress);

                return (
                  <TouchableOpacity
                    key={`today-task-${index}`}
                    activeOpacity={0.8}
                    onPress={() => {
                      openDay(currentDay);
                      setTimeout(() => setSelectedTask(index), 50);
                    }}
                    style={[
                      styles.todayTaskCard,
                      {
                        backgroundColor: card,
                        borderColor: done ? accent : softBorder,
                        flexDirection: rowDirection,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.todayTaskIcon,
                        {
                          backgroundColor: done ? accent : softAccent,
                        },
                      ]}
                    >
                      {done ? (
                        <Check size={17} color={colors.background} strokeWidth={2.7} />
                      ) : (
                        <CheckCircle2 size={17} color={accent} strokeWidth={2} />
                      )}
                    </View>

                    <Text
                      style={[
                        styles.todayTaskText,
                        {
                          color: done
                            ? colors.textSecondary || colors.text + '80'
                            : colors.text,
                          textAlign,
                          writingDirection: textDirection,
                          textDecorationLine: done ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {tr(task.text)}
                    </Text>

                    <ChevronLeft
                      size={18}
                      color={colors.textTertiary || colors.text + '40'}
                      style={{
                        transform: [
                          {
                            rotate: fa ? '0deg' : '180deg',
                          },
                        ],
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {mode === 'single'
                  ? fa ? 'روزهای پروتکل' : 'Protocol days'
                  : fa ? 'جلسات پروتکل' : 'Protocol sessions'}
              </Text>

              {data.map((_, index) => renderDayCard(index))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={resetProtocol}
              style={[
                styles.resetButton,
                {
                  borderColor: softBorder,
                  backgroundColor: card,
                  flexDirection: rowDirection,
                },
              ]}
            >
              <RotateCcw size={17} color={colors.textSecondary || colors.text + '60'} strokeWidth={2} />
              <Text
                style={[
                  styles.resetButtonText,
                  {
                    color: colors.textSecondary || colors.text + '60',
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa ? 'شروع مجدد پروتکل' : 'Reset protocol'}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        {view === 'day' && currentEntry && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderPageHeader(
              getDayLabel(currentDay),
              getModeTitle(mode),
            )}

            <View
              style={[
                styles.dayProgressCard,
                {
                  backgroundColor: card,
                  borderColor: softBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.dayProgressHeader,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View
                  style={{
                    alignItems: contentAlign,
                  }}
                >
                  <Text
                    style={[
                      styles.dayProgressTitle,
                      {
                        color: colors.text,
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa ? 'پیشرفت امروز' : "Today's progress"}
                  </Text>

                  <Text
                    style={[
                      styles.dayProgressSubtitle,
                      {
                        color: colors.textSecondary || colors.text + '80',
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa
                      ? `${currentCompletedTasks} از ${currentTotalTasks} فعالیت`
                      : `${currentCompletedTasks} of ${currentTotalTasks} activities`}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.dayProgressPercent,
                    {
                      color: accent,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {currentDayPercent}%
                </Text>
              </View>

              <View
                style={[
                  styles.progressTrack,
                  {
                    backgroundColor: progressTrack,
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${currentDayPercent}%`,
                      backgroundColor: accent,
                    },
                  ]}
                />
              </View>
            </View>

            {renderDayNavigation()}

            {currentEntry.ayah && (
              <View
                style={[
                  styles.quoteCard,
                  {
                    backgroundColor: softAccent,
                    borderColor: softBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.quoteIcon,
                    {
                      backgroundColor: accent,
                    },
                  ]}
                >
                  <BookOpen size={18} color={colors.background} strokeWidth={2} />
                </View>

                <Text
                  style={[
                    styles.quoteText,
                    {
                      color: colors.text,
                      textAlign,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {currentEntry.ayah}
                </Text>

                {currentEntry.ayahRef && (
                  <Text
                    style={[
                      styles.quoteReference,
                      {
                        color: accent,
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {currentEntry.ayahRef}
                  </Text>
                )}
              </View>
            )}

            {currentEntry.poem && (
              <View
                style={[
                  styles.poemCard,
                  {
                    backgroundColor: card,
                    borderColor: softBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.poemHeader,
                    {
                      flexDirection: rowDirection,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.poemIcon,
                      {
                        backgroundColor: softAccent,
                      },
                    ]}
                  >
                    <Feather size={18} color={accent} strokeWidth={2} />
                  </View>

                  <View
                    style={{
                      alignItems: contentAlign,
                    }}
                  >
                    <Text
                      style={[
                        styles.poemTitle,
                        {
                          color: colors.text,
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa ? 'شعر امروز' : "Today's poem"}
                    </Text>

                    {currentEntry.poemPoet && (
                      <Text
                        style={[
                          styles.poemPoet,
                          {
                            color: colors.textSecondary || colors.text + '80',
                            textAlign,
                            writingDirection: textDirection,
                          },
                        ]}
                      >
                        {currentEntry.poemPoet}
                      </Text>
                    )}
                  </View>
                </View>

                <Text
                  style={[
                    styles.poemText,
                    {
                      color: colors.text,
                      textAlign,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {currentEntry.poem}
                </Text>
              </View>
            )}

            <View style={styles.tasksSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: colors.text,
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa ? 'فعالیت‌های این روز' : "Today's tasks"}
              </Text>

              {currentEntry.tasks.map((task, index) => {
                const taskProgress = getDayProgress(currentDay)[index];
                const done = isTaskDone(taskProgress);
                const selected = selectedTask === index;

                return (
                  <View
                    key={`task-${index}`}
                    style={[
                      styles.taskCard,
                      {
                        backgroundColor: card,
                        borderColor: selected || done ? accent : softBorder,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedTask(selected ? null : index)}
                      style={[
                        styles.taskHeader,
                        {
                          flexDirection: rowDirection,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.taskCheckbox,
                          {
                            backgroundColor: done ? accent : 'transparent',
                            borderColor: done ? accent : softBorder,
                          },
                        ]}
                      >
                        {done && <Check size={16} color={colors.background} strokeWidth={2.8} />}
                      </View>

                      <Text
                        style={[
                          styles.taskText,
                          {
                            color: colors.text,
                            textAlign,
                            writingDirection: textDirection,
                            textDecorationLine: done ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {tr(task.text)}
                      </Text>

                      <ChevronDown
                        size={18}
                        color={colors.textSecondary || colors.text + '60'}
                        style={{
                          transform: [
                            {
                              rotate: selected ? '180deg' : '0deg',
                            },
                          ],
                        }}
                      />
                    </TouchableOpacity>

                    {selected && (
                      <View
                        style={[
                          styles.taskExpanded,
                          {
                            borderTopColor: softBorder,
                          },
                        ]}
                      >
                        {task.type === 'text' ? (
                          <TextInput
                            value={taskProgress?.value ?? ''}
                            onChangeText={value => updateTextTask(index, value)}
                            placeholder={fa ? 'پاسخ خود را بنویسید...' : 'Write your response...'}
                            placeholderTextColor={colors.textTertiary || colors.text + '40'}
                            multiline
                            style={[
                              styles.taskInput,
                              {
                                color: colors.text,
                                backgroundColor: cardSecondary,
                                borderColor: softBorder,
                                textAlign,
                                writingDirection: textDirection,
                              },
                            ]}
                          />
                        ) : (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => toggleTask(index)}
                            style={[
                              styles.taskActionButton,
                              {
                                backgroundColor: done ? softAccent : accent,
                                flexDirection: rowDirection,
                              },
                            ]}
                          >
                            <Check
                              size={17}
                              color={done ? accent : colors.background}
                              strokeWidth={2.5}
                            />

                            <Text
                              style={[
                                styles.taskActionText,
                                {
                                  color: done ? accent : colors.background,
                                  textAlign,
                                  writingDirection: textDirection,
                                },
                              ]}
                            >
                              {done
                                ? fa ? 'انجام شد' : 'Completed'
                                : fa ? 'انجام دادم' : 'Mark complete'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              disabled={currentDayPercent !== 100}
              onPress={completeDay}
              style={[
                styles.completeDayButton,
                {
                  backgroundColor: currentDayPercent === 100 ? accent : cardSecondary,
                  borderColor: currentDayPercent === 100 ? accent : softBorder,
                  opacity: currentDayPercent === 100 ? 1 : 0.75,
                  flexDirection: rowDirection,
                },
              ]}
            >
              {currentDayPercent === 100 ? (
                <CheckCircle2 size={21} color={colors.background} strokeWidth={2.3} />
              ) : (
                <Lock size={19} color={colors.textSecondary || colors.text + '60'} strokeWidth={2} />
              )}

              <Text
                style={[
                  styles.completeDayText,
                  {
                    color: currentDayPercent === 100
                      ? colors.background
                      : colors.textSecondary || colors.text + '60',
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {currentDayPercent === 100
                  ? fa ? 'تکمیل روز' : 'Complete day'
                  : fa ? 'تمام فعالیت‌ها را انجام دهید' : 'Complete all tasks first'}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        {view === 'report' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderPageHeader(
              fa ? 'گزارش پروتکل' : 'Protocol report',
              getModeTitle(mode),
            )}

            <View
              style={[
                styles.reportHero,
                {
                  backgroundColor: card,
                  borderColor: softBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.reportCircle,
                  {
                    borderColor: accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.reportCircleValue,
                    {
                      color: accent,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {overallPercent}%
                </Text>

                <Text
                  style={[
                    styles.reportCircleLabel,
                    {
                      color: colors.textSecondary || colors.text + '80',
                      textAlign: 'center',
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {fa ? 'پیشرفت' : 'Progress'}
                </Text>
              </View>

              <Text
                style={[
                  styles.reportHeroTitle,
                  {
                    color: colors.text,
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa ? 'پیشرفت کلی شما' : 'Your overall progress'}
              </Text>

              <Text
                style={[
                  styles.reportHeroSubtitle,
                  {
                    color: colors.textSecondary || colors.text + '80',
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa
                  ? `${completedDays} روز از ${totalDays} روز کامل شده است`
                  : `${completedDays} of ${totalDays} days completed`}
              </Text>
            </View>

            <View
              style={[
                styles.reportStatsGrid,
                {
                  flexDirection: rowDirection,
                },
              ]}
            >
              <View
                style={[
                  styles.reportStatCard,
                  {
                    backgroundColor: card,
                    borderColor: softBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reportStatIcon,
                    {
                      backgroundColor: softAccent,
                    },
                  ]}
                >
                  <CalendarDays size={19} color={accent} strokeWidth={2} />
                </View>

                <Text
                  style={[
                    styles.reportStatValue,
                    {
                      color: colors.text,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {completedDays}
                </Text>

                <Text
                  style={[
                    styles.reportStatLabel,
                    {
                      color: colors.textSecondary || colors.text + '80',
                      textAlign: 'center',
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {fa ? 'روز کامل‌شده' : 'Days completed'}
                </Text>
              </View>

              <View
                style={[
                  styles.reportStatCard,
                  {
                    backgroundColor: card,
                    borderColor: softBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reportStatIcon,
                    {
                      backgroundColor: softAccent,
                    },
                  ]}
                >
                  <CheckCircle2 size={19} color={accent} strokeWidth={2} />
                </View>

                <Text
                  style={[
                    styles.reportStatValue,
                    {
                      color: colors.text,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {data.reduce((sum, _, i) => sum + getCompletedTasks(i), 0)}
                </Text>

                <Text
                  style={[
                    styles.reportStatLabel,
                    {
                      color: colors.textSecondary || colors.text + '80',
                      textAlign: 'center',
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {fa ? 'فعالیت انجام‌شده' : 'Tasks completed'}
                </Text>
              </View>

              <View
                style={[
                  styles.reportStatCard,
                  {
                    backgroundColor: card,
                    borderColor: softBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.reportStatIcon,
                    {
                      backgroundColor: softAccent,
                    },
                  ]}
                >
                  <Target size={19} color={accent} strokeWidth={2} />
                </View>

                <Text
                  style={[
                    styles.reportStatValue,
                    {
                      color: colors.text,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {data.reduce((sum, item) => sum + (item.tasks?.length ?? 0), 0) > 0
                    ? Math.round(
                        (data.reduce((sum, _, i) => sum + getCompletedTasks(i), 0) /
                          data.reduce((sum, item) => sum + (item.tasks?.length ?? 0), 0)) *
                          100,
                      )
                    : 0}
                  %
                </Text>

                <Text
                  style={[
                    styles.reportStatLabel,
                    {
                      color: colors.textSecondary || colors.text + '80',
                      textAlign: 'center',
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {fa ? 'تکمیل فعالیت‌ها' : 'Task completion'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.reportProgressCard,
                {
                  backgroundColor: card,
                  borderColor: softBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.sectionHeader,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: colors.text,
                      textAlign,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {fa ? 'پیشرفت روزانه' : 'Daily progress'}
                </Text>

                <BarChart3 size={19} color={accent} strokeWidth={2} />
              </View>

              <View style={styles.reportDays}>
                {data.map((_, index) => {
                  const percent = getDayPercent(index);

                  return (
                    <TouchableOpacity
                      key={`report-day-${index}`}
                      activeOpacity={0.8}
                      onPress={() => openDay(index)}
                      style={styles.reportDay}
                    >
                      <View
                        style={[
                          styles.reportDayBarTrack,
                          {
                            backgroundColor: progressTrack,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.reportDayBar,
                            {
                              height: `${Math.max(percent, 5)}%`,
                              backgroundColor: percent === 100 ? accent : accentStrong,
                            },
                          ]}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: softAccent,
                  borderColor: softBorder,
                  flexDirection: rowDirection,
                },
              ]}
            >
              <View
                style={[
                  styles.summaryIcon,
                  {
                    backgroundColor: accent,
                  },
                ]}
              >
                <Sparkles size={19} color={colors.background} strokeWidth={2} />
              </View>

              <View
                style={[
                  styles.summaryContent,
                  {
                    alignItems: contentAlign,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.summaryTitle,
                    {
                      color: colors.text,
                      textAlign,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {overallPercent === 100
                    ? fa ? 'پروتکل را کامل کرده‌اید' : 'You completed the protocol'
                    : fa ? 'به مسیر خود ادامه دهید' : 'Keep moving forward'}
                </Text>

                <Text
                  style={[
                    styles.summaryText,
                    {
                      color: colors.textSecondary || colors.text + '80',
                      textAlign,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {overallPercent === 100
                    ? fa
                      ? 'تمام فعالیت‌های این پروتکل با موفقیت انجام شده‌اند.'
                      : 'All activities in this protocol have been completed.'
                    : fa
                    ? 'هر فعالیت کوچک، یک قدم به سمت پیشرفت بیشتر است.'
                    : 'Every small activity is another step forward.'}
                </Text>
              </View>
            </View>

            <View style={styles.bottomSpace} />
          </ScrollView>
        )}

        {showCelebration && (
          <MotiView
            from={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            style={[
              styles.celebrationOverlay,
              {
                backgroundColor: 'rgba(0,0,0,0.78)',
              },
            ]}
          >
            <MotiView
              from={{
                opacity: 0,
                translateY: 20,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              style={[
                styles.celebrationCard,
                {
                  backgroundColor: card,
                  borderColor: softBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.celebrationIcon,
                  {
                    backgroundColor: accent,
                  },
                ]}
              >
                <CheckCircle2 size={35} color={colors.background} strokeWidth={2} />
              </View>

              <Text
                style={[
                  styles.celebrationTitle,
                  {
                    color: colors.text,
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa ? 'روز کامل شد' : 'Day completed'}
              </Text>

              <Text
                style={[
                  styles.celebrationText,
                  {
                    color: colors.textSecondary || colors.text + '80',
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa ? 'آفرین! یک قدم دیگر به جلو رفتید.' : 'Great job! You took another step forward.'}
              </Text>
            </MotiView>
          </MotiView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  root: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  pageHeader: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },

  headerSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 1,
  },

  headerSidePlaceholder: {
    width: 42,
    height: 42,
  },

  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 22,
    borderRadius: 28,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    minHeight: 245,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 7,
  },

  heroGlowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -85,
    right: -55,
  },

  heroGlowTwo: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: -80,
    left: -55,
  },

  heroTopRow: {
    alignItems: 'center',
    gap: 16,
  },

  heroAvatarWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroAvatar: {
    width: 100,
    height: 100,
    borderRadius: 40,
  },

  heroTextBlock: {
    flex: 1,
    gap: 6,
  },

  heroBadge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
    marginBottom: 2,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  heroTitle: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },

  heroProgressPanel: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },

  heroProgressHeader: {
    alignItems: 'center',
    gap: 12,
  },

  heroProgressLabel: {
    fontSize: 13,
    fontWeight: '700',
  },

  heroProgressHint: {
    fontSize: 11,
    marginTop: 3,
  },

  heroProgressValue: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  heroProgressTrack: {
    height: 7,
    width: '100%',
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 12,
  },

  heroProgressFill: {
    height: '100%',
    borderRadius: 99,
  },

  heroStats: {
    marginTop: 13,
    gap: 10,
  },

  heroStat: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  heroStatValue: {
    fontSize: 15,
    fontWeight: '800',
  },

  heroStatLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  sectionHeader: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    paddingBottom: 10,
    fontSize: 17,
    fontWeight: '700',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  modeGrid: {
    gap: 10,
    marginTop: 8,
  },

  modeCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },

  modeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  modeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },

  modeDescription: {
    fontSize: 10,
    opacity: 0.7,
  },

  modeActiveIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportButton: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  reportButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  reportCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },

  reportMain: {
    alignItems: 'center',
    gap: 16,
  },

  circularProgress: {
    alignItems: 'center',
    width: 80,
  },

  circularProgressText: {
    fontSize: 28,
    fontWeight: '800',
  },

  circularProgressLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  reportStats: {
    flex: 1,
    gap: 4,
  },

  reportStatsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  reportStatsValue: {
    fontSize: 12,
  },

  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  todayTaskCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },

  todayTaskIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  todayTaskText: {
    flex: 1,
    fontSize: 13,
  },

  dayCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },

  dayCardTop: {
    alignItems: 'center',
    gap: 12,
  },

  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },

  dayCardInfo: {
    flex: 1,
  },

  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  dayTasksText: {
    fontSize: 11,
    opacity: 0.7,
  },

  dayPercent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  dayPercentText: {
    fontSize: 12,
    fontWeight: '600',
  },

  resetButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },

  resetButtonText: {
    fontSize: 14,
  },

  bottomSpace: {
    height: 30,
  },

  dayProgressCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  dayProgressHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  dayProgressTitle: {
    fontSize: 15,
    fontWeight: '600',
  },

  dayProgressSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },

  dayProgressPercent: {
    fontSize: 22,
    fontWeight: '800',
  },

  dayNavigation: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },

  dayNavButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayIndicator: {
    minWidth: 90,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayIndicatorText: {
    fontSize: 13,
    fontWeight: '700',
  },

  quoteCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },

  quoteIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  quoteText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 8,
  },

  quoteReference: {
    fontSize: 12,
  },

  poemCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  poemHeader: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  poemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  poemTitle: {
    fontSize: 13,
    fontWeight: '600',
  },

  poemPoet: {
    fontSize: 11,
    opacity: 0.7,
  },

  poemText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },

  tasksSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  taskCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },

  taskHeader: {
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },

  taskCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  taskText: {
    flex: 1,
    fontSize: 14,
  },

  taskExpanded: {
    borderTopWidth: 1,
    padding: 14,
  },

  taskInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  taskActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },

  taskActionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  completeDayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },

  completeDayText: {
    fontSize: 15,
    fontWeight: '700',
  },

  reportHero: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },

  reportCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  reportCircleValue: {
    fontSize: 30,
    fontWeight: '800',
  },

  reportCircleLabel: {
    fontSize: 12,
  },

  reportHeroTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },

  reportHeroSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },

  reportStatsGrid: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 10,
  },

  reportStatCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },

  reportStatIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  reportStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  reportStatLabel: {
    fontSize: 10,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 2,
  },

  reportProgressCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  reportDays: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
    paddingTop: 8,
  },

  reportDay: {
    alignItems: 'center',
    flex: 1,
  },

  reportDayBarTrack: {
    width: 20,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  reportDayBar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },

  summaryCard: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  summaryText: {
    fontSize: 12,
    opacity: 0.7,
  },

  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  celebrationCard: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    maxWidth: 300,
  },

  celebrationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  celebrationTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },

  celebrationText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});