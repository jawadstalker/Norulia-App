import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import {
  MotiView,
  AnimatePresence,
} from 'moti';

import { LinearGradient } from 'expo-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Haptics from 'expo-haptics';

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Home,
  PartyPopper,
  PenLine,
  Sparkles,
  User,
  UserRound,
  Users,
  Target,
  TrendingUp,
  Clock3,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing } from '../../constants/theme';


// ============================================================
// TYPES
// ============================================================

type ProtocolMode = 'single' | 'dyad' | 'group';

type ViewMode = 'home' | 'day' | 'report';

interface Bilingual {
  fa: string;
  en: string;
}

interface Task {
  text: Bilingual;
  type: 'checkbox' | 'text';
  unit?: Bilingual;
}

interface DayEntry {
  ayah?: string;
  ayahRef?: string;

  poem?: string;
  poemPoet?: string;

  title?: Bilingual;
  icon?: string;
  desc?: Bilingual;

  tasks: Task[];
}

interface TaskProgress {
  done: boolean;
  value: string;
}

type DayProgress = TaskProgress[];

type Progress = Record<number, DayProgress>;


// ============================================================
// CONTENT
// ============================================================

const AYAHS: {
  text: string;
  ref: string;
}[] = [
  {
    text: 'همانا با سختی، آسانی است.',
    ref: 'سوره انشراح، آیه ۶',
  },
  {
    text: 'خداوند هیچ‌کس را جز به‌اندازه توانش مکلف نمی‌سازد.',
    ref: 'سوره بقره، آیه ۲۸۶',
  },
  {
    text: 'آگاه باشید که تنها با یاد خدا دل‌ها آرام می‌گیرد.',
    ref: 'سوره رعد، آیه ۲۸',
  },
  {
    text: 'و صبرکنندگان را بشارت ده.',
    ref: 'سوره بقره، آیه ۱۵۵',
  },
  {
    text: 'او با شماست، هر کجا که باشید.',
    ref: 'سوره حدید، آیه ۴',
  },
  {
    text: 'از رحمت خدا ناامید نشوید.',
    ref: 'سوره یوسف، آیه ۸۷',
  },
  {
    text: 'پروردگارا، سینه‌ام را گشاده گردان.',
    ref: 'سوره طه، آیه ۲۵',
  },
  {
    text: 'و خداوند با صابران است.',
    ref: 'سوره بقره، آیه ۱۵۳',
  },
  {
    text: 'پس مرا یاد کنید تا شما را یاد کنم.',
    ref: 'سوره بقره، آیه ۱۵۲',
  },
  {
    text: 'و در کارها با یکدیگر مشورت کن.',
    ref: 'سوره آل‌عمران، آیه ۱۵۹',
  },
  {
    text:
      'ای بندگان من که بر خود اسراف کرده‌اید، از رحمت خدا ناامید نشوید.',
    ref: 'سوره زمر، آیه ۵۳',
  },
  {
    text:
      'و هر کس بر خدا توکل کند، او برایش کافی است.',
    ref: 'سوره طلاق، آیه ۳',
  },
  {
    text:
      'همانا با سختی، آسانی است؛ همانا با سختی، آسانی است.',
    ref: 'سوره انشراح، آیات ۵-۶',
  },
  {
    text: 'و خدا دوستدار نیکوکاران است.',
    ref: 'سوره بقره، آیه ۱۹۵',
  },
  {
    text: 'آیا سینه تو را گشاده نساختیم؟',
    ref: 'سوره انشراح، آیه ۱',
  },
];

const POEMS: {
  text: string;
  poet: string;
}[] = [
  {
    text:
      'بنی‌آدم اعضای یک پیکرند\nکه در آفرینش ز یک گوهرند',
    poet: 'سعدی',
  },
  {
    text:
      'بشنو از نی چون حکایت می‌کند\nاز جدایی‌ها شکایت می‌کند',
    poet: 'مولانا',
  },
  {
    text:
      'این قافله عمر عجب می‌گذرد\nدریاب دمی که با طرب می‌گذرد',
    poet: 'خیام',
  },
  {
    text:
      'هر نفس که فرو می‌رود ممد حیات است\nو چون برمی‌آید مفرح ذات',
    poet: 'سعدی',
  },
  {
    text:
      'هر کسی کو دور ماند از اصل خویش\nباز جوید روزگار وصل خویش',
    poet: 'مولانا',
  },
  {
    text:
      'تن آدمی شریف است به جان آدمیت\nنه همین لباس زیباست نشان آدمیت',
    poet: 'سعدی',
  },
];


// ============================================================
// TASKS
// ============================================================

const SINGLE_TASKS: Task[] = [
  {
    text: {
      fa: 'ثبت خلق و خو (۱ تا ۱۰)',
      en: 'Log your mood (1–10)',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'شناسایی یک فکر منفی',
      en: 'Identify one negative thought',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'تمرین تنفس عمیق (۵ دقیقه)',
      en: '5 min deep breathing',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'یک فعالیت لذت‌بخش',
      en: 'One enjoyable activity',
    },
    type: 'checkbox',
  },
  {
    text: {
      fa: 'نوشتن یک نکته مثبت',
      en: 'Write one positive note',
    },
    type: 'checkbox',
  },
];


// ============================================================
// DATA BUILDERS
// ============================================================

function buildSingleData(): DayEntry[] {
  const result: DayEntry[] = [];

  for (let i = 0; i < 31; i++) {
    const ayah = AYAHS[i % AYAHS.length];
    const poem = POEMS[i % POEMS.length];

    result.push({
      ayah: ayah.text,
      ayahRef: ayah.ref,

      poem: poem.text,
      poemPoet: poem.poet,

      tasks: SINGLE_TASKS,
    });
  }

  return result;
}

function buildDyadData(): DayEntry[] {
  return [
    {
      title: {
        fa: 'جلسه ۱: آشنایی و اعتمادسازی',
        en: 'Session 1: Getting acquainted',
      },

      icon: 'users',

      desc: {
        fa: 'تمرینات جفتی برای ایجاد ارتباط مؤثر',
        en: 'Paired exercises for effective connection',
      },

      tasks: [
        {
          text: {
            fa: 'ثبت خلق‌وخو (هر دو نفر)',
            en: 'Log mood (both partners)',
          },
          type: 'checkbox',
        },

        {
          text: {
            fa: 'تمرین جفتی: معرفی و آشنایی',
            en: 'Pair exercise: introductions',
          },
          type: 'checkbox',
        },

        {
          text: {
            fa: 'نوشتن یک نکته مثبت درباره شریک',
            en: 'Write one positive note about your partner',
          },
          type: 'text',
        },

        {
          text: {
            fa: 'گفتگوی ساختاریافته (۵ دقیقه)',
            en: '5 min structured conversation',
          },
          type: 'checkbox',
        },

        {
          text: {
            fa: 'تکلیف مشارکتی برای جلسه بعد',
            en: 'Shared task for next session',
          },
          type: 'text',
        },
      ],
    },
  ];
}

function buildGroupData(): DayEntry[] {
  return [
    {
      title: {
        fa: 'جلسه ۱: معرفی و قوانین گروه',
        en: 'Session 1: Intro & group rules',
      },

      icon: 'group',

      desc: {
        fa: 'تمرینات گروهی برای ایجاد هماهنگی',
        en: 'Group exercises to build cohesion',
      },

      tasks: [
        {
          text: {
            fa: 'ثبت خلق‌وخو (میانگین گروه)',
            en: 'Log mood (group average)',
          },
          type: 'checkbox',
        },

        {
          text: {
            fa: 'تمرین گروهی: معرفی اعضا',
            en: 'Group exercise: introductions',
          },
          type: 'checkbox',
        },

        {
          text: {
            fa: 'نوشتن یک بازخورد برای گروه',
            en: 'Write one piece of feedback for the group',
          },
          type: 'text',
        },

        {
          text: {
            fa: 'بحث گروهی (۱۰ دقیقه)',
            en: '10 min group discussion',
          },
          type: 'checkbox',
        },

        {
          text: {
            fa: 'تکلیف گروهی برای جلسه بعد',
            en: 'Group task for next session',
          },
          type: 'text',
        },
      ],
    },
  ];
}

function getData(mode: ProtocolMode): DayEntry[] {
  if (mode === 'single') {
    return buildSingleData();
  }

  if (mode === 'dyad') {
    return buildDyadData();
  }

  return buildGroupData();
}

function getTotalDays(mode: ProtocolMode): number {
  return mode === 'single' ? 31 : 1;
}


// ============================================================
// STORAGE
// ============================================================

const STORAGE_KEY = (mode: ProtocolMode) =>
  `@neurolia_cbt_progress_${mode}`;


function isTaskDone(
  progress?: TaskProgress
): boolean {
  return !!progress?.done || !!progress?.value?.trim();
}


function freshDayProgress(
  tasks: Task[]
): DayProgress {
  return tasks.map(() => ({
    done: false,
    value: '',
  }));
}


// ============================================================
// SCREEN
// ============================================================

export default function ProtocolScreen() {
  const {
    colors,
    isDark,
  } = useTheme();

  const {
    isRTL,
    language,
  } = useLanguage();

  const fa = language === 'fa';

  const accent = isDark
    ? '#C084FC'
    : '#7C3AED';

  const accentStrong = isDark
    ? '#A855F7'
    : '#6D28D9';

  const background = isDark
    ? '#09090F'
    : '#F7F5FC';

  const card = isDark
    ? '#14141D'
    : '#FFFFFF';

  const cardSecondary = isDark
    ? '#1A1923'
    : '#F1EEFA';

  const softAccent = isDark
    ? 'rgba(168,85,247,0.13)'
    : 'rgba(124,58,237,0.08)';

  const softAccentStrong = isDark
    ? 'rgba(168,85,247,0.22)'
    : 'rgba(124,58,237,0.13)';


  const [mode, setMode] =
    useState<ProtocolMode>('single');

  const [view, setView] =
    useState<ViewMode>('home');

  const [currentDay, setCurrentDay] =
    useState(0);

  const [progress, setProgress] =
    useState<Progress>({});

  const [loaded, setLoaded] =
    useState(false);


  const data = useMemo(
    () => getData(mode),
    [mode]
  );

  const total = getTotalDays(mode);


  const styles = useMemo(
    () =>
      makeStyles(
        colors,
        isDark,
        accent,
        accentStrong,
        background,
        card,
        cardSecondary,
        softAccent,
        softAccentStrong,
        isRTL
      ),
    [
      colors,
      isDark,
      accent,
      accentStrong,
      background,
      card,
      cardSecondary,
      softAccent,
      softAccentStrong,
      isRTL,
    ]
  );


  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {
    let active = true;

    setLoaded(false);

    (async () => {
      try {
        const raw =
          await AsyncStorage.getItem(
            STORAGE_KEY(mode)
          );

        if (!active) return;

        if (raw) {
          const parsed = JSON.parse(raw);

          setProgress(
            parsed &&
            typeof parsed === 'object'
              ? parsed
              : {}
          );
        } else {
          setProgress({});
        }
      } catch {
        if (active) {
          setProgress({});
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [mode]);


  // ==========================================================
  // SAVE
  // ==========================================================

  const persist = useCallback(
    (next: Progress) => {
      AsyncStorage.setItem(
        STORAGE_KEY(mode),
        JSON.stringify(next)
      ).catch(() => {});
    },
    [mode]
  );


  // ==========================================================
  // ENSURE DAY
  // ==========================================================

  const withDayEnsured =
    useCallback(
      (
        base: Progress,
        dayIdx: number
      ): Progress => {
        const tasks =
          data[dayIdx]?.tasks;

        if (!tasks) {
          return base;
        }

        const existing =
          base[dayIdx];

        if (
          existing &&
          existing.length === tasks.length
        ) {
          return base;
        }

        return {
          ...base,
          [dayIdx]:
            freshDayProgress(tasks),
        };
      },
      [data]
    );


  useEffect(() => {
    if (!loaded) return;

    setProgress(prev => {
      let next = prev;

      const upper =
        view === 'home'
          ? total
          : Math.min(
              total,
              currentDay + 1
            );

      for (let i = 0; i < upper; i++) {
        next =
          withDayEnsured(
            next,
            i
          );
      }

      return next;
    });
  }, [
    loaded,
    view,
    currentDay,
    total,
    withDayEnsured,
  ]);


  // ==========================================================
  // MODE
  // ==========================================================

  const switchMode = (
    nextMode: ProtocolMode
  ) => {
    if (nextMode === mode) return;

    Haptics.selectionAsync()
      .catch(() => {});

    setMode(nextMode);
    setCurrentDay(0);
    setView('home');
  };


  // ==========================================================
  // TASK
  // ==========================================================

  const toggleTask = (
    dayIdx: number,
    taskIdx: number
  ) => {
    const tasks =
      data[dayIdx]?.tasks || [];

    setProgress(prev => {
      const ensured =
        withDayEnsured(
          prev,
          dayIdx
        );

      const dayProg =
        [...ensured[dayIdx]];

      const wasDone =
        isTaskDone(
          dayProg[taskIdx]
        );

      dayProg[taskIdx] = {
        ...dayProg[taskIdx],
        done:
          !dayProg[taskIdx].done,
      };

      const next = {
        ...ensured,
        [dayIdx]: dayProg,
      };

      persist(next);

      const doneCount =
        dayProg.filter(
          isTaskDone
        ).length;

      if (
        !wasDone &&
        doneCount === tasks.length
      ) {
        Haptics
          .notificationAsync(
            Haptics
              .NotificationFeedbackType
              .Success
          )
          .catch(() => {});
      } else {
        Haptics
          .impactAsync(
            Haptics
              .ImpactFeedbackStyle
              .Light
          )
          .catch(() => {});
      }

      return next;
    });
  };


  const updateEntry = (
    dayIdx: number,
    taskIdx: number,
    value: string
  ) => {
    setProgress(prev => {
      const ensured =
        withDayEnsured(
          prev,
          dayIdx
        );

      const dayProg =
        [...ensured[dayIdx]];

      dayProg[taskIdx] = {
        ...dayProg[taskIdx],
        value,
      };

      const next = {
        ...ensured,
        [dayIdx]: dayProg,
      };

      persist(next);

      return next;
    });
  };


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goHome = () => {
    Haptics.selectionAsync()
      .catch(() => {});

    setView('home');
  };


  const goToDay = (
    dayIdx: number
  ) => {
    Haptics.selectionAsync()
      .catch(() => {});

    setCurrentDay(dayIdx);
    setView('day');
  };


  const goToReport = () => {
    Haptics.selectionAsync()
      .catch(() => {});

    setView('report');
  };


  const prevDay = () => {
    if (currentDay <= 0) return;

    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});

    setCurrentDay(
      day => day - 1
    );
  };


  const nextDay = () => {
    if (
      currentDay >=
      total - 1
    ) {
      return;
    }

    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});

    setCurrentDay(
      day => day + 1
    );
  };


  // ==========================================================
  // PROGRESS
  // ==========================================================

  const dayDoneCount =
    useCallback(
      (dayIdx: number) => {
        const dayProg =
          progress[dayIdx];

        if (!dayProg) {
          return 0;
        }

        return dayProg.filter(
          isTaskDone
        ).length;
      },
      [progress]
    );


  const dayProgressPercent =
    useCallback(
      (dayIdx: number) => {
        const tasks =
          data[dayIdx].tasks;

        const dayProg =
          progress[dayIdx] ||
          freshDayProgress(tasks);

        const done =
          dayProg.filter(
            isTaskDone
          ).length;

        return tasks.length
          ? Math.round(
              (done /
                tasks.length) *
                100
            )
          : 0;
      },
      [data, progress]
    );


  const overallProgress =
    useMemo(() => {
      if (!loaded) return 0;

      let totalTasks = 0;
      let doneTasks = 0;

      for (
        let i = 0;
        i < total;
        i++
      ) {
        const tasks =
          data[i].tasks;

        const dayProg =
          progress[i] ||
          freshDayProgress(tasks);

        totalTasks +=
          tasks.length;

        doneTasks +=
          dayProg.filter(
            isTaskDone
          ).length;
      }

      return totalTasks
        ? Math.round(
            (doneTasks /
              totalTasks) *
              100
          )
        : 0;
    }, [
      loaded,
      progress,
      data,
      total,
    ]);


  // ==========================================================
  // REPORT STATS
  // ==========================================================

  const stats = useMemo(() => {
    let totalTasks = 0;
    let doneTasks = 0;
    let daysCompleted = 0;

    const undone: string[] = [];

    const label =
      mode === 'single'
        ? fa
          ? 'روز'
          : 'Day'
        : fa
        ? 'جلسه'
        : 'Session';

    for (
      let dayIdx = 0;
      dayIdx < total;
      dayIdx++
    ) {
      const tasks =
        data[dayIdx].tasks;

      const dayProg =
        progress[dayIdx] ||
        freshDayProgress(tasks);

      let dayDone = 0;

      tasks.forEach(
        (task, index) => {
          totalTasks++;

          if (
            isTaskDone(
              dayProg[index]
            )
          ) {
            doneTasks++;
            dayDone++;
          } else {
            undone.push(
              `${label} ${
                dayIdx + 1
              }: ${
                fa
                  ? task.text.fa
                  : task.text.en
              }`
            );
          }
        }
      );

      if (
        dayDone ===
        tasks.length
      ) {
        daysCompleted++;
      }
    }

    return {
      total,
      totalTasks,
      doneTasks,
      undoneCount:
        undone.length,
      daysCompleted,
      percent:
        totalTasks
          ? Math.round(
              (doneTasks /
                totalTasks) *
                100
            )
          : 0,
      undone,
    };
  }, [
    progress,
    data,
    total,
    mode,
    fa,
  ]);


  const dayLabel =
    mode === 'single'
      ? fa
        ? 'روز'
        : 'Day'
      : fa
      ? 'جلسه'
      : 'Session';


  // ==========================================================
  // HEADER
  // ==========================================================

  const Header = ({
    title,
    subtitle,
    onBack,
    right,
  }: {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    right?: React.ReactNode;
  }) => (
    <View style={styles.header}>

      {/* LEFT = BACK BUTTON */}

      <View style={styles.headerLeft}>
        {onBack ? (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onBack}
            style={
              styles.headerBack
            }
          >
            {isRTL ? (
              <ArrowRight
                size={19}
                color={colors.text}
                strokeWidth={2}
              />
            ) : (
              <ArrowLeft
                size={19}
                color={colors.text}
                strokeWidth={2}
              />
            )}
          </TouchableOpacity>
        ) : (
          <View
            style={
              styles.headerPlaceholder
            }
          />
        )}
      </View>


      {/* CENTER */}

      <View
        style={
          styles.headerCenter
        }
      >
        {subtitle && (
          <Text
            style={
              styles.headerSubtitle
            }
          >
            {subtitle}
          </Text>
        )}

        <Text
          style={
            styles.headerTitle
          }
        >
          {title}
        </Text>
      </View>


      {/* RIGHT */}

      <View
        style={
          styles.headerRight
        }
      >
        {right || (
          <View
            style={
              styles.headerPlaceholder
            }
          />
        )}
      </View>
    </View>
  );


  // ==========================================================
  // MODE TABS
  // ==========================================================

  const ModeTabs = () => (
    <View
      style={
        styles.modeTabs
      }
    >
      {(
        [
          'single',
          'dyad',
          'group',
        ] as ProtocolMode[]
      ).map(
        currentMode => {
          const active =
            currentMode ===
            mode;

          const Icon =
            currentMode ===
            'single'
              ? User
              : currentMode ===
                'dyad'
              ? UserRound
              : Users;

          const label =
            currentMode ===
            'single'
              ? fa
                ? 'انفرادی'
                : 'Solo'
              : currentMode ===
                'dyad'
              ? fa
                ? 'دونفره'
                : 'Pair'
              : fa
              ? 'گروهی'
              : 'Group';

          return (
            <TouchableOpacity
              key={
                currentMode
              }
              activeOpacity={
                0.8
              }
              onPress={() =>
                switchMode(
                  currentMode
                )
              }
              style={[
                styles.modeTab,
                active &&
                  styles.modeTabActive,
              ]}
            >
              <Icon
                size={17}
                strokeWidth={
                  active
                    ? 2.3
                    : 1.8
                }
                color={
                  active
                    ? accentStrong
                    : colors.textTertiary
                }
              />

              <Text
                style={[
                  styles.modeTabText,
                  {
                    color:
                      active
                        ? colors.text
                        : colors.textTertiary,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        }
      )}
    </View>
  );


  // ==========================================================
  // HOME
  // ==========================================================

  const renderHome = () => (
    <MotiView
      key="home"
      from={{
        opacity: 0,
        translateY: 15,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
      }}
      transition={{
        type: 'timing',
        duration: 260,
      }}
    >

      <Header
        subtitle={
          fa
            ? 'برنامه شخصی شما'
            : 'Your personal plan'
        }
        title={
          fa
            ? 'پروتکل شما'
            : 'Your protocol'
        }
        right={
          <View
            style={
              styles.progressMini
            }
          >
            <View
              style={[
                styles.progressMiniTrack,
                {
                  backgroundColor:
                    isDark
                      ? '#292833'
                      : '#E5E0ED',
                },
              ]}
            >
              <View
                style={[
                  styles.progressMiniFill,
                  {
                    width:
                      `${overallProgress}%`,
                    backgroundColor:
                      accentStrong,
                  },
                ]}
              />
            </View>

            <Text
              style={
                styles.progressMiniText
              }
            >
              {overallProgress}%
            </Text>
          </View>
        }
      />


      <ModeTabs />


      {/* HERO */}

      <View
        style={
          styles.heroCard
        }
      >
        <LinearGradient
          colors={
            isDark
              ? [
                  '#241A35',
                  '#15131E',
                ]
              : [
                  '#EFE7FF',
                  '#FFFFFF',
                ]
          }
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={
            styles.heroGradient
          }
        >

          <View
            style={
              styles.heroIcon
            }
          >
            <Target
              size={23}
              color={accentStrong}
              strokeWidth={2}
            />
          </View>

          <View
            style={
              styles.heroContent
            }
          >
            <Text
              style={
                styles.heroEyebrow
              }
            >
              {mode ===
              'single'
                ? fa
                  ? 'پروتکل ۳۱ روزه'
                  : '31 DAY PROTOCOL'
                : fa
                ? 'پروتکل جلسه‌ای'
                : 'SESSION PROTOCOL'}
            </Text>

            <Text
              style={
                styles.heroTitle
              }
            >
              {mode ===
              'single'
                ? fa
                  ? 'هر روز یک قدم بهتر'
                  : 'One better step every day'
                : fa
                ? 'با تمرکز ادامه بده'
                : 'Keep moving with focus'}
            </Text>

            <Text
              style={
                styles.heroDescription
              }
            >
              {mode ===
              'single'
                ? fa
                  ? 'تمرین‌های کوچک و پیوسته برای ساختن یک مسیر بهتر.'
                  : 'Small, consistent exercises for building a better routine.'
                : fa
                ? 'تمرین‌ها را انجام بده و پیشرفت خود را دنبال کن.'
                : 'Complete the exercises and track your progress.'}
            </Text>
          </View>

        </LinearGradient>
      </View>


      {/* TODAY CARD */}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          goToDay(
            currentDay
          )
        }
        style={
          styles.todayCard
        }
      >

        <View
          style={
            styles.todayIcon
          }
        >
          <CalendarDays
            size={20}
            color={
              accentStrong
            }
          />
        </View>

        <View
          style={
            styles.todayContent
          }
        >
          <Text
            style={
              styles.todayLabel
            }
          >
            {fa
              ? 'ادامه برنامه'
              : 'Continue protocol'}
          </Text>

          <Text
            style={
              styles.todayTitle
            }
          >
            {dayLabel}{' '}
            {currentDay + 1}
          </Text>

          <Text
            style={
              styles.todayDescription
            }
          >
            {fa
              ? 'تمرین‌های امروز را انجام بده'
              : "Complete today's exercises"}
          </Text>
        </View>

        <View
          style={
            styles.todayPercent
          }
        >
          <Text
            style={
              styles.todayPercentText
            }
          >
            {
              dayProgressPercent(
                currentDay
              )
            }%
          </Text>
        </View>

      </TouchableOpacity>


      {/* DAYS */}

      <View
        style={
          styles.sectionHeader
        }
      >
        <View>
          <Text
            style={
              styles.sectionTitle
            }
          >
            {mode ===
            'single'
              ? fa
                ? 'روزهای پروتکل'
                : 'Protocol days'
              : fa
              ? 'جلسه پروتکل'
              : 'Protocol session'}
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }
          >
            {stats.daysCompleted}{' '}
            {fa
              ? 'مورد کامل شده'
              : 'completed'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={
            goToReport
          }
          style={
            styles.reportIconButton
          }
        >
          <BarChart3
            size={18}
            color={
              accentStrong
            }
          />
        </TouchableOpacity>
      </View>


      <View
        style={
          styles.daysGrid
        }
      >
        {Array.from({
          length: total,
        }).map(
          (_, i) => {
            const done =
              dayDoneCount(i);

            const percent =
              dayProgressPercent(
                i
              );

            const isDone =
              loaded &&
              done ===
                data[i]
                  .tasks
                  .length;

            const isCurrent =
              i ===
              currentDay;

            return (
              <MotiView
                key={i}
                from={{
                  opacity: 0,
                  scale: 0.92,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  type: 'timing',
                  duration: 220,
                  delay:
                    Math.min(
                      i,
                      15
                    ) * 18,
                }}
                style={
                  styles.dayCardWrap
                }
              >
                <TouchableOpacity
                  activeOpacity={
                    0.8
                  }
                  onPress={() =>
                    goToDay(i)
                  }
                  style={[
                    styles.dayCard,
                    isDone &&
                      styles.dayCardDone,
                    isCurrent &&
                      !isDone &&
                      styles.dayCardCurrent,
                  ]}
                >

                  {isDone && (
                    <View
                      style={
                        styles.dayStatus
                      }
                    >
                      <Check
                        size={10}
                        color="#FFFFFF"
                        strokeWidth={
                          3
                        }
                      />
                    </View>
                  )}

                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color:
                          isDone
                            ? accentStrong
                            : colors.text,
                      },
                    ]}
                  >
                    {total === 1
                      ? '1'
                      : i + 1}
                  </Text>

                  <View
                    style={[
                      styles.dayProgressTrack,
                      {
                        backgroundColor:
                          isDark
                            ? '#282732'
                            : '#E8E3F0',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dayProgressFill,
                        {
                          width:
                            `${percent}%`,
                          backgroundColor:
                            isDone
                              ? accentStrong
                              : accent,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={
                      styles.dayProgressText
                    }
                  >
                    {percent}%
                  </Text>

                </TouchableOpacity>
              </MotiView>
            );
          }
        )}
      </View>


      <TouchableOpacity
        activeOpacity={0.87}
        onPress={
          goToReport
        }
        style={
          styles.reportButton
        }
      >
        <LinearGradient
          colors={[
            accentStrong,
            accent,
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={
            styles.reportButtonGradient
          }
        >
          <TrendingUp
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.reportButtonText
            }
          >
            {fa
              ? 'مشاهده گزارش پیشرفت'
              : 'View progress report'}
          </Text>

          {isRTL ? (
            <ChevronLeft
              size={17}
              color="#FFFFFF"
            />
          ) : (
            <ChevronRight
              size={17}
              color="#FFFFFF"
            />
          )}
        </LinearGradient>
      </TouchableOpacity>

    </MotiView>
  );


  // ==========================================================
  // DAY
  // ==========================================================

  const renderDay = () => {
    const dayData =
      data[currentDay];

    const dayProg =
      progress[currentDay] ||
      freshDayProgress(
        dayData.tasks
      );

    const currentPercent =
      dayProgressPercent(
        currentDay
      );

    return (
      <MotiView
        key="day"
        from={{
          opacity: 0,
          translateY: 15,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        transition={{
          type: 'timing',
          duration: 260,
        }}
      >

        <Header
          onBack={
            goHome
          }
          subtitle={
            mode ===
            'single'
              ? fa
                ? 'برنامه روزانه'
                : 'Daily protocol'
              : fa
              ? 'برنامه جلسه‌ای'
              : 'Session protocol'
          }
          title={`${dayLabel} ${
            currentDay + 1
          }`}
          right={
            <TouchableOpacity
              activeOpacity={
                0.75
              }
              onPress={
                goToReport
              }
              style={
                styles.headerIconButton
              }
            >
              <BarChart3
                size={18}
                color={
                  colors.text
                }
              />
            </TouchableOpacity>
          }
        />


        {/* DAY HERO */}

        <View
          style={
            styles.dayHero
          }
        >
          <View
            style={
              styles.dayHeroIcon
            }
          >
            <CalendarDays
              size={20}
              color={
                accentStrong
              }
            />
          </View>

          <View
            style={
              styles.dayHeroContent
            }
          >
            <Text
              style={
                styles.dayHeroLabel
              }
            >
              {fa
                ? 'پیشرفت امروز'
                : "Today's progress"}
            </Text>

            <Text
              style={
                styles.dayHeroTitle
              }
            >
              {dayLabel}{' '}
              {currentDay + 1}
              {' / '}
              {total}
            </Text>
          </View>

          <View
            style={
              styles.dayHeroPercent
            }
          >
            <Text
              style={
                styles.dayHeroPercentText
              }
            >
              {currentPercent}%
            </Text>
          </View>
        </View>


        {/* QUOTE */}

        {mode ===
        'single' ? (
          <>
            <View
              style={
                styles.quoteCard
              }
            >
              <View
                style={
                  styles.quoteHeader
                }
              >
                <View
                  style={
                    styles.quoteIcon
                  }
                >
                  <Sparkles
                    size={17}
                    color={
                      accentStrong
                    }
                  />
                </View>

                <Text
                  style={
                    styles.quoteLabel
                  }
                >
                  {fa
                    ? 'پیام امروز'
                    : "Today's reflection"}
                </Text>
              </View>

              <Text
                style={
                  styles.ayahText
                }
              >
                {dayData.ayah}
              </Text>

              <View
                style={
                  styles.quoteDivider
                }
              />

              <Text
                style={
                  styles.ayahRef
                }
              >
                {dayData.ayahRef}
              </Text>
            </View>


            {/* POEM */}

            <View
              style={
                styles.poemCard
              }
            >
              <View
                style={
                  styles.quoteHeader
                }
              >
                <View
                  style={[
                    styles.quoteIcon,
                    {
                      backgroundColor:
                        isDark
                          ? 'rgba(255,255,255,0.06)'
                          : '#F3F0F8',
                    },
                  ]}
                >
                  <BookOpen
                    size={17}
                    color={
                      colors.textSecondary
                    }
                  />
                </View>

                <Text
                  style={
                    styles.quoteLabel
                  }
                >
                  {fa
                    ? 'بخش فرهنگی'
                    : 'Cultural reflection'}
                </Text>
              </View>

              <Text
                style={
                  styles.poemText
                }
              >
                {dayData.poem}
              </Text>

              <Text
                style={
                  styles.poemPoet
                }
              >
                {dayData.poemPoet}
              </Text>
            </View>
          </>
        ) : (
          <View
            style={
              styles.sessionCard
            }
          >
            <View
              style={
                styles.sessionIcon
              }
            >
              {mode ===
              'dyad' ? (
                <UserRound
                  size={24}
                  color={
                    accentStrong
                  }
                />
              ) : (
                <Users
                  size={24}
                  color={
                    accentStrong
                  }
                />
              )}
            </View>

            <Text
              style={
                styles.sessionTitle
              }
            >
              {fa
                ? dayData.title
                    ?.fa
                : dayData.title
                    ?.en}
            </Text>

            <Text
              style={
                styles.sessionDescription
              }
            >
              {fa
                ? dayData.desc
                    ?.fa
                : dayData.desc
                    ?.en}
            </Text>
          </View>
        )}


        {/* TASK HEADER */}

        <View
          style={
            styles.tasksHeader
          }
        >
          <View>
            <Text
              style={
                styles.tasksTitle
              }
            >
              {fa
                ? 'تمرین‌های امروز'
                : "Today's exercises"}
            </Text>

            <Text
              style={
                styles.tasksSubtitle
              }
            >
              {dayDoneCount(
                currentDay
              )}{' '}
              /{' '}
              {
                dayData.tasks
                  .length
              }{' '}
              {fa
                ? 'انجام شده'
                : 'completed'}
            </Text>
          </View>

          <View
            style={
              styles.tasksHeaderIcon
            }
          >
            <ClipboardCheck
              size={19}
              color={
                accentStrong
              }
            />
          </View>
        </View>


        {/* TASK LIST */}

        <View
          style={
            styles.taskList
          }
        >
          {dayData.tasks.map(
            (
              task,
              index
            ) => {
              const prog =
                dayProg[index] ||
                {
                  done: false,
                  value: '',
                };

              const done =
                isTaskDone(
                  prog
                );

              const label =
                fa
                  ? task.text.fa
                  : task.text.en;

              return (
                <MotiView
                  key={index}
                  from={{
                    opacity: 0,
                    translateY: 8,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 220,
                    delay:
                      index *
                      35,
                  }}
                >
                  <View
                    style={[
                      styles.taskCard,
                      done &&
                        styles.taskCardDone,
                    ]}
                  >

                    {task.type ===
                    'checkbox' ? (
                      <TouchableOpacity
                        activeOpacity={
                          0.75
                        }
                        onPress={() =>
                          toggleTask(
                            currentDay,
                            index
                          )
                        }
                        style={[
                          styles.checkbox,
                          done &&
                            styles.checkboxDone,
                        ]}
                      >
                        {done && (
                          <Check
                            size={14}
                            color="#FFFFFF"
                            strokeWidth={
                              3
                            }
                          />
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={
                          styles.taskTypeIcon
                        }
                      >
                        <PenLine
                          size={16}
                          color={
                            accentStrong
                          }
                        />
                      </View>
                    )}

                    <View
                      style={
                        styles.taskContent
                      }
                    >
                      <Text
                        style={[
                          styles.taskText,
                          done &&
                            styles.taskTextDone,
                        ]}
                      >
                        {label}
                      </Text>

                      {task.type ===
                        'text' && (
                        <TextInput
                          value={
                            prog.value
                          }
                          onChangeText={value =>
                            updateEntry(
                              currentDay,
                              index,
                              value
                            )
                          }
                          placeholder={
                            fa
                              ? 'یادداشت خود را بنویسید...'
                              : 'Write your note...'
                          }
                          placeholderTextColor={
                            colors.textTertiary
                          }
                          multiline
                          style={[
                            styles.taskInput,
                            {
                              color:
                                colors.text,
                              backgroundColor:
                                isDark
                                  ? '#0F0F16'
                                  : '#F8F7FB',
                              borderColor:
                                colors.border,
                              textAlign:
                                isRTL
                                  ? 'right'
                                  : 'left',
                            },
                          ]}
                        />
                      )}
                    </View>

                    {done && (
                      <CircleCheck
                        size={19}
                        color={
                          accentStrong
                        }
                        strokeWidth={
                          2.2
                        }
                      />
                    )}

                  </View>
                </MotiView>
              );
            }
          )}
        </View>


        {/* PREV / NEXT */}

        {mode ===
          'single' && (
          <View
            style={
              styles.navigationRow
            }
          >

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              onPress={
                prevDay
              }
              disabled={
                currentDay ===
                0
              }
              style={[
                styles.navigationButton,
                currentDay ===
                  0 &&
                  styles.navigationDisabled,
              ]}
            >
              {isRTL ? (
                <ChevronRight
                  size={17}
                  color={
                    colors.textSecondary
                  }
                />
              ) : (
                <ChevronLeft
                  size={17}
                  color={
                    colors.textSecondary
                  }
                />
              )}

              <Text
                style={
                  styles.navigationText
                }
              >
                {fa
                  ? 'روز قبل'
                  : 'Previous day'}
              </Text>
            </TouchableOpacity>


            <TouchableOpacity
              activeOpacity={
                0.8
              }
              onPress={
                nextDay
              }
              disabled={
                currentDay ===
                total - 1
              }
              style={[
                styles.navigationButton,
                currentDay ===
                  total - 1 &&
                  styles.navigationDisabled,
              ]}
            >
              <Text
                style={
                  styles.navigationText
                }
              >
                {fa
                  ? 'روز بعد'
                  : 'Next day'}
              </Text>

              {isRTL ? (
                <ChevronLeft
                  size={17}
                  color={
                    colors.textSecondary
                  }
                />
              ) : (
                <ChevronRight
                  size={17}
                  color={
                    colors.textSecondary
                  }
                />
              )}
            </TouchableOpacity>

          </View>
        )}


        <TouchableOpacity
          activeOpacity={
            0.86
          }
          onPress={
            goToReport
          }
          style={
            styles.reportButton
          }
        >
          <LinearGradient
            colors={[
              accentStrong,
              accent,
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={
              styles.reportButtonGradient
            }
          >
            <BarChart3
              size={18}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.reportButtonText
              }
            >
              {fa
                ? `گزارش ${dayLabel}`
                : `${dayLabel} report`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

      </MotiView>
    );
  };


  // ==========================================================
  // REPORT
  // ==========================================================

  const renderReport = () => (
    <MotiView
      key="report"
      from={{
        opacity: 0,
        translateY: 15,
      }}
      animate={{
        opacity: 1,
        translateY: 0,
      }}
      transition={{
        type: 'timing',
        duration: 260,
      }}
    >

      <Header
        onBack={
          goHome
        }
        subtitle={
          fa
            ? 'خلاصه عملکرد'
            : 'Performance summary'
        }
        title={
          fa
            ? 'گزارش پیشرفت'
            : 'Progress report'
        }
      />


      {/* REPORT HERO */}

      <View
        style={
          styles.reportHero
        }
      >

        <View
          style={
            styles.reportProgressCircle
          }
        >
          <Text
            style={
              styles.reportProgressValue
            }
          >
            {stats.percent}%
          </Text>

          <Text
            style={
              styles.reportProgressLabel
            }
          >
            {fa
              ? 'پیشرفت'
              : 'Progress'}
          </Text>
        </View>


        <View
          style={
            styles.reportHeroContent
          }
        >
          <Text
            style={
              styles.reportHeroTitle
            }
          >
            {stats.percent ===
            100
              ? fa
                ? 'پروتکل کامل شد'
                : 'Protocol completed'
              : fa
              ? 'به مسیرت ادامه بده'
              : 'Keep going'}
          </Text>

          <Text
            style={
              styles.reportHeroDescription
            }
          >
            {fa
              ? `${stats.doneTasks} کار از ${stats.totalTasks} کار انجام شده است.`
              : `${stats.doneTasks} of ${stats.totalTasks} tasks completed.`}
          </Text>
        </View>

      </View>


      {/* STATS */}

      <View
        style={
          styles.statsGrid
        }
      >

        <View
          style={
            styles.statCard
          }
        >
          <View
            style={
              styles.statIcon
            }
          >
            <CalendarDays
              size={18}
              color={
                accentStrong
              }
            />
          </View>

          <Text
            style={
              styles.statValue
            }
          >
            {
              stats.daysCompleted
            }
            /
            {
              stats.total
            }
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            {fa
              ? `${dayLabel} کامل`
              : `${dayLabel}s completed`}
          </Text>
        </View>


        <View
          style={
            styles.statCard
          }
        >
          <View
            style={
              styles.statIcon
            }
          >
            <CircleCheck
              size={18}
              color={
                accentStrong
              }
            />
          </View>

          <Text
            style={
              styles.statValue
            }
          >
            {
              stats.doneTasks
            }
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            {fa
              ? 'کار انجام شده'
              : 'Tasks done'}
          </Text>
        </View>


        <View
          style={
            styles.statCard
          }
        >
          <View
            style={
              styles.statIcon
            }
          >
            <Clock3
              size={18}
              color={
                colors.textSecondary
              }
            />
          </View>

          <Text
            style={
              styles.statValue
            }
          >
            {
              stats.undoneCount
            }
          </Text>

          <Text
            style={
              styles.statLabel
            }
          >
            {fa
              ? 'در انتظار'
              : 'Pending'}
          </Text>
        </View>

      </View>


      {/* REMAINING */}

      <View
        style={
          styles.reportSection
        }
      >

        <View
          style={
            styles.reportSectionHeader
          }
        >
          <Text
            style={
              styles.reportSectionTitle
            }
          >
            {fa
              ? 'موارد باقی‌مانده'
              : 'Remaining tasks'}
          </Text>

          <View
            style={
              styles.pendingBadge
            }
          >
            <Text
              style={
                styles.pendingBadgeText
              }
            >
              {
                stats.undoneCount
              }
            </Text>
          </View>
        </View>


        <View
          style={
            styles.remainingList
          }
        >
          {stats.undone
            .length > 0 ? (
            stats.undone
              .slice(
                0,
                60
              )
              .map(
                (
                  line,
                  index
                ) => (
                  <View
                    key={
                      index
                    }
                    style={
                      styles.remainingItem
                    }
                  >
                    <View
                      style={
                        styles.remainingDot
                      }
                    />

                    <Text
                      style={
                        styles.reportLine
                      }
                    >
                      {line}
                    </Text>
                  </View>
                )
              )
          ) : (
            <View
              style={
                styles.allDone
              }
            >
              <View
                style={
                  styles.allDoneIcon
                }
              >
                <PartyPopper
                  size={21}
                  color={
                    colors.success
                  }
                />
              </View>

              <Text
                style={[
                  styles.allDoneTitle,
                  {
                    color:
                      colors.success,
                  },
                ]}
              >
                {fa
                  ? 'همه کارها انجام شده!'
                  : 'All tasks completed!'}
              </Text>

              <Text
                style={
                  styles.allDoneDescription
                }
              >
                {fa
                  ? 'عالی پیش رفتی. همین روند را ادامه بده.'
                  : 'Great work. Keep the momentum going.'}
              </Text>
            </View>
          )}
        </View>
      </View>


      <TouchableOpacity
        activeOpacity={
          0.86
        }
        onPress={
          goHome
        }
        style={
          styles.reportButton
        }
      >
        <LinearGradient
          colors={[
            accentStrong,
            accent,
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={
            styles.reportButtonGradient
          }
        >
          <Home
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.reportButtonText
            }
          >
            {fa
              ? 'بازگشت به پروتکل'
              : 'Back to protocol'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>


      <TouchableOpacity
        activeOpacity={
          0.8
        }
        onPress={() =>
          setView('day')
        }
        style={
          styles.secondaryButton
        }
      >
        <CalendarDays
          size={17}
          color={
            colors.textSecondary
          }
        />

        <Text
          style={
            styles.secondaryButtonText
          }
        >
          {fa
            ? `مشاهده ${dayLabel} فعلی`
            : `View current ${dayLabel.toLowerCase()}`}
        </Text>
      </TouchableOpacity>

    </MotiView>
  );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              '#09090F',
              '#11111A',
            ]
          : [
              '#F7F5FC',
              '#FFFFFF',
            ]
      }
      style={
        styles.container
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.content
        }
      >

        <AnimatePresence
          exitBeforeEnter
        >
          {view ===
            'home' &&
            renderHome()}

          {view ===
            'day' &&
            renderDay()}

          {view ===
            'report' &&
            renderReport()}
        </AnimatePresence>

      </ScrollView>

    </LinearGradient>
  );
}


// ============================================================
// STYLES
// ============================================================

function makeStyles(
  colors: any,
  isDark: boolean,
  accent: string,
  accentStrong: string,
  background: string,
  card: string,
  cardSecondary: string,
  softAccent: string,
  softAccentStrong: string,
  isRTL: boolean
) {
  return StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        background,
    },

    content: {
      paddingTop: 55,
      paddingHorizontal:
        Spacing.lg,
      paddingBottom: 120,
    },


    // ========================================================
    // HEADER
    // ========================================================

    header: {
      minHeight: 58,

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 18,
    },

    /*
     * مهم:
     * Back همیشه سمت چپ صفحه است.
     */

    headerLeft: {
      width: 44,

      alignItems:
        'flex-start',

      justifyContent:
        'center',
    },

    headerRight: {
      width: 44,

      alignItems:
        'flex-end',

      justifyContent:
        'center',
    },

    headerCenter: {
      flex: 1,

      alignItems:
        'center',

      paddingHorizontal: 8,
    },

    headerPlaceholder: {
      width: 40,
      height: 40,
    },

    headerBack: {
      width: 40,
      height: 40,

      borderRadius: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    headerIconButton: {
      width: 40,
      height: 40,

      borderRadius: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    headerSubtitle: {
      fontSize: 11,

      fontWeight: '600',

      color:
        colors.textTertiary,

      marginBottom: 3,

      textAlign:
        'center',
    },

    headerTitle: {
      fontSize: 20,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        'center',

      letterSpacing:
        -0.2,
    },


    // ========================================================
    // MINI PROGRESS
    // ========================================================

    progressMini: {
      width: 44,

      alignItems:
        'center',

      gap: 4,
    },

    progressMiniTrack: {
      width: 38,
      height: 4,

      borderRadius: 4,

      overflow:
        'hidden',
    },

    progressMiniFill: {
      height: '100%',

      borderRadius: 4,
    },

    progressMiniText: {
      fontSize: 10,

      fontWeight: '800',

      color:
        colors.textSecondary,
    },


    // ========================================================
    // MODE TABS
    // ========================================================

    modeTabs: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      padding: 4,

      borderRadius: 18,

      backgroundColor:
        cardSecondary,

      borderWidth: 1,

      borderColor:
        colors.border,

      marginBottom: 16,

      gap: 4,
    },

    modeTab: {
      flex: 1,

      minHeight: 43,

      borderRadius: 14,

      alignItems:
        'center',

      justifyContent:
        'center',

      flexDirection:
        'row',

      gap: 6,
    },

    modeTabActive: {
      backgroundColor:
        card,

      shadowColor:
        '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        isDark
          ? 0.18
          : 0.06,

      shadowRadius: 6,

      elevation: 2,
    },

    modeTabText: {
      fontSize: 12,

      fontWeight: '700',
    },


    // ========================================================
    // HERO
    // ========================================================

    heroCard: {
      borderRadius: 26,

      overflow:
        'hidden',

      marginBottom: 14,

      borderWidth: 1,

      borderColor:
        colors.border,
    },

    heroGradient: {
      minHeight: 155,

      padding: 20,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'flex-start',

      gap: 14,
    },

    heroIcon: {
      width: 46,
      height: 46,

      borderRadius: 16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccentStrong,
    },

    heroContent: {
      flex: 1,
    },

    heroEyebrow: {
      fontSize: 10,

      fontWeight: '800',

      color:
        accentStrong,

      letterSpacing:
        0.7,

      marginBottom: 7,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    heroTitle: {
      fontSize: 19,

      lineHeight: 27,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',

      marginBottom: 7,
    },

    heroDescription: {
      fontSize: 12,

      lineHeight: 19,

      color:
        colors.textSecondary,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },


    // ========================================================
    // TODAY
    // ========================================================

    todayCard: {
      minHeight: 92,

      borderRadius: 22,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      marginBottom: 22,

      padding: 14,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      gap: 12,
    },

    todayIcon: {
      width: 46,
      height: 46,

      borderRadius: 15,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    todayContent: {
      flex: 1,
    },

    todayLabel: {
      fontSize: 10,

      fontWeight: '700',

      color:
        colors.textTertiary,

      marginBottom: 2,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    todayTitle: {
      fontSize: 16,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    todayDescription: {
      fontSize: 10,

      marginTop: 3,

      color:
        colors.textSecondary,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    todayPercent: {
      width: 52,
      height: 52,

      borderRadius: 17,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    todayPercentText: {
      fontSize: 13,

      fontWeight: '900',

      color:
        accentStrong,
    },


    // ========================================================
    // SECTION
    // ========================================================

    sectionHeader: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 16,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    sectionSubtitle: {
      marginTop: 3,

      fontSize: 11,

      color:
        colors.textTertiary,

      fontWeight: '500',

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    reportIconButton: {
      width: 38,
      height: 38,

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,

      borderWidth: 1,

      borderColor:
        accent + '28',
    },


    // ========================================================
    // DAYS
    // ========================================================

    daysGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      justifyContent:
        'space-between',

      rowGap: 9,

      marginBottom: 18,
    },

    dayCardWrap: {
      width: '18.4%',
    },

    dayCard: {
      minHeight: 72,

      borderRadius: 17,

      paddingVertical: 10,

      paddingHorizontal: 5,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      position:
        'relative',
    },

    dayCardCurrent: {
      borderColor:
        accentStrong + '70',

      backgroundColor:
        softAccent,
    },

    dayCardDone: {
      borderColor:
        accentStrong + '55',

      backgroundColor:
        softAccent,
    },

    dayStatus: {
      position:
        'absolute',

      top: -5,
      right: -5,

      width: 18,
      height: 18,

      borderRadius: 9,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        accentStrong,

      zIndex: 2,
    },

    dayNumber: {
      fontSize: 15,

      fontWeight: '800',

      marginBottom: 7,
    },

    dayProgressTrack: {
      width: '68%',

      height: 3,

      borderRadius: 4,

      overflow:
        'hidden',

      marginBottom: 5,
    },

    dayProgressFill: {
      height: '100%',

      borderRadius: 4,
    },

    dayProgressText: {
      fontSize: 8,

      fontWeight: '700',

      color:
        colors.textTertiary,
    },


    // ========================================================
    // BUTTON
    // ========================================================

    reportButton: {
      borderRadius: 18,

      overflow:
        'hidden',

      marginTop: 2,

      shadowColor:
        accentStrong,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        isDark
          ? 0.24
          : 0.15,

      shadowRadius: 12,

      elevation: 5,
    },

    reportButtonGradient: {
      minHeight: 53,

      paddingHorizontal: 18,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 9,
    },

    reportButtonText: {
      color: '#FFFFFF',

      fontSize: 14,

      fontWeight: '800',
    },


    // ========================================================
    // DAY HERO
    // ========================================================

    dayHero: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      backgroundColor:
        card,

      borderRadius: 22,

      padding: 15,

      borderWidth: 1,

      borderColor:
        colors.border,

      marginBottom: 14,
    },

    dayHeroIcon: {
      width: 44,
      height: 44,

      borderRadius: 14,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    dayHeroContent: {
      flex: 1,

      marginHorizontal: 12,
    },

    dayHeroLabel: {
      fontSize: 10,

      fontWeight: '700',

      color:
        colors.textTertiary,

      marginBottom: 3,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    dayHeroTitle: {
      fontSize: 15,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    dayHeroPercent: {
      minWidth: 48,
      height: 48,

      borderRadius: 16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    dayHeroPercentText: {
      fontSize: 13,

      fontWeight: '900',

      color:
        accentStrong,
    },


    // ========================================================
    // QUOTES
    // ========================================================

    quoteCard: {
      borderRadius: 24,

      padding: 18,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      marginBottom: 12,
    },

    quoteHeader: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      gap: 8,

      marginBottom: 15,
    },

    quoteIcon: {
      width: 32,
      height: 32,

      borderRadius: 11,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    quoteLabel: {
      fontSize: 11,

      fontWeight: '800',

      color:
        colors.textSecondary,
    },

    ayahText: {
      fontSize: 17,

      lineHeight: 29,

      fontWeight: '700',

      color:
        colors.text,

      textAlign:
        'center',
    },

    quoteDivider: {
      height: 1,

      backgroundColor:
        colors.border,

      marginVertical: 13,
    },

    ayahRef: {
      fontSize: 11,

      fontWeight: '600',

      color:
        colors.textTertiary,

      textAlign:
        'center',
    },

    poemCard: {
      borderRadius: 24,

      padding: 18,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      marginBottom: 20,
    },

    poemText: {
      fontSize: 14,

      lineHeight: 25,

      fontStyle:
        'italic',

      fontWeight: '500',

      color:
        colors.textSecondary,

      textAlign:
        'center',
    },

    poemPoet: {
      marginTop: 10,

      fontSize: 11,

      fontWeight: '700',

      color:
        accentStrong,

      textAlign:
        'center',
    },


    // ========================================================
    // SESSION
    // ========================================================

    sessionCard: {
      borderRadius: 24,

      padding: 22,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      alignItems:
        'center',

      marginBottom: 20,
    },

    sessionIcon: {
      width: 54,
      height: 54,

      borderRadius: 18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,

      marginBottom: 12,
    },

    sessionTitle: {
      fontSize: 17,

      lineHeight: 24,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        'center',
    },

    sessionDescription: {
      fontSize: 12,

      lineHeight: 19,

      color:
        colors.textSecondary,

      textAlign:
        'center',

      marginTop: 6,
    },


    // ========================================================
    // TASKS
    // ========================================================

    tasksHeader: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom: 11,
    },

    tasksTitle: {
      fontSize: 16,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    tasksSubtitle: {
      fontSize: 10,

      fontWeight: '600',

      color:
        colors.textTertiary,

      marginTop: 3,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    tasksHeaderIcon: {
      width: 38,
      height: 38,

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    taskList: {
      gap: 8,

      marginBottom: 14,
    },

    taskCard: {
      minHeight: 64,

      padding: 12,

      borderRadius: 18,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      gap: 11,
    },

    taskCardDone: {
      backgroundColor:
        softAccent,

      borderColor:
        accentStrong + '38',
    },

    checkbox: {
      width: 24,
      height: 24,

      borderRadius: 8,

      borderWidth: 1.5,

      borderColor:
        colors.border,

      alignItems:
        'center',

      justifyContent:
        'center',

      flexShrink: 0,
    },

    checkboxDone: {
      backgroundColor:
        accentStrong,

      borderColor:
        accentStrong,
    },

    taskTypeIcon: {
      width: 24,
      height: 24,

      borderRadius: 8,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,

      flexShrink: 0,
    },

    taskContent: {
      flex: 1,

      gap: 8,
    },

    taskText: {
      fontSize: 13,

      lineHeight: 19,

      fontWeight: '600',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },

    taskTextDone: {
      color:
        colors.textTertiary,

      textDecorationLine:
        'line-through',
    },

    taskInput: {
      minHeight: 42,

      borderRadius: 12,

      borderWidth: 1,

      paddingHorizontal: 11,

      paddingVertical: 8,

      fontSize: 12,

      lineHeight: 18,
    },


    // ========================================================
    // DAY NAVIGATION
    // ========================================================

    navigationRow: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      gap: 9,

      marginBottom: 12,
    },

    navigationButton: {
      flex: 1,

      minHeight: 47,

      borderRadius: 16,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 6,
    },

    navigationDisabled: {
      opacity: 0.32,
    },

    navigationText: {
      fontSize: 12,

      fontWeight: '700',

      color:
        colors.textSecondary,
    },


    // ========================================================
    // REPORT
    // ========================================================

    reportHero: {
      minHeight: 155,

      borderRadius: 25,

      padding: 18,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      gap: 16,

      marginBottom: 12,
    },

    reportProgressCircle: {
      width: 92,
      height: 92,

      borderRadius: 46,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,

      borderWidth: 7,

      borderColor:
        softAccentStrong,
    },

    reportProgressValue: {
      fontSize: 21,

      fontWeight: '900',

      color:
        accentStrong,
    },

    reportProgressLabel: {
      fontSize: 9,

      fontWeight: '700',

      color:
        colors.textTertiary,

      marginTop: 1,
    },

    reportHeroContent: {
      flex: 1,
    },

    reportHeroTitle: {
      fontSize: 18,

      lineHeight: 25,

      fontWeight: '800',

      color:
        colors.text,

      textAlign:
        isRTL
          ? 'right'
          : 'left',

      marginBottom: 5,
    },

    reportHeroDescription: {
      fontSize: 12,

      lineHeight: 19,

      color:
        colors.textSecondary,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },


    // ========================================================
    // STATS
    // ========================================================

    statsGrid: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      gap: 8,

      marginBottom: 14,
    },

    statCard: {
      flex: 1,

      minHeight: 112,

      borderRadius: 19,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      padding: 12,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    statIcon: {
      width: 34,
      height: 34,

      borderRadius: 11,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,

      marginBottom: 7,
    },

    statValue: {
      fontSize: 17,

      fontWeight: '900',

      color:
        colors.text,
    },

    statLabel: {
      fontSize: 9,

      fontWeight: '600',

      color:
        colors.textTertiary,

      marginTop: 3,

      textAlign:
        'center',
    },


    // ========================================================
    // REMAINING
    // ========================================================

    reportSection: {
      borderRadius: 23,

      backgroundColor:
        card,

      borderWidth: 1,

      borderColor:
        colors.border,

      padding: 15,

      marginBottom: 14,
    },

    reportSectionHeader: {
      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom: 12,
    },

    reportSectionTitle: {
      fontSize: 15,

      fontWeight: '800',

      color:
        colors.text,
    },

    pendingBadge: {
      minWidth: 30,
      height: 30,

      borderRadius: 10,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        softAccent,
    },

    pendingBadgeText: {
      fontSize: 12,

      fontWeight: '900',

      color:
        accentStrong,
    },

    remainingList: {
      gap: 8,
    },

    remainingItem: {
      minHeight: 38,

      borderRadius: 12,

      backgroundColor:
        cardSecondary,

      paddingHorizontal: 10,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      gap: 8,
    },

    remainingDot: {
      width: 5,
      height: 5,

      borderRadius: 3,

      flexShrink: 0,

      backgroundColor:
        accentStrong,
    },

    reportLine: {
      flex: 1,

      fontSize: 11,

      lineHeight: 18,

      color:
        colors.textSecondary,

      textAlign:
        isRTL
          ? 'right'
          : 'left',
    },


    // ========================================================
    // ALL DONE
    // ========================================================

    allDone: {
      alignItems:
        'center',

      paddingVertical: 18,
    },

    allDoneIcon: {
      width: 48,
      height: 48,

      borderRadius: 16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'rgba(34,197,94,0.12)',

      marginBottom: 9,
    },

    allDoneTitle: {
      fontSize: 14,

      fontWeight: '800',
    },

    allDoneDescription: {
      marginTop: 4,

      fontSize: 11,

      color:
        colors.textTertiary,

      textAlign:
        'center',
    },


    // ========================================================
    // SECONDARY BUTTON
    // ========================================================

    secondaryButton: {
      minHeight: 50,

      marginTop: 9,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        colors.border,

      backgroundColor:
        card,

      flexDirection:
        isRTL
          ? 'row-reverse'
          : 'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,
    },

    secondaryButtonText: {
      fontSize: 13,

      fontWeight: '700',

      color:
        colors.textSecondary,
    },
  });
}