import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
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
  ListOrdered,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

/* ================================================================
   EXERCISE MEDIA
   ================================================================
   Drop your own reference images / GIFs / videos in here — one
   entry per exercise `id` (see the `exercises` array further down).
   Anything you leave commented out (or simply omit) will fall back
   to a clean icon placeholder in the UI, so the screen never breaks
   while you're still collecting assets.

   type: 'image' | 'gif'  -> both rendered with <Image> — React
                             Native's Image component plays animated
                             GIFs natively, no extra package needed.

   (Want video demos later? That needs the `expo-av` package —
   run `npx expo install expo-av` and ask to have video support
   added back in.)

   Example, once you have the files under assets/exercises/:

   const EXERCISE_MEDIA: Partial<Record<string, ExerciseMediaItem>> = {
     squat: { type: 'gif', source: require('../../assets/exercises/squat.gif') },
     walk: { type: 'image', source: require('../../assets/exercises/walk.jpg') },
   };
================================================================ */

type ExerciseMediaType = 'image' | 'gif';

interface ExerciseMediaItem {
  type: ExerciseMediaType;
  source: any;
}

const EXERCISE_MEDIA: Partial<Record<string, ExerciseMediaItem>> = {
  // warmup: { type: 'gif', source: require('../../assets/exercises/warmup.gif') },
  // squat: { type: 'gif', source: require('../../assets/exercises/squat.gif') },
  // walk: { type: 'gif', source: require('../../assets/exercises/walk.gif') },
  // balance: { type: 'image', source: require('../../assets/exercises/balance.jpg') },
  // cooldown: { type: 'gif', source: require('../../assets/exercises/cooldown.gif') },
};

/* ================================================================
   COLOR SYSTEM
   ================================================================ */

const PALETTE = {
  light: {
    pageStart: '#F8F7FC',
    pageEnd: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSoft: '#F7F5FB',
    surfaceMuted: '#F2F0F7',
    primary: '#7C3AED',
    primaryStrong: '#6D28D9',
    primarySoft: '#F0EAFE',
    primaryFaint: '#F7F4FD',
    text: '#211C2B',
    textSecondary: '#746D80',
    textTertiary: '#9A93A4',
    border: '#E9E4F0',
    track: '#EDE9F2',
    overlay: 'rgba(20,16,28,0.55)',
  },
  dark: {
    pageStart: '#15121C',
    pageEnd: '#1B1724',
    surface: '#211C2A',
    surfaceSoft: '#251F30',
    surfaceMuted: '#2B2535',
    primary: '#A78BFA',
    primaryStrong: '#8B5CF6',
    primarySoft: 'rgba(167,139,250,0.14)',
    primaryFaint: 'rgba(167,139,250,0.07)',
    text: '#F7F4FA',
    textSecondary: '#B5ADBF',
    textTertiary: '#817889',
    border: 'rgba(255,255,255,0.075)',
    track: 'rgba(255,255,255,0.085)',
    overlay: 'rgba(5,4,8,0.72)',
  },
};

// Per-category accent colors — gives the workout list the varied,
// "professional app" look instead of a single flat purple everywhere.
const CATEGORY_ACCENTS: Record<string, string> = {
  mobility: '#38BDF8',
  strength: '#7C3AED',
  cardio: '#F97316',
  balance: '#10B981',
  recovery: '#0EA5E9',
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
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();

  const palette = isDark ? PALETTE.dark : PALETTE.light;

  /* ================================================================
     TRANSLATIONS
  ================================================================ */

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
      weeklyInsightText:
        'این هفته تمرکز برنامه روی حفظ انرژی، حرکت منظم و ایجاد تعادل بین عملکرد ذهنی و بدنی است.',
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
      noMediaSubtitle:
        'یک تصویر، گیف یا ویدیو برای این حرکت در فایل EXERCISE_MEDIA اضافه کن تا اینجا نمایش داده شود.',
      close: 'بستن',
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
      weeklyInsightText:
        'This week focuses on maintaining energy, consistent movement and balancing mental and physical performance.',
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
      noMediaSubtitle:
        'Add an image, GIF or video for this exercise in EXERCISE_MEDIA to show it here.',
      close: 'Close',
    },
  };

  const text = isRTL ? TEXTS.fa : TEXTS.en;

  /* ================================================================
     STATE
  ================================================================ */

  const [selectedMood, setSelectedMood] = useState('good');
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  /* ================================================================
     MOODS
  ================================================================ */

  const moods = [
    { id: 'great', label: text.great, icon: Sparkles },
    { id: 'good', label: text.good, icon: Zap },
    { id: 'normal', label: text.normal, icon: Activity },
    { id: 'tired', label: text.tired, icon: Wind },
    { id: 'stressed', label: text.stressed, icon: HeartPulse },
  ];

  /* ================================================================
     TODAY EXERCISES
  ================================================================ */

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
            'زانوها را تا حدود ۹۰ درجه خم کنید، وزن روی پاشنه بماند.',
            'با فشار پاشنه‌ها به حالت ایستاده برگردید.',
          ]
        : [
            'Stand with feet shoulder-width apart, toes slightly out.',
            'Keep your back flat and push your hips back and down.',
            'Bend your knees to about 90°, weight on your heels.',
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
            'نگاه را به یک نقطه ثابت بدوزید تا تعادل بهتر شود.',
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
            'Hold each stretch for about 20 seconds, without forcing it.',
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

  /* ================================================================
     WEEKLY PLAN
  ================================================================ */

  const weeklyPlan = [
    { id: 'mon', day: text.monday, short: isRTL ? 'د' : 'M', type: text.strength, duration: 25, completed: true },
    { id: 'tue', day: text.tuesday, short: isRTL ? 'س' : 'T', type: text.cardio, duration: 30, completed: true },
    { id: 'wed', day: text.wednesday, short: isRTL ? 'چ' : 'W', type: text.mobility, duration: 20, completed: true },
    { id: 'thu', day: text.thursday, short: isRTL ? 'پ' : 'T', type: text.strength, duration: 30, completed: false, today: true },
    { id: 'fri', day: text.friday, short: isRTL ? 'ج' : 'F', type: text.cardio, duration: 25, completed: false },
    { id: 'sat', day: text.saturday, short: isRTL ? 'ش' : 'S', type: text.balance, duration: 20, completed: false },
    { id: 'sun', day: text.sunday, short: isRTL ? 'ی' : 'S', type: text.recovery, duration: 15, completed: false },
  ];

  /* ================================================================
     PROGRESS
  ================================================================ */

  const completedCount = completedExercises.length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId]
    );
  };

  const openExercise = (exerciseId: string) => setActiveExerciseId(exerciseId);
  const closeExercise = () => setActiveExerciseId(null);

  const activeExercise = exercises.find((exercise) => exercise.id === activeExerciseId) || null;
  const activeMedia = activeExerciseId ? EXERCISE_MEDIA[activeExerciseId] : undefined;
  const activeCompleted = activeExerciseId ? completedExercises.includes(activeExerciseId) : false;
  const activeAccent = activeExercise ? CATEGORY_ACCENTS[activeExercise.category] : palette.primary;

  /* ================================================================
     WEEKLY STATS
  ================================================================ */

  const weeklyStats = useMemo(
    () => [
      { label: text.workoutsCompleted, value: '3', icon: CheckCircle2 },
      { label: text.totalMinutes, value: '95', icon: Clock3 },
      { label: text.activeDays, value: '3', icon: CalendarDays },
      { label: text.currentStreak, value: '3', icon: Flame },
    ],
    [text]
  );

  const goBack = () => router.back();

  /* ================================================================
     HELPERS — media rendering
  ================================================================ */

  const statLabelFor = (exercise: Exercise) => {
    if (exercise.reps) return text.reps;
    return exercise.unit === 'sec' ? text.seconds : text.duration;
  };

  const statValueFor = (exercise: Exercise) => (exercise.reps ? exercise.reps : exercise.duration);

  const renderThumb = (exercise: Exercise) => {
    const media = EXERCISE_MEDIA[exercise.id];
    const Icon = exercise.icon;
    const accent = CATEGORY_ACCENTS[exercise.category];

    if (media) {
      return <Image source={media.source} style={styles.exerciseThumbImage} resizeMode="cover" />;
    }

    return (
      <View style={[styles.exerciseThumbFallback, { backgroundColor: `${accent}22` }]}>
        <Icon size={22} color={accent} />
      </View>
    );
  };

  const renderModalMedia = () => {
    if (!activeMedia) {
      const Icon = activeExercise ? activeExercise.icon : ImageOff;
      return (
        <View style={[styles.modalMediaFallback, { backgroundColor: `${activeAccent}18` }]}>
          <Icon size={40} color={activeAccent} />
          <Text style={[styles.modalMediaFallbackTitle, { color: palette.text }]}>{text.noMediaTitle}</Text>
          <Text style={[styles.modalMediaFallbackSubtitle, { color: palette.textSecondary }]}>
            {text.noMediaSubtitle}
          </Text>
        </View>
      );
    }

    return <Image source={activeMedia.source} style={styles.modalMedia} resizeMode="cover" />;
  };

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <LinearGradient colors={[palette.pageStart, palette.pageEnd]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={text.back}
            style={[styles.backButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <ArrowLeft size={21} strokeWidth={2.2} color={palette.text} />
          </TouchableOpacity>

          <View style={[styles.headerText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <View style={[styles.badge, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: palette.primaryFaint }]}>
              <Dumbbell size={14} color={palette.primary} />
              <Text style={[styles.badgeText, { color: palette.primary }]}>{text.badge}</Text>
            </View>
            <Text style={[styles.title, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>{text.title}</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {text.subtitle}
            </Text>
          </View>
        </View>

        {/* TODAY PROGRESS */}
        <View style={[styles.progressCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={[styles.progressTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.progressIcon, { backgroundColor: palette.primarySoft }]}>
              <Activity size={23} color={palette.primary} />
            </View>
            <View style={[styles.progressInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.progressLabel, { color: palette.textSecondary }]}>{text.todayPlan}</Text>
              <Text style={[styles.progressValue, { color: palette.text }]}>{progress}%</Text>
            </View>
            <View style={styles.progressPercent}>
              <Text style={[styles.progressPercentText, { color: palette.primary }]}>
                {completedCount}/{exercises.length}
              </Text>
              <Text style={[styles.progressPercentLabel, { color: palette.textSecondary }]}>{text.exercises}</Text>
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: palette.track }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: palette.primary }]} />
          </View>
        </View>

        {/* MOOD */}
        <View style={[styles.sectionHeader, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.yourMood}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.moodSubtitle}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodScroll}>
          {(isRTL ? [...moods].reverse() : moods).map((mood) => {
            const Icon = mood.icon;
            const selected = selectedMood === mood.id;
            return (
              <TouchableOpacity
                key={mood.id}
                activeOpacity={0.78}
                onPress={() => setSelectedMood(mood.id)}
                style={[
                  styles.moodCard,
                  { backgroundColor: selected ? palette.primarySoft : palette.surface, borderColor: selected ? palette.primary : palette.border },
                ]}
              >
                <View style={[styles.moodIcon, { backgroundColor: selected ? palette.primary : palette.surfaceMuted }]}>
                  <Icon size={19} color={selected ? '#FFFFFF' : palette.primary} strokeWidth={selected ? 2.4 : 2} />
                </View>
                <Text style={[styles.moodText, { color: selected ? palette.primary : palette.text }]}>{mood.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* TODAY'S WORKOUT */}
        <View style={[styles.sectionHeader, { marginTop: 28, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.todaysWorkout}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.recommendedForYou}
          </Text>
        </View>

        {/* WORKOUT HERO */}
        <LinearGradient
          colors={isDark ? ['#292236', '#211C2A'] : ['#F0EAFE', '#FAF9FD']}
          style={[styles.workoutHero, { borderColor: palette.border }]}
        >
          <View style={[styles.workoutHeroTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.workoutHeroIcon, { backgroundColor: palette.primary }]}>
              <Dumbbell size={28} color="#FFFFFF" />
            </View>
            <View style={[styles.workoutHeroInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.workoutHeroTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'تمرین ترکیبی امروز' : 'Full Body Session'}
              </Text>
              <Text style={[styles.workoutHeroSubtitle, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {text.strength} • {text.mobility} • {text.cardio}
              </Text>
            </View>
          </View>

          <View style={[styles.workoutMeta, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.metaItem}>
              <Clock3 size={15} color={palette.primary} />
              <Text style={[styles.metaText, { color: palette.textSecondary }]}>30 {text.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={15} color={palette.primary} />
              <Text style={[styles.metaText, { color: palette.textSecondary }]}>{exercises.length} {text.exercises}</Text>
            </View>
            <View style={styles.metaItem}>
              <Activity size={15} color={palette.primary} />
              <Text style={[styles.metaText, { color: palette.textSecondary }]}>{isRTL ? 'متوسط' : 'Moderate'}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.startButton, { backgroundColor: palette.primary }]}
            onPress={() => {
              if (exercises.length > 0) toggleExercise(exercises[0].id);
            }}
          >
            <Play size={17} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startButtonText}>{completedCount > 0 ? text.continueWorkout : text.startWorkout}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* EXERCISES */}
        <View style={[styles.sectionHeader, { marginTop: 28, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.exercises}
          </Text>
        </View>

        {/* CATEGORY FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(isRTL ? [...categoryFilters].reverse() : categoryFilters).map((filter) => {
            const active = selectedCategory === filter.id;
            const accent = filter.id === 'all' ? palette.primary : CATEGORY_ACCENTS[filter.id as Category];
            return (
              <TouchableOpacity
                key={filter.id}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(filter.id)}
                style={[
                  styles.filterChip,
                  { backgroundColor: active ? accent : palette.surface, borderColor: active ? accent : palette.border },
                ]}
              >
                <Text style={[styles.filterChipText, { color: active ? '#FFFFFF' : palette.textSecondary }]}>{filter.label}</Text>
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
                  { backgroundColor: palette.surface, borderColor: completed ? accent : palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => toggleExercise(exercise.id)}
                  style={[styles.exerciseNumber, { backgroundColor: completed ? accent : palette.surfaceMuted }]}
                >
                  {completed ? (
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text style={[styles.exerciseNumberText, { color: palette.textSecondary }]}>{index + 1}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => openExercise(exercise.id)}
                  style={[styles.exerciseTapArea, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <View style={styles.exerciseThumb}>
                    {renderThumb(exercise)}
                    <View style={[styles.playBadge, { backgroundColor: accent }, isRTL ? { left: -2 } : { right: -2 }]}>
                      <PlayCircle size={14} color="#FFFFFF" fill={hasMedia ? '#FFFFFF' : 'transparent'} />
                    </View>
                  </View>

                  <View style={[styles.exerciseContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text
                      style={[
                        styles.exerciseTitle,
                        { color: palette.text, textAlign: isRTL ? 'right' : 'left', textDecorationLine: completed ? 'line-through' : 'none' },
                      ]}
                    >
                      {exercise.title}
                    </Text>
                    <View style={[styles.categoryBadgeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      <View style={[styles.categoryDot, { backgroundColor: accent }]} />
                      <Text style={[styles.exerciseSubtitle, { color: palette.textSecondary }]}>{text[exercise.category]}</Text>
                      {exercise.sets ? (
                        <Text style={[styles.exerciseSubtitle, { color: palette.textTertiary }]}>
                          {' '}• {exercise.sets} {text.sets}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={[styles.exerciseStats, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                  <Text style={[styles.exerciseStatValue, { color: palette.text }]}>{statValueFor(exercise)}</Text>
                  <Text style={[styles.exerciseStatLabel, { color: palette.textSecondary }]}>{statLabelFor(exercise)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* WEEKLY PLAN */}
        <View style={[styles.sectionHeader, { marginTop: 32, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.weeklyPlan}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.weekProgress}
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekScroll}>
          {(isRTL ? [...weeklyPlan].reverse() : weeklyPlan).map((day) => (
            <View
              key={day.id}
              style={[
                styles.dayCard,
                { backgroundColor: day.today ? palette.primaryFaint : palette.surface, borderColor: day.today ? palette.primary : palette.border },
              ]}
            >
              <Text style={[styles.dayName, { color: palette.textSecondary }]}>{day.day}</Text>
              <View
                style={[
                  styles.dayCircle,
                  { backgroundColor: day.completed ? palette.primary : day.today ? palette.primary : palette.surfaceMuted },
                ]}
              >
                {day.completed ? (
                  <Check size={17} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Text style={[styles.dayLetter, { color: day.today ? '#FFFFFF' : palette.textSecondary }]}>{day.short}</Text>
                )}
              </View>
              <Text style={[styles.dayType, { color: palette.text }]} numberOfLines={1}>
                {day.type}
              </Text>
              <Text style={[styles.dayDuration, { color: palette.textSecondary }]}>{day.duration} {text.duration}</Text>
              {day.today && (
                <View style={[styles.todayBadge, { backgroundColor: palette.primary }]}>
                  <Text style={styles.todayBadgeText}>{text.todayShort}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* WEEKLY REPORT */}
        <View style={[styles.reportHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.reportTitleContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
            <Text style={[styles.sectionTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
              {text.weeklyReport}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {text.weekProgress}
            </Text>
          </View>
          <View style={[styles.reportIcon, { backgroundColor: palette.primarySoft }]}>
            <BarChart3 size={21} color={palette.primary} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {weeklyStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <View style={[styles.statIcon, { backgroundColor: palette.primarySoft }]}>
                  <Icon size={17} color={palette.primary} />
                </View>
                <Text style={[styles.statValue, { color: palette.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: palette.textSecondary }]} numberOfLines={2}>
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* PERFORMANCE */}
        <View style={[styles.performanceCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <View style={[styles.performanceHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.performanceIcon, { backgroundColor: palette.primarySoft }]}>
              <Brain size={20} color={palette.primary} />
            </View>
            <Text style={[styles.performanceTitle, { color: palette.text }]}>{text.performance}</Text>
          </View>

          <View style={[styles.performanceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.performanceLabelContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.performanceLabel, { color: palette.text }]}>{text.bodyPerformance}</Text>
            </View>
            <View style={[styles.performanceBar, { backgroundColor: palette.track }]}>
              <View style={[styles.performanceFill, { width: '72%', backgroundColor: palette.primary }]} />
            </View>
            <Text style={[styles.performanceValue, { color: palette.text }]}>72%</Text>
          </View>

          <View style={[styles.performanceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.performanceLabelContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.performanceLabel, { color: palette.text }]}>{text.mentalPerformance}</Text>
            </View>
            <View style={[styles.performanceBar, { backgroundColor: palette.track }]}>
              <View style={[styles.performanceFill, { width: '84%', backgroundColor: palette.primary }]} />
            </View>
            <Text style={[styles.performanceValue, { color: palette.text }]}>84%</Text>
          </View>
        </View>

        {/* WEEKLY INSIGHT */}
        <View style={[styles.insightCard, { backgroundColor: palette.primaryFaint, borderColor: isDark ? 'rgba(167,139,250,0.18)' : '#E6DDF7' }]}>
          <View style={[styles.insightTop, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.insightIcon, { backgroundColor: palette.primarySoft }]}>
              <Sparkles size={18} color={palette.primary} />
            </View>
            <Text style={[styles.insightTitle, { color: palette.text }]}>{text.weeklyInsight}</Text>
          </View>
          <Text style={[styles.insightText, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.weeklyInsightText}
          </Text>
        </View>

        {/* LOW ENERGY NOTE */}
        <View style={[styles.noteCard, { backgroundColor: palette.surface, borderColor: palette.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.noteIcon, { backgroundColor: palette.primarySoft }]}>
            <HeartPulse size={17} color={palette.primary} />
          </View>
          <Text style={[styles.noteText, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {text.noPressure}
          </Text>
        </View>

        <Text style={[styles.safeTraining, { color: palette.textTertiary, textAlign: isRTL ? 'right' : 'left' }]}>
          {text.safeTraining}
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ==========================================================
          EXERCISE DEMO MODAL
      ========================================================== */}

      <Modal visible={!!activeExercise} animationType="slide" transparent onRequestClose={closeExercise}>
        <View style={[styles.modalOverlay, { backgroundColor: palette.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: palette.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalMediaWrap}>
                {renderModalMedia()}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={closeExercise}
                  accessibilityRole="button"
                  accessibilityLabel={text.close}
                  style={styles.modalCloseButton}
                >
                  <X size={18} color="#FFFFFF" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={[styles.categoryBadgeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={[styles.categoryDot, { backgroundColor: activeAccent }]} />
                  <Text style={[styles.exerciseSubtitle, { color: palette.textSecondary }]}>
                    {activeExercise ? text[activeExercise.category] : ''}
                  </Text>
                </View>

                <Text style={[styles.modalTitle, { color: palette.text, textAlign: isRTL ? 'right' : 'left' }]}>
                  {activeExercise ? activeExercise.title : ''}
                </Text>

                <View style={[styles.modalStatsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {activeExercise?.sets ? (
                    <View style={[styles.modalStatChip, { backgroundColor: palette.surfaceMuted }]}>
                      <Text style={[styles.modalStatChipText, { color: palette.text }]}>{activeExercise.sets} {text.sets}</Text>
                    </View>
                  ) : null}
                  {activeExercise ? (
                    <View style={[styles.modalStatChip, { backgroundColor: palette.surfaceMuted }]}>
                      <Text style={[styles.modalStatChipText, { color: palette.text }]}>
                        {statValueFor(activeExercise)} {statLabelFor(activeExercise)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.modalSectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <ListOrdered size={16} color={palette.primary} />
                  <Text style={[styles.modalSectionTitle, { color: palette.text }]}>{text.howToPerform}</Text>
                </View>

                {(activeExercise?.instructions || []).map((step, i) => (
                  <View key={i} style={[styles.instructionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.instructionIndex, { backgroundColor: `${activeAccent}22` }]}>
                      <Text style={[styles.instructionIndexText, { color: activeAccent }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.instructionText, { color: palette.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {step}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  activeOpacity={0.86}
                  onPress={() => activeExerciseId && toggleExercise(activeExerciseId)}
                  style={[
                    styles.modalActionButton,
                    { backgroundColor: activeCompleted ? palette.surfaceMuted : activeAccent, borderColor: activeCompleted ? palette.border : 'transparent', borderWidth: activeCompleted ? 1 : 0 },
                  ]}
                >
                  {activeCompleted ? (
                    <X size={17} color={palette.text} />
                  ) : (
                    <Check size={17} color="#FFFFFF" strokeWidth={2.6} />
                  )}
                  <Text style={[styles.modalActionButtonText, { color: activeCompleted ? palette.text : '#FFFFFF' }]}>
                    {activeCompleted ? text.markUndone : text.markDone}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingTop: 70, paddingHorizontal: 20, paddingBottom: 40 },

  /* HEADER */
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  backButton: { width: 42, height: 42, borderRadius: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  headerText: { flex: 1 },
  badge: { alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9, marginBottom: 8 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  title: { fontSize: 31, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 22, marginTop: 6 },

  /* PROGRESS */
  progressCard: { borderRadius: 22, borderWidth: 1, padding: 17, marginBottom: 26 },
  progressTop: { alignItems: 'center' },
  progressIcon: { width: 47, height: 47, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  progressInfo: { flex: 1, marginHorizontal: 12 },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  progressValue: { fontSize: 25, fontWeight: '900', marginTop: 2 },
  progressPercent: { alignItems: 'flex-end' },
  progressPercentText: { fontSize: 15, fontWeight: '900' },
  progressPercentLabel: { fontSize: 10, marginTop: 2 },
  progressTrack: { height: 7, borderRadius: 8, overflow: 'hidden', marginTop: 16 },
  progressFill: { height: '100%', borderRadius: 8 },

  /* SECTION */
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.2 },
  sectionSubtitle: { fontSize: 12, marginTop: 4, lineHeight: 19 },

  /* MOOD */
  moodScroll: { gap: 9, paddingBottom: 4 },
  moodCard: { width: 82, minHeight: 86, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  moodIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  moodText: { fontSize: 11, fontWeight: '700' },

  /* WORKOUT HERO */
  workoutHero: { borderRadius: 25, borderWidth: 1, padding: 19, overflow: 'hidden' },
  workoutHeroTop: { alignItems: 'center' },
  workoutHeroIcon: { width: 57, height: 57, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  workoutHeroInfo: { flex: 1, marginHorizontal: 13 },
  workoutHeroTitle: { fontSize: 19, fontWeight: '900' },
  workoutHeroSubtitle: { fontSize: 12, marginTop: 5 },
  workoutMeta: { gap: 15, marginTop: 19, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 11, fontWeight: '600' },
  startButton: { height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 19 },
  startButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  /* CATEGORY FILTER */
  filterScroll: { gap: 8, paddingBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '700' },

  /* EXERCISES */
  exerciseList: { gap: 10 },
  exerciseCard: { minHeight: 84, borderRadius: 20, borderWidth: 1, padding: 12, alignItems: 'center' },
  exerciseNumber: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { fontSize: 11, fontWeight: '800' },
  exerciseTapArea: { flex: 1, alignItems: 'center', marginHorizontal: 10 },

  exerciseThumb: { width: 52, height: 52, borderRadius: 14, overflow: 'visible' },
  exerciseThumbImage: { width: 52, height: 52, borderRadius: 14 },
  exerciseThumbFallback: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  playBadge: {
    position: 'absolute',
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  exerciseContent: { flex: 1, marginHorizontal: 12 },
  exerciseTitle: { fontSize: 14, fontWeight: '800' },
  categoryBadgeRow: { alignItems: 'center', gap: 5, marginTop: 4 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  exerciseSubtitle: { fontSize: 10, fontWeight: '600' },

  exerciseStats: { minWidth: 45 },
  exerciseStatValue: { fontSize: 16, fontWeight: '900' },
  exerciseStatLabel: { fontSize: 9, marginTop: 1 },

  /* WEEK */
  weekScroll: { gap: 9, paddingBottom: 5 },
  dayCard: { width: 92, minHeight: 142, borderRadius: 19, borderWidth: 1, padding: 11, alignItems: 'center' },
  dayName: { fontSize: 9, fontWeight: '700' },
  dayCircle: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 8 },
  dayLetter: { fontSize: 14, fontWeight: '900' },
  dayType: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  dayDuration: { fontSize: 9, marginTop: 4 },
  todayBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, marginTop: 6 },
  todayBadgeText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800' },

  /* REPORT */
  reportHeader: { alignItems: 'center', justifyContent: 'space-between', marginTop: 30, marginBottom: 12 },
  reportTitleContainer: { flex: 1 },
  reportIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '48%', minHeight: 122, borderRadius: 20, borderWidth: 1, padding: 14 },
  statIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', marginTop: 9 },
  statLabel: { fontSize: 10, lineHeight: 15, marginTop: 2 },

  /* PERFORMANCE */
  performanceCard: { borderRadius: 22, borderWidth: 1, padding: 17, marginTop: 12 },
  performanceHeader: { alignItems: 'center', gap: 10, marginBottom: 17 },
  performanceIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  performanceTitle: { fontSize: 15, fontWeight: '900' },
  performanceRow: { alignItems: 'center', gap: 9, marginTop: 12 },
  performanceLabelContainer: { width: 82 },
  performanceLabel: { fontSize: 10, fontWeight: '700' },
  performanceBar: { flex: 1, height: 7, borderRadius: 7, overflow: 'hidden' },
  performanceFill: { height: '100%', borderRadius: 7 },
  performanceValue: { width: 35, fontSize: 10, fontWeight: '800', textAlign: 'right' },

  /* INSIGHT */
  insightCard: { borderRadius: 22, borderWidth: 1, padding: 17, marginTop: 12 },
  insightTop: { alignItems: 'center', gap: 10 },
  insightIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  insightTitle: { flex: 1, fontSize: 15, fontWeight: '900' },
  insightText: { fontSize: 12, lineHeight: 21, marginTop: 12 },

  /* NOTE */
  noteCard: { borderRadius: 17, borderWidth: 1, padding: 13, marginTop: 12, alignItems: 'center', gap: 9 },
  noteIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  noteText: { flex: 1, fontSize: 10, lineHeight: 17 },
  safeTraining: { fontSize: 9, lineHeight: 15, marginTop: 10 },
  bottomSpace: { height: 20 },

  /* EXERCISE MODAL */
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalCard: { maxHeight: '86%', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  modalMediaWrap: { width: '100%', height: 220 },
  modalMedia: { width: '100%', height: '100%' },
  modalMediaFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 8 },
  modalMediaFallbackTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  modalMediaFallbackSubtitle: { fontSize: 11, lineHeight: 17, textAlign: 'center' },
  modalCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: 20, paddingBottom: 30 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginTop: 8 },
  modalStatsRow: { gap: 8, marginTop: 14 },
  modalStatChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  modalStatChipText: { fontSize: 11, fontWeight: '800' },
  modalSectionHeader: { alignItems: 'center', gap: 7, marginTop: 22, marginBottom: 10 },
  modalSectionTitle: { fontSize: 14, fontWeight: '900' },
  instructionRow: { alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  instructionIndex: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  instructionIndexText: { fontSize: 11, fontWeight: '800' },
  instructionText: { flex: 1, fontSize: 13, lineHeight: 20 },
  modalActionButton: { height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 22 },
  modalActionButtonText: { fontSize: 14, fontWeight: '800' },
});