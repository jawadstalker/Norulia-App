import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Heart,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  XCircle,
} from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

/* =========================================================
   TYPES
========================================================= */

type StudyMode = 'today' | 'review';

type QuizType =
  | 'ayah_number'
  | 'translation'
  | 'continuation'
  | 'verse_from_translation'
  | 'word_line';

interface QuranVerse {
  number: number;
  arabic: string;
  translation: string;
}

interface DayPlan {
  day: number;
  verses: number[];
}

interface QuizQuestion {
  id: string;
  type: QuizType;
  ayah?: number;
  word?: string;
  prompt: string;
  display: string;
  options?: string[] | number[];
  answer: string | number;
  typeLabel: string;
}

interface QuizResult {
  correct: number;
  total: number;
  percentage: number;
}

/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = 'quran_memorization_progress_v2';
const LAST_UPDATE_KEY = 'quran_last_update_v2';

/*
 * برنامه حفظ همان برنامه quran.html
 */
const PLAN: DayPlan[] = [
  {
    day: 1,
    verses: [1, 2, 3],
  },
  {
    day: 2,
    verses: [4, 5],
  },
  {
    day: 3,
    verses: [6, 7],
  },
  {
    day: 4,
    verses: [8, 9],
  },
  {
    day: 5,
    verses: [10, 11],
  },
  {
    day: 6,
    verses: [12],
  },
];

/*
 * سوره یس
 *
 * داده‌های این بخش از quran.html گرفته شده‌اند.
 * آیه 12 نیز برای جلوگیری از خطای داده‌ای HTML
 * به صورت مستقل اصلاح شده است.
 */
const SURAH_YASIN: QuranVerse[] = [
  {
    number: 1,
    arabic: 'يسٓ',
    translation: 'یس',
  },
  {
    number: 2,
    arabic: 'وَٱلۡقُرۡءَانِ ٱلۡحَكِيمِ',
    translation: 'سوگند به قرآن حکیم',
  },
  {
    number: 3,
    arabic: 'إِنَّكَ لَمِنَ ٱلۡمُرۡسَلِينَ',
    translation: 'که تو از پیامبرانی',
  },
  {
    number: 4,
    arabic: 'عَلَىٰ صِرَٰطٖ مُّسۡتَقِيمٖ',
    translation: 'بر راه راست',
  },
  {
    number: 5,
    arabic: 'تَنزِيلَ ٱلۡعَزِيزِ ٱلرَّحِيمِ',
    translation: 'نازل شده از سوی عزیزِ رحیم',
  },
  {
    number: 6,
    arabic:
      'لِتُنذِرَ قَوۡمٗا مَّآ أُنذِرَ ءَابَآؤُهُمۡ فَهُمۡ غَٰفِلُونَ لَقَدۡ حَقَّ ٱلۡقَوۡلُ عَلَىٰٓ أَكۡثَرِهِمۡ فَهُمۡ لَا يُؤۡمِنُونَ',
    translation:
      'تا قومی را که پدرانشان انذار نشده‌اند و غافلند، بترسانی',
  },
  {
    number: 7,
    arabic:
      'إِنَّا جَعَلۡنَا فِيٓ أَعۡنَٰقِهِمۡ أَغۡلَٰلٗا فَهِيَ إِلَى ٱلۡأَذۡقَانِ فَهُم مُّقۡمَحُونَ',
    translation:
      'به تحقیق که گفتار بر بیشترشان محقق شده، پس ایمان نمی‌آورند',
  },
  {
    number: 8,
    arabic:
      'وَجَعَلۡنَا مِنۢ بَيۡنِ أَيۡدِيهِمۡ سَدّٗا وَمِنۡ خَلۡفِهِمۡ سَدّٗا فَأَغۡشَيۡنَٰهُمۡ فَهُمۡ لَا يُبۡصِرُونَ',
    translation:
      'ما در گردن‌هایشان غل‌هایی قرار داده‌ایم که تا چانه‌هاست، پس سرهایشان بالا نگه داشته شده',
  },
  {
    number: 9,
    arabic:
      'وَسَوَآءٌ عَلَيۡهِمۡ ءَأَنذَرۡتَهُمۡ أَمۡ لَمۡ تُنذِرۡهُمۡ لَا يُؤۡمِنُونَ',
    translation:
      'و از پیش رویشان سدی و از پشت سرشان سدی قرار داده‌ایم و بر چشمانشان پرده‌ای افکنده‌ایم، پس نمی‌بینند',
  },
  {
    number: 10,
    arabic:
      'إِنَّمَا تُنذِرُ مَنِ ٱتَّبَعَ ٱلذِّكۡرَ وَخَشِيَ ٱلرَّحۡمَٰنَ بِٱلۡغَيۡبِۖ فَبَشِّرۡهُ بِمَغۡفِرَةٖ وَأَجۡرٖ كَرِيمٍ',
    translation:
      'و برایشان یکسان است، چه انذارشان کنی یا نکنی، ایمان نمی‌آورند',
  },
  {
    number: 11,
    arabic:
      'إِنَّا نَحۡنُ نُحۡيِ ٱلۡمَوۡتَىٰ وَنَكۡتُبُ مَا قَدَّمُواْ وَءَاثَٰرَهُمۡۚ وَكُلَّ شَيۡءٍ أَحۡصَيۡنَٰهُ فِيٓ إِمَامٖ مُّبِينٖ',
    translation:
      'تنها کسی را انذار می‌کنی که از ذکر پیروی کند و از رحمان در نهان بترسد، پس او را به آمرزش و پاداشی کریم مژده بده',
  },
  {
    number: 12,
    arabic:
      'إِنَّا نَحۡنُ نُحۡيِ ٱلۡمَوۡتَىٰ وَنَكۡتُبُ مَا قَدَّمُواْ وَءَاثَٰرَهُمۡۚ وَكُلَّ شَيۡءٍ أَحۡصَيۡنَٰهُ فِيٓ إِمَامٖ مُّبِينٖ',
    translation:
      'همانا ما هستیم که مردگان را زنده می‌کنیم و آنچه را پیش فرستاده‌اند و آثارشان را می‌نویسیم و هر چیزی را در لوحی مبین شمارش کرده‌ایم',
  },
];

/*
 * برای آزمون word_line
 * خطوط تقریبی صفحه قرآن همان ساختار quran.html هستند.
 */
const WORD_LINE_LOCATIONS: Record<string, number> = {
  يسٓ: 1,
  'وَٱلۡقُرۡءَانِ': 1,
  'ٱلۡحَكِيمِ': 1,
  'إِنَّكَ': 1,
  'لَمِنَ': 1,
  'ٱلۡمُرۡسَلِينَ': 1,
  'عَلَىٰ': 1,

  'صِرَٰطٖ': 2,
  'مُّسۡتَقِيمٖ': 2,
  'تَنزِيلَ': 2,
  'ٱلۡعَزِيزِ': 2,
  'ٱلرَّحِيمِ': 2,

  'لِتُنذِرَ': 3,
  'قَوۡمٗا': 3,
  'مَّآ': 3,
  'أُنذِرَ': 3,
  'ءَابَآؤُهُمۡ': 3,
  'غَٰفِلُونَ': 3,

  'لَقَدۡ': 4,
  'حَقَّ': 4,
  'ٱلۡقَوۡلُ': 4,
  'أَكۡثَرِهِمۡ': 4,

  'فَهُمۡ': 5,
  'لَا': 5,
  'يُؤۡمِنُونَ': 5,
  'إِنَّا': 5,
  'جَعَلۡنَا': 5,
  'فِيٓ': 5,

  'أَعۡنَٰقِهِمۡ': 5,
  'أَغۡلَٰلٗا': 5,
  'فَهِيَ': 5,
  'إِلَى': 5,

  'ٱلۡأَذۡقَانِ': 6,
  'فَهُم': 6,
  'مُّقۡمَحُونَ': 6,
  'وَجَعَلۡنَا': 6,
  'مِنۢ': 6,
  'بَيۡنِ': 6,
  'أَيۡدِيهِمۡ': 6,

  'سَدّٗا': 6,
  'وَمِنۡ': 7,
  'خَلۡفِهِمۡ': 7,
  'فَأَغۡشَيۡنَٰهُمۡ': 7,
  'يُبۡصِرُونَ': 7,

  'وَسَوَآءٌ': 7,
  'عَلَيۡهِمۡ': 8,
  'ءَأَنذَرۡتَهُمۡ': 8,
  'أَمۡ': 8,
  'لَمۡ': 8,
  'تُنذِرۡهُمۡ': 8,

  'إِنَّمَا': 8,
  'تُنذِرُ': 8,
  'مَنِ': 9,
  'ٱتَّبَعَ': 9,
  'ٱلذِّكۡرَ': 9,
  'وَخَشِيَ': 9,
  'ٱلرَّحۡمَٰنَ': 9,
  'بِٱلۡغَيۡبِۖ': 9,
  'فَبَشِّرۡهُ': 9,
  'بِمَغۡفِرَةٖ': 9,

  'وَأَجۡرٖ': 10,
  'كَرِيمٍ': 10,
  'نَحۡنُ': 10,
  'نُحۡيِ': 10,
  'ٱلۡمَوۡتَىٰ': 10,
  'وَنَكۡتُبُ': 10,

  'مَا': 11,
  'قَدَّمُواْ': 11,
  'وَءَاثَٰرَهُمۡۚ': 11,
  'وَكُلَّ': 11,
  'شَيۡءٍ': 11,
  'أَحۡصَيۡنَٰهُ': 11,
  'إِمَامٖ': 11,
  'مُّبِينٖ': 11,
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeArabic = (value: string) => {
  return value
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[^\d۰-۹]/g, '');
};

const getVerse = (number: number) => {
  return SURAH_YASIN.find(v => v.number === number);
};

const getDayPlan = (day: number) => {
  return PLAN.find(p => p.day === day);
};

const shuffle = <T,>(array: T[]): T[] => {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
};

const getWordsFromVerses = (verses: number[]) => {
  const result: string[] = [];

  Object.keys(WORD_LINE_LOCATIONS).forEach(word => {
    const exists = verses.some(verseNumber => {
      const verse = getVerse(verseNumber);

      return verse?.arabic.includes(word);
    });

    if (exists) {
      result.push(word);
    }
  });

  return result;
};

const makeShortText = (text: string, length = 45) => {
  if (text.length <= length) {
    return text;
  }

  return `${text.substring(0, length)}...`;
};

/* =========================================================
   QUESTION GENERATOR
========================================================= */

const generateQuestions = (
  verses: number[],
  count: number,
): QuizQuestion[] => {
  if (!verses.length) {
    return [];
  }

  const questions: QuizQuestion[] = [];

  const availableVerses = shuffle(verses);
  const availableWords = shuffle(getWordsFromVerses(verses));

  /*
   * دقیقاً مشابه HTML:
   * حداکثر تعداد سؤال برابر count است.
   */
  const questionCount = Math.min(
    count,
    availableVerses.length + Math.floor(availableWords.length / 2),
    12,
  );

  let verseCursor = 0;
  let wordCursor = 0;

  for (
    let i = 0;
    i < questionCount && i < 12;
    i += 1
  ) {
    /*
     * چون HTML از انتخاب تصادفی استفاده می‌کرد،
     * نوع سؤال هم تصادفی است.
     */
    const possibleTypes: QuizType[] = [
      'ayah_number',
      'translation',
      'continuation',
      'verse_from_translation',
      'word_line',
    ];

    let type =
      possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    /*
     * اگر دیگر verse نداریم، فقط word_line امکان‌پذیر است.
     */
    if (verseCursor >= availableVerses.length) {
      type = 'word_line';
    }

    /*
     * اگر word نداریم، از چهار نوع آیه استفاده کن.
     */
    if (
      type === 'word_line' &&
      wordCursor >= availableWords.length
    ) {
      type = possibleTypes[
        Math.floor(Math.random() * 4)
      ];
    }

    /* -----------------------------------------------------
       1. شماره آیه
    ----------------------------------------------------- */

    if (type === 'ayah_number') {
      if (verseCursor >= availableVerses.length) {
        continue;
      }

      const ayahNumber = availableVerses[verseCursor];
      verseCursor += 1;

      const verse = getVerse(ayahNumber);

      if (!verse) {
        continue;
      }

      questions.push({
        id: `${Date.now()}-${i}-ayah`,
        type: 'ayah_number',
        ayah: ayahNumber,
        prompt:
          'شماره آیه‌ای که متن زیر مربوط به آن است را وارد کنید.',
        display: makeShortText(verse.arabic),
        answer: String(ayahNumber),
        typeLabel: 'شماره آیه',
      });

      continue;
    }

    /* -----------------------------------------------------
       2. ترجمه
    ----------------------------------------------------- */

    if (type === 'translation') {
      if (verseCursor >= availableVerses.length) {
        continue;
      }

      const ayahNumber = availableVerses[verseCursor];
      verseCursor += 1;

      const verse = getVerse(ayahNumber);

      if (!verse) {
        continue;
      }

      const otherTranslations = verses
        .filter(number => number !== ayahNumber)
        .map(number => getVerse(number)?.translation)
        .filter(Boolean) as string[];

      const options = shuffle([
        verse.translation,
        ...shuffle(otherTranslations).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-translation`,
        type: 'translation',
        ayah: ayahNumber,
        prompt:
          'ترجمه صحیح این آیه را از بین گزینه‌های زیر انتخاب کنید.',
        display: makeShortText(verse.arabic),
        options,
        answer: verse.translation,
        typeLabel: 'ترجمه',
      });

      continue;
    }

    /* -----------------------------------------------------
       3. ادامه آیه
    ----------------------------------------------------- */

    if (type === 'continuation') {
      if (verseCursor >= availableVerses.length) {
        continue;
      }

      const ayahNumber = availableVerses[verseCursor];
      verseCursor += 1;

      const verse = getVerse(ayahNumber);

      if (!verse) {
        continue;
      }

      const words = verse.arabic.split(' ');

      const halfIndex = Math.max(
        1,
        Math.floor(words.length / 2),
      );

      const firstHalf = words
        .slice(0, halfIndex)
        .join(' ');

      const secondHalf = words
        .slice(halfIndex)
        .join(' ');

      const otherContinuations = verses
        .filter(number => number !== ayahNumber)
        .map(number => {
          const other = getVerse(number);

          if (!other) {
            return '';
          }

          const otherWords = other.arabic.split(' ');

          const otherHalf = Math.max(
            1,
            Math.floor(otherWords.length / 2),
          );

          return otherWords
            .slice(otherHalf)
            .join(' ');
        })
        .filter(Boolean)
        .filter(item => item !== secondHalf);

      const options = shuffle([
        secondHalf,
        ...shuffle(otherContinuations).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-continuation`,
        type: 'continuation',
        ayah: ayahNumber,
        prompt:
          'ادامه صحیح این آیه را از بین گزینه‌های زیر انتخاب کنید.',
        display: `${firstHalf} ...`,
        options,
        answer: secondHalf,
        typeLabel: 'تکمیل آیه',
      });

      continue;
    }

    /* -----------------------------------------------------
       4. تشخیص آیه از روی ترجمه
    ----------------------------------------------------- */

    if (type === 'verse_from_translation') {
      if (verseCursor >= availableVerses.length) {
        continue;
      }

      const ayahNumber = availableVerses[verseCursor];
      verseCursor += 1;

      const verse = getVerse(ayahNumber);

      if (!verse) {
        continue;
      }

      const numberOptions = shuffle([
        ayahNumber,
        ...shuffle(
          verses.filter(number => number !== ayahNumber),
        ).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-verse`,
        type: 'verse_from_translation',
        ayah: ayahNumber,
        prompt: 'این ترجمه مربوط به کدام آیه است؟',
        display: verse.translation,
        options: numberOptions,
        answer: ayahNumber,
        typeLabel: 'تشخیص آیه',
      });

      continue;
    }

    /* -----------------------------------------------------
       5. تشخیص خط
    ----------------------------------------------------- */

    if (type === 'word_line') {
      if (wordCursor >= availableWords.length) {
        continue;
      }

      const word = availableWords[wordCursor];
      wordCursor += 1;

      const correctLine =
        WORD_LINE_LOCATIONS[word];

      if (!correctLine) {
        continue;
      }

      const lineOptions = shuffle([
        correctLine,
        ...shuffle(
          Array.from({ length: 11 }, (_, index) => index + 1)
            .filter(line => line !== correctLine),
        ).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-line`,
        type: 'word_line',
        word,
        prompt:
          'کلمه زیر در کدام خط صفحه قرآن قرار دارد؟',
        display: word,
        options: lineOptions,
        answer: correctLine,
        typeLabel: 'تشخیص خط',
      });
    }
  }

  return questions;
};

/* =========================================================
   MAIN SCREEN
========================================================= */

export default function QuranScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [currentDay, setCurrentDay] = useState(1);

  const [isStudyComplete, setIsStudyComplete] =
    useState(false);

  const [isReviewMode, setIsReviewMode] =
    useState(false);

  const [showTranslation, setShowTranslation] =
    useState(true);

  const [showReview, setShowReview] =
    useState(false);

  const [quizVisible, setQuizVisible] =
    useState(false);

  const [quizMode, setQuizMode] =
    useState<StudyMode>('today');

  const [quizQuestions, setQuizQuestions] =
    useState<QuizQuestion[]>([]);

  const [quizIndex, setQuizIndex] = useState(0);

  const [selectedOption, setSelectedOption] =
    useState<string | number | null>(null);

  const [fillAnswer, setFillAnswer] =
    useState('');

  const [questionAnswered, setQuestionAnswered] =
    useState(false);

  const [questionCorrect, setQuestionCorrect] =
    useState<boolean | null>(null);

  const [quizCorrect, setQuizCorrect] = useState(0);

  const [quizResult, setQuizResult] =
    useState<QuizResult | null>(null);

  const [favorite, setFavorite] =
    useState(false);

  const [playing, setPlaying] =
    useState(false);

  const fadeAnim = useRef(
    new Animated.Value(0),
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(0.97),
  ).current;

  /* =======================================================
     CURRENT DAY DATA
  ======================================================= */

  const todayVerses = useMemo(
    () => getDayPlan(currentDay)?.verses ?? [],
    [currentDay],
  );

  const previousVerses = useMemo(() => {
    const result: number[] = [];

    for (let day = 1; day < currentDay; day += 1) {
      const plan = getDayPlan(day);

      if (plan) {
        result.push(...plan.verses);
      }
    }

    return result;
  }, [currentDay]);

  const totalVerses = SURAH_YASIN.length;

  const memorizedVerses = useMemo(() => {
    let count = 0;

    for (let day = 1; day <= PLAN.length; day += 1) {
      if (
        day < currentDay ||
        (day === currentDay && isStudyComplete)
      ) {
        count += getDayPlan(day)?.verses.length ?? 0;
      }
    }

    return count;
  }, [currentDay, isStudyComplete]);

  const progress = Math.round(
    (memorizedVerses / totalVerses) * 100,
  );

  const currentQuestion =
    quizQuestions[quizIndex];

  /* =======================================================
     LOAD / SAVE PROGRESS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        /*
         * AsyncStorage را عمداً با import داخلی استفاده می‌کنیم
         * تا ساختار فعلی پروژه نیاز به تغییر دیگری نداشته باشد.
         */
        const AsyncStorage =
          require('@react-native-async-storage/async-storage')
            .default;

        const saved =
          await AsyncStorage.getItem(STORAGE_KEY);

        const savedDate =
          await AsyncStorage.getItem(LAST_UPDATE_KEY);

        const todayKey = new Date()
          .toISOString()
          .slice(0, 10);

        if (
          savedDate &&
          savedDate !== todayKey
        ) {
          /*
           * مشابه quran.html:
           * با شروع روز جدید، مطالعه همان روز دوباره فعال می‌شود.
           */
          setIsStudyComplete(false);

          await AsyncStorage.setItem(
            LAST_UPDATE_KEY,
            todayKey,
          );
        }

        if (saved && mounted) {
          try {
            const data = JSON.parse(saved);

            if (
              typeof data.currentDay === 'number'
            ) {
              setCurrentDay(
                Math.max(
                  1,
                  Math.min(
                    PLAN.length,
                    data.currentDay,
                  ),
                ),
              );
            }

            if (
              typeof data.isStudyComplete ===
              'boolean'
            ) {
              setIsStudyComplete(
                data.isStudyComplete,
              );
            }
          } catch {
            // ignore invalid storage
          }
        }

        if (!savedDate) {
          await AsyncStorage.setItem(
            LAST_UPDATE_KEY,
            todayKey,
          );
        }
      } catch {
        // AsyncStorage unavailable
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const save = async () => {
      try {
        const AsyncStorage =
          require('@react-native-async-storage/async-storage')
            .default;

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            currentDay,
            isStudyComplete,
          }),
        );
      } catch {
        // ignore
      }
    };

    save();
  }, [currentDay, isStudyComplete]);

  /* =======================================================
     SCREEN ANIMATION
  ======================================================= */

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.97);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* =======================================================
     RESET QUESTION
  ======================================================= */

  const resetQuestionState = () => {
    setSelectedOption(null);
    setFillAnswer('');
    setQuestionAnswered(false);
    setQuestionCorrect(null);
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    if (quizVisible) {
      setQuizVisible(false);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  /* =======================================================
     START QUIZ
  ======================================================= */

  const startQuiz = (mode: StudyMode) => {
    const verses =
      mode === 'today'
        ? todayVerses
        : previousVerses;

    if (!verses.length) {
      Alert.alert(
        mode === 'today'
          ? 'آزمون امروز'
          : 'آزمون مرور',
        mode === 'today'
          ? 'هیچ آیاتی برای امروز تعیین نشده است.'
          : 'هنوز آیات قبلی برای آزمون مرور وجود ندارد.',
      );

      return;
    }

    if (
      mode === 'today' &&
      isStudyComplete
    ) {
      Alert.alert(
        'آزمون امروز',
        'مطالعه امروز انجام شده است. آزمون امروز فقط قبل از پایان مطالعه قابل انجام است.',
      );

      return;
    }

    const count =
      mode === 'today'
        ? Math.min(5, verses.length)
        : Math.min(10, verses.length);

    const generated =
      generateQuestions(verses, count);

    if (!generated.length) {
      Alert.alert(
        'آزمون',
        'در حال حاضر سؤالی برای تولید وجود ندارد.',
      );

      return;
    }

    setQuizMode(mode);
    setQuizQuestions(generated);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizResult(null);
    resetQuestionState();
    setQuizVisible(true);
  };

  /* =======================================================
     ANSWER CHECK
  ======================================================= */

  const submitCurrentAnswer = () => {
    if (!currentQuestion || questionAnswered) {
      return;
    }

    let correct = false;

    if (
      currentQuestion.type ===
      'ayah_number'
    ) {
      const answer = fillAnswer.trim();

      correct =
        answer ===
        String(currentQuestion.answer);
    } else {
      if (selectedOption === null) {
        return;
      }

      correct =
        String(selectedOption) ===
        String(currentQuestion.answer);
    }

    setQuestionAnswered(true);
    setQuestionCorrect(correct);

    if (correct) {
      setQuizCorrect(value => value + 1);

      /*
       * بازخورد لمسی کوچک
       */
      // Vibration در اینجا عمداً حذف شده تا روی دستگاه‌های
      // مختلف رفتار متفاوت ایجاد نکند.
    }
  };

  /* =======================================================
     NEXT QUESTION
  ======================================================= */

  const nextQuestion = () => {
    if (!questionAnswered) {
      return;
    }

    if (
      quizIndex >=
      quizQuestions.length - 1
    ) {
      /*
       * quizCorrect با setState ممکن است هنوز
       * مقدار آخر را نگرفته باشد؛ بنابراین نتیجه
       * را مستقیم از questionCorrect محاسبه می‌کنیم.
       */
      const finalCorrect =
        quizCorrect +
        (questionCorrect ? 1 : 0);

      const total =
        quizQuestions.length;

      const percentage =
        total > 0
          ? Math.round(
              (finalCorrect / total) * 100,
            )
          : 0;

      setQuizResult({
        correct: finalCorrect,
        total,
        percentage,
      });

      return;
    }

    setQuizIndex(index => index + 1);
    resetQuestionState();
  };

  /* =======================================================
     REGENERATE QUIZ
  ======================================================= */

  const regenerateQuiz = () => {
    const verses =
      quizMode === 'today'
        ? todayVerses
        : previousVerses;

    const count =
      quizMode === 'today'
        ? Math.min(5, verses.length)
        : Math.min(10, verses.length);

    const generated =
      generateQuestions(
        verses,
        count,
      );

    setQuizQuestions(generated);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizResult(null);
    resetQuestionState();
  };

  /* =======================================================
     FINISH STUDY
  ======================================================= */

  const finishStudy = () => {
    if (isStudyComplete) {
      Alert.alert(
        'مطالعه امروز',
        'مطالعه امروز قبلاً انجام شده است.',
      );

      return;
    }

    if (!todayVerses.length) {
      Alert.alert(
        'مطالعه',
        'هیچ آیاتی برای امروز تعیین نشده است.',
      );

      return;
    }

    Alert.alert(
      'پایان مطالعه',
      `آیا از حفظ آیات ${todayVerses.join(
        '، ',
      )} اطمینان دارید؟`,
      [
        {
          text: 'لغو',
          style: 'cancel',
        },
        {
          text: 'بله، پایان مطالعه',
          onPress: () => {
            if (
              currentDay <
              PLAN.length
            ) {
              const nextDay =
                currentDay + 1;

              setCurrentDay(nextDay);
              setIsStudyComplete(false);

              Alert.alert(
                '🎉 تبریک!',
                `روز ${currentDay} کامل شد.\nروز ${nextDay} فعال شد.`,
              );
            } else {
              setIsStudyComplete(true);

              Alert.alert(
                '🎉 مبارک!',
                'شما برنامه حفظ سوره یس را کامل کردید.',
              );
            }
          },
        },
      ],
    );
  };

  /* =======================================================
     REVIEW MODE
  ======================================================= */

  const toggleReviewMode = () => {
    if (!previousVerses.length) {
      Alert.alert(
        'مرور',
        'هنوز آیات قبلی برای مرور وجود ندارد.',
      );

      return;
    }

    setIsReviewMode(value => !value);
    setShowReview(true);
  };

  /* =======================================================
     AUDIO PLACEHOLDER
  ======================================================= */

  const playAudio = () => {
    if (playing) {
      return;
    }

    setPlaying(true);

    setTimeout(() => {
      setPlaying(false);
    }, 2500);
  };

  /* =======================================================
     QUIZ RESULT
  ======================================================= */

  const renderQuizResult = () => {
    if (!quizResult) {
      return null;
    }

    const perfect =
      quizResult.correct ===
      quizResult.total;

    const good =
      quizResult.percentage >= 50;

    return (
      <View
        style={[
          styles.resultContainer,
          {
            backgroundColor:
              colors.card ??
              'rgba(255,255,255,0.06)',
            borderColor:
              colors.border ??
              'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View style={styles.resultIcon}>
          {perfect ? (
            <Trophy
              size={42}
              color="#F5D76E"
            />
          ) : good ? (
            <Award
              size={42}
              color={colors.primary}
            />
          ) : (
            <Target
              size={42}
              color={colors.primary}
            />
          )}
        </View>

        <Text
          style={[
            styles.resultScore,
            {
              color: colors.primary,
            },
          ]}
        >
          {quizResult.correct}/
          {quizResult.total}
        </Text>

        <Text
          style={[
            styles.resultPercentage,
            {
              color:
                colors.textSecondary ??
                '#999',
            },
          ]}
        >
          {quizResult.percentage}٪
        </Text>

        <Text
          style={[
            styles.resultTitle,
            {
              color:
                colors.text ??
                '#fff',
            },
          ]}
        >
          {quizMode === 'today'
            ? 'نتیجه آزمون امروز'
            : 'نتیجه آزمون مرور'}
        </Text>

        <Text
          style={[
            styles.resultMessage,
            {
              color:
                colors.textSecondary ??
                '#aaa',
            },
          ]}
        >
          {perfect
            ? '🎉 عالی! همه پاسخ‌ها صحیح بودند.'
            : good
            ? '👍 خوب است، ادامه بده!'
            : '💪 نیاز به مرور بیشتری داری.'}
        </Text>

        <View style={styles.resultActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={regenerateQuiz}
            style={[
              styles.secondaryButton,
              {
                borderColor:
                  colors.border ??
                  'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <RefreshCw
              size={18}
              color={
                colors.textSecondary ??
                '#aaa'
              }
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    colors.textSecondary ??
                    '#aaa',
                },
              ]}
            >
              تولید مجدد
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setQuizVisible(false);
            }}
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <CheckCircle
              size={18}
              color="#fff"
            />

            <Text style={styles.primaryButtonText}>
              پایان
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* =======================================================
     QUESTION RENDER
  ======================================================= */

  const renderQuestion = () => {
    if (!currentQuestion) {
      return null;
    }

    const optionIsCorrect = (
      option: string | number,
    ) =>
      questionAnswered &&
      String(option) ===
        String(currentQuestion.answer);

    const optionIsSelected = (
      option: string | number,
    ) =>
      String(selectedOption) ===
      String(option);

    return (
      <View>
        {/* QUESTION HEADER */}

        <View style={styles.quizProgressRow}>
          <View>
            <Text
              style={[
                styles.questionCounter,
                {
                  color:
                    colors.textSecondary ??
                    '#aaa',
                },
              ]}
            >
              سؤال {quizIndex + 1} از{' '}
              {quizQuestions.length}
            </Text>

            <Text
              style={[
                styles.questionType,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {currentQuestion.typeLabel}
            </Text>
          </View>

          <View
            style={[
              styles.quizBadge,
              {
                backgroundColor:
                  `${colors.primary}18`,
              },
            ]}
          >
            <Target
              size={16}
              color={colors.primary}
            />

            <Text
              style={[
                styles.quizBadgeText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {quizMode === 'today'
                ? 'امروز'
                : 'مرور'}
            </Text>
          </View>
        </View>

        {/* PROMPT */}

        <View
          style={[
            styles.promptCard,
            {
              backgroundColor:
                colors.card ??
                'rgba(255,255,255,0.05)',
              borderColor:
                colors.border ??
                'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.promptText,
              {
                color:
                  colors.text ??
                  '#fff',
              },
            ]}
          >
            {currentQuestion.prompt}
          </Text>
        </View>

        {/* DISPLAY */}

        <View
          style={[
            styles.displayCard,
            {
              backgroundColor:
                isDark
                  ? 'rgba(255,255,255,0.035)'
                  : 'rgba(0,0,0,0.035)',
              borderColor:
                colors.border ??
                'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.displayText,
              {
                color:
                  colors.text ??
                  '#fff',
              },
            ]}
          >
            {currentQuestion.display}
          </Text>
        </View>

        {/* FILL INPUT */}

        {currentQuestion.type ===
          'ayah_number' && (
          <View>
            <TextInput
              value={fillAnswer}
              onChangeText={setFillAnswer}
              editable={!questionAnswered}
              keyboardType="number-pad"
              placeholder="شماره آیه را وارد کنید..."
              placeholderTextColor={
                colors.textSecondary ??
                '#888'
              }
              style={[
                styles.input,
                {
                  color:
                    colors.text ??
                    '#fff',
                  borderColor:
                    questionAnswered
                      ? questionCorrect
                        ? '#34D399'
                        : '#FF6B81'
                      : colors.border ??
                        'rgba(255,255,255,0.12)',
                  backgroundColor:
                    colors.card ??
                    'rgba(255,255,255,0.05)',
                },
              ]}
            />
          </View>
        )}

        {/* OPTIONS */}

        {currentQuestion.options &&
          currentQuestion.type !==
            'ayah_number' && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map(
                (option, index) => {
                  const selected =
                    optionIsSelected(
                      option,
                    );

                  const correct =
                    optionIsCorrect(
                      option,
                    );

                  const wrong =
                    questionAnswered &&
                    selected &&
                    !correct;

                  let borderColor =
                    colors.border ??
                    'rgba(255,255,255,0.1)';

                  let backgroundColor =
                    colors.card ??
                    'rgba(255,255,255,0.04)';

                  let textColor =
                    colors.text ??
                    '#fff';

                  if (correct) {
                    borderColor =
                      '#34D399';
                    backgroundColor =
                      'rgba(52,211,153,0.08)';
                    textColor =
                      '#34D399';
                  } else if (wrong) {
                    borderColor =
                      '#FF6B81';
                    backgroundColor =
                      'rgba(255,107,129,0.08)';
                    textColor =
                      '#FF6B81';
                  } else if (selected) {
                    borderColor =
                      colors.primary;
                    backgroundColor =
                      `${colors.primary}15`;
                  }

                  return (
                    <TouchableOpacity
                      key={`${currentQuestion.id}-${index}`}
                      disabled={
                        questionAnswered
                      }
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedOption(
                          option,
                        );
                      }}
                      style={[
                        styles.option,
                        {
                          borderColor,
                          backgroundColor,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.optionIndex,
                          {
                            borderColor,
                          },
                        ]}
                      >
                        {correct ? (
                          <CheckCircle
                            size={17}
                            color="#34D399"
                          />
                        ) : wrong ? (
                          <XCircle
                            size={17}
                            color="#FF6B81"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.optionIndexText,
                              {
                                color:
                                  textColor,
                              },
                            ]}
                          >
                            {String.fromCharCode(
                              1575 + index,
                            )}
                          </Text>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          {
                            color:
                              textColor,
                          },
                          currentQuestion.type ===
                            'continuation' && {
                            fontFamily:
                              'serif',
                            lineHeight: 32,
                          },
                        ]}
                      >
                        {String(option)}
                      </Text>
                    </TouchableOpacity>
                  );
                },
              )}
            </View>
          )}

        {/* FEEDBACK */}

        {questionAnswered && (
          <View
            style={[
              styles.feedback,
              {
                backgroundColor:
                  questionCorrect
                    ? 'rgba(52,211,153,0.08)'
                    : 'rgba(255,107,129,0.08)',
                borderColor:
                  questionCorrect
                    ? 'rgba(52,211,153,0.25)'
                    : 'rgba(255,107,129,0.25)',
              },
            ]}
          >
            {questionCorrect ? (
              <CheckCircle
                size={20}
                color="#34D399"
              />
            ) : (
              <XCircle
                size={20}
                color="#FF6B81"
              />
            )}

            <View
              style={{
                flex: 1,
              }}
            >
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color:
                      questionCorrect
                        ? '#34D399'
                        : '#FF6B81',
                  },
                ]}
              >
                {questionCorrect
                  ? 'پاسخ صحیح است!'
                  : 'پاسخ نادرست است'}
              </Text>

              {!questionCorrect && (
                <Text
                  style={[
                    styles.feedbackAnswer,
                    {
                      color:
                        colors.textSecondary ??
                        '#aaa',
                    },
                  ]}
                >
                  پاسخ صحیح:{' '}
                  {String(
                    currentQuestion.answer,
                  )}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* SUBMIT / NEXT */}

        {!questionAnswered ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              currentQuestion.type ===
                'ayah_number'
                ? !fillAnswer.trim()
                : selectedOption === null
            }
            onPress={
              submitCurrentAnswer
            }
            style={[
              styles.quizActionButton,
              {
                backgroundColor:
                  colors.primary,
                opacity:
                  currentQuestion.type ===
                  'ayah_number'
                    ? fillAnswer.trim()
                      ? 1
                      : 0.45
                    : selectedOption !==
                        null
                      ? 1
                      : 0.45,
              },
            ]}
          >
            <CheckCircle
              size={20}
              color="#fff"
            />

            <Text
              style={styles.quizActionText}
            >
              بررسی پاسخ
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={nextQuestion}
            style={[
              styles.quizActionButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            {quizIndex >=
            quizQuestions.length - 1 ? (
              <Trophy
                size={20}
                color="#fff"
              />
            ) : (
              <ChevronLeft
                size={20}
                color="#fff"
              />
            )}

            <Text
              style={styles.quizActionText}
            >
              {quizIndex >=
              quizQuestions.length - 1
                ? 'مشاهده نتیجه'
                : 'سؤال بعدی'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* =======================================================
     QUIZ MODAL
  ======================================================= */

  const renderQuizModal = () => {
    return (
      <Modal
        visible={quizVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setQuizVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor:
                  colors.background ??
                  '#1b1024',
              },
            ]}
          >
            {/* HEADER */}

            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor:
                    colors.border ??
                    'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color:
                        colors.text ??
                        '#fff',
                    },
                  ]}
                >
                  {quizMode === 'today'
                    ? '📝 آزمون امروز'
                    : '🔄 آزمون مرور'}
                </Text>

                <Text
                  style={[
                    styles.modalSubtitle,
                    {
                      color:
                        colors.textSecondary ??
                        '#aaa',
                    },
                  ]}
                >
                  سنجش حافظه و یادآوری آیات
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setQuizVisible(false)
                }
                style={[
                  styles.closeButton,
                  {
                    backgroundColor:
                      colors.card ??
                      'rgba(255,255,255,0.06)',
                  },
                ]}
              >
                <X
                  size={22}
                  color={
                    colors.textSecondary ??
                    '#aaa'
                  }
                />
              </TouchableOpacity>
            </View>

            {/* BODY */}

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={
                styles.modalScrollContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={
                false
              }
            >
              {quizResult
                ? renderQuizResult()
                : renderQuestion()}
            </ScrollView>

            {/* FOOTER */}

            {!quizResult && (
              <View
                style={[
                  styles.modalFooter,
                  {
                    borderTopColor:
                      colors.border ??
                      'rgba(255,255,255,0.1)',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    regenerateQuiz
                  }
                  style={[
                    styles.footerResetButton,
                    {
                      borderColor:
                        colors.border ??
                        'rgba(255,255,255,0.1)',
                    },
                  ]}
                >
                  <RefreshCw
                    size={17}
                    color={
                      colors.textSecondary ??
                      '#aaa'
                    }
                  />

                  <Text
                    style={[
                      styles.footerResetText,
                      {
                        color:
                          colors.textSecondary ??
                          '#aaa',
                      },
                    ]}
                  >
                    تولید مجدد
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  /* =======================================================
     QURAN PAGE
  ======================================================= */

  const renderQuranPage = () => {
    return (
      <View
        style={[
          styles.quranCard,
          {
            backgroundColor:
              isDark
                ? '#51237E'
                : '#9F6FC9',
            borderColor:
              colors.border ??
              'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['#69349E', '#51237E']
              : ['#B38AD9', '#9F6FC9']
          }
          style={styles.quranGradient}
        >
          <View
            style={styles.ornamentalBorder}
          >
            <View
              style={styles.surahTitleBox}
            >
              <Text
                style={[
                  styles.surahTitle,
                  {
                    color:
                      colors.text ??
                      '#fff',
                  },
                ]}
              >
                سورة يس
              </Text>
            </View>

            <Text
              style={[
                styles.basmala,
                {
                  color:
                    colors.textSecondary ??
                    '#E8D0F0',
                },
              ]}
            >
              بِسۡمِ اللَّهِ الرَّحۡمَٰنِ الرَّحِيمِ
            </Text>

            <View style={styles.ayahList}>
              {SURAH_YASIN.map(verse => {
                const today =
                  todayVerses.includes(
                    verse.number,
                  );

                const review =
                  isReviewMode &&
                  previousVerses.includes(
                    verse.number,
                  );

                const visible =
                  today || review;

                return (
                  <View
                    key={verse.number}
                    style={[
                      styles.ayahRow,
                      !visible &&
                        styles.ayahBlurred,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ayahText,
                        {
                          color:
                            colors.text ??
                            '#fff',
                        },
                      ]}
                    >
                      {verse.arabic}
                    </Text>

                    <View
                      style={[
                        styles.ayahNumber,
                        {
                          borderColor:
                            visible
                              ? review
                                ? '#34D399'
                                : colors.primary
                              : 'rgba(255,255,255,0.1)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.ayahNumberText,
                          {
                            color:
                              visible
                                ? review
                                  ? '#34D399'
                                  : colors.primary
                                : colors.textSecondary ??
                                  '#777',
                          },
                        ]}
                      >
                        {verse.number}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  /* =======================================================
     TRANSLATIONS
  ======================================================= */

  const renderTranslations = () => {
    if (!showTranslation) {
      return null;
    }

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.card ??
              'rgba(255,255,255,0.05)',
            borderColor:
              colors.border ??
              'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <BookOpen
              size={20}
              color={colors.primary}
            />

            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    colors.text ??
                    '#fff',
                },
              ]}
            >
              ترجمه آیات امروز
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              setShowTranslation(false)
            }
          >
            <EyeOff
              size={20}
              color={
                colors.textSecondary ??
                '#aaa'
              }
            />
          </TouchableOpacity>
        </View>

        <View style={styles.translationList}>
          {todayVerses.map(number => {
            const verse =
              getVerse(number);

            if (!verse) {
              return null;
            }

            return (
              <View
                key={number}
                style={[
                  styles.translationItem,
                  {
                    borderBottomColor:
                      colors.border ??
                      'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.translationRef,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  آیه {number}
                </Text>

                <Text
                  style={[
                    styles.translationText,
                    {
                      color:
                        colors.textSecondary ??
                        '#aaa',
                    },
                  ]}
                >
                  {verse.translation}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  /* =======================================================
     REVIEW CARD
  ======================================================= */

  const renderReviewCard = () => {
    if (!previousVerses.length) {
      return null;
    }

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.card ??
              'rgba(255,255,255,0.05)',
            borderColor:
              colors.border ??
              'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            setShowReview(value => !value)
          }
          style={styles.cardHeader}
        >
          <View style={styles.cardHeaderLeft}>
            <RefreshCw
              size={20}
              color="#34D399"
            />

            <Text
              style={[
                styles.cardTitle,
                {
                  color:
                    colors.text ??
                    '#fff',
                },
              ]}
            >
              مرور آیات قبلی
            </Text>
          </View>

          {showReview ? (
            <EyeOff
              size={20}
              color={
                colors.textSecondary ??
                '#aaa'
              }
            />
          ) : (
            <Eye
              size={20}
              color={
                colors.textSecondary ??
                '#aaa'
              }
            />
          )}
        </TouchableOpacity>

        {showReview && (
          <View>
            {previousVerses.map(
              number => {
                const verse =
                  getVerse(number);

                if (!verse) {
                  return null;
                }

                return (
                  <View
                    key={number}
                    style={[
                      styles.reviewItem,
                      {
                        borderBottomColor:
                          colors.border ??
                          'rgba(255,255,255,0.08)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewRef,
                        {
                          color:
                            '#34D399',
                        },
                      ]}
                    >
                      آیه {number}
                    </Text>

                    <Text
                      style={[
                        styles.reviewText,
                        {
                          color:
                            colors.textSecondary ??
                            '#aaa',
                        },
                      ]}
                    >
                      {verse.arabic}
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        )}
      </View>
    );
  };

  /* =======================================================
     ACTION BUTTONS
  ======================================================= */

  const renderActions = () => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.card ??
              'rgba(255,255,255,0.05)',
            borderColor:
              colors.border ??
              'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View style={styles.actionGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setShowTranslation(
                value => !value,
              )
            }
            style={[
              styles.actionButton,
              {
                borderColor:
                  colors.border ??
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <BookOpen
              size={18}
              color={colors.primary}
            />

            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    colors.textSecondary ??
                    '#aaa',
                },
              ]}
            >
              {showTranslation
                ? 'مخفی کردن ترجمه'
                : 'نمایش ترجمه'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={
              toggleReviewMode
            }
            style={[
              styles.actionButton,
              isReviewMode && {
                borderColor:
                  '#34D399',
                backgroundColor:
                  'rgba(52,211,153,0.08)',
              },
            ]}
          >
            <RefreshCw
              size={18}
              color={
                isReviewMode
                  ? '#34D399'
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    isReviewMode
                      ? '#34D399'
                      : colors.textSecondary ??
                        '#aaa',
                },
              ]}
            >
              {isReviewMode
                ? 'بازگشت به حالت عادی'
                : 'مرور آیات قبلی'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              startQuiz('today')
            }
            style={[
              styles.quizButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Target
              size={18}
              color="#fff"
            />

            <Text
              style={styles.quizButtonText}
            >
              آزمون امروز
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              !previousVerses.length
            }
            onPress={() =>
              startQuiz('review')
            }
            style={[
              styles.quizButton,
              {
                backgroundColor:
                  '#7A3A9E',
                opacity:
                  previousVerses.length
                    ? 1
                    : 0.45,
              },
            ]}
          >
            <RefreshCw
              size={18}
              color="#fff"
            />

            <Text
              style={styles.quizButtonText}
            >
              آزمون مرور
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isStudyComplete}
          onPress={finishStudy}
          style={[
            styles.finishButton,
            {
              backgroundColor:
                isStudyComplete
                  ? 'rgba(52,211,153,0.15)'
                  : 'rgba(52,211,153,0.10)',
              borderColor:
                'rgba(52,211,153,0.25)',
            },
          ]}
        >
          <CheckCircle
            size={19}
            color="#34D399"
          />

          <Text
            style={[
              styles.finishButtonText,
              {
                color:
                  '#34D399',
              },
            ]}
          >
            {isStudyComplete
              ? 'مطالعه امروز انجام شد'
              : 'پایان مطالعه امروز'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background ??
            (isDark
              ? '#160B20'
              : '#F7F3FA'),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.flex,
          {
            opacity: fadeAnim,
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              style={[
                styles.headerButton,
                {
                  backgroundColor:
                    colors.card ??
                    'rgba(255,255,255,0.06)',
                  borderColor:
                    colors.border ??
                    'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <ArrowLeft
                size={21}
                color={
                  colors.text ??
                  '#fff'
                }
              />
            </TouchableOpacity>

            <View
              style={
                styles.headerCenter
              }
            >
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color:
                      colors.text ??
                      '#fff',
                  },
                ]}
              >
                حفظ قرآن
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color:
                      colors.textSecondary ??
                      '#aaa',
                  },
                ]}
              >
                سوره یس
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setFavorite(
                  value => !value,
                )
              }
              style={[
                styles.headerButton,
                {
                  backgroundColor:
                    colors.card ??
                    'rgba(255,255,255,0.06)',
                  borderColor:
                    colors.border ??
                    'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <Heart
                size={20}
                color={
                  favorite
                    ? '#FF6B81'
                    : colors.textSecondary ??
                      '#aaa'
                }
                fill={
                  favorite
                    ? '#FF6B81'
                    : 'transparent'
                }
              />
            </TouchableOpacity>
          </View>

          {/* DAY INFO */}

          <View
            style={[
              styles.dayCard,
              {
                backgroundColor:
                  colors.card ??
                  'rgba(255,255,255,0.05)',
                borderColor:
                  colors.border ??
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View style={styles.dayHeader}>
              <View>
                <Text
                  style={[
                    styles.dayTitle,
                    {
                      color:
                        colors.text ??
                        '#fff',
                    },
                  ]}
                >
                  📖 برنامه حفظ
                </Text>

                <Text
                  style={[
                    styles.daySubtitle,
                    {
                      color:
                        colors.textSecondary ??
                        '#aaa',
                    },
                  ]}
                >
                  برنامه ۶ روزه سوره یس
                </Text>
              </View>

              <View
                style={[
                  styles.dayBadge,
                  {
                    backgroundColor:
                      `${colors.primary}18`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayBadgeText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  روز {currentDay}
                </Text>
              </View>
            </View>

            <View
              style={styles.dayStats}
            >
              <View
                style={styles.dayStat}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        colors.textSecondary ??
                        '#aaa',
                    },
                  ]}
                >
                  آیات امروز
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        colors.text ??
                        '#fff',
                    },
                  ]}
                >
                  {todayVerses.length
                    ? `${todayVerses[0]} - ${
                        todayVerses[
                          todayVerses.length -
                            1
                        ]
                      }`
                    : '-'}
                </Text>
              </View>

              <View
                style={styles.dayStat}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        colors.textSecondary ??
                        '#aaa',
                    },
                  ]}
                >
                  تعداد آیات
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        colors.text ??
                        '#fff',
                    },
                  ]}
                >
                  {todayVerses.length}
                </Text>
              </View>
            </View>
          </View>

          {/* PROGRESS */}

          <View
            style={[
              styles.card,
              {
                backgroundColor:
                  colors.card ??
                  'rgba(255,255,255,0.05)',
                borderColor:
                  colors.border ??
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View
              style={
                styles.progressHeader
              }
            >
              <Text
                style={[
                  styles.progressLabel,
                  {
                    color:
                      colors.textSecondary ??
                      '#aaa',
                  },
                ]}
              >
                پیشرفت کلی
              </Text>

              <Text
                style={[
                  styles.progressPercent,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {progress}٪
              </Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.06)',
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      progress,
                    )}%`,
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          {/* QURAN */}

          {renderQuranPage()}

          {/* AUDIO */}

          <View
            style={[
              styles.audioRow,
              {
                backgroundColor:
                  colors.card ??
                  'rgba(255,255,255,0.05)',
                borderColor:
                  colors.border ??
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={playAudio}
              style={[
                styles.audioButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              {playing ? (
                <Clock
                  size={19}
                  color="#fff"
                />
              ) : (
                <Play
                  size={19}
                  color="#fff"
                  fill="#fff"
                />
              )}
            </TouchableOpacity>

            <View
              style={styles.audioText}
            >
              <Text
                style={[
                  styles.audioTitle,
                  {
                    color:
                      colors.text ??
                      '#fff',
                  },
                ]}
              >
                {playing
                  ? 'در حال پخش...'
                  : 'شنیدن تلاوت'}
              </Text>

              <Text
                style={[
                  styles.audioSubtitle,
                  {
                    color:
                      colors.textSecondary ??
                      '#aaa',
                  },
                ]}
              >
                سوره یس
              </Text>
            </View>
          </View>

          {/* TRANSLATION */}

          {!showTranslation && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setShowTranslation(
                  true,
                )
              }
              style={[
                styles.showTranslationButton,
                {
                  borderColor:
                    colors.border ??
                    'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <Eye
                size={18}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.showTranslationText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                نمایش ترجمه آیات امروز
              </Text>
            </TouchableOpacity>
          )}

          {renderTranslations()}

          {renderReviewCard()}

          {renderActions()}

          {/* COMPLETE MESSAGE */}

          {isStudyComplete && (
            <View
              style={[
                styles.completeCard,
                {
                  backgroundColor:
                    'rgba(52,211,153,0.07)',
                  borderColor:
                    'rgba(52,211,153,0.2)',
                },
              ]}
            >
              <CheckCircle
                size={22}
                color="#34D399"
              />

              <Text
                style={[
                  styles.completeText,
                  {
                    color:
                      '#34D399',
                  },
                ]}
              >
                مطالعه امروز انجام شده است.
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {renderQuizModal()}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 45,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
  },

  /* DAY */

  dayCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dayTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  daySubtitle: {
    fontSize: 12,
    marginTop: 4,
  },

  dayBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },

  dayBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  dayStats: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },

  dayStat: {
    flex: 1,
  },

  statLabel: {
    fontSize: 11,
    marginBottom: 3,
  },

  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },

  /* CARD */

  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* PROGRESS */

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 12,
  },

  progressPercent: {
    fontSize: 13,
    fontWeight: '900',
  },

  progressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  /* QURAN */

  quranCard: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },

  quranGradient: {
    padding: 12,
  },

  ornamentalBorder: {
    borderWidth: 1,
    borderColor:
      'rgba(209,0,209,0.16)',
    borderRadius: 20,
    padding: 18,
  },

  surahTitleBox: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor:
      'rgba(209,0,209,0.15)',
    marginBottom: 12,
  },

  surahTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'serif',
  },

  basmala: {
    textAlign: 'center',
    fontSize: 19,
    lineHeight: 36,
    marginBottom: 12,
    fontFamily: 'serif',
  },

  ayahList: {
    gap: 5,
  },

  ayahRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 3,
  },

  ayahBlurred: {
    opacity: 0.14,
  },

  ayahText: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 33,
  },

  ayahNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ayahNumberText: {
    fontSize: 10,
    fontWeight: '800',
  },

  /* AUDIO */

  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },

  audioButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  audioText: {
    marginLeft: 12,
  },

  audioTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  audioSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },

  /* TRANSLATION */

  translationList: {
    marginTop: 10,
  },

  translationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  translationRef: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },

  translationText: {
    fontSize: 13,
    lineHeight: 24,
  },

  /* REVIEW */

  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  reviewRef: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },

  reviewText: {
    fontFamily: 'serif',
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'right',
  },

  /* ACTIONS */

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  actionButton: {
    width: '48%',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 7,
  },

  actionButtonText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  quizButton: {
    width: '48%',
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  quizButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },

  finishButton: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  finishButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },

  showTranslationButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  showTranslationText: {
    fontSize: 12,
    fontWeight: '800',
  },

  completeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  completeText: {
    fontSize: 13,
    fontWeight: '800',
  },

  /* QUIZ MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(12,5,20,0.90)',
    justifyContent: 'center',
    padding: 12,
  },

  modalContainer: {
    maxHeight: '94%',
    width: '100%',
    borderRadius: 26,
    overflow: 'hidden',
  },

  modalHeader: {
    minHeight: 76,
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  modalSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalScroll: {
    flexGrow: 0,
  },

  modalScrollContent: {
    padding: 16,
    paddingBottom: 22,
  },

  modalFooter: {
    padding: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  footerResetButton: {
    minHeight: 43,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  footerResetText: {
    fontSize: 12,
    fontWeight: '700',
  },

  /* QUIZ */

  quizProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  questionCounter: {
    fontSize: 11,
    fontWeight: '600',
  },

  questionType: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },

  quizBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  quizBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  promptCard: {
    padding: 13,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 10,
  },

  promptText: {
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'right',
    fontWeight: '700',
  },

  displayCard: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 15,
    marginBottom: 12,
  },

  displayText: {
    textAlign: 'center',
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 34,
  },

  input: {
    height: 53,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 15,
    textAlign: 'right',
    fontSize: 15,
    marginBottom: 12,
  },

  optionsContainer: {
    gap: 9,
  },

  option: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },

  optionIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionIndexText: {
    fontSize: 12,
    fontWeight: '800',
  },

  optionText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    lineHeight: 23,
  },

  feedback: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
  },

  feedbackTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  feedbackAnswer: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 20,
  },

  quizActionButton: {
    marginTop: 14,
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  quizActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },

  /* RESULT */

  resultContainer: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },

  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  resultScore: {
    fontSize: 46,
    fontWeight: '900',
  },

  resultPercentage: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: -2,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 13,
  },

  resultMessage: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 21,
  },

  resultActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 20,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 47,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  primaryButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});