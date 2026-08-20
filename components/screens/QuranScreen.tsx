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
  Clock,
  Eye,
  EyeOff,
  Play,
  RefreshCw,
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

const PLAN: DayPlan[] = [
  { day: 1, verses: [1, 2, 3] },
  { day: 2, verses: [4, 5] },
  { day: 3, verses: [6, 7] },
  { day: 4, verses: [8, 9] },
  { day: 5, verses: [10, 11] },
  { day: 6, verses: [12] },
];

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

const getVerse = (number: number) =>
  SURAH_YASIN.find(v => v.number === number);

const getDayPlan = (day: number) =>
  PLAN.find(p => p.day === day);

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

    if (exists) result.push(word);
  });

  return result;
};

const makeShortText = (text: string, length = 45) => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/* =========================================================
   QUESTION GENERATOR
========================================================= */

const generateQuestions = (
  verses: number[],
  count: number,
): QuizQuestion[] => {
  if (!verses.length) return [];

  const questions: QuizQuestion[] = [];
  const availableVerses = shuffle(verses);
  const availableWords = shuffle(getWordsFromVerses(verses));

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
    const possibleTypes: QuizType[] = [
      'ayah_number',
      'translation',
      'continuation',
      'verse_from_translation',
      'word_line',
    ];

    let type =
      possibleTypes[
        Math.floor(Math.random() * possibleTypes.length)
      ];

    if (verseCursor >= availableVerses.length) {
      type = 'word_line';
    }

    if (
      type === 'word_line' &&
      wordCursor >= availableWords.length
    ) {
      type =
        possibleTypes[
          Math.floor(Math.random() * 4)
        ];
    }

    if (type === 'ayah_number') {
      if (verseCursor >= availableVerses.length) continue;

      const ayahNumber = availableVerses[verseCursor++];
      const verse = getVerse(ayahNumber);

      if (!verse) continue;

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

    if (type === 'translation') {
      if (verseCursor >= availableVerses.length) continue;

      const ayahNumber = availableVerses[verseCursor++];
      const verse = getVerse(ayahNumber);

      if (!verse) continue;

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

    if (type === 'continuation') {
      if (verseCursor >= availableVerses.length) continue;

      const ayahNumber = availableVerses[verseCursor++];
      const verse = getVerse(ayahNumber);

      if (!verse) continue;

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
          if (!other) return '';

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

    if (type === 'verse_from_translation') {
      if (verseCursor >= availableVerses.length) continue;

      const ayahNumber = availableVerses[verseCursor++];
      const verse = getVerse(ayahNumber);

      if (!verse) continue;

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

    if (type === 'word_line') {
      if (wordCursor >= availableWords.length) continue;

      const word = availableWords[wordCursor++];
      const correctLine = WORD_LINE_LOCATIONS[word];

      if (!correctLine) continue;

      const lineOptions = shuffle([
        correctLine,
        ...shuffle(
          Array.from({ length: 11 }, (_, index) => index + 1).filter(
            line => line !== correctLine,
          ),
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
   SCREEN
========================================================= */

export default function QuranScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [currentDay, setCurrentDay] = useState(1);
  const [isStudyComplete, setIsStudyComplete] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showReview, setShowReview] = useState(false);

  const [quizVisible, setQuizVisible] = useState(false);
  const [quizMode, setQuizMode] = useState<StudyMode>('today');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] =
    useState<string | number | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [questionCorrect, setQuestionCorrect] =
    useState<boolean | null>(null);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizResult, setQuizResult] =
    useState<QuizResult | null>(null);

  const [favorite, setFavorite] = useState(false);
  const [playing, setPlaying] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;

  const todayVerses = useMemo(
    () => getDayPlan(currentDay)?.verses ?? [],
    [currentDay],
  );

  const previousVerses = useMemo(() => {
    const result: number[] = [];

    for (let day = 1; day < currentDay; day += 1) {
      const plan = getDayPlan(day);
      if (plan) result.push(...plan.verses);
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

  const currentQuestion = quizQuestions[quizIndex];

  /* =========================================================
     STORAGE
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const AsyncStorage =
          require('@react-native-async-storage/async-storage').default;

        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const savedDate =
          await AsyncStorage.getItem(LAST_UPDATE_KEY);

        const todayKey = new Date()
          .toISOString()
          .slice(0, 10);

        if (savedDate && savedDate !== todayKey) {
          setIsStudyComplete(false);

          await AsyncStorage.setItem(
            LAST_UPDATE_KEY,
            todayKey,
          );
        }

        if (saved && mounted) {
          try {
            const data = JSON.parse(saved);

            if (typeof data.currentDay === 'number') {
              setCurrentDay(
                Math.max(
                  1,
                  Math.min(PLAN.length, data.currentDay),
                ),
              );
            }

            if (typeof data.isStudyComplete === 'boolean') {
              setIsStudyComplete(data.isStudyComplete);
            }
          } catch {
            // ignore
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
          require('@react-native-async-storage/async-storage').default;

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

  /* =========================================================
     ANIMATION
  ========================================================= */

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

  const resetQuestionState = () => {
    setSelectedOption(null);
    setFillAnswer('');
    setQuestionAnswered(false);
    setQuestionCorrect(null);
  };

  const handleBack = () => {
    if (quizVisible) {
      setQuizVisible(false);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  /* =========================================================
     QUIZ
  ========================================================= */

  const startQuiz = (mode: StudyMode) => {
    const verses =
      mode === 'today' ? todayVerses : previousVerses;

    if (!verses.length) {
      Alert.alert(
        mode === 'today' ? 'آزمون امروز' : 'آزمون مرور',
        mode === 'today'
          ? 'هیچ آیاتی برای امروز تعیین نشده است.'
          : 'هنوز آیات قبلی برای آزمون مرور وجود ندارد.',
      );

      return;
    }

    if (mode === 'today' && isStudyComplete) {
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

    const generated = generateQuestions(verses, count);

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

  const submitCurrentAnswer = () => {
    if (!currentQuestion || questionAnswered) return;

    let correct = false;

    if (currentQuestion.type === 'ayah_number') {
      correct =
        fillAnswer.trim() ===
        String(currentQuestion.answer);
    } else {
      if (selectedOption === null) return;

      correct =
        String(selectedOption) ===
        String(currentQuestion.answer);
    }

    setQuestionAnswered(true);
    setQuestionCorrect(correct);

    if (correct) {
      setQuizCorrect(value => value + 1);
    }
  };

  const nextQuestion = () => {
    if (!questionAnswered) return;

    if (quizIndex >= quizQuestions.length - 1) {
      const finalCorrect =
        quizCorrect + (questionCorrect ? 1 : 0);

      const total = quizQuestions.length;

      const percentage =
        total > 0
          ? Math.round((finalCorrect / total) * 100)
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

  const regenerateQuiz = () => {
    const verses =
      quizMode === 'today'
        ? todayVerses
        : previousVerses;

    const count =
      quizMode === 'today'
        ? Math.min(5, verses.length)
        : Math.min(10, verses.length);

    const generated = generateQuestions(
      verses,
      count,
    );

    setQuizQuestions(generated);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizResult(null);
    resetQuestionState();
  };

  /* =========================================================
     STUDY
  ========================================================= */

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
      `آیا از حفظ آیات ${todayVerses.join('، ')} اطمینان دارید؟`,
      [
        {
          text: 'لغو',
          style: 'cancel',
        },
        {
          text: 'بله، پایان مطالعه',
          onPress: () => {
            if (currentDay < PLAN.length) {
              const nextDay = currentDay + 1;

              setCurrentDay(nextDay);
              setIsStudyComplete(false);

              Alert.alert(
                'روز کامل شد',
                `روز ${currentDay} کامل شد.\nروز ${nextDay} فعال شد.`,
              );
            } else {
              setIsStudyComplete(true);

              Alert.alert(
                'برنامه کامل شد',
                'شما برنامه حفظ سوره یس را کامل کردید.',
              );
            }
          },
        },
      ],
    );
  };

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

  const playAudio = () => {
    if (playing) return;

    setPlaying(true);

    setTimeout(() => {
      setPlaying(false);
    }, 2500);
  };

  /* =========================================================
     RESULT
  ========================================================= */

  const renderQuizResult = () => {
    if (!quizResult) return null;

    const perfect =
      quizResult.correct === quizResult.total;

    const good = quizResult.percentage >= 50;

    return (
      <View
        style={[
          styles.resultContainer,
          {
            backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
            borderColor: colors.border || 'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View
          style={[
            styles.resultIcon,
            {
              backgroundColor: `${colors.primary}12`,
              borderColor: `${colors.primary}25`,
            },
          ]}
        >
          {perfect ? (
            <Trophy size={38} color="#F5D76E" />
          ) : good ? (
            <Award size={38} color={colors.primary} />
          ) : (
            <Target size={38} color={colors.primary} />
          )}
        </View>

        <Text
          style={[
            styles.resultEyebrow,
            {
              color: colors.textSecondary || '#999',
            },
          ]}
        >
          نتیجه آزمون
        </Text>

        <Text
          style={[
            styles.resultScore,
            {
              color: colors.primary,
            },
          ]}
        >
          {quizResult.correct}/{quizResult.total}
        </Text>

        <View
          style={[
            styles.resultPercentPill,
            {
              backgroundColor: `${colors.primary}15`,
            },
          ]}
        >
          <Target
            size={15}
            color={colors.primary}
          />

          <Text
            style={[
              styles.resultPercentText,
              {
                color: colors.primary,
              },
            ]}
          >
            {quizResult.percentage}٪
          </Text>
        </View>

        <Text
          style={[
            styles.resultTitle,
            {
              color: colors.text || '#fff',
            },
          ]}
        >
          {quizMode === 'today'
            ? 'آزمون امروز'
            : 'آزمون مرور'}
        </Text>

        <Text
          style={[
            styles.resultMessage,
            {
              color: colors.textSecondary || '#aaa',
            },
          ]}
        >
          {perfect
            ? 'عالی! تمام پاسخ‌ها صحیح بودند.'
            : good
            ? 'عملکرد خوبی داشتی؛ با کمی مرور بهتر هم می‌شود.'
            : 'مرور بیشتر به تثبیت مطالب کمک می‌کند.'}
        </Text>

        <View
          style={[
            styles.resultProgressTrack,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.07)'
                : 'rgba(0,0,0,0.06)',
            },
          ]}
        >
          <View
            style={[
              styles.resultProgressFill,
              {
                width: `${quizResult.percentage}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.resultActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={regenerateQuiz}
            style={[
              styles.secondaryButton,
              {
                borderColor: colors.border || 'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <RefreshCw
              size={17}
              color={colors.textSecondary || '#aaa'}
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: colors.textSecondary || '#aaa',
                },
              ]}
            >
              آزمون دوباره
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setQuizVisible(false)}
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <CheckCircle size={18} color="#fff" />

            <Text style={styles.primaryButtonText}>
              پایان
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* =========================================================
     QUESTION
  ========================================================= */

  const renderQuestion = () => {
    if (!currentQuestion) return null;

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

    const quizPercent =
      quizQuestions.length > 0
        ? ((quizIndex + 1) /
            quizQuestions.length) *
          100
        : 0;

    return (
      <View>
        <View style={styles.questionTop}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.questionCounter,
                {
                  color: colors.textSecondary || '#aaa',
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
                  color: colors.primary,
                },
              ]}
            >
              {currentQuestion.typeLabel}
            </Text>
          </View>

          <View
            style={[
              styles.quizModePill,
              {
                backgroundColor: `${colors.primary}12`,
                borderColor: `${colors.primary}25`,
              },
            ]}
          >
            <Target
              size={15}
              color={colors.primary}
            />

            <Text
              style={[
                styles.quizModeText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {quizMode === 'today'
                ? 'امروز'
                : 'مرور'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.quizProgressTrack,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.07)'
                : 'rgba(0,0,0,0.06)',
            },
          ]}
        >
          <View
            style={[
              styles.quizProgressFill,
              {
                width: `${quizPercent}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.promptCard,
            {
              backgroundColor: colors.surface || 'rgba(255,255,255,0.04)',
              borderColor: colors.border || 'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <View
            style={[
              styles.promptIcon,
              {
                backgroundColor: `${colors.primary}12`,
              },
            ]}
          >
            <Sparkles
              size={18}
              color={colors.primary}
            />
          </View>

          <Text
            style={[
              styles.promptText,
              {
                color: colors.text || '#fff',
              },
            ]}
          >
            {currentQuestion.prompt}
          </Text>
        </View>

        <View
          style={[
            styles.displayCard,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.035)'
                : 'rgba(0,0,0,0.025)',
              borderColor: colors.border || 'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.displayLabel,
              {
                color: colors.textSecondary || '#888',
              },
            ]}
          >
            متن سؤال
          </Text>

          <Text
            style={[
              styles.displayText,
              {
                color: colors.text || '#fff',
              },
            ]}
          >
            {currentQuestion.display}
          </Text>
        </View>

        {currentQuestion.type === 'ayah_number' && (
          <View>
            <TextInput
              value={fillAnswer}
              onChangeText={setFillAnswer}
              editable={!questionAnswered}
              keyboardType="number-pad"
              placeholder="شماره آیه را وارد کنید"
              placeholderTextColor={colors.textSecondary || '#888'}
              style={[
                styles.input,
                {
                  color: colors.text || '#fff',
                  borderColor: questionAnswered
                    ? questionCorrect
                      ? '#34D399'
                      : '#FF6B81'
                    : colors.border || 'rgba(255,255,255,0.12)',
                  backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
                },
              ]}
            />
          </View>
        )}

        {currentQuestion.options &&
          currentQuestion.type !== 'ayah_number' && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map(
                (option, index) => {
                  const selected =
                    optionIsSelected(option);

                  const correct =
                    optionIsCorrect(option);

                  const wrong =
                    questionAnswered &&
                    selected &&
                    !correct;

                  let borderColor =
                    colors.border || 'rgba(255,255,255,0.1)';

                  let backgroundColor =
                    colors.surface || 'rgba(255,255,255,0.04)';

                  let textColor =
                    colors.text || '#fff';

                  if (correct) {
                    borderColor = '#34D399';
                    backgroundColor =
                      'rgba(52,211,153,0.08)';
                    textColor = '#34D399';
                  } else if (wrong) {
                    borderColor = '#FF6B81';
                    backgroundColor =
                      'rgba(255,107,129,0.08)';
                    textColor = '#FF6B81';
                  } else if (selected) {
                    borderColor = colors.primary;
                    backgroundColor =
                      `${colors.primary}15`;
                  }

                  return (
                    <TouchableOpacity
                      key={`${currentQuestion.id}-${index}`}
                      disabled={questionAnswered}
                      activeOpacity={0.82}
                      onPress={() =>
                        setSelectedOption(option)
                      }
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
                                color: textColor,
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
                            color: textColor,
                          },
                          currentQuestion.type ===
                            'continuation' && {
                            fontFamily: 'serif',
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

        {questionAnswered && (
          <View
            style={[
              styles.feedback,
              {
                backgroundColor: questionCorrect
                  ? 'rgba(52,211,153,0.08)'
                  : 'rgba(255,107,129,0.08)',
                borderColor: questionCorrect
                  ? 'rgba(52,211,153,0.25)'
                  : 'rgba(255,107,129,0.25)',
              },
            ]}
          >
            {questionCorrect ? (
              <CheckCircle
                size={21}
                color="#34D399"
              />
            ) : (
              <XCircle
                size={21}
                color="#FF6B81"
              />
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color: questionCorrect
                      ? '#34D399'
                      : '#FF6B81',
                  },
                ]}
              >
                {questionCorrect
                  ? 'پاسخ صحیح است'
                  : 'پاسخ نادرست است'}
              </Text>

              {!questionCorrect && (
                <Text
                  style={[
                    styles.feedbackAnswer,
                    {
                      color: colors.textSecondary || '#aaa',
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

        {!questionAnswered ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              currentQuestion.type ===
              'ayah_number'
                ? !fillAnswer.trim()
                : selectedOption === null
            }
            onPress={submitCurrentAnswer}
            style={[
              styles.quizActionButton,
              {
                backgroundColor: colors.primary,
                opacity:
                  currentQuestion.type ===
                  'ayah_number'
                    ? fillAnswer.trim()
                      ? 1
                      : 0.45
                    : selectedOption !== null
                      ? 1
                      : 0.45,
              },
            ]}
          >
            <CheckCircle
              size={20}
              color="#fff"
            />

            <Text style={styles.quizActionText}>
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
                backgroundColor: colors.primary,
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

            <Text style={styles.quizActionText}>
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

  /* =========================================================
     QUIZ MODAL
  ========================================================= */

  const renderQuizModal = () => (
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
              backgroundColor: colors.background || '#1b1024',
            },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border || 'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View style={styles.modalHeaderIcon}>
              <Target
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text || '#fff',
                  },
                ]}
              >
                {quizMode === 'today'
                  ? 'آزمون امروز'
                  : 'آزمون مرور'}
              </Text>

              <Text
                style={[
                  styles.modalSubtitle,
                  {
                    color: colors.textSecondary || '#aaa',
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
                  backgroundColor: colors.surface || 'rgba(255,255,255,0.06)',
                },
              ]}
            >
              <X
                size={21}
                color={colors.textSecondary || '#aaa'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={
              styles.modalScrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {quizResult
              ? renderQuizResult()
              : renderQuestion()}
          </ScrollView>

          {!quizResult && (
            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: colors.border || 'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={regenerateQuiz}
                style={[
                  styles.footerResetButton,
                  {
                    borderColor: colors.border || 'rgba(255,255,255,0.1)',
                  },
                ]}
              >
                <RefreshCw
                  size={17}
                  color={colors.textSecondary || '#aaa'}
                />

                <Text
                  style={[
                    styles.footerResetText,
                    {
                      color: colors.textSecondary || '#aaa',
                    },
                  ]}
                >
                  تولید سؤال جدید
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  /* =========================================================
     QURAN PAGE
  ========================================================= */

  const renderQuranPage = () => (
    <View
      style={[
        styles.quranCard,
        {
          backgroundColor: isDark
            ? '#51237E'
            : '#9F6FC9',
          borderColor: colors.border || 'rgba(255,255,255,0.1)',
        },
      ]}
    >
      <LinearGradient
        colors={
          isDark
            ? ['#6A369F', '#4C216F']
            : ['#B78BDA', '#9867C2']
        }
        style={styles.quranGradient}
      >
        <View style={styles.quranTopRow}>
          <View
            style={[
              styles.quranIcon,
              {
                backgroundColor:
                  'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <BookOpen
              size={20}
              color="#fff"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={styles.quranEyebrow}
            >
              قرآن کریم
            </Text>

            <Text style={styles.quranSurah}>
              سوره یس
            </Text>
          </View>

          <View
            style={[
              styles.quranDayPill,
              {
                backgroundColor:
                  'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <Text style={styles.quranDayText}>
              روز {currentDay}
            </Text>
          </View>
        </View>

        <View style={styles.ornamentalBorder}>
          <View style={styles.surahTitleBox}>
            <Text
              style={[
                styles.surahTitle,
                {
                  color: colors.text || '#fff',
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
                color: '#F1E1F7',
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
                  <View
                    style={[
                      styles.ayahNumber,
                      {
                        borderColor:
                          visible
                            ? review
                              ? '#34D399'
                              : 'rgba(255,255,255,0.75)'
                            : 'rgba(255,255,255,0.12)',
                        backgroundColor:
                          visible
                            ? 'rgba(255,255,255,0.08)'
                            : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ayahNumberText,
                        {
                          color:
                            visible
                              ? '#fff'
                              : 'rgba(255,255,255,0.4)',
                        },
                      ]}
                    >
                      {verse.number}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.ayahText,
                      {
                        color: colors.text || '#fff',
                      },
                    ]}
                  >
                    {verse.arabic}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  /* =========================================================
     TRANSLATIONS
  ========================================================= */

  const renderTranslations = () => {
    if (!showTranslation) return null;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
            borderColor: colors.border || 'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor: `${colors.primary}12`,
                },
              ]}
            >
              <BookOpen
                size={18}
                color={colors.primary}
              />
            </View>

            <View>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text || '#fff',
                  },
                ]}
              >
                ترجمه آیات امروز
              </Text>

              <Text
                style={[
                  styles.cardCaption,
                  {
                    color: colors.textSecondary || '#888',
                  },
                ]}
              >
                مرور معنای آیات
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              setShowTranslation(false)
            }
            style={styles.smallIconButton}
          >
            <EyeOff
              size={18}
              color={colors.textSecondary || '#aaa'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.translationList}>
          {todayVerses.map(number => {
            const verse = getVerse(number);

            if (!verse) return null;

            return (
              <View
                key={number}
                style={[
                  styles.translationItem,
                  {
                    borderBottomColor: colors.border || 'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.translationNumber,
                    {
                      backgroundColor: `${colors.primary}12`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.translationRef,
                      {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {number}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.translationText,
                    {
                      color: colors.textSecondary || '#aaa',
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

  /* =========================================================
     REVIEW
  ========================================================= */

  const renderReviewCard = () => {
    if (!previousVerses.length) return null;

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
            borderColor: colors.border || 'rgba(255,255,255,0.1)',
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
            <View
              style={[
                styles.sectionIcon,
                {
                  backgroundColor:
                    'rgba(52,211,153,0.10)',
                },
              ]}
            >
              <RefreshCw
                size={18}
                color="#34D399"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.cardTitle,
                  {
                    color: colors.text || '#fff',
                  },
                ]}
              >
                مرور آیات قبلی
              </Text>

              <Text
                style={[
                  styles.cardCaption,
                  {
                    color: colors.textSecondary || '#888',
                  },
                ]}
              >
                {previousVerses.length} آیه برای مرور
              </Text>
            </View>
          </View>

          <View style={styles.smallIconButton}>
            {showReview ? (
              <EyeOff
                size={18}
                color={colors.textSecondary || '#aaa'}
              />
            ) : (
              <Eye
                size={18}
                color={colors.textSecondary || '#aaa'}
              />
            )}
          </View>
        </TouchableOpacity>

        {showReview && (
          <View>
            {previousVerses.map(number => {
              const verse = getVerse(number);

              if (!verse) return null;

              return (
                <View
                  key={number}
                  style={[
                    styles.reviewItem,
                    {
                      borderBottomColor: colors.border || 'rgba(255,255,255,0.08)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.reviewNumber,
                      {
                        backgroundColor:
                          'rgba(52,211,153,0.10)',
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
                      {number}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.reviewText,
                      {
                        color: colors.textSecondary || '#aaa',
                      },
                    ]}
                  >
                    {verse.arabic}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  /* =========================================================
     ACTIONS
  ========================================================= */

  const renderActions = () => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
          borderColor: colors.border || 'rgba(255,255,255,0.1)',
        },
      ]}
    >
      <View style={styles.actionSectionHeader}>
        <View>
          <Text
            style={[
              styles.actionSectionTitle,
              {
                color: colors.text || '#fff',
              },
            ]}
          >
            تمرین و آزمون
          </Text>

          <Text
            style={[
              styles.actionSectionSubtitle,
              {
                color: colors.textSecondary || '#888',
              },
            ]}
          >
            حافظه خود را با آزمون‌های کوتاه بسنجید
          </Text>
        </View>

        <View
          style={[
            styles.actionSectionIcon,
            {
              backgroundColor: `${colors.primary}12`,
            },
          ]}
        >
          <Target
            size={20}
            color={colors.primary}
          />
        </View>
      </View>

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
              borderColor: colors.border || 'rgba(255,255,255,0.1)',
            },
          ]}
        >
          {showTranslation ? (
            <EyeOff
              size={18}
              color={colors.primary}
            />
          ) : (
            <Eye
              size={18}
              color={colors.primary}
            />
          )}

          <Text
            style={[
              styles.actionButtonText,
              {
                color: colors.textSecondary || '#aaa',
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
          onPress={toggleReviewMode}
          style={[
            styles.actionButton,
            isReviewMode && {
              borderColor: '#34D399',
              backgroundColor:
                'rgba(52,211,153,0.08)',
            },
            {
              borderColor:
                isReviewMode
                  ? '#34D399'
                  : colors.border || 'rgba(255,255,255,0.1)',
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
                    : colors.textSecondary || '#aaa',
              },
            ]}
          >
            {isReviewMode
              ? 'حالت عادی'
              : 'مرور آیات'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => startQuiz('today')}
          style={[
            styles.quizButton,
            {
              backgroundColor:
                colors.primary,
            },
          ]}
        >
          <Target size={18} color="#fff" />

          <Text style={styles.quizButtonText}>
            آزمون امروز
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!previousVerses.length}
          onPress={() => startQuiz('review')}
          style={[
            styles.quizButton,
            {
              backgroundColor: '#7A3A9E',
              opacity:
                previousVerses.length
                  ? 1
                  : 0.45,
            },
          ]}
        >
          <RefreshCw size={18} color="#fff" />

          <Text style={styles.quizButtonText}>
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
            backgroundColor: isStudyComplete
              ? 'rgba(52,211,153,0.12)'
              : 'rgba(52,211,153,0.07)',
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
              color: '#34D399',
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

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background || (isDark ? '#160B20' : '#F7F3FA'),
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
          {/* ======================================================
              HEADER - NEW DESIGN
          ====================================================== */}

          <View
            style={[
              styles.header,
              {
                borderBottomColor: colors.border || 'rgba(255,255,255,0.08)',
              },
            ]}
          >
            {/* LEFT - Back Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              style={[
                styles.headerBackButton,
                {
                  backgroundColor: colors.surface || 'rgba(255,255,255,0.06)',
                  borderColor: colors.border || 'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <ArrowLeft size={21} strokeWidth={2.2} color={colors.text || '#fff'} />
            </TouchableOpacity>

            {/* CENTER - Title */}
            <View style={styles.headerCenter}>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerTitle,
                  {
                    color: colors.text || '#fff',
                    textAlign: 'right',
                  },
                ]}
              >
                حفظ قرآن
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerSubtitle,
                  {
                    color: colors.textSecondary || '#aaa',
                    textAlign: 'right',
                  },
                ]}
              >
                سوره یس
              </Text>
            </View>

            {/* RIGHT - Icon */}
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
              <BookOpen size={22} strokeWidth={2} color={colors.primary} />
            </View>
          </View>

          {/* DAY INFO */}

          <View
            style={[
              styles.dayCard,
              {
                backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
                borderColor: colors.border || 'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View style={styles.dayHeader}>
              <View style={styles.dayTitleBlock}>
                <View
                  style={[
                    styles.dayIcon,
                    {
                      backgroundColor: `${colors.primary}12`,
                    },
                  ]}
                >
                  <BookOpen
                    size={20}
                    color={colors.primary}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      styles.dayTitle,
                      {
                        color: colors.text || '#fff',
                      },
                    ]}
                  >
                    برنامه حفظ
                  </Text>

                  <Text
                    style={[
                      styles.daySubtitle,
                      {
                        color: colors.textSecondary || '#aaa',
                      },
                    ]}
                  >
                    برنامه ۶ روزه سوره یس
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.dayBadge,
                  {
                    backgroundColor: `${colors.primary}18`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayBadgeText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  روز {currentDay}
                </Text>
              </View>
            </View>

            <View style={styles.dayStats}>
              <View
                style={[
                  styles.dayStat,
                  {
                    borderColor: colors.border || 'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color: colors.textSecondary || '#aaa',
                    },
                  ]}
                >
                  آیات امروز
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color: colors.text || '#fff',
                    },
                  ]}
                >
                  {todayVerses.length
                    ? `${todayVerses[0]} - ${
                        todayVerses[
                          todayVerses.length - 1
                        ]
                      }`
                    : '-'}
                </Text>
              </View>

              <View
                style={[
                  styles.dayStat,
                  {
                    borderColor: colors.border || 'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color: colors.textSecondary || '#aaa',
                    },
                  ]}
                >
                  تعداد آیات
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color: colors.text || '#fff',
                    },
                  ]}
                >
                  {todayVerses.length}
                </Text>
              </View>

              <View
                style={[
                  styles.dayStat,
                  {
                    borderColor: colors.border || 'rgba(255,255,255,0.08)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color: colors.textSecondary || '#aaa',
                    },
                  ]}
                >
                  پیشرفت
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {progress}٪
                </Text>
              </View>
            </View>
          </View>

          {/* PROGRESS */}

          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
                borderColor: colors.border || 'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View style={styles.progressHeader}>
              <View>
                <Text
                  style={[
                    styles.progressTitle,
                    {
                      color: colors.text || '#fff',
                    },
                  ]}
                >
                  پیشرفت حفظ
                </Text>

                <Text
                  style={[
                    styles.progressSubtitle,
                    {
                      color: colors.textSecondary || '#888',
                    },
                  ]}
                >
                  {memorizedVerses} از {totalVerses} آیه
                </Text>
              </View>

              <View
                style={[
                  styles.progressPercentPill,
                  {
                    backgroundColor: `${colors.primary}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressPercent,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {progress}٪
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor: isDark
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
                backgroundColor: colors.surface || 'rgba(255,255,255,0.05)',
                borderColor: colors.border || 'rgba(255,255,255,0.1)',
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

            <View style={styles.audioText}>
              <Text
                style={[
                  styles.audioTitle,
                  {
                    color: colors.text || '#fff',
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
                    color: colors.textSecondary || '#aaa',
                  },
                ]}
              >
                سوره یس
              </Text>
            </View>

            <View
              style={[
                styles.audioMeta,
                {
                  backgroundColor: `${colors.primary}10`,
                },
              ]}
            >
              <Clock
                size={14}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.audioMetaText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                تلاوت
              </Text>
            </View>
          </View>

          {/* TRANSLATION */}

          {!showTranslation && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setShowTranslation(true)
              }
              style={[
                styles.showTranslationButton,
                {
                  backgroundColor: `${colors.primary}08`,
                  borderColor: `${colors.primary}30`,
                },
              ]}
            >
              <Eye
                size={18}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.showTranslationText,
                  {
                    color: colors.primary,
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

          {/* COMPLETE */}

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
              <View
                style={[
                  styles.completeIcon,
                  {
                    backgroundColor:
                      'rgba(52,211,153,0.10)',
                  },
                ]}
              >
                <CheckCircle
                  size={22}
                  color="#34D399"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.completeTitle,
                    {
                      color: '#34D399',
                    },
                  ]}
                >
                  مطالعه امروز انجام شد
                </Text>

                <Text
                  style={[
                    styles.completeText,
                    {
                      color: colors.textSecondary || '#aaa',
                    },
                  ]}
                >
                  آیات امروز با موفقیت ثبت شدند.
                </Text>
              </View>
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
    paddingTop: 16,
    paddingBottom: 50,
  },

  /* =========================================================
     HEADER - NEW STYLES
  ========================================================= */

  header: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
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

  headerCenter: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginHorizontal: 12,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* =========================================================
     DAY
  ========================================================= */

  dayCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dayTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  dayIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dayTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  daySubtitle: {
    fontSize: 11,
    marginTop: 4,
  },

  dayBadge: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
  },

  dayBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  dayStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },

  dayStat: {
    flex: 1,
    minHeight: 64,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
  },

  statLabel: {
    fontSize: 10,
    marginBottom: 4,
  },

  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* PROGRESS */

  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  progressSubtitle: {
    fontSize: 10,
    marginTop: 3,
  },

  progressPercentPill: {
    minWidth: 53,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressPercent: {
    fontSize: 12,
    fontWeight: '900',
  },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  /* QURAN */

  quranCard: {
    borderRadius: 27,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
  },

  quranGradient: {
    padding: 12,
  },

  quranTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 5,
  },

  quranIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  quranEyebrow: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginBottom: 2,
  },

  quranSurah: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },

  quranDayPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  quranDayText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  ornamentalBorder: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
  },

  surahTitleBox: {
    alignSelf: 'center',
    paddingHorizontal: 27,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 11,
  },

  surahTitle: {
    fontSize: 21,
    fontWeight: '800',
    fontFamily: 'serif',
  },

  basmala: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 35,
    marginBottom: 13,
    fontFamily: 'serif',
  },

  ayahList: {
    gap: 5,
  },

  ayahRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 4,
  },

  ayahBlurred: {
    opacity: 0.14,
  },

  ayahText: {
    flex: 1,
    textAlign: 'right',
    fontFamily: 'serif',
    fontSize: 18,
    lineHeight: 34,
  },

  ayahNumber: {
    width: 27,
    height: 27,
    borderRadius: 14,
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
    borderRadius: 19,
    padding: 11,
    marginBottom: 12,
  },

  audioButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  audioText: {
    marginLeft: 11,
    flex: 1,
  },

  audioTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  audioSubtitle: {
    fontSize: 10,
    marginTop: 3,
  },

  audioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 10,
  },

  audioMetaText: {
    fontSize: 9,
    fontWeight: '800',
  },

  /* CARDS */

  card: {
    borderRadius: 21,
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
    gap: 10,
    flex: 1,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  cardCaption: {
    fontSize: 10,
    marginTop: 3,
  },

  smallIconButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* TRANSLATION */

  translationList: {
    marginTop: 12,
  },

  translationItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  translationNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  translationRef: {
    fontSize: 10,
    fontWeight: '900',
  },

  translationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 24,
    textAlign: 'right',
  },

  /* REVIEW */

  reviewItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  reviewNumber: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewRef: {
    fontSize: 10,
    fontWeight: '900',
  },

  reviewText: {
    flex: 1,
    fontFamily: 'serif',
    fontSize: 17,
    lineHeight: 30,
    textAlign: 'right',
  },

  /* ACTION SECTION */

  actionSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  actionSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  actionSectionSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },

  actionSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  actionButton: {
    width: '48%',
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 7,
  },

  actionButtonText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  quizButton: {
    width: '48%',
    minHeight: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  quizButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },

  finishButton: {
    marginTop: 10,
    minHeight: 53,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  finishButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },

  showTranslationButton: {
    minHeight: 49,
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

  /* COMPLETE */

  completeCard: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },

  completeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  completeTitle: {
    fontSize: 13,
    fontWeight: '900',
  },

  completeText: {
    fontSize: 10,
    marginTop: 3,
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,5,17,0.91)',
    justifyContent: 'center',
    padding: 12,
  },

  modalContainer: {
    maxHeight: '94%',
    width: '100%',
    borderRadius: 27,
    overflow: 'hidden',
  },

  modalHeader: {
    minHeight: 79,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  modalHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  modalSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
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
    fontSize: 11,
    fontWeight: '800',
  },

  /* QUESTION */

  questionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  questionCounter: {
    fontSize: 10,
    fontWeight: '600',
  },

  questionType: {
    fontSize: 14,
    fontWeight: '900',
    marginTop: 3,
  },

  quizModePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  quizModeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  quizProgressTrack: {
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 14,
  },

  quizProgressFill: {
    height: '100%',
    borderRadius: 999,
  },

  promptCard: {
    padding: 13,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
  },

  promptIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  promptText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 22,
    textAlign: 'right',
    fontWeight: '700',
  },

  displayCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
  },

  displayLabel: {
    textAlign: 'right',
    fontSize: 9,
    marginBottom: 8,
    fontWeight: '700',
  },

  displayText: {
    textAlign: 'center',
    fontFamily: 'serif',
    fontSize: 19,
    lineHeight: 36,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    textAlign: 'right',
    fontSize: 15,
    marginBottom: 12,
  },

  optionsContainer: {
    gap: 9,
  },

  option: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },

  optionIndex: {
    width: 31,
    height: 31,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionIndexText: {
    fontSize: 11,
    fontWeight: '900',
  },

  optionText: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 23,
  },

  feedback: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
  },

  feedbackTitle: {
    fontSize: 12,
    fontWeight: '900',
  },

  feedbackAnswer: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 19,
  },

  quizActionButton: {
    marginTop: 14,
    minHeight: 53,
    borderRadius: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  quizActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

  /* RESULT */

  resultContainer: {
    borderWidth: 1,
    borderRadius: 21,
    padding: 20,
    alignItems: 'center',
  },

  resultIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  resultEyebrow: {
    fontSize: 10,
    fontWeight: '700',
  },

  resultScore: {
    fontSize: 46,
    fontWeight: '900',
    marginTop: 2,
  },

  resultPercentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 4,
  },

  resultPercentText: {
    fontSize: 12,
    fontWeight: '900',
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 14,
  },

  resultMessage: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 21,
  },

  resultProgressTrack: {
    width: '100%',
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 18,
  },

  resultProgressFill: {
    height: '100%',
    borderRadius: 999,
  },

  resultActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 20,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  secondaryButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },

  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
});