import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
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
  X,
  Lightbulb,
  ListChecks,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

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

    overlay: 'rgba(6,4,10,0.72)',
  },
};

/* ================================================================
   MOVEMENT FIGURE — animated illustration of the exercise motion
   ================================================================ */

type MovementType = 'stretch' | 'squat' | 'walk' | 'balance';

function MovementFigure({
  type,
  color,
  muted,
}: {
  type: MovementType;
  color: string;
  muted: string;
}) {
  const bodyPart = {
    backgroundColor: color,
  };

  const limbPart = {
    backgroundColor: muted,
  };

  if (type === 'squat') {
    return (
      <View style={figureStyles.stage}>
        <MotiView
          style={figureStyles.wholeFigure}
          from={{ transform: [{ translateY: 0 }, { scaleY: 1 }] }}
          animate={{ transform: [{ translateY: 16 }, { scaleY: 0.86 }] }}
          transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 750 }}
        >
          <View style={[figureStyles.head, bodyPart]} />
          <View style={[figureStyles.torso, bodyPart]} />

          <View style={figureStyles.armsRow}>
            <View style={[figureStyles.arm, limbPart]} />
            <View style={[figureStyles.arm, limbPart]} />
          </View>

          <View style={figureStyles.legsRow}>
            <View style={[figureStyles.leg, limbPart]} />
            <View style={[figureStyles.leg, limbPart]} />
          </View>
        </MotiView>
      </View>
    );
  }

  if (type === 'walk') {
    return (
      <View style={figureStyles.stage}>
        <View style={figureStyles.wholeFigure}>
          <View style={[figureStyles.head, bodyPart]} />
          <View style={[figureStyles.torso, bodyPart]} />

          <View style={figureStyles.pivotRow}>
            <MotiView
              style={figureStyles.limbPivot}
              from={{ transform: [{ rotate: '20deg' }] }}
              animate={{ transform: [{ rotate: '-20deg' }] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 480 }}
            >
              <View style={[figureStyles.arm, figureStyles.hangingLimb, limbPart]} />
            </MotiView>

            <MotiView
              style={figureStyles.limbPivot}
              from={{ transform: [{ rotate: '-20deg' }] }}
              animate={{ transform: [{ rotate: '20deg' }] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 480 }}
            >
              <View style={[figureStyles.arm, figureStyles.hangingLimb, limbPart]} />
            </MotiView>
          </View>

          <View style={figureStyles.pivotRowLegs}>
            <MotiView
              style={figureStyles.limbPivot}
              from={{ transform: [{ rotate: '-24deg' }] }}
              animate={{ transform: [{ rotate: '24deg' }] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 480 }}
            >
              <View style={[figureStyles.leg, figureStyles.hangingLimb, bodyPart]} />
            </MotiView>

            <MotiView
              style={figureStyles.limbPivot}
              from={{ transform: [{ rotate: '24deg' }] }}
              animate={{ transform: [{ rotate: '-24deg' }] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 480 }}
            >
              <View style={[figureStyles.leg, figureStyles.hangingLimb, bodyPart]} />
            </MotiView>
          </View>
        </View>
      </View>
    );
  }

  if (type === 'balance') {
    return (
      <View style={figureStyles.stage}>
        <MotiView
          style={figureStyles.wholeFigure}
          from={{ transform: [{ rotate: '-6deg' }] }}
          animate={{ transform: [{ rotate: '6deg' }] }}
          transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 1300 }}
        >
          <View style={[figureStyles.head, bodyPart]} />
          <View style={[figureStyles.torso, bodyPart]} />

          <View style={figureStyles.pivotRow}>
            <MotiView
              style={figureStyles.limbPivot}
              from={{ transform: [{ rotate: '-14deg' }] }}
              animate={{ transform: [{ rotate: '14deg' }] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 1300 }}
            >
              <View style={[figureStyles.arm, figureStyles.hangingLimb, limbPart]} />
            </MotiView>

            <MotiView
              style={figureStyles.limbPivot}
              from={{ transform: [{ rotate: '14deg' }] }}
              animate={{ transform: [{ rotate: '-14deg' }] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 1300 }}
            >
              <View style={[figureStyles.arm, figureStyles.hangingLimb, limbPart]} />
            </MotiView>
          </View>

          <View style={figureStyles.legsRow}>
            <View style={[figureStyles.leg, bodyPart]} />

            <View
              style={[
                figureStyles.leg,
                limbPart,
                { transform: [{ rotate: '52deg' }, { translateX: -6 }] },
              ]}
            />
          </View>
        </MotiView>
      </View>
    );
  }

  return (
    <View style={figureStyles.stage}>
      <MotiView
        style={figureStyles.wholeFigure}
        from={{ transform: [{ scale: 1 }] }}
        animate={{ transform: [{ scale: 1.05 }] }}
        transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 900 }}
      >
        <View style={[figureStyles.head, bodyPart]} />
        <View style={[figureStyles.torso, bodyPart]} />

        <View style={figureStyles.pivotRow}>
          <MotiView
            style={figureStyles.limbPivot}
            from={{ transform: [{ rotate: '25deg' }] }}
            animate={{ transform: [{ rotate: '-155deg' }] }}
            transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 1100 }}
          >
            <View style={[figureStyles.arm, figureStyles.hangingLimb, limbPart]} />
          </MotiView>

          <MotiView
            style={figureStyles.limbPivot}
            from={{ transform: [{ rotate: '-25deg' }] }}
            animate={{ transform: [{ rotate: '155deg' }] }}
            transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 1100 }}
          >
            <View style={[figureStyles.arm, figureStyles.hangingLimb, limbPart]} />
          </MotiView>
        </View>

        <View style={figureStyles.legsRow}>
          <View style={[figureStyles.leg, limbPart]} />
          <View style={[figureStyles.leg, limbPart]} />
        </View>
      </MotiView>
    </View>
  );
}

const figureStyles = StyleSheet.create({
  stage: {
    width: 150,
    height: 176,
    alignItems: 'center',
    justifyContent: 'center',
  },

  wholeFigure: {
    width: 90,
    alignItems: 'center',
  },

  head: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },

  torso: {
    width: 20,
    height: 54,
    borderRadius: 10,
    marginTop: 4,
  },

  armsRow: {
    position: 'absolute',
    top: 32,
    width: 90,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  legsRow: {
    marginTop: 4,
    width: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  arm: {
    width: 10,
    height: 42,
    borderRadius: 5,
  },

  leg: {
    width: 12,
    height: 54,
    borderRadius: 6,
  },

  pivotRow: {
    position: 'absolute',
    top: 34,
    width: 96,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  pivotRowLegs: {
    marginTop: 4,
    width: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  limbPivot: {
    width: 10,
    height: 10,
    alignItems: 'center',
  },

  hangingLimb: {
    marginTop: 0,
  },
});

/* ================================================================
   EXERCISE CONTENT (steps / tip / target / level per movement)
   ================================================================ */

const EXERCISE_CONTENT: Record<
  string,
  {
    movement: MovementType;
    target: { fa: string; en: string };
    level: { fa: string; en: string };
    steps: { fa: string[]; en: string[] };
    tip: { fa: string; en: string };
  }
> = {
  warmup: {
    movement: 'stretch',
    target: { fa: 'کل بدن', en: 'Full Body' },
    level: { fa: 'آسان', en: 'Easy' },
    steps: {
      fa: [
        'صاف بایستید و پاها را به اندازه عرض شانه باز کنید',
        'بازوها را به‌آرامی بالای سر بکشید و نفس عمیق بکشید',
        'گردن و شانه‌ها را چند بار به‌آرامی بچرخانید',
      ],
      en: [
        'Stand tall with feet shoulder-width apart',
        'Slowly reach both arms overhead while breathing deeply',
        'Gently roll your neck and shoulders a few times',
      ],
    },
    tip: {
      fa: 'حرکات را آرام و کنترل‌شده انجام دهید؛ هدف گرم کردن است، نه فشار آوردن.',
      en: 'Keep the movement slow and controlled — the goal is to warm up, not push hard.',
    },
  },

  squat: {
    movement: 'squat',
    target: { fa: 'پایین‌تنه', en: 'Lower Body' },
    level: { fa: 'متوسط', en: 'Moderate' },
    steps: {
      fa: [
        'پاها را به اندازه عرض شانه باز کرده و نوک پا کمی رو به بیرون باشد',
        'باسن را به سمت عقب و پایین ببرید، انگار می‌خواهید روی صندلی بنشینید',
        'زانوها را از نوک پا عبور ندهید و سپس به آرامی بایستید',
      ],
      en: [
        'Stand with feet shoulder-width apart, toes slightly out',
        'Push your hips back and down as if sitting into a chair',
        'Keep knees behind your toes, then stand back up with control',
      ],
    },
    tip: {
      fa: 'وزن بدن را روی پاشنه‌ها نگه دارید و کمر را صاف نگه دارید.',
      en: 'Keep your weight in your heels and your back straight throughout.',
    },
  },

  walk: {
    movement: 'walk',
    target: { fa: 'قلب و عروق', en: 'Cardio' },
    level: { fa: 'آسان', en: 'Easy' },
    steps: {
      fa: [
        'با گام‌های ثابت و ریتم منظم شروع به راه رفتن کنید',
        'شانه‌ها را شل و بازوها را آزادانه همراه با گام‌ها تکان دهید',
        'سرعت را به‌تدریج تا حدی که کمی نفس‌نفس بزنید افزایش دهید',
      ],
      en: [
        'Start walking at a steady, comfortable pace',
        'Keep shoulders relaxed and let your arms swing naturally',
        'Gradually pick up the pace until your breathing quickens slightly',
      ],
    },
    tip: {
      fa: 'به جای طول قدم، روی سرعت و ریتم منظم گام‌ها تمرکز کنید.',
      en: 'Focus on a quick, steady rhythm rather than long strides.',
    },
  },

  balance: {
    movement: 'balance',
    target: { fa: 'مرکز بدن و تعادل', en: 'Core & Balance' },
    level: { fa: 'متوسط', en: 'Moderate' },
    steps: {
      fa: [
        'روی یک پا بایستید و زانوی پای دیگر را کمی بالا بیاورید',
        'نگاه خود را به یک نقطه ثابت بدوزید تا تعادل بهتری داشته باشید',
        'بازوها را کمی از بدن فاصله دهید تا پایداری بیشتری پیدا کنید',
      ],
      en: [
        'Stand on one leg and lift the other knee slightly',
        'Fix your gaze on a steady point ahead to help your balance',
        'Hold your arms slightly out from your body for stability',
      ],
    },
    tip: {
      fa: 'اگر لازم شد برای حمایت به یک دیوار یا صندلی نزدیک بمانید.',
      en: 'Stay near a wall or chair for light support if you need it.',
    },
  },

  cooldown: {
    movement: 'stretch',
    target: { fa: 'کل بدن', en: 'Full Body' },
    level: { fa: 'آسان', en: 'Easy' },
    steps: {
      fa: [
        'نفس‌های عمیق و آرام بکشید تا ضربان قلب پایین بیاید',
        'بازوها و پاها را به‌آرامی و بدون فشار کش دهید',
        'چند ثانیه در سکوت بمانید و بدن را ریلکس کنید',
      ],
      en: [
        'Take slow, deep breaths to bring your heart rate down',
        'Gently stretch your arms and legs without forcing anything',
        'Hold a few seconds of stillness and let your body relax',
      ],
    },
    tip: {
      fa: 'هرگز در کشش نپرید؛ حرکت باید آرام و پیوسته باشد.',
      en: 'Never bounce into a stretch — keep the motion slow and steady.',
    },
  },
};

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

      tapToPreview: 'برای مشاهده حرکت لمس کنید',
      targetArea: 'ناحیه هدف',
      howTo: 'مراحل انجام حرکت',
      formTip: 'نکته فرم صحیح',
      markComplete: 'ثبت به‌عنوان انجام‌شده',
      moveNumber: 'حرکت',
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

      tapToPreview: 'Tap to preview the movement',
      targetArea: 'Target Area',
      howTo: 'How to Perform',
      formTip: 'Form Tip',
      markComplete: 'Mark as Complete',
      moveNumber: 'Move',
    },
  };

  const text = isRTL ? TEXTS.fa : TEXTS.en;
  const lang = isRTL ? 'fa' : 'en';

  /* ================================================================
     STATE
  ================================================================ */

  const [selectedMood, setSelectedMood] = useState('good');
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
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

  const exercises = [
    {
      id: 'warmup',
      title: text.warmup,
      subtitle: text.mobility,
      duration: 5,
      icon: Wind,
    },

    {
      id: 'squat',
      title: isRTL ? 'اسکوات' : 'Bodyweight Squat',
      subtitle: text.strength,
      reps: 12,
      sets: 3,
      icon: PersonStanding,
    },

    {
      id: 'walk',
      title: isRTL ? 'راه رفتن سریع' : 'Brisk Walk',
      subtitle: text.cardio,
      duration: 10,
      icon: Footprints,
    },

    {
      id: 'balance',
      title: isRTL ? 'تمرین تعادل' : 'Balance Hold',
      subtitle: text.balance,
      duration: 60,
      icon: Target,
    },

    {
      id: 'cooldown',
      title: text.cooldown,
      subtitle: text.recovery,
      duration: 5,
      icon: Wind,
    },
  ];

  /* ================================================================
     WEEKLY PLAN
  ================================================================ */

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

  /* ================================================================
     PROGRESS
  ================================================================ */

  const completedCount = completedExercises.length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  /* ================================================================
     TOGGLE EXERCISE
  ================================================================ */

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises((current) => {
      if (current.includes(exerciseId)) {
        return current.filter((id) => id !== exerciseId);
      }
      return [...current, exerciseId];
    });
  };

  /* ================================================================
     ACTIVE EXERCISE (MODAL)
  ================================================================ */

  const activeExercise = exercises.find((item) => item.id === activeExerciseId) || null;
  const activeContent = activeExerciseId ? EXERCISE_CONTENT[activeExerciseId] : null;
  const activeIndex = activeExerciseId
    ? exercises.findIndex((item) => item.id === activeExerciseId)
    : -1;
  const activeCompleted = activeExerciseId
    ? completedExercises.includes(activeExerciseId)
    : false;

  const openExercise = (exerciseId: string) => {
    setActiveExerciseId(exerciseId);
  };

  const closeExercise = () => {
    setActiveExerciseId(null);
  };

  const startNextExercise = () => {
    const next = exercises.find((item) => !completedExercises.includes(item.id));
    setActiveExerciseId(next ? next.id : exercises[0].id);
  };

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

  /* ================================================================
     GO BACK FUNCTION (like HafezScreen)
  ================================================================ */

  const goBack = () => {
    router.back();
  };

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <LinearGradient
      colors={[palette.pageStart, palette.pageEnd]}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={goBack}
            accessibilityRole="button"
            accessibilityLabel={text.back}
            style={[
              styles.backButton,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <ArrowLeft size={21} strokeWidth={2.2} color={palette.text} />
          </TouchableOpacity>

          <View
            style={[
              styles.headerText,
              {
                alignItems: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <View
              style={[
                styles.badge,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                  backgroundColor: palette.primaryFaint,
                },
              ]}
            >
              <Dumbbell size={14} color={palette.primary} />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color: palette.primary,
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
                  color: palette.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {text.title}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color: palette.textSecondary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {text.subtitle}
            </Text>
          </View>
        </View>

        {/* ==========================================================
            TODAY PROGRESS
        ========================================================== */}

        <View
          style={[
            styles.progressCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <View
            style={[
              styles.progressTop,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.progressIcon,
                {
                  backgroundColor: palette.primarySoft,
                },
              ]}
            >
              <Activity size={23} color={palette.primary} />
            </View>

            <View
              style={[
                styles.progressInfo,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.progressLabel,
                  {
                    color: palette.textSecondary,
                  },
                ]}
              >
                {text.todayPlan}
              </Text>

              <Text
                style={[
                  styles.progressValue,
                  {
                    color: palette.text,
                  },
                ]}
              >
                {progress}%
              </Text>
            </View>

            <View style={styles.progressPercent}>
              <Text
                style={[
                  styles.progressPercentText,
                  {
                    color: palette.primary,
                  },
                ]}
              >
                {completedCount}/{exercises.length}
              </Text>

              <Text
                style={[
                  styles.progressPercentLabel,
                  {
                    color: palette.textSecondary,
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
                backgroundColor: palette.track,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: palette.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* ==========================================================
            MOOD
        ========================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              alignItems: isRTL ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: palette.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.yourMood}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: palette.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
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
                activeOpacity={0.78}
                onPress={() => setSelectedMood(mood.id)}
                style={[
                  styles.moodCard,
                  {
                    backgroundColor: selected ? palette.primarySoft : palette.surface,
                    borderColor: selected ? palette.primary : palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.moodIcon,
                    {
                      backgroundColor: selected ? palette.primary : palette.surfaceMuted,
                    },
                  ]}
                >
                  <Icon
                    size={19}
                    color={selected ? '#FFFFFF' : palette.primary}
                    strokeWidth={selected ? 2.4 : 2}
                  />
                </View>

                <Text
                  style={[
                    styles.moodText,
                    {
                      color: selected ? palette.primary : palette.text,
                    },
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ==========================================================
            TODAY'S WORKOUT
        ========================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 28,
              alignItems: isRTL ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: palette.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.todaysWorkout}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: palette.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.recommendedForYou}
          </Text>
        </View>

        {/* ==========================================================
            WORKOUT HERO
        ========================================================== */}

        <LinearGradient
          colors={
            isDark
              ? ['#292236', '#211C2A']
              : ['#F0EAFE', '#FAF9FD']
          }
          style={[
            styles.workoutHero,
            {
              borderColor: palette.border,
            },
          ]}
        >
          <View
            style={[
              styles.workoutHeroTop,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.workoutHeroIcon,
                {
                  backgroundColor: palette.primary,
                },
              ]}
            >
              <Dumbbell size={28} color="#FFFFFF" />
            </View>

            <View
              style={[
                styles.workoutHeroInfo,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.workoutHeroTitle,
                  {
                    color: palette.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {isRTL ? 'تمرین ترکیبی امروز' : 'Full Body Session'}
              </Text>

              <Text
                style={[
                  styles.workoutHeroSubtitle,
                  {
                    color: palette.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {text.strength} • {text.mobility} • {text.cardio}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.workoutMeta,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View style={styles.metaItem}>
              <Clock3 size={15} color={palette.primary} />

              <Text
                style={[
                  styles.metaText,
                  {
                    color: palette.textSecondary,
                  },
                ]}
              >
                30 {text.duration}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Target size={15} color={palette.primary} />

              <Text
                style={[
                  styles.metaText,
                  {
                    color: palette.textSecondary,
                  },
                ]}
              >
                {exercises.length} {text.exercises}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Activity size={15} color={palette.primary} />

              <Text
                style={[
                  styles.metaText,
                  {
                    color: palette.textSecondary,
                  },
                ]}
              >
                {isRTL ? 'متوسط' : 'Moderate'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.86}
            style={[
              styles.startButton,
              {
                backgroundColor: palette.primary,
              },
            ]}
            onPress={startNextExercise}
          >
            <Play size={17} color="#FFFFFF" fill="#FFFFFF" />

            <Text style={styles.startButtonText}>
              {completedCount > 0 ? text.continueWorkout : text.startWorkout}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ==========================================================
            EXERCISES
        ========================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 28,
              alignItems: isRTL ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: palette.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.exercises}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: palette.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.tapToPreview}
          </Text>
        </View>

        <View style={styles.exerciseList}>
          {exercises.map((exercise, index) => {
            const Icon = exercise.icon;
            const completed = completedExercises.includes(exercise.id);
            const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

            return (
              <View
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: completed ? palette.primary : palette.border,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => toggleExercise(exercise.id)}
                  accessibilityRole="button"
                  style={[
                    styles.exerciseNumber,
                    {
                      backgroundColor: completed ? palette.primary : palette.surfaceMuted,
                    },
                  ]}
                >
                  {completed ? (
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.exerciseNumberText,
                        {
                          color: palette.textSecondary,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openExercise(exercise.id)}
                  style={[
                    styles.exerciseTouchArea,
                    {
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.exerciseIcon,
                      {
                        backgroundColor: palette.primarySoft,

                        marginLeft: isRTL ? 12 : 0,

                        marginRight: isRTL ? 0 : 12,
                      },
                    ]}
                  >
                    <Icon size={21} color={palette.primary} />
                  </View>

                  <View
                    style={[
                      styles.exerciseContent,
                      {
                        alignItems: isRTL ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exerciseTitle,
                        {
                          color: palette.text,
                          textAlign: isRTL ? 'right' : 'left',
                          textDecorationLine: completed ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {exercise.title}
                    </Text>

                    <Text
                      style={[
                        styles.exerciseSubtitle,
                        {
                          color: palette.textSecondary,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {exercise.subtitle}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.exerciseStats,
                      {
                        alignItems: isRTL ? 'flex-start' : 'flex-end',
                      },
                    ]}
                  >
                    {'reps' in exercise && exercise.reps ? (
                      <>
                        <Text
                          style={[
                            styles.exerciseStatValue,
                            {
                              color: palette.text,
                            },
                          ]}
                        >
                          {exercise.reps}
                        </Text>

                        <Text
                          style={[
                            styles.exerciseStatLabel,
                            {
                              color: palette.textSecondary,
                            },
                          ]}
                        >
                          {text.reps}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={[
                            styles.exerciseStatValue,
                            {
                              color: palette.text,
                            },
                          ]}
                        >
                          {exercise.duration}
                        </Text>

                        <Text
                          style={[
                            styles.exerciseStatLabel,
                            {
                              color: palette.textSecondary,
                            },
                          ]}
                        >
                          {exercise.id === 'balance' ? text.seconds : text.duration}
                        </Text>
                      </>
                    )}
                  </View>

                  <ChevronIcon size={18} color={palette.textTertiary} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* ==========================================================
            WEEKLY PLAN
        ========================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              marginTop: 32,
              alignItems: isRTL ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              {
                color: palette.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.weeklyPlan}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color: palette.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
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
                  backgroundColor: day.today ? palette.primaryFaint : palette.surface,

                  borderColor: day.today ? palette.primary : palette.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  {
                    color: palette.textSecondary,
                  },
                ]}
              >
                {day.day}
              </Text>

              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: day.completed
                      ? palette.primary
                      : day.today
                      ? palette.primary
                      : palette.surfaceMuted,
                  },
                ]}
              >
                {day.completed ? (
                  <Check size={17} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.dayLetter,
                      {
                        color: day.today ? '#FFFFFF' : palette.textSecondary,
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
                    color: palette.text,
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
                    color: palette.textSecondary,
                  },
                ]}
              >
                {day.duration} {text.duration}
              </Text>

              {day.today && (
                <View
                  style={[
                    styles.todayBadge,
                    {
                      backgroundColor: palette.primary,
                    },
                  ]}
                >
                  <Text style={styles.todayBadgeText}>{text.todayShort}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* ==========================================================
            WEEKLY REPORT
        ========================================================== */}

        <View
          style={[
            styles.reportHeader,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.reportTitleContainer,
              {
                alignItems: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: palette.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {text.weeklyReport}
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: palette.textSecondary,
                  textAlign: isRTL ? 'right' : 'left',
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
                backgroundColor: palette.primarySoft,
              },
            ]}
          >
            <BarChart3 size={21} color={palette.primary} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {weeklyStats.map((stat) => {
            const Icon = stat.icon;

            return (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor: palette.primarySoft,
                    },
                  ]}
                >
                  <Icon size={17} color={palette.primary} />
                </View>

                <Text
                  style={[
                    styles.statValue,
                    {
                      color: palette.text,
                    },
                  ]}
                >
                  {stat.value}
                </Text>

                <Text
                  style={[
                    styles.statLabel,
                    {
                      color: palette.textSecondary,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {stat.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ==========================================================
            PERFORMANCE
        ========================================================== */}

        <View
          style={[
            styles.performanceCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}
        >
          <View
            style={[
              styles.performanceHeader,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.performanceIcon,
                {
                  backgroundColor: palette.primarySoft,
                },
              ]}
            >
              <Brain size={20} color={palette.primary} />
            </View>

            <Text
              style={[
                styles.performanceTitle,
                {
                  color: palette.text,
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
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.performanceLabelContainer,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.performanceLabel,
                  {
                    color: palette.text,
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
                  backgroundColor: palette.track,
                },
              ]}
            >
              <View
                style={[
                  styles.performanceFill,
                  {
                    width: '72%',
                    backgroundColor: palette.primary,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.performanceValue,
                {
                  color: palette.text,
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
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.performanceLabelContainer,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.performanceLabel,
                  {
                    color: palette.text,
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
                  backgroundColor: palette.track,
                },
              ]}
            >
              <View
                style={[
                  styles.performanceFill,
                  {
                    width: '84%',
                    backgroundColor: palette.primary,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.performanceValue,
                {
                  color: palette.text,
                },
              ]}
            >
              84%
            </Text>
          </View>
        </View>

        {/* ==========================================================
            WEEKLY INSIGHT
        ========================================================== */}

        <View
          style={[
            styles.insightCard,
            {
              backgroundColor: palette.primaryFaint,
              borderColor: isDark ? 'rgba(167,139,250,0.18)' : '#E6DDF7',
            },
          ]}
        >
          <View
            style={[
              styles.insightTop,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.insightIcon,
                {
                  backgroundColor: palette.primarySoft,
                },
              ]}
            >
              <Sparkles size={18} color={palette.primary} />
            </View>

            <Text
              style={[
                styles.insightTitle,
                {
                  color: palette.text,
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
                color: palette.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.weeklyInsightText}
          </Text>
        </View>

        {/* ==========================================================
            LOW ENERGY NOTE
        ========================================================== */}

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.noteIcon,
              {
                backgroundColor: palette.primarySoft,
              },
            ]}
          >
            <HeartPulse size={17} color={palette.primary} />
          </View>

          <Text
            style={[
              styles.noteText,
              {
                color: palette.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
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
              color: palette.textTertiary,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {text.safeTraining}
        </Text>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* ==========================================================
          EXERCISE DETAIL MODAL
      ========================================================== */}

      <Modal
        visible={!!activeExercise}
        animationType="slide"
        transparent
        onRequestClose={closeExercise}
      >
        <View style={[styles.modalOverlay, { backgroundColor: palette.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeExercise}
          />

          {activeExercise && activeContent && (
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalHandle} />

                <View
                  style={[
                    styles.modalTopRow,
                    {
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.modalMoveBadge,
                      {
                        backgroundColor: palette.primaryFaint,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <Text style={[styles.modalMoveBadgeText, { color: palette.primary }]}>
                      {text.moveNumber} {activeIndex + 1}/{exercises.length}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={closeExercise}
                    style={[
                      styles.modalCloseButton,
                      {
                        backgroundColor: palette.surfaceMuted,
                      },
                    ]}
                  >
                    <X size={18} color={palette.text} />
                  </TouchableOpacity>
                </View>

                <LinearGradient
                  colors={
                    isDark
                      ? ['#2B2438', '#211C2A']
                      : ['#F0EAFE', '#FAF6FE']
                  }
                  style={[
                    styles.demoStage,
                    {
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <MovementFigure
                    type={activeContent.movement}
                    color={palette.primary}
                    muted={isDark ? 'rgba(167,139,250,0.35)' : '#D8C7FA'}
                  />
                </LinearGradient>

                <Text
                  style={[
                    styles.modalTitle,
                    {
                      color: palette.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {activeExercise.title}
                </Text>

                <View
                  style={[
                    styles.modalChipsRow,
                    {
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.modalChip,
                      {
                        backgroundColor: palette.surfaceMuted,
                      },
                    ]}
                  >
                    <Target size={13} color={palette.primary} />

                    <Text style={[styles.modalChipText, { color: palette.textSecondary }]}>
                      {activeContent.target[lang]}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.modalChip,
                      {
                        backgroundColor: palette.surfaceMuted,
                      },
                    ]}
                  >
                    <Activity size={13} color={palette.primary} />

                    <Text style={[styles.modalChipText, { color: palette.textSecondary }]}>
                      {activeContent.level[lang]}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.modalChip,
                      {
                        backgroundColor: palette.surfaceMuted,
                      },
                    ]}
                  >
                    <Clock3 size={13} color={palette.primary} />

                    <Text style={[styles.modalChipText, { color: palette.textSecondary }]}>
                      {'reps' in activeExercise && activeExercise.reps
                        ? `${activeExercise.reps} ${text.reps} × ${activeExercise.sets} ${text.sets}`
                        : `${activeExercise.duration} ${
                            activeExercise.id === 'balance' ? text.seconds : text.duration
                          }`}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.modalSectionHeader,
                    {
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <ListChecks size={16} color={palette.primary} />

                  <Text style={[styles.modalSectionTitle, { color: palette.text }]}>
                    {text.howTo}
                  </Text>
                </View>

                <View style={styles.stepsList}>
                  {activeContent.steps[lang].map((step, stepIndex) => (
                    <View
                      key={stepIndex}
                      style={[
                        styles.stepRow,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.stepNumber,
                          {
                            backgroundColor: palette.primarySoft,
                          },
                        ]}
                      >
                        <Text style={[styles.stepNumberText, { color: palette.primary }]}>
                          {stepIndex + 1}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.stepText,
                          {
                            color: palette.textSecondary,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[
                    styles.tipCard,
                    {
                      backgroundColor: palette.primaryFaint,
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.tipIcon,
                      {
                        backgroundColor: palette.primarySoft,
                      },
                    ]}
                  >
                    <Lightbulb size={16} color={palette.primary} />
                  </View>

                  <View style={styles.tipTextWrap}>
                    <Text style={[styles.tipLabel, { color: palette.primary }]}>
                      {text.formTip}
                    </Text>

                    <Text
                      style={[
                        styles.tipText,
                        {
                          color: palette.textSecondary,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {activeContent.tip[lang]}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.86}
                  onPress={() => toggleExercise(activeExercise.id)}
                  style={[
                    styles.modalCompleteButton,
                    {
                      backgroundColor: activeCompleted ? palette.surfaceMuted : palette.primary,
                      borderWidth: activeCompleted ? 1 : 0,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  {activeCompleted ? (
                    <Check size={18} color={palette.primary} strokeWidth={3} />
                  ) : (
                    <Check size={18} color="#FFFFFF" strokeWidth={3} />
                  )}

                  <Text
                    style={[
                      styles.modalCompleteButtonText,
                      {
                        color: activeCompleted ? palette.primary : '#FFFFFF',
                      },
                    ]}
                  >
                    {activeCompleted ? text.done : text.markComplete}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* ==============================================================
     HEADER
  ============================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 30,
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
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    marginBottom: 8,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  title: {
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },

  /* ==============================================================
     PROGRESS
  ============================================================== */

  progressCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
    marginBottom: 26,
  },

  progressTop: {
    alignItems: 'center',
  },

  progressIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
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
    fontWeight: '900',
  },

  progressPercentLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  progressTrack: {
    height: 7,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressFill: {
    height: '100%',
    borderRadius: 8,
  },

  /* ==============================================================
     SECTION
  ============================================================== */

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  sectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 19,
  },

  /* ==============================================================
     MOOD
  ============================================================== */

  moodScroll: {
    gap: 9,
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

  /* ==============================================================
     WORKOUT HERO
  ============================================================== */

  workoutHero: {
    borderRadius: 25,
    borderWidth: 1,
    padding: 19,
    overflow: 'hidden',
  },

  workoutHeroTop: {
    alignItems: 'center',
  },

  workoutHeroIcon: {
    width: 57,
    height: 57,
    borderRadius: 18,
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

  /* ==============================================================
     EXERCISES
  ============================================================== */

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

  exerciseTouchArea: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
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

  /* ==============================================================
     WEEK
  ============================================================== */

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

  /* ==============================================================
     REPORT
  ============================================================== */

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

  /* ==============================================================
     PERFORMANCE
  ============================================================== */

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

  /* ==============================================================
     INSIGHT
  ============================================================== */

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

  /* ==============================================================
     NOTE
  ============================================================== */

  noteCard: {
    borderRadius: 17,
    borderWidth: 1,
    padding: 13,
    marginTop: 12,
    alignItems: 'center',
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

  /* ==============================================================
     EXERCISE MODAL
  ============================================================== */

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalSheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  modalScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(140,130,150,0.35)',
    alignSelf: 'center',
    marginBottom: 16,
  },

  modalTopRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalMoveBadge: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },

  modalMoveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  demoStage: {
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 18,
    letterSpacing: -0.3,
  },

  modalChipsRow: {
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },

  modalChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  modalSectionHeader: {
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    marginBottom: 12,
  },

  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '900',
  },

  stepsList: {
    gap: 12,
  },

  stepRow: {
    alignItems: 'flex-start',
    gap: 10,
  },

  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  stepNumberText: {
    fontSize: 11,
    fontWeight: '900',
  },

  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 21,
  },

  tipCard: {
    borderRadius: 18,
    padding: 14,
    marginTop: 20,
    gap: 10,
    alignItems: 'flex-start',
  },

  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tipTextWrap: {
    flex: 1,
  },

  tipLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 3,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 19,
  },

  modalCompleteButton: {
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },

  modalCompleteButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
});