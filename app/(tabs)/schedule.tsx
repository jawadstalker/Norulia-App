import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
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
} from 'lucide-react-native';
import { Spacing } from '../../constants/theme';
import { useRouter } from 'expo-router';

interface Event {
  id: string;
  title: string;
  time: string;
  category: string;
  duration: string;
  completed: boolean;
  icon: any;
  color: string;
}

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

  React.useEffect(() => {
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
  }, []);

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
        {
          position: 'absolute',
          top: -90,
          left: -20,
          width: 70,
          height: 280,
          zIndex: 20,
        },
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
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </Animated.View>
  );
}

function toPersianDate(
  date: Date
): { year: number; month: number; day: number } {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  const daysInMonth = [
    0,
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

  let daysPassed = 0;

  for (let i = 1; i < gregorianMonth; i++) {
    daysPassed += daysInMonth[i];
  }

  daysPassed += gregorianDay;

  const isLeap =
    (gregorianYear % 4 === 0 &&
      gregorianYear % 100 !== 0) ||
    gregorianYear % 400 === 0;

  if (isLeap && gregorianMonth > 2) {
    daysPassed += 1;
  }

  let persianYear = gregorianYear - 622;
  let persianMonth = 1;
  let persianDay = daysPassed - 79;

  if (persianDay <= 0) {
    persianYear -= 1;
    persianDay += 365;

    if ((persianYear + 1) % 4 === 0) {
      persianDay += 1;
    }
  }

  const persianDaysInMonth = [
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

  const isPersianLeap = persianYear % 4 === 0;

  if (isPersianLeap) {
    persianDaysInMonth[11] = 30;
  }

  let remainingDays = persianDay;

  for (let i = 0; i < 12; i++) {
    if (remainingDays <= persianDaysInMonth[i]) {
      persianMonth = i + 1;
      persianDay = remainingDays;
      break;
    }

    remainingDays -= persianDaysInMonth[i];
  }

  return {
    year: persianYear,
    month: persianMonth,
    day: persianDay,
  };
}

function getPersianWeekday(date: Date): string {
  const weekdays = [
    'یکشنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنج‌شنبه',
    'جمعه',
    'شنبه',
  ];

  return weekdays[date.getDay()];
}

function getPersianMonthName(month: number): string {
  const monthNames = [
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

  return monthNames[month - 1] || '';
}

function toPersianDigits(value: string | number): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

  return value
    .toString()
    .split('')
    .map((digit) => {
      const number = parseInt(digit, 10);

      return !isNaN(number)
        ? persianDigits[number]
        : digit;
    })
    .join('');
}

export default function ScheduleScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const softPurple = isDark
    ? '#8B78C7'
    : '#9B8BC7';

  const softPurpleStrong = isDark
    ? '#725BAF'
    : '#8B78B8';

  const heroGradient: [string, string] = isDark
    ? ['#342660', '#21104F']
    : ['#F2EEFF', '#D8CEFA'];

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title:
        t.meditationSession ||
        'Meditation Session',
      time: '09:00 AM',
      category:
        t.mindfulness ||
        'Mindfulness',
      duration:
        '20 ' + (t.minutes || 'min'),
      completed: true,
      icon: Brain,
      color: softPurple,
    },
    {
      id: '2',
      title:
        t.takeMedication ||
        'Take Medication',
      time: '12:00 PM',
      category:
        t.health || 'Health',
      duration:
        '5 ' + (t.minutes || 'min'),
      completed: false,
      icon: Pill,
      color: softPurple,
    },
    {
      id: '3',
      title:
        t.therapySession ||
        'Therapy Session',
      time: '03:00 PM',
      category:
        t.mentalHealth ||
        'Mental Health',
      duration:
        '45 ' + (t.minutes || 'min'),
      completed: false,
      icon: Heart,
      color: softPurpleStrong,
    },
    {
      id: '4',
      title:
        t.eveningRelaxation ||
        'Evening Relaxation',
      time: '08:00 PM',
      category:
        t.wellness || 'Wellness',
      duration:
        '30 ' + (t.minutes || 'min'),
      completed: false,
      icon: Moon,
      color: softPurpleStrong,
    },
  ]);

  const [isFabOpen, setIsFabOpen] =
    useState(false);

  const toggleCompletion = (
    id: string
  ) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              completed:
                !event.completed,
            }
          : event
      )
    );
  };

  const completedCount =
    events.filter(
      (event) => event.completed
    ).length;

  const totalCount = events.length;

  const getGreeting = () => {
    const hour = new Date().getHours();

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
  };

  const getDateDisplay = () => {
    const now = new Date();

    if (isRTL) {
      const persianDate =
        toPersianDate(now);

      const weekday =
        getPersianWeekday(now);

      const monthName =
        getPersianMonthName(
          persianDate.month
        );

      const dayStr =
        toPersianDigits(
          persianDate.day
        );

      const yearStr =
        toPersianDigits(
          persianDate.year
        );

      return `${weekday} ${dayStr} ${monthName} ${yearStr}`;
    }

    return now.toLocaleDateString(
      'en-US',
      {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    );
  };

  const fabOptions = [
    {
      id: 'task',
      label: t.add || 'Add Task',
      icon: Sparkles,
      color: softPurple,
    },
    {
      id: 'medication',
      label:
        t.addMedication ||
        'Add Medication',
      icon: Pill,
      color: softPurple,
    },
    {
      id: 'consultation',
      label:
        t.addConsultation ||
        'Add Consultation',
      icon: Heart,
      color: softPurple,
    },
  ];

  const handleNavigate = (
    route: string
  ) => {
    router.navigate(route as any);
  };

  const dateCardStyle = {
    ...styles.dateCard,
    backgroundColor: isDark
      ? colors.surface
      : '#FFFFFF',
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#0A0A0F', '#14141E']
          : ['#FAF8FF', '#FFFFFF']
      }
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <MotiView
          from={{
            opacity: 0,
            translateY: -30,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 500,
          }}
          style={styles.heroWrapper}
        >
          <LinearGradient
            colors={heroGradient}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={[
              styles.hero,
              {
                borderColor: isDark
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(107,90,166,0.06)',

                shadowColor: isDark
                  ? '#000000'
                  : '#6B5AA6',

                shadowOpacity: isDark
                  ? 0.20
                  : 0.08,

                elevation: isDark
                  ? 8
                  : 3,
              },
            ]}
          >
            <MotiView
              from={{
                opacity: 0,
                scale: 0.85,
                translateY: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                translateY: 0,
              }}
              transition={{
                type: 'spring',
                damping: 14,
                stiffness: 140,
              }}
            >
              <View
                style={
                  styles.avatarContainer
                }
              >
                <Image
                  source={require('../../assets/avatars/modell.png')}
                  style={styles.avatar}
                  resizeMode="contain"
                />
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
                type: 'timing',
                duration: 450,
                delay: 120,
              }}
            >
              <Text
                style={[
                  styles.greeting,
                  {
                    color: isDark
                      ? 'rgba(255,255,255,0.72)'
                      : 'rgba(65,53,100,0.68)',
                  },
                ]}
              >
                {getGreeting()}, Alex
              </Text>

              <Text
                style={[
                  styles.title,
                  {
                    color: isDark
                      ? '#FFFFFF'
                      : '#493A6F',
                  },
                ]}
              >
                {t.dailyPlanner ||
                  'Daily Planner AI'}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: isDark
                      ? 'rgba(255,255,255,0.70)'
                      : 'rgba(65,53,100,0.62)',
                  },
                ]}
              >
                {t.activitiesToday ||
                  'You have'}{' '}
                {isRTL
                  ? toPersianDigits(
                      totalCount -
                        completedCount
                    )
                  : totalCount -
                    completedCount}{' '}
                {t.activitiesToday?.toLowerCase() ||
                  'activities today'}
              </Text>
            </MotiView>
          </LinearGradient>
        </MotiView>

        <MotiView
          from={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 100,
            type: 'spring',
            damping: 15,
          }}
        >
          <Card
            style={[
              dateCardStyle,
              {
                overflow: 'hidden',
                position: 'relative',
              },
            ]}
          >
            <ShineEffect
              color={
                isDark
                  ? '#FFFFFF'
                  : softPurple
              }
              delay={1800}
              duration={1900}
              opacity={
                isDark
                  ? 0.13
                  : 0.09
              }
            />

            <View
              style={[
                styles.dateContent,
                !isRTL
                  ? styles.dateContentRight
                  : styles.dateContentLeft,
              ]}
            >
              <View
                style={[
                  styles.dateLeft,
                  !isRTL
                    ? styles.dateLeftRight
                    : styles.dateLeftLeft,
                ]}
              >
                <Calendar
                  size={24}
                  color={softPurple}
                />

                <View
                  style={
                    !isRTL
                      ? styles.dateTextRight
                      : styles.dateTextLeft
                  }
                >
                  <Text
                    style={[
                      styles.dateDay,
                      {
                        color:
                          colors.text,
                      },
                      !isRTL
                        ? styles.textRight
                        : styles.textLeft,
                    ]}
                  >
                    {getDateDisplay()}
                  </Text>
                </View>
              </View>

              <MotiView
                from={{
                  scale: 0,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  delay: 200,
                  type: 'spring',
                  damping: 12,
                }}
                style={[
                  styles.progressCircle,
                  {
                    borderColor:
                      softPurple,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressText,
                    {
                      color:
                        softPurple,
                    },
                  ]}
                >
                  {isRTL
                    ? toPersianDigits(
                        completedCount
                      )
                    : completedCount}
                  /
                  {isRTL
                    ? toPersianDigits(
                        totalCount
                      )
                    : totalCount}
                </Text>
              </MotiView>
            </View>

            <View
              style={
                styles.progressBarContainer
              }
            >
              <MotiView
                from={{
                  width: 0,
                }}
                animate={{
                  width: `${
                    totalCount > 0
                      ? (completedCount /
                          totalCount) *
                        100
                      : 0
                  }%`,
                }}
                transition={{
                  delay: 300,
                  type: 'timing',
                  duration: 800,
                }}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor:
                      softPurple,
                  },
                ]}
              />
            </View>
          </Card>
        </MotiView>

        <View style={styles.timeline}>
          {events.map(
            (event, index) => {
              const EventIcon =
                event.icon;

              const eventCardStyle = {
                ...styles.eventCard,
                backgroundColor:
                  isDark
                    ? colors.surface
                    : '#FFFFFF',

                borderLeftWidth:
                  !isRTL
                    ? 0
                    : 4,

                borderRightWidth:
                  !isRTL
                    ? 4
                    : 0,

                borderLeftColor:
                  isRTL
                    ? event.completed
                      ? '#10B981'
                      : event.color
                    : 'transparent',

                borderRightColor:
                  !isRTL
                    ? event.completed
                      ? '#10B981'
                      : event.color
                    : 'transparent',

                opacity:
                  event.completed
                    ? 0.8
                    : 1,
              };

              return (
                <MotiView
                  key={event.id}
                  from={{
                    opacity: 0,
                    translateY: 40,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay:
                      index * 150,
                    type: 'spring',
                    damping: 15,
                  }}
                >
                  <View
                    style={[
                      styles.timelineItem,
                      !isRTL
                        ? styles.timelineItemRight
                        : styles.timelineItemLeft,
                    ]}
                  >
                    {index <
                      events.length -
                        1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          !isRTL
                            ? styles.timelineLineRight
                            : styles.timelineLineLeft,
                          {
                            backgroundColor:
                              colors.border,
                          },
                        ]}
                      />
                    )}

                    <View
                      style={[
                        styles.timelineDot,
                        !isRTL
                          ? styles.timelineDotRight
                          : styles.timelineDotLeft,
                        {
                          backgroundColor:
                            event.color,

                          borderColor:
                            isDark
                              ? colors.surface
                              : '#FFFFFF',
                        },
                      ]}
                    />

                    <Card
                      style={[
                        eventCardStyle,
                        {
                          overflow: 'hidden',
                          position: 'relative',
                        },
                      ]}
                    >
                      <ShineEffect
                        color={
                          isDark
                            ? '#FFFFFF'
                            : event.color
                        }
                        delay={
                          1500 +
                          index * 320
                        }
                        duration={1800}
                        opacity={
                          isDark
                            ? 0.12
                            : 0.08
                        }
                      />

                      <TouchableOpacity
                        onPress={() =>
                          toggleCompletion(
                            event.id
                          )
                        }
                        style={[
                          styles.eventContent,
                          !isRTL
                            ? styles.eventContentRight
                            : styles.eventContentLeft,
                        ]}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.eventIconContainer,
                            !isRTL
                              ? styles.eventIconRight
                              : styles.eventIconLeft,
                            {
                              backgroundColor:
                                `${event.color}20`,
                            },
                          ]}
                        >
                          <EventIcon
                            size={24}
                            color={
                              event.color
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.eventTextContainer
                          }
                        >
                          <View
                            style={[
                              styles.eventHeader,
                              !isRTL
                                ? styles.eventHeaderRight
                                : styles.eventHeaderLeft,
                            ]}
                          >
                            <Text
                              numberOfLines={
                                2
                              }
                              style={[
                                styles.eventTitle,
                                {
                                  color:
                                    colors.text,

                                  textDecorationLine:
                                    event.completed
                                      ? 'line-through'
                                      : 'none',
                                },
                                !isRTL
                                  ? styles.textRight
                                  : styles.textLeft,
                              ]}
                            >
                              {
                                event.title
                              }
                            </Text>

                            <View
                              style={[
                                styles.eventStatusIcon,
                                !isRTL
                                  ? styles.statusRight
                                  : styles.statusLeft,
                              ]}
                            >
                              {event.completed ? (
                                <MotiView
                                  from={{
                                    scale: 0,
                                  }}
                                  animate={{
                                    scale: 1,
                                  }}
                                  transition={{
                                    type: 'spring',
                                    damping: 12,
                                  }}
                                >
                                  <CheckCircle
                                    size={
                                      22
                                    }
                                    color="#10B981"
                                  />
                                </MotiView>
                              ) : (
                                <Circle
                                  size={
                                    22
                                  }
                                  color={
                                    colors.textTertiary
                                  }
                                />
                              )}
                            </View>
                          </View>

                          <View
                            style={[
                              styles.eventDetails,
                              !isRTL
                                ? styles.eventDetailsRight
                                : styles.eventDetailsLeft,
                            ]}
                          >
                            <Clock
                              size={14}
                              color={
                                colors.textTertiary
                              }
                            />

                            <Text
                              style={[
                                styles.eventTime,
                                {
                                  color:
                                    colors.textSecondary,
                                },
                                !isRTL
                                  ? styles.textRight
                                  : styles.textLeft,
                                !isRTL
                                  ? styles.eventTimeRight
                                  : styles.eventTimeLeft,
                              ]}
                            >
                              {
                                event.time
                              }{' '}
                              •{' '}
                              {
                                event.duration
                              }
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.eventCategory,
                              !isRTL
                                ? styles.eventCategoryRight
                                : styles.eventCategoryLeft,
                            ]}
                          >
                            <Text
                              style={[
                                styles.eventCategoryText,
                                {
                                  color:
                                    colors.textTertiary,
                                },
                                !isRTL
                                  ? styles.textRight
                                  : styles.textLeft,
                              ]}
                            >
                              {
                                event.category
                              }
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Card>
                  </View>
                </MotiView>
              );
            }
          )}
        </View>
      </ScrollView>

      <AnimatePresence>
        {isFabOpen && (
          <>
            <MotiView
              from={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                type: 'timing',
                duration: 180,
              }}
              pointerEvents="box-none"
              style={styles.fabBackdrop}
            >
              <TouchableOpacity
                style={styles.fabBackdropTouchable}
                activeOpacity={1}
                onPress={() =>
                  setIsFabOpen(false)
                }
              />
            </MotiView>

            <View
              pointerEvents="box-none"
              style={[
                styles.radialMenu,
                isRTL
                  ? styles.radialMenuLeft
                  : styles.radialMenuRight,
              ]}
            >
              {fabOptions.map(
                (option, index) => {
                  const OptionIcon =
                    option.icon;

                    const positions = isRTL
                    ? [
                        { x: 0, y: -85 },   
                        { x: -60, y: -60 },   
                        { x: -85, y: 0 },  
                      ]
                    : [
                        { x: 0, y: -85 },   
                        { x: 60, y: -60 },   
                        { x: 85, y: 0 },     
                      ];

                  const position =
                    positions[
                      index
                    ] || {
                      x: 0,
                      y: -115,
                    };

                  return (
                    <MotiView
                      key={option.id}
                      from={{
                        opacity: 0,
                        scale: 0.15,
                        translateX: 0,
                        translateY: 0,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        translateX:
                          position.x,
                        translateY:
                          position.y,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.15,
                        translateX: 0,
                        translateY: 0,
                      }}
                      transition={{
                        type: 'spring',
                        damping: 14,
                        stiffness: 230,
                        mass: 0.65,
                        delay:
                          index * 55,
                      }}
                      style={
                        styles.radialOption
                      }
                    >
                      <TouchableOpacity
                        activeOpacity={
                          0.82
                        }
                        style={[
                          styles.fabOptionButton,
                          {
                            backgroundColor:
                              option.color,
                          },
                        ]}
                        onPress={() => {
                          setIsFabOpen(
                            false
                          );

                          if (
                            option.id ===
                            'task'
                          ) {
                            handleNavigate(
                              '/schedule/add'
                            );
                          }

                          if (
                            option.id ===
                            'medication'
                          ) {
                            handleNavigate(
                              '/medication/add'
                            );
                          }

                          if (
                            option.id ===
                            'consultation'
                          ) {
                            handleNavigate(
                              '/consultation/add'
                            );
                          }
                        }}
                      >
                        <ShineEffect
                          color="#FFFFFF"
                          delay={
                            1300 +
                            index * 220
                          }
                          duration={
                            1550
                          }
                          opacity={
                            0.15
                          }
                        />

                        <OptionIcon
                          size={23}
                          color="#FFFFFF"
                          strokeWidth={
                            2
                          }
                        />
                      </TouchableOpacity>

                      <MotiView
                        from={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                        }}
                        transition={{
                          type: 'spring',
                          damping: 16,
                          stiffness: 220,
                          delay:
                            index *
                              55 +
                            80,
                        }}
                        style={[
                          styles.radialLabel,
                          index === 0
                            ? styles.radialLabelTop
                            : isRTL
                            ? styles.radialLabelLeft
                            : styles.radialLabelRight,
                          {
                            backgroundColor:
                              isDark
                                ? 'rgba(25,25,35,0.94)'
                                : 'rgba(255,255,255,0.96)',
                          },
                        ]}
                      >
                        <Text
                          numberOfLines={
                            1
                          }
                          style={[
                            styles.fabOptionLabel,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            option.label
                          }
                        </Text>
                      </MotiView>
                    </MotiView>
                  );
                }
              )}
            </View>
          </>
        )}
      </AnimatePresence>

      <MotiView
        animate={{
          scale: isFabOpen
            ? 1.06
            : 1,
        }}
        transition={{
          type: 'spring',
          damping: 13,
          stiffness: 240,
        }}
        style={[
          styles.fabWrapper,
          !isRTL
            ? styles.fabLeft
            : styles.fabRight,
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.fab,
            {
              backgroundColor:
                softPurple,
            },
          ]}
          onPress={() =>
            setIsFabOpen(
              !isFabOpen
            )
          }
        >
          <ShineEffect
            color="#FFFFFF"
            delay={1100}
            duration={1450}
            opacity={0.18}
          />

          <MotiView
            animate={{
              rotate: isFabOpen
                ? '45deg'
                : '0deg',
              scale: isFabOpen
                ? 0.9
                : 1,
            }}
            transition={{
              type: 'spring',
              damping: 13,
              stiffness: 230,
            }}
          >
            <Plus
              size={28}
              color="#FFFFFF"
              strokeWidth={2.3}
            />
          </MotiView>
        </TouchableOpacity>
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },

  content: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 160,
  },

  heroWrapper: {
    width: '100%',
    marginBottom: Spacing.lg,
  },

  hero: {
    width: '100%',
    minHeight: 290,

    paddingTop: 30,
    paddingBottom: 36,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 32,
    borderWidth: 1,

    overflow: 'hidden',

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowRadius: 20,
  },

  avatarContainer: {
    width: 220,
    height: 220,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'visible',

    marginBottom: Spacing.sm,
  },

  avatar: {
    width: 220,
    height: 220,

    resizeMode: 'contain',
  },

  greeting: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  textRight: {
    writingDirection: 'ltr',
    textAlign: 'right',
  },

  textLeft: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },

  dateCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },

  dateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  dateContentRight: {
    flexDirection: 'row-reverse',
  },

  dateContentLeft: {
    flexDirection: 'row',
  },

  dateLeft: {
    flex: 1,
    alignItems: 'center',
  },

  dateLeftRight: {
    flexDirection: 'row-reverse',
  },

  dateLeftLeft: {
    flexDirection: 'row',
  },

  dateTextRight: {
    flex: 1,
    marginRight: Spacing.sm,
    alignItems: 'flex-end',
  },

  dateTextLeft: {
    flex: 1,
    marginLeft: Spacing.sm,
    alignItems: 'flex-start',
  },

  dateDay: {
    fontSize: 16,
    fontWeight: '600',
  },

  progressCircle: {
    width: 50,
    height: 50,

    borderRadius: 25,
    borderWidth: 2,

    alignItems: 'center',
    justifyContent: 'center',
  },

  progressText: {
    fontSize: 14,
    fontWeight: '700',
  },

  progressBarContainer: {
    height: 4,

    backgroundColor: '#E5E7EB',

    borderRadius: 2,

    marginTop: Spacing.md,

    overflow: 'hidden',
  },

  progressBar: {
    height: 4,
    borderRadius: 2,
  },

  timeline: {
    paddingTop: Spacing.sm,
  },

  timelineItemRight: {
    paddingRight: 20,
    paddingLeft: 0,
    paddingBottom: Spacing.md,

    position: 'relative',
  },

  timelineItemLeft: {
    paddingLeft: 20,
    paddingRight: 0,
    paddingBottom: Spacing.md,

    position: 'relative',
  },

  timelineLine: {
    position: 'absolute',

    top: 24,
    bottom: 0,

    width: 2,
  },

  timelineLineRight: {
    right: 6,
    left: 'auto',
  },

  timelineLineLeft: {
    left: 6,
    right: 'auto',
  },

  timelineDot: {
    position: 'absolute',

    top: 8,

    width: 14,
    height: 14,

    borderRadius: 7,
    borderWidth: 2,

    zIndex: 1,
  },

  timelineDotRight: {
    right: 0,
    left: 'auto',
  },

  timelineDotLeft: {
    left: 0,
    right: 'auto',
  },

  eventCard: {
    padding: Spacing.md,
  },

  eventContent: {
    width: '100%',
    alignItems: 'center',
  },

  eventContentRight: {
    flexDirection: 'row-reverse',
  },

  eventContentLeft: {
    flexDirection: 'row',
  },

  eventIconContainer: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  eventIconRight: {
    marginLeft: Spacing.md,
  },

  eventIconLeft: {
    marginRight: Spacing.md,
  },

  eventTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  eventHeader: {
    width: '100%',
    alignItems: 'center',
    minWidth: 0,
  },

  eventHeaderRight: {
    flexDirection: 'row-reverse',
  },

  eventHeaderLeft: {
    flexDirection: 'row',
  },

  eventTitle: {
    flex: 1,
    minWidth: 0,

    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,

    paddingHorizontal: 0,
  },

  eventStatusIcon: {
    width: 28,
    height: 28,

    flexShrink: 0,

    alignItems: 'center',
    justifyContent: 'center',
  },

  statusRight: {
    marginRight: Spacing.md,
  },

  statusLeft: {
    marginLeft: Spacing.md,
  },

  eventDetails: {
    alignItems: 'center',
    marginTop: 6,
  },

  eventDetailsRight: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },

  eventDetailsLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  eventTime: {
    fontSize: 13,
  },

  eventTimeRight: {
    marginRight: 4,
  },

  eventTimeLeft: {
    marginLeft: 4,
  },

  eventCategory: {
    marginTop: 4,
  },

  eventCategoryRight: {
    alignItems: 'flex-end',
  },

  eventCategoryLeft: {
    alignItems: 'flex-start',
  },

  eventCategoryText: {
    fontSize: 12,
  },

  fabWrapper: {
    position: 'absolute',

    bottom: 30,

    width: 60,
    height: 60,

    zIndex: 30,

    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    width: 60,
    height: 60,

    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.24,
    shadowRadius: 10,

    elevation: 8,

    overflow: 'hidden',
  },

  fabLeft: {
    left: 30,
    right: 'auto',
  },

  fabRight: {
    right: 30,
    left: 'auto',
  },

  fabBackdrop: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor:
      'rgba(0,0,0,0.10)',

    zIndex: 15,
  },

  fabBackdropTouchable: {
    width: '100%',
    height: '100%',
  },

  radialMenu: {
    position: 'absolute',

    width: 300,
    height: 300,

    bottom: 0,

    zIndex: 25,

    alignItems: 'center',
    justifyContent: 'center',

    pointerEvents: 'box-none',
  },

  radialMenuLeft: {
    left: -90,
    right: 'auto',
  },

  radialMenuRight: {
    right: -90,
    left: 'auto',
  },

  radialOption: {
    position: 'absolute',

    width: 50,
    height: 50,

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 30,
  },

  radialLabel: {
    position: 'absolute',

    borderRadius: 10,

    paddingHorizontal: 10,
    paddingVertical: 6,

    minWidth: 70,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.10,
    shadowRadius: 5,

    elevation: 3,
  },

  radialLabelTop: {
    bottom: 56,
  },

  radialLabelLeft: {
    right: 58,
  },

  radialLabelRight: {
    left: 58,
  },

  fabOptionButton: {
    width: 50,
    height: 50,

    borderRadius: 25,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.20,
    shadowRadius: 7,

    elevation: 6,

    overflow: 'hidden',
  },

  fabOptionLabel: {
    fontSize: 13,

    fontWeight: '600',

    paddingHorizontal: 11,
    paddingVertical: 6,

    borderRadius: 10,

    overflow: 'hidden',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 2,
  },

  timelineItem: {
    width: '100%',
  
    position: 'relative',
  
    paddingBottom:
      Spacing.md,
  },
});