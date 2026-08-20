import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  Feather,
  Flame,
  Info,
  Lightbulb,
  ListChecks,
  PenLine,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CONTENT_HORIZONTAL = 18;

type ViewType = 'home' | 'study' | 'plan' | 'session' | 'result';

type ProgressItem = {
  box: number;
  correct: number;
  wrong: number;
  errors: number;
  sessions: number;
  lastSeen: number;
  lastSession: number;
};

type Progress = Record<number, ProgressItem>;

type ExerciseType =
  | 'choose_misra'
  | 'fill_blank'
  | 'complete_misra2'
  | 'write_full'
  | 'continue_verse'
  | 'meaning_to_verse'
  | 'choose_meaning'
  | 'concept'
  | 'order_number';

interface Exercise {
  type: ExerciseType;
  idx: number;
  question: string;
  correct: string | number;
  options?: (string | number)[];
  display?: string;
}

interface Poem {
  id: number;
  title: string;
  fullTitle: string;
  poet: string;
  couplets: string[];
  meanings: string[];
  meaning: {
    summary: string;
    interpretation: string;
    coreMessage: string;
    moral: string;
    literaryNotes: string;
    vocabulary: {
      word: string;
      meaning: string;
    }[];
  };
}

interface TodaySessionData {
  day: number;
  tasks: string[];
  items: Exercise[];
}

const POEMS: Poem[] = [
  {
    id: 0,
    title: 'غزل شمارهٔ ۱',
    fullTitle: 'الا یا ایها الساقی',
    poet: 'حافظ شیرازی',
    couplets: [
      'الا یا ایها الساقی ادر کأساً و ناولها // که عشق آسان نمود اول ولی افتاد مشکل‌ها',
      'به بوی نافه‌ای کآخر صبا زان طره بگشاید // ز تاب جعد مشکینش چه خون افتاد در دل‌ها',
      'مرا در منزل جانان چه امن عیش چون هر دم // جرس فریاد می‌دارد که بربندید محمل‌ها',
      'به می سجاده رنگین کن گرت پیر مغان گوید // که سالک بی‌خبر نبود ز راه و رسم منزل‌ها',
      'شب تاریک و بیم موج و گردابی چنین هایل // کجا دانند حال ما سبک‌بارانِ ساحل‌ها',
      'همه کارم ز خودکامی به بدنامی کشید آخر // نهان کی ماند آن رازی کزو سازند محفل‌ها',
      'حضوری گر همی‌خواهی از او غایب مشو حافظ // متی ما تلق من تهوی دع الدنیا و اهملها',
    ],
    meanings: [
      'ای ساقی، جام شراب را بگردان و به من بده، زیرا عشق در ابتدا آسان به نظر می‌رسد اما بعد مشکلات زیادی به همراه دارد.',
      'به امید بوی خوشی که از گیسوی معشوق می‌آید، دل‌ها چه خون‌ها که نمی‌خورند.',
      'در منزل یار، آرامش عیش چه امنیتی دارد وقتی هر لحظه صدای زنگ کاروان می‌آید که بارها را ببندید.',
      'فرش عبادت را با شراب رنگین کن اگر پیر مغان بگوید، زیرا سالک راه از راه و رسم منزل‌ها بی‌خبر نیست.',
      'شب تاریک و ترس از موج و گردابی چنین وحشتناک، سبک‌باران ساحل‌ها چه می‌دانند از حال ما.',
      'همه کارم به خاطر خودخواهی به بدنامی انجامید، آخر چه رازی پنهان می‌ماند که از آن محفل‌ها برپا کنند.',
      'ای حافظ، اگر به حضور او می‌خواهی، از او غایب مشو، هرگاه معشوق را یافتی، دنیا و دلبستگی‌هایش را رها کن.',
    ],
    meaning: {
      summary: 'شاعر در این غزل، از ساقی طلب شراب می‌کند و به مشکلات عشق، گذر از وابستگی‌های دنیوی و رسیدن به حضور معشوق اشاره دارد.',
      interpretation: 'حافظ با زبان رمزی و عارفانه، عشق را به شراب تشبیه کرده که در ابتدا شیرین و آسان است اما در ادامه با دشواری‌های فراوان همراه می‌شود.',
      coreMessage: 'عشق راهی پرپیچ‌وخم است که با رها کردن دلبستگی‌های دنیوی و پیمودن مسیر با آگاهی، می‌توان به مقصد رسید.',
      moral: 'برای رسیدن به حقیقت عشق و معرفت، باید از تعلقات دنیوی گذشت و با دل و جان به سوی معشوق حقیقی حرکت کرد.',
      literaryNotes: 'استفاده از نمادهای عرفانی مانند ساقی، مغان و خرابات، اشاره به گذر از ظواهر و رسیدن به جوهره عرفان.',
      vocabulary: [
        { word: 'ساقی', meaning: 'شراب‌دهنده؛ در اصطلاح عرفانی پیر راه‌نما' },
        { word: 'خرابات', meaning: 'خرابه‌ها؛ در ادبیات عرفانی جایگاه اهل دل' },
        { word: 'مغان', meaning: 'زرتشتیان؛ در شعر حافظ نماد آزاداندیشی' },
      ],
    },
  },
  {
    id: 1,
    title: 'غزل شمارهٔ ۲',
    fullTitle: 'سالها دل طلب جام جم از ما می‌کرد',
    poet: 'حافظ شیرازی',
    couplets: [
      'سالها دل طلب جام جم از ما می‌کرد // و آنچه خود داشت ز بیگانه تمنا می‌کرد',
      'گوهری کز صدف کون و مکان بیرون است // طلب از گمشدگان لب دریا می‌کرد',
      'دوش از مسجد سوی میخانه خرابات کشید // تا ز سرّ ازل و نقشِ قدم پیدا کند',
      'ای دلِ من، به خرابات چه می‌جویی؟ // کانچه خود داری ز بیگانه چه می‌خواهی؟',
    ],
    meanings: [
      'سال‌ها دل من در جستجوی جام جم بود، در حالی که آنچه را خود داشت از دیگران طلب می‌کرد.',
      'گوهر گرانبهایی که از صدف عالم و مکان بیرون است، از گمشدگان لب دریا طلب می‌کرد.',
      'دیشب از مسجد به سوی میخانه کشیده شدم، تا راز ازل و نقش قدیم را پیدا کنم.',
      'ای دل من، در خرابات چه می‌جویی؟ آنچه خود داری از بیگانه چه می‌خواهی؟',
    ],
    meaning: {
      summary: 'شاعر از جستجوی بیرونی برای یافتن حقیقت درونی سخن می‌گوید و یادآوری می‌کند که آنچه می‌جوییم می‌تواند درون خود ما باشد.',
      interpretation: 'حافظ به ما می‌آموزد که حقیقت را نباید تنها در بیرون جست‌وجو کرد، بلکه باید به درون خود نیز نگاه کنیم.',
      coreMessage: 'آنچه در جستجوی آن هستیم، ممکن است در درون خود ما وجود داشته باشد.',
      moral: 'به جای جستجوی مداوم در بیرون، گاهی باید به درون خود سفر کنیم و ارزش‌های خود را دوباره ببینیم.',
      literaryNotes: 'استفاده از نمادهای جام جم و خرابات برای اشاره به معرفت باطنی و رهایی از ظاهرگرایی.',
      vocabulary: [
        { word: 'جام جم', meaning: 'جام افسانه‌ای که جهان را در آن می‌دیدند؛ کنایه از معرفت کامل' },
        { word: 'خرابات', meaning: 'در ادبیات عرفانی، جایگاه اهل دل و معرفت' },
      ],
    },
  },
];

const getCoupletParts = (couplet: string) => {
  const parts = couplet.split('//').map((item) => item.trim());
  return { m1: parts[0] || '', m2: parts[1] || '' };
};

const normalize = (value: string) => {
  return (value || '')
    .replace(/\u200c/g, ' ')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[؟!،.؛:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const levenshtein = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (text1: string, text2: string) => {
  const a = normalize(text1);
  const b = normalize(text2);
  if (a === b) return 100;
  if (!a.length || !b.length) return 0;
  const distance = levenshtein(a, b);
  const maxLength = Math.max(a.length, b.length);
  return Math.max(0, Math.round((1 - distance / maxLength) * 100));
};

export default function HafezScreen() {
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();
  const router = useRouter();

  const [currentPoem, setCurrentPoem] = useState<Poem | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [progress, setProgress] = useState<Progress>({});
  const [poemStats, setPoemStats] = useState<
    Record<number, { mastered: number; total: number; percent: number }>
  >({});
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedDays, setCompletedDays] = useState<Record<number, boolean>>({});
  const [sessionQueue, setSessionQueue] = useState<Exercise[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(-1);
  const [currentAnswered, setCurrentAnswered] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [userAnswer1, setUserAnswer1] = useState('');
  const [userAnswer2, setUserAnswer2] = useState('');
  const [weakItems, setWeakItems] = useState<number[]>([]);
  const [feedback, setFeedback] = useState('پاسخ خود را وارد کنید و سپس آن را بررسی کنید.');
  const [feedbackType, setFeedbackType] = useState<'info' | 'correct' | 'wrong'>('info');
  const [todaySessionData, setTodaySessionData] = useState<TodaySessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(12)).current;

  const primary = colors.primary;
  const subtleBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const subtleSurface = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.88)';
  const mutedSurface = isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.035)';
  const success = '#22C55E';
  const danger = '#EF4444';
  const warning = '#F59E0B';

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(12);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [currentView, fadeAnim, translateAnim]);

  const storageKey = useCallback((poemId: number) => `hafez_memory_v10_${poemId}`, []);
  const planStorageKey = useCallback((poemId: number) => `planData_v10_${poemId}`, []);
  const dayStorageKey = useCallback((poemId: number, day: number) => `day_done_v10_${poemId}_${day}`, []);

  const loadProgress = useCallback(async (poemId: number): Promise<Progress> => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(poemId));
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
    return {};
  }, [storageKey]);

  const saveProgress = useCallback(async (poemId: number, nextProgress: Progress) => {
    try {
      await AsyncStorage.setItem(storageKey(poemId), JSON.stringify(nextProgress));
    } catch {}
  }, [storageKey]);

  const loadPoemStats = useCallback(async (poemId: number) => {
    const poem = POEMS.find((item) => item.id === poemId);
    if (!poem) return { mastered: 0, total: 0, percent: 0 };
    const stored = await loadProgress(poemId);
    let mastered = 0;
    poem.couplets.forEach((_, index) => {
      if (stored[index]?.box >= 5) mastered += 1;
    });
    const total = poem.couplets.length;
    return { mastered, total, percent: total ? Math.round((mastered / total) * 100) : 0 };
  }, [loadProgress]);

  const loadCompletedDays = useCallback(async (poemId: number) => {
    const result: Record<number, boolean> = {};
    try {
      const values = await Promise.all(
        Array.from({ length: 30 }, async (_, index) => {
          const day = index + 1;
          const value = await AsyncStorage.getItem(dayStorageKey(poemId, day));
          return { day, done: value === 'true' };
        })
      );
      values.forEach(({ day, done }) => {
        if (done) result[day] = true;
      });
    } catch {}
    return result;
  }, [dayStorageKey]);

  const loadPlanDay = useCallback(async (poemId: number) => {
    try {
      const raw = await AsyncStorage.getItem(planStorageKey(poemId));
      if (!raw) return 1;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.selectedDay === 'number' && parsed.selectedDay >= 1 && parsed.selectedDay <= 30) {
        return parsed.selectedDay;
      }
    } catch {}
    return 1;
  }, [planStorageKey]);

  const savePlanDay = useCallback(async (poemId: number, day: number) => {
    try {
      await AsyncStorage.setItem(planStorageKey(poemId), JSON.stringify({ selectedDay: day }));
    } catch {}
  }, [planStorageKey]);

  const ensureItem = useCallback((idx: number, source: Progress): ProgressItem => {
    if (!source[idx]) {
      source[idx] = { box: 1, correct: 0, wrong: 0, errors: 0, sessions: 0, lastSeen: 0, lastSession: 0 };
    }
    return source[idx];
  }, []);

  const getDayTasks = useCallback((day: number, poem: Poem, sourceProgress: Progress) => {
    const total = poem.couplets.length;
    const perDay = Math.max(1, Math.ceil(total / 30));
    const startIndex = Math.min((day - 1) * perDay, total);
    const endIndex = Math.min(startIndex + perDay, total);
    const newBits: number[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      newBits.push(i);
    }
    const review: number[] = [];
    for (let i = 0; i < startIndex; i++) {
      const item = sourceProgress[i];
      if (!item || item.box < 5) {
        review.push(i);
      }
    }
    return { newBits, review };
  }, []);

  const getExercisesForDay = useCallback((day: number, poem: Poem, sourceProgress: Progress): Exercise[] => {
    const { newBits, review } = getDayTasks(day, poem, sourceProgress);
    let allItems = [...newBits, ...review];
    if (!allItems.length) {
      allItems = poem.couplets.map((_, index) => index);
    }
    const exercises: Exercise[] = [];
    allItems.forEach((idx) => {
      const couplet = poem.couplets[idx];
      if (!couplet) return;
      const parts = getCoupletParts(couplet);
      const item = sourceProgress[idx];
      const box = item?.box || 1;
      const otherM2 = poem.couplets.filter((_, index) => index !== idx).map((item) => getCoupletParts(item).m2);
      const choiceOptions = [parts.m2, ...otherM2.sort(() => Math.random() - 0.5).slice(0, 3)].sort(
        () => Math.random() - 0.5
      );
      exercises.push({
        type: 'choose_misra',
        idx,
        question: `مصرع دوم بیت «${parts.m1}» کدام است؟`,
        correct: parts.m2,
        options: choiceOptions,
      });
      if (box >= 1 || day >= 2) {
        const words = parts.m2.split(' ');
        const removeCount = Math.max(1, Math.floor(words.length / 4));
        const selectedPositions = new Set<number>();
        while (selectedPositions.size < removeCount && selectedPositions.size < words.length) {
          selectedPositions.add(Math.floor(Math.random() * words.length));
        }
        selectedPositions.forEach((position) => {
          words[position] = '___';
        });
        exercises.push({
          type: 'fill_blank',
          idx,
          question: 'کلمات حذف‌شده را کامل کنید.',
          correct: parts.m2,
          display: `${parts.m1}\n${words.join(' ')}`,
        });
      }
      if (box >= 2 || day >= 4) {
        exercises.push({
          type: 'complete_misra2',
          idx,
          question: 'مصرع دوم را کامل بنویسید.',
          correct: parts.m2,
          display: parts.m1,
        });
      }
      if (box >= 3 || day >= 6) {
        exercises.push({
          type: 'write_full',
          idx,
          question: `متن کامل بیت ${idx + 1} را بنویسید.`,
          correct: `${parts.m1} ${parts.m2}`,
        });
      }
      if (box >= 3 || day >= 5) {
        const startLength = Math.max(12, Math.floor(parts.m2.length * 0.4));
        exercises.push({
          type: 'continue_verse',
          idx,
          question: 'ادامه مصرع را کامل کنید.',
          correct: parts.m2,
          display: `${parts.m1}\n${parts.m2.substring(0, startLength)}…`,
        });
      }
      if (box >= 4 || day >= 10) {
        const meaningOptions = [
          poem.meanings[idx],
          ...poem.meanings.filter((_, index) => index !== idx).sort(() => Math.random() - 0.5).slice(0, 3),
        ].sort(() => Math.random() - 0.5);
        exercises.push({
          type: 'choose_meaning',
          idx,
          question: 'معنی صحیح این بیت را انتخاب کنید.',
          correct: poem.meanings[idx],
          display: `${parts.m1}\n${parts.m2}`,
          options: meaningOptions,
        });
      }
      if (box >= 4 || day >= 10) {
        const verseOptions = [
          idx,
          ...poem.couplets.map((_, index) => index).filter((index) => index !== idx).sort(() => Math.random() - 0.5).slice(0, 3),
        ].sort(() => Math.random() - 0.5);
        exercises.push({
          type: 'meaning_to_verse',
          idx,
          question: 'این معنی مربوط به کدام بیت است؟',
          correct: idx,
          display: poem.meanings[idx],
          options: verseOptions,
        });
      }
      if (box >= 5 || day >= 12) {
        exercises.push({
          type: 'concept',
          idx,
          question: 'مفهوم اصلی این بیت چیست؟',
          correct: 'بیان عشق و عرفان',
          display: `${parts.m1}\n${parts.m2}`,
          options: ['بیان عشق و عرفان', 'شکایت از روزگار', 'توصیف طبیعت', 'نکوهش ریاکاری'],
        });
      }
      if (box >= 4 || day >= 8) {
        const orderOptions = [
          idx,
          ...poem.couplets.map((_, index) => index).filter((index) => index !== idx).sort(() => Math.random() - 0.5).slice(0, 4),
        ].sort(() => Math.random() - 0.5);
        exercises.push({
          type: 'order_number',
          idx,
          question: 'این بیت چندمین بیت شعر است؟',
          correct: idx,
          display: `${parts.m1}\n${parts.m2}`,
          options: orderOptions,
        });
      }
    });
    for (let i = exercises.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [exercises[i], exercises[j]] = [exercises[j], exercises[i]];
    }
    const count = Math.min(10, Math.max(6, 6 + Math.floor(day / 4)));
    return exercises.slice(0, count);
  }, [getDayTasks]);

  const refreshHomeStats = useCallback(async () => {
    const result: Record<number, { mastered: number; total: number; percent: number }> = {};
    await Promise.all(
      POEMS.map(async (poem) => {
        result[poem.id] = await loadPoemStats(poem.id);
      })
    );
    setPoemStats(result);
  }, [loadPoemStats]);

  useEffect(() => {
    refreshHomeStats();
  }, [refreshHomeStats]);

  const openPoem = useCallback(async (poemId: number) => {
    const poem = POEMS.find((item) => item.id === poemId);
    if (!poem) return;
    setIsLoading(true);
    try {
      const [loadedProgress, loadedDay, loadedCompleted] = await Promise.all([
        loadProgress(poemId),
        loadPlanDay(poemId),
        loadCompletedDays(poemId),
      ]);
      setCurrentPoem(poem);
      setProgress(loadedProgress);
      setSelectedDay(loadedDay);
      setCompletedDays(loadedCompleted);
      setCurrentView('study');
    } finally {
      setIsLoading(false);
    }
  }, [loadCompletedDays, loadPlanDay, loadProgress]);

  const handleDayChange = useCallback(async (day: number) => {
    if (!currentPoem) return;
    setSelectedDay(day);
    await savePlanDay(currentPoem.id, day);
  }, [currentPoem, savePlanDay]);

  const goHome = useCallback(() => {
    setCurrentView('home');
    setCurrentPoem(null);
    setProgress({});
    setSessionQueue([]);
    setTodaySessionData(null);
    refreshHomeStats();
  }, [refreshHomeStats]);

  const goBack = useCallback(() => {
    if (currentView === 'home') {
      router.back();
      return;
    }
    if (currentView === 'study') {
      goHome();
      return;
    }
    if (currentView === 'plan') {
      setCurrentView('study');
      return;
    }
    if (currentView === 'session') {
      setCurrentView('plan');
      return;
    }
    if (currentView === 'result') {
      setCurrentView('plan');
      return;
    }
  }, [currentView, goHome, router]);

  const startPlan = () => {
    if (!currentPoem) return;
    setCurrentView('plan');
  };

  const startTodaySession = useCallback(() => {
    if (!todaySessionData || !todaySessionData.items.length) return;
    setSessionQueue(todaySessionData.items);
    setSessionIndex(0);
    setSessionCorrect(0);
    setSessionTotal(todaySessionData.items.length);
    setSelectedChoiceIdx(-1);
    setCurrentAnswered(false);
    setSubmitted(false);
    setUserAnswer('');
    setUserAnswer1('');
    setUserAnswer2('');
    setWeakItems([]);
    setFeedback('پاسخ خود را وارد کنید و سپس آن را بررسی کنید.');
    setFeedbackType('info');
    setCurrentView('session');
  }, [todaySessionData]);

  const updateProgressAfterAnswer = useCallback(async (idx: number, correct: boolean) => {
    if (!currentPoem) return;
    const nextProgress: Progress = { ...progress };
    const item = ensureItem(idx, nextProgress);
    if (correct) {
      item.correct += 1;
      item.box = Math.min(5, item.box + 1);
    } else {
      item.wrong += 1;
      item.errors += 1;
      item.box = Math.max(1, item.box - 1);
    }
    item.sessions += 1;
    item.lastSeen = Date.now();
    item.lastSession = Date.now();
    setProgress(nextProgress);
    await saveProgress(currentPoem.id, nextProgress);
  }, [currentPoem, ensureItem, progress, saveProgress]);

  const finishExercise = useCallback(() => {
    setTimeout(async () => {
      if (sessionIndex < sessionTotal - 1) {
        setSessionIndex((value) => value + 1);
        setSelectedChoiceIdx(-1);
        setCurrentAnswered(false);
        setSubmitted(false);
        setUserAnswer('');
        setUserAnswer1('');
        setUserAnswer2('');
        setFeedback('پاسخ خود را وارد کنید و سپس آن را بررسی کنید.');
        setFeedbackType('info');
        return;
      }
      if (currentPoem) {
        const key = dayStorageKey(currentPoem.id, selectedDay);
        await AsyncStorage.setItem(key, 'true');
        setCompletedDays((previous) => ({ ...previous, [selectedDay]: true }));
        await refreshHomeStats();
      }
      setCurrentView('result');
    }, 900);
  }, [currentPoem, dayStorageKey, refreshHomeStats, selectedDay, sessionIndex, sessionTotal]);

  const handleChoice = useCallback(async (selectedIndex: number, correctIndex: number, exercise: Exercise) => {
    if (submitted || currentAnswered) return;
    const correct = selectedIndex === correctIndex;
    setSelectedChoiceIdx(selectedIndex);
    setCurrentAnswered(true);
    setSubmitted(true);
    if (correct) {
      setSessionCorrect((value) => value + 1);
      setFeedback('پاسخ صحیح است. این بیت یک مرحله در مسیر یادگیری پیش رفت.');
      setFeedbackType('correct');
    } else {
      setWeakItems((items) => [...items, exercise.idx + 1]);
      setFeedback('این گزینه درست نیست. پاسخ صحیح با علامت مشخص شده است.');
      setFeedbackType('wrong');
    }
    await updateProgressAfterAnswer(exercise.idx, correct);
    finishExercise();
  }, [currentAnswered, finishExercise, submitted, updateProgressAfterAnswer]);

  const handleSubmitAnswer = useCallback(async (exercise: Exercise) => {
    if (submitted || !currentPoem) return;
    let text = '';
    if (exercise.type === 'write_full') {
      text = `${userAnswer1} ${userAnswer2}`;
    } else {
      text = userAnswer;
    }
    const parts = getCoupletParts(currentPoem.couplets[exercise.idx]);
    let expected = '';
    if (exercise.type === 'fill_blank' || exercise.type === 'complete_misra2' || exercise.type === 'continue_verse') {
      expected = parts.m2;
    }
    if (exercise.type === 'write_full') {
      expected = `${parts.m1} ${parts.m2}`;
    }
    const similarity = calculateSimilarity(text, expected);
    const correct = similarity >= 85;
    setSubmitted(true);
    if (correct) {
      setSessionCorrect((value) => value + 1);
      setFeedback(`پاسخ صحیح است. میزان تطابق ${similarity}٪`);
      setFeedbackType('correct');
    } else {
      setWeakItems((items) => [...items, exercise.idx + 1]);
      setFeedback(`میزان تطابق ${similarity}٪\nپاسخ درست: ${parts.m1}\n${parts.m2}`);
      setFeedbackType('wrong');
    }
    await updateProgressAfterAnswer(exercise.idx, correct);
    finishExercise();
  }, [currentPoem, finishExercise, submitted, updateProgressAfterAnswer, userAnswer, userAnswer1, userAnswer2]);

  useEffect(() => {
    if (!currentPoem) {
      setTodaySessionData(null);
      return;
    }
    const tasks = getDayTasks(selectedDay, currentPoem, progress);
    const items = getExercisesForDay(selectedDay, currentPoem, progress);
    const descriptions: string[] = [];
    tasks.newBits.forEach((index) => {
      descriptions.push(`یادگیری بیت ${index + 1}`);
    });
    tasks.review.forEach((index) => {
      descriptions.push(`مرور بیت ${index + 1}`);
    });
    if (!descriptions.length) {
      descriptions.push('مرور و تثبیت شعر');
    }
    setTodaySessionData({ day: selectedDay, tasks: descriptions, items });
  }, [currentPoem, getExercisesForDay, getDayTasks, progress, selectedDay]);

  const currentStats = useMemo(() => {
    if (!currentPoem) return { mastered: 0, total: 0, percent: 0 };
    return poemStats[currentPoem.id] || { mastered: 0, total: currentPoem.couplets.length, percent: 0 };
  }, [currentPoem, poemStats]);

  const renderHeader = () => {
    const isHome = currentView === 'home';

    let title = 'اشعار حافظ';
    let subtitle = 'مطالعه و تمرین شعر';

    if (!isHome) {
      if (currentView === 'study') {
        title = 'آموزش شعر';
        subtitle = currentPoem?.fullTitle || '';
      } else if (currentView === 'plan') {
        title = 'مسیر یادگیری';
        subtitle = currentPoem?.fullTitle || '';
      } else if (currentView === 'session') {
        title = 'تمرین حافظه';
        subtitle = `${currentPoem?.fullTitle || ''} • جلسه ${selectedDay}`;
      } else if (currentView === 'result') {
        title = 'نتیجه جلسه';
        subtitle = `${sessionCorrect} از ${sessionTotal} صحیح`;
      }
    }

    return (
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (isHome) {
              router.back();
            } else {
              setCurrentView('home');
            }
          }}
          activeOpacity={0.75}
          style={[
            styles.headerBackButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="بازگشت"
        >
          <ArrowLeft
            size={21}
            strokeWidth={2.2}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleWrapper}>
          <Text
            numberOfLines={1}
            style={[
              styles.headerTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              numberOfLines={1}
              style={[
                styles.headerSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.headerIcon,
            {
              backgroundColor: isDark
                ? 'rgba(139,92,246,0.14)'
                : 'rgba(139,92,246,0.08)',
            },
          ]}
        >
          <Feather
            size={22}
            strokeWidth={2}
            color={colors.primary}
          />
        </View>
      </View>
    );
  };

  const renderProgressBar = (value: number, height = 6) => (
    <View style={[styles.progressTrack, { height, backgroundColor: mutedSurface }]}>
      <View
        style={[
          styles.progressFill,
          { height, width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: primary },
        ]}
      />
    </View>
  );

  const renderHome = () => {
    return (
      <Animated.View
        style={[styles.screen, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}
      >
        <View style={styles.homeHero}>
          <View>
          </View>
          <Text style={[styles.homeHeroSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            شعر را بخوانید، مرور کنید و با تمرین‌های کوتاه به خاطر بسپارید.
          </Text>
        </View>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>غزل‌های منتخب</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              یک غزل را برای شروع انتخاب کنید.
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: mutedSurface }]}>
            <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>
              {POEMS.length} غزل
            </Text>
          </View>
        </View>

        <View style={styles.poemList}>
          {POEMS.map((poem) => {
            const stats = poemStats[poem.id] || { mastered: 0, total: poem.couplets.length, percent: 0 };
            return (
              <TouchableOpacity
                key={poem.id}
                activeOpacity={0.82}
                onPress={() => openPoem(poem.id)}
                style={[
                  styles.poemCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
                    borderColor: subtleBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.poemIcon,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${primary}14` },
                  ]}
                >
                  <Feather size={24} color={primary} strokeWidth={2} />
                </View>

                <View style={styles.poemInfo}>
                  <Text numberOfLines={1} style={[styles.poemTitle, { color: colors.text }]}>
                    {poem.fullTitle}
                  </Text>
                  <Text style={[styles.poemPoet, { color: colors.textSecondary }]}>{poem.poet}</Text>
                  <View style={styles.poemStats}>
                    <Text style={[styles.poemStat, { color: colors.textSecondary }]}>
                      {poem.couplets.length} بیت
                    </Text>
                    <Text style={[styles.poemStat, { color: primary }]}>{stats.percent}٪ تسلط</Text>
                  </View>
                  {renderProgressBar(stats.percent, 6)}
                </View>

                <ChevronLeft size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View
          style={[
            styles.homeInfo,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.035)',
              borderColor: subtleBorder,
            },
          ]}
        >
          <Sparkles size={17} color={primary} />
          <Text style={[styles.homeInfoText, { color: colors.textSecondary }]}>
            تمرین‌ها بر اساس میزان تسلط شما تنظیم می‌شوند.
          </Text>
        </View>
      </Animated.View>
    );
  };

  const renderStudy = () => {
    if (!currentPoem) return null;

    return (
      <Animated.View
        style={[styles.screen, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}
      >
        <View
          style={[
            styles.studyHero,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
              borderColor: subtleBorder,
            },
          ]}
        >
          <View
            style={[
              styles.studyHeroIcon,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${primary}14` },
            ]}
          >
            <Feather size={28} color={primary} strokeWidth={2} />
          </View>
          <View style={styles.studyHeroText}>
            <Text style={[styles.studyPoet, { color: colors.textSecondary }]}>
              {currentPoem.poet}
            </Text>
            <Text style={[styles.studyTitle, { color: colors.text }]}>
              {currentPoem.fullTitle}
            </Text>
            <Text style={[styles.studyStats, { color: colors.textSecondary }]}>
              {currentPoem.couplets.length} بیت • {currentStats.percent}٪ تسلط
            </Text>
          </View>
          {renderProgressBar(currentStats.percent, 7)}
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>متن غزل</Text>
          </View>
          <View
            style={[
              styles.poemTextCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)',
                borderColor: subtleBorder,
              },
            ]}
          >
            {currentPoem.couplets.map((couplet, index) => {
              const parts = getCoupletParts(couplet);
              return (
                <View
                  key={index}
                  style={[
                    styles.couplet,
                    index !== currentPoem.couplets.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: subtleBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.coupletNumber,
                      { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : `${primary}14` },
                    ]}
                  >
                    <Text style={[styles.coupletNumberText, { color: primary }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.coupletContent}>
                    <Text style={[styles.verseText, { color: colors.text }]}>{parts.m1}</Text>
                    <Text style={[styles.verseText, { color: colors.text }]}>{parts.m2}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>آشنایی با غزل</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, marginTop: 3 }]}>
            پیش از شروع تمرین، مفهوم شعر را مرور کنید.
          </Text>
          <View style={styles.meaningList}>
            <InfoCard
              icon={<PenLine size={18} color={primary} />}
              title="معنی روان"
              text={currentPoem.meaning.summary}
              colors={colors}
              backgroundColor={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)'}
              borderColor={subtleBorder}
            />
            <InfoCard
              icon={<Lightbulb size={18} color={warning} />}
              title="مفهوم اصلی"
              text={currentPoem.meaning.coreMessage}
              colors={colors}
              backgroundColor={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)'}
              borderColor={subtleBorder}
            />
            <InfoCard
              icon={<PenLine size={18} color={primary} />}
              title="تفسیر"
              text={currentPoem.meaning.interpretation}
              colors={colors}
              backgroundColor={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)'}
              borderColor={subtleBorder}
            />
            <InfoCard
              icon={<Target size={18} color={success} />}
              title="پیام"
              text={currentPoem.meaning.moral}
              colors={colors}
              backgroundColor={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)'}
              borderColor={subtleBorder}
            />
          </View>
        </View>

        {currentPoem.meaning.vocabulary.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>واژگان مهم</Text>
            <View
              style={[
                styles.vocabularyCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)',
                  borderColor: subtleBorder,
                },
              ]}
            >
              {currentPoem.meaning.vocabulary.map((item, index) => (
                <View
                  key={item.word}
                  style={[
                    styles.vocabularyItem,
                    index !== currentPoem.meaning.vocabulary.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: subtleBorder,
                    },
                  ]}
                >
                  <Text style={[styles.vocabularyWord, { color: colors.text }]}>{item.word}</Text>
                  <Text style={[styles.vocabularyMeaning, { color: colors.textSecondary }]}>
                    {item.meaning}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View
          style={[
            styles.learningCta,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
              borderColor: subtleBorder,
            },
          ]}
        >
          <View style={styles.learningCtaHeader}>
            <View>
              <Text style={[styles.learningEyebrow, { color: primary }]}>مسیر یادگیری</Text>
              <Text style={[styles.learningTitle, { color: colors.text }]}>
                آماده حفظ این غزل هستید؟
              </Text>
            </View>
            <View
              style={[
                styles.learningIcon,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : `${primary}14` },
              ]}
            >
              <Target size={20} color={primary} />
            </View>
          </View>
          <Text style={[styles.learningDescription, { color: colors.textSecondary }]}>
            برنامه ۳۰ جلسه‌ای، شعر را به بخش‌های کوتاه تقسیم می‌کند و با مرور تدریجی به تثبیت آن کمک
            می‌کند.
          </Text>
          <View style={styles.learningMeta}>
            <LearningMeta
              icon={<CalendarDays size={15} color={colors.textSecondary} />}
              text="۳۰ جلسه"
              color={colors.textSecondary}
            />
            <LearningMeta
              icon={<Clock3 size={15} color={colors.textSecondary} />}
              text="جلسه‌های کوتاه"
              color={colors.textSecondary}
            />
            <LearningMeta
              icon={<ListChecks size={15} color={colors.textSecondary} />}
              text="تمرین هوشمند"
              color={colors.textSecondary}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startPlan}
            style={[styles.primaryButton, { backgroundColor: primary }]}
          >
            <Text style={styles.primaryButtonText}>شروع یادگیری</Text>
            <ChevronLeft size={19} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderPlan = () => {
    if (!currentPoem) return null;

    const sessionCount = todaySessionData?.items.length || 0;
    const tasks = todaySessionData?.tasks || [];
    const todayDone = completedDays[selectedDay];

    return (
      <Animated.View
        style={[styles.screen, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}
      >
        <View
          style={[
            styles.planOverview,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
              borderColor: subtleBorder,
            },
          ]}
        >
          <View style={styles.planOverviewTop}>
            <View>
              <Text style={[styles.planEyebrow, { color: primary }]}>مسیر یادگیری</Text>
              <Text style={[styles.planTitle, { color: colors.text }]}>
                {currentPoem.fullTitle}
              </Text>
            </View>
            <View
              style={[
                styles.planPercent,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : `${primary}14` },
              ]}
            >
              <Text style={[styles.planPercentValue, { color: primary }]}>
                {currentStats.percent}٪
              </Text>
              <Text style={[styles.planPercentLabel, { color: colors.textSecondary }]}>تسلط</Text>
            </View>
          </View>
          {renderProgressBar(currentStats.percent, 7)}
          <View style={styles.planStats}>
            <PlanStat
              value={`${currentStats.mastered}`}
              label="بیت مسلط"
              colors={colors}
            />
            <PlanStat value={`${currentStats.total}`} label="کل بیت‌ها" colors={colors} />
            <PlanStat
              value={`${Math.max(0, 30 - selectedDay + 1)}`}
              label="جلسه باقی‌مانده"
              colors={colors}
            />
          </View>
        </View>

        <View style={[styles.todayPlan, { backgroundColor: primary }]}>
          <View style={styles.todayPlanTop}>
            <View>
              <Text style={styles.todayPlanEyebrow}>جلسه امروز</Text>
              <Text style={styles.todayPlanTitle}>جلسه {selectedDay} از ۳۰</Text>
            </View>
            <View style={styles.todayPlanIcon}>
              <Zap size={20} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.todayPlanDivider} />
          {tasks.slice(0, 4).map((task, index) => (
            <View key={`${task}-${index}`} style={styles.todayTask}>
              <View style={styles.todayTaskDot} />
              <Text style={styles.todayTaskText}>{task}</Text>
            </View>
          ))}
          <View style={styles.todayPlanFooter}>
            <View style={styles.todayPlanMeta}>
              <ListChecks size={15} color="rgba(255,255,255,0.82)" />
              <Text style={styles.todayPlanMetaText}>{sessionCount} تمرین</Text>
            </View>
            {todayDone && (
              <View style={styles.completedBadge}>
                <Check size={14} color="#FFFFFF" />
                <Text style={styles.completedBadgeText}>تکمیل شده</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={startTodaySession}
            style={styles.todayStartButton}
          >
            <Play size={18} color={primary} fill={primary} />
            <Text style={[styles.todayStartText, { color: primary }]}>
              {todayDone ? 'مرور دوباره' : 'شروع جلسه'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roadmapSection}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>برنامه ۳۰ جلسه‌ای</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                جلسه موردنظر را انتخاب کنید.
              </Text>
            </View>
          </View>
          <View style={styles.roadmap}>
            {Array.from({ length: 30 }).map((_, index) => {
              const day = index + 1;
              const done = completedDays[day];
              const active = day === selectedDay;
              return (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.78}
                  onPress={() => handleDayChange(day)}
                  style={[
                    styles.roadmapItem,
                    {
                      backgroundColor: active
                        ? isDark
                          ? 'rgba(255,255,255,0.07)'
                          : `${primary}08`
                        : 'transparent',
                      borderColor: active ? primary : subtleBorder,
                    },
                  ]}
                >
                  <View style={styles.roadmapLeft}>
                    <View
                      style={[
                        styles.dayCircle,
                        {
                          backgroundColor: done
                            ? success
                            : active
                              ? primary
                              : mutedSurface,
                        },
                      ]}
                    >
                      {done ? (
                        <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                      ) : (
                        <Text
                          style={[
                            styles.dayNumber,
                            { color: active ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {day}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.dayTitle,
                          { color: active ? primary : colors.text },
                        ]}
                      >
                        جلسه {day}
                      </Text>
                      <Text style={[styles.daySubtitle, { color: colors.textSecondary }]}>
                        {done ? 'تکمیل شده' : active ? 'جلسه فعلی' : 'آماده یادگیری'}
                      </Text>
                    </View>
                  </View>
                  <ChevronLeft size={17} color={active ? primary : colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderSession = () => {
    if (!currentPoem || !sessionQueue.length) return null;

    const exercise = sessionQueue[sessionIndex];
    if (!exercise) return null;

    const stageNames: Record<ExerciseType, string> = {
      choose_misra: 'تشخیص مصرع',
      fill_blank: 'تکمیل جای خالی',
      complete_misra2: 'تکمیل مصرع',
      write_full: 'نوشتن بیت',
      continue_verse: 'ادامه بیت',
      meaning_to_verse: 'معنی به بیت',
      choose_meaning: 'انتخاب معنی',
      concept: 'مفهوم بیت',
      order_number: 'شماره بیت',
    };

    const isChoice = ['choose_misra', 'meaning_to_verse', 'choose_meaning', 'concept', 'order_number'].includes(
      exercise.type
    );

    let correctIndex = -1;
    if (exercise.options) {
      correctIndex = exercise.options.indexOf(exercise.correct);
    }

    const progressPercent = sessionTotal ? ((sessionIndex + 1) / sessionTotal) * 100 : 0;

    return (
      <Animated.View
        style={[
          styles.screen,
          styles.sessionScreen,
          { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
        ]}
      >
        <View style={styles.sessionTop}>
          <View>
            <Text style={[styles.sessionEyebrow, { color: primary }]}>
              {stageNames[exercise.type]}
            </Text>
            <Text style={[styles.sessionCounter, { color: colors.text }]}>
              تمرین {sessionIndex + 1} از {sessionTotal}
            </Text>
          </View>
          <View
            style={[
              styles.sessionIndexBadge,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : `${primary}14` },
            ]}
          >
            <Text style={[styles.sessionIndexText, { color: primary }]}>
              {Math.round(progressPercent)}٪
            </Text>
          </View>
        </View>
        {renderProgressBar(progressPercent, 6)}

        <View
          style={[
            styles.questionCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
              borderColor: subtleBorder,
            },
          ]}
        >
          <View
            style={[
              styles.questionIcon,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : `${primary}14` },
            ]}
          >
            <Target size={20} color={primary} />
          </View>
          <Text style={[styles.questionText, { color: colors.text }]}>{exercise.question}</Text>
          {exercise.display && (
            <View
              style={[
                styles.questionVerse,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                  borderColor: subtleBorder,
                },
              ]}
            >
              <Text style={[styles.questionVerseText, { color: colors.text }]}>
                {exercise.display}
              </Text>
            </View>
          )}
        </View>

        {isChoice && exercise.options && (
          <View style={styles.optionsList}>
            {exercise.options.map((option, index) => {
              const isSelected = index === selectedChoiceIdx;
              const isCorrect = index === correctIndex;

              let borderColor = subtleBorder;
              let backgroundColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)';

              if (submitted && isCorrect) {
                borderColor = success;
                backgroundColor = isDark ? 'rgba(34,197,94,0.10)' : 'rgba(34,197,94,0.06)';
              } else if (submitted && isSelected && !isCorrect) {
                borderColor = danger;
                backgroundColor = isDark ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.06)';
              } else if (isSelected) {
                borderColor = primary;
                backgroundColor = isDark ? 'rgba(139,92,246,0.10)' : 'rgba(139,92,246,0.06)';
              }

              return (
                <TouchableOpacity
                  key={`${index}-${String(option)}`}
                  activeOpacity={0.82}
                  disabled={submitted}
                  onPress={() => handleChoice(index, correctIndex, exercise)}
                  style={[styles.optionButton, { backgroundColor, borderColor }]}
                >
                  <View
                    style={[
                      styles.optionNumber,
                      {
                        backgroundColor: submitted && isCorrect
                          ? success
                          : submitted && isSelected
                            ? danger
                            : isSelected
                              ? primary
                              : mutedSurface,
                      },
                    ]}
                  >
                    {submitted && isCorrect ? (
                      <Check size={14} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.optionNumberText,
                          { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                        ]}
                      >
                        {String.fromCharCode(65 + index)}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {typeof option === 'string' ? option : `بیت ${option + 1}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!isChoice && (
          <View style={styles.answerArea}>
            {exercise.type === 'write_full' ? (
              <>
                <TextInput
                  value={userAnswer1}
                  onChangeText={setUserAnswer1}
                  editable={!submitted}
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                  placeholder="مصرع اول را بنویسید"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.answerInput,
                    {
                      color: colors.text,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                      borderColor: subtleBorder,
                    },
                  ]}
                />
                <TextInput
                  value={userAnswer2}
                  onChangeText={setUserAnswer2}
                  editable={!submitted}
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                  placeholder="مصرع دوم را بنویسید"
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.answerInput,
                    {
                      color: colors.text,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                      borderColor: subtleBorder,
                    },
                  ]}
                />
              </>
            ) : (
              <TextInput
                value={userAnswer}
                onChangeText={setUserAnswer}
                editable={!submitted}
                multiline
                textAlign="right"
                textAlignVertical="top"
                placeholder="پاسخ خود را بنویسید..."
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.answerInput,
                  styles.largeAnswerInput,
                  {
                    color: colors.text,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                    borderColor: subtleBorder,
                  },
                ]}
              />
            )}
            {!submitted && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleSubmitAnswer(exercise)}
                style={[styles.primaryButton, { backgroundColor: primary }]}
              >
                <Check size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>بررسی پاسخ</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {submitted && (
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor:
                  feedbackType === 'correct'
                    ? isDark
                      ? 'rgba(34,197,94,0.09)'
                      : 'rgba(34,197,94,0.06)'
                    : isDark
                      ? 'rgba(239,68,68,0.09)'
                      : 'rgba(239,68,68,0.06)',
                borderColor: feedbackType === 'correct' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
              },
            ]}
          >
            <View
              style={[
                styles.feedbackIcon,
                { backgroundColor: feedbackType === 'correct' ? success : danger },
              ]}
            >
              {feedbackType === 'correct' ? (
                <Check size={15} color="#FFFFFF" />
              ) : (
                <X size={15} color="#FFFFFF" />
              )}
            </View>
            <Text
              style={[
                styles.feedbackText,
                { color: feedbackType === 'correct' ? success : danger },
              ]}
            >
              {feedback}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderResult = () => {
    const percentage = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;
    const message =
      percentage >= 80
        ? 'عملکرد بسیار خوبی داشتید.'
        : percentage >= 50
          ? 'خوب پیش رفتید؛ مرور دوباره به تثبیت کمک می‌کند.'
          : 'این جلسه را دوباره مرور کنید تا بیت‌ها بهتر تثبیت شوند.';

    return (
      <Animated.View
        style={[styles.screen, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}
      >
        <View
          style={[
            styles.resultHero,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
              borderColor: subtleBorder,
            },
          ]}
        >
          <View style={[styles.resultIcon, { backgroundColor: primary }]}>
            <Trophy size={32} color="#FFFFFF" strokeWidth={1.9} />
          </View>
          <Text style={[styles.resultTitle, { color: colors.text }]}>جلسه به پایان رسید</Text>
          <Text style={[styles.resultMessage, { color: colors.textSecondary }]}>{message}</Text>
          <Text style={[styles.resultPercentage, { color: primary }]}>{percentage}٪</Text>
          <Text style={[styles.resultSummary, { color: colors.textSecondary }]}>
            {sessionCorrect} پاسخ صحیح از {sessionTotal} تمرین
          </Text>
          <View
            style={[
              styles.resultProgress,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)' },
            ]}
          >
            <View
              style={[styles.resultProgressFill, { width: `${percentage}%`, backgroundColor: primary }]}
            />
          </View>
        </View>

        <View
          style={[
            styles.resultWeakCard,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.82)',
              borderColor: subtleBorder,
            },
          ]}
        >
          <View style={styles.resultWeakHeader}>
            <Flame size={18} color={warning} />
            <Text style={[styles.resultWeakTitle, { color: colors.text }]}>بیت‌های نیازمند مرور</Text>
          </View>
          <Text style={[styles.resultWeakText, { color: colors.textSecondary }]}>
            {weakItems.length
              ? weakItems
                  .filter((item, index, array) => array.indexOf(item) === index)
                  .map((item) => `بیت ${item}`)
                  .join('، ')
              : 'در این جلسه بیت مهمی برای مرور دوباره ثبت نشد.'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setCurrentView('plan')}
          style={[styles.primaryButton, { backgroundColor: primary }]}
        >
          <RotateCcw size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>ادامه مسیر یادگیری</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setCurrentView('study')}
          style={[styles.secondaryButton, { borderColor: subtleBorder }]}
        >
          <Feather size={18} color={colors.textSecondary} />
          <Text style={[styles.secondaryButtonText, { color: colors.textSecondary }]}>
            بازگشت به شعر
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return renderHome();
      case 'study':
        return renderStudy();
      case 'plan':
        return renderPlan();
      case 'session':
        return renderSession();
      case 'result':
        return renderResult();
      default:
        return renderHome();
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            { direction: isRTL ? 'rtl' : 'ltr' },
          ]}
        >
          {renderContent()}
        </ScrollView>
        {isLoading && (
          <View
            style={[
              styles.loadingOverlay,
              { backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.55)' },
            ]}
          >
            <ActivityIndicator size="small" color={primary} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoCard({
  icon,
  title,
  text,
  colors,
  backgroundColor,
  borderColor,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  colors: any;
  backgroundColor: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor, borderColor }]}>
      <View style={styles.infoCardHeader}>
        <View
          style={[
            styles.infoIcon,
            { backgroundColor: 'rgba(139,92,246,0.08)' },
          ]}
        >
          {icon}
        </View>
        <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.infoText, { color: colors.textSecondary }]}>{text}</Text>
    </View>
  );
}

function LearningMeta({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.learningMetaItem}>
      {icon}
      <Text style={[styles.learningMetaText, { color }]}>{text}</Text>
    </View>
  );
}

function PlanStat({
  value,
  label,
  colors,
}: {
  value: string;
  label: string;
  colors: any;
}) {
  return (
    <View style={styles.planStat}>
      <Text style={[styles.planStatValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.planStatLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  root: { flex: 1 },

  header: {
    minHeight: 76,
    paddingHorizontal: CONTENT_HORIZONTAL,
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },

  headerTitleWrapper: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginHorizontal: 12,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  screen: {
    paddingHorizontal: CONTENT_HORIZONTAL,
    paddingTop: 18,
    paddingBottom: 24,
  },

  homeHero: {
    paddingTop: 12,
    paddingBottom: 20,
  },

  homeHeroBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 9,
  },

  homeHeroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  homeHeroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 2,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 3,
    textAlign: 'right',
  },

  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  poemList: {
    gap: 10,
  },

  poemCard: {
    minHeight: 108,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  poemIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  poemInfo: {
    flex: 1,
  },

  poemTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  poemPoet: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },

  poemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    marginBottom: 6,
  },

  poemStat: {
    fontSize: 10,
    fontWeight: '600',
  },

  homeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
  },

  homeInfoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'right',
  },

  studyHero: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },

  studyHeroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  studyHeroText: {
    alignItems: 'center',
  },

  studyPoet: {
    fontSize: 12,
  },

  studyTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  studyStats: {
    fontSize: 11,
    marginTop: 6,
    marginBottom: 10,
  },

  contentSection: {
    marginBottom: 24,
  },

  poemTextCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    overflow: 'hidden',
  },

  couplet: {
    flexDirection: 'row',
    paddingVertical: 17,
  },

  coupletNumber: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
    marginTop: 2,
  },

  coupletNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },

  coupletContent: {
    flex: 1,
  },

  verseText: {
    fontSize: 15,
    lineHeight: 29,
    textAlign: 'right',
  },

  meaningList: {
    gap: 10,
    marginTop: 13,
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
  },

  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  infoText: {
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'right',
  },

  vocabularyCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 14,
  },

  vocabularyItem: {
    paddingVertical: 12,
  },

  vocabularyWord: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },

  vocabularyMeaning: {
    fontSize: 12,
    lineHeight: 20,
    marginTop: 3,
    textAlign: 'right',
  },

  learningCta: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    marginTop: 4,
  },

  learningCtaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  learningEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },

  learningTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 3,
  },

  learningIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  learningDescription: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
    marginTop: 12,
  },

  learningMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },

  learningMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  learningMetaText: {
    fontSize: 11,
  },

  planOverview: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    marginBottom: 12,
  },

  planOverviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  planEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },

  planTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
    marginTop: 3,
  },

  planPercent: {
    minWidth: 58,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: 'center',
  },

  planPercentValue: {
    fontSize: 16,
    fontWeight: '800',
  },

  planPercentLabel: {
    fontSize: 9,
    marginTop: 1,
  },

  planStats: {
    flexDirection: 'row',
    marginTop: 16,
  },

  planStat: {
    flex: 1,
    alignItems: 'center',
  },

  planStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  planStatLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  todayPlan: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
  },

  todayPlanTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  todayPlanEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    color: 'rgba(255,255,255,0.72)',
  },

  todayPlanTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'right',
    color: '#FFFFFF',
  },

  todayPlanIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  todayPlanDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginVertical: 14,
  },

  todayTask: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  todayTaskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },

  todayTaskText: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    color: 'rgba(255,255,255,0.88)',
  },

  todayPlanFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },

  todayPlanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  todayPlanMetaText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 11,
  },

  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },

  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  todayStartButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  todayStartText: {
    fontSize: 14,
    fontWeight: '800',
  },

  roadmapSection: {
    marginBottom: 10,
  },

  roadmap: {
    gap: 8,
  },

  roadmapItem: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  roadmapLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  dayNumber: {
    fontSize: 11,
    fontWeight: '800',
  },

  dayTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },

  daySubtitle: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'right',
  },

  sessionScreen: {
    paddingTop: 18,
  },

  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  sessionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right',
  },

  sessionCounter: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 3,
    textAlign: 'right',
  },

  sessionIndexBadge: {
    minWidth: 52,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sessionIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },

  questionCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    marginBottom: 12,
  },

  questionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },

  questionText: {
    fontSize: 18,
    lineHeight: 29,
    fontWeight: '800',
    textAlign: 'right',
  },

  questionVerse: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 14,
    marginTop: 14,
  },

  questionVerseText: {
    fontSize: 14,
    lineHeight: 28,
    textAlign: 'right',
  },

  optionsList: {
    gap: 9,
    marginTop: 3,
  },

  optionButton: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 16,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  optionNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },

  optionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'right',
  },

  answerArea: {
    marginTop: 3,
    gap: 9,
  },

  answerInput: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 24,
  },

  largeAnswerInput: {
    minHeight: 120,
  },

  feedbackCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },

  feedbackIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  feedbackText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'right',
  },

  resultHero: {
    borderWidth: 1,
    borderRadius: 21,
    padding: 23,
    alignItems: 'center',
  },

  resultIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  resultTitle: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },

  resultMessage: {
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },

  resultPercentage: {
    fontSize: 52,
    lineHeight: 62,
    fontWeight: '800',
    marginTop: 10,
  },

  resultSummary: {
    fontSize: 12,
    textAlign: 'center',
  },

  resultProgress: {
    width: '100%',
    height: 7,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
  },

  resultProgressFill: {
    height: 7,
    borderRadius: 10,
  },

  resultWeakCard: {
    borderWidth: 1,
    borderRadius: 17,
    padding: 15,
    marginTop: 10,
    marginBottom: 9,
  },

  resultWeakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },

  resultWeakTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  resultWeakText: {
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'right',
  },

  primaryButton: {
    minHeight: 50,
    borderRadius: 15,
    marginTop: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  secondaryButton: {
    minHeight: 50,
    borderRadius: 15,
    marginTop: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  progressTrack: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },

  progressFill: {
    borderRadius: 20,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});