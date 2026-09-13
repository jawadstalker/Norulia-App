import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText as Text } from '../ui/AppText';
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
  translationEn: string;
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

const TRANSLATIONS = {
  fa: {
    quran: 'قرآن',
    quranMemorization: 'حفظ قرآن',
    quranSurahYasin: 'سوره نبأ',
    quranProgram: 'برنامه حفظ',
    quranSixDayProgram: 'برنامه ۶ روزه سوره نبأ',
    quranDay: 'روز',
    quranTodayVerses: 'آیات امروز',
    quranVerseCount: 'تعداد آیات',
    quranProgress: 'پیشرفت',
    quranMemorizationProgress: 'پیشرفت حفظ',
    quranVerseOf: 'آیه از',
    quranListenRecitation: 'شنیدن تلاوت',
    quranPlaying: 'در حال پخش...',
    quranRecitation: 'تلاوت',
    quranTodayTranslation: 'ترجمه آیات امروز',
    quranReviewMeaning: 'مرور معنای آیات',
    quranPreviousVerses: 'مرور آیات قبلی',
    quranVersesForReview: 'آیه برای مرور',
    quranExercisesAndQuiz: 'تمرین و آزمون',
    quranTestMemory: 'حافظه خود را با آزمون‌های کوتاه بسنجید',
    quranHideTranslation: 'مخفی کردن ترجمه',
    quranShowTranslation: 'نمایش ترجمه',
    quranReviewVerses: 'مرور آیات',
    quranNormalMode: 'حالت عادی',
    quranTodayQuiz: 'آزمون امروز',
    quranReviewQuiz: 'آزمون مرور',
    quranFinishStudy: 'پایان مطالعه امروز',
    quranStudyCompleted: 'مطالعه امروز انجام شد',
    quranRegisteredSuccessfully: 'آیات امروز با موفقیت ثبت شدند.',
    quranNoVersesToday: 'هیچ آیاتی برای امروز تعیین نشده است.',
    quranNoVersesForReview: 'هنوز آیات قبلی برای آزمون مرور وجود ندارد.',
    quranStudyAlreadyCompleted:
      'مطالعه امروز انجام شده است. آزمون امروز فقط قبل از پایان مطالعه قابل انجام است.',
    quranQuiz: 'آزمون',
    quranNoQuestions: 'در حال حاضر سؤالی برای تولید وجود ندارد.',
    quranYesFinishStudy: 'بله، پایان مطالعه',
    quranDayCompleted: 'روز کامل شد',
    quranProgramCompleted: 'برنامه کامل شد',
    quranProgramCompletedMessage:
      'شما برنامه حفظ سوره نبأ را کامل کردید.',
    quranQuestion: 'سؤال',
    quranOf: 'از',
    quranToday: 'امروز',
    quranReview: 'مرور',
    quranQuestionText: 'متن سؤال',
    quranCheckAnswer: 'بررسی پاسخ',
    quranNextQuestion: 'سؤال بعدی',
    quranViewResult: 'مشاهده نتیجه',
    quranGenerateNewQuestion: 'تولید سؤال جدید',
    quranCorrectAnswer: 'پاسخ صحیح',
    quranCorrect: 'پاسخ صحیح است',
    quranIncorrect: 'پاسخ نادرست است',
    quranResult: 'نتیجه آزمون',
    quranExcellent: 'عالی! تمام پاسخ‌ها صحیح بودند.',
    quranGoodPerformance:
      'عملکرد خوبی داشتی؛ با کمی مرور بهتر هم می‌شود.',
    quranNeedMoreReview:
      'مرور بیشتر به تثبیت مطالب کمک می‌کند.',
    quranRetake: 'آزمون دوباره',
    quranFinish: 'پایان',
    quranTodayStudy: 'مطالعه امروز',
    quranStudy: 'مطالعه',
    cancel: 'لغو',

    quranMeccan: 'مکی',
    quranMedinan: 'مدنی',
    quranAyahCount: 'آیه',
    quranJuz: 'جزء',
    quranPage: 'صفحه',
    quranMushafNote:
      'رسم‌الخط بر پایه مصحف مدینه (عثمان طه)',

    exitTitle: 'خروج از آزمون',
    exitMessage:
      'در حال حاضر وسط یک آزمون هستید. آیا واقعاً می‌خواهید از این صفحه خارج شوید؟ پیشرفت این آزمون ذخیره نخواهد شد.',
    exitCancel: 'ادامه آزمون',
    exitConfirm: 'بله، خارج شو',
  },

  en: {
    quran: 'Quran',
    quranMemorization: 'Quran Memorization',
    quranSurahYasin: 'Surah An-Naba',
    quranProgram: 'Memorization Plan',
    quranSixDayProgram: '6-day Surah An-Naba plan',
    quranDay: 'Day',
    quranTodayVerses: "Today's Verses",
    quranVerseCount: 'Verse Count',
    quranProgress: 'Progress',
    quranMemorizationProgress: 'Memorization Progress',
    quranVerseOf: 'verses of',
    quranListenRecitation: 'Listen to Recitation',
    quranPlaying: 'Playing...',
    quranRecitation: 'Recitation',
    quranTodayTranslation: "Today's Verse Translation",
    quranReviewMeaning: 'Review the meaning of the verses',
    quranPreviousVerses: 'Review Previous Verses',
    quranVersesForReview: 'verses for review',
    quranExercisesAndQuiz: 'Practice & Quiz',
    quranTestMemory: 'Test your memory with short quizzes',
    quranHideTranslation: 'Hide Translation',
    quranShowTranslation: 'Show Translation',
    quranReviewVerses: 'Review Verses',
    quranNormalMode: 'Normal Mode',
    quranTodayQuiz: "Today's Quiz",
    quranReviewQuiz: 'Review Quiz',
    quranFinishStudy: "Finish Today's Study",
    quranStudyCompleted: "Today's Study Completed",
    quranRegisteredSuccessfully:
      "Today's verses were successfully recorded.",
    quranNoVersesToday: 'No verses assigned for today.',
    quranNoVersesForReview:
      'No previous verses available for review quiz.',
    quranStudyAlreadyCompleted:
      "Today's study is already completed. The quiz can only be taken before finishing today's study.",
    quranQuiz: 'Quiz',
    quranNoQuestions:
      'No questions available to generate at this time.',
    quranYesFinishStudy: 'Yes, finish study',
    quranDayCompleted: 'Day Completed',
    quranProgramCompleted: 'Program Completed',
    quranProgramCompletedMessage:
      'You have completed the Surah An-Naba memorization program.',
    quranQuestion: 'Question',
    quranOf: 'of',
    quranToday: 'Today',
    quranReview: 'Review',
    quranQuestionText: 'Question Text',
    quranCheckAnswer: 'Check Answer',
    quranNextQuestion: 'Next Question',
    quranViewResult: 'View Result',
    quranGenerateNewQuestion: 'Generate New Question',
    quranCorrectAnswer: 'Correct answer',
    quranCorrect: 'Correct answer',
    quranIncorrect: 'Incorrect answer',
    quranResult: 'Quiz Result',
    quranExcellent:
      'Excellent! All answers were correct.',
    quranGoodPerformance:
      'Good performance! A little more review will make it even better.',
    quranNeedMoreReview:
      'More review will help reinforce what you learned.',
    quranRetake: 'Retake Quiz',
    quranFinish: 'Finish',
    quranTodayStudy: "Today's Study",
    quranStudy: 'Study',
    cancel: 'Cancel',

    quranMeccan: 'Meccan',
    quranMedinan: 'Medinan',
    quranAyahCount: 'verses',
    quranJuz: "Juz'",
    quranPage: 'Page',
    quranMushafNote:
      'Script based on the Madinah Mushaf (Uthman Taha)',

    exitTitle: 'Leave the Quiz',
    exitMessage:
      'You are currently in the middle of a quiz. Are you sure you want to leave this page? The progress of this quiz will not be saved.',
    exitCancel: 'Continue Quiz',
    exitConfirm: 'Yes, Leave',
  },
};

const STORAGE_KEY = 'quran_memorization_progress_v2';
const LAST_UPDATE_KEY = 'quran_last_update_v2';

const QURAN_FONT_FAMILY = 'UthmanicHafs';


const MUSHAF_LINE_FONT_SIZE = 14;
const MUSHAF_LINE_HEIGHT = 22;
const MUSHAF_MARK_FONT_SIZE = 7.5;

const SURAH_META = {
  number: 78,
  arabicName: 'النبأ',
  totalAyahs: 40,
  isMeccan: true,
  juz: '30',
};

const ARABIC_INDIC_DIGITS = [
  '٠',
  '١',
  '٢',
  '٣',
  '٤',
  '٥',
  '٦',
  '٧',
  '٨',
  '٩',
];

const toArabicDigits = (value: number | string) =>
  String(value)
    .split('')
    .map(char => {
      const digit = Number(char);
      return Number.isNaN(digit)
        ? char
        : ARABIC_INDIC_DIGITS[digit];
    })
    .join('');

const PLAN: DayPlan[] = [
  { day: 1, verses: [1, 2, 3, 4, 5, 6, 7] },
  { day: 2, verses: [8, 9, 10, 11, 12, 13, 14] },
  { day: 3, verses: [15, 16, 17, 18, 19, 20, 21] },
  { day: 4, verses: [22, 23, 24, 25, 26, 27, 28] },
  { day: 5, verses: [29, 30, 31, 32, 33, 34] },
  { day: 6, verses: [35, 36, 37, 38, 39, 40] },
];

const SURAH_NABA: QuranVerse[] = [
  {
    number: 1,
    arabic: 'عَمَّ يَتَسَآءَلُونَ',
    translation: 'درباره چه چیزی از یکدیگر می‌پرسند؟',
    translationEn: 'About what are they asking one another?',
  },
  {
    number: 2,
    arabic: 'عَنِ ٱلنَّبَإِ ٱلۡعَظِيمِ',
    translation: 'درباره خبری بزرگ',
    translationEn: 'About the great news',
  },
  {
    number: 3,
    arabic: 'ٱلَّذِي هُمۡ فِيهِ مُخۡتَلِفُونَ',
    translation: 'که آن‌ها در آن اختلاف دارند',
    translationEn: 'That over which they are in disagreement',
  },
  {
    number: 4,
    arabic: 'كَلَّا سَيَعۡلَمُونَ',
    translation: 'نه چنین است، به زودی خواهند دانست',
    translationEn: 'No! They are going to know',
  },
  {
    number: 5,
    arabic: 'ثُمَّ كَلَّا سَيَعۡلَمُونَ',
    translation: 'سپس نه چنین است، به زودی خواهند دانست',
    translationEn: 'Then, no! They are going to know',
  },
  {
    number: 6,
    arabic: 'أَلَمۡ نَجۡعَلِ ٱلۡأَرۡضَ مِهَٰدٗا',
    translation: 'آیا زمین را بستری قرار ندادیم؟',
    translationEn: 'Have We not made the earth a resting place?',
  },
  {
    number: 7,
    arabic: 'وَٱلۡجِبَالَ أَوۡتَادٗا',
    translation: 'و کوه‌ها را میخ‌هایی؟',
    translationEn: 'And the mountains as stakes?',
  },
  {
    number: 8,
    arabic: 'وَخَلَقۡنَٰكُمۡ أَزۡوَٰجٗا',
    translation: 'و شما را جفت‌جفت آفریدیم',
    translationEn: 'And We created you in pairs',
  },
  {
    number: 9,
    arabic: 'وَجَعَلۡنَا نَوۡمَكُمۡ سُبَاتٗا',
    translation: 'و خواب شما را مایه آرامش قرار دادیم',
    translationEn: 'And made your sleep a rest',
  },
  {
    number: 10,
    arabic: 'وَجَعَلۡنَا ٱلَّيۡلَ لِبَاسٗا',
    translation: 'و شب را پوششی قرار دادیم',
    translationEn: 'And made the night a covering',
  },
  {
    number: 11,
    arabic: 'وَجَعَلۡنَا ٱلنَّهَارَ مَعَاشٗا',
    translation: 'و روز را زمانه‌ای برای معاش',
    translationEn: 'And made the day for livelihood',
  },
  {
    number: 12,
    arabic: 'وَبَنَيۡنَا فَوۡقَكُمۡ سَبۡعٗا شِدَادٗا',
    translation: 'و بالای سرتان هفت آسمان محکم بنا کردیم',
    translationEn: 'And constructed above you seven strong heavens',
  },
  {
    number: 13,
    arabic: 'وَجَعَلۡنَا سِرَاجٗا وَهَّاجٗا',
    translation: 'و چراغی فروزان قرار دادیم',
    translationEn: 'And made a burning lamp',
  },
  {
    number: 14,
    arabic: 'وَأَنزَلۡنَا مِنَ ٱلۡمُعۡصِرَٰتِ مَآءٗ ثَجَّاجٗا',
    translation: 'و از ابرهای باران‌زا آبی ریزان فرو فرستادیم',
    translationEn: 'And sent down from the rain clouds pouring water',
  },
  {
    number: 15,
    arabic: 'لِّنُخۡرِجَ بِهِۦ حَبّٗا وَنَبَاتٗا',
    translation: 'تا با آن دانه و گیاه برویانیم',
    translationEn: 'That We may bring forth thereby grain and vegetation',
  },
  {
    number: 16,
    arabic: 'وَجَنَّٰتٍ أَلۡفَافًا',
    translation: 'و باغ‌هایی انبوه',
    translationEn: 'And gardens of entwined growth',
  },
  {
    number: 17,
    arabic: 'إِنَّ يَوۡمَ ٱلۡفَصۡلِ كَانَ مِيقَٰتٗا',
    translation: 'همانا روز جدايى وقتى معين است',
    translationEn: 'Indeed, the Day of Judgement is an appointed time',
  },
  {
    number: 18,
    arabic: 'يَوۡمَ يُنفَخُ فِي ٱلصُّورِ فَتَأۡتُونَ أَفۡوَاجٗا',
    translation: 'روزی که در صور دمیده شود و دسته‌دسته بیایید',
    translationEn: 'The Day the Horn is blown and you will come forth in multitudes',
  },
  {
    number: 19,
    arabic: 'وَفُتِحَتِ ٱلسَّمَآءُ فَكَانَتۡ أَبۡوَٰبٗا',
    translation: 'و آسمان گشوده شود و به صورت درهایی درآید',
    translationEn: 'And the heaven is opened and becomes gateways',
  },
  {
    number: 20,
    arabic: 'وَسُيِّرَتِ ٱلۡجِبَالُ فَكَانَتۡ سَرَابًا',
    translation: 'و کوه‌ها به حرکت درآیند و سرابی شوند',
    translationEn: 'And the mountains are moved and become a mirage',
  },
  {
    number: 21,
    arabic: 'إِنَّ جَهَنَّمَ كَانَتۡ مِرۡصَادٗا',
    translation: 'همانا جهنم کمین‌گاهی است',
    translationEn: 'Indeed, Hell has been lying in wait',
  },
  {
    number: 22,
    arabic: 'لِّلطَّٰغِينَ مَآبٗا',
    translation: 'برای سرکشان بازگشت‌گاهی',
    translationEn: 'For the transgressors, a place of return',
  },
  {
    number: 23,
    arabic: 'لَّٰبِثِينَ فِيهَآ أَحۡقَابٗا',
    translation: 'که سال‌های طولانی در آن می‌مانند',
    translationEn: 'In which they will remain for ages',
  },
  {
    number: 24,
    arabic: 'لَّا يَذُوقُونَ فِيهَا بَرۡدٗا وَلَا شَرَابًا',
    translation: 'در آن نه خنکی می‌چشند و نه نوشیدنی',
    translationEn: 'They will not taste therein any coolness or drink',
  },
  {
    number: 25,
    arabic: 'إِلَّا حَمِيمٗا وَغَسَّاقٗا',
    translation: 'مگر آب جوشان و چرک',
    translationEn: 'Except boiling water and pus',
  },
  {
    number: 26,
    arabic: 'جَزَآءٗ وِفَاقًا',
    translation: 'پاداشی مناسب',
    translationEn: 'An appropriate recompense',
  },
  {
    number: 27,
    arabic: 'إِنَّهُمۡ كَانُواْ لَا يَرۡجُونَ حِسَابٗا',
    translation: 'همانا آن‌ها به حساب امیدی نداشتند',
    translationEn: 'Indeed, they were not expecting an account',
  },
  {
    number: 28,
    arabic: 'وَكَذَّبُواْ بِـَٔايَٰتِنَا كِذَّابٗا',
    translation: 'و آیات ما را به شدت تکذیب کردند',
    translationEn: 'And denied Our verses with emphatic denial',
  },
  {
    number: 29,
    arabic: 'وَكُلَّ شَيۡءٍ أَحۡصَيۡنَٰهُ كِتَٰبٗا',
    translation: 'و هر چیزی را در کتابی برشمرده‌ایم',
    translationEn: 'But all things We have enumerated in writing',
  },
  {
    number: 30,
    arabic: 'فَذُوقُواْ فَلَن نَّزِيدَكُمۡ إِلَّا عَذَابًا',
    translation: 'پس بچشید که جز عذاب بر شما نمی‌افزاییم',
    translationEn: 'So taste it, and never will We increase you except in punishment',
  },
  {
    number: 31,
    arabic: 'إِنَّ لِلۡمُتَّقِينَ مَفَازٗا',
    translation: 'همانا برای پرهیزگاران رستگاری است',
    translationEn: 'Indeed, for the righteous is attainment',
  },
  {
    number: 32,
    arabic: 'حَدَآئِقَ وَأَعۡنَٰبٗا',
    translation: 'باغ‌ها و تاکستان‌هایی',
    translationEn: 'Gardens and grapevines',
  },
  {
    number: 33,
    arabic: 'وَكَوَاعِبَ أَتۡرَابٗا',
    translation: 'و دخترانی همسال',
    translationEn: 'And full-breasted maidens of equal age',
  },
  {
    number: 34,
    arabic: 'وَكَأۡسٗا دِهَاقٗا',
    translation: 'و جام‌هایی لبریز',
    translationEn: 'And a full cup',
  },
  {
    number: 35,
    arabic: 'لَّا يَسۡمَعُونَ فِيهَا لَغۡوٗا وَلَا كِذَّٰبٗا',
    translation: 'در آن نه بیهوده می‌شنوند و نه دروغ',
    translationEn: 'No ill speech will they hear therein or any falsehood',
  },
  {
    number: 36,
    arabic: 'جَزَآءٗ مِّن رَّبِّكَ عَطَآءً حِسَابٗا',
    translation: 'پاداشی از پروردگارت و بخششی به اندازه',
    translationEn: 'A reward from your Lord, a gift according to account',
  },
  {
    number: 37,
    arabic: 'رَّبِّ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضِ وَمَا بَيۡنَهُمَا ٱلرَّحۡمَٰنِ لَا يَمۡلِكُونَ مِنۡهُ خِطَابٗا',
    translation: 'پروردگار آسمان‌ها و زمین و آنچه میان آن‌هاست، رحمان؛ از او سخنی نمی‌توانند بگویند',
    translationEn: 'The Lord of the heavens and the earth and whatever is between them, the Most Merciful; they possess no power to speak to Him',
  },
  {
    number: 38,
    arabic: 'يَوۡمَ يَقُومُ ٱلرُّوحُ وَٱلۡمَلَٰٓئِكَةُ صَفّٗا لَّا يَتَكَلَّمُونَ إِلَّا مَنۡ أَذِنَ لَهُ ٱلرَّحۡمَٰنُ وَقَالَ صَوَابٗا',
    translation: 'روزی که روح و فرشتگان به صف می‌ایستند و سخن نمی‌گویند مگر کسی که رحمان به او اجازه دهد و سخن درست بگوید',
    translationEn: 'The Day that the Spirit and the angels will stand in rows, they will not speak except for one whom the Most Merciful permits, and he will say what is correct',
  },
  {
    number: 39,
    arabic: 'ذَٰلِكَ ٱلۡيَوۡمُ ٱلۡحَقُّ فَمَن شَآءَ ٱتَّخَذَ إِلَىٰ رَبِّهِۦ مَآبًا',
    translation: 'آن روز، روز حق است؛ پس هر کس بخواهد راهی به سوی پروردگارش برگزیند',
    translationEn: 'That is the True Day; so he who wills may take to his Lord a return',
  },
  {
    number: 40,
    arabic: 'إِنَّآ أَنذَرۡنَٰكُمۡ عَذَابٗا قَرِيبٗا يَوۡمَ يَنظُرُ ٱلۡمَرۡءُ مَا قَدَّمَتۡ يَدَاهُ وَيَقُولُ ٱلۡكَافِرُ يَٰلَيۡتَنِي كُنتُ تُرَٰبَۢا',
    translation: 'همانا شما را از عذابی نزدیک هشدار دادیم؛ روزی که انسان آنچه را دستانش پیش فرستاده می‌بیند و کافر می‌گوید: ای کاش خاک بودم!',
    translationEn: 'Indeed, We have warned you of a near punishment on the Day when a man will observe what his hands have put forth and the disbeliever will say, "Oh, I wish that I were dust!"',
  },
];

/*
 * ------------------------------------------------------------
 * چیدمان دقیق خطوط مصحف مدینه برای سوره نبأ
 * ------------------------------------------------------------
 * آیات ۱ تا ۳۰ (۱۳ خط) دقیقاً از روی تصویر صفحهٔ ارسال‌شده
 * (چاپ مجمع ملک فهد، رسم‌الخط عثمان طه) خط‌به‌خط پیاده‌سازی
 * شده — شامل مواردی که یک آیه وسط کلمه از خطی به خط بعد
 * می‌رود (مثلاً آیهٔ ۱۲ با «وَبَنَيۡنَا» در پایان یک خط تمام
 * می‌شود و «فَوۡقَكُمۡ سَبۡعٗا شِدَادٗا» در ابتدای خط بعد ادامه
 * پیدا می‌کند). هر بخش از یک آیه یا 'full' (کامل روی همین خط)
 * یا 'start' (شروع آیه، بدون علامت پایان) یا 'end' (باقیِ
 * متن + علامت پایان آیه) است.
 *
 * آیات ۳۱ تا ۴۰ (۷ خط) چون تصویر مرجعی برایشان ارسال نشده،
 * با همان تقسیم‌بندی معقول قبلی نگه داشته شده‌اند.
 */
type MushafSegment =
  | { verse: number; part: 'full' }
  | { verse: number; part: 'start'; text: string }
  | { verse: number; part: 'end'; text: string };

const MUSHAF_LINES: MushafSegment[][] = [
  // ===== صفحهٔ اول — دقیقاً مطابق تصویر (آیات ۱ تا ۳۰) =====
  [
    { verse: 1, part: 'full' },
    { verse: 2, part: 'full' },
    { verse: 3, part: 'full' },
  ],
  [
    { verse: 4, part: 'full' },
    { verse: 5, part: 'full' },
    { verse: 6, part: 'full' },
  ],
  [
    { verse: 7, part: 'full' },
    { verse: 8, part: 'full' },
    { verse: 9, part: 'full' },
  ],
  [
    { verse: 10, part: 'full' },
    { verse: 11, part: 'full' },
    { verse: 12, part: 'start', text: 'وَبَنَيۡنَا' },
  ],
  [
    { verse: 12, part: 'end', text: 'فَوۡقَكُمۡ سَبۡعٗا شِدَادٗا' },
    { verse: 13, part: 'full' },
    { verse: 14, part: 'start', text: 'وَأَنزَلۡنَا' },
  ],
  [
    { verse: 14, part: 'end', text: 'مِنَ ٱلۡمُعۡصِرَٰتِ مَآءٗ ثَجَّاجٗا' },
    { verse: 15, part: 'full' },
    { verse: 16, part: 'start', text: 'وَجَنَّٰتٍ' },
  ],
  [
    { verse: 16, part: 'end', text: 'أَلۡفَافًا' },
    { verse: 17, part: 'full' },
    { verse: 18, part: 'start', text: 'يَوۡمَ يُنفَخُ فِي ٱلصُّورِ' },
  ],
  [
    { verse: 18, part: 'end', text: 'فَتَأۡتُونَ أَفۡوَاجٗا' },
    { verse: 19, part: 'full' },
    { verse: 20, part: 'start', text: 'وَسُيِّرَتِ' },
  ],
  [
    { verse: 20, part: 'end', text: 'ٱلۡجِبَالُ فَكَانَتۡ سَرَابًا' },
    { verse: 21, part: 'full' },
    { verse: 22, part: 'start', text: 'لِّلطَّٰغِينَ' },
  ],
  [
    { verse: 22, part: 'end', text: 'مَآبٗا' },
    { verse: 23, part: 'full' },
    { verse: 24, part: 'full' },
  ],
  [
    { verse: 25, part: 'full' },
    { verse: 26, part: 'full' },
    { verse: 27, part: 'start', text: 'إِنَّهُمۡ كَانُواْ' },
  ],
  [
    { verse: 27, part: 'end', text: 'لَا يَرۡجُونَ حِسَابٗا' },
    { verse: 28, part: 'full' },
    { verse: 29, part: 'start', text: 'وَكُلَّ شَيۡءٍ' },
  ],
  [
    { verse: 29, part: 'end', text: 'أَحۡصَيۡنَٰهُ كِتَٰبٗا' },
    { verse: 30, part: 'full' },
  ],

  // ===== صفحهٔ دوم (آیات ۳۱ تا ۴۰) — بدون تصویر مرجع =====
  [
    { verse: 31, part: 'full' },
    { verse: 32, part: 'full' },
    { verse: 33, part: 'full' },
  ],
  [
    { verse: 34, part: 'full' },
    { verse: 35, part: 'full' },
  ],
  [{ verse: 36, part: 'full' }],
  [{ verse: 37, part: 'full' }],
  [{ verse: 38, part: 'full' }],
  [{ verse: 39, part: 'full' }],
  [{ verse: 40, part: 'full' }],
];

const WORD_LINE_LOCATIONS: Record<string, number> = {
  عَمَّ: 1,
  يَتَسَآءَلُونَ: 1,
  ٱلنَّبَإِ: 1,
  ٱلۡعَظِيمِ: 1,
  مُخۡتَلِفُونَ: 1,
  سَيَعۡلَمُونَ: 2,
  ٱلۡأَرۡضَ: 2,
  مِهَٰدٗا: 2,
  وَٱلۡجِبَالَ: 3,
  أَوۡتَادٗا: 3,
  أَزۡوَٰجٗا: 3,
  سُبَاتٗا: 3,
  لِبَاسٗا: 4,
  مَعَاشٗا: 4,
  سَبۡعٗا: 5,
  شِدَادٗا: 5,
  سِرَاجٗا: 5,
  وَهَّاجٗا: 5,
  ٱلۡمُعۡصِرَٰتِ: 6,
  ثَجَّاجٗا: 6,
  حَبّٗا: 6,
  وَنَبَاتٗا: 6,
  أَلۡفَافًا: 7,
  ٱلۡفَصۡلِ: 7,
  مِيقَٰتٗا: 7,
  ٱلصُّورِ: 7,
  أَفۡوَاجٗا: 8,
  أَبۡوَٰبٗا: 8,
  سَرَابًا: 9,
  جَهَنَّمَ: 9,
  مِرۡصَادٗا: 9,
  لِّلطَّٰغِينَ: 9,
  أَحۡقَابٗا: 10,
  حَمِيمٗا: 11,
  وَغَسَّاقٗا: 11,
  وِفَاقًا: 11,
  يَرۡجُونَ: 12,
  حِسَابٗا: 12,
  كِتَٰبٗا: 13,
  عَذَابًا: 13,
  مَفَازٗا: 14,
  حَدَآئِقَ: 14,
  وَأَعۡنَٰبٗا: 14,
  وَكَوَاعِبَ: 14,
  أَتۡرَابٗا: 14,
  دِهَاقٗا: 15,
  لَغۡوٗا: 15,
  كِذَّٰبٗا: 15,
  ٱلرُّوحُ: 18,
  صَوَابٗا: 18,
  ٱلۡحَقُّ: 19,
  مَآبًا: 19,
  قَرِيبٗا: 20,
  تُرَٰبَۢا: 20,
};

const normalizeArabic = (value: string) => {
  return value
    .trim()
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ى/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[^\d۰-۹]/g, '');
};

const getVerse = (number: number) =>
  SURAH_NABA.find(v => v.number === number);

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

const makeShortText = (
  text: string,
  length = 45,
) => {
  if (text.length <= length) return text;

  return `${text.substring(0, length)}...`;
};

const generateQuestions = (
  verses: number[],
  count: number,
  isRTL: boolean,
): QuizQuestion[] => {
  if (!verses.length) return [];

  const questions: QuizQuestion[] = [];
  const availableVerses = shuffle(verses);
  const availableWords = shuffle(
    getWordsFromVerses(verses),
  );

  const questionCount = Math.min(
    count,
    availableVerses.length +
      Math.floor(availableWords.length / 2),
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
        Math.floor(
          Math.random() * possibleTypes.length,
        )
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
      if (verseCursor >= availableVerses.length)
        continue;

      const ayahNumber =
        availableVerses[verseCursor++];

      const verse = getVerse(ayahNumber);

      if (!verse) continue;

      questions.push({
        id: `${Date.now()}-${i}-ayah`,
        type: 'ayah_number',
        ayah: ayahNumber,
        prompt: isRTL
          ? 'شماره آیه‌ای که متن زیر مربوط به آن است را وارد کنید.'
          : 'Enter the verse number for the text below.',
        display: makeShortText(verse.arabic),
        answer: String(ayahNumber),
        typeLabel: isRTL
          ? 'شماره آیه'
          : 'Verse Number',
      });

      continue;
    }

    if (type === 'translation') {
      if (verseCursor >= availableVerses.length)
        continue;

      const ayahNumber =
        availableVerses[verseCursor++];

      const verse = getVerse(ayahNumber);

      if (!verse) continue;

      const translationText = isRTL
        ? verse.translation
        : verse.translationEn;

      const otherTranslations = verses
        .filter(number => number !== ayahNumber)
        .map(number => {
          const v = getVerse(number);

          if (!v) return '';

          return isRTL
            ? v.translation
            : v.translationEn;
        })
        .filter(Boolean) as string[];

      const options = shuffle([
        translationText,
        ...shuffle(otherTranslations).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-translation`,
        type: 'translation',
        ayah: ayahNumber,
        prompt: isRTL
          ? 'ترجمه صحیح این آیه را از بین گزینه‌های زیر انتخاب کنید.'
          : 'Select the correct translation from the options below.',
        display: makeShortText(verse.arabic),
        options,
        answer: translationText,
        typeLabel: isRTL
          ? 'ترجمه'
          : 'Translation',
      });

      continue;
    }

    if (type === 'continuation') {
      if (verseCursor >= availableVerses.length)
        continue;

      const ayahNumber =
        availableVerses[verseCursor++];

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

          const otherWords =
            other.arabic.split(' ');

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
        prompt: isRTL
          ? 'ادامه صحیح این آیه را از بین گزینه‌های زیر انتخاب کنید.'
          : 'Select the correct continuation from the options below.',
        display: `${firstHalf} ...`,
        options,
        answer: secondHalf,
        typeLabel: isRTL
          ? 'تکمیل آیه'
          : 'Complete Verse',
      });

      continue;
    }

    if (type === 'verse_from_translation') {
      if (verseCursor >= availableVerses.length)
        continue;

      const ayahNumber =
        availableVerses[verseCursor++];

      const verse = getVerse(ayahNumber);

      if (!verse) continue;

      const translationText = isRTL
        ? verse.translation
        : verse.translationEn;

      const numberOptions = shuffle([
        ayahNumber,
        ...shuffle(
          verses.filter(
            number => number !== ayahNumber,
          ),
        ).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-verse`,
        type: 'verse_from_translation',
        ayah: ayahNumber,
        prompt: isRTL
          ? 'این ترجمه مربوط به کدام آیه است؟'
          : 'Which verse does this translation belong to?',
        display: translationText,
        options: numberOptions,
        answer: ayahNumber,
        typeLabel: isRTL
          ? 'تشخیص آیه'
          : 'Identify Verse',
      });

      continue;
    }

    if (type === 'word_line') {
      if (wordCursor >= availableWords.length)
        continue;

      const word = availableWords[wordCursor++];

      const correctLine =
        WORD_LINE_LOCATIONS[word];

      if (!correctLine) continue;

      const lineOptions = shuffle([
        correctLine,
        ...shuffle(
          Array.from(
            { length: MUSHAF_LINES.length },
            (_, index) => index + 1,
          ).filter(
            line => line !== correctLine,
          ),
        ).slice(0, 3),
      ]);

      questions.push({
        id: `${Date.now()}-${i}-line`,
        type: 'word_line',
        word,
        prompt: isRTL
          ? 'کلمه زیر در کدام خط صفحه قرآن قرار دارد؟'
          : 'Which line of the page does this word belong to?',
        display: word,
        options: lineOptions,
        answer: correctLine,
        typeLabel: isRTL
          ? 'تشخیص خط'
          : 'Identify Line',
      });
    }
  }

  return questions;
};

export default function QuranScreen() {
  const { colors, isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  const navigation = useNavigation();

  const t =
    language === 'fa'
      ? TRANSLATIONS.fa
      : TRANSLATIONS.en;

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

  const [quizCorrect, setQuizCorrect] =
    useState(0);

  const [quizResult, setQuizResult] =
    useState<QuizResult | null>(null);

  const [playing, setPlaying] =
    useState(false);

  const [exitModalVisible, setExitModalVisible] =
    useState(false);

  const fadeAnim = useRef(
    new Animated.Value(0),
  ).current;

  const scaleAnim = useRef(
    new Animated.Value(0.97),
  ).current;

  const todayVerses = useMemo(
    () =>
      getDayPlan(currentDay)?.verses ?? [],
    [currentDay],
  );

  const previousVerses = useMemo(() => {
    const result: number[] = [];

    for (
      let day = 1;
      day < currentDay;
      day += 1
    ) {
      const plan = getDayPlan(day);

      if (plan) {
        result.push(...plan.verses);
      }
    }

    return result;
  }, [currentDay]);

  const totalVerses =
    SURAH_NABA.length;

  const memorizedVerses = useMemo(() => {
    let count = 0;

    for (
      let day = 1;
      day <= PLAN.length;
      day += 1
    ) {
      if (
        day < currentDay ||
        (day === currentDay &&
          isStudyComplete)
      ) {
        count +=
          getDayPlan(day)?.verses.length ?? 0;
      }
    }

    return count;
  }, [currentDay, isStudyComplete]);

  const progress = Math.round(
    (memorizedVerses / totalVerses) * 100,
  );

  const currentQuestion =
    quizQuestions[quizIndex];

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const AsyncStorage =
          require(
            '@react-native-async-storage/async-storage'
          ).default;

        const saved =
          await AsyncStorage.getItem(
            STORAGE_KEY,
          );

        const savedDate =
          await AsyncStorage.getItem(
            LAST_UPDATE_KEY,
          );

        const todayKey =
          new Date()
            .toISOString()
            .slice(0, 10);

        if (
          savedDate &&
          savedDate !== todayKey
        ) {
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
              typeof data.currentDay ===
              'number'
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
          } catch {}
        }

        if (!savedDate) {
          await AsyncStorage.setItem(
            LAST_UPDATE_KEY,
            todayKey,
          );
        }
      } catch {}
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
          require(
            '@react-native-async-storage/async-storage'
          ).default;

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            currentDay,
            isStudyComplete,
          }),
        );
      } catch {}
    };

    save();
  }, [currentDay, isStudyComplete]);

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

  const performExit = useCallback(() => {
    setExitModalVisible(false);

    if (quizVisible) {
      setQuizVisible(false);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [quizVisible, navigation]);

  const handleBack = useCallback(() => {
    if (exitModalVisible) return;

    if (quizVisible) {
      setExitModalVisible(true);
      return;
    }

    performExit();
  }, [exitModalVisible, quizVisible, performExit]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (exitModalVisible) {
          setExitModalVisible(false);
          return true;
        }

        handleBack();

        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [exitModalVisible, handleBack]);

  const startQuiz = (
    mode: StudyMode,
  ) => {
    const verses =
      mode === 'today'
        ? todayVerses
        : previousVerses;

    if (!verses.length) {
      Alert.alert(
        mode === 'today'
          ? t.quranTodayQuiz
          : t.quranReviewQuiz,
        mode === 'today'
          ? t.quranNoVersesToday
          : t.quranNoVersesForReview,
      );

      return;
    }

    if (
      mode === 'today' &&
      isStudyComplete
    ) {
      Alert.alert(
        t.quranTodayQuiz,
        t.quranStudyAlreadyCompleted,
      );

      return;
    }

    const count =
      mode === 'today'
        ? Math.min(5, verses.length)
        : Math.min(10, verses.length);

    const generated =
      generateQuestions(
        verses,
        count,
        isRTL,
      );

    if (!generated.length) {
      Alert.alert(
        t.quranQuiz,
        t.quranNoQuestions,
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
    if (
      !currentQuestion ||
      questionAnswered
    ) {
      return;
    }

    let correct = false;

    if (
      currentQuestion.type ===
      'ayah_number'
    ) {
      correct =
        fillAnswer.trim() ===
        String(currentQuestion.answer);
    } else {
      if (selectedOption === null)
        return;

      correct =
        String(selectedOption) ===
        String(currentQuestion.answer);
    }

    setQuestionAnswered(true);
    setQuestionCorrect(correct);

    if (correct) {
      setQuizCorrect(
        value => value + 1,
      );
    }
  };

  const nextQuestion = () => {
    if (!questionAnswered)
      return;

    if (
      quizIndex >=
      quizQuestions.length - 1
    ) {
      const finalCorrect =
        quizCorrect +
        (questionCorrect ? 1 : 0);

      const total =
        quizQuestions.length;

      const percentage =
        total > 0
          ? Math.round(
              (finalCorrect / total) *
                100,
            )
          : 0;

      setQuizResult({
        correct: finalCorrect,
        total,
        percentage,
      });

      return;
    }

    setQuizIndex(
      index => index + 1,
    );

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

    const generated =
      generateQuestions(
        verses,
        count,
        isRTL,
      );

    setQuizQuestions(generated);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizResult(null);
    resetQuestionState();
  };

  const finishStudy = () => {
    if (isStudyComplete) {
      Alert.alert(
        t.quranTodayStudy,
        t.quranStudyAlreadyCompleted,
      );

      return;
    }

    if (!todayVerses.length) {
      Alert.alert(
        t.quranStudy,
        t.quranNoVersesToday,
      );

      return;
    }

    Alert.alert(
      t.quranFinishStudy,

      isRTL
        ? `آیا از حفظ آیات ${todayVerses.join(
            '، ',
          )} اطمینان دارید؟`
        : `Are you sure you have memorized verses ${todayVerses.join(
            ', ',
          )}?`,

      [
        {
          text: t.cancel,
          style: 'cancel',
        },

        {
          text: t.quranYesFinishStudy,

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
                t.quranDayCompleted,

                isRTL
                  ? `روز ${currentDay} کامل شد.\nروز ${nextDay} فعال شد.`
                  : `Day ${currentDay} completed.\nDay ${nextDay} is now active.`,
              );
            } else {
              setIsStudyComplete(true);

              Alert.alert(
                t.quranProgramCompleted,
                t.quranProgramCompletedMessage,
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
        t.quranReview,
        t.quranNoVersesForReview,
      );

      return;
    }

    setIsReviewMode(
      value => !value,
    );

    setShowReview(true);
  };

  const playAudio = () => {
    if (playing) return;

    setPlaying(true);

    setTimeout(
      () => setPlaying(false),
      2500,
    );
  };

  const renderQuizResult = () => {
    if (!quizResult)
      return null;

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
              colors.surface ||
              'rgba(255,255,255,0.05)',

            borderColor:
              colors.border ||
              'rgba(255,255,255,0.1)',
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
            <Trophy
              size={38}
              color={colors.warning}
            />
          ) : good ? (
            <Award
              size={38}
              color={colors.primary}
            />
          ) : (
            <Target
              size={38}
              color={colors.primary}
            />
          )}
        </View>

        <Text
          style={[
            styles.resultEyebrow,
            {
              color:
                colors.textSecondary ||
                '#999',
            },
          ]}
        >
          {t.quranResult}
        </Text>

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
            {quizResult.percentage}%
          </Text>
        </View>

        <Text
          style={[
            styles.resultTitle,
            {
              color:
                colors.text || '#fff',
            },
          ]}
        >
          {quizMode === 'today'
            ? t.quranTodayQuiz
            : t.quranReviewQuiz}
        </Text>

        <Text
          style={[
            styles.resultMessage,
            {
              color:
                colors.textSecondary ||
                '#aaa',
            },
          ]}
        >
          {perfect
            ? t.quranExcellent
            : good
            ? t.quranGoodPerformance
            : t.quranNeedMoreReview}
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
                backgroundColor:
                  colors.primary,
              },
            ]}
          />
        </View>

        <View
          style={styles.resultActions}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={regenerateQuiz}
            style={[
              styles.secondaryButton,
              {
                borderColor:
                  colors.border ||
                  'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <RefreshCw
              size={17}
              color={
                colors.textSecondary ||
                '#aaa'
              }
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    colors.textSecondary ||
                    '#aaa',
                },
              ]}
            >
              {t.quranRetake}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              setQuizVisible(false)
            }
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

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {t.quranFinish}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderQuestion = () => {
    if (!currentQuestion)
      return null;

    const optionIsCorrect = (
      option: string | number,
    ) =>
      questionAnswered &&
      String(option) ===
        String(
          currentQuestion.answer,
        );

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
        <View
          style={[
            styles.questionTop,
            {
              flexDirection: isRTL
                ? 'row'
                : 'row',
            },
          ]}
        >
          <View
            style={{ flex: 1 }}
          >
            <Text
              style={[
                styles.questionCounter,
                {
                  color:
                    colors.textSecondary ||
                    '#aaa',

                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {t.quranQuestion}{' '}
              {quizIndex + 1}{' '}
              {t.quranOf}{' '}
              {quizQuestions.length}
            </Text>

            <Text
              style={[
                styles.questionType,
                {
                  color:
                    colors.primary,

                  textAlign: isRTL
                    ? 'right'
                    : 'left',
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
                  color:
                    colors.primary,
                },
              ]}
            >
              {quizMode === 'today'
                ? t.quranToday
                : t.quranReview}
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
                backgroundColor:
                  colors.primary,
              },
            ]}
          />
        </View>

        <View
          style={[
            styles.promptCard,
            {
              backgroundColor:
                colors.surface ||
                'rgba(255,255,255,0.04)',

              borderColor:
                colors.border ||
                'rgba(255,255,255,0.1)',

              flexDirection: isRTL
                ? 'row'
                : 'row-reverse',
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
                color:
                  colors.text ||
                  '#fff',

                textAlign: isRTL
                  ? 'right'
                  : 'left',
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

              borderColor:
                colors.border ||
                'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.displayLabel,
              {
                color:
                  colors.textSecondary ||
                  '#888',

                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {t.quranQuestionText}
          </Text>

          <Text
            style={[
              styles.displayText,
              {
                color:
                  colors.text ||
                  '#fff',

                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {currentQuestion.display}
          </Text>
        </View>

        {currentQuestion.type ===
          'ayah_number' && (
          <TextInput
            value={fillAnswer}
            onChangeText={
              setFillAnswer
            }
            editable={
              !questionAnswered
            }
            keyboardType="number-pad"
            placeholder={
              isRTL
                ? 'شماره آیه را وارد کنید'
                : 'Enter verse number'
            }
            placeholderTextColor={
              colors.textSecondary ||
              '#888'
            }
            style={[
              styles.input,
              {
                color:
                  colors.text ||
                  '#fff',

                textAlign: isRTL
                  ? 'right'
                  : 'left',

                borderColor:
                  questionAnswered
                    ? questionCorrect
                      ? colors.success
                      : colors.error
                    : colors.border ||
                      'rgba(255,255,255,0.12)',

                backgroundColor:
                  colors.surface ||
                  'rgba(255,255,255,0.05)',
              },
            ]}
          />
        )}

        {currentQuestion.options &&
          currentQuestion.type !==
            'ayah_number' && (
            <View
              style={
                styles.optionsContainer
              }
            >
              {currentQuestion.options.map(
                (
                  option,
                  index,
                ) => {
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
                    colors.border ||
                    'rgba(255,255,255,0.1)';

                  let backgroundColor =
                    colors.surface ||
                    'rgba(255,255,255,0.04)';

                  let textColor =
                    colors.text ||
                    '#fff';

                  if (correct) {
                    borderColor =
                      colors.success;

                    backgroundColor =
                      `${colors.success}14`;

                    textColor =
                      colors.success;
                  } else if (wrong) {
                    borderColor =
                      colors.error;

                    backgroundColor =
                      `${colors.error}14`;

                    textColor =
                      colors.error;
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
                      activeOpacity={
                        0.82
                      }
                      onPress={() =>
                        setSelectedOption(
                          option,
                        )
                      }
                      style={[
                        styles.option,
                        {
                          borderColor,
                          backgroundColor,
                          flexDirection:
                            isRTL
                              ? 'row'
                              : 'row-reverse',
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
                            color={
                              colors.success
                            }
                          />
                        ) : wrong ? (
                          <XCircle
                            size={17}
                            color={
                              colors.error
                            }
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
                              1575 +
                                index,
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

                            textAlign:
                              isRTL
                                ? 'right'
                                : 'left',
                          },

                          currentQuestion.type ===
                            'continuation' && {
                            fontFamily:
                              QURAN_FONT_FAMILY,
                            lineHeight: 32,
                          },
                        ]}
                      >
                        {String(
                          option,
                        )}
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
                backgroundColor:
                  questionCorrect
                    ? `${colors.success}14`
                    : `${colors.error}14`,

                borderColor:
                  questionCorrect
                    ? `${colors.success}40`
                    : `${colors.error}40`,

                flexDirection: isRTL
                  ? 'row'
                  : 'row-reverse',
              },
            ]}
          >
            {questionCorrect ? (
              <CheckCircle
                size={21}
                color={
                  colors.success
                }
              />
            ) : (
              <XCircle
                size={21}
                color={
                  colors.error
                }
              />
            )}

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color:
                      questionCorrect
                        ? colors.success
                        : colors.error,

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {questionCorrect
                  ? t.quranCorrect
                  : t.quranIncorrect}
              </Text>

              {!questionCorrect && (
                <Text
                  style={[
                    styles.feedbackAnswer,
                    {
                      color:
                        colors.textSecondary ||
                        '#aaa',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {t.quranCorrectAnswer}:{' '}
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
              style={
                styles.quizActionText
              }
            >
              {t.quranCheckAnswer}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={
              nextQuestion
            }
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
              style={
                styles.quizActionText
              }
            >
              {quizIndex >=
              quizQuestions.length - 1
                ? t.quranViewResult
                : t.quranNextQuestion}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderQuizModal = () => (
    <Modal
      visible={quizVisible}
      transparent
      animationType="fade"
      onRequestClose={handleBack}
    >
      <View
        style={styles.modalOverlay}
      >
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor:
                colors.background ||
                '#1b1024',
            },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor:
                  colors.border ||
                  'rgba(255,255,255,0.1)',

                flexDirection:
                  isRTL
                    ? 'row'
                    : 'row',
              },
            ]}
          >
            <View
              style={
                styles.modalHeaderIcon
              }
            >
              <Target
                size={20}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color:
                      colors.text ||
                      '#fff',

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {quizMode === 'today'
                  ? t.quranTodayQuiz
                  : t.quranReviewQuiz}
              </Text>

              <Text
                style={[
                  styles.modalSubtitle,
                  {
                    color:
                      colors.textSecondary ||
                      '#aaa',

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {t.quranTestMemory}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBack}
              style={[
                styles.closeButton,
                {
                  backgroundColor:
                    colors.surface ||
                    'rgba(255,255,255,0.06)',
                },
              ]}
            >
              <X
                size={21}
                color={
                  colors.textSecondary ||
                  '#aaa'
                }
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={
              styles.modalScroll
            }
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

          {!quizResult && (
            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor:
                    colors.border ||
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
                      colors.border ||
                      'rgba(255,255,255,0.1)',
                  },
                ]}
              >
                <RefreshCw
                  size={17}
                  color={
                    colors.textSecondary ||
                    '#aaa'
                  }
                />

                <Text
                  style={[
                    styles.footerResetText,
                    {
                      color:
                        colors.textSecondary ||
                        '#aaa',
                    },
                  ]}
                >
                  {
                    t.quranGenerateNewQuestion
                  }
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderExitModal = () => (
    <Modal
      visible={exitModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() =>
        setExitModalVisible(false)
      }
      statusBarTranslucent
    >
      <View style={styles.exitOverlay}>
        <View
          style={[
            styles.exitCard,
            {
              backgroundColor:
                colors.background || '#1b1024',
              borderColor:
                colors.border ||
                'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <View
            style={[
              styles.exitIcon,
              {
                backgroundColor:
                  'rgba(239,68,68,0.12)',
              },
            ]}
          >
            <X
              size={26}
              color="#EF4444"
              strokeWidth={2.5}
            />
          </View>

          <Text
            style={[
              styles.exitTitle,
              {
                color: colors.text || '#fff',
                textAlign: 'center',
              },
            ]}
          >
            {t.exitTitle}
          </Text>

          <Text
            style={[
              styles.exitMessage,
              {
                color:
                  colors.textSecondary ||
                  '#aaa',
                textAlign: 'center',
              },
            ]}
          >
            {t.exitMessage}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={performExit}
            style={[
              styles.exitConfirmButton,
              {
                backgroundColor:
                  '#EF4444',
              },
            ]}
          >
            <Text
              style={styles.exitConfirmText}
            >
              {t.exitConfirm}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              setExitModalVisible(false)
            }
            style={[
              styles.exitCancelButton,
              {
                borderColor:
                  colors.border ||
                  'rgba(255,255,255,0.12)',
              },
            ]}
          >
            <Text
              style={[
                styles.exitCancelText,
                {
                  color: colors.text || '#fff',
                },
              ]}
            >
              {t.exitCancel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  /*
   * ------------------------------------------------------------
   * رندر هر خط از مصحف
   * ------------------------------------------------------------
   * هر خط از چند «بخش» تشکیل شده: 'full' (آیه کامل + شماره)،
   * 'start' (فقط شروع متن یک آیه که ادامه‌اش خط بعد می‌آید،
   * بدون شماره) یا 'end' (باقیِ متن آیه + شمارهٔ آن). شمارهٔ
   * آیه به سادگی به‌صورت یک عدد داخل پرانتز نمایش داده می‌شود
   * تا روی هر فونت/دستگاهی درست دیده شود.
   */
  const renderMushafLine = (
    segments: MushafSegment[],
    lineIndex: number,
  ) => {
    return (
      <View
        key={`mushaf-line-${lineIndex}`}
        style={{
          width: '100%',
          marginBottom: 2,
        }}
      >
        <Text
          style={{
            width: '100%',
            writingDirection: 'rtl',
            textAlign: 'right',
            color: colors.text || '#fff',
            fontFamily: QURAN_FONT_FAMILY,
            fontSize: MUSHAF_LINE_FONT_SIZE,
            lineHeight: MUSHAF_LINE_HEIGHT,
          }}
        >
          {segments.map((segment, idx) => {
            const verse = getVerse(segment.verse);

            if (!verse) return null;

            const text =
              segment.part === 'full'
                ? verse.arabic
                : segment.text;

            const showsMark =
              segment.part !== 'start';

            const today =
              todayVerses.includes(segment.verse);

            const review =
              isReviewMode &&
              previousVerses.includes(segment.verse);

            const visible = today || review;

            const markColor = !visible
              ? colors.textTertiary ||
                'rgba(255,255,255,0.35)'
              : review
              ? colors.success
              : colors.primary;

            return (
              <Text key={`${segment.verse}-${segment.part}`}>
                <Text
                  style={{
                    opacity: visible ? 1 : 0.14,
                    fontSize: MUSHAF_LINE_FONT_SIZE,
                    lineHeight: MUSHAF_LINE_HEIGHT,
                    fontFamily: QURAN_FONT_FAMILY,
                  }}
                >
                  {text}
                </Text>
                {showsMark && (
                  <Text
                    style={{
                      color: markColor,
                      opacity: visible ? 1 : 0.4,
                      fontSize: MUSHAF_MARK_FONT_SIZE,
                      fontWeight: '700',
                      fontFamily: QURAN_FONT_FAMILY,
                    }}
                  >
                    {' '}
                    ({toArabicDigits(segment.verse)})
                  </Text>
                )}
                {idx < segments.length - 1 ? ' ' : ''}
              </Text>
            );
          })}
        </Text>
      </View>
    );
  };

  const renderQuranPage = () => (
    <View
      style={[
        styles.quranCard,
        {
          backgroundColor:
            colors.surface ||
            'rgba(255,255,255,0.05)',

          borderColor:
            `${colors.accent}55`,
        },
      ]}
    >
      <LinearGradient
        colors={
          colors.gradientCardSolid as unknown as readonly [string, string, ...string[]]
        }
        style={
          styles.quranGradient
        }
      >
        <View
          style={[
            styles.quranTopRow,
            {
              flexDirection:
                isRTL
                  ? 'row'
                  : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.quranIcon,
              {
                backgroundColor:
                  `${colors.primary}18`,
              },
            ]}
          >
            <BookOpen
              size={20}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={{ flex: 1 }}
          >
            <Text
              style={[
                styles.quranEyebrow,
                {
                  color:
                    colors.textSecondary ||
                    '#888',

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {t.quran}
            </Text>

            <Text
              style={[
                styles.quranSurah,
                {
                  color:
                    colors.text ||
                    '#fff',

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {t.quranSurahYasin}
            </Text>
          </View>

          <View
            style={[
              styles.quranDayPill,
              {
                backgroundColor:
                  `${colors.primary}18`,
              },
            ]}
          >
            <Text
              style={[
                styles.quranDayText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {t.quranDay}{' '}
              {currentDay}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.mushafFrame,
            {
              borderColor:
                `${colors.accent}80`,
            },
          ]}
        >
          <View
            style={[
              styles.mushafCorner,
              styles.mushafCornerTL,
              {
                borderColor:
                  colors.accent,
              },
            ]}
          />

          <View
            style={[
              styles.mushafCorner,
              styles.mushafCornerTR,
              {
                borderColor:
                  colors.accent,
              },
            ]}
          />

          <View
            style={[
              styles.mushafCorner,
              styles.mushafCornerBL,
              {
                borderColor:
                  colors.accent,
              },
            ]}
          />

          <View
            style={[
              styles.mushafCorner,
              styles.mushafCornerBR,
              {
                borderColor:
                  colors.accent,
              },
            ]}
          />

          <View
            style={[
              styles.surahTitleBox,
              {
                borderColor:
                  `${colors.accent}90`,

                backgroundColor:
                  `${colors.primary}0F`,
              },
            ]}
          >
            <Text
              style={[
                styles.surahTitle,
                {
                  color:
                    colors.text ||
                    '#fff',

                  fontFamily:
                    QURAN_FONT_FAMILY,
                },
              ]}
            >
              سورة{' '}
              {
                SURAH_META.arabicName
              }
            </Text>
          </View>

          <View
            style={[
              styles.surahMetaRow,
              {
                flexDirection:
                  isRTL
                    ? 'row'
                    : 'row-reverse',
              },
            ]}
          >
            <View
              style={[
                styles.surahMetaChip,
                {
                  backgroundColor:
                    `${colors.primary}12`,
                  borderColor:
                    `${colors.primary}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.surahMetaText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {t.quranMeccan}
              </Text>
            </View>

            <View
              style={[
                styles.surahMetaChip,
                {
                  backgroundColor:
                    `${colors.primary}12`,
                  borderColor:
                    `${colors.primary}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.surahMetaText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {isRTL
                  ? toArabicDigits(
                      SURAH_META.totalAyahs,
                    )
                  : SURAH_META.totalAyahs}{' '}
                {t.quranAyahCount}
              </Text>
            </View>

            <View
              style={[
                styles.surahMetaChip,
                {
                  backgroundColor:
                    `${colors.primary}12`,
                  borderColor:
                    `${colors.primary}25`,
                },
              ]}
            >
              <Text
                style={[
                  styles.surahMetaText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {t.quranJuz}{' '}
                {isRTL
                  ? toArabicDigits(
                      SURAH_META.juz,
                    )
                  : SURAH_META.juz}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.basmala,
              {
                color:
                  colors.primary,

                fontFamily:
                  QURAN_FONT_FAMILY,
              },
            ]}
          >
            بِسۡمِ اللَّهِ الرَّحۡمَٰنِ الرَّحِيمِ
          </Text>

          <View
            style={
              styles.mushafTextContainer
            }
          >
            {MUSHAF_LINES.map(
              (line, index) =>
                renderMushafLine(
                  line,
                  index,
                ),
            )}
          </View>

          <Text
            style={[
              styles.mushafNote,
              {
                color:
                  colors.textTertiary ||
                  colors.textSecondary ||
                  '#888',
              },
            ]}
          >
            {t.quranMushafNote}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const renderTranslations =
    () => {
      if (!showTranslation)
        return null;

      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.surface ||
                'rgba(255,255,255,0.05)',

              borderColor:
                colors.border ||
                'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <View
            style={[
              styles.cardHeader,
              {
                flexDirection:
                  isRTL
                    ? 'row'
                    : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.cardHeaderLeft,
                {
                  flexDirection:
                    isRTL
                      ? 'row'
                      : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor:
                      `${colors.primary}12`,
                  },
                ]}
              >
                <BookOpen
                  size={18}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color:
                        colors.text ||
                        '#fff',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    t.quranTodayTranslation
                  }
                </Text>

                <Text
                  style={[
                    styles.cardCaption,
                    {
                      color:
                        colors.textSecondary ||
                        '#888',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    t.quranReviewMeaning
                  }
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                setShowTranslation(
                  false,
                )
              }
              style={
                styles.smallIconButton
              }
            >
              <EyeOff
                size={18}
                color={
                  colors.textSecondary ||
                  '#aaa'
                }
              />
            </TouchableOpacity>
          </View>

          <View
            style={
              styles.translationList
            }
          >
            {todayVerses.map(
              number => {
                const verse =
                  getVerse(number);

                if (!verse)
                  return null;

                const translationText =
                  isRTL
                    ? verse.translation
                    : verse.translationEn;

                return (
                  <View
                    key={number}
                    style={[
                      styles.translationItem,
                      {
                        borderBottomColor:
                          colors.border ||
                          'rgba(255,255,255,0.08)',

                        flexDirection:
                          isRTL
                            ? 'row'
                            : 'row-reverse',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.translationNumber,
                        {
                          backgroundColor:
                            `${colors.primary}12`,
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
                        {number}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.translationText,
                        {
                          color:
                            colors.textSecondary ||
                            '#aaa',

                          textAlign:
                            isRTL
                              ? 'right'
                              : 'left',
                        },
                      ]}
                    >
                      {
                        translationText
                      }
                    </Text>
                  </View>
                );
              },
            )}
          </View>
        </View>
      );
    };

  const renderReviewCard =
    () => {
      if (!previousVerses.length)
        return null;

      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor:
                colors.surface ||
                'rgba(255,255,255,0.05)',

              borderColor:
                colors.border ||
                'rgba(255,255,255,0.1)',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              setShowReview(
                value => !value,
              )
            }
            style={[
              styles.cardHeader,
              {
                flexDirection:
                  isRTL
                    ? 'row'
                    : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.cardHeaderLeft,
                {
                  flexDirection:
                    isRTL
                      ? 'row'
                      : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor:
                      `${colors.success}1a`,
                  },
                ]}
              >
                <RefreshCw
                  size={18}
                  color={
                    colors.success
                  }
                />
              </View>

              <View>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color:
                        colors.text ||
                        '#fff',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    t.quranPreviousVerses
                  }
                </Text>

                <Text
                  style={[
                    styles.cardCaption,
                    {
                      color:
                        colors.textSecondary ||
                        '#888',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    previousVerses.length
                  }{' '}
                  {
                    t.quranVersesForReview
                  }
                </Text>
              </View>
            </View>

            <View
              style={
                styles.smallIconButton
              }
            >
              {showReview ? (
                <EyeOff
                  size={18}
                  color={
                    colors.textSecondary ||
                    '#aaa'
                  }
                />
              ) : (
                <Eye
                  size={18}
                  color={
                    colors.textSecondary ||
                    '#aaa'
                  }
                />
              )}
            </View>
          </TouchableOpacity>

          {showReview && (
            <View>
              {previousVerses.map(
                number => {
                  const verse =
                    getVerse(number);

                  if (!verse)
                    return null;

                  return (
                    <View
                      key={number}
                      style={[
                        styles.reviewItem,
                        {
                          borderBottomColor:
                            colors.border ||
                            'rgba(255,255,255,0.08)',

                          flexDirection:
                            isRTL
                              ? 'row'
                              : 'row-reverse',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.reviewNumber,
                          {
                            backgroundColor:
                              `${colors.success}1a`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.reviewRef,
                            {
                              color:
                                colors.success,
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
                            color:
                              colors.textSecondary ||
                              '#aaa',

                            textAlign:
                              isRTL
                                ? 'right'
                                : 'left',
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

  const renderActions =
    () => (
      <View
        style={[
          styles.card,
          {
            backgroundColor:
              colors.surface ||
              'rgba(255,255,255,0.05)',

            borderColor:
              colors.border ||
              'rgba(255,255,255,0.1)',
          },
        ]}
      >
        <View
          style={[
            styles.actionSectionHeader,
            {
              flexDirection:
                isRTL
                  ? 'row'
                  : 'row',
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.actionSectionTitle,
                {
                  color:
                    colors.text ||
                    '#fff',

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {
                t.quranExercisesAndQuiz
              }
            </Text>

            <Text
              style={[
                styles.actionSectionSubtitle,
                {
                  color:
                    colors.textSecondary ||
                    '#888',

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {
                t.quranTestMemory
              }
            </Text>
          </View>

          <View
            style={[
              styles.actionSectionIcon,
              {
                backgroundColor:
                  `${colors.primary}12`,
              },
            ]}
          >
            <Target
              size={20}
              color={
                colors.primary
              }
            />
          </View>
        </View>

        <View
          style={[
            styles.actionGrid,
            {
              flexDirection:
                isRTL
                  ? 'row'
                  : 'row',
            },
          ]}
        >
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
                  colors.border ||
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            {showTranslation ? (
              <EyeOff
                size={18}
                color={
                  colors.primary
                }
              />
            ) : (
              <Eye
                size={18}
                color={
                  colors.primary
                }
              />
            )}

            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    colors.textSecondary ||
                    '#aaa',
                },
              ]}
            >
              {showTranslation
                ? t.quranHideTranslation
                : t.quranShowTranslation}
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
                  colors.success,

                backgroundColor:
                  `${colors.success}14`,
              },

              {
                borderColor:
                  isReviewMode
                    ? colors.success
                    : colors.border ||
                      'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <RefreshCw
              size={18}
              color={
                isReviewMode
                  ? colors.success
                  : colors.primary
              }
            />

            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    isReviewMode
                      ? colors.success
                      : colors.textSecondary ||
                        '#aaa',
                },
              ]}
            >
              {isReviewMode
                ? t.quranNormalMode
                : t.quranReviewVerses}
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
              style={
                styles.quizButtonText
              }
            >
              {t.quranTodayQuiz}
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
                  colors.primaryDark,

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
              style={
                styles.quizButtonText
              }
            >
              {t.quranReviewQuiz}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={
            isStudyComplete
          }
          onPress={
            finishStudy
          }
          style={[
            styles.finishButton,
            {
              backgroundColor:
                isStudyComplete
                  ? `${colors.success}1f`
                  : `${colors.success}12`,

              borderColor:
                `${colors.success}40`,
            },
          ]}
        >
          <CheckCircle
            size={19}
            color={
              colors.success
            }
          />

          <Text
            style={[
              styles.finishButtonText,
              {
                color:
                  colors.success,
              },
            ]}
          >
            {isStudyComplete
              ? t.quranStudyCompleted
              : t.quranFinishStudy}
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background ||
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
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={[
              styles.header,
              {
                borderBottomColor:
                  colors.border ||
                  'rgba(255,255,255,0.08)',

                flexDirection:
                  isRTL
                    ? 'row'
                    : 'row',
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={
                handleBack
              }
              style={[
                styles.headerBackButton,
                {
                  backgroundColor:
                    colors.surface ||
                    'rgba(255,255,255,0.06)',

                  borderColor:
                    colors.border ||
                    'rgba(255,255,255,0.1)',
                },
              ]}
            >
              <ArrowLeft
                size={21}
                strokeWidth={2.2}
                color={
                  colors.text ||
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
                numberOfLines={1}
                style={[
                  styles.headerTitle,
                  {
                    color:
                      colors.text ||
                      '#fff',
                  },
                ]}
              >
                {
                  t.quranMemorization
                }
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.headerSubtitle,
                  {
                    color:
                      colors.textSecondary ||
                      '#aaa',
                  },
                ]}
              >
                {
                  t.quranSurahYasin
                }
              </Text>
            </View>

            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor:
                    `${colors.primary}1f`,
                },
              ]}
            >
              <BookOpen
                size={22}
                strokeWidth={2}
                color={
                  colors.primary
                }
              />
            </View>
          </View>

          <View
            style={[
              styles.dayCard,
              {
                backgroundColor:
                  colors.surface ||
                  'rgba(255,255,255,0.05)',

                borderColor:
                  colors.border ||
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View
              style={[
                styles.dayHeader,
                {
                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.dayTitleBlock,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <View
                  style={[
                    styles.dayIcon,
                    {
                      backgroundColor:
                        `${colors.primary}12`,
                    },
                  ]}
                >
                  <BookOpen
                    size={20}
                    color={
                      colors.primary
                    }
                  />
                </View>

                <View
                  style={{
                    alignItems: isRTL
                      ? 'flex-end'
                      : 'flex-start',
                  }}
                >
                  <Text
                    style={[
                      styles.dayTitle,
                      {
                        color:
                          colors.text ||
                          '#fff',

                        textAlign:
                          isRTL
                            ? 'right'
                            : 'left',

                        writingDirection:
                          isRTL ? 'rtl' : 'ltr',
                      },
                    ]}
                  >
                    {
                      t.quranProgram
                    }
                  </Text>

                  <Text
                    style={[
                      styles.daySubtitle,
                      {
                        color:
                          colors.textSecondary ||
                          '#aaa',

                        textAlign:
                          isRTL
                            ? 'right'
                            : 'left',

                        writingDirection:
                          isRTL ? 'rtl' : 'ltr',
                      },
                    ]}
                  >
                    {
                      t.quranSixDayProgram
                    }
                  </Text>
                </View>
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
                  {t.quranDay}{' '}
                  {currentDay}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.dayStats,
                {
                  flexDirection:
                    isRTL
                      ? 'row'
                      : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.dayStat,
                  {
                    borderColor:
                      colors.border ||
                      'rgba(255,255,255,0.08)',

                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        colors.textSecondary ||
                        '#aaa',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',

                      writingDirection:
                        isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {
                    t.quranTodayVerses
                  }
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        colors.text ||
                        '#fff',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {todayVerses.length
                    ? `${todayVerses[0]} - ${todayVerses[todayVerses.length - 1]}`
                    : '-'}
                </Text>
              </View>

              <View
                style={[
                  styles.dayStat,
                  {
                    borderColor:
                      colors.border ||
                      'rgba(255,255,255,0.08)',

                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        colors.textSecondary ||
                        '#aaa',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',

                      writingDirection:
                        isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {
                    t.quranVerseCount
                  }
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        colors.text ||
                        '#fff',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    todayVerses.length
                  }
                </Text>
              </View>

              <View
                style={[
                  styles.dayStat,
                  {
                    borderColor:
                      colors.border ||
                      'rgba(255,255,255,0.08)',

                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    {
                      color:
                        colors.textSecondary ||
                        '#aaa',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',

                      writingDirection:
                        isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  {
                    t.quranProgress
                  }
                </Text>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color:
                        colors.primary,

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {progress}%
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.progressCard,
              {
                backgroundColor:
                  colors.surface ||
                  'rgba(255,255,255,0.05)',

                borderColor:
                  colors.border ||
                  'rgba(255,255,255,0.1)',
              },
            ]}
          >
            <View
              style={[
                styles.progressHeader,
                {
                  flexDirection:
                    isRTL
                      ? 'row'
                      : 'row',
                },
              ]}
            >
              <View>
                <Text
                  style={[
                    styles.progressTitle,
                    {
                      color:
                        colors.text ||
                        '#fff',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    t.quranMemorizationProgress
                  }
                </Text>

                <Text
                  style={[
                    styles.progressSubtitle,
                    {
                      color:
                        colors.textSecondary ||
                        '#888',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {memorizedVerses}{' '}
                  {t.quranVerseOf}{' '}
                  {totalVerses}
                </Text>
              </View>

              <View
                style={[
                  styles.progressPercentPill,
                  {
                    backgroundColor:
                      `${colors.primary}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressPercent,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {progress}%
                </Text>
              </View>
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

          {renderQuranPage()}

          <View
            style={[
              styles.audioRow,
              {
                backgroundColor:
                  colors.surface ||
                  'rgba(255,255,255,0.05)',

                borderColor:
                  colors.border ||
                  'rgba(255,255,255,0.1)',

                flexDirection:
                  isRTL
                    ? 'row'
                    : 'row',
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
                      colors.text ||
                      '#fff',

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {playing
                  ? t.quranPlaying
                  : t.quranListenRecitation}
              </Text>

              <Text
                style={[
                  styles.audioSubtitle,
                  {
                    color:
                      colors.textSecondary ||
                      '#aaa',

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {
                  t.quranSurahYasin
                }
              </Text>
            </View>

            <View
              style={[
                styles.audioMeta,
                {
                  backgroundColor:
                    `${colors.primary}10`,
                },
              ]}
            >
              <Clock
                size={14}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.audioMetaText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {
                  t.quranRecitation
                }
              </Text>
            </View>
          </View>

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
                  backgroundColor:
                    `${colors.primary}08`,

                  borderColor:
                    `${colors.primary}30`,
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
                {
                  t.quranShowTranslation
                }
              </Text>
            </TouchableOpacity>
          )}

          {renderTranslations()}
          {renderReviewCard()}
          {renderActions()}

          {isStudyComplete && (
            <View
              style={[
                styles.completeCard,
                {
                  backgroundColor:
                    `${colors.success}12`,

                  borderColor:
                    `${colors.success}33`,

                  flexDirection:
                    isRTL
                      ? 'row'
                      : 'row-reverse',
                },
              ]}
            >
              <View
                style={[
                  styles.completeIcon,
                  {
                    backgroundColor:
                      `${colors.success}1a`,
                  },
                ]}
              >
                <CheckCircle
                  size={22}
                  color={
                    colors.success
                  }
                />
              </View>

              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={[
                    styles.completeTitle,
                    {
                      color:
                        colors.success,

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    t.quranStudyCompleted
                  }
                </Text>

                <Text
                  style={[
                    styles.completeText,
                    {
                      color:
                        colors.textSecondary ||
                        '#aaa',

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    t.quranRegisteredSuccessfully
                  }
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {renderQuizModal()}
      {renderExitModal()}
    </View>
  );
}

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

  header: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  dayCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  dayHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dayTitleBlock: {
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

  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  progressHeader: {
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
    fontSize: 10,
    marginBottom: 2,
  },

  quranSurah: {
    fontSize: 17,
    fontWeight: '800',
  },

  quranDayPill: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },

  quranDayText: {
    fontSize: 10,
    fontWeight: '800',
  },

  mushafFrame: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 12,
    position: 'relative',
  },

  mushafCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderWidth: 2,
  },

  mushafCornerTL: {
    top: -1,
    left: -1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
  },

  mushafCornerTR: {
    top: -1,
    right: -1,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 14,
  },

  mushafCornerBL: {
    bottom: -1,
    left: -1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
  },

  mushafCornerBR: {
    bottom: -1,
    right: -1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 14,
  },

  surahTitleBox: {
    alignSelf: 'center',
    paddingHorizontal: 27,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 11,
  },

  surahTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  surahMetaRow: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 13,
  },

  surahMetaChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },

  surahMetaText: {
    fontSize: 10,
    fontWeight: '700',
  },

  basmala: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 28,
    marginBottom: 8,
  },

  mushafTextContainer: {
    width: '100%',
  },

  mushafNote: {
    textAlign: 'center',
    fontSize: 9,
    marginTop: 14,
  },

  audioRow: {
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

  card: {
    borderRadius: 21,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },

  cardHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardHeaderLeft: {
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

  translationList: {
    marginTop: 12,
  },

  translationItem: {
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
  },

  reviewItem: {
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
    fontFamily: QURAN_FONT_FAMILY,
    fontSize: 15,
    lineHeight: 28,
  },

  actionSectionHeader: {
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

  completeCard: {
    borderRadius: 19,
    borderWidth: 1,
    padding: 14,
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

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(10,5,17,0.91)',
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
    alignItems: 'center',
    gap: 10,
  },

  modalHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.05)',
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

  questionTop: {
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
    fontWeight: '700',
  },

  displayCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
  },

  displayLabel: {
    fontSize: 9,
    marginBottom: 8,
    fontWeight: '700',
  },

  displayText: {
    textAlign: 'center',
    fontFamily: QURAN_FONT_FAMILY,
    fontSize: 18,
    lineHeight: 34,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
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
    fontSize: 12,
    lineHeight: 23,
  },

  feedback: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  quizActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },

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

  exitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,5,17,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  exitCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },

  exitIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  exitTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  exitMessage: {
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 20,
  },

  exitConfirmButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  exitConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  exitCancelButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exitCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
});