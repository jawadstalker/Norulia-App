import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Activity,
  HeartPulse,
  Brain,
  Zap,
  Play,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Footprints,
  PersonStanding,
  Wind,
  Target,
  BarChart3,
  CalendarDays,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SportsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();

  /*
   * ============================================================
   * LOCAL TRANSLATIONS
   * ============================================================
   */

  const TEXTS = {
    fa: {
      back: 'بازگشت',

      badge: 'Brain × Body × Performance',

      title: 'ورزش',
      subtitle:
        'برنامه روزانه‌ای برای تقویت بدن، ذهن و انرژی شما',

      today: 'امروز',
      todayPlan: 'برنامه امروز',

      completed: 'تکمیل شده',
      remaining: 'باقی مانده',

      yourMood: 'حال امروزت چطوره؟',
      moodSubtitle:
        'برنامه امروز با وضعیت فعلی شما هماهنگ می‌شود',

      great: 'عالی',
      good: 'خوب',
      normal: 'معمولی',
      tired: 'خسته',
      stressed: 'پراسترس',

      body: 'بدن',
      mind: 'ذهن',
      energy: 'انرژی',

      todaysWorkout: 'تمرین امروز',
      recommendedForYou: 'پیشنهاد شده برای شما',

      warmup: 'گرم کردن',
      mainWorkout: 'تمرین اصلی',
      cooldown: 'سرد کردن',

      duration: 'دقیقه',
      seconds: 'ثانیه',
      reps: 'تکرار',
      sets: 'ست',

      startWorkout: 'شروع تمرین',
      continueWorkout: 'ادامه تمرین',

      exercises: 'حرکات',
      exercise: 'حرکت',

      weeklyPlan: 'برنامه هفتگی',
      weeklyReport: 'گزارش هفتگی',

      weekProgress: 'پیشرفت این هفته',
      workoutsCompleted: 'تمرین انجام شده',
      totalMinutes: 'دقیقه فعالیت',
      activeDays: 'روز فعال',
      currentStreak: 'روز متوالی',

      monday: 'دوشنبه',
      tuesday: 'سه‌شنبه',
      wednesday: 'چهارشنبه',
      thursday: 'پنجشنبه',
      friday: 'جمعه',
      saturday: 'شنبه',
      sunday: 'یکشنبه',

      todayShort: 'امروز',

      recovery: 'ریکاوری',
      strength: 'قدرتی',
      mobility: 'انعطاف',
      cardio: 'هوازی',
      balance: 'تعادل',

      weeklyInsight: 'بینش هفتگی',

      weeklyInsightText:
        'این هفته تمرکز برنامه روی حفظ انرژی، حرکت منظم و ایجاد تعادل بین عملکرد ذهنی و بدنی است.',

      performance: 'عملکرد',
      bodyPerformance: 'عملکرد بدنی',
      mentalPerformance: 'عملکرد ذهنی',

      viewReport: 'مشاهده گزارش کامل',

      start: 'شروع',
      done: 'انجام شد',

      noPressure:
        'اگر امروز انرژی کمتری داری، شدت تمرین را کاهش بده.',

      safeTraining:
        'حرکات را با فرم مناسب و در محدوده توانایی خود انجام دهید.',
    },

    en: {
      back: 'Back',

      badge: 'Brain × Body × Performance',

      title: 'Sports',
      subtitle:
        'A daily plan to improve your body, mind and energy',

      today: 'Today',
      todayPlan: "Today's Plan",

      completed: 'Completed',
      remaining: 'Remaining',

      yourMood: 'How are you feeling today?',
      moodSubtitle:
        'Your daily plan adapts to your current state',

      great: 'Great',
      good: 'Good',
      normal: 'Normal',
      tired: 'Tired',
      stressed: 'Stressed',

      body: 'Body',
      mind: 'Mind',
      energy: 'Energy',

      todaysWorkout: "Today's Workout",
      recommendedForYou: 'Recommended for you',

      warmup: 'Warm Up',
      mainWorkout: 'Main Workout',
      cooldown: 'Cool Down',

      duration: 'min',
      seconds: 'sec',
      reps: 'reps',
      sets: 'sets',

      startWorkout: 'Start Workout',
      continueWorkout: 'Continue Workout',

      exercises: 'Exercises',
      exercise: 'Exercise',

      weeklyPlan: 'Weekly Plan',
      weeklyReport: 'Weekly Report',

      weekProgress: 'This Week',
      workoutsCompleted: 'Workouts',
      totalMinutes: 'Active Minutes',
      activeDays: 'Active Days',
      currentStreak: 'Day Streak',

      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',

      todayShort: 'Today',

      recovery: 'Recovery',
      strength: 'Strength',
      mobility: 'Mobility',
      cardio: 'Cardio',
      balance: 'Balance',

      weeklyInsight: 'Weekly Insight',

      weeklyInsightText:
        'This week focuses on maintaining energy, consistent movement and balancing mental and physical performance.',

      performance: 'Performance',
      bodyPerformance: 'Body Performance',
      mentalPerformance: 'Mental Performance',

      viewReport: 'View Full Report',

      start: 'Start',
      done: 'Done',

      noPressure:
        'If your energy is lower today, reduce the workout intensity.',

      safeTraining:
        'Perform movements with proper form and within your ability.',
    },
  };

  const text = isRTL ? TEXTS.fa : TEXTS.en;

  /*
   * ============================================================
   * STATE
   * ============================================================
   */

  const [selectedMood, setSelectedMood] =
    useState('good');

  const [completedExercises, setCompletedExercises] =
    useState<string[]>([]);

  /*
   * ============================================================
   * MOODS
   * ============================================================
   */

  const moods = [
    {
      id: 'great',
      label: text.great,
      icon: Sparkles,
      color: '#22C55E',
      background: isDark
        ? 'rgba(34,197,94,0.15)'
        : '#F0FDF4',
    },

    {
      id: 'good',
      label: text.good,
      icon: Zap,
      color: '#84CC16',
      background: isDark
        ? 'rgba(132,204,22,0.15)'
        : '#F7FEE7',
    },

    {
      id: 'normal',
      label: text.normal,
      icon: Activity,
      color: '#F59E0B',
      background: isDark
        ? 'rgba(245,158,11,0.15)'
        : '#FFFBEB',
    },

    {
      id: 'tired',
      label: text.tired,
      icon: Wind,
      color: '#6366F1',
      background: isDark
        ? 'rgba(99,102,241,0.15)'
        : '#EEF2FF',
    },

    {
      id: 'stressed',
      label: text.stressed,
      icon: HeartPulse,
      color: '#EC4899',
      background: isDark
        ? 'rgba(236,72,153,0.15)'
        : '#FDF2F8',
    },
  ];

  /*
   * ============================================================
   * TODAY EXERCISES
   * ============================================================
   */

  const exercises = [
    {
      id: 'warmup',
      title: text.warmup,
      subtitle: text.mobility,
      duration: 5,
      icon: Wind,
      color: '#06B6D4',
      background: isDark
        ? 'rgba(6,182,212,0.15)'
        : '#ECFEFF',
    },

    {
      id: 'squat',
      title: isRTL
        ? 'اسکوات'
        : 'Bodyweight Squat',
      subtitle: text.strength,
      reps: 12,
      sets: 3,
      icon: PersonStanding,
      color: '#8B5CF6',
      background: isDark
        ? 'rgba(139,92,246,0.15)'
        : '#F5F3FF',
    },

    {
      id: 'walk',
      title: isRTL
        ? 'راه رفتن سریع'
        : 'Brisk Walk',
      subtitle: text.cardio,
      duration: 10,
      icon: Footprints,
      color: '#10B981',
      background: isDark
        ? 'rgba(16,185,129,0.15)'
        : '#ECFDF5',
    },

    {
      id: 'balance',
      title: isRTL
        ? 'تمرین تعادل'
        : 'Balance Hold',
      subtitle: text.balance,
      duration: 60,
      icon: Target,
      color: '#F59E0B',
      background: isDark
        ? 'rgba(245,158,11,0.15)'
        : '#FFFBEB',
    },

    {
      id: 'cooldown',
      title: text.cooldown,
      subtitle: text.recovery,
      duration: 5,
      icon: Wind,
      color: '#3B82F6',
      background: isDark
        ? 'rgba(59,130,246,0.15)'
        : '#EFF6FF',
    },
  ];

  /*
   * ============================================================
   * WEEKLY PLAN
   * ============================================================
   */

  const weeklyPlan = [
    {
      id: 'mon',
      day: text.monday,
      short: isRTL ? 'د' : 'M',
      type: text.strength,
      duration: 25,
      completed: true,
    },

    {
      id: 'tue',
      day: text.tuesday,
      short: isRTL ? 'س' : 'T',
      type: text.cardio,
      duration: 30,
      completed: true,
    },

    {
      id: 'wed',
      day: text.wednesday,
      short: isRTL ? 'چ' : 'W',
      type: text.mobility,
      duration: 20,
      completed: true,
    },

    {
      id: 'thu',
      day: text.thursday,
      short: isRTL ? 'پ' : 'T',
      type: text.strength,
      duration: 30,
      completed: false,
      today: true,
    },

    {
      id: 'fri',
      day: text.friday,
      short: isRTL ? 'ج' : 'F',
      type: text.cardio,
      duration: 25,
      completed: false,
    },

    {
      id: 'sat',
      day: text.saturday,
      short: isRTL ? 'ش' : 'S',
      type: text.balance,
      duration: 20,
      completed: false,
    },

    {
      id: 'sun',
      day: text.sunday,
      short: isRTL ? 'ی' : 'S',
      type: text.recovery,
      duration: 15,
      completed: false,
    },
  ];

  /*
   * ============================================================
   * PROGRESS
   * ============================================================
   */

  const completedCount =
    completedExercises.length;

  const progress =
    Math.round(
      (completedCount /
        exercises.length) *
        100
    );

  /*
   * ============================================================
   * TOGGLE EXERCISE
   * ============================================================
   */

  const toggleExercise = (
    exerciseId: string
  ) => {
    setCompletedExercises((current) => {
      if (current.includes(exerciseId)) {
        return current.filter(
          (id) => id !== exerciseId
        );
      }

      return [
        ...current,
        exerciseId,
      ];
    });
  };

  /*
   * ============================================================
   * WEEKLY STATS
   * ============================================================
   */

  const weeklyStats = useMemo(
    () => [
      {
        label: text.workoutsCompleted,
        value: '3',
        icon: CheckCircle2,
        color: '#22C55E',
      },

      {
        label: text.totalMinutes,
        value: '95',
        icon: Clock3,
        color: '#3B82F6',
      },

      {
        label: text.activeDays,
        value: '3',
        icon: CalendarDays,
        color: '#8B5CF6',
      },

      {
        label: text.currentStreak,
        value: '3',
        icon: Flame,
        color: '#F97316',
      },
    ],
    [text]
  );

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              '#171329',
              '#211A3A',
              '#2B2350',
            ]
          : [
              '#F8F7FC',
              '#FFFFFF',
            ]
      }
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ======================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              router.back()
            }
            style={[
              styles.backButton,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(255,255,255,0.08)'
                    : '#FFFFFF',

                borderColor:
                  colors.border,
              },
            ]}
          >
            <ArrowLeft
              size={22}
              strokeWidth={2.4}
              color={colors.text}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.headerText,
              {
                alignItems:
                  isRTL
                    ? 'flex-end'
                    : 'flex-start',
              },
            ]}
          >
            <View
              style={[
                styles.badge,
                {
                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
              <Dumbbell
                size={15}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {text.badge}
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                {
                  color:
                    colors.text,

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {text.title}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {text.subtitle}
            </Text>
          </View>
        </View>

        {/* ======================================================
            TODAY PROGRESS CARD
        ====================================================== */}

        <View
          style={[
            styles.progressCard,
            {
              backgroundColor:
                isDark
                  ? 'rgba(124,58,237,0.18)'
                  : '#F3EFFF',

              borderColor:
                isDark
                  ? 'rgba(124,58,237,0.25)'
                  : '#E9E0FF',
            },
          ]}
        >
          <View
            style={[
              styles.progressTop,
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
                styles.progressIcon,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.09)'
                      : '#FFFFFF',
                },
              ]}
            >
              <Activity
                size={24}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={[
                styles.progressInfo,
                {
                  alignItems:
                    isRTL
                      ? 'flex-end'
                      : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.progressLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {text.todayPlan}
              </Text>

              <Text
                style={[
                  styles.progressValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {progress}%
              </Text>
            </View>

            <View
              style={
                styles.progressPercent
              }
            >
              <Text
                style={[
                  styles.progressPercentText,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {completedCount}/
                {exercises.length}
              </Text>

              <Text
                style={[
                  styles.progressPercentLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {text.exercises}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(255,255,255,0.10)'
                    : '#E5DDF8',
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    `${progress}%`,
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* ======================================================
            MOOD
        ====================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              alignItems:
                isRTL
                  ? 'flex-end'
                  : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.yourMood}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.textSecondary,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.moodSubtitle}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.moodScroll
          }
        >
          {(isRTL
            ? [...moods].reverse()
            : moods
          ).map((mood) => {
            const Icon = mood.icon;

            const selected =
              selectedMood ===
              mood.id;

            return (
              <TouchableOpacity
                key={mood.id}
                activeOpacity={0.8}
                onPress={() =>
                  setSelectedMood(
                    mood.id
                  )
                }
                style={[
                  styles.moodCard,

                  {
                    backgroundColor:
                      selected
                        ? mood.background
                        : isDark
                          ? 'rgba(255,255,255,0.055)'
                          : '#FFFFFF',

                    borderColor:
                      selected
                        ? mood.color
                        : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.moodIcon,
                    {
                      backgroundColor:
                        mood.background,
                    },
                  ]}
                >
                  <Icon
                    size={20}
                    color={
                      mood.color
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.moodText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ======================================================
            TODAY'S WORKOUT
        ====================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 28,
              alignItems:
                isRTL
                  ? 'flex-end'
                  : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.todaysWorkout}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.textSecondary,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.recommendedForYou}
          </Text>
        </View>

        {/* Main workout card */}

        <LinearGradient
          colors={
            isDark
              ? [
                  '#292044',
                  '#332657',
                ]
              : [
                  '#EEE8FF',
                  '#F8F5FF',
                ]
          }
          style={
            styles.workoutHero
          }
        >
          <View
            style={[
              styles.workoutHeroTop,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',
              },
            ]}
          >
            <View
              style={
                styles.workoutHeroIcon
              }
            >
              <Dumbbell
                size={30}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={[
                styles.workoutHeroInfo,
                {
                  alignItems:
                    isRTL
                      ? 'flex-end'
                      : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.workoutHeroTitle,
                  {
                    color:
                      colors.text,
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {isRTL
                  ? 'تمرین ترکیبی امروز'
                  : 'Full Body Session'}
              </Text>

              <Text
                style={[
                  styles.workoutHeroSubtitle,
                  {
                    color:
                      colors.textSecondary,
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {text.strength} •{' '}
                {text.mobility} •{' '}
                {text.cardio}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.workoutMeta,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',
              },
            ]}
          >
            <View
              style={styles.metaItem}
            >
              <Clock3
                size={16}
                color={
                  colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.metaText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                30 {text.duration}
              </Text>
            </View>

            <View
              style={styles.metaItem}
            >
              <Target
                size={16}
                color={
                  colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.metaText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {exercises.length}{' '}
                {text.exercises}
              </Text>
            </View>

            <View
              style={styles.metaItem}
            >
              <Flame
                size={16}
                color="#F97316"
              />

              <Text
                style={[
                  styles.metaText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {isRTL
                  ? 'متوسط'
                  : 'Moderate'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.startButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
            onPress={() => {
              if (
                exercises.length > 0
              ) {
                toggleExercise(
                  exercises[0].id
                );
              }
            }}
          >
            <Play
              size={18}
              color="#FFFFFF"
              fill="#FFFFFF"
            />

            <Text
              style={
                styles.startButtonText
              }
            >
              {completedCount > 0
                ? text.continueWorkout
                : text.startWorkout}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ======================================================
            EXERCISES
        ====================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 28,
              alignItems:
                isRTL
                  ? 'flex-end'
                  : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.exercises}
          </Text>
        </View>

        <View
          style={styles.exerciseList}
        >
          {exercises.map(
            (exercise, index) => {
              const Icon =
                exercise.icon;

              const completed =
                completedExercises.includes(
                  exercise.id
                );

              return (
                <TouchableOpacity
                  key={exercise.id}
                  activeOpacity={0.85}
                  onPress={() =>
                    toggleExercise(
                      exercise.id
                    )
                  }
                  style={[
                    styles.exerciseCard,

                    {
                      backgroundColor:
                        isDark
                          ? 'rgba(255,255,255,0.055)'
                          : '#FFFFFF',

                      borderColor:
                        completed
                          ? '#22C55E'
                          : colors.border,

                      flexDirection:
                        isRTL
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                >
                  {/* Number */}

                  <View
                    style={[
                      styles.exerciseNumber,
                      {
                        backgroundColor:
                          completed
                            ? '#22C55E'
                            : isDark
                              ? 'rgba(255,255,255,0.08)'
                              : '#F5F3FA',
                      },
                    ]}
                  >
                    {completed ? (
                      <Check
                        size={17}
                        color="#FFFFFF"
                        strokeWidth={3}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.exerciseNumberText,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Icon */}

                  <View
                    style={[
                      styles.exerciseIcon,
                      {
                        backgroundColor:
                          exercise.background,

                        marginLeft:
                          isRTL
                            ? 12
                            : 0,

                        marginRight:
                          isRTL
                            ? 0
                            : 12,
                      },
                    ]}
                  >
                    <Icon
                      size={22}
                      color={
                        exercise.color
                      }
                    />
                  </View>

                  {/* Content */}

                  <View
                    style={[
                      styles.exerciseContent,
                      {
                        alignItems:
                          isRTL
                            ? 'flex-end'
                            : 'flex-start',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exerciseTitle,
                        {
                          color:
                            colors.text,

                          textAlign:
                            isRTL
                              ? 'right'
                              : 'left',

                          textDecorationLine:
                            completed
                              ? 'line-through'
                              : 'none',
                        },
                      ]}
                    >
                      {
                        exercise.title
                      }
                    </Text>

                    <Text
                      style={[
                        styles.exerciseSubtitle,
                        {
                          color:
                            colors.textSecondary,

                          textAlign:
                            isRTL
                              ? 'right'
                              : 'left',
                        },
                      ]}
                    >
                      {
                        exercise.subtitle
                      }
                    </Text>
                  </View>

                  {/* Stats */}

                  <View
                    style={[
                      styles.exerciseStats,
                      {
                        alignItems:
                          isRTL
                            ? 'flex-start'
                            : 'flex-end',
                      },
                    ]}
                  >
                    {'reps' in
                      exercise &&
                    exercise.reps ? (
                      <>
                        <Text
                          style={[
                            styles.exerciseStatValue,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            exercise.reps
                          }
                        </Text>

                        <Text
                          style={[
                            styles.exerciseStatLabel,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          {
                            text.reps
                          }
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={[
                            styles.exerciseStatValue,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            exercise.duration
                          }
                        </Text>

                        <Text
                          style={[
                            styles.exerciseStatLabel,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          {' '}
                          {exercise.id ===
                          'balance'
                            ? text.seconds
                            : text.duration}
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* ======================================================
            WEEKLY PLAN
        ====================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 32,
              alignItems:
                isRTL
                  ? 'flex-end'
                  : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color:
                  colors.text,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.weeklyPlan}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.textSecondary,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.weekProgress}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.weekScroll
          }
        >
          {(isRTL
            ? [...weeklyPlan].reverse()
            : weeklyPlan
          ).map((day) => (
            <View
              key={day.id}
              style={[
                styles.dayCard,

                {
                  backgroundColor:
                    day.today
                      ? isDark
                        ? 'rgba(124,58,237,0.18)'
                        : '#F0EAFE'
                      : isDark
                        ? 'rgba(255,255,255,0.055)'
                        : '#FFFFFF',

                  borderColor:
                    day.today
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {day.day}
              </Text>

              <View
                style={[
                  styles.dayCircle,

                  {
                    backgroundColor:
                      day.completed
                        ? '#22C55E'
                        : day.today
                          ? colors.primary
                          : isDark
                            ? 'rgba(255,255,255,0.08)'
                            : '#F3F1F8',
                  },
                ]}
              >
                {day.completed ? (
                  <Check
                    size={18}
                    color="#FFFFFF"
                    strokeWidth={3}
                  />
                ) : (
                  <Text
                    style={[
                      styles.dayLetter,
                      {
                        color:
                          day.today
                            ? '#FFFFFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {day.short}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.dayType,
                  {
                    color:
                      colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {day.type}
              </Text>

              <Text
                style={[
                  styles.dayDuration,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {day.duration}{' '}
                {text.duration}
              </Text>

              {day.today && (
                <View
                  style={[
                    styles.todayBadge,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.todayBadgeText
                    }
                  >
                    {text.todayShort}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* ======================================================
            WEEKLY REPORT
        ====================================================== */}

        <View
          style={[
            styles.reportHeader,
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
              styles.reportTitleContainer,
              {
                alignItems:
                  isRTL
                    ? 'flex-end'
                    : 'flex-start',
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color:
                    colors.text,
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {text.weeklyReport}
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color:
                    colors.textSecondary,
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {text.weekProgress}
            </Text>
          </View>

          <View
            style={[
              styles.reportIcon,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(124,58,237,0.15)'
                    : '#F0EAFE',
              },
            ]}
          >
            <BarChart3
              size={22}
              color={
                colors.primary
              }
            />
          </View>
        </View>

        <View
          style={styles.statsGrid}
        >
          {weeklyStats.map(
            (stat) => {
              const Icon =
                stat.icon;

              return (
                <View
                  key={stat.label}
                  style={[
                    styles.statCard,
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
                      styles.statIcon,
                      {
                        backgroundColor:
                          isDark
                            ? `${stat.color}20`
                            : `${stat.color}14`,
                      },
                    ]}
                  >
                    <Icon
                      size={18}
                      color={
                        stat.color
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.statValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {stat.value}
                  </Text>

                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {stat.label}
                  </Text>
                </View>
              );
            }
          )}
        </View>

        {/* ======================================================
            PERFORMANCE
        ====================================================== */}

        <View
          style={[
            styles.performanceCard,
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
              styles.performanceHeader,
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
                styles.performanceIcon,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(124,58,237,0.15)'
                      : '#F0EAFE',
                },
              ]}
            >
              <Brain
                size={21}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={[
                styles.performanceTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {text.performance}
            </Text>
          </View>

          {/* Body */}

          <View
            style={[
              styles.performanceRow,
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
                styles.performanceLabelContainer,
                {
                  alignItems:
                    isRTL
                      ? 'flex-end'
                      : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.performanceLabel,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {text.bodyPerformance}
              </Text>
            </View>

            <View
              style={[
                styles.performanceBar,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.08)'
                      : '#F1EFF5',
                },
              ]}
            >
              <View
                style={[
                  styles.performanceFill,
                  {
                    width: '72%',
                    backgroundColor:
                      '#22C55E',
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.performanceValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              72%
            </Text>
          </View>

          {/* Mind */}

          <View
            style={[
              styles.performanceRow,
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
                styles.performanceLabelContainer,
                {
                  alignItems:
                    isRTL
                      ? 'flex-end'
                      : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.performanceLabel,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {text.mentalPerformance}
              </Text>
            </View>

            <View
              style={[
                styles.performanceBar,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.08)'
                      : '#F1EFF5',
                },
              ]}
            >
              <View
                style={[
                  styles.performanceFill,
                  {
                    width: '84%',
                    backgroundColor:
                      '#8B5CF6',
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.performanceValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              84%
            </Text>
          </View>
        </View>

        {/* ======================================================
            WEEKLY INSIGHT
        ====================================================== */}

        <View
          style={[
            styles.insightCard,
            {
              backgroundColor:
                isDark
                  ? 'rgba(59,130,246,0.10)'
                  : '#EFF6FF',

              borderColor:
                isDark
                  ? 'rgba(59,130,246,0.20)'
                  : '#DBEAFE',
            },
          ]}
        >
          <View
            style={[
              styles.insightTop,
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
                styles.insightIcon,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(59,130,246,0.18)'
                      : '#DBEAFE',
                },
              ]}
            >
              <Sparkles
                size={19}
                color="#3B82F6"
              />
            </View>

            <Text
              style={[
                styles.insightTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {text.weeklyInsight}
            </Text>
          </View>

          <Text
            style={[
              styles.insightText,
              {
                color:
                  colors.textSecondary,

                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.weeklyInsightText}
          </Text>
        </View>

        {/* ======================================================
            SAFETY / LOW ENERGY NOTE
        ====================================================== */}

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor:
                isDark
                  ? 'rgba(245,158,11,0.08)'
                  : '#FFFBEB',

              borderColor:
                isDark
                  ? 'rgba(245,158,11,0.18)'
                  : '#FDE68A',
            },
          ]}
        >
          <HeartPulse
            size={18}
            color="#F59E0B"
          />

          <Text
            style={[
              styles.noteText,
              {
                color:
                  colors.textSecondary,

                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
              },
            ]}
          >
            {text.noPressure}
          </Text>
        </View>

        <Text
          style={[
            styles.safeTraining,
            {
              color:
                colors.textTertiary,

              textAlign:
                isRTL
                  ? 'right'
                  : 'left',
            },
          ]}
        >
          {text.safeTraining}
        </Text>

        <View
          style={styles.bottomSpace}
        />

      </ScrollView>
    </LinearGradient>
  );
}

/*
 * ================================================================
 * STYLES
 * ================================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /*
   * HEADER
   */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  badge: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  title: {
    fontSize: 31,
    fontWeight: '900',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },

  /*
   * PROGRESS
   */

  progressCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 26,
  },

  progressTop: {
    alignItems: 'center',
  },

  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressInfo: {
    flex: 1,
    marginHorizontal: 12,
  },

  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  progressValue: {
    fontSize: 25,
    fontWeight: '900',
    marginTop: 2,
  },

  progressPercent: {
    alignItems: 'flex-end',
  },

  progressPercentText: {
    fontSize: 15,
    fontWeight: '800',
  },

  progressPercentLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  progressTrack: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  /*
   * SECTION
   */

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 19,
  },

  /*
   * MOOD
   */

  moodScroll: {
    gap: 10,
    paddingBottom: 4,
  },

  moodCard: {
    width: 82,
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  moodIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  moodText: {
    fontSize: 11,
    fontWeight: '700',
  },

  /*
   * WORKOUT HERO
   */

  workoutHero: {
    borderRadius: 26,
    padding: 19,
    overflow: 'hidden',
  },

  workoutHeroTop: {
    alignItems: 'center',
  },

  workoutHeroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor:
      'rgba(124,58,237,0.13)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  workoutHeroInfo: {
    flex: 1,
    marginHorizontal: 13,
  },

  workoutHeroTitle: {
    fontSize: 19,
    fontWeight: '900',
  },

  workoutHeroSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },

  workoutMeta: {
    gap: 15,
    marginTop: 19,
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  metaText: {
    fontSize: 11,
    fontWeight: '600',
  },

  startButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 19,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /*
   * EXERCISES
   */

  exerciseList: {
    gap: 10,
  },

  exerciseCard: {
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },

  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exerciseNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },

  exerciseIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exerciseContent: {
    flex: 1,
  },

  exerciseTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  exerciseSubtitle: {
    fontSize: 10,
    marginTop: 3,
  },

  exerciseStats: {
    minWidth: 45,
  },

  exerciseStatValue: {
    fontSize: 16,
    fontWeight: '900',
  },

  exerciseStatLabel: {
    fontSize: 9,
    marginTop: 1,
  },

  /*
   * WEEK
   */

  weekScroll: {
    gap: 9,
    paddingBottom: 5,
  },

  dayCard: {
    width: 92,
    minHeight: 142,
    borderRadius: 19,
    borderWidth: 1,
    padding: 11,
    alignItems: 'center',
  },

  dayName: {
    fontSize: 9,
    fontWeight: '700',
  },

  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },

  dayLetter: {
    fontSize: 14,
    fontWeight: '900',
  },

  dayType: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },

  dayDuration: {
    fontSize: 9,
    marginTop: 4,
  },

  todayBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 6,
  },

  todayBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },

  /*
   * REPORT
   */

  reportHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 12,
  },

  reportTitleContainer: {
    flex: 1,
  },

  reportIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  statCard: {
    width: '48%',
    minHeight: 122,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },

  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 9,
  },

  statLabel: {
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  /*
   * PERFORMANCE
   */

  performanceCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
    marginTop: 12,
  },

  performanceHeader: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 17,
  },

  performanceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  performanceTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  performanceRow: {
    alignItems: 'center',
    gap: 9,
    marginTop: 12,
  },

  performanceLabelContainer: {
    width: 82,
  },

  performanceLabel: {
    fontSize: 10,
    fontWeight: '700',
  },

  performanceBar: {
    flex: 1,
    height: 7,
    borderRadius: 7,
    overflow: 'hidden',
  },

  performanceFill: {
    height: '100%',
    borderRadius: 7,
  },

  performanceValue: {
    width: 35,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'right',
  },

  /*
   * INSIGHT
   */

  insightCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
    marginTop: 12,
  },

  insightTop: {
    alignItems: 'center',
    gap: 10,
  },

  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },

  insightText: {
    fontSize: 12,
    lineHeight: 21,
    marginTop: 12,
  },

  /*
   * NOTE
   */

  noteCard: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 13,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  noteText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 17,
  },

  safeTraining: {
    fontSize: 9,
    lineHeight: 15,
    marginTop: 10,
  },

  bottomSpace: {
    height: 20,
  },
});