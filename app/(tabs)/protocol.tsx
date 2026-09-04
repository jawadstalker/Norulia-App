import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';

import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Target,
  CheckCircle2,
  RotateCcw,
  Brain,
  UsersRound,
  Feather,
  Lock,
  ChevronDown,
  RefreshCw,
  Zap,
  Clock3,
  AlertCircle,
  Activity,
  Book,
  Percent,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

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
  taskId?: string;
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
  book?: Bilingual; // کتاب پیشنهادی برای این روز
}

interface TaskProgress {
  done: boolean;
  value: string;
  status?: 'completed' | 'failed' | 'skipped' | 'pending';
  difficulty?: number;
  failureReason?: string | null;
  bookProgress?: number; // درصد مطالعه کتاب (۰ تا ۱۰۰)
}

type DayProgress = TaskProgress[];
type Progress = Record<number, DayProgress>;

interface TheoryWeights {
  CBT: number;
  Gestalt: number;
  Hypnotherapy: number;
}

interface AIPlanTask {
  task_id: string;
  duration_minutes: number;
  confidence?: number;
}

interface AIPlanResponse {
  theory_weights?: Partial<TheoryWeights>;
  today_plan?: AIPlanTask[];
  final_plan?: AIPlanTask[];
  plan?: AIPlanTask[];
  message?: string;
}

interface AIPlannerPayload {
  user_id: string;
  day: number;
  mode: ProtocolMode;
  theme: string;
  resistance_level: string;
  mood_score: number;
  stress_level: number;
  cumulative_adherence_rate: number;
  dominant_failure_reason: string | null;
  yesterday_failed_tasks: string[];
  clinical_tags: string[];
  completed_ratio: number;
  failed_ratio: number;
  skipped_ratio: number;
  avg_diff: number;
  daily_task_results: Array<{
    task_id: string;
    status: 'completed' | 'failed' | 'skipped';
    difficulty_reported?: number;
    failure_reason?: string | null;
  }>;
}

interface StoredAIPlan {
  date: string;
  day: number;
  mode: ProtocolMode;
  response: AIPlanResponse;
}

// ============================================================
// API CONFIGURATION
// ============================================================

const PROTOCOL_AI_URL = 'https://roundness-stuck-stretch.ngrok-free.dev';
const API_KEY = '3IhN7vwOx7PIS5SxD5zBzezSVih_Yb6aBheAMq9ypaQKPB3G';

const AI_PLAN_STORAGE_KEY = (mode: ProtocolMode, day: number) =>
  `@neurolia_ai_protocol_plan_${mode}_${day}`;

const USER_ID_STORAGE_KEY = '@neurolia_user_id';

const { width: SCREEN_WIDTH } = {
  width: 390,
};

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
    text: 'ای بندگان من که بر خود اسراف کرده‌اید، از رحمت خدا ناامید نشوید.',
    ref: 'سوره زمر، آیه ۵۳',
  },
  {
    text: 'و هر کس بر خدا توکل کند، او برایش کافی است.',
    ref: 'سوره طلاق، آیه ۳',
  },
  {
    text: 'همانا با سختی، آسانی است؛ همانا با سختی، آسانی است.',
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
    text: 'بنی‌آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند',
    poet: 'سعدی',
  },
  {
    text: 'بشنو از نی چون حکایت می‌کند\nاز جدایی‌ها شکایت می‌کند',
    poet: 'مولانا',
  },
  {
    text: 'این قافله عمر عجب می‌گذرد\nدریاب دمی که با طرب می‌گذرد',
    poet: 'خیام',
  },
  {
    text: 'هر نفس که فرو می‌رود ممد حیات است\nو چون برمی‌آید مفرح ذات',
    poet: 'سعدی',
  },
  {
    text: 'هر کسی کو دور ماند از اصل خویش\nباز جوید روزگار وصل خویش',
    poet: 'مولانا',
  },
  {
    text: 'تن آدمی شریف است به جان آدمیت\nنه همین لباس زیباست نشان آدمیت',
    poet: 'سعدی',
  },
];

// کتاب‌های پیشنهادی برای هر روز
const BOOKS: Bilingual[] = [
  { fa: 'کتاب اول - فصل ۱', en: 'Book 1 - Chapter 1' },
  { fa: 'کتاب اول - فصل ۲', en: 'Book 1 - Chapter 2' },
  { fa: 'کتاب اول - فصل ۳', en: 'Book 1 - Chapter 3' },
  { fa: 'کتاب اول - فصل ۴', en: 'Book 1 - Chapter 4' },
  { fa: 'کتاب اول - فصل ۵', en: 'Book 1 - Chapter 5' },
  { fa: 'کتاب دوم - فصل ۱', en: 'Book 2 - Chapter 1' },
  { fa: 'کتاب دوم - فصل ۲', en: 'Book 2 - Chapter 2' },
  { fa: 'کتاب دوم - فصل ۳', en: 'Book 2 - Chapter 3' },
  { fa: 'کتاب دوم - فصل ۴', en: 'Book 2 - Chapter 4' },
  { fa: 'کتاب دوم - فصل ۵', en: 'Book 2 - Chapter 5' },
  { fa: 'کتاب سوم - فصل ۱', en: 'Book 3 - Chapter 1' },
  { fa: 'کتاب سوم - فصل ۲', en: 'Book 3 - Chapter 2' },
  { fa: 'کتاب سوم - فصل ۳', en: 'Book 3 - Chapter 3' },
  { fa: 'کتاب سوم - فصل ۴', en: 'Book 3 - Chapter 4' },
  { fa: 'کتاب سوم - فصل ۵', en: 'Book 3 - Chapter 5' },
  { fa: 'کتاب چهارم - فصل ۱', en: 'Book 4 - Chapter 1' },
  { fa: 'کتاب چهارم - فصل ۲', en: 'Book 4 - Chapter 2' },
  { fa: 'کتاب چهارم - فصل ۳', en: 'Book 4 - Chapter 3' },
  { fa: 'کتاب چهارم - فصل ۴', en: 'Book 4 - Chapter 4' },
  { fa: 'کتاب چهارم - فصل ۵', en: 'Book 4 - Chapter 5' },
  { fa: 'کتاب پنجم - فصل ۱', en: 'Book 5 - Chapter 1' },
  { fa: 'کتاب پنجم - فصل ۲', en: 'Book 5 - Chapter 2' },
  { fa: 'کتاب پنجم - فصل ۳', en: 'Book 5 - Chapter 3' },
  { fa: 'کتاب پنجم - فصل ۴', en: 'Book 5 - Chapter 4' },
  { fa: 'کتاب پنجم - فصل ۵', en: 'Book 5 - Chapter 5' },
  { fa: 'کتاب ششم - فصل ۱', en: 'Book 6 - Chapter 1' },
  { fa: 'کتاب ششم - فصل ۲', en: 'Book 6 - Chapter 2' },
  { fa: 'کتاب ششم - فصل ۳', en: 'Book 6 - Chapter 3' },
  { fa: 'کتاب ششم - فصل ۴', en: 'Book 6 - Chapter 4' },
  { fa: 'کتاب ششم - فصل ۵', en: 'Book 6 - Chapter 5' },
  { fa: 'کتاب هفتم - فصل ۱', en: 'Book 7 - Chapter 1' },
  { fa: 'کتاب هفتم - فصل ۲', en: 'Book 7 - Chapter 2' },
];

const SINGLE_TASKS: Task[] = [
  {
    taskId: 'mood_log',
    text: {
      fa: 'ثبت خلق و خو (۱ تا ۱۰)',
      en: 'Log your mood (1–10)',
    },
    type: 'checkbox',
  },
  {
    taskId: 'cbt_negative_thought',
    text: {
      fa: 'شناسایی یک فکر منفی',
      en: 'Identify one negative thought',
    },
    type: 'checkbox',
  },
  {
    taskId: 'deep_breathing',
    text: {
      fa: 'تمرین تنفس عمیق (۵ دقیقه)',
      en: '5 min deep breathing',
    },
    type: 'checkbox',
  },
  {
    taskId: 'enjoyable_activity',
    text: {
      fa: 'یک فعالیت لذت‌بخش',
      en: 'One enjoyable activity',
    },
    type: 'checkbox',
  },
  {
    taskId: 'positive_note',
    text: {
      fa: 'نوشتن یک نکته مثبت',
      en: 'Write one positive note',
    },
    type: 'text',
  },
];

function buildSingleData(): DayEntry[] {
  const result: DayEntry[] = [];

  for (let i = 0; i < 31; i++) {
    const ayah = AYAHS[i % AYAHS.length];
    const poem = POEMS[i % POEMS.length];
    const book = BOOKS[i % BOOKS.length];

    result.push({
      ayah: ayah.text,
      ayahRef: ayah.ref,
      poem: poem.text,
      poemPoet: poem.poet,
      book: book,
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
      book: {
        fa: 'کتاب مهارت‌های ارتباطی - فصل ۱',
        en: 'Communication Skills - Chapter 1',
      },
      tasks: [
        {
          taskId: 'dyad_mood_log',
          text: {
            fa: 'ثبت خلق‌وخو (هر دو نفر)',
            en: 'Log mood (both partners)',
          },
          type: 'checkbox',
        },
        {
          taskId: 'dyad_introduction',
          text: {
            fa: 'تمرین جفتی: معرفی و آشنایی',
            en: 'Pair exercise: introductions',
          },
          type: 'checkbox',
        },
        {
          taskId: 'dyad_positive_note',
          text: {
            fa: 'نوشتن یک نکته مثبت درباره شریک',
            en: 'Write one positive note about your partner',
          },
          type: 'text',
        },
        {
          taskId: 'dyad_conversation',
          text: {
            fa: 'گفتگوی ساختاریافته (۵ دقیقه)',
            en: '5 min structured conversation',
          },
          type: 'checkbox',
        },
        {
          taskId: 'dyad_shared_task',
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
      book: {
        fa: 'کتاب کار گروهی - فصل ۱',
        en: 'Group Work - Chapter 1',
      },
      tasks: [
        {
          taskId: 'group_mood_log',
          text: {
            fa: 'ثبت خلق‌وخو (میانگین گروه)',
            en: 'Log mood (group average)',
          },
          type: 'checkbox',
        },
        {
          taskId: 'group_introduction',
          text: {
            fa: 'تمرین گروهی: معرفی اعضا',
            en: 'Group exercise: introductions',
          },
          type: 'checkbox',
        },
        {
          taskId: 'group_feedback',
          text: {
            fa: 'نوشتن یک بازخورد برای گروه',
            en: 'Write one piece of feedback for the group',
          },
          type: 'text',
        },
        {
          taskId: 'group_discussion',
          text: {
            fa: 'بحث گروهی (۱۰ دقیقه)',
            en: '10 min group discussion',
          },
          type: 'checkbox',
        },
        {
          taskId: 'group_shared_task',
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
  return !!progress?.done || !!progress?.value?.trim();
}

function freshDayProgress(tasks: Task[]): DayProgress {
  return tasks.map(() => ({
    done: false,
    value: '',
    status: 'pending',
    difficulty: undefined,
    failureReason: null,
    bookProgress: 0,
  }));
}

function normalizeAIPlan(response: AIPlanResponse): AIPlanTask[] {
  if (Array.isArray(response.today_plan)) {
    return response.today_plan;
  }
  if (Array.isArray(response.final_plan)) {
    return response.final_plan;
  }
  if (Array.isArray(response.plan)) {
    return response.plan;
  }
  return [];
}

function humanizeTaskId(taskId: string, fa: boolean): string {
  const normalized = taskId
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const dictionary: Record<string, Bilingual> = {
    hypno_pmr: {
      fa: 'آرام‌سازی عضلانی پیشرونده',
      en: 'Progressive muscle relaxation',
    },
    gestalt_body_awareness: {
      fa: 'تمرین آگاهی از بدن',
      en: 'Gestalt body awareness',
    },
    cbt_graded_task: {
      fa: 'تمرین تدریجی شناختی رفتاری',
      en: 'CBT graded task',
    },
    cbt_thought_record: {
      fa: 'ثبت و بررسی افکار',
      en: 'CBT thought record',
    },
    hypno_safe_place: {
      fa: 'تمرین مکان امن',
      en: 'Safe place visualization',
    },
    mood_log: {
      fa: 'ثبت خلق و خو',
      en: 'Mood log',
    },
    deep_breathing: {
      fa: 'تنفس عمیق',
      en: 'Deep breathing',
    },
  };

  if (dictionary[taskId]) {
    return fa ? dictionary[taskId].fa : dictionary[taskId].en;
  }

  if (!normalized) {
    return fa ? 'فعالیت پیشنهادی' : 'Recommended activity';
  }

  return normalized
    .split(' ')
    .map(word =>
      word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word,
    )
    .join(' ');
}

export default function ProtocolScreen() {
  const router = useRouter();

  const { colors, isDark, isAthlete } = useTheme();
  const { language } = useLanguage();

  const fa = language === 'fa';

  const textDirection = fa ? 'rtl' : 'ltr';
  const textAlign = fa ? 'right' : 'left';
  const rowDirection = fa ? 'row-reverse' : 'row';
  const contentAlign = fa ? 'flex-end' : 'flex-start';

  const getAccent = () => {
    if (isAthlete) return '#22C55E';
    if (isDark) return 'rgba(73, 194, 226, 1)';
    return colors.primary;
  };

  const getAccentStrong = () => {
    if (isAthlete) return '#22C55E';
    if (isDark) return 'rgba(73, 194, 226, 1)';
    return colors.primaryDark || colors.primary;
  };

  const getSoftAccent = () => {
    if (isAthlete) return 'rgba(34,197,94,0.18)';
    if (isDark) return 'rgba(73,194,226,0.18)';
    return `${colors.primary}12`;
  };

  const getSoftAccentStrong = () => {
    if (isAthlete) return 'rgba(34,197,94,0.28)';
    if (isDark) return 'rgba(73,194,226,0.28)';
    return `${colors.primary}18`;
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
  const [aiPlan, setAiPlan] = useState<AIPlanTask[]>([]);
  const [aiWeights, setAiWeights] = useState<Partial<TheoryWeights> | null>(null);
  const [isAIPlanLoading, setIsAIPlanLoading] = useState(false);
  const [aiPlanError, setAiPlanError] = useState(false);
  const [aiPlanSource, setAiPlanSource] = useState<'ai' | 'local' | null>(null);

  const data = useMemo(() => getData(mode), [mode]);
  const totalDays = getTotalDays(mode);
  const currentEntry = data[currentDay];

  const getDayProgress = useCallback(
    (dayIndex: number): DayProgress => {
      return progress[dayIndex] ?? freshDayProgress(data[dayIndex]?.tasks ?? []);
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

  const getBookProgress = useCallback(
    (dayIndex: number): number => {
      const dayProgress = getDayProgress(dayIndex);
      // از اولین آیتم (یا هر آیتمی) درصد مطالعه کتاب را می‌گیریم
      // فرض می‌کنیم همه آیتم‌ها bookProgress یکسانی دارند
      return dayProgress[0]?.bookProgress ?? 0;
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
      (_, index) => getDayPercent(index) === 100 && getBookProgress(index) >= 100,
    ).filter(Boolean).length;
  }, [totalDays, getDayPercent, getBookProgress]);

  const overallPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  const getUserId = useCallback(async (): Promise<string> => {
    try {
      const existing = await AsyncStorage.getItem(USER_ID_STORAGE_KEY);
      if (existing) return existing;
      const generated = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await AsyncStorage.setItem(USER_ID_STORAGE_KEY, generated);
      return generated;
    } catch {
      return 'anonymous_user';
    }
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY(mode));
      if (raw) {
        const parsed = JSON.parse(raw);
        // اطمینان از وجود bookProgress برای همه آیتم‌ها
        const normalized: Progress = {};
        Object.entries(parsed).forEach(([key, value]) => {
          const dayProgress = value as DayProgress;
          normalized[Number(key)] = dayProgress.map(item => ({
            ...item,
            bookProgress: item.bookProgress ?? 0,
          }));
        });
        setProgress(normalized);
      } else {
        setProgress({});
      }
    } catch (error) {
      console.log('[Protocol] Failed to load progress:', error);
      setProgress({});
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.setItem(STORAGE_KEY(mode), JSON.stringify(progress)).catch(error => {
      console.log('[Protocol] Failed to save progress:', error);
    });
  }, [progress, mode, isLoading]);

  const calculatePlannerStats = useCallback(() => {
    const allResults: Array<{
      task_id: string;
      status: 'completed' | 'failed' | 'skipped';
      difficulty_reported?: number;
      failure_reason?: string | null;
    }> = [];

    Object.entries(progress).forEach(([dayIndex, dayProgress]) => {
      const tasks = data[Number(dayIndex)]?.tasks ?? [];
      dayProgress.forEach((item, taskIndex) => {
        const task = tasks[taskIndex];
        if (!task) return;
        const taskId = task.taskId || `task_${taskIndex}`;
        if (item.status && item.status !== 'pending') {
          allResults.push({
            task_id: taskId,
            status: item.status,
            difficulty_reported: item.difficulty,
            failure_reason: item.failureReason,
          });
        }
      });
    });

    const total = allResults.length;
    const completed = allResults.filter(item => item.status === 'completed').length;
    const failed = allResults.filter(item => item.status === 'failed').length;
    const skipped = allResults.filter(item => item.status === 'skipped').length;

    const difficulties = allResults
      .map(item => item.difficulty_reported)
      .filter((value): value is number => typeof value === 'number' && value >= 0);

    const avgDiff = difficulties.length
      ? difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length
      : 0;

    const adherence = total > 0 ? completed / total : 0;

    const previousDayProgress = progress[currentDay - 1];
    const previousTasks = data[currentDay - 1]?.tasks ?? [];
    const yesterdayFailedTasks = previousDayProgress
      ? previousDayProgress
          .map((item, index) => {
            if (item.status === 'failed') {
              return previousTasks[index]?.taskId || `task_${index}`;
            }
            return null;
          })
          .filter((value): value is string => !!value)
      : [];

    const failureReasons = allResults
      .map(item => item.failure_reason)
      .filter((value): value is string => !!value);

    const reasonCount: Record<string, number> = {};
    failureReasons.forEach(reason => {
      reasonCount[reason] = (reasonCount[reason] || 0) + 1;
    });

    const dominantFailureReason = Object.keys(reasonCount).sort(
      (a, b) => reasonCount[b] - reasonCount[a],
    )[0] || null;

    return {
      allResults,
      total,
      completed,
      failed,
      skipped,
      adherence,
      avgDiff,
      yesterdayFailedTasks,
      dominantFailureReason,
    };
  }, [progress, data, currentDay]);

  const buildPlannerPayload = useCallback(async (): Promise<AIPlannerPayload> => {
    const userId = await getUserId();
    const stats = calculatePlannerStats();

    const moodScore = 5;
    const stressLevel = 5;
    const clinicalTags: string[] = [];
    const resistanceLevel = 'medium';
    const theme = 'general';

    return {
      user_id: userId,
      day: currentDay + 1,
      mode,
      theme,
      resistance_level: resistanceLevel,
      mood_score: moodScore,
      stress_level: stressLevel,
      cumulative_adherence_rate: stats.adherence,
      dominant_failure_reason: stats.dominantFailureReason,
      yesterday_failed_tasks: stats.yesterdayFailedTasks,
      clinical_tags: clinicalTags,
      completed_ratio: stats.total > 0 ? stats.completed / stats.total : 0,
      failed_ratio: stats.total > 0 ? stats.failed / stats.total : 0,
      skipped_ratio: stats.total > 0 ? stats.skipped / stats.total : 0,
      avg_diff: stats.avgDiff,
      daily_task_results: stats.allResults,
    };
  }, [getUserId, calculatePlannerStats, currentDay, mode]);

  const saveAIPlan = useCallback(
    async (response: AIPlanResponse) => {
      const stored: StoredAIPlan = {
        date: new Date().toISOString(),
        day: currentDay + 1,
        mode,
        response,
      };
      await AsyncStorage.setItem(AI_PLAN_STORAGE_KEY(mode, currentDay), JSON.stringify(stored));
    },
    [currentDay, mode],
  );

  const loadStoredAIPlan = useCallback(async (): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(AI_PLAN_STORAGE_KEY(mode, currentDay));
      if (!raw) return false;
      const stored: StoredAIPlan = JSON.parse(raw);
      if (stored.mode !== mode || stored.day !== currentDay + 1) return false;
      const plan = normalizeAIPlan(stored.response);
      setAiPlan(plan);
      setAiWeights(stored.response?.theory_weights || null);
      setAiPlanSource(plan.length ? 'ai' : null);
      return plan.length > 0;
    } catch (error) {
      console.log('[Protocol] Failed to load AI plan:', error);
      return false;
    }
  }, [mode, currentDay]);

  const generateLocalAIPlan = useCallback(() => {
    const localPlan: AIPlanTask[] = [
      { task_id: 'deep_breathing', duration_minutes: 5, confidence: 0.7 },
      { task_id: 'cbt_negative_thought', duration_minutes: 7, confidence: 0.62 },
      { task_id: 'positive_note', duration_minutes: 3, confidence: 0.58 },
    ];
    setAiPlan(localPlan);
    setAiWeights({ CBT: 40, Gestalt: 25, Hypnotherapy: 35 });
    setAiPlanSource('local');
  }, []);

  const fetchAIPlan = useCallback(
    async (force = false) => {
      setIsAIPlanLoading(true);
      setAiPlanError(false);

      try {
        if (!force) {
          const loaded = await loadStoredAIPlan();
          if (loaded) {
            setIsAIPlanLoading(false);
            return;
          }
        }

        if (!PROTOCOL_AI_URL) {
          generateLocalAIPlan();
          setIsAIPlanLoading(false);
          return;
        }

        const payload = await buildPlannerPayload();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
          const response = await fetch(PROTOCOL_AI_URL + '/recommend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-API-Key': API_KEY,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!response.ok) {
            throw new Error(`Planner API returned ${response.status}`);
          }

          const result: AIPlanResponse = await response.json();
          const normalized = normalizeAIPlan(result);

          if (!normalized.length) {
            throw new Error('AI planner returned an empty plan');
          }

          setAiPlan(normalized);
          setAiWeights(result.theory_weights || null);
          setAiPlanSource('ai');
          await saveAIPlan(result);
        } catch (error) {
          clearTimeout(timeout);
          throw error;
        }
      } catch (error) {
        console.log('[Protocol] AI planner unavailable:', error);
        setAiPlanError(true);
        generateLocalAIPlan();
      } finally {
        setIsAIPlanLoading(false);
      }
    },
    [loadStoredAIPlan, generateLocalAIPlan, buildPlannerPayload, saveAIPlan],
  );

  useEffect(() => {
    if (isLoading || view !== 'home') return;
    fetchAIPlan();
  }, [currentDay, mode, isLoading, view, fetchAIPlan]);

  const lightHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const successHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, []);

  const handleBack = useCallback(() => {
    lightHaptic();
    if (view === 'day' || view === 'report') {
      setView('home');
      return;
    }
    router.back();
  }, [view, lightHaptic, router]);

  const changeMode = useCallback(
    (nextMode: ProtocolMode) => {
      if (nextMode === mode) return;
      lightHaptic();
      setMode(nextMode);
      setView('home');
      setCurrentDay(0);
      setSelectedTask(null);
      setAiPlan([]);
      setAiWeights(null);
      setAiPlanSource(null);
    },
    [mode, lightHaptic],
  );

  const openDay = useCallback(
    (dayIndex: number) => {
      lightHaptic();
      setCurrentDay(Math.max(0, Math.min(dayIndex, totalDays - 1)));
      setView('day');
      setSelectedTask(null);
    },
    [lightHaptic, totalDays],
  );

  const updateTaskStatus = useCallback(
    (taskIndex: number, status: 'completed' | 'failed' | 'skipped') => {
      setProgress(prev => {
        const current = prev[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
        const updated = [...current];
        updated[taskIndex] = {
          ...updated[taskIndex],
          done: status === 'completed',
          status,
        };
        return { ...prev, [currentDay]: updated };
      });
    },
    [currentDay, currentEntry],
  );

  const toggleTask = useCallback(
    (taskIndex: number) => {
      lightHaptic();
      setProgress(prev => {
        const current = prev[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
        const updated = [...current];
        const currentItem = updated[taskIndex];
        const nextDone = !currentItem?.done;
        updated[taskIndex] = {
          ...currentItem,
          done: nextDone,
          status: nextDone ? 'completed' : 'pending',
          failureReason: nextDone ? null : currentItem?.failureReason,
        };
        return { ...prev, [currentDay]: updated };
      });
    },
    [currentDay, currentEntry, lightHaptic],
  );

  const updateTextTask = useCallback(
    (taskIndex: number, value: string) => {
      setProgress(prev => {
        const current = prev[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
        const updated = [...current];
        updated[taskIndex] = {
          ...updated[taskIndex],
          value,
          done: value.trim().length > 0,
          status: value.trim().length > 0 ? 'completed' : 'pending',
        };
        return { ...prev, [currentDay]: updated };
      });
    },
    [currentDay, currentEntry],
  );

  const updateBookProgress = useCallback(
    (value: number) => {
      const clampedValue = Math.max(0, Math.min(100, value));
      setProgress(prev => {
        const current = prev[currentDay] ?? freshDayProgress(currentEntry?.tasks ?? []);
        const updated = current.map(item => ({
          ...item,
          bookProgress: clampedValue,
        }));
        return { ...prev, [currentDay]: updated };
      });
    },
    [currentDay, currentEntry],
  );

  const completeDay = useCallback(() => {
    const tasks = currentEntry?.tasks ?? [];
    if (!tasks.length) return;

    const current = getDayProgress(currentDay);
    const allDone = current.every(item => isTaskDone(item));
    const bookProgress = getBookProgress(currentDay);

    if (!allDone || bookProgress < 100) {
      lightHaptic();
      return;
    }

    successHaptic();

    setProgress(prev => ({
      ...prev,
      [currentDay]: current.map(item => ({ ...item, done: true, status: 'completed' })),
    }));

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2200);
  }, [currentEntry, getDayProgress, getBookProgress, currentDay, lightHaptic, successHaptic]);

  const previousDay = useCallback(() => {
    if (currentDay <= 0) return;
    lightHaptic();
    setCurrentDay(currentDay - 1);
    setSelectedTask(null);
  }, [currentDay, lightHaptic]);

  const nextDay = useCallback(() => {
    if (currentDay >= totalDays - 1) return;
    lightHaptic();
    setCurrentDay(currentDay + 1);
    setSelectedTask(null);
  }, [currentDay, totalDays, lightHaptic]);

  const resetProtocol = useCallback(async () => {
    lightHaptic();
    try {
      await AsyncStorage.removeItem(STORAGE_KEY(mode));
      await AsyncStorage.removeItem(AI_PLAN_STORAGE_KEY(mode, currentDay));
      setProgress({});
      setAiPlan([]);
      setAiWeights(null);
      setAiPlanSource(null);
      setCurrentDay(0);
      setView('home');
      setSelectedTask(null);
    } catch (error) {
      console.log('[Protocol] Failed to reset:', error);
    }
  }, [lightHaptic, mode, currentDay]);

  const tr = useCallback((value?: Bilingual) => {
    if (!value) return '';
    return fa ? value.fa : value.en;
  }, [fa]);

  const getModeTitle = useCallback((protocolMode: ProtocolMode) => {
    if (protocolMode === 'single') return fa ? 'برنامه فردی' : 'Individual';
    if (protocolMode === 'dyad') return fa ? 'برنامه دونفره' : 'Two-person';
    return fa ? 'برنامه گروهی' : 'Group';
  }, [fa]);

  const getModeDescription = useCallback((protocolMode: ProtocolMode) => {
    if (protocolMode === 'single') {
      return fa
        ? 'تمرین‌های روزانه برای رشد و آرامش ذهن'
        : 'Daily exercises for cognitive and emotional growth';
    }
    if (protocolMode === 'dyad') {
      return fa ? 'تمرین‌های مشترک برای دو نفر' : 'Shared exercises for two people';
    }
    return fa ? 'تمرین‌های مشارکتی برای یک گروه' : 'Collaborative exercises for a group';
  }, [fa]);

  const getModeIcon = useCallback((protocolMode: ProtocolMode) => {
    if (protocolMode === 'single') return Brain;
    if (protocolMode === 'dyad') return Users;
    return UsersRound;
  }, []);

  const getDayLabel = useCallback((index: number) => {
    if (mode === 'single') {
      return fa ? `روز ${index + 1}` : `Day ${index + 1}`;
    }
    return fa ? `جلسه ${index + 1}` : `Session ${index + 1}`;
  }, [mode, fa]);

  const currentDayPercent = getDayPercent(currentDay);
  const currentCompletedTasks = getCompletedTasks(currentDay);
  const currentTotalTasks = currentEntry?.tasks?.length ?? 0;
  const currentBookProgress = getBookProgress(currentDay);

  // ============================================================
  // renderPageHeader - Back button only in day/report
  // ============================================================

  const renderPageHeader = (title: string, subtitle: string) => (
    <View
      style={[
        styles.pageHeader,
        {
          backgroundColor: background,
        },
      ]}
    >
      {view !== 'home' ? (
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
          <ArrowLeft
            size={21}
            color={colors.text}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSidePlaceholder} />
      )}

      <View style={styles.headerTitleContainer}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              textAlign: 'center',
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
              textAlign: 'center',
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

  // ============================================================
  // renderDayNavigation - Fixed direction for arrows
  // ============================================================

  const renderDayNavigation = () => {
    return (
      <View
        style={[
          styles.dayNavigation,
          {
            flexDirection: 'row',
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
                textAlign: 'center',
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
  };

  // ============================================================
  // renderBookProgress - Component for book progress
  // ============================================================

  const renderBookProgress = () => {
    const book = currentEntry?.book;
    if (!book) return null;

    return (
      <View
        style={[
          styles.bookProgressCard,
          {
            backgroundColor: card,
            borderColor: softBorder,
          },
        ]}
      >
        <View
          style={[
            styles.bookProgressHeader,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          <View
            style={[
              styles.bookProgressIcon,
              {
                backgroundColor: softAccent,
              },
            ]}
          >
            <Book size={18} color={accent} strokeWidth={2} />
          </View>

          <View
            style={[
              styles.bookProgressContent,
              {
                alignItems: contentAlign,
              },
            ]}
          >
            <Text
              style={[
                styles.bookProgressTitle,
                {
                  color: colors.text,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {fa ? 'مطالعه کتاب' : 'Book Reading'}
            </Text>

            <Text
              style={[
                styles.bookProgressSubtitle,
                {
                  color: colors.textSecondary || `${colors.text}80`,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {tr(book)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.bookProgressRow,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          <View style={styles.bookProgressSliderContainer}>
            <View
              style={[
                styles.bookProgressTrack,
                {
                  backgroundColor: progressTrack,
                },
              ]}
            >
              <View
                style={[
                  styles.bookProgressFill,
                  {
                    width: `${currentBookProgress}%`,
                    backgroundColor: accent,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.bookProgressLabels,
                {
                  flexDirection: rowDirection,
                },
              ]}
            >
              <Text
                style={[
                  styles.bookProgressLabel,
                  {
                    color: colors.textSecondary || `${colors.text}60`,
                  },
                ]}
              >
                0%
              </Text>

              <Text
                style={[
                  styles.bookProgressLabel,
                  {
                    color: colors.textSecondary || `${colors.text}60`,
                  },
                ]}
              >
                50%
              </Text>

              <Text
                style={[
                  styles.bookProgressLabel,
                  {
                    color: colors.textSecondary || `${colors.text}60`,
                  },
                ]}
              >
                100%
              </Text>
            </View>
          </View>

          <View style={styles.bookProgressInputContainer}>
            <TextInput
              value={String(currentBookProgress)}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num)) {
                  updateBookProgress(num);
                }
              }}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary || `${colors.text}40`}
              style={[
                styles.bookProgressInput,
                {
                  color: colors.text,
                  backgroundColor: cardSecondary,
                  borderColor: softBorder,
                  textAlign: 'center',
                },
              ]}
            />
            <Text
              style={[
                styles.bookProgressPercent,
                {
                  color: colors.textSecondary || `${colors.text}60`,
                },
              ]}
            >
              %
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (currentBookProgress < 100) {
                  updateBookProgress(currentBookProgress + 10);
                  lightHaptic();
                }
              }}
              style={[
                styles.bookProgressPlusButton,
                {
                  backgroundColor: softAccent,
                },
              ]}
            >
              <Text
                style={[
                  styles.bookProgressPlusText,
                  {
                    color: accent,
                  },
                ]}
              >
                +10%
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.bookProgressStatus,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          <View
            style={[
              styles.bookProgressStatusBadge,
              {
                backgroundColor: currentBookProgress >= 100 ? softAccentStrong : cardSecondary,
              },
            ]}
          >
            {currentBookProgress >= 100 ? (
              <Check size={14} color={accent} strokeWidth={2.5} />
            ) : (
              <Percent size={14} color={colors.textSecondary || `${colors.text}50`} strokeWidth={2} />
            )}
            <Text
              style={[
                styles.bookProgressStatusText,
                {
                  color: currentBookProgress >= 100 ? accent : colors.textSecondary || `${colors.text}60`,
                },
              ]}
            >
              {currentBookProgress >= 100
                ? fa ? 'تکمیل شده' : 'Completed'
                : fa
                ? `${currentBookProgress}% مطالعه شده`
                : `${currentBookProgress}% read`}
            </Text>
          </View>

          {currentBookProgress < 100 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                updateBookProgress(100);
                successHaptic();
              }}
              style={[
                styles.bookProgressCompleteButton,
                {
                  backgroundColor: softAccent,
                },
              ]}
            >
              <Check size={14} color={accent} strokeWidth={2.5} />
              <Text
                style={[
                  styles.bookProgressCompleteText,
                  {
                    color: accent,
                  },
                ]}
              >
                {fa ? 'تکمیل شد' : 'Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderModeCard = (protocolMode: ProtocolMode) => {
    const Icon = getModeIcon(protocolMode);
    const active = mode === protocolMode;

    return (
      <TouchableOpacity
        key={protocolMode}
        activeOpacity={0.82}
        onPress={() => changeMode(protocolMode)}
        style={[
          styles.modeCard,
          {
            backgroundColor: active ? softAccentStrong : card,
            borderColor: active ? accent : softBorder,
          },
        ]}
      >
        <View
          style={[
            styles.modeIcon,
            {
              backgroundColor: active ? accent : cardSecondary,
            },
          ]}
        >
          <Icon
            size={21}
            color={active ? colors.background : accent}
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
              color: colors.textSecondary || `${colors.text}80`,
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
                backgroundColor: accent,
                right: fa ? undefined : 8,
                left: fa ? 8 : undefined,
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
    const bookProgress = getBookProgress(dayIndex);
    const completed = getCompletedTasks(dayIndex);
    const total = data[dayIndex]?.tasks?.length ?? 0;
    const completedDay = percent === 100 && bookProgress >= 100;

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
                  color: colors.textSecondary || `${colors.text}80`,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {fa
                ? `${completed} از ${total} فعالیت | کتاب ${bookProgress}%`
                : `${completed} of ${total} activities | Book ${bookProgress}%`}
            </Text>
          </View>

          <View
            style={[
              styles.dayPercent,
              {
                backgroundColor: completedDay ? softAccentStrong : cardSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.dayPercentText,
                {
                  color: completedDay ? accent : colors.textSecondary || `${colors.text}60`,
                },
              ]}
            >
              {Math.round((percent + bookProgress) / 2)}%
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
                width: `${Math.round((percent + bookProgress) / 2)}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderAIPlanCard = () => {
    if (isAIPlanLoading) {
      return (
        <View
          style={[
            styles.aiLoadingCard,
            {
              backgroundColor: softAccent,
              borderColor: softBorder,
            },
          ]}
        >
          <ActivityIndicator size="small" color={accent} />

          <View style={styles.aiLoadingContent}>
            <Text
              style={[
                styles.aiLoadingTitle,
                {
                  color: colors.text,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {fa ? 'در حال تنظیم برنامه هوشمند...' : 'Building your smart plan...'}
            </Text>

            <Text
              style={[
                styles.aiLoadingSubtitle,
                {
                  color: colors.textSecondary || `${colors.text}80`,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {fa
                ? 'برنامه بر اساس عملکرد شما تنظیم می‌شود.'
                : 'Your plan is being adapted to your performance.'}
            </Text>
          </View>
        </View>
      );
    }

    if (!aiPlan.length) return null;

    return (
      <View
        style={[
          styles.aiPlanCard,
          {
            backgroundColor: card,
            borderColor: accent,
          },
        ]}
      >
        <View
          style={[
            styles.aiPlanHeader,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          <View
            style={[
              styles.aiPlanIcon,
              {
                backgroundColor: softAccentStrong,
              },
            ]}
          >
            <Sparkles size={20} color={accent} strokeWidth={2.2} />
          </View>

          <View
            style={[
              styles.aiPlanHeaderContent,
              {
                alignItems: contentAlign,
              },
            ]}
          >
            <Text
              style={[
                styles.aiPlanTitle,
                {
                  color: colors.text,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {fa ? 'برنامه هوشمند امروز' : "Today's AI plan"}
            </Text>

            <Text
              style={[
                styles.aiPlanSubtitle,
                {
                  color: colors.textSecondary || `${colors.text}80`,
                  textAlign,
                  writingDirection: textDirection,
                },
              ]}
            >
              {aiPlanSource === 'ai'
                ? fa
                  ? 'تنظیم‌شده بر اساس عملکرد شما'
                  : 'Personalized from your performance'
                : fa
                ? 'برنامه پیشنهادی محلی'
                : 'Local recommended plan'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => fetchAIPlan(true)}
            activeOpacity={0.75}
            style={[
              styles.aiRefreshButton,
              {
                backgroundColor: softAccent,
              },
            ]}
          >
            <RefreshCw size={17} color={accent} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {aiWeights && (
          <View
            style={[
              styles.aiWeightsRow,
              {
                flexDirection: rowDirection,
              },
            ]}
          >
            <View style={styles.aiWeightItem}>
              <Text
                style={[
                  styles.aiWeightValue,
                  {
                    color: accent,
                  },
                ]}
              >
                {Math.round(aiWeights.CBT || 0)}%
              </Text>

              <Text
                style={[
                  styles.aiWeightLabel,
                  {
                    color: colors.textSecondary || `${colors.text}70`,
                  },
                ]}
              >
                CBT
              </Text>
            </View>

            <View style={styles.aiWeightItem}>
              <Text
                style={[
                  styles.aiWeightValue,
                  {
                    color: accent,
                  },
                ]}
              >
                {Math.round(aiWeights.Gestalt || 0)}%
              </Text>

              <Text
                style={[
                  styles.aiWeightLabel,
                  {
                    color: colors.textSecondary || `${colors.text}70`,
                  },
                ]}
              >
                Gestalt
              </Text>
            </View>

            <View style={styles.aiWeightItem}>
              <Text
                style={[
                  styles.aiWeightValue,
                  {
                    color: accent,
                  },
                ]}
              >
                {Math.round(aiWeights.Hypnotherapy || 0)}%
              </Text>

              <Text
                style={[
                  styles.aiWeightLabel,
                  {
                    color: colors.textSecondary || `${colors.text}70`,
                  },
                ]}
              >
                Hypno
              </Text>
            </View>
          </View>
        )}

        <View style={styles.aiPlanTasks}>
          {aiPlan.map((planTask, index) => (
            <View
              key={`${planTask.task_id}-${index}`}
              style={[
                styles.aiPlanTask,
                {
                  flexDirection: rowDirection,
                  backgroundColor: softAccent,
                },
              ]}
            >
              <View
                style={[
                  styles.aiPlanTaskNumber,
                  {
                    backgroundColor: accent,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.aiPlanTaskNumberText,
                    {
                      color: colors.background,
                    },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>

              <View
                style={[
                  styles.aiPlanTaskContent,
                  {
                    alignItems: contentAlign,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.aiPlanTaskTitle,
                    {
                      color: colors.text,
                      textAlign,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {humanizeTaskId(planTask.task_id, fa)}
                </Text>

                <View
                style={[
                  styles.aiPlanTaskMeta,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <Clock3 size={13} color={colors.textSecondary || `${colors.text}70`} />

                <Text
                  style={[
                    styles.aiPlanTaskMetaText,
                    {
                      color: colors.textSecondary || `${colors.text}70`,
                    },
                  ]}
                >
                  {fa
                    ? `${planTask.duration_minutes} دقیقه`
                    : `${planTask.duration_minutes} min`}
                </Text>

                {typeof planTask.confidence === 'number' && (
                  <Text
                    style={[
                      styles.aiPlanTaskConfidence,
                      {
                        color: accent,
                      },
                    ]}
                  >
                    {Math.round(planTask.confidence * 100)}%
                  </Text>
                )}
              </View>
            </View>

            <Zap size={16} color={accent} strokeWidth={2.2} />
          </View>
          ))}
        </View>
      </View>
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
              color: colors.textSecondary || `${colors.text}80`,
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
    <View
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
                  backgroundColor: isDark ? 'rgba(73,194,226,0.12)' : '#F0F4FF',
                  borderColor: isDark ? 'rgba(73,194,226,0.20)' : '#D0D9E8',
                },
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.heroGlowOne,
                  {
                    backgroundColor: isDark ? 'rgba(73,194,226,0.08)' : 'rgba(73,194,226,0.10)',
                  },
                ]}
              />

              <View
                pointerEvents="none"
                style={[
                  styles.heroGlowTwo,
                  {
                    backgroundColor: isDark ? 'rgba(73,194,226,0.05)' : 'rgba(73,194,226,0.06)',
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
                        backgroundColor: isDark ? 'rgba(73,194,226,0.20)' : 'rgba(73,194,226,0.15)',
                        flexDirection: rowDirection,
                      },
                    ]}
                  >
                    <Sparkles
                      size={14}
                      color={isAthlete ? '#22C55E' : 'rgba(73,194,226,1)'}
                      strokeWidth={2.2}
                    />

                    <Text
                      style={[
                        styles.heroBadgeText,
                        {
                          color: isAthlete
                            ? '#22C55E'
                            : isDark
                            ? 'rgba(73,194,226,1)'
                            : '#1A1A1A',
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
                        color: isDark ? colors.text : '#1A1A1A',
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
                        color: isDark ? colors.textSecondary : 'rgba(0,0,0,0.65)',
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
                    backgroundColor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(73,194,226,0.10)',
                    borderColor: 'rgba(73,194,226,0.20)',
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
                          color: isDark ? colors.textSecondary : 'rgba(0,0,0,0.70)',
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
                          color: isDark ? colors.textTertiary : 'rgba(0,0,0,0.50)',
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
                        color: isAthlete ? '#22C55E' : isDark ? colors.text : '#1A1A1A',
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
                      backgroundColor: 'rgba(73,194,226,0.15)',
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
                        backgroundColor: isAthlete ? '#22C55E' : 'rgba(73,194,226,1)',
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
                      borderColor: 'rgba(73,194,226,0.20)',
                    },
                  ]}
                >
                  <Target size={17} color={isAthlete ? '#22C55E' : 'rgba(73,194,226,1)'} strokeWidth={2} />

                  <View
                    style={{
                      alignItems: contentAlign,
                    }}
                  >
                    <Text
                      style={[
                        styles.heroStatValue,
                        {
                          color: isDark ? colors.text : '#1A1A1A',
                        },
                      ]}
                    >
                      {totalDays}
                    </Text>

                    <Text
                      style={[
                        styles.heroStatLabel,
                        {
                          color: isDark ? colors.textSecondary : 'rgba(0,0,0,0.55)',
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
                      borderColor: 'rgba(73,194,226,0.20)',
                    },
                  ]}
                >
                  <CheckCircle2
                    size={17}
                    color={isAthlete ? '#22C55E' : 'rgba(73,194,226,1)'}
                    strokeWidth={2}
                  />

                  <View
                    style={{
                      alignItems: contentAlign,
                    }}
                  >
                    <Text
                      style={[
                        styles.heroStatValue,
                        {
                          color: isDark ? colors.text : '#1A1A1A',
                        },
                      ]}
                    >
                      {completedDays}
                    </Text>

                    <Text
                      style={[
                        styles.heroStatLabel,
                        {
                          color: isDark ? colors.textSecondary : 'rgba(0,0,0,0.55)',
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
                    {fa ? 'برنامه هوشمند' : 'Smart plan'}
                  </Text>

                  <Text
                    style={[
                      styles.sectionSubtitle,
                      {
                        color: colors.textSecondary || `${colors.text}80`,
                        textAlign,
                        writingDirection: textDirection,
                      },
                    ]}
                  >
                    {fa ? 'برنامه بر اساس عملکرد شما' : 'Adapted to your performance'}
                  </Text>
                </View>

                {aiPlanError && (
                  <View
                    style={[
                      styles.aiWarning,
                      {
                        backgroundColor: 'rgba(245,158,11,0.12)',
                      },
                    ]}
                  >
                    <AlertCircle size={15} color="#F59E0B" />

                    <Text
                      style={[
                        styles.aiWarningText,
                        {
                          color: '#F59E0B',
                        },
                      ]}
                    >
                      {fa ? 'حالت محلی' : 'Local mode'}
                    </Text>
                  </View>
                )}
              </View>

              {renderAIPlanCard()}
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
                        color: colors.textSecondary || `${colors.text}80`,
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
                      {Math.round((currentDayPercent + currentBookProgress) / 2)}%
                    </Text>

                    <Text
                      style={[
                        styles.circularProgressLabel,
                        {
                          color: colors.textSecondary || `${colors.text}80`,
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
                          color: colors.textSecondary || `${colors.text}80`,
                          textAlign,
                          writingDirection: textDirection,
                        },
                      ]}
                    >
                      {fa
                        ? `${currentCompletedTasks} از ${currentTotalTasks} فعالیت | کتاب ${currentBookProgress}%`
                        : `${currentCompletedTasks} of ${currentTotalTasks} activities | Book ${currentBookProgress}%`}
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
                            width: `${Math.round((currentDayPercent + currentBookProgress) / 2)}%`,
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
                        color: colors.textSecondary || `${colors.text}80`,
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
                          color: done ? colors.textSecondary || `${colors.text}80` : colors.text,
                          textAlign,
                          writingDirection: textDirection,
                          textDecorationLine: done ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {tr(task.text)}
                    </Text>

                    <ChevronRight
                      size={18}
                      color={colors.textTertiary || `${colors.text}40`}
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
                  ? fa
                    ? 'روزهای پروتکل'
                    : 'Protocol days'
                  : fa
                  ? 'جلسات پروتکل'
                  : 'Protocol sessions'}
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
              <RotateCcw
                size={17}
                color={colors.textSecondary || `${colors.text}60`}
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.resetButtonText,
                  {
                    color: colors.textSecondary || `${colors.text}60`,
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
            {renderPageHeader(getDayLabel(currentDay), getModeTitle(mode))}

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
                        color: colors.textSecondary || `${colors.text}80`,
                      },
                    ]}
                  >
                    {fa
                      ? `${currentCompletedTasks} از ${currentTotalTasks} فعالیت | کتاب ${currentBookProgress}%`
                      : `${currentCompletedTasks} of ${currentTotalTasks} activities | Book ${currentBookProgress}%`}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.dayProgressPercent,
                    {
                      color: accent,
                    },
                  ]}
                >
                  {Math.round((currentDayPercent + currentBookProgress) / 2)}%
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
                      width: `${Math.round((currentDayPercent + currentBookProgress) / 2)}%`,
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
                      textAlign: 'center',
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
                        textAlign: 'center',
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
                    alignItems: 'center',
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
                          textAlign: 'center',
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
                            color: colors.textSecondary || `${colors.text}80`,
                            textAlign: 'center',
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
                      textAlign: 'center',
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {currentEntry.poem}
                </Text>
              </View>
            )}

            {renderBookProgress()}

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
                        color={colors.textSecondary || `${colors.text}60`}
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
                            placeholderTextColor={colors.textTertiary || `${colors.text}40`}
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
                                ? fa
                                  ? 'انجام شد'
                                  : 'Completed'
                                : fa
                                ? 'انجام دادم'
                                : 'Mark complete'}
                            </Text>
                          </TouchableOpacity>
                        )}

                        <View
                          style={[
                            styles.taskFeedbackRow,
                            {
                              flexDirection: rowDirection,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() => updateTaskStatus(index, 'failed')}
                            style={[
                              styles.feedbackButton,
                              {
                                borderColor: 'rgba(239,68,68,0.25)',
                                backgroundColor: 'rgba(239,68,68,0.08)',
                              },
                            ]}
                          >
                            <AlertCircle size={15} color="#EF4444" />

                            <Text
                              style={[
                                styles.feedbackButtonText,
                                {
                                  color: '#EF4444',
                                },
                              ]}
                            >
                              {fa ? 'سخت بود' : 'Difficult'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => updateTaskStatus(index, 'skipped')}
                            style={[
                              styles.feedbackButton,
                              {
                                borderColor: softBorder,
                                backgroundColor: cardSecondary,
                              },
                            ]}
                          >
                            <Activity size={15} color={colors.textSecondary || colors.text} />

                            <Text
                              style={[
                                styles.feedbackButtonText,
                                {
                                  color: colors.textSecondary || colors.text,
                                },
                              ]}
                            >
                              {fa ? 'رد شد' : 'Skipped'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => toggleTask(index)}
                            style={[
                              styles.feedbackButton,
                              {
                                borderColor: softBorder,
                                backgroundColor: softAccent,
                              },
                            ]}
                          >
                            <Check size={15} color={accent} />

                            <Text
                              style={[
                                styles.feedbackButtonText,
                                {
                                  color: accent,
                                },
                              ]}
                            >
                              {fa ? 'انجام شد' : 'Done'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              disabled={currentDayPercent !== 100 || currentBookProgress < 100}
              onPress={completeDay}
              style={[
                styles.completeDayButton,
                {
                  backgroundColor: currentDayPercent === 100 && currentBookProgress >= 100 ? accent : cardSecondary,
                  borderColor: currentDayPercent === 100 && currentBookProgress >= 100 ? accent : softBorder,
                  opacity: currentDayPercent === 100 && currentBookProgress >= 100 ? 1 : 0.75,
                  flexDirection: rowDirection,
                },
              ]}
            >
              {currentDayPercent === 100 && currentBookProgress >= 100 ? (
                <CheckCircle2 size={21} color={colors.background} strokeWidth={2.3} />
              ) : (
                <Lock size={19} color={colors.textSecondary || `${colors.text}60`} strokeWidth={2} />
              )}

              <Text
                style={[
                  styles.completeDayText,
                  {
                    color:
                      currentDayPercent === 100 && currentBookProgress >= 100
                        ? colors.background
                        : colors.textSecondary || `${colors.text}60`,
                    textAlign,
                    writingDirection: textDirection,
                  },
                ]}
              >
                {currentDayPercent === 100 && currentBookProgress >= 100
                  ? fa
                    ? 'تکمیل روز'
                    : 'Complete day'
                  : fa
                  ? 'تمام فعالیت‌ها را انجام دهید و کتاب را کامل کنید'
                  : 'Complete all tasks and book reading'}
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
                      color: colors.textSecondary || `${colors.text}80`,
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
                    color: colors.textSecondary || `${colors.text}80`,
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
                    },
                  ]}
                >
                  {completedDays}
                </Text>

                <Text
                  style={[
                    styles.reportStatLabel,
                    {
                      color: colors.textSecondary || `${colors.text}80`,
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
                    },
                  ]}
                >
                  {data.reduce((sum, _, i) => sum + getCompletedTasks(i), 0)}
                </Text>

                <Text
                  style={[
                    styles.reportStatLabel,
                    {
                      color: colors.textSecondary || `${colors.text}80`,
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
                  <Book size={19} color={accent} strokeWidth={2} />
                </View>

                <Text
                  style={[
                    styles.reportStatValue,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {data.reduce((sum, _, i) => sum + (getBookProgress(i) >= 100 ? 1 : 0), 0)}
                </Text>

                <Text
                  style={[
                    styles.reportStatLabel,
                    {
                      color: colors.textSecondary || `${colors.text}80`,
                      writingDirection: textDirection,
                    },
                  ]}
                >
                  {fa ? 'کتاب کامل شده' : 'Books completed'}
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
                  const bookProgress = getBookProgress(index);
                  const avgProgress = Math.round((percent + bookProgress) / 2);

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
                              height: `${Math.max(avgProgress, 5)}%`,
                              backgroundColor: avgProgress === 100 ? accent : accentStrong,
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
                    ? fa
                      ? 'پروتکل را کامل کرده‌اید'
                      : 'You completed the protocol'
                    : fa
                    ? 'به مسیر خود ادامه دهید'
                    : 'Keep moving forward'}
                </Text>

                <Text
                  style={[
                    styles.summaryText,
                    {
                      color: colors.textSecondary || `${colors.text}80`,
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
                    color: colors.textSecondary || `${colors.text}80`,
                    textAlign: 'center',
                    writingDirection: textDirection,
                  },
                ]}
              >
                {fa
                  ? 'آفرین! یک قدم دیگر به جلو رفتید.'
                  : 'Great job! You took another step forward.'}
              </Text>
            </MotiView>
          </MotiView>
        )}
      </View>
    </View>
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
    justifyContent: 'space-between',
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
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiLoadingCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  aiLoadingContent: {
    flex: 1,
  },

  aiLoadingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  aiLoadingSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  aiPlanCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    overflow: 'hidden',
  },

  aiPlanHeader: {
    alignItems: 'center',
    gap: 10,
  },

  aiPlanIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiPlanHeaderContent: {
    flex: 1,
  },

  aiPlanTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  aiPlanSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  aiRefreshButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiWeightsRow: {
    marginTop: 14,
    gap: 8,
  },

  aiWeightItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiWeightValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  aiWeightLabel: {
    fontSize: 9,
    marginTop: 2,
  },

  aiPlanTasks: {
    marginTop: 12,
    gap: 8,
  },

  aiPlanTask: {
    alignItems: 'center',
    padding: 11,
    borderRadius: 14,
    gap: 10,
  },

  aiPlanTaskNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiPlanTaskNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },

  aiPlanTaskContent: {
    flex: 1,
  },

  aiPlanTaskTitle: {
    fontSize: 13,
    fontWeight: '600',
  },

  aiPlanTaskMeta: {
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },

  aiPlanTaskMetaText: {
    fontSize: 10,
  },

  aiPlanTaskConfidence: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },

  aiWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },

  aiWarningText: {
    fontSize: 10,
    fontWeight: '600',
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
    paddingHorizontal: 16,
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
    textAlign: 'center',
  },

  quoteReference: {
    fontSize: 12,
    textAlign: 'center',
  },

  poemCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
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
    textAlign: 'center',
  },

  poemPoet: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
  },

  poemText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Book Progress Styles
  bookProgressCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },

  bookProgressHeader: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  bookProgressIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookProgressContent: {
    flex: 1,
  },

  bookProgressTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  bookProgressSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },

  bookProgressRow: {
    alignItems: 'center',
    gap: 12,
  },

  bookProgressSliderContainer: {
    flex: 1,
  },

  bookProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },

  bookProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  bookProgressLabels: {
    justifyContent: 'space-between',
    marginTop: 4,
  },

  bookProgressLabel: {
    fontSize: 9,
    opacity: 0.6,
  },

  bookProgressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  bookProgressInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 6,
    fontSize: 16,
    fontWeight: '700',
  },

  bookProgressPercent: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },

  bookProgressPlusButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  bookProgressPlusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  bookProgressStatus: {
    marginTop: 12,
    gap: 8,
  },

  bookProgressStatusBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  bookProgressStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  bookProgressCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  bookProgressCompleteText: {
    fontSize: 12,
    fontWeight: '600',
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

  taskFeedbackRow: {
    marginTop: 10,
    gap: 7,
  },

  feedbackButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 5,
  },

  feedbackButtonText: {
    fontSize: 9,
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
    textAlign: 'center',
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
    opacity: 0.7,
  },
});