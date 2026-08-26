import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
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
  PlayCircle,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Dumbbell,
  Footprints,
  PersonStanding,
  Wind,
  Target,
  BarChart3,
  CalendarDays,
  Sparkles,
  X,
  ImageOff,
} from 'lucide-react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

type ExerciseMediaType = 'image' | 'gif';

interface ExerciseMediaItem {
  type: ExerciseMediaType;
  source: any;
}

const EXERCISE_MEDIA: Partial<Record<string, ExerciseMediaItem>> = {
  warmup: {
    type: 'image',
    source: require('../../assets/exercises/three.png'),
  },
  squat: {
    type: 'image',
    source: require('../../assets/exercises/one.png'),
  },
  walk: {
    type: 'image',
    source: require('../../assets/exercises/two.png'),
  },
  balance: {
    type: 'image',
    source: require('../../assets/exercises/four.png'),
  },
  cooldown: {
    type: 'image',
    source: require('../../assets/exercises/three.png'),
  },
};

type Category = 'mobility' | 'strength' | 'cardio' | 'balance' | 'recovery';

interface Exercise {
  id: string;
  title: string;
  category: Category;
  duration?: number;
  unit?: 'min' | 'sec';
  reps?: number;
  sets?: number;
  icon: any;
  instructions: string[];
}

export default function SportsScreen() {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const { colors, isDark } = useTheme();

  const [selectedMood, setSelectedMood] = useState('good');
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const CATEGORY_ACCENTS: Record<Category, string> = {
    mobility: colors.primaryLight || colors.primary,
    strength: colors.primary,
    cardio: colors.success || colors.primary,
    balance: colors.primaryDark || colors.primary,
    recovery: colors.primaryDark || colors.primary,
  };

  const TEXTS = {
    fa: {
      back: 'بازگشت',
      badge: 'Brain × Body × Performance',
      title: 'ورزش',
      subtitle: 'برنامه روزانه‌ای برای تقویت بدن، ذهن و انرژی شما',
      today: 'امروز',
      todayPlan: 'برنامه امروز',
      completed: 'تکمیل شده',
      remaining: 'باقی مانده',
      yourMood: 'حال امروزت چطوره؟',
      moodSubtitle: 'برنامه امروز با وضعیت فعلی شما هماهنگ می‌شود',
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
      weeklyInsightText: 'این هفته تمرکز برنامه روی حفظ انرژی، حرکت منظم و ایجاد تعادل بین عملکرد ذهنی و بدنی است.',
      performance: 'عملکرد',
      bodyPerformance: 'عملکرد بدنی',
      mentalPerformance: 'عملکرد ذهنی',
      viewReport: 'مشاهده گزارش کامل',
      start: 'شروع',
      done: 'انجام شد',
      noPressure: 'اگر امروز انرژی کمتری داری، شدت تمرین را کاهش بده.',
      safeTraining: 'حرکات را با فرم مناسب و در محدوده توانایی خود انجام دهید.',
      filterAll: 'همه',
      tapToViewDemo: 'برای مشاهده مدل حرکت لمس کنید',
      howToPerform: 'روش انجام حرکت',
      markDone: 'علامت به‌عنوان انجام‌شده',
      markUndone: 'حذف علامت انجام‌شده',
      noMediaTitle: 'مدل این حرکت هنوز اضافه نشده',
      noMediaSubtitle: 'یک تصویر یا GIF برای این حرکت در EXERCISE_MEDIA اضافه کنید.',
      close: 'بستن',
      moderate: 'متوسط',
    },
    en: {
      back: 'Back',
      badge: 'Brain × Body × Performance',
      title: 'Sports',
      subtitle: 'A daily plan to improve your body, mind and energy',
      today: 'Today',
      todayPlan: "Today's Plan",
      completed: 'Completed',
      remaining: 'Remaining',
      yourMood: 'How are you feeling today?',
      moodSubtitle: 'Your daily plan adapts to your current state',
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
      weeklyInsightText: 'This week focuses on maintaining energy, consistent movement and balancing mental and physical performance.',
      performance: 'Performance',
      bodyPerformance: 'Body Performance',
      mentalPerformance: 'Mental Performance',
      viewReport: 'View Full Report',
      start: 'Start',
      done: 'Done',
      noPressure: 'If your energy is lower today, reduce the workout intensity.',
      safeTraining: 'Perform movements with proper form and within your ability.',
      filterAll: 'All',
      tapToViewDemo: 'Tap to view the exercise demo',
      howToPerform: 'How to perform',
      markDone: 'Mark as done',
      markUndone: 'Mark as not done',
      noMediaTitle: 'No demo added yet',
      noMediaSubtitle: 'Add an image or GIF for this exercise in EXERCISE_MEDIA.',
      close: 'Close',
      moderate: 'Moderate',
    },
  };

  const text = isRTL ? TEXTS.fa : TEXTS.en;

  const moods = [
    { id: 'great', label: text.great, icon: Sparkles },
    { id: 'good', label: text.good, icon: Zap },
    { id: 'normal', label: text.normal, icon: Activity },
    { id: 'tired', label: text.tired, icon: Wind },
    { id: 'stressed', label: text.stressed, icon: HeartPulse },
  ];

  const exercises: Exercise[] = [
    {
      id: 'warmup',
      title: text.warmup,
      category: 'mobility',
      duration: 5,
      unit: 'min',
      icon: Wind,
      instructions: isRTL
        ? [
            'چند دقیقه در جا راه بروید تا ضربان قلب بالا بیاید.',
            'شانه‌ها و بازوها را به آرامی بچرخانید.',
            'مچ پا و زانو را با حرکات دایره‌ای باز کنید.',
          ]
        : [
            'March in place for a minute to raise your heart rate.',
            'Roll your shoulders and arms gently.',
            'Open up your ankles and knees with slow circles.',
          ],
    },
    {
      id: 'squat',
      title: isRTL ? 'اسکوات' : 'Bodyweight Squat',
      category: 'strength',
      reps: 12,
      sets: 3,
      icon: PersonStanding,
      instructions: isRTL
        ? [
            'پاها را به عرض شانه باز کنید و نوک پا کمی رو به بیرون.',
            'کمر را صاف نگه دارید و باسن را به عقب و پایین ببرید.',
            'زانوها را تا حدود ۹۰ درجه خم کنید.',
            'با فشار پاشنه‌ها به حالت ایستاده برگردید.',
          ]
        : [
            'Stand with feet shoulder-width apart, toes slightly out.',
            'Keep your back flat and push your hips back and down.',
            'Bend your knees to about 90 degrees.',
            'Drive through your heels to stand back up.',
          ],
    },
    {
      id: 'walk',
      title: isRTL ? 'راه رفتن سریع' : 'Brisk Walk',
      category: 'cardio',
      duration: 10,
      unit: 'min',
      icon: Footprints,
      instructions: isRTL
        ? [
            'با سرعتی راه بروید که کمی نفس‌تان بند بیاید ولی بتوانید صحبت کنید.',
            'بازوها را همراه با قدم‌ها تاب دهید.',
            'ستون فقرات را صاف و نگاه رو به جلو نگه دارید.',
          ]
        : [
            'Walk fast enough to breathe harder but still talk.',
            'Swing your arms naturally with each step.',
            'Keep your spine tall and eyes forward.',
          ],
    },
    {
      id: 'balance',
      title: isRTL ? 'تمرین تعادل' : 'Balance Hold',
      category: 'balance',
      duration: 60,
      unit: 'sec',
      icon: Target,
      instructions: isRTL
        ? [
            'روی یک پا بایستید و زانوی پای دیگر را کمی بالا بیاورید.',
            'نگاه را به یک نقطه ثابت بدوزید.',
            'در صورت نیاز برای تعادل به یک دیوار یا صندلی تکیه کنید.',
          ]
        : [
            'Stand on one leg, lifting the other knee slightly.',
            'Fix your gaze on one point to help your balance.',
            'Hold a wall or chair lightly if you need support.',
          ],
    },
    {
      id: 'cooldown',
      title: text.cooldown,
      category: 'recovery',
      duration: 5,
      unit: 'min',
      icon: Wind,
      instructions: isRTL
        ? [
            'نفس‌های عمیق بکشید تا ضربان قلب پایین بیاید.',
            'عضلات ران، ساق و کمر را به آرامی کش دهید.',
            'هر کشش را حدود ۲۰ ثانیه بدون فشار زیاد نگه دارید.',
          ]
        : [
            'Take slow, deep breaths to bring your heart rate down.',
            'Gently stretch your legs, calves and lower back.',
            'Hold each stretch for about 20 seconds.',
          ],
    },
  ];

  const categoryFilters: { id: 'all' | Category; label: string }[] = [
    { id: 'all', label: text.filterAll },
    { id: 'strength', label: text.strength },
    { id: 'cardio', label: text.cardio },
    { id: 'mobility', label: text.mobility },
    { id: 'balance', label: text.balance },
    { id: 'recovery', label: text.recovery },
  ];

  const filteredExercises =
    selectedCategory === 'all'
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  const weeklyPlan = [
    { id: 'mon', day: text.monday, short: isRTL ? 'د' : 'M', type: text.strength, duration: 25, completed: true },
    { id: 'tue', day: text.tuesday, short: isRTL ? 'س' : 'T', type: text.cardio, duration: 30, completed: true },
    { id: 'wed', day: text.wednesday, short: isRTL ? 'چ' : 'W', type: text.mobility, duration: 20, completed: true },
    { id: 'thu', day: text.thursday, short: isRTL ? 'پ' : 'T', type: text.strength, duration: 30, completed: false, today: true },
    { id: 'fri', day: text.friday, short: isRTL ? 'ج' : 'F', type: text.cardio, duration: 25, completed: false },
    { id: 'sat', day: text.saturday, short: isRTL ? 'ش' : 'S', type: text.balance, duration: 20, completed: false },
    { id: 'sun', day: text.sunday, short: isRTL ? 'ی' : 'S', type: text.recovery, duration: 15, completed: false },
  ];

  const completedCount = completedExercises.length;
  const progress = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

  const weeklyStats = useMemo(
    () => [
      { label: text.workoutsCompleted, value: '3', icon: CheckCircle2 },
      { label: text.totalMinutes, value: '95', icon: Clock3 },
      { label: text.activeDays, value: '3', icon: CalendarDays },
      { label: text.currentStreak, value: '3', icon: Flame },
    ],
    [text]
  );

  const toggleExercise = (id: string) => {
    setCompletedExercises((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const activeExercise = exercises.find((exercise) => exercise.id === activeExerciseId) || null;
  const activeMedia = activeExerciseId ? EXERCISE_MEDIA[activeExerciseId] : undefined;
  const activeAccent = activeExercise ? CATEGORY_ACCENTS[activeExercise.category] : colors.primary;
  const activeCompleted = activeExerciseId ? completedExercises.includes(activeExerciseId) : false;

  const statValueFor = (exercise: Exercise) => {
    return exercise.reps ?? exercise.duration ?? 0;
  };

  const statLabelFor = (exercise: Exercise) => {
    if (exercise.reps) {
      return text.reps;
    }
    return exercise.unit === 'sec' ? text.seconds : text.duration;
  };

  const renderThumb = (exercise: Exercise) => {
    const media = EXERCISE_MEDIA[exercise.id];
    const Icon = exercise.icon;
    const accent = CATEGORY_ACCENTS[exercise.category];

    if (media) {
      return <Image source={media.source} style={styles.exerciseThumbImage} resizeMode="contain" />;
    }

    return (
      <View style={[styles.exerciseThumbFallback, { backgroundColor: `${accent}18` }]}>
        <Icon size={25} color={accent} />
        <ImageOff size={11} color={colors.textTertiary || colors.textSecondary} style={styles.missingIcon} />
      </View>
    );
  };

  const renderModalMedia = () => {
    if (!activeMedia) {
      const Icon = activeExercise ? activeExercise.icon : ImageOff;
      return (
        <View style={[styles.modalFallback, { backgroundColor: `${activeAccent}12` }]}>
          <Icon size={42} color={activeAccent} />
          <Text style={[styles.modalFallbackTitle, { color: colors.text }]}>{text.noMediaTitle}</Text>
          <Text style={[styles.modalFallbackText, { color: colors.textSecondary }]}>{text.noMediaSubtitle}</Text>
        </View>
      );
    }

    return <Image source={activeMedia.source} style={styles.modalImage} resizeMode="contain" />;
  };

  const gradientColors: readonly [string, string] = isDark
    ? [colors.primary, colors.primaryDark || colors.primary] as const
    : [colors.primary, colors.primaryLight || colors.primary] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { flexDirection: 'row' }]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.headerContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <View
              style={[
                styles.athleteBadge,
                {
                  backgroundColor: `${colors.primary}18`,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>{text.badge}</Text>
            </View>

            <Text style={[styles.title, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {text.title}
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {text.subtitle}
            </Text>
          </View>
        </View>

        <View style={[styles.todayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.todayTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.todayIcon, { backgroundColor: `${colors.primary}18` }]}>
              <Activity size={23} color={colors.primary} />
            </View>
            <View style={[styles.todayInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.todayLabel, { color: colors.textSecondary }]}>{text.todayPlan}</Text>
              <Text style={[styles.todayValue, { color: colors.text }]}>
                {completedCount} / {exercises.length} {text.exercises}
              </Text>
            </View>
            <Text style={[styles.todayPercent, { color: colors.primary }]}>{progress}%</Text>
          </View>

          <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={[styles.progressFill, { width: `${Math.max(progress, 2)}%`, backgroundColor: colors.primary }]} />
          </View>

          <View style={[styles.todayBottom, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.smallText, { color: colors.textSecondary }]}>
              {text.completed}: {completedCount}
            </Text>
            <Text style={[styles.smallText, { color: colors.textSecondary }]}>
              {text.remaining}: {exercises.length - completedCount}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.yourMood}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.moodSubtitle}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodScroll}
        >
          {(isRTL ? [...moods].reverse() : moods).map((mood) => {
            const Icon = mood.icon;
            const selected = selectedMood === mood.id;
            return (
              <TouchableOpacity
                key={mood.id}
                activeOpacity={0.8}
                onPress={() => setSelectedMood(mood.id)}
                style={[
                  styles.moodCard,
                  {
                    backgroundColor: selected ? `${colors.primary}18` : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.moodIcon,
                    {
                      backgroundColor: selected ? colors.primary : colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Icon size={19} color={selected ? colors.background : colors.primary} strokeWidth={selected ? 2.5 : 2} />
                </View>
                <Text style={[styles.moodText, { color: selected ? colors.primary : colors.text }]}>{mood.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.sectionHeader, { marginTop: 30, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.todaysWorkout}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.recommendedForYou}
          </Text>
        </View>

        <LinearGradient
          colors={[colors.surfaceSecondary, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.workoutHero, { borderColor: colors.border }]}
        >
          <View style={[styles.workoutHeroGlow, { backgroundColor: `${colors.primary}18` }]} />
          <View style={[styles.workoutHeroTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.workoutHeroIcon, { backgroundColor: colors.primary }]}>
              <Dumbbell size={27} color={colors.background} />
            </View>
            <View style={[styles.workoutHeroInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.workoutHeroTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'تمرین ترکیبی امروز' : 'Full Body Session'}
              </Text>
              <Text style={[styles.workoutHeroSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {text.strength} • {text.mobility} • {text.cardio}
              </Text>
            </View>
          </View>

          <View style={[styles.workoutMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.metaItem}>
              <Clock3 size={15} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>30 {text.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={15} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {exercises.length} {text.exercises}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Activity size={15} color={colors.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{text.moderate}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              if (exercises.length) {
                setActiveExerciseId(exercises[0].id);
              }
            }}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButton}
            >
              <Play size={17} color={colors.background} fill={colors.background} />
              <Text style={[styles.startButtonText, { color: colors.background }]}>
                {completedCount > 0 ? text.continueWorkout : text.startWorkout}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <View style={[styles.sectionHeader, { marginTop: 30, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.exercises}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(isRTL ? [...categoryFilters].reverse() : categoryFilters).map((filter) => {
            const active = selectedCategory === filter.id;
            const accent = filter.id === 'all' ? colors.primary : CATEGORY_ACCENTS[filter.id as Category];
            return (
              <TouchableOpacity
                key={filter.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(filter.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? accent : colors.surface,
                    borderColor: active ? accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? colors.background : colors.textSecondary }]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.exerciseList}>
          {filteredExercises.map((exercise, index) => {
            const completed = completedExercises.includes(exercise.id);
            const accent = CATEGORY_ACCENTS[exercise.category];
            const hasMedia = !!EXERCISE_MEDIA[exercise.id];

            return (
              <View
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: completed ? `${colors.primary}0B` : colors.surface,
                    borderColor: completed ? accent : colors.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => toggleExercise(exercise.id)}
                  style={[
                    styles.exerciseNumber,
                    {
                      backgroundColor: completed ? accent : colors.surfaceSecondary,
                    },
                  ]}
                >
                  {completed ? (
                    <Check size={16} color={colors.background} strokeWidth={3} />
                  ) : (
                    <Text style={[styles.exerciseNumberText, { color: colors.textSecondary }]}>{index + 1}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => setActiveExerciseId(exercise.id)}
                  style={[styles.exerciseTapArea, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <View style={[styles.exerciseThumb, { backgroundColor: colors.surfaceSecondary }]}>
                    {renderThumb(exercise)}
                    <View
                      style={[
                        styles.playBadge,
                        { backgroundColor: accent },
                        isRTL ? { left: -3 } : { right: -3 },
                      ]}
                    >
                      <PlayCircle size={14} color={colors.background} fill={hasMedia ? colors.background : 'transparent'} />
                    </View>
                  </View>

                  <View style={[styles.exerciseContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.exerciseTitle,
                        {
                          color: colors.text,
                          textAlign: isRTL ? 'right' : 'left',
                          textDecorationLine: completed ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {exercise.title}
                    </Text>
                    <View style={[styles.categoryBadgeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.categoryDot, { backgroundColor: accent }]} />
                      <Text style={[styles.exerciseSubtitle, { color: colors.textSecondary }]}>
                        {text[exercise.category]}
                      </Text>
                      {exercise.sets ? (
                        <Text style={[styles.exerciseSubtitle, { color: colors.textTertiary || colors.textSecondary }]}>
                          {' '}
                          • {exercise.sets} {text.sets}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.demoHint, { color: colors.textTertiary || colors.textSecondary }]}>
                      {text.tapToViewDemo}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={[styles.exerciseStats, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                  <Text style={[styles.exerciseStatValue, { color: colors.text }]}>{statValueFor(exercise)}</Text>
                  <Text style={[styles.exerciseStatLabel, { color: colors.textSecondary }]}>{statLabelFor(exercise)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={[styles.sectionHeader, { marginTop: 32, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.weeklyPlan}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.weekProgress}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekScroll}
        >
          {(isRTL ? [...weeklyPlan].reverse() : weeklyPlan).map((day) => (
            <View
              key={day.id}
              style={[
                styles.dayCard,
                {
                  backgroundColor: day.today ? `${colors.primary}18` : colors.surface,
                  borderColor: day.today ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.dayName, { color: colors.textSecondary }]}>{day.day}</Text>
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: day.completed || day.today ? colors.primary : colors.surfaceSecondary,
                  },
                ]}
              >
                {day.completed ? (
                  <Check size={17} color={colors.background} strokeWidth={3} />
                ) : (
                  <Text style={[styles.dayLetter, { color: day.today ? colors.background : colors.textSecondary }]}>
                    {day.short}
                  </Text>
                )}
              </View>
              <Text style={[styles.dayType, { color: colors.text }]} numberOfLines={1}>
                {day.type}
              </Text>
              <Text style={[styles.dayDuration, { color: colors.textSecondary }]}>
                {day.duration} {text.duration}
              </Text>
              {day.today && (
                <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.todayBadgeText, { color: colors.background }]}>{text.todayShort}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={[styles.reportHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.reportTitleContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{text.weeklyReport}</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{text.weekProgress}</Text>
          </View>
          <View style={[styles.reportIcon, { backgroundColor: `${colors.primary}18` }]}>
            <BarChart3 size={21} color={colors.primary} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {weeklyStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.statIcon, { backgroundColor: `${colors.primary}18` }]}>
                  <Icon size={17} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={2}>
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.performanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.performanceHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.performanceIcon, { backgroundColor: `${colors.primary}18` }]}>
              <Brain size={20} color={colors.primary} />
            </View>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>{text.performance}</Text>
          </View>
          <View style={[styles.performanceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.performanceLabel, { color: colors.text }]}>{text.bodyPerformance}</Text>
            <View style={[styles.performanceBar, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.performanceFill, { width: '72%', backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.performanceValue, { color: colors.primary }]}>72%</Text>
          </View>
          <View style={[styles.performanceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.performanceLabel, { color: colors.text }]}>{text.mentalPerformance}</Text>
            <View style={[styles.performanceBar, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={[styles.performanceFill, { width: '84%', backgroundColor: colors.primaryLight || colors.primary }]} />
            </View>
            <Text style={[styles.performanceValue, { color: colors.primary }]}>84%</Text>
          </View>
        </View>

        <View style={[styles.insightCard, { backgroundColor: `${colors.primary}18`, borderColor: colors.border }]}>
          <View style={[styles.insightTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.insightIcon, { backgroundColor: colors.primary }]}>
              <Sparkles size={17} color={colors.background} />
            </View>
            <Text style={[styles.insightTitle, { color: colors.primary }]}>{text.weeklyInsight}</Text>
          </View>
          <Text style={[styles.insightText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.weeklyInsightText}
          </Text>
        </View>

        <View style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.noteIcon, { backgroundColor: `${colors.primary}18` }]}>
            <HeartPulse size={17} color={colors.primary} />
          </View>
          <Text style={[styles.noteText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.noPressure}
          </Text>
        </View>

        <Text style={[styles.safeTraining, { color: colors.textTertiary || colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
          {text.safeTraining}
        </Text>
        <View style={styles.bottomSpace} />
      </ScrollView>

      <Modal
        visible={!!activeExercise}
        animationType="slide"
        transparent
        onRequestClose={() => setActiveExerciseId(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.78)' }]}>
          {activeExercise && (
            <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.modalTitleContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.modalTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                    {activeExercise.title}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {text.howToPerform}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => setActiveExerciseId(null)}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
                >
                  <X size={19} color={colors.text} />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.modalMediaContainer,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                {renderModalMedia()}
              </View>

              <View style={[styles.modalMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.modalMetaItem, { backgroundColor: `${colors.primary}18` }]}>
                  <Clock3 size={14} color={colors.primary} />
                  <Text style={[styles.modalMetaText, { color: colors.textSecondary }]}>
                    {statValueFor(activeExercise)} {statLabelFor(activeExercise)}
                  </Text>
                </View>
                {activeExercise.sets ? (
                  <View style={[styles.modalMetaItem, { backgroundColor: `${colors.primary}18` }]}>
                    <Flame size={14} color={colors.primary} />
                    <Text style={[styles.modalMetaText, { color: colors.textSecondary }]}>
                      {activeExercise.sets} {text.sets}
                    </Text>
                  </View>
                ) : null}
              </View>

              <ScrollView style={styles.instructionsScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.instructions}>
                  {activeExercise.instructions.map((instruction, index) => (
                    <View key={index} style={[styles.instructionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.instructionNumber, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.instructionNumberText, { color: colors.background }]}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.instructionText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {instruction}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  toggleExercise(activeExercise.id);
                  setActiveExerciseId(null);
                }}
              >
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalAction}
                >
                  <Check size={18} color={colors.background} />
                  <Text style={[styles.modalActionText, { color: colors.background }]}>
                    {activeCompleted ? text.markUndone : text.markDone}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 58 : 44,
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    gap: 13,
    marginBottom: 22,
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  athleteBadge: {
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    height: 31,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  todayCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 26,
  },
  todayTop: {
    alignItems: 'center',
  },
  todayIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInfo: {
    flex: 1,
    marginHorizontal: 11,
  },
  todayLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  todayValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
  },
  todayPercent: {
    fontSize: 17,
    fontWeight: '900',
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 15,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  todayBottom: {
    justifyContent: 'space-between',
    marginTop: 9,
  },
  smallText: {
    fontSize: 9,
  },
  sectionHeader: {
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 4,
    lineHeight: 17,
  },
  moodScroll: {
    gap: 9,
    paddingBottom: 3,
  },
  moodCard: {
    width: 79,
    height: 80,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  moodIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodText: {
    fontSize: 10,
    fontWeight: '700',
  },
  workoutHero: {
    borderRadius: 25,
    borderWidth: 1,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  workoutHeroGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -90,
    top: -85,
    opacity: 0.5,
  },
  workoutHeroTop: {
    alignItems: 'center',
  },
  workoutHeroIcon: {
    width: 53,
    height: 53,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutHeroInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  workoutHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  workoutHeroSubtitle: {
    fontSize: 10,
    marginTop: 5,
  },
  workoutMeta: {
    alignItems: 'center',
    gap: 15,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '600',
  },
  startButton: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '800',
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    minHeight: 91,
    borderRadius: 20,
    borderWidth: 1,
    padding: 9,
    alignItems: 'center',
    overflow: 'hidden',
  },
  exerciseNumber: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    fontSize: 10,
    fontWeight: '800',
  },
  exerciseTapArea: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  exerciseThumb: {
    width: 65,
    height: 65,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    position: 'relative',
  },
  exerciseThumbImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  exerciseThumbFallback: {
    width: '100%',
    height: '100%',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
  },
  playBadge: {
    position: 'absolute',
    bottom: -3,
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  exerciseContent: {
    flex: 1,
    minWidth: 0,
  },
  exerciseTitle: {
    width: '100%',
    fontSize: 13,
    fontWeight: '800',
  },
  categoryBadgeRow: {
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  exerciseSubtitle: {
    fontSize: 9,
  },
  demoHint: {
    fontSize: 8,
    marginTop: 6,
  },
  exerciseStats: {
    width: 40,
  },
  exerciseStatValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  exerciseStatLabel: {
    fontSize: 8,
    marginTop: 2,
  },
  weekScroll: {
    gap: 9,
    paddingBottom: 4,
  },
  dayCard: {
    width: 88,
    minHeight: 138,
    borderRadius: 18,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 8,
    fontWeight: '700',
  },
  dayCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  dayLetter: {
    fontSize: 13,
    fontWeight: '800',
  },
  dayType: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },
  dayDuration: {
    fontSize: 8,
    marginTop: 3,
  },
  todayBadge: {
    paddingHorizontal: 7,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  todayBadgeText: {
    fontSize: 7,
    fontWeight: '900',
  },
  reportHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 13,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statCard: {
    width: '48%',
    minHeight: 115,
    borderRadius: 19,
    borderWidth: 1,
    padding: 13,
    justifyContent: 'space-between',
  },
  statIcon: {
    width: 33,
    height: 33,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 7,
  },
  statLabel: {
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },
  performanceCard: {
    borderRadius: 21,
    borderWidth: 1,
    padding: 15,
    marginTop: 12,
  },
  performanceHeader: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 17,
  },
  performanceIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  performanceRow: {
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  performanceLabel: {
    width: 82,
    fontSize: 9,
    fontWeight: '700',
  },
  performanceBar: {
    flex: 1,
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  performanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  performanceValue: {
    width: 34,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'right',
  },
  insightCard: {
    borderRadius: 21,
    borderWidth: 1,
    padding: 15,
    marginTop: 12,
  },
  insightTop: {
    alignItems: 'center',
    gap: 9,
  },
  insightIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  insightText: {
    fontSize: 10,
    lineHeight: 17,
    marginTop: 10,
  },
  noteCard: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    padding: 12,
    marginTop: 12,
    gap: 9,
  },
  noteIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 15,
  },
  safeTraining: {
    fontSize: 8,
    lineHeight: 14,
    marginTop: 10,
  },
  bottomSpace: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 0,
  },
  modalCard: {
    width: '100%',
    maxHeight: '91%',
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 28,
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  modalSubtitle: {
    fontSize: 10,
    marginTop: 4,
  },
  closeButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modalMediaContainer: {
    height: 280,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '90%',
    height: '90%',
    transform: [{ translateY: 9 }],
  },
  modalFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  modalFallbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 11,
    textAlign: 'center',
  },
  modalFallbackText: {
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  modalMeta: {
    gap: 8,
    marginTop: 12,
  },
  modalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    height: 31,
    borderRadius: 15,
  },
  modalMetaText: {
    fontSize: 9,
    fontWeight: '700',
  },
  instructionsScroll: {
    maxHeight: 190,
    marginTop: 14,
  },
  instructions: {
    gap: 12,
    paddingBottom: 4,
  },
  instructionRow: {
    alignItems: 'flex-start',
    gap: 9,
  },
  instructionNumber: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 10,
    fontWeight: '900',
  },
  instructionText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 17,
    paddingTop: 3,
  },
  modalAction: {
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  modalActionText: {
    fontSize: 11,
    fontWeight: '900',
  },
});