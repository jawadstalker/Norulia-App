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

  const isLayoutRight = !isRTL;

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
                isLayoutRight
                  ? styles.dateContentRight
                  : styles.dateContentLeft,
              ]}
            >
              <View
                style={[
                  styles.dateLeft,
                  isLayoutRight
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
                    isLayoutRight
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
                      isLayoutRight
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
                  isLayoutRight
                    ? 0
                    : 4,

                borderRightWidth:
                  isLayoutRight
                    ? 4
                    : 0,

                borderLeftColor:
                  !isLayoutRight
                    ? event.completed
                      ? '#10B981'
                      : event.color
                    : 'transparent',

                borderRightColor:
                  isLayoutRight
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
                      isLayoutRight
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
                          isLayoutRight
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
                        isLayoutRight
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
                          isLayoutRight
                            ? styles.eventContentRight
                            : styles.eventContentLeft,
                        ]}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.eventIconContainer,
                            isLayoutRight
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
                              isLayoutRight
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
                                isLayoutRight
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
                                isLayoutRight
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
                              isLayoutRight
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
                                isLayoutRight
                                  ? styles.textRight
                                  : styles.textLeft,
                                isLayoutRight
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
                              isLayoutRight
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
                                isLayoutRight
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
          <View
            style={[
              styles.fabMenu,
              isLayoutRight
                ? styles.fabMenuLeft
                : styles.fabMenuRight,
            ]}
          >
            {fabOptions.map(
              (option, index) => {
                const OptionIcon =
                  option.icon;

                return (
                  <MotiView
                    key={option.id}
                    from={{
                      opacity: 0,
                      scale: 0.5,
                      translateY: 20,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      translateY: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.5,
                      translateY: 20,
                    }}
                    transition={{
                      delay:
                        index * 100,
                      type: 'spring',
                      damping: 15,
                    }}
                    style={[
                      styles.fabOption,
                      isLayoutRight
                        ? styles.fabOptionLeft
                        : styles.fabOptionRight,
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.fabOptionButton,
                        {
                          backgroundColor:
                            option.color,
                          overflow: 'hidden',
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
                        } else if (
                          option.id ===
                          'medication'
                        ) {
                          handleNavigate(
                            '/medication/add'
                          );
                        } else if (
                          option.id ===
                          'consultation'
                        ) {
                          handleNavigate(
                            '/consultation/add'
                          );
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <ShineEffect
                        color="#FFFFFF"
                        delay={
                          1300 +
                          index * 250
                        }
                        duration={1600}
                        opacity={0.16}
                      />

                      <OptionIcon
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <Text
                      style={[
                        styles.fabOptionLabel,
                        {
                          color:
                            '#FFFFFF',
                        },
                        isLayoutRight
                          ? styles.textLeft
                          : styles.textRight,
                      ]}
                    >
                      {
                        option.label
                      }
                    </Text>
                  </MotiView>
                );
              }
            )}
          </View>
        )}
      </AnimatePresence>

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor:
              softPurple,
            overflow: 'hidden',
          },
          isLayoutRight
            ? styles.fabLeft
            : styles.fabRight,
        ]}
        onPress={() =>
          setIsFabOpen(
            !isFabOpen
          )
        }
        activeOpacity={0.8}
      >
        <ShineEffect
          color="#FFFFFF"
          delay={1200}
          duration={1500}
          opacity={0.18}
        />

        <MotiView
          animate={{
            rotate: isFabOpen
              ? '45deg'
              : '0deg',
          }}
          transition={{
            type: 'timing',
            duration: 300,
          }}
        >
          <Plus
            size={28}
            color="#FFFFFF"
          />
        </MotiView>
      </TouchableOpacity>
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

  fab: {
    position: 'absolute',

    bottom: 30,

    width: 60,
    height: 60,

    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.22,
    shadowRadius: 8,

    elevation: 6,

    zIndex: 10,
  },

  fabLeft: {
    left: 30,
    right: 'auto',
  },

  fabRight: {
    right: 30,
    left: 'auto',
  },

  fabMenu: {
    position: 'absolute',

    bottom: 100,

    zIndex: 5,
  },

  fabMenuLeft: {
    left: 20,
    right: 'auto',
    alignItems: 'flex-start',
  },

  fabMenuRight: {
    right: 20,
    left: 'auto',
    alignItems: 'flex-end',
  },

  fabOption: {
    alignItems: 'center',

    marginBottom: 12,

    flexDirection: 'row',

    gap: 8,
  },

  fabOptionLeft: {
    flexDirection: 'row',
  },

  fabOptionRight: {
    flexDirection: 'row-reverse',
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
      height: 2,
    },

    shadowOpacity: 0.20,
    shadowRadius: 4,

    elevation: 4,
  },

  fabOptionLabel: {
    fontSize: 14,
    fontWeight: '500',

    backgroundColor:
      'rgba(0,0,0,0.7)',

    paddingHorizontal: 12,
    paddingVertical: 4,

    borderRadius: 8,

    overflow: 'hidden',
  },
  timelineItem: {
    width: '100%',
  
    position: 'relative',
  
    paddingBottom:
      Spacing.md,
  },
});