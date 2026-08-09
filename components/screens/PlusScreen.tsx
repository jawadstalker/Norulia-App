import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  BookOpen,
  Heart,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Star,
  Trophy,
  RefreshCw,
  CheckCircle,
  XCircle,
  Search,
  GripVertical,
  Book,
  User,
  ArrowRight,
  Sparkles,
  Target,
  Award,
} from 'lucide-react-native';

import { Spacing, BorderRadius } from '../../constants/theme';

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface Poem {
  id: number;
  title: string;
  poet: string;
  verse: string[];
  translation: string;
  interpretation: string;
  meaning: string;
  difficultWords: {
    word: string;
    meaning: string;
  }[];
  options: string[];
  correct: number;
  fillBlank: {
    text: string;
    blank: string;
    answer: string;
  };
  shuffledVerses: string[];
  correctOrder: number[];
  progress: number;
  score: number;
  completed: boolean;
  category: string;
}

interface Poet {
  id: string;
  name: string;
  icon: any;
  color: string;
}

interface QuizQuestion {
  question: string;
  type: 'choice' | 'fill' | 'drag';
  options?: string[];
  correct?: number;
  text?: string;
  answer?: string;
}

// --------------------------------------------------
// DATA
// --------------------------------------------------

const poets: Poet[] = [
  {
    id: 'all',
    name: 'همه',
    icon: Book,
    color: '#7C3AED',
  },
  {
    id: 'hafez',
    name: 'حافظ',
    icon: User,
    color: '#EC4899',
  },
  {
    id: 'saadi',
    name: 'سعدی',
    icon: User,
    color: '#22C55E',
  },
  {
    id: 'rumi',
    name: 'مولانا',
    icon: User,
    color: '#F59E0B',
  },
  {
    id: 'khayyam',
    name: 'خیام',
    icon: User,
    color: '#3B82F6',
  },
];

// از poemsData فعلی خودت استفاده کن
const poemsData: Poem[] = [
  {
    id: 1,
    title: 'غزل شماره ۱',
    poet: 'حافظ',
    verse: [
      'الا یا ایها الساقی ادر کاساً و ناولها',
      'که عشق آسان نمود اول ولی افتاد مشکل‌ها',
    ],
    translation:
      'O cup-bearer, pass around the cup and give it to me, for love seemed easy at first but then difficulties arose.',
    interpretation:
      'این غزل درباره مسیر عشق و شناخت است. حافظ بیان می‌کند که رسیدن به کمال نیازمند صبر و عبور از سختی‌هاست.',
    meaning:
      'عشق در ابتدا ساده به نظر می‌رسد اما مسیر آن دشواری‌هایی دارد.',
    difficultWords: [
      {
        word: 'ساقی',
        meaning: 'کسی که جام شراب می‌گرداند',
      },
      {
        word: 'کاس',
        meaning: 'جام شراب',
      },
    ],
    options: [
      'مسیر دشوار عشق و رشد',
      'ثروت و قدرت',
      'سفر و گردش',
      'طبیعت و زیبایی',
    ],
    correct: 0,
    fillBlank: {
      text: 'که عشق ______ نمود اول ولی افتاد مشکل‌ها',
      blank: 'آسان',
      answer: 'آسان',
    },
    shuffledVerses: [
      'که عشق آسان نمود اول ولی افتاد مشکل‌ها',
      'الا یا ایها الساقی ادر کاساً و ناولها',
    ],
    correctOrder: [1, 0],
    progress: 70,
    score: 350,
    completed: false,
    category: 'hafez',
  },
  {
    id: 2,
    title: 'غزل شماره ۲',
    poet: 'سعدی',
    verse: [
      'بنی آدم اعضای یکدیگرند',
      'که در آفرینش ز یک گوهرند',
    ],
    translation:
      'Human beings are members of a whole, in creation of one essence and soul.',
    interpretation:
      'سعدی در این شعر به همبستگی انسانی اشاره می‌کند. همه انسان‌ها مانند اعضای یک بدن هستند.',
    meaning:
      'همه انسان‌ها مانند اعضای یک بدن هستند و نسبت به یکدیگر مسئولند.',
    difficultWords: [
      {
        word: 'بنی آدم',
        meaning: 'فرزندان آدم، همه انسان‌ها',
      },
      {
        word: 'گوهر',
        meaning: 'ذات و سرشت',
      },
    ],
    options: [
      'همدلی و مسئولیت',
      'رقابت و برتری',
      'تنهایی و انزوا',
      'بی‌تفاوتی',
    ],
    correct: 0,
    fillBlank: {
      text: 'بنی آدم اعضای ______ هستند',
      blank: 'یکدیگر',
      answer: 'یکدیگر',
    },
    shuffledVerses: [
      'که در آفرینش ز یک گوهرند',
      'بنی آدم اعضای یکدیگرند',
    ],
    correctOrder: [1, 0],
    progress: 0,
    score: 0,
    completed: false,
    category: 'saadi',
  },
  {
    id: 3,
    title: 'غزل شماره ۳',
    poet: 'مولانا',
    verse: [
      'تو خود حجاب خودی حافظ از میان برخیز',
      'که ز آفتاب جهان‌تاب خویش پنهانم',
    ],
    translation:
      'You are your own veil, rise from the midst, for I am hidden from the world-illuminating sun.',
    interpretation:
      'مولانا می‌گوید بزرگترین مانع در مسیر رشد و تعالی، خود ما هستیم. باید از خودگذشتگی کنیم.',
    meaning:
      'بزرگترین مانع در مسیر رشد، خود ما هستیم.',
    difficultWords: [
      {
        word: 'حجاب',
        meaning: 'پرده و مانع',
      },
      {
        word: 'جهان‌تاب',
        meaning: 'جهان‌افروز',
      },
    ],
    options: [
      'خودشناسی و رهایی',
      'جهل و نادانی',
      'ثروت و قدرت',
      'شهرت و مقام',
    ],
    correct: 0,
    fillBlank: {
      text: 'تو خود ______ خودی حافظ از میان برخیز',
      blank: 'حجاب',
      answer: 'حجاب',
    },
    shuffledVerses: [
      'که ز آفتاب جهان‌تاب خویش پنهانم',
      'تو خود حجاب خودی حافظ از میان برخیز',
    ],
    correctOrder: [1, 0],
    progress: 45,
    score: 180,
    completed: false,
    category: 'rumi',
  },
  {
    id: 4,
    title: 'رباعی شماره ۱',
    poet: 'خیام',
    verse: [
      'ای دل چو زمانه می‌کند ساز مخالف',
      'تو نوش کنی می و من اندر طربم',
    ],
    translation:
      'O heart, when the times oppose you, you drink wine and I am in joy.',
    interpretation:
      'خیام در برابر سختی‌های روزگار، آرامش را در لذت بردن از لحظه می‌داند.',
    meaning:
      'در برابر سختی‌های روزگار، باید آرامش خود را حفظ کرد.',
    difficultWords: [
      {
        word: 'مخالف',
        meaning: 'مقابل، ناسازگار',
      },
      {
        word: 'طرب',
        meaning: 'شادی، خوشی',
      },
    ],
    options: [
      'لذت بردن از لحظه',
      'جنگ و ستیز',
      'غم و اندوه',
      'بی‌تفاوتی',
    ],
    correct: 0,
    fillBlank: {
      text: 'ای دل چو زمانه می‌کند ساز ______',
      blank: 'مخالف',
      answer: 'مخالف',
    },
    shuffledVerses: [
      'تو نوش کنی می و من اندر طربم',
      'ای دل چو زمانه می‌کند ساز مخالف',
    ],
    correctOrder: [1, 0],
    progress: 0,
    score: 0,
    completed: false,
    category: 'khayyam',
  },
  {
    id: 5,
    title: 'غزل شماره ۴',
    poet: 'حافظ',
    verse: [
      'امشب ز غمت میان خون خواهم خفت',
      'وز بستر خویشتن برون خواهم رفت',
    ],
    translation:
      'Tonight, because of your sorrow, I shall sleep surrounded by blood, and I shall leave my bed.',
    interpretation:
      'حافظ عشق را با رنج و فداکاری معنا می‌کند. عاشق واقعی از خواب و آرامش می‌گذرد.',
    meaning:
      'عشق واقعی با فداکاری و ایثار همراه است.',
    difficultWords: [
      {
        word: 'غمت',
        meaning: 'غم و اندوه تو',
      },
      {
        word: 'میان خون',
        meaning: 'در خون و خونابه',
      },
    ],
    options: [
      'عشق و فداکاری',
      'نفرت و کینه',
      'بی‌تفاوتی',
      'ترس و وحشت',
    ],
    correct: 0,
    fillBlank: {
      text: 'امشب ز غمت میان ______ خواهم خفت',
      blank: 'خون',
      answer: 'خون',
    },
    shuffledVerses: [
      'وز بستر خویشتن برون خواهم رفت',
      'امشب ز غمت میان خون خواهم خفت',
    ],
    correctOrder: [1, 0],
    progress: 20,
    score: 80,
    completed: false,
    category: 'hafez',
  },
];

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function PlusScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [selectedPoet, setSelectedPoet] = useState('all');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);

  const [currentStep, setCurrentStep] = useState<
    'list' | 'poem' | 'quiz' | 'result'
  >('list');

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [typedText, setTypedText] = useState<number[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [fillAnswer, setFillAnswer] = useState('');
  const [showFillResult, setShowFillResult] = useState(false);
  const [isFillCorrect, setIsFillCorrect] = useState<boolean | null>(null);

  const [dragResults, setDragResults] = useState<string[]>([]);
  const [showDragResult, setShowDragResult] = useState(false);
  const [isDragCorrect, setIsDragCorrect] = useState<boolean | null>(null);

  const [quizAnswers, setQuizAnswers] = useState<boolean[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [poems, setPoems] = useState<Poem[]>(poemsData);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredPoems = useMemo(() => {
    const query = searchQuery.trim();

    return poems.filter(poem => {
      const matchPoet =
        selectedPoet === 'all' || poem.category === selectedPoet;

      const matchSearch =
        !query ||
        poem.title.includes(query) ||
        poem.poet.includes(query) ||
        poem.verse.join(' ').includes(query);

      return matchPoet && matchSearch;
    });
  }, [poems, selectedPoet, searchQuery]);

  // --------------------------------------------------
  // QUIZ
  // --------------------------------------------------

  const quizQuestions: QuizQuestion[] = useMemo(() => {
    if (!selectedPoem) return [];

    return [
      {
        question:
          t.quizQuestion || 'پیام اصلی این شعر چیست؟',
        type: 'choice',
        options: selectedPoem.options,
        correct: selectedPoem.correct,
      },
      {
        question:
          t.fillBlank || 'جای خالی را کامل کنید',
        type: 'fill',
        text: selectedPoem.fillBlank.text,
        answer: selectedPoem.fillBlank.answer,
      },
      {
        question:
          t.orderVerses || 'مصرع‌ها را به ترتیب صحیح قرار دهید',
        type: 'drag',
        verses: dragResults,
      },
      {
        question:
          t.meaningQuestion || 'معنی واژه «ساقی» چیست؟',
        type: 'choice',
        options: [
          'کسی که جام شراب می‌گرداند',
          'نوازنده',
          'شاعر',
          'پادشاه',
        ],
        correct: 0,
      },
    ];
  }, [selectedPoem, dragResults, t]);

  const currentQuiz = quizQuestions[quizIndex];

  // --------------------------------------------------
  // SELECT POEM
  // --------------------------------------------------

  const handlePoemSelect = (poem: Poem) => {
    setSelectedPoem(poem);
    setCurrentStep('poem');

    setTypedText([]);
    setIsTypingComplete(false);

    setSelectedOption(null);
    setIsCorrect(null);

    setFillAnswer('');
    setShowFillResult(false);
    setIsFillCorrect(null);

    setShowDragResult(false);
    setIsDragCorrect(null);

    setQuizAnswers([]);
    setQuizIndex(0);
    setTotalScore(0);

    setIsFavorite(false);

    const shuffled = [...poem.shuffledVerses].sort(
      () => Math.random() - 0.5,
    );

    setDragResults(shuffled);
  };

  // --------------------------------------------------
  // BACK
  // --------------------------------------------------

  const handleBack = () => {
    if (currentStep === 'poem') {
      setCurrentStep('list');
      setSelectedPoem(null);
      return;
    }

    if (currentStep === 'quiz') {
      setCurrentStep('poem');
      return;
    }

    if (currentStep === 'result') {
      setCurrentStep('list');
      setSelectedPoem(null);
      return;
    }

    // در صفحه اصلی، Navigation واقعی
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // --------------------------------------------------
  // NEXT QUIZ
  // --------------------------------------------------

  const goToNextQuestion = (correct: boolean) => {
    const nextAnswers = [...quizAnswers, correct];
    setQuizAnswers(nextAnswers);

    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      return;
    }

    const finalScore =
      totalScore + (correct ? 25 : 0);

    const correctCount = nextAnswers.filter(Boolean).length;
    const percentage = Math.round(
      (correctCount / quizQuestions.length) * 100,
    );

    if (selectedPoem) {
      setPoems(prev =>
        prev.map(poem =>
          poem.id === selectedPoem.id
            ? {
                ...poem,
                progress: percentage,
                score: poem.score + finalScore,
                completed: percentage === 100,
              }
            : poem,
        ),
      );
    }

    setCurrentStep('result');
  };

  // --------------------------------------------------
  // CHOICE
  // --------------------------------------------------

  const handleOptionSelect = (index: number) => {
    if (
      selectedOption !== null ||
      !selectedPoem ||
      !currentQuiz
    ) {
      return;
    }

    const correct = index === currentQuiz.correct;

    setSelectedOption(index);
    setIsCorrect(correct);

    if (correct) {
      setTotalScore(prev => prev + 25);
      Vibration.vibrate(80);
    } else {
      Vibration.vibrate(40);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);

      goToNextQuestion(correct);
    }, 1100);
  };

  // --------------------------------------------------
  // FILL
  // --------------------------------------------------

  const handleFillSubmit = () => {
    if (
      !fillAnswer.trim() ||
      !selectedPoem ||
      !currentQuiz?.answer
    ) {
      return;
    }

    const correct =
      fillAnswer.trim() === currentQuiz.answer.trim();

    setIsFillCorrect(correct);
    setShowFillResult(true);

    if (correct) {
      setTotalScore(prev => prev + 10);
      Vibration.vibrate(80);
    }

    setTimeout(() => {
      setFillAnswer('');
      setShowFillResult(false);
      setIsFillCorrect(null);

      goToNextQuestion(correct);
    }, 1100);
  };

  // --------------------------------------------------
  // DRAG / REORDER
  // --------------------------------------------------

  const moveVerse = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= dragResults.length
    ) {
      return;
    }

    const updated = [...dragResults];

    [updated[index], updated[targetIndex]] = [
      updated[targetIndex],
      updated[index],
    ];

    setDragResults(updated);
  };

  const handleDragSubmit = () => {
    if (!selectedPoem) return;

    const correct = dragResults.every(
      (verse, index) =>
        verse ===
        selectedPoem.shuffledVerses[
          selectedPoem.correctOrder[index]
        ],
    );

    setIsDragCorrect(correct);
    setShowDragResult(true);

    if (correct) {
      setTotalScore(prev => prev + 15);
      Vibration.vibrate(80);
    }

    setTimeout(() => {
      setShowDragResult(false);
      setIsDragCorrect(null);

      goToNextQuestion(correct);
    }, 1100);
  };

  // --------------------------------------------------
  // FAVORITE
  // --------------------------------------------------

  const handleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  // --------------------------------------------------
  // AUDIO
  // --------------------------------------------------

  const handlePlayAudio = () => {
    setIsPlaying(true);

    setTimeout(() => {
      setIsPlaying(false);
    }, 2000);
  };

  // --------------------------------------------------
  // TYPEWRITER
  // --------------------------------------------------

  useEffect(() => {
    if (
      currentStep !== 'poem' ||
      !selectedPoem ||
      isTypingComplete
    ) {
      return;
    }

    let index = 0;

    const interval = setInterval(() => {
      if (index < selectedPoem.verse.length) {
        setTypedText(prev => [...prev, index]);
        index++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [
    selectedPoem,
    currentStep,
    isTypingComplete,
  ]);

  // --------------------------------------------------
  // ANIMATION
  // --------------------------------------------------

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.96);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------

  const renderTopBar = (
    title?: string,
    showBack = false,
  ) => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: isDark
                ? 'rgba(139,92,246,0.18)'
                : '#F0EAFE',
            },
          ]}
        >
          <BookOpen
            size={21}
            color={colors.primary}
            strokeWidth={2.3}
          />
        </View>

        {title && (
          <View style={styles.topBarTitleContainer}>
            <Text
              style={[
                styles.topBarTitle,
                { color: colors.text },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={handleBack}
        style={[
          styles.backCircle,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : '#FFFFFF',
            borderColor: colors.border,
          },
        ]}
      >
        <ChevronRight
          size={22}
          color={colors.text}
          strokeWidth={2.2}
        />
      </TouchableOpacity>
    </View>
  );

  // --------------------------------------------------
  // LIST
  // --------------------------------------------------

  const renderList = () => (
    <Animated.View
      style={[
        styles.screen,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {renderTopBar()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Sparkles
              size={14}
              color={colors.primary}
            />

            <Text
              style={[
                styles.heroBadgeText,
                { color: colors.primary },
              ]}
            >
              یادگیری هوشمند
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              { color: colors.text },
            ]}
          >
            حفظ اشعار ایرانی
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              { color: colors.textSecondary },
            ]}
          >
            حافظه، ادبیات و درک معنا را با هم تقویت کن
          </Text>
        </View>

        <View
          style={[
            styles.statsCard,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.055)'
                : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(124,58,237,0.18)'
                    : '#F0EAFE',
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
                  styles.statValue,
                  { color: colors.text },
                ]}
              >
                {poems.length}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  { color: colors.textSecondary },
                ]}
              >
                شعر
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statDivider,
              { backgroundColor: colors.border },
            ]}
          />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(245,185,66,0.15)'
                    : '#FFF7DD',
                },
              ]}
            >
              <Award
                size={18}
                color="#F5B942"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.statValue,
                  { color: colors.text },
                ]}
              >
                {poems.filter(p => p.progress > 0).length}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  { color: colors.textSecondary },
                ]}
              >
                در حال یادگیری
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.055)'
                : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <Search
            size={20}
            color={colors.textTertiary}
          />

          <TextInput
            style={[
              styles.searchInput,
              { color: colors.text },
            ]}
            placeholder={
              t.searchPoems || 'جستجو در اشعار...'
            }
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
            >
              <XCircle
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            شاعران
          </Text>
        </View>

        <ScrollView
          horizontal

          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poetsContainer}
        >
          {poets.map(poet => {
            const Icon = poet.icon;
            const active =
              selectedPoet === poet.id;

            return (
              <TouchableOpacity
                key={poet.id}
                activeOpacity={0.8}
                onPress={() =>
                  setSelectedPoet(poet.id)
                }
                style={[
                  styles.poetButton,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : isDark
                      ? 'rgba(255,255,255,0.055)'
                      : '#FFFFFF',
                    borderColor: active
                      ? colors.primary
                      : colors.border,
                  },
                ]}
              >
                <Icon
                  size={16}
                  color={
                    active
                      ? '#FFFFFF'
                      : poet.color
                  }
                />

                <Text
                  style={[
                    styles.poetButtonText,
                    {
                      color: active
                        ? '#FFFFFF'
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {poet.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.poemsHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            مجموعه اشعار
          </Text>

          <Text
            style={[
              styles.resultCount,
              { color: colors.textTertiary },
            ]}
          >
            {filteredPoems.length} مورد
          </Text>
        </View>

        <View style={styles.poemsGrid}>
          {filteredPoems.length === 0 ? (
            <View style={styles.emptyState}>
              <Search
                size={40}
                color={colors.textTertiary}
              />

              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text },
                ]}
              >
                شعری پیدا نشد
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  { color: colors.textSecondary },
                ]}
              >
                عبارت جستجو یا فیلتر شاعر را تغییر بده.
              </Text>
            </View>
          ) : (
            filteredPoems.map((poem, index) => (
              <MotiView
                key={poem.id}
                from={{
                  opacity: 0,
                  translateY: 15,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  delay: index * 70,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() =>
                    handlePoemSelect(poem)
                  }
                  style={[
                    styles.poemCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.055)'
                        : '#FFFFFF',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.poemCardTop}>
                    <View
                      style={[
                        styles.poemIcon,
                        {
                          backgroundColor: isDark
                            ? 'rgba(124,58,237,0.16)'
                            : '#F0EAFE',
                        },
                      ]}
                    >
                      <BookOpen
                        size={21}
                        color={colors.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.poemCardInfo
                      }
                    >
                      <Text
                        style={[
                          styles.poemCardTitle,
                          { color: colors.text },
                        ]}
                      >
                        {poem.title}
                      </Text>

                      <Text
                        style={[
                          styles.poemCardPoet,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {poem.poet}
                      </Text>
                    </View>

                    <ChevronLeft
                      size={20}
                      color={colors.textTertiary}
                    />
                  </View>

                  <View style={styles.previewVerse}>
                    <Text
                      style={[
                        styles.previewVerseText,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {poem.verse.join('  •  ')}
                    </Text>
                  </View>

                  <View
                    style={styles.progressRow}
                  >
                    <View
                      style={[
                        styles.progressTrack,
                        {
                          backgroundColor:
                            colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${poem.progress}%`,
                            backgroundColor:
                              poem.progress === 100
                                ? '#22C55E'
                                : colors.primary,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={[
                        styles.progressPercent,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {Math.round(
                        poem.progress,
                      )}
                      %
                    </Text>
                  </View>

                  <View
                    style={styles.cardFooter}
                  >
                    <Text
                      style={[
                        styles.cardStatus,
                        {
                          color:
                            poem.progress === 100
                              ? '#22C55E'
                              : colors.primary,
                        },
                      ]}
                    >
                      {poem.progress === 100
                        ? 'تکمیل شده'
                        : poem.progress > 0
                        ? 'ادامه یادگیری'
                        : 'شروع یادگیری'}
                    </Text>

                    <ArrowRight
                      size={16}
                      color={
                        poem.progress === 100
                          ? '#22C55E'
                          : colors.primary
                      }
                    />
                  </View>
                </TouchableOpacity>
              </MotiView>
            ))
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );

  // --------------------------------------------------
  // POEM
  // --------------------------------------------------

  const renderPoem = () => {
    if (!selectedPoem) return null;

    return (
      <Animated.View
        style={[
          styles.screen,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {renderTopBar(selectedPoem.title, true)}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.detailHeader}>
            <View>
              <Text
                style={[
                  styles.detailTitle,
                  { color: colors.text },
                ]}
              >
                {selectedPoem.title}
              </Text>

              <Text
                style={[
                  styles.detailPoet,
                  { color: colors.textSecondary },
                ]}
              >
                {selectedPoem.poet}
              </Text>
            </View>

            <View style={styles.scoreBadge}>
              <Star
                size={15}
                color="#F5B942"
                fill="#F5B942"
              />

              <Text
                style={[
                  styles.scoreBadgeText,
                  { color: colors.text },
                ]}
              >
                {selectedPoem.score}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.detailProgressTrack,
              {
                backgroundColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.detailProgressFill,
                {
                  width: `${selectedPoem.progress}%`,
                  backgroundColor:
                    selectedPoem.progress === 100
                      ? '#22C55E'
                      : colors.primary,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.poemHeroCard,
              {
                backgroundColor: isDark
                  ? 'rgba(124,58,237,0.10)'
                  : '#FAF8FF',
                borderColor: isDark
                  ? 'rgba(139,92,246,0.2)'
                  : '#E9E1FF',
              },
            ]}
          >
            <View
              style={styles.decorativeLine}
            />

            {selectedPoem.verse.map(
              (line, index) => (
                <Text
                  key={index}
                  style={[
                    styles.verseText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {typedText.includes(index)
                    ? line
                    : ''}

                  {typedText.includes(index) &&
                    index ===
                      typedText.length - 1 &&
                    !isTypingComplete && (
                      <Text
                        style={[
                          styles.cursor,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        |
                      </Text>
                    )}
                </Text>
              ),
            )}
          </View>

          {isTypingComplete && (
            <>
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 10,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  duration: 350,
                }}
              >
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.045)'
                        : '#FFFFFF',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={styles.infoHeader}
                  >
                    <View
                      style={[
                        styles.infoIcon,
                        {
                          backgroundColor:
                            isDark
                              ? 'rgba(59,130,246,0.15)'
                              : '#EFF6FF',
                        },
                      ]}
                    >
                      <BookOpen
                        size={17}
                        color="#3B82F6"
                      />
                    </View>

                    <Text
                      style={[
                        styles.infoTitle,
                        { color: colors.text },
                      ]}
                    >
                      معنی شعر
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.infoText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {selectedPoem.translation}
                  </Text>
                </View>
              </MotiView>

              <MotiView
                from={{
                  opacity: 0,
                  translateY: 10,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  duration: 350,
                  delay: 100,
                }}
              >
                <View
                  style={[
                    styles.infoCard,
                    {
                      backgroundColor: isDark
                        ? 'rgba(124,58,237,0.08)'
                        : '#FAF8FF',
                      borderColor: isDark
                        ? 'rgba(124,58,237,0.2)'
                        : '#E9E1FF',
                    },
                  ]}
                >
                  <View
                    style={styles.infoHeader}
                  >
                    <View
                      style={[
                        styles.infoIcon,
                        {
                          backgroundColor:
                            isDark
                              ? 'rgba(124,58,237,0.18)'
                              : '#F0EAFE',
                        },
                      ]}
                    >
                      <Sparkles
                        size={17}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.infoTitle,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      تفسیر
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.infoText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {selectedPoem.interpretation}
                  </Text>
                </View>
              </MotiView>
            </>
          )}

          <View style={styles.actionBar}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleFavorite}
              style={[
                styles.iconAction,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.055)'
                    : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Heart
                size={21}
                color={
                  isFavorite
                    ? '#EC4899'
                    : colors.textSecondary
                }
                fill={
                  isFavorite
                    ? '#EC4899'
                    : 'transparent'
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePlayAudio}
              style={[
                styles.iconAction,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.055)'
                    : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <Volume2
                size={21}
                color={
                  isPlaying
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </TouchableOpacity>

            {isTypingComplete && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  setCurrentStep('quiz')
                }
                style={[
                  styles.quizButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <Text
                  style={styles.quizButtonText}
                >
                  شروع آزمون
                </Text>

                <ChevronLeft
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  // --------------------------------------------------
  // QUIZ
  // --------------------------------------------------

  const renderQuiz = () => {
    if (!selectedPoem || !currentQuiz) {
      return null;
    }

    return (
      <MotiView
        from={{
          opacity: 0,
          translateY: 15,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        transition={{
          duration: 350,
        }}
        style={styles.screen}
      >
        {renderTopBar('آزمون', true)}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={styles.quizProgressHeader}
          >
            <View>
              <Text
                style={[
                  styles.quizEyebrow,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {selectedPoem.title}
              </Text>

              <Text
                style={[
                  styles.quizTitle,
                  { color: colors.text },
                ]}
              >
                آزمون
              </Text>
            </View>

            <View
              style={[
                styles.quizNumber,
                {
                  backgroundColor: isDark
                    ? 'rgba(124,58,237,0.15)'
                    : '#F0EAFE',
                },
              ]}
            >
              <Text
                style={[
                  styles.quizNumberText,
                  { color: colors.primary },
                ]}
              >
                {quizIndex + 1}
              </Text>

              <Text
                style={[
                  styles.quizNumberTotal,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                / {quizQuestions.length}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.quizProgressTrack,
              {
                backgroundColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.quizProgressFill,
                {
                  width: `${
                    ((quizIndex + 1) /
                      quizQuestions.length) *
                    100
                  }%`,
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.questionCard,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.055)'
                  : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.questionIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(124,58,237,0.16)'
                    : '#F0EAFE',
                },
              ]}
            >
              <Target
                size={21}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.questionText,
                { color: colors.text },
              ]}
            >
              {currentQuiz.question}
            </Text>
          </View>

          {currentQuiz.type === 'choice' &&
            currentQuiz.options && (
              <View style={styles.optionsContainer}>
                {currentQuiz.options.map(
                  (option, index) => {
                    const selected =
                      selectedOption === index;

                    const correct =
                      currentQuiz.correct ===
                      index;

                    let borderColor =
                      colors.border;

                    let backgroundColor =
                      isDark
                        ? 'rgba(255,255,255,0.045)'
                        : '#FFFFFF';

                    if (
                      selected &&
                      isCorrect
                    ) {
                      borderColor =
                        '#22C55E';
                      backgroundColor =
                        isDark
                          ? 'rgba(34,197,94,0.12)'
                          : '#F0FDF4';
                    }

                    if (
                      selected &&
                      !isCorrect
                    ) {
                      borderColor =
                        '#EF4444';
                      backgroundColor =
                        isDark
                          ? 'rgba(239,68,68,0.12)'
                          : '#FEF2F2';
                    }

                    if (
                      selectedOption !==
                        null &&
                      correct
                    ) {
                      borderColor =
                        '#22C55E';
                      backgroundColor =
                        isDark
                          ? 'rgba(34,197,94,0.12)'
                          : '#F0FDF4';
                    }

                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.85}
                        disabled={
                          selectedOption !==
                          null
                        }
                        onPress={() =>
                          handleOptionSelect(
                            index,
                          )
                        }
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor,
                            borderColor,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.optionIndex,
                            {
                              backgroundColor:
                                selectedOption !==
                                  null &&
                                correct
                                  ? '#22C55E'
                                  : selected
                                  ? isCorrect
                                    ? '#22C55E'
                                    : '#EF4444'
                                  : isDark
                                  ? 'rgba(255,255,255,0.07)'
                                  : '#F3F4F6',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionIndexText,
                              {
                                color:
                                  selectedOption !==
                                    null &&
                                  (correct ||
                                    selected)
                                    ? '#FFFFFF'
                                    : colors.textSecondary,
                              },
                            ]}
                          >
                            {String.fromCharCode(
                              65 + index,
                            )}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.optionText,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {option}
                        </Text>

                        {selectedOption !==
                          null &&
                          correct && (
                            <CheckCircle
                              size={21}
                              color="#22C55E"
                            />
                          )}

                        {selected &&
                          !isCorrect && (
                            <XCircle
                              size={21}
                              color="#EF4444"
                            />
                          )}
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            )}

          {currentQuiz.type === 'fill' &&
            currentQuiz.text && (
              <View
                style={[
                  styles.fillCard,
                  {
                    backgroundColor:
                      isDark
                        ? 'rgba(255,255,255,0.045)'
                        : '#FFFFFF',
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.fillText,
                    { color: colors.text },
                  ]}
                >
                  {currentQuiz.text}
                </Text>

                <TextInput
                  value={fillAnswer}
                  onChangeText={
                    setFillAnswer
                  }
                  editable={!showFillResult}
                  placeholder="پاسخ خود را وارد کنید"
                  placeholderTextColor={
                    colors.textTertiary
                  }
                  style={[
                    styles.fillInput,
                    {
                      color: colors.text,
                      borderColor:
                        showFillResult
                          ? isFillCorrect
                            ? '#22C55E'
                            : '#EF4444'
                          : colors.border,
                      backgroundColor:
                        isDark
                          ? 'rgba(255,255,255,0.04)'
                          : '#F8F9FC',
                    },
                  ]}
                  textAlign="right"
                />
              </View>
            )}

          {currentQuiz.type === 'drag' && (
            <View style={styles.dragContainer}>
              {dragResults.map(
                (verse, index) => (
                  <View
                    key={`${verse}-${index}`}
                    style={[
                      styles.dragItem,
                      {
                        backgroundColor:
                          isDark
                            ? 'rgba(255,255,255,0.045)'
                            : '#FFFFFF',
                        borderColor:
                          showDragResult
                            ? isDragCorrect
                              ? '#22C55E'
                              : '#EF4444'
                            : colors.border,
                      },
                    ]}
                  >
                    <GripVertical
                      size={18}
                      color={
                        colors.textTertiary
                      }
                    />

                    <Text
                      style={[
                        styles.dragText,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {verse}
                    </Text>

                    <View
                      style={
                        styles.dragControls
                      }
                    >
                      <TouchableOpacity
                        disabled={index === 0}
                        onPress={() =>
                          moveVerse(
                            index,
                            -1,
                          )
                        }
                        style={[
                          styles.moveButton,
                          {
                            opacity:
                              index === 0
                                ? 0.25
                                : 1,
                            borderColor:
                              colors.border,
                          },
                        ]}
                      >
                        <ChevronLeft
                          size={16}
                          color={
                            colors.text
                          }
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={
                          index ===
                          dragResults.length -
                            1
                        }
                        onPress={() =>
                          moveVerse(
                            index,
                            1,
                          )
                        }
                        style={[
                          styles.moveButton,
                          {
                            opacity:
                              index ===
                              dragResults.length -
                                1
                                ? 0.25
                                : 1,
                            borderColor:
                              colors.border,
                          },
                        ]}
                      >
                        <ChevronRight
                          size={16}
                          color={
                            colors.text
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ),
              )}
            </View>
          )}

          {currentQuiz.type === 'fill' &&
            !showFillResult && (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!fillAnswer.trim()}
                onPress={
                  handleFillSubmit
                }
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      colors.primary,
                    opacity:
                      fillAnswer.trim()
                        ? 1
                        : 0.45,
                  },
                ]}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  بررسی پاسخ
                </Text>

                <CheckCircle
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}

          {currentQuiz.type === 'drag' &&
            !showDragResult && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={
                  handleDragSubmit
                }
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  بررسی ترتیب
                </Text>

                <CheckCircle
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}

          {showFillResult && (
            <View
              style={[
                styles.resultMessage,
                {
                  backgroundColor:
                    isFillCorrect
                      ? '#22C55E18'
                      : '#EF444418',
                },
              ]}
            >
              {isFillCorrect ? (
                <CheckCircle
                  size={22}
                  color="#22C55E"
                />
              ) : (
                <XCircle
                  size={22}
                  color="#EF4444"
                />
              )}

              <Text
                style={[
                  styles.resultMessageText,
                  {
                    color:
                      isFillCorrect
                        ? '#22C55E'
                        : '#EF4444',
                  },
                ]}
              >
                {isFillCorrect
                  ? 'پاسخ درست است'
                  : 'پاسخ نادرست است'}
              </Text>
            </View>
          )}

          {showDragResult && (
            <View
              style={[
                styles.resultMessage,
                {
                  backgroundColor:
                    isDragCorrect
                      ? '#22C55E18'
                      : '#EF444418',
                },
              ]}
            >
              {isDragCorrect ? (
                <CheckCircle
                  size={22}
                  color="#22C55E"
                />
              ) : (
                <XCircle
                  size={22}
                  color="#EF4444"
                />
              )}

              <Text
                style={[
                  styles.resultMessageText,
                  {
                    color:
                      isDragCorrect
                        ? '#22C55E'
                        : '#EF4444',
                  },
                ]}
              >
                {isDragCorrect
                  ? 'ترتیب درست است'
                  : 'ترتیب نادرست است'}
              </Text>
            </View>
          )}
        </ScrollView>
      </MotiView>
    );
  };

  // --------------------------------------------------
  // RESULT
  // --------------------------------------------------

  const renderResult = () => {
    const correctCount =
      quizAnswers.filter(Boolean).length;

    const totalQuestions =
      quizAnswers.length || 1;

    const percentage = Math.round(
      (correctCount / totalQuestions) * 100,
    );

    const passed = percentage >= 60;

    return (
      <MotiView
        from={{
          opacity: 0,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 450,
        }}
        style={styles.screen}
      >
        {renderTopBar('نتیجه آزمون', true)}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.resultScroll
          }
        >
          <View
            style={[
              styles.resultHero,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.055)'
                  : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.resultIconCircle,
                {
                  backgroundColor: passed
                    ? '#22C55E18'
                    : isDark
                    ? 'rgba(124,58,237,0.15)'
                    : '#F0EAFE',
                },
              ]}
            >
              {passed ? (
                <Trophy
                  size={48}
                  color="#F5B942"
                />
              ) : (
                <RefreshCw
                  size={46}
                  color={colors.primary}
                />
              )}
            </View>

            <Text
              style={[
                styles.resultTitle,
                { color: colors.text },
              ]}
            >
              {passed
                ? 'عملکرد عالی'
                : 'به تلاش ادامه بده'}
            </Text>

            <Text
              style={[
                styles.resultSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {selectedPoem?.title} ·{' '}
              {selectedPoem?.poet}
            </Text>

            <View
              style={styles.resultPercentage}
            >
              <Text
                style={[
                  styles.resultPercentageText,
                  {
                    color: passed
                      ? '#22C55E'
                      : colors.primary,
                  },
                ]}
              >
                {percentage}%
              </Text>

              <Text
                style={[
                  styles.resultPercentageLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                میزان تسلط
              </Text>
            </View>

            <View
              style={[
                styles.resultProgressTrack,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.resultProgressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: passed
                      ? '#22C55E'
                      : '#F59E0B',
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.resultStats}>
            <View
              style={[
                styles.resultStatCard,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.055)'
                      : '#FFFFFF',
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <CheckCircle
                size={22}
                color="#22C55E"
              />

              <Text
                style={[
                  styles.resultStatValue,
                  { color: colors.text },
                ]}
              >
                {correctCount}/
                {totalQuestions}
              </Text>

              <Text
                style={[
                  styles.resultStatLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                پاسخ صحیح
              </Text>
            </View>

            <View
              style={[
                styles.resultStatCard,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.055)'
                      : '#FFFFFF',
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Star
                size={22}
                color="#F5B942"
                fill="#F5B942"
              />

              <Text
                style={[
                  styles.resultStatValue,
                  { color: colors.text },
                ]}
              >
                {totalScore}
              </Text>

              <Text
                style={[
                  styles.resultStatLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                امتیاز
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setCurrentStep('list');
              setSelectedPoem(null);
            }}
            style={[
              styles.resultButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Text
              style={styles.resultButtonText}
            >
              بازگشت به مجموعه اشعار
            </Text>

            <ChevronLeft
              size={19}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </ScrollView>
      </MotiView>
    );
  };

  // --------------------------------------------------
  // MAIN
  // --------------------------------------------------

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#171329', '#211A3A', '#2B2350']
          : ['#F8F7FC', '#FFFFFF']
      }
      style={styles.container}
    >
      {currentStep === 'list' &&
        renderList()}

      {currentStep === 'poem' &&
        renderPoem()}

      {currentStep === 'quiz' &&
        renderQuiz()}

      {currentStep === 'result' &&
        renderResult()}
    </LinearGradient>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  screen: {
    flex: 1,
    paddingTop:
      Platform.OS === 'ios' ? 54 : 30,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  // -----------------------------------------------
  // TOP BAR
  // -----------------------------------------------

  topBar: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBarTitleContainer: {
    flex: 1,
    marginLeft: 11,
  },

  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },

  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -----------------------------------------------
  // HERO
  // -----------------------------------------------

  heroSection: {
    marginTop: 12,
    marginBottom: 20,
  },

  heroBadge: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 9,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'right',
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    fontSize: 14,
    marginTop: 7,
    textAlign: 'right',
    lineHeight: 22,
  },

  // -----------------------------------------------
  // STATS
  // -----------------------------------------------

  statsCard: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 14,
  },

  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },

  statLabel: {
    fontSize: 11,
    marginTop: 1,
    textAlign: 'right',
  },

  statDivider: {
    width: 1,
    height: 38,
  },

  // -----------------------------------------------
  // SEARCH
  // -----------------------------------------------

  searchContainer: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    marginHorizontal: 10,
    paddingVertical: 0,
  },

  // -----------------------------------------------
  // SECTIONS
  // -----------------------------------------------

  sectionHeader: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  poetsContainer: {
    gap: 8,
    paddingBottom: 5,
    marginBottom: 18,
  },

  poetButton: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },

  poetButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  poemsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  resultCount: {
    fontSize: 12,
  },

  // -----------------------------------------------
  // POEM CARDS
  // -----------------------------------------------

  poemsGrid: {
    gap: 11,
  },

  poemCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    marginBottom: 1,
  },

  poemCardTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  poemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 11,
  },

  poemCardInfo: {
    flex: 1,
  },

  poemCardTitle: {
    fontSize: 16,
    // fontWeight: '750',
    textAlign: 'right',
  },

  poemCardPoet: {
    fontSize: 12,
    marginTop: 3,
    textAlign: 'right',
  },

  previewVerse: {
    marginTop: 13,
    padding: 12,
    borderRadius: 13,
    backgroundColor: 'rgba(124,58,237,0.045)',
  },

  previewVerseText: {
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'right',
  },

  progressRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginTop: 13,
  },

  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: 5,
    borderRadius: 3,
  },

  progressPercent: {
    width: 34,
    fontSize: 11,
    textAlign: 'left',
  },

  cardFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },

  cardStatus: {
    fontSize: 12,
    fontWeight: '700',
  },

  // -----------------------------------------------
  // EMPTY
  // -----------------------------------------------

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
  },

  emptyText: {
    fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },

  // -----------------------------------------------
  // POEM DETAIL
  // -----------------------------------------------

  detailHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },

  detailTitle: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'right',
  },

  detailPoet: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'right',
  },

  scoreBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    backgroundColor: 'rgba(245,185,66,0.12)',
  },

  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  detailProgressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },

  detailProgressFill: {
    height: 5,
    borderRadius: 3,
  },

  poemHeroCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 30,
    paddingHorizontal: 18,
    marginBottom: 13,
    position: 'relative',
    overflow: 'hidden',
  },

  decorativeLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#7C3AED',
  },

  verseText: {
    fontSize: 22,
    // fontWeight: '650',
    textAlign: 'center',
    lineHeight: 39,
    marginVertical: 3,
  },

  cursor: {
    fontWeight: '300',
  },

  infoCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    marginBottom: 11,
  },

  infoHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 9,
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },

  infoText: {
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'right',
  },

  actionBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 9,
    marginTop: 8,
    paddingBottom: 10,
  },

  iconAction: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quizButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 15,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // -----------------------------------------------
  // QUIZ
  // -----------------------------------------------

  quizProgressHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },

  quizEyebrow: {
    fontSize: 12,
    textAlign: 'right',
  },

  quizTitle: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: 2,
  },

  quizNumber: {
    minWidth: 58,
    height: 42,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quizNumberText: {
    fontSize: 17,
    fontWeight: '900',
  },

  quizNumberTotal: {
    fontSize: 12,
    fontWeight: '600',
  },

  quizProgressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 18,
  },

  quizProgressFill: {
    height: 5,
    borderRadius: 3,
  },

  questionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    marginBottom: 13,
  },

  questionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 12,
  },

  questionText: {
    fontSize: 18,
    fontWeight: '750',
    lineHeight: 29,
    textAlign: 'right',
  },

  optionsContainer: {
    gap: 9,
  },

  optionButton: {
    minHeight: 62,
    borderRadius: 17,
    borderWidth: 1,
    padding: 11,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 11,
  },

  optionIndex: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionIndexText: {
    fontSize: 13,
    fontWeight: '800',
  },

  optionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '550',
    textAlign: 'right',
  },

  fillCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 17,
  },

  fillText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 30,
    textAlign: 'right',
    marginBottom: 18,
  },

  fillInput: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  dragContainer: {
    gap: 9,
  },

  dragItem: {
    minHeight: 68,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },

  dragText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'right',
  },

  dragControls: {
    flexDirection: 'row',
    gap: 5,
  },

  moveButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    marginTop: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  resultMessage: {
    minHeight: 50,
    borderRadius: 15,
    marginTop: 13,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  resultMessageText: {
    fontSize: 14,
    fontWeight: '800',
  },

  // -----------------------------------------------
  // RESULT
  // -----------------------------------------------

  resultScroll: {
    paddingHorizontal: 18,
    paddingBottom: 100,
    paddingTop: 15,
  },

  resultHero: {
    borderWidth: 1,
    borderRadius: 25,
    padding: 24,
    alignItems: 'center',
  },

  resultIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  resultTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  resultSubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },

  resultPercentage: {
    alignItems: 'center',
    marginTop: 22,
  },

  resultPercentageText: {
    fontSize: 48,
    fontWeight: '900',
  },

  resultPercentageLabel: {
    fontSize: 12,
    marginTop: -2,
  },

  resultProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },

  resultProgressFill: {
    height: 8,
    borderRadius: 4,
  },

  resultStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  resultStatCard: {
    flex: 1,
    minHeight: 125,
    borderWidth: 1,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultStatValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 7,
  },

  resultStatLabel: {
    fontSize: 11,
    marginTop: 3,
  },

  resultButton: {
    minHeight: 54,
    borderRadius: 17,
    marginTop: 13,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});