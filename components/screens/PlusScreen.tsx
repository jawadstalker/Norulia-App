import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Vibration,
  TextInput,
  FlatList,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Spacing, BorderRadius } from '../../constants/theme';
import {
  BookOpen,
  Sparkles,
  Heart,
  Play,
  ChevronRight,
  ChevronLeft,
  Star,
  Trophy,
  Flame,
  CheckCircle,
  XCircle,
  Volume2,
  RefreshCw,
  Award,
  TrendingUp,
  Search,
  Filter,
  User,
  Book,
  Calendar,
  Clock,
  Target,
  GripVertical,
  Home,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// ===== TYPES =====
interface Poem {
  id: number;
  title: string;
  poet: string;
  verse: string[];
  translation: string;
  interpretation: string;
  meaning: string;
  difficultWords: { word: string; meaning: string }[];
  options: string[];
  correct: number;
  fillBlank: { text: string; blank: string; answer: string };
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

// ===== QUIZ QUESTION TYPES =====
interface QuizQuestion {
  question: string;
  type?: 'choice' | 'fill' | 'drag';
  options?: string[];
  correct?: number;
  text?: string;
  answer?: string;
  verses?: string[];
}

// ===== DATA =====
const poets: Poet[] = [
  { id: 'all', name: 'همه', icon: Book, color: '#7C3AED' },
  { id: 'hafez', name: 'حافظ', icon: User, color: '#EC4899' },
  { id: 'saadi', name: 'سعدی', icon: User, color: '#22C55E' },
  { id: 'rumi', name: 'مولانا', icon: User, color: '#F59E0B' },
  { id: 'khayyam', name: 'خیام', icon: User, color: '#3B82F6' },
];

const poemsData: Poem[] = [
  {
    id: 1,
    title: 'غزل شماره ۱',
    poet: 'حافظ',
    verse: [
      'الا یا ایها الساقی ادر کاساً و ناولها',
      'که عشق آسان نمود اول ولی افتاد مشکل‌ها',
    ],
    translation: 'O cup-bearer, pass around the cup and give it to me, for love seemed easy at first but then difficulties arose.',
    interpretation: 'این غزل درباره مسیر عشق و شناخت است. حافظ بیان می‌کند که رسیدن به کمال نیازمند صبر و عبور از سختی‌هاست.',
    meaning: 'عشق در ابتدا ساده به نظر می‌رسد اما مسیر آن دشواری‌هایی دارد.',
    difficultWords: [
      { word: 'ساقی', meaning: 'کسی که جام شراب می‌گرداند' },
      { word: 'کاس', meaning: 'جام شراب' },
    ],
    options: ['مسیر دشوار عشق و رشد', 'ثروت و قدرت', 'سفر و گردش', 'طبیعت و زیبایی'],
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
    translation: 'Human beings are members of a whole, in creation of one essence and soul.',
    interpretation: 'سعدی در این شعر به همبستگی انسانی اشاره می‌کند. همه انسان‌ها مانند اعضای یک بدن هستند.',
    meaning: 'همه انسان‌ها مانند اعضای یک بدن هستند و نسبت به یکدیگر مسئولند.',
    difficultWords: [
      { word: 'بنی آدم', meaning: 'فرزندان آدم، همه انسان‌ها' },
      { word: 'گوهر', meaning: 'ذات و سرشت' },
    ],
    options: ['همدلی و مسئولیت', 'رقابت و برتری', 'تنهایی و انزوا', 'بی‌تفاوتی'],
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
    translation: 'You are your own veil, rise from the midst, for I am hidden from the world-illuminating sun.',
    interpretation: 'مولانا می‌گوید بزرگترین مانع در مسیر رشد و تعالی، خود ما هستیم. باید از خودگذشتگی کنیم.',
    meaning: 'بزرگترین مانع در مسیر رشد، خود ما هستیم.',
    difficultWords: [
      { word: 'حجاب', meaning: 'پرده و مانع' },
      { word: 'جهان‌تاب', meaning: 'جهان‌افروز' },
    ],
    options: ['خودشناسی و رهایی', 'جهل و نادانی', 'ثروت و قدرت', 'شهرت و مقام'],
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
    translation: 'O heart, when the times oppose you, you drink wine and I am in joy.',
    interpretation: 'خیام در برابر سختی‌های روزگار، آرامش را در لذت بردن از لحظه می‌داند.',
    meaning: 'در برابر سختی‌های روزگار، باید آرامش خود را حفظ کرد.',
    difficultWords: [
      { word: 'مخالف', meaning: 'مقابل، ناسازگار' },
      { word: 'طرب', meaning: 'شادی، خوشی' },
    ],
    options: ['لذت بردن از لحظه', 'جنگ و ستیز', 'غم و اندوه', 'بی‌تفاوتی'],
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
    translation: 'Tonight, because of your sorrow, I shall sleep surrounded by blood, and I shall leave my bed.',
    interpretation: 'حافظ عشق را با رنج و فداکاری معنا می‌کند. عاشق واقعی از خواب و آرامش می‌گذرد.',
    meaning: 'عشق واقعی با فداکاری و ایثار همراه است.',
    difficultWords: [
      { word: 'غمت', meaning: 'غم و اندوه تو' },
      { word: 'میان خون', meaning: 'در خون و خونابه' },
    ],
    options: ['عشق و فداکاری', 'نفرت و کینه', 'بی‌تفاوتی', 'ترس و وحشت'],
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

// ===== COMPONENT =====
export default function PlusScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  
  // ===== STATE =====
  const [selectedPoet, setSelectedPoet] = useState('all');
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [currentStep, setCurrentStep] = useState<'list' | 'poem' | 'quiz' | 'result'>('list');
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [typedText, setTypedText] = useState<number[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
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
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // ===== FILTER POEMS =====
  const filteredPoems = poems.filter(poem => {
    const matchPoet = selectedPoet === 'all' || poem.category === selectedPoet;
    const matchSearch = poem.title.includes(searchQuery) || 
                         poem.poet.includes(searchQuery) ||
                         poem.verse.join(' ').includes(searchQuery);
    return matchPoet && matchSearch;
  });

  // ===== QUIZ QUESTIONS =====
  const quizQuestions: QuizQuestion[] = [
    {
      question: t.quizQuestion || 'پیام اصلی این شعر چیست؟',
      type: 'choice',
      options: selectedPoem?.options || [''],
      correct: selectedPoem?.correct || 0,
    },
    {
      question: t.fillBlank || 'تکمیل شعر:',
      type: 'fill',
      text: selectedPoem?.fillBlank?.text || '',
      answer: selectedPoem?.fillBlank?.answer || '',
    },
    {
      question: t.orderVerses || 'ترتیب مصرع‌ها:',
      type: 'drag',
      verses: dragResults || [],
    },
    {
      question: t.meaningQuestion || 'معنی کلمه "ساقی" چیست؟',
      type: 'choice',
      options: ['کسی که جام شراب می‌گرداند', 'نوازنده', 'شاعر', 'پادشاه'],
      correct: 0,
    },
  ];

  const currentQuiz = quizQuestions[quizIndex] || quizQuestions[0];

  // ===== HANDLERS =====
  const handlePoemSelect = (poem: Poem) => {
    setSelectedPoem(poem);
    setCurrentStep('poem');
    setTypedText([]);
    setIsTypingComplete(false);
    setShowQuiz(false);
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
    
    const shuffled = [...poem.shuffledVerses].sort(() => Math.random() - 0.5);
    setDragResults(shuffled);
  };

  const handleBack = () => {
    if (currentStep === 'poem') {
      setCurrentStep('list');
      setSelectedPoem(null);
    } else if (currentStep === 'quiz') {
      setCurrentStep('poem');
    } else if (currentStep === 'result') {
      setCurrentStep('list');
      setSelectedPoem(null);
    }
  };

  const handleNext = () => {
    if (currentStep === 'poem' && isTypingComplete) {
      setCurrentStep('quiz');
      return;
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null || !selectedPoem) return;
    setSelectedOption(index);
    const correct = index === currentQuiz.correct;
    setIsCorrect(correct);
    setQuizAnswers([...quizAnswers, correct]);
    if (correct) {
      setTotalScore(prev => prev + 25);
      setShowConfetti(true);
      Vibration.vibrate(100);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      Vibration.vibrate(50);
    }
    
    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      if (quizIndex < quizQuestions.length - 1) {
        setQuizIndex(prev => prev + 1);
      } else {
        setCurrentStep('result');
        const newProgress = Math.min(100, (totalScore + (correct ? 25 : 0)) / 4);
        setPoems(prev => prev.map(p => 
          p.id === selectedPoem.id 
            ? { ...p, progress: newProgress, score: p.score + totalScore + (correct ? 25 : 0) }
            : p
        ));
      }
    }, 1500);
  };

  const handleFillSubmit = () => {
    if (!fillAnswer.trim() || !selectedPoem) return;
    const isCorrect = fillAnswer.trim() === currentQuiz.answer;
    setIsFillCorrect(isCorrect);
    setShowFillResult(true);
    if (isCorrect) {
      setTotalScore(prev => prev + 10);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setTimeout(() => {
      setFillAnswer('');
      setShowFillResult(false);
      setIsFillCorrect(null);
    }, 1500);
  };

  const handleDragSubmit = () => {
    if (!selectedPoem) return;
    const isCorrect = dragResults.every((verse, index) => 
      verse === selectedPoem.shuffledVerses[selectedPoem.correctOrder[index]]
    );
    setIsDragCorrect(isCorrect);
    setShowDragResult(true);
    if (isCorrect) {
      setTotalScore(prev => prev + 15);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setTimeout(() => {
      setShowDragResult(false);
      setIsDragCorrect(null);
    }, 1500);
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handlePlayAudio = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 2000);
  };

  // ===== TYPEWRITER EFFECT =====
  useEffect(() => {
    if (currentStep === 'poem' && selectedPoem && !isTypingComplete) {
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
    }
  }, [selectedPoem, currentStep]);

  // ===== ANIMATIONS =====
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep, selectedPoem]);

  // ===== RENDER LIST =====
  const renderList = () => (
    <View style={styles.listContainer}>
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 500 }}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          📜 {t.poetryMemory || 'حفظ اشعار ایرانی'}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {t.memoryLiterature || 'تقویت حافظه + ادبیات + درک معنا'}
        </Text>
      </MotiView>

      <View style={[styles.searchContainer, { 
        backgroundColor: isDark ? colors.surface : '#F3F4F6',
        borderColor: colors.border,
      }]}>
        <Search size={20} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t.searchPoems || 'جستجو در اشعار...'}
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.poetsContainer}
      >
        {poets.map((poet) => (
          <TouchableOpacity
            key={poet.id}
            onPress={() => setSelectedPoet(poet.id)}
            style={[
              styles.poetButton,
              {
                backgroundColor: selectedPoet === poet.id 
                  ? colors.primary 
                  : isDark ? colors.surface : '#F3F4F6',
                borderColor: selectedPoet === poet.id 
                  ? colors.primary 
                  : colors.border,
              },
            ]}
          >
            <poet.icon 
              size={16} 
              color={selectedPoet === poet.id ? '#FFFFFF' : colors.textSecondary} 
            />
            <Text style={[
              styles.poetButtonText,
              { color: selectedPoet === poet.id ? '#FFFFFF' : colors.textSecondary }
            ]}>
              {poet.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.poemsGrid}>
        {filteredPoems.map((poem, index) => (
          <MotiView
            key={poem.id}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 80 }}
          >
            <TouchableOpacity
              onPress={() => handlePoemSelect(poem)}
              style={[
                styles.poemCard,
                {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.poemCardHeader}>
                <View style={styles.poemCardIcon}>
                  <BookOpen size={20} color={colors.primary} />
                </View>
                <View style={styles.poemCardInfo}>
                  <Text style={[styles.poemCardTitle, { color: colors.text }]}>
                    {poem.title}
                  </Text>
                  <Text style={[styles.poemCardPoet, { color: colors.textSecondary }]}>
                    {poem.poet}
                  </Text>
                </View>
                {poem.progress > 0 && (
                  <View style={styles.poemCardScore}>
                    <Star size={14} color="#F5B942" fill="#F5B942" />
                    <Text style={[styles.poemCardScoreText, { color: colors.textSecondary }]}>
                      {poem.score}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${poem.progress}%`,
                        backgroundColor: poem.progress === 100 ? '#22C55E' : colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textTertiary }]}>
                  {poem.progress}%
                </Text>
              </View>

              <View style={styles.poemCardFooter}>
                <Text style={[styles.poemCardStatus, { 
                  color: poem.progress === 100 ? '#22C55E' : colors.primary 
                }]}>
                  {poem.progress === 100 ? '✅ تکمیل شده' : poem.progress > 0 ? 'ادامه یادگیری →' : 'شروع یادگیری'}
                </Text>
              </View>
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>
    </View>
  );

  // ===== RENDER POEM =====
  const renderPoem = () => {
    if (!selectedPoem) return null;
    
    return (
      <Animated.View
        style={[
          styles.poemContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>
            {t.back || 'بازگشت'}
          </Text>
        </TouchableOpacity>

        <View style={styles.poemHeader}>
          <View style={styles.poemHeaderLeft}>
            <Text style={[styles.poemTitle, { color: colors.text }]}>
              {selectedPoem.title}
            </Text>
            <Text style={[styles.poemPoet, { color: colors.textSecondary }]}>
              {selectedPoem.poet}
            </Text>
          </View>
          <View style={styles.poemHeaderRight}>
            <View style={styles.poemProgress}>
              <Text style={[styles.poemProgressText, { color: colors.textSecondary }]}>
                {Math.round(selectedPoem.progress)}%
              </Text>
            </View>
            <View style={styles.poemScore}>
              <Star size={16} color="#F5B942" fill="#F5B942" />
              <Text style={[styles.poemScoreText, { color: colors.text }]}>
                {selectedPoem.score}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.poemProgressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.poemProgressFill,
              {
                width: `${selectedPoem.progress}%`,
                backgroundColor: selectedPoem.progress === 100 ? '#22C55E' : colors.primary,
              },
            ]}
          />
        </View>

        <View style={[
          styles.verseCard,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          },
        ]}>
          {selectedPoem.verse.map((line, index) => (
            <Text key={index} style={[styles.verseText, { color: colors.text }]}>
              {typedText.includes(index) ? line : ''}
              {typedText.includes(index) && index === typedText.length - 1 && !isTypingComplete && (
                <Text style={[styles.cursor, { color: colors.primary }]}>|</Text>
              )}
            </Text>
          ))}
        </View>

        {isTypingComplete && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 500 }}
            style={[
              styles.translationCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.translationLabel, { color: colors.textSecondary }]}>
              📖 {t.meaning || 'معنی'}
            </Text>
            <Text style={[styles.translationText, { color: colors.textSecondary }]}>
              {selectedPoem.translation}
            </Text>
          </MotiView>
        )}

        {isTypingComplete && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 500, delay: 200 }}
            style={[
              styles.interpretationCard,
              {
                backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
              },
            ]}
          >
            <Text style={[styles.interpretationLabel, { color: colors.primary }]}>
              💡 {t.interpretation || 'تفسیر'}
            </Text>
            <Text style={[styles.interpretationText, { color: colors.textSecondary }]}>
              {selectedPoem.interpretation}
            </Text>
          </MotiView>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={handleFavorite}
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
          >
            <Heart
              size={22}
              color={isFavorite ? '#EC4899' : colors.textTertiary}
              fill={isFavorite ? '#EC4899' : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePlayAudio}
            style={[styles.actionButton, { backgroundColor: colors.surface }]}
          >
            <Volume2 size={22} color={isPlaying ? colors.primary : colors.textTertiary} />
          </TouchableOpacity>

          {isTypingComplete && (
            <TouchableOpacity
              onPress={handleNext}
              style={[styles.actionButton, styles.nextButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.nextButtonText}>
                {t.startQuiz || 'شروع آزمون'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  // ===== RENDER QUIZ =====
  const renderQuiz = () => {
    if (!selectedPoem) return null;

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 400 }}
        style={styles.quizContainer}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>
            {t.back || 'بازگشت'}
          </Text>
        </TouchableOpacity>

        <View style={styles.quizHeader}>
          <Text style={[styles.quizTitle, { color: colors.text }]}>
            📝 {t.quiz || 'آزمون'} {quizIndex + 1}/{quizQuestions.length}
          </Text>
          <View style={styles.quizScore}>
            <Star size={16} color="#F5B942" fill="#F5B942" />
            <Text style={[styles.quizScoreText, { color: colors.text }]}>
              {totalScore}
            </Text>
          </View>
        </View>

        <Text style={[styles.quizQuestionText, { color: colors.text }]}>
          {currentQuiz.question}
        </Text>

        {currentQuiz.type === 'fill' && currentQuiz.text !== undefined ? (
          <View style={styles.fillContainer}>
            <Text style={[styles.fillText, { color: colors.text }]}>
              {currentQuiz.text.split('______').map((part: string, index: number, arr: string[]) => (
                <React.Fragment key={index}>
                  {part}
                  {index < arr.length - 1 && (
                    <TextInput
                      style={[
                        styles.fillInput,
                        {
                          color: colors.text,
                          borderColor: showFillResult
                            ? isFillCorrect
                              ? '#22C55E'
                              : '#EF4444'
                            : colors.border,
                          backgroundColor: isDark ? colors.surface : '#FFFFFF',
                        },
                      ]}
                      value={fillAnswer}
                      onChangeText={setFillAnswer}
                      editable={!showFillResult}
                      placeholder="..."
                      placeholderTextColor={colors.textTertiary}
                    />
                  )}
                </React.Fragment>
              ))}
            </Text>
          </View>
        ) : currentQuiz.type === 'drag' && currentQuiz.verses !== undefined ? (
          <View style={styles.dragContainer}>
            {currentQuiz.verses.map((verse: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.dragItem,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor: showDragResult
                      ? isDragCorrect
                        ? '#22C55E'
                        : '#EF4444'
                      : colors.border,
                  },
                ]}
              >
                <GripVertical size={16} color={colors.textTertiary} />
                <Text style={[styles.dragText, { color: colors.text }]}>
                  {verse}
                </Text>
              </View>
            ))}
          </View>
        ) : currentQuiz.type === 'choice' && currentQuiz.options !== undefined ? (
          <View style={styles.optionsContainer}>
            {currentQuiz.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      selectedOption === null
                        ? isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'
                        : selectedOption === index
                        ? isCorrect
                          ? '#22C55E20'
                          : '#EF444420'
                        : index === currentQuiz.correct && selectedOption !== null
                        ? '#22C55E20'
                        : isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
                    borderColor:
                      selectedOption === null
                        ? colors.border
                        : selectedOption === index
                        ? isCorrect
                          ? '#22C55E'
                          : '#EF4444'
                        : index === currentQuiz.correct && selectedOption !== null
                        ? '#22C55E'
                        : colors.border,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {option}
                </Text>
                {selectedOption === index && (
                  <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12 }}
                  >
                    {isCorrect ? (
                      <CheckCircle size={22} color="#22C55E" />
                    ) : (
                      <XCircle size={22} color="#EF4444" />
                    )}
                  </MotiView>
                )}
                {selectedOption !== null && index === currentQuiz.correct && selectedOption !== index && (
                  <CheckCircle size={22} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {currentQuiz.type === 'fill' && !showFillResult && (
          <TouchableOpacity
            onPress={handleFillSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            disabled={!fillAnswer.trim()}
          >
            <Text style={styles.submitButtonText}>{t.checkAnswer || 'بررسی پاسخ'}</Text>
          </TouchableOpacity>
        )}

        {currentQuiz.type === 'drag' && !showDragResult && (
          <TouchableOpacity
            onPress={handleDragSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.submitButtonText}>{t.checkOrder || 'بررسی ترتیب'}</Text>
          </TouchableOpacity>
        )}

        {showFillResult && (
          <View style={styles.fillResult}>
            {isFillCorrect ? (
              <CheckCircle size={24} color="#22C55E" />
            ) : (
              <XCircle size={24} color="#EF4444" />
            )}
            <Text style={[styles.fillResultText, { color: isFillCorrect ? '#22C55E' : '#EF4444' }]}>
              {isFillCorrect ? t.correct || '✅ درست!' : t.incorrect || '❌ نادرست'}
            </Text>
          </View>
        )}

        {showDragResult && (
          <View style={styles.fillResult}>
            {isDragCorrect ? (
              <CheckCircle size={24} color="#22C55E" />
            ) : (
              <XCircle size={24} color="#EF4444" />
            )}
            <Text style={[styles.fillResultText, { color: isDragCorrect ? '#22C55E' : '#EF4444' }]}>
              {isDragCorrect ? t.correct || '✅ درست!' : t.incorrect || '❌ نادرست'}
            </Text>
          </View>
        )}
      </MotiView>
    );
  };

  // ===== RENDER RESULT =====
  const renderResult = () => {
    const correctCount = quizAnswers.filter(a => a).length;
    const totalQuestions = quizAnswers.length || 1;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = percentage >= 60;

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 500 }}
        style={styles.resultContainer}
      >
        <View style={styles.resultIcon}>
          {isPassed ? (
            <Trophy size={60} color="#F5B942" />
          ) : (
            <RefreshCw size={60} color={colors.primary} />
          )}
        </View>

        <Text style={[styles.resultTitle, { color: colors.text }]}>
          {isPassed ? '🎉 عالی!' : '💪 ادامه بده!'}
        </Text>

        <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
          {selectedPoem?.title} - {selectedPoem?.poet}
        </Text>

        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <Text style={[styles.resultStatValue, { color: colors.primary }]}>
              {correctCount}/{totalQuestions}
            </Text>
            <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>
              پاسخ صحیح
            </Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={[styles.resultStatValue, { color: '#F5B942' }]}>
              {totalScore}
            </Text>
            <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>
              امتیاز
            </Text>
          </View>
          <View style={styles.resultStat}>
            <Text style={[styles.resultStatValue, { color: '#22C55E' }]}>
              {percentage}%
            </Text>
            <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>
              تسلط
            </Text>
          </View>
        </View>

        <View style={[styles.resultProgress, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.resultProgressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isPassed ? '#22C55E' : '#F59E0B',
              },
            ]}
          />
        </View>

        <TouchableOpacity
          onPress={handleBack}
          style={[styles.resultButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.resultButtonText}>
            {t.backToList || 'بازگشت به لیست'}
          </Text>
        </TouchableOpacity>
      </MotiView>
    );
  };

  // ===== MAIN RENDER =====
  return (
    <LinearGradient
      colors={isDark ? ['#241D3A', '#352B56', '#46386D'] : ['#F8F7FC', '#FFFFFF']}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {currentStep === 'list' && renderList()}
        {currentStep === 'poem' && renderPoem()}
        {currentStep === 'quiz' && renderQuiz()}
        {currentStep === 'result' && renderResult()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  
  // ===== LIST STYLES =====
  listContainer: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: Spacing.sm,
    paddingVertical: 4,
  },
  poetsContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  poetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    gap: 6,
  },
  poetButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  poemsGrid: {
    gap: Spacing.md,
  },
  poemCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  poemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  poemCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  poemCardInfo: {
    flex: 1,
  },
  poemCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  poemCardPoet: {
    fontSize: 13,
  },
  poemCardScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poemCardScoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 30,
    textAlign: 'right',
  },
  poemCardFooter: {
    marginTop: Spacing.xs,
  },
  poemCardStatus: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ===== POEM STYLES =====
  poemContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,
  },
  poemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  poemHeaderLeft: {
    flex: 1,
  },
  poemTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  poemPoet: {
    fontSize: 15,
    marginTop: 2,
  },
  poemHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  poemProgress: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(124,58,237,0.1)',
  },
  poemProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  poemScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  poemScoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  poemProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  poemProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  verseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  verseText: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 36,
  },
  cursor: {
    fontWeight: '300',
  },
  translationCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 15,
    lineHeight: 24,
  },
  interpretationCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  interpretationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  interpretationText: {
    fontSize: 15,
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    width: 'auto',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: 4,
  },

  // ===== QUIZ STYLES =====
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  quizScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quizScoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quizQuestionText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  fillContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginBottom: Spacing.sm,
  },
  fillText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 28,
  },
  fillInput: {
    borderBottomWidth: 2,
    minWidth: 80,
    paddingHorizontal: 4,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fillResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    gap: 8,
  },
  fillResultText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dragContainer: {
    gap: 8,
    marginBottom: Spacing.sm,
  },
  dragItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  dragText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // ===== RESULT STYLES =====
  resultContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  resultIcon: {
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing.lg,
  },
  resultStat: {
    alignItems: 'center',
  },
  resultStatValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  resultStatLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  resultProgress: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  resultProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  resultButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: BorderRadius.lg,
  },
  resultButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});