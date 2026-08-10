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
  Sparkles,
  Target,
  Award,
  Play,
  RotateCcw,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

interface QuranVerse {
  number: number;
  arabic: string;
  translation: string;
  transliteration?: string;
}

interface Surah {
  id: number;
  name: string;
  arabicName: string;
  meaning: string;
  verses: QuranVerse[];
  progress: number;
  score: number;
  completed: boolean;
  juz: number;
  revelation: 'مکی' | 'مدنی';
}

const quranData: Surah[] = [
  {
    id: 1,
    name: 'فاتحه',
    arabicName: 'الفاتحة',
    meaning: 'گشاینده',
    juz: 1,
    revelation: 'مکی',
    progress: 65,
    score: 320,
    completed: false,
    verses: [
      {
        number: 1,
        arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
        translation:
          'به نام خداوند بخشنده مهربان',
      },
      {
        number: 2,
        arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        translation:
          'ستایش مخصوص خداوند، پروردگار جهانیان است',
      },
      {
        number: 3,
        arabic: 'الرَّحْمَنِ الرَّحِيمِ',
        translation:
          'بخشنده مهربان',
      },
      {
        number: 4,
        arabic: 'مَالِكِ يَوْمِ الدِّينِ',
        translation:
          'مالک روز جزاست',
      },
      {
        number: 5,
        arabic:
          'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        translation:
          'تنها تو را می‌پرستیم و تنها از تو یاری می‌جوییم',
      },
      {
        number: 6,
        arabic:
          'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        translation:
          'ما را به راه راست هدایت کن',
      },
      {
        number: 7,
        arabic:
          'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        translation:
          'راه کسانی که به آنان نعمت دادی، نه راه کسانی که مورد خشم قرار گرفته‌اند و نه گمراهان',
      },
    ],
  },

  {
    id: 2,
    name: 'اخلاص',
    arabicName: 'الإخلاص',
    meaning: 'خلوص',
    juz: 30,
    revelation: 'مکی',
    progress: 100,
    score: 500,
    completed: true,
    verses: [
      {
        number: 1,
        arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        translation:
          'بگو: اوست خدای یگانه',
      },
      {
        number: 2,
        arabic: 'اللَّهُ الصَّمَدُ',
        translation:
          'خداوند بی‌نیاز است',
      },
      {
        number: 3,
        arabic:
          'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        translation:
          'نه زاده و نه زاده شده است',
      },
      {
        number: 4,
        arabic:
          'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        translation:
          'و هیچ‌کس همتای او نیست',
      },
    ],
  },

  {
    id: 3,
    name: 'ناس',
    arabicName: 'الناس',
    meaning: 'مردم',
    juz: 30,
    revelation: 'مکی',
    progress: 25,
    score: 100,
    completed: false,
    verses: [
      {
        number: 1,
        arabic:
          'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        translation:
          'بگو: به پروردگار مردم پناه می‌برم',
      },
      {
        number: 2,
        arabic:
          'مَلِكِ النَّاسِ',
        translation:
          'پادشاه مردم',
      },
      {
        number: 3,
        arabic:
          'إِلَٰهِ النَّاسِ',
        translation:
          'معبود مردم',
      },
      {
        number: 4,
        arabic:
          'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        translation:
          'از شر وسوسه‌گر پنهان‌شونده',
      },
      {
        number: 5,
        arabic:
          'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        translation:
          'آن‌که در سینه‌های مردم وسوسه می‌کند',
      },
      {
        number: 6,
        arabic:
          'مِنَ الْجِنَّةِ وَالنَّاسِ',
        translation:
          'چه از جن و چه از انسان',
      },
    ],
  },

  {
    id: 4,
    name: 'فلق',
    arabicName: 'الفلق',
    meaning: 'سپیده‌دم',
    juz: 30,
    revelation: 'مکی',
    progress: 0,
    score: 0,
    completed: false,
    verses: [
      {
        number: 1,
        arabic:
          'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        translation:
          'بگو: به پروردگار سپیده‌دم پناه می‌برم',
      },
      {
        number: 2,
        arabic:
          'مِن شَرِّ مَا خَلَقَ',
        translation:
          'از شر آنچه آفریده است',
      },
      {
        number: 3,
        arabic:
          'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        translation:
          'و از شر تاریکی شب هنگامی که فراگیر شود',
      },
      {
        number: 4,
        arabic:
          'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        translation:
          'و از شر دمندگان در گره‌ها',
      },
      {
        number: 5,
        arabic:
          'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        translation:
          'و از شر حسود هنگامی که حسد ورزد',
      },
    ],
  },

  {
    id: 5,
    name: 'کوثر',
    arabicName: 'الكوثر',
    meaning: 'خیر فراوان',
    juz: 30,
    revelation: 'مکی',
    progress: 0,
    score: 0,
    completed: false,
    verses: [
      {
        number: 1,
        arabic:
          'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
        translation:
          'همانا ما به تو کوثر عطا کردیم',
      },
      {
        number: 2,
        arabic:
          'فَصَلِّ لِرَبِّكَ وَانْحَرْ',
        translation:
          'پس برای پروردگارت نماز بخوان و قربانی کن',
      },
      {
        number: 3,
        arabic:
          'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
        translation:
          'همانا دشمن تو خود بی‌دنباله است',
      },
    ],
  },
];

export default function QuranScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();

  const [surahs, setSurahs] =
    useState<Surah[]>(quranData);

  const [selectedSurah, setSelectedSurah] =
    useState<Surah | null>(null);

  const [currentStep, setCurrentStep] =
    useState<
      'list' | 'surah' | 'quiz' | 'result'
    >('list');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedVerse, setSelectedVerse] =
    useState(0);

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [quizIndex, setQuizIndex] =
    useState(0);

  const [quizAnswers, setQuizAnswers] =
    useState<boolean[]>([]);

  const [selectedOption, setSelectedOption] =
    useState<number | null>(null);

  const [isCorrect, setIsCorrect] =
    useState<boolean | null>(null);

  const [fillAnswer, setFillAnswer] =
    useState('');

  const [showFillResult, setShowFillResult] =
    useState(false);

  const [isFillCorrect, setIsFillCorrect] =
    useState<boolean | null>(null);

  const [totalScore, setTotalScore] =
    useState(0);

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const scaleAnim =
    useRef(new Animated.Value(0.96)).current;

  const filteredSurahs = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) return surahs;

    return surahs.filter(surah => {
      return (
        surah.name.includes(query) ||
        surah.arabicName.includes(query) ||
        surah.meaning.includes(query) ||
        String(surah.id).includes(query)
      );
    });
  }, [surahs, searchQuery]);

  const completedCount = surahs.filter(
    surah => surah.completed,
  ).length;

  const learningCount = surahs.filter(
    surah =>
      surah.progress > 0 &&
      !surah.completed,
  ).length;

  const handleSurahSelect = (
    surah: Surah,
  ) => {
    setSelectedSurah(surah);
    setCurrentStep('surah');

    setSelectedVerse(0);
    setIsFavorite(false);

    setQuizIndex(0);
    setQuizAnswers([]);
    setSelectedOption(null);
    setIsCorrect(null);
    setFillAnswer('');
    setShowFillResult(false);
    setIsFillCorrect(null);
    setTotalScore(0);
  };

  const handleBack = () => {
    if (currentStep === 'surah') {
      setCurrentStep('list');
      setSelectedSurah(null);
      return;
    }

    if (currentStep === 'quiz') {
      setCurrentStep('surah');
      return;
    }

    if (currentStep === 'result') {
      setCurrentStep('list');
      setSelectedSurah(null);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

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

  const handlePlayAudio = () => {
    if (isPlaying) return;

    setIsPlaying(true);

    setTimeout(() => {
      setIsPlaying(false);
    }, 2500);
  };

  const quizQuestions = useMemo(() => {
    if (!selectedSurah) return [];

    const verse =
      selectedSurah.verses[
        Math.min(
          selectedVerse,
          selectedSurah.verses.length - 1,
        )
      ];

    return [
      {
        type: 'choice' as const,
        question:
          'این آیه مربوط به کدام بخش سوره است؟',
        options: [
          `آیه ${verse.number}`,
          'آیه اول',
          'آیه آخر',
          'هیچ‌کدام',
        ],
        correct: 0,
      },

      {
        type: 'fill' as const,
        question:
          'عبارت را از حفظ کامل کنید',
        text: verse.arabic,
        answer: verse.arabic,
      },

      {
        type: 'choice' as const,
        question:
          'معنی این آیه چیست؟',
        options: [
          verse.translation,
          'این آیه درباره دنیا و زندگی روزمره است',
          'این آیه درباره تاریخ است',
          'معنی این آیه مشخص نیست',
        ],
        correct: 0,
      },
    ];
  }, [selectedSurah, selectedVerse]);

  const currentQuiz =
    quizQuestions[quizIndex];

  const goToNextQuestion = (
    correct: boolean,
  ) => {
    const nextAnswers = [
      ...quizAnswers,
      correct,
    ];

    setQuizAnswers(nextAnswers);

    if (
      quizIndex <
      quizQuestions.length - 1
    ) {
      setQuizIndex(prev => prev + 1);
      return;
    }

    const correctCount =
      nextAnswers.filter(Boolean).length;

    const percentage = Math.round(
      (correctCount /
        quizQuestions.length) *
        100,
    );

    if (selectedSurah) {
      setSurahs(prev =>
        prev.map(surah =>
          surah.id === selectedSurah.id
            ? {
                ...surah,
                progress: Math.max(
                  surah.progress,
                  percentage,
                ),
                score:
                  surah.score +
                  totalScore,
                completed:
                  percentage === 100,
              }
            : surah,
        ),
      );
    }

    setCurrentStep('result');
  };

  const handleOptionSelect = (
    index: number,
  ) => {
    if (
      selectedOption !== null ||
      !currentQuiz
    ) {
      return;
    }

    const correct =
      index === currentQuiz.correct;

    setSelectedOption(index);
    setIsCorrect(correct);

    if (correct) {
      setTotalScore(
        prev => prev + 25,
      );

      Vibration.vibrate(70);
    } else {
      Vibration.vibrate(40);
    }

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);

      goToNextQuestion(correct);
    }, 1100);
  };

  const handleFillSubmit = () => {
    if (
      !fillAnswer.trim() ||
      !currentQuiz?.answer
    ) {
      return;
    }

    const correct =
      fillAnswer.trim() ===
      currentQuiz.answer.trim();

    setIsFillCorrect(correct);
    setShowFillResult(true);

    if (correct) {
      setTotalScore(
        prev => prev + 25,
      );

      Vibration.vibrate(70);
    }

    setTimeout(() => {
      setFillAnswer('');
      setShowFillResult(false);
      setIsFillCorrect(null);

      goToNextQuestion(correct);
    }, 1100);
  };

  const renderTopBar = (title?: string) => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        {title && (
          <Text
            style={[
              styles.topBarTitle,
              {
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
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
        <ChevronLeft
          size={22}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );

  const renderList = () => (
    <Animated.View
      style={[
        styles.screen,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      {renderTopBar()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Sparkles
              size={14}
              color="#22C55E"
            />

            <Text
              style={[
                styles.heroBadgeText,
                { color: '#22C55E' },
              ]}
            >
              حفظ هوشمند قرآن
            </Text>
          </View>

          <Text
            style={[
              styles.heroTitle,
              { color: colors.text },
            ]}
          >
            حفظ قرآن کریم
          </Text>

          <Text
            style={[
              styles.heroSubtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            آیات قرآن را مرحله‌به‌مرحله حفظ کن
            و میزان تسلط خود را بسنج
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
                    ? 'rgba(34,197,94,0.15)'
                    : '#ECFDF5',
                },
              ]}
            >
              <BookOpen
                size={18}
                color="#22C55E"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {surahs.length}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                سوره
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statDivider,
              {
                backgroundColor:
                  colors.border,
              },
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
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {completedCount}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                تکمیل شده
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statDivider,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />

          <View style={styles.statItem}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(59,130,246,0.15)'
                    : '#EFF6FF',
                },
              ]}
            >
              <Target
                size={18}
                color="#3B82F6"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {learningCount}
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                در حال حفظ
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
            color={
              colors.textTertiary
            }
          />

          <TextInput
            style={[
              styles.searchInput,
              {
                color:
                  colors.text,
              },
            ]}
            placeholder="جستجوی سوره..."
            placeholderTextColor={
              colors.textTertiary
            }
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            textAlign="right"
          />

          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() =>
                setSearchQuery('')
              }
            >
              <XCircle
                size={18}
                color={
                  colors.textTertiary
                }
              />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={styles.sectionHeader}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            سوره‌ها
          </Text>

          <Text
            style={[
              styles.resultCount,
              {
                color:
                  colors.textTertiary,
              },
            ]}
          >
            {filteredSurahs.length} سوره
          </Text>
        </View>

        <View
          style={styles.surahsContainer}
        >
          {filteredSurahs.length === 0 ? (
            <View
              style={styles.emptyState}
            >
              <Search
                size={40}
                color={
                  colors.textTertiary
                }
              />

              <Text
                style={[
                  styles.emptyTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                سوره‌ای پیدا نشد
              </Text>

              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                عبارت جستجو را تغییر بده.
              </Text>
            </View>
          ) : (
            filteredSurahs.map(
              (surah, index) => (
                <MotiView
                  key={surah.id}
                  from={{
                    opacity: 0,
                    translateY: 15,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    delay:
                      index * 60,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() =>
                      handleSurahSelect(
                        surah,
                      )
                    }
                    style={[
                      styles.surahCard,
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
                    <View
                      style={
                        styles.surahCardTop
                      }
                    >
                      <View
                        style={[
                          styles.surahNumber,
                          {
                            backgroundColor:
                              surah.completed
                                ? '#22C55E18'
                                : isDark
                                ? 'rgba(34,197,94,0.12)'
                                : '#ECFDF5',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.surahNumberText,
                            {
                              color:
                                surah.completed
                                  ? '#22C55E'
                                  : '#16A34A',
                            },
                          ]}
                        >
                          {surah.id}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.surahInfo
                        }
                      >
                        <Text
                          style={[
                            styles.surahArabic,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {surah.arabicName}
                        </Text>

                        <Text
                          style={[
                            styles.surahName,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          سوره {surah.name} ·{' '}
                          {surah.meaning}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.surahMeta
                        }
                      >
                        <Text
                          style={[
                            styles.surahJuz,
                            {
                              color:
                                colors.textTertiary,
                            },
                          ]}
                        >
                          جزء {surah.juz}
                        </Text>

                        <Text
                          style={[
                            styles.surahRevelation,
                            {
                              color:
                                colors.textTertiary,
                            },
                          ]}
                        >
                          {surah.revelation}
                        </Text>
                      </View>

                      <ChevronLeft
                        size={20}
                        color={
                          colors.textTertiary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.progressRow
                      }
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
                              width: `${surah.progress}%`,
                              backgroundColor:
                                surah.completed
                                  ? '#22C55E'
                                  : '#22C55E',
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
                        {surah.progress}%
                      </Text>
                    </View>

                    <View
                      style={
                        styles.cardFooter
                      }
                    >
                      <Text
                        style={[
                          styles.cardStatus,
                          {
                            color:
                              surah.completed
                                ? '#22C55E'
                                : '#16A34A',
                          },
                        ]}
                      >
                        {surah.completed
                          ? 'حفظ کامل'
                          : surah.progress > 0
                          ? 'ادامه حفظ'
                          : 'شروع حفظ'}
                      </Text>

                      <Text
                        style={[
                          styles.verseCount,
                          {
                            color:
                              colors.textTertiary,
                          },
                        ]}
                      >
                        {surah.verses.length}{' '}
                        آیه
                      </Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              ),
            )
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderSurah = () => {
    if (!selectedSurah) return null;

    return (
      <Animated.View
        style={[
          styles.screen,
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
        {renderTopBar(
          `سوره ${selectedSurah.name}`,
        )}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={styles.detailHeader}
          >
            <View>
              <Text
                style={[
                  styles.detailArabicTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {selectedSurah.arabicName}
              </Text>

              <Text
                style={[
                  styles.detailPoet,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                سوره {selectedSurah.name} ·{' '}
                {selectedSurah.meaning}
              </Text>
            </View>

            <View
              style={
                styles.scoreBadge
              }
            >
              <Star
                size={15}
                color="#F5B942"
                fill="#F5B942"
              />

              <Text
                style={[
                  styles.scoreBadgeText,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {selectedSurah.score}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.detailProgressTrack,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.detailProgressFill,
                {
                  width: `${selectedSurah.progress}%`,
                  backgroundColor:
                    '#22C55E',
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.memoryHint,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(34,197,94,0.10)'
                    : '#F0FDF4',
                borderColor:
                  isDark
                    ? 'rgba(34,197,94,0.20)'
                    : '#DCFCE7',
              },
            ]}
          >
            <View
              style={[
                styles.memoryHintIcon,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(34,197,94,0.15)'
                      : '#DCFCE7',
                },
              ]}
            >
              <Sparkles
                size={17}
                color="#22C55E"
              />
            </View>

            <View
              style={
                styles.memoryHintContent
              }
            >
              <Text
                style={[
                  styles.memoryHintTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                حالت حفظ
              </Text>

              <Text
                style={[
                  styles.memoryHintText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                آیات را با صدای بلند تکرار کن
                و سپس آزمون بگیر.
              </Text>
            </View>
          </View>

          {selectedSurah.verses.map(
            (verse, index) => {
              const active =
                selectedVerse === index;

              return (
                <MotiView
                  key={verse.number}
                  from={{
                    opacity: 0,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    delay:
                      index * 50,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                      setSelectedVerse(
                        index,
                      )
                    }
                    style={[
                      styles.verseCard,
                      {
                        backgroundColor:
                          active
                            ? isDark
                              ? 'rgba(34,197,94,0.09)'
                              : '#F7FFF9'
                            : isDark
                            ? 'rgba(255,255,255,0.045)'
                            : '#FFFFFF',

                        borderColor:
                          active
                            ? '#22C55E55'
                            : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={
                        styles.verseHeader
                      }
                    >
                      <View
                        style={[
                          styles.verseNumber,
                          {
                            backgroundColor:
                              active
                                ? '#22C55E'
                                : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#F3F4F6',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.verseNumberText,
                            {
                              color:
                                active
                                  ? '#FFFFFF'
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {verse.number}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.verseLabel,
                          {
                            color:
                              colors.textTertiary,
                          },
                        ]}
                      >
                        آیه
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.quranArabic,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {verse.arabic}
                    </Text>

                    {active && (
                      <MotiView
                        from={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          duration: 250,
                        }}
                      >
                        <View
                          style={
                            styles.translationBox
                          }
                        >
                          <Text
                            style={[
                              styles.translationLabel,
                              {
                                color:
                                  '#22C55E',
                              },
                            ]}
                          >
                            ترجمه
                          </Text>

                          <Text
                            style={[
                              styles.translationText,
                              {
                                color:
                                  colors.textSecondary,
                              },
                            ]}
                          >
                            {
                              verse.translation
                            }
                          </Text>
                        </View>
                      </MotiView>
                    )}
                  </TouchableOpacity>
                </MotiView>
              );
            },
          )}

          <View
            style={styles.actionBar}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setIsFavorite(
                  prev => !prev,
                )
              }
              style={[
                styles.iconAction,
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
              onPress={
                handlePlayAudio
              }
              style={[
                styles.iconAction,
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
              {isPlaying ? (
                <Volume2
                  size={21}
                  color="#22C55E"
                />
              ) : (
                <Play
                  size={19}
                  color={
                    colors.textSecondary
                  }
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                setCurrentStep(
                  'quiz',
                )
              }
              style={[
                styles.quizButton,
                {
                  backgroundColor:
                    '#22C55E',
                },
              ]}
            >
              <Text
                style={
                  styles.quizButtonText
                }
              >
                آزمون حفظ
              </Text>

              <Target
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderQuiz = () => {
    if (
      !selectedSurah ||
      !currentQuiz
    ) {
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
        {renderTopBar(
          'آزمون حفظ',
        )}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View
            style={
              styles.quizProgressHeader
            }
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
                سوره{' '}
                {
                  selectedSurah.name
                }
              </Text>

              <Text
                style={[
                  styles.quizTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                آزمون حفظ
              </Text>
            </View>

            <View
              style={[
                styles.quizNumber,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(34,197,94,0.15)'
                      : '#ECFDF5',
                },
              ]}
            >
              <Text
                style={[
                  styles.quizNumberText,
                  {
                    color:
                      '#16A34A',
                  },
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
                /{' '}
                {
                  quizQuestions.length
                }
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.quizProgressTrack,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.quizProgressFill,
                {
                  width: `${
                    ((quizIndex +
                      1) /
                      quizQuestions.length) *
                    100
                  }%`,
                  backgroundColor:
                    '#22C55E',
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.questionCard,
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
            <View
              style={[
                styles.questionIcon,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(34,197,94,0.15)'
                      : '#ECFDF5',
                },
              ]}
            >
              <Target
                size={21}
                color="#22C55E"
              />
            </View>

            <Text
              style={[
                styles.questionText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {
                currentQuiz.question
              }
            </Text>
          </View>

          {currentQuiz.type ===
            'choice' &&
            currentQuiz.options && (
              <View
                style={
                  styles.optionsContainer
                }
              >
                {currentQuiz.options.map(
                  (
                    option,
                    index,
                  ) => {
                    const selected =
                      selectedOption ===
                      index;

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
                        activeOpacity={
                          0.85
                        }
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
                              65 +
                                index,
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
                              size={
                                21
                              }
                              color="#22C55E"
                            />
                          )}

                        {selected &&
                          !isCorrect && (
                            <XCircle
                              size={
                                21
                              }
                              color="#EF4444"
                            />
                          )}
                      </TouchableOpacity>
                    );
                  },
                )}
              </View>
            )}

          {currentQuiz.type ===
            'fill' && (
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
                  styles.fillHint,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                آیه را بدون نگاه کردن
                به متن وارد کن:
              </Text>

              <Text
                style={[
                  styles.fillTranslation,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  selectedSurah
                    .verses[
                      selectedVerse
                    ]
                    .translation
                }
              </Text>

              <TextInput
                value={
                  fillAnswer
                }
                onChangeText={
                  setFillAnswer
                }
                editable={
                  !showFillResult
                }
                placeholder="متن آیه را از حفظ بنویس"
                placeholderTextColor={
                  colors.textTertiary
                }
                multiline
                style={[
                  styles.fillInput,
                  {
                    color:
                      colors.text,
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
                textAlignVertical="top"
              />
            </View>
          )}

          {currentQuiz.type ===
            'fill' &&
            !showFillResult && (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={
                  !fillAnswer.trim()
                }
                onPress={
                  handleFillSubmit
                }
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      '#22C55E',
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
                  ? 'آفرین! آیه را درست به خاطر سپرده‌ای'
                  : 'پاسخ با متن آیه مطابقت ندارد'}
              </Text>
            </View>
          )}
        </ScrollView>
      </MotiView>
    );
  };

  const renderResult = () => {
    const correctCount =
      quizAnswers.filter(
        Boolean,
      ).length;

    const totalQuestions =
      quizAnswers.length || 1;

    const percentage =
      Math.round(
        (correctCount /
          totalQuestions) *
          100,
      );

    const passed =
      percentage >= 60;

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
        {renderTopBar(
          'نتیجه حفظ',
        )}

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.resultScroll
          }
        >
          <View
            style={[
              styles.resultHero,
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
            <View
              style={[
                styles.resultIconCircle,
                {
                  backgroundColor:
                    passed
                      ? '#22C55E18'
                      : isDark
                      ? 'rgba(34,197,94,0.12)'
                      : '#ECFDF5',
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
                  color="#22C55E"
                />
              )}
            </View>

            <Text
              style={[
                styles.resultTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {passed
                ? 'حفظ عالی بود!'
                : 'ادامه بده'}
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
              سوره{' '}
              {
                selectedSurah?.name
              }
            </Text>

            <View
              style={
                styles.resultPercentage
              }
            >
              <Text
                style={[
                  styles.resultPercentageText,
                  {
                    color:
                      passed
                        ? '#22C55E'
                        : '#16A34A',
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
                    backgroundColor:
                      passed
                        ? '#22C55E'
                        : '#F59E0B',
                  },
                ]}
              />
            </View>
          </View>

          <View
            style={styles.resultStats}
          >
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
                  {
                    color:
                      colors.text,
                  },
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
                  {
                    color:
                      colors.text,
                  },
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
              setCurrentStep(
                'list',
              );
              setSelectedSurah(
                null,
              );
            }}
            style={[
              styles.resultButton,
              {
                backgroundColor:
                  '#22C55E',
              },
            ]}
          >
            <Text
              style={
                styles.resultButtonText
              }
            >
              بازگشت به سوره‌ها
            </Text>

            <ChevronLeft
              size={19}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setQuizIndex(0);
              setQuizAnswers([]);
              setSelectedOption(
                null,
              );
              setIsCorrect(null);
              setFillAnswer('');
              setTotalScore(0);

              setCurrentStep(
                'quiz',
              );
            }}
            style={[
              styles.secondaryButton,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(34,197,94,0.10)'
                    : '#F0FDF4',
                borderColor:
                  isDark
                    ? 'rgba(34,197,94,0.20)'
                    : '#DCFCE7',
              },
            ]}
          >
            <RotateCcw
              size={18}
              color="#22C55E"
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    '#16A34A',
                },
              ]}
            >
              دوباره تمرین کن
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </MotiView>
    );
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              '#101A15',
              '#16231B',
              '#1D2E23',
            ]
          : [
              '#F7FCF8',
              '#FFFFFF',
            ]
      }
      style={styles.container}
    >
      {currentStep === 'list' &&
        renderList()}

      {currentStep === 'surah' &&
        renderSurah()}

      {currentStep === 'quiz' &&
        renderQuiz()}

      {currentStep === 'result' &&
        renderResult()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  screen: {
    flex: 1,
    paddingTop:
      Platform.OS === 'ios'
        ? 54
        : 30,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 130,
  },

  topBar: {
    minHeight: 54,
    paddingHorizontal: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  topBarLeft: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'right',
  },

  backCircle: {
    
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 19,
  },

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
    lineHeight: 23,
  },

  statsCard: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 14,
  },

  statItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 7,
  },

  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  statLabel: {
    fontSize: 10,
    marginTop: 1,
    textAlign: 'right',
  },

  statDivider: {
    width: 1,
    height: 38,
  },

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

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  resultCount: {
    fontSize: 12,
  },

  surahsContainer: {
    gap: 10,
  },

  surahCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    marginBottom: 1,
  },

  surahCardTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  surahNumber: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  surahNumberText: {
    fontSize: 15,
    fontWeight: '900',
  },

  surahInfo: {
    flex: 1,
  },

  surahArabic: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },

  surahName: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'right',
  },

  surahMeta: {
    alignItems: 'flex-end',
    marginLeft: 7,
  },

  surahJuz: {
    fontSize: 10,
  },

  surahRevelation: {
    fontSize: 10,
    marginTop: 3,
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
    width: 38,
    fontSize: 11,
    textAlign: 'left',
  },

  cardFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  cardStatus: {
    fontSize: 12,
    fontWeight: '700',
  },

  verseCount: {
    fontSize: 11,
  },

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

  detailHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },

  detailArabicTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'right',
  },

  detailPoet: {
    fontSize: 13,
    marginTop: 5,
    textAlign: 'right',
  },

  scoreBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    backgroundColor:
      'rgba(245,185,66,0.12)',
  },

  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  detailProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },

  detailProgressFill: {
    height: 6,
    borderRadius: 3,
  },

  memoryHint: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 13,
  },

  memoryHintIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  memoryHintContent: {
    flex: 1,
  },

  memoryHintTitle: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },

  memoryHintText: {
    fontSize: 11,
    lineHeight: 19,
    marginTop: 2,
    textAlign: 'right',
  },

  verseCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
  },

  verseHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 14,
  },

  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verseNumberText: {
    fontSize: 12,
    fontWeight: '800',
  },

  verseLabel: {
    fontSize: 11,
    marginRight: 7,
  },

  quranArabic: {
    fontSize: 23,
    lineHeight: 43,
    textAlign: 'right',
    writingDirection: 'rtl',
    fontWeight: '600',
  },

  translationBox: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(128,128,128,0.15)',
  },

  translationLabel: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 5,
  },

  translationText: {
    fontSize: 13,
    lineHeight: 23,
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
    gap: 7,
  },

  quizButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

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
    fontWeight: '700',
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
    fontWeight: '500',
    textAlign: 'right',
  },

  fillCard: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 17,
  },

  fillHint: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'right',
  },

  fillTranslation: {
    fontSize: 15,
    lineHeight: 26,
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 16,
    fontWeight: '600',
  },

  fillInput: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
    lineHeight: 34,
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
    minHeight: 54,
    borderRadius: 15,
    marginTop: 13,
    paddingHorizontal: 15,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  resultMessageText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },

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

  secondaryButton: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 10,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});