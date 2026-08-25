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
  Pressable,
  Alert,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { MotiView, AnimatePresence } from 'moti';

import { LinearGradient } from 'expo-linear-gradient';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Pill,
  Brain,
  Heart,
  Moon,
  Sparkles,
  X,
  Trash2,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';

const STORAGE_KEY = '@neurolia_schedule_custom_events';

interface CustomEvent {
  id: string;
  title: string;
  time: string;
  category: string;
  duration: string;
  completed: boolean;
  iconType:
    | 'brain'
    | 'pill'
    | 'heart'
    | 'moon'
    | 'sparkles';
  color: string;
  reminderEnabled: boolean;
  createdAt: number;
}

interface DisplayEvent {
  id: string;
  title: string;
  time: string;
  category: string;
  duration: string;
  completed: boolean;
  icon: any;
  color: string;
  isCustom: boolean;
}

/* -------------------------------------------------------------------------- */
/* Shine Effect                                                               */
/* -------------------------------------------------------------------------- */

function ShineEffect({
  color = '#FFFFFF',
  delay = 1600,
  duration = 1900,
  opacity = 0.14,
}: {
  color?: string;
  delay?: number;
  duration?: number;
  opacity?: number;
}) {
  const translateX = useSharedValue(-180);
  const shineOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(-180, {
          duration: delay,
        }),
        withTiming(430, {
          duration,
        }),
        withTiming(500, {
          duration: 220,
        }),
      ),
      -1,
      false,
    );

    shineOpacity.value = withRepeat(
      withSequence(
        withTiming(0, {
          duration: delay,
        }),
        withTiming(opacity, {
          duration: 180,
        }),
        withTiming(opacity, {
          duration,
        }),
        withTiming(0, {
          duration: 220,
        }),
      ),
      -1,
      false,
    );
  }, [
    delay,
    duration,
    opacity,
  ]);

  const animatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          translateX:
            translateX.value,
        },
        {
          rotate: '20deg',
        },
      ],
      opacity:
        shineOpacity.value,
    }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shine,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[
          'transparent',
          `${color}12`,
          `${color}45`,
          `${color}12`,
          'transparent',
        ]}
        locations={[
          0,
          0.28,
          0.5,
          0.72,
          1,
        ]}
        start={{
          x: 0,
          y: 0.5,
        }}
        end={{
          x: 1,
          y: 0.5,
        }}
        style={
          styles.shineGradient
        }
      />
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/* Persian Date                                                               */
/* -------------------------------------------------------------------------- */

function toPersianDate(
  date: Date,
): {
  year: number;
  month: number;
  day: number;
} {
  const gy =
    date.getFullYear();

  const gm =
    date.getMonth() + 1;

  const gd =
    date.getDate();

  const gDaysInMonth = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  let dayOfYear = gd;

  for (let i = 0; i < gm - 1; i++) {
    dayOfYear +=
      gDaysInMonth[i];
  }

  const leap =
    (gy % 4 === 0 &&
      gy % 100 !== 0) ||
    gy % 400 === 0;

  if (
    leap &&
    gm > 2
  ) {
    dayOfYear++;
  }

  let jy = gy - 622;
  let jd =
    dayOfYear - 79;

  if (jd <= 0) {
    jy--;
    jd += 365;
  }

  let jm = 1;

  const jDays = [
    31,
    31,
    31,
    31,
    31,
    31,
    30,
    30,
    30,
    30,
    30,
    29,
  ];

  for (
    let i = 0;
    i < 12;
    i++
  ) {
    if (
      jd <= jDays[i]
    ) {
      jm = i + 1;
      break;
    }

    jd -= jDays[i];
  }

  return {
    year: jy,
    month: jm,
    day: jd,
  };
}

function toPersianDigits(
  value: string | number,
) {
  const digits =
    '۰۱۲۳۴۵۶۷۸۹';

  return String(value)
    .split('')
    .map((char) => {
      const number =
        Number(char);

      return Number.isNaN(
        number,
      )
        ? char
        : digits[number];
    })
    .join('');
}

function getPersianWeekday(
  date: Date,
) {
  const names = [
    'یکشنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنج‌شنبه',
    'جمعه',
    'شنبه',
  ];

  return names[
    date.getDay()
  ];
}

function getPersianMonthName(
  month: number,
) {
  const names = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];

  return (
    names[month - 1] ||
    ''
  );
}

/* -------------------------------------------------------------------------- */
/* Icon                                                                       */
/* -------------------------------------------------------------------------- */

function getIcon(
  type: CustomEvent['iconType'],
) {
  switch (type) {
    case 'pill':
      return Pill;

    case 'heart':
      return Heart;

    case 'moon':
      return Moon;

    case 'sparkles':
      return Sparkles;

    case 'brain':
    default:
      return Brain;
  }
}

/* -------------------------------------------------------------------------- */
/* Schedule Screen                                                            */
/* -------------------------------------------------------------------------- */

export default function ScheduleScreen() {
  const {
    colors,
    isDark,
  } = useTheme();

  const {
    t,
    isRTL,
  } = useLanguage();

  const router =
    useRouter();

  const softPurple =
    isDark
      ? '#9B87D4'
      : '#8B78C7';

  const softPurpleStrong =
    isDark
      ? '#8069C2'
      : '#7358A8';

  const green =
    '#22C55E';

  const pink =
    '#EC4899';

  const [customEvents, setCustomEvents] =
    useState<CustomEvent[]>(
      [],
    );

  const [
    loadingEvents,
    setLoadingEvents,
  ] = useState(true);

  const [
    isFabOpen,
    setIsFabOpen,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Load user events                                                       */
  /* ---------------------------------------------------------------------- */

  const loadCustomEvents =
    useCallback(
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              STORAGE_KEY,
            );

          if (!stored) {
            setCustomEvents(
              [],
            );
            return;
          }

          const parsed =
            JSON.parse(
              stored,
            );

          if (
            Array.isArray(
              parsed,
            )
          ) {
            setCustomEvents(
              parsed,
            );
          } else {
            setCustomEvents(
              [],
            );
          }
        } catch (error) {
          console.error(
            'Schedule load error:',
            error,
          );
        } finally {
          setLoadingEvents(
            false,
          );
        }
      },
      [],
    );

  /*
   * بسیار مهم:
   * هر بار که از صفحه Add به Schedule برمی‌گردیم
   * دوباره storage خوانده می‌شود.
   */
  useFocusEffect(
    useCallback(() => {
      loadCustomEvents();
    }, [
      loadCustomEvents,
    ]),
  );

  /* ---------------------------------------------------------------------- */
  /* Default events                                                         */
  /* ---------------------------------------------------------------------- */

  const defaultEvents =
    useMemo<
      DisplayEvent[]
    >(
      () => [
        {
          id: 'default-1',
          title:
            t.meditationSession ||
            'Meditation Session',
          time: '09:00 AM',
          category:
            t.mindfulness ||
            'Mindfulness',
          duration:
            `20 ${t.minutes || 'min'}`,
          completed: true,
          icon: Brain,
          color:
            softPurple,
          isCustom: false,
        },
        {
          id: 'default-2',
          title:
            t.takeMedication ||
            'Take Medication',
          time: '12:00 PM',
          category:
            t.health ||
            'Health',
          duration:
            `5 ${t.minutes || 'min'}`,
          completed: false,
          icon: Pill,
          color:
            green,
          isCustom: false,
        },
        {
          id: 'default-3',
          title:
            t.therapySession ||
            'Therapy Session',
          time: '03:00 PM',
          category:
            t.mentalHealth ||
            'Mental Health',
          duration:
            `45 ${t.minutes || 'min'}`,
          completed: false,
          icon: Heart,
          color:
            pink,
          isCustom: false,
        },
        {
          id: 'default-4',
          title:
            t.eveningRelaxation ||
            'Evening Relaxation',
          time: '08:00 PM',
          category:
            t.wellness ||
            'Wellness',
          duration:
            `30 ${t.minutes || 'min'}`,
          completed: false,
          icon: Moon,
          color:
            softPurpleStrong,
          isCustom: false,
        },
      ],
      [
        t,
        softPurple,
        softPurpleStrong,
      ],
    );

  /* ---------------------------------------------------------------------- */
  /* Convert custom events                                                  */
  /* ---------------------------------------------------------------------- */

  const userEvents =
    useMemo<
      DisplayEvent[]
    >(
      () =>
        customEvents.map(
          (event) => ({
            id: event.id,
            title:
              event.title,
            time:
              event.time,
            category:
              event.category,
            duration:
              event.duration,
            completed:
              event.completed,
            icon:
              getIcon(
                event.iconType,
              ),
            color:
              event.color ||
              softPurple,
            isCustom: true,
          }),
        ),
      [
        customEvents,
        softPurple,
      ],
    );

  const allEvents =
    useMemo(
      () => [
        ...defaultEvents,
        ...userEvents,
      ],
      [
        defaultEvents,
        userEvents,
      ],
    );

  /* ---------------------------------------------------------------------- */
  /* Completion                                                             */
  /* ---------------------------------------------------------------------- */

  const completedCount =
    allEvents.filter(
      (event) =>
        event.completed,
    ).length;

  const progress =
    allEvents.length
      ? completedCount /
        allEvents.length
      : 0;

  const toggleCustomEvent =
    async (
      id: string,
    ) => {
      try {
        const next =
          customEvents.map(
            (event) =>
              event.id === id
                ? {
                    ...event,
                    completed:
                      !event.completed,
                  }
                : event,
          );

        setCustomEvents(
          next,
        );

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            next,
          ),
        );
      } catch (error) {
        console.error(
          'Schedule toggle error:',
          error,
        );
      }
    };

  /* ---------------------------------------------------------------------- */
  /* Delete custom event                                                    */
  /* ---------------------------------------------------------------------- */

  const deleteCustomEvent =
    (
      event: DisplayEvent,
    ) => {
      if (
        !event.isCustom
      ) {
        return;
      }

      Alert.alert(
        isRTL
          ? 'حذف برنامه'
          : 'Delete activity',
        isRTL
          ? `آیا می‌خواهی «${event.title}» حذف شود؟`
          : `Delete "${event.title}" from your schedule?`,
        [
          {
            text:
              isRTL
                ? 'انصراف'
                : 'Cancel',
            style:
              'cancel',
          },
          {
            text:
              isRTL
                ? 'حذف'
                : 'Delete',
            style:
              'destructive',
            onPress:
              async () => {
                const next =
                  customEvents.filter(
                    (item) =>
                      item.id !==
                      event.id,
                  );

                setCustomEvents(
                  next,
                );

                await AsyncStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify(
                    next,
                  ),
                );
              },
          },
        ],
      );
    };

  /* ---------------------------------------------------------------------- */
  /* Date                                                                    */
  /* ---------------------------------------------------------------------- */

  const dateText =
    useMemo(() => {
      const now =
        new Date();

      if (isRTL) {
        const date =
          toPersianDate(
            now,
          );

        return `${getPersianWeekday(
          now,
        )} ${toPersianDigits(
          date.day,
        )} ${getPersianMonthName(
          date.month,
        )} ${toPersianDigits(
          date.year,
        )}`;
      }

      return now.toLocaleDateString(
        'en-US',
        {
          weekday:
            'long',
          month:
            'short',
          day:
            'numeric',
          year:
            'numeric',
        },
      );
    }, [
      isRTL,
    ]);

  /* ---------------------------------------------------------------------- */
  /* Greeting                                                                */
  /* ---------------------------------------------------------------------- */

  const greeting =
    useMemo(() => {
      const hour =
        new Date().getHours();

      if (hour < 12) {
        return (
          t.goodMorning ||
          'Good morning'
        );
      }

      if (hour < 17) {
        return (
          t.goodAfternoon ||
          'Good afternoon'
        );
      }

      return (
        t.goodEvening ||
        'Good evening'
      );
    }, [t]);

  /* ---------------------------------------------------------------------- */
  /* FAB                                                                     */
  /* ---------------------------------------------------------------------- */

  const fabOptions = [
    {
      id: 'activity',
      title:
        isRTL
          ? 'برنامه جدید'
          : 'New Activity',
      description:
        isRTL
          ? 'یک فعالیت به برنامه امروز اضافه کن'
          : 'Add a new activity to your day',
      icon:
        Sparkles,
      color:
        softPurple,
      route:
        '/schedule/add',
    },
    {
      id: 'medication',
      title:
        isRTL
          ? 'داروی جدید'
          : 'New Medication',
      description:
        isRTL
          ? 'دارو و یادآور مصرف آن'
          : 'Add a medication reminder',
      icon:
        Pill,
      color:
        green,
      route:
        '/medication/add',
    },
    {
      id: 'consultation',
      title:
        isRTL
          ? 'جلسات مشاوره'
          : 'Consultation',
      description:
        isRTL
          ? 'مشاهده جلسات مشاوره'
          : 'Open your counseling sessions',
      icon:
        Heart,
      color:
        pink,
      route:
        '/consultation',
    },
  ];

  const openFabRoute =
    (route: string) => {
      setIsFabOpen(
        false,
      );

      setTimeout(
        () => {
          router.push(
            route as any,
          );
        },
        120,
      );
    };

  /* ---------------------------------------------------------------------- */
  /* Handle FAB Press                                                       */
  /* ---------------------------------------------------------------------- */

  const handleFabPress = () => {
    setIsFabOpen((previous) => !previous);
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              '#09090D',
              '#11111A',
            ]
          : [
              '#FAF9FF',
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
        scrollEnabled={
          !isFabOpen
        }
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              150,
          },
        ]}
      >
        {/* -------------------------------------------------------------- */}
        {/* Header                                                          */}
        {/* -------------------------------------------------------------- */}

        <MotiView
          from={{
            opacity: 0,
            translateY: -18,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
          }}
          style={[
            styles.header,
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
              styles.headerText
            }
          >
            <Text
              style={[
                styles.greeting,
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
              {greeting}
            </Text>

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
              {t.schedule ||
                'Schedule'}
            </Text>
          </View>

          <View
            style={[
              styles.headerIcon,
              {
                backgroundColor:
                  softPurple +
                  '15',
              },
            ]}
          >
            <Calendar
              size={23}
              color={
                softPurple
              }
              strokeWidth={
                2.1
              }
            />
          </View>
        </MotiView>

        {/* -------------------------------------------------------------- */}
        {/* Date Card                                                       */}
        {/* -------------------------------------------------------------- */}

        <MotiView
          from={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 70,
          }}
          style={[
            styles.dateCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.dateIcon,
              {
                backgroundColor:
                  softPurple +
                  '14',
              },
            ]}
          >
            <Calendar
              size={20}
              color={
                softPurple
              }
            />
          </View>

          <View
            style={
              styles.dateTextWrapper
            }
          >
            <Text
              style={[
                styles.dateLabel,
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
              {isRTL
                ? 'برنامه امروز'
                : "Today's schedule"}
            </Text>

            <Text
              style={[
                styles.dateText,
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
              {dateText}
            </Text>
          </View>

          <View
            style={
              styles.progressWrapper
            }
          >
            <Text
              style={[
                styles.progressNumber,
                {
                  color:
                    softPurple,
                },
              ]}
            >
              {completedCount}/
              {allEvents.length}
            </Text>

            <Text
              style={[
                styles.progressLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {isRTL
                ? 'انجام شده'
                : 'completed'}
            </Text>
          </View>
        </MotiView>

        {/* -------------------------------------------------------------- */}
        {/* Progress                                                        */}
        {/* -------------------------------------------------------------- */}

        <View
          style={[
            styles.progressBar,
            {
              backgroundColor:
                colors.border,
            },
          ]}
        >
          <MotiView
            animate={{
              width:
                `${Math.max(
                  progress * 100,
                  2,
                )}%`,
            }}
            transition={{
              type: 'timing',
              duration: 700,
            }}
            style={[
              styles.progressFill,
              {
                backgroundColor:
                  softPurple,
              },
            ]}
          />
        </View>

        {/* -------------------------------------------------------------- */}
        {/* Section header                                                  */}
        {/* -------------------------------------------------------------- */}

        <View
          style={[
            styles.sectionHeader,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <View>
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
              {isRTL
                ? 'برنامه‌های امروز'
                : "Today's activities"}
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
              {isRTL
                ? `${allEvents.length} فعالیت برای امروز`
                : `${allEvents.length} activities planned`}
            </Text>
          </View>

          {userEvents.length >
            0 && (
            <View
              style={[
                styles.newBadge,
                {
                  backgroundColor:
                    softPurple +
                    '15',
                },
              ]}
            >
              <Sparkles
                size={13}
                color={
                  softPurple
                }
              />

              <Text
                style={[
                  styles.newBadgeText,
                  {
                    color:
                      softPurple,
                  },
                ]}
              >
                {isRTL
                  ? 'برنامه‌های من'
                  : 'My activities'}
              </Text>
            </View>
          )}
        </View>

        {/* -------------------------------------------------------------- */}
        {/* Events                                                          */}
        {/* -------------------------------------------------------------- */}

        {loadingEvents ? (
          <View
            style={
              styles.loadingBox
            }
          >
            <MotiView
              from={{
                opacity: 0.35,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 700,
              }}
            >
              <Sparkles
                size={25}
                color={
                  softPurple
                }
              />
            </MotiView>
          </View>
        ) : (
          <AnimatePresence>
            {allEvents.map(
              (
                event,
                index,
              ) => {
                const Icon =
                  event.icon;

                return (
                  <MotiView
                    key={
                      event.id
                    }
                    from={{
                      opacity: 0,
                      translateY: 18,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      translateY: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      translateY: -10,
                      scale: 0.96,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 18,
                      stiffness: 180,
                      delay:
                        Math.min(
                          index *
                            50,
                          300,
                        ),
                    }}
                  >
                    <Pressable
                      onPress={() =>
                        event.isCustom
                          ? toggleCustomEvent(
                              event.id,
                            )
                          : undefined
                      }
                      onLongPress={() =>
                        deleteCustomEvent(
                          event,
                        )
                      }
                      style={({
                        pressed,
                      }) => [
                        styles.eventCard,
                        {
                          backgroundColor:
                            colors.surface,
                          borderColor:
                            event.completed
                              ? event.color +
                                '45'
                              : colors.border,
                          transform: [
                            {
                              scale:
                                pressed
                                  ? 0.985
                                  : 1,
                            },
                          ],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.eventIcon,
                          {
                            backgroundColor:
                              event.color +
                              '15',
                          },
                        ]}
                      >
                        <Icon
                          size={21}
                          color={
                            event.color
                          }
                          strokeWidth={
                            2.1
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.eventBody
                        }
                      >
                        <View
                          style={[
                            styles.eventTitleRow,
                            {
                              flexDirection:
                                isRTL
                                  ? 'row-reverse'
                                  : 'row',
                            },
                          ]}
                        >
                          <Text
                            numberOfLines={
                              1
                            }
                            style={[
                              styles.eventTitle,
                              {
                                color:
                                  colors.text,
                                textAlign:
                                  isRTL
                                    ? 'right'
                                    : 'left',
                                textDecorationLine:
                                  event.completed
                                    ? 'line-through'
                                    : 'none',
                                opacity:
                                  event.completed
                                    ? 0.65
                                    : 1,
                              },
                            ]}
                          >
                            {
                              event.title
                            }
                          </Text>

                          {event.isCustom && (
                            <View
                              style={[
                                styles.userBadge,
                                {
                                  backgroundColor:
                                    event.color +
                                    '14',
                                },
                              ]}
                            >
                              <Sparkles
                                size={
                                  10
                                }
                                color={
                                  event.color
                                }
                              />
                            </View>
                          )}
                        </View>

                        <View
                          style={[
                            styles.eventMeta,
                            {
                              flexDirection:
                                isRTL
                                  ? 'row-reverse'
                                  : 'row',
                            },
                          ]}
                        >
                          <Clock
                            size={13}
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
                            {
                              event.time
                            }
                          </Text>

                          <Text
                            style={[
                              styles.dot,
                              {
                                color:
                                  colors.textTertiary,
                              },
                            ]}
                          >
                            •
                          </Text>

                          <Text
                            style={[
                              styles.metaText,
                              {
                                color:
                                  colors.textSecondary,
                              },
                            ]}
                          >
                            {
                              event.duration
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.categoryBadge,
                            {
                              backgroundColor:
                                event.color +
                                '12',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              {
                                color:
                                  event.color,
                              },
                            ]}
                          >
                            {
                              event.category
                            }
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.checkButton,
                          {
                            backgroundColor:
                              event.completed
                                ? event.color
                                : 'transparent',
                            borderColor:
                              event.completed
                                ? event.color
                                : colors.border,
                          },
                        ]}
                      >
                        {event.completed ? (
                          <CheckCircle
                            size={
                              20
                            }
                            color="#FFFFFF"
                            strokeWidth={
                              2.5
                            }
                          />
                        ) : (
                          <Circle
                            size={
                              20
                            }
                            color={
                              colors.textTertiary
                            }
                            strokeWidth={
                              1.8
                            }
                          />
                        )}
                      </View>

                      <ShineEffect
                        color={
                          event.color
                        }
                      />
                    </Pressable>

                    {event.isCustom && (
                      <View
                        style={[
                          styles.longPressHint,
                          {
                            flexDirection:
                              isRTL
                                ? 'row-reverse'
                                : 'row',
                          },
                        ]}
                      >
                        <Trash2
                          size={10}
                          color={
                            colors.textTertiary
                          }
                        />

                        <Text
                          style={[
                            styles.longPressText,
                            {
                              color:
                                colors.textTertiary,
                            },
                          ]}
                        >
                          {isRTL
                            ? 'برای حذف، نگه دار'
                            : 'Long press to delete'}
                        </Text>
                      </View>
                    )}
                  </MotiView>
                );
              },
            )}
          </AnimatePresence>
        )}

        {/* -------------------------------------------------------------- */}
        {/* Empty custom message                                            */}
        {/* -------------------------------------------------------------- */}

        {userEvents.length ===
          0 && (
          <MotiView
            from={{
              opacity: 0,
              translateY: 10,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            style={[
              styles.tipCard,
              {
                backgroundColor:
                  softPurple +
                  '0B',
                borderColor:
                  softPurple +
                  '20',
              },
            ]}
          >
            <View
              style={[
                styles.tipIcon,
                {
                  backgroundColor:
                    softPurple +
                    '16',
                },
              ]}
            >
              <Plus
                size={18}
                color={
                  softPurple
                }
              />
            </View>

            <View
              style={
                styles.tipBody
              }
            >
              <Text
                style={[
                  styles.tipTitle,
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
                  ? 'برنامه شخصی خودت را بساز'
                  : 'Create your own activity'}
              </Text>

              <Text
                style={[
                  styles.tipText,
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
                {isRTL
                  ? 'از دکمه + برای اضافه کردن برنامه جدید استفاده کن.'
                  : 'Use the + button to add something new to your schedule.'}
              </Text>
            </View>
          </MotiView>
        )}
      </ScrollView>

      {/* ================================================================== */}
      {/* FAB Overlay                                                         */}
      {/* ================================================================== */}

      <AnimatePresence>
        {isFabOpen && (
          <MotiView
            key="fab-overlay"
            from={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            style={
              styles.overlay
            }
          >
            <Pressable
              style={
                StyleSheet.absoluteFill
              }
              onPress={() =>
                setIsFabOpen(
                  false,
                )
              }
            />

            <View
              style={[
                styles.fabMenu,
                {
                  bottom: 95,
                  alignItems:
                    isRTL
                      ? 'flex-start'
                      : 'flex-end',
                },
              ]}
            >
              {fabOptions.map(
                (
                  option,
                  index,
                ) => {
                  const Icon =
                    option.icon;

                  return (
                    <MotiView
                      key={
                        option.id
                      }
                      from={{
                        opacity: 0,
                        translateY: 18,
                        scale: 0.92,
                      }}
                      animate={{
                        opacity: 1,
                        translateY: 0,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        translateY: 10,
                        scale: 0.94,
                      }}
                      transition={{
                        type: 'spring',
                        damping: 16,
                        stiffness: 190,
                        delay:
                          index *
                          45,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          openFabRoute(
                            option.route,
                          )
                        }
                        style={({ pressed }) => [
                          styles.actionCard,
                          {
                            backgroundColor:
                              colors.surface,
                            borderColor:
                              option.color +
                              '28',
                            transform: [
                              {
                                scale:
                                  pressed
                                    ? 0.97
                                    : 1,
                              },
                            ],
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.actionText,
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
                              styles.actionTitle,
                              {
                                color:
                                  colors.text,
                              },
                            ]}
                          >
                            {
                              option.title
                            }
                          </Text>

                          <Text
                            numberOfLines={
                              1
                            }
                            style={[
                              styles.actionDescription,
                              {
                                color:
                                  colors.textSecondary,
                              },
                            ]}
                          >
                            {
                              option.description
                            }
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.actionIcon,
                            {
                              backgroundColor:
                                option.color +
                                '16',
                            },
                          ]}
                        >
                          <Icon
                            size={
                              20
                            }
                            color={
                              option.color
                            }
                            strokeWidth={
                              2.1
                            }
                          />
                        </View>
                      </Pressable>
                    </MotiView>
                  );
                },
              )}
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* FAB                                                                  */}
      {/* ================================================================== */}

      <MotiView
        animate={{
          scale: isFabOpen ? 1 : 1,
          rotate: isFabOpen ? '45deg' : '0deg',
        }}
        transition={{
          type: 'spring',
          damping: 14,
          stiffness: 190,
        }}
        style={[
          styles.fabWrapper,
          {
            right: isRTL ? undefined : 22,
            left: isRTL ? 22 : undefined,
          },
        ]}
      >
        <Pressable
          onPress={handleFabPress}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: softPurple,
              shadowColor: softPurple,
              transform: [
                {
                  scale: pressed ? 0.92 : 1,
                },
              ],
            },
          ]}
        >
          {isFabOpen ? (
            <X
              size={25}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          ) : (
            <Plus
              size={27}
              color="#FFFFFF"
              strokeWidth={2.4}
            />
          )}
        </Pressable>
      </MotiView>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 22,
    },

    header: {
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 18,
    },

    headerText: {
      flex: 1,
    },

    greeting: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 3,
    },

    title: {
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.6,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },

    dateCard: {
      minHeight: 84,
      borderRadius: 22,
      borderWidth: 1,
      padding: 13,
      alignItems: 'center',
      marginBottom: 12,
    },

    dateIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 3,
    },

    dateTextWrapper: {
      flex: 1,
      marginHorizontal: 10,
    },

    dateLabel: {
      fontSize: 10,
      fontWeight: '700',
      marginBottom: 3,
    },

    dateText: {
      fontSize: 14,
      fontWeight: '800',
    },

    progressWrapper: {
      alignItems: 'center',
      minWidth: 50,
    },

    progressNumber: {
      fontSize: 15,
      fontWeight: '900',
    },

    progressLabel: {
      fontSize: 8,
      fontWeight: '600',
      marginTop: 1,
    },

    progressBar: {
      height: 5,
      borderRadius: 3,
      overflow: 'hidden',
      marginBottom: 25,
    },

    progressFill: {
      height: '100%',
      borderRadius: 3,
      minWidth: 5,
    },

    sectionHeader: {
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 13,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '900',
    },

    sectionSubtitle: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 3,
    },

    newBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 10,
    },

    newBadgeText: {
      fontSize: 9,
      fontWeight: '800',
    },

    loadingBox: {
      height: 130,
      alignItems: 'center',
      justifyContent: 'center',
    },

    eventCard: {
      minHeight: 96,
      borderRadius: 22,
      borderWidth: 1,
      padding: 13,
      marginBottom: 7,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.05,
      shadowRadius: 14,
      elevation: 2,
    },

    eventIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },

    eventBody: {
      flex: 1,
      minWidth: 0,
    },

    eventTitleRow: {
      alignItems: 'center',
      gap: 6,
    },

    eventTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
    },

    userBadge: {
      width: 20,
      height: 20,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },

    eventMeta: {
      alignItems: 'center',
      gap: 5,
      marginTop: 5,
    },

    metaText: {
      fontSize: 10,
      fontWeight: '600',
    },

    dot: {
      fontSize: 10,
    },

    categoryBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 7,
      marginTop: 5,
    },

    categoryText: {
      fontSize: 8,
      fontWeight: '800',
    },

    checkButton: {
      width: 31,
      height: 31,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    longPressHint: {
      alignItems: 'center',
      gap: 3,
      marginTop: -2,
      marginBottom: 8,
      paddingHorizontal: 8,
    },

    longPressText: {
      fontSize: 8,
      fontWeight: '500',
    },

    tipCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 13,
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },

    tipIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    tipBody: {
      flex: 1,
    },

    tipTitle: {
      fontSize: 12,
      fontWeight: '800',
    },

    tipText: {
      fontSize: 9,
      lineHeight: 14,
      marginTop: 3,
    },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 20,
      backgroundColor:
        'rgba(0,0,0,0.18)',
    },

    fabMenu: {
      position: 'absolute',
      right: 18,
      left: 18,
      gap: 9,
    },

    actionCard: {
      width: '100%',
      minHeight: 67,
      borderRadius: 19,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 9,
      flexDirection: 'row',
      alignItems: 'center',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity: 0.09,
      shadowRadius: 14,
      elevation: 5,
    },

    actionText: {
      flex: 1,
      marginHorizontal: 8,
    },

    actionTitle: {
      fontSize: 13,
      fontWeight: '900',
    },

    actionDescription: {
      fontSize: 9,
      fontWeight: '500',
      marginTop: 2,
    },

    actionIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    fabWrapper: {
      position: 'absolute',
      bottom: 28,
      zIndex: 30,
    },

    fab: {
      width: 60,
      height: 60,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',

      shadowOffset: {
        width: 0,
        height: 7,
      },

      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 9,
    },

    shine: {
      position: 'absolute',
      top: -60,
      bottom: -60,
      left: 0,
      width: 90,
    },

    shineGradient: {
      flex: 1,
      width: '100%',
    },
  });