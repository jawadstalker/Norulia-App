import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
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

const { width } = Dimensions.get('window');

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

/* -------------------------------------------------------------------------- */
/* Persian Date                                                               */
/* -------------------------------------------------------------------------- */

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
    (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) ||
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

/* -------------------------------------------------------------------------- */
/* Persian Digits                                                             */
/* -------------------------------------------------------------------------- */

function toPersianDigits(value: string | number): string {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

  return value
    .toString()
    .split('')
    .map((digit) => {
      const number = parseInt(digit, 10);

      return !isNaN(number) ? persianDigits[number] : digit;
    })
    .join('');
}

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

export default function ScheduleScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: t.meditationSession || 'Meditation Session',
      time: '09:00 AM',
      category: t.mindfulness || 'Mindfulness',
      duration: '20 ' + (t.minutes || 'min'),
      completed: true,
      icon: Brain,
      color: '#6366F1',
    },
    {
      id: '2',
      title: t.takeMedication || 'Take Medication',
      time: '12:00 PM',
      category: t.health || 'Health',
      duration: '5 ' + (t.minutes || 'min'),
      completed: false,
      icon: Pill,
      color: '#22C55E',
    },
    {
      id: '3',
      title: t.therapySession || 'Therapy Session',
      time: '03:00 PM',
      category: t.mentalHealth || 'Mental Health',
      duration: '45 ' + (t.minutes || 'min'),
      completed: false,
      icon: Heart,
      color: '#EC4899',
    },
    {
      id: '4',
      title: t.eveningRelaxation || 'Evening Relaxation',
      time: '08:00 PM',
      category: t.wellness || 'Wellness',
      duration: '30 ' + (t.minutes || 'min'),
      completed: false,
      icon: Moon,
      color: '#8B5CF6',
    },
  ]);

  const [isFabOpen, setIsFabOpen] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Events                                                                   */
  /* ------------------------------------------------------------------------ */

  const toggleCompletion = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? {
              ...event,
              completed: !event.completed,
            }
          : event
      )
    );
  };

  const completedCount = events.filter((event) => event.completed).length;
  const totalCount = events.length;

  /* ------------------------------------------------------------------------ */
  /* Greeting                                                                 */
  /* ------------------------------------------------------------------------ */

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return t.goodMorning || 'Good morning';
    }

    if (hour < 17) {
      return t.goodAfternoon || 'Good afternoon';
    }

    return t.goodEvening || 'Good evening';
  };

  /* ------------------------------------------------------------------------ */
  /* Date                                                                      */
  /* ------------------------------------------------------------------------ */

  const getDateDisplay = () => {
    const now = new Date();

    if (isRTL) {
      const persianDate = toPersianDate(now);
      const weekday = getPersianWeekday(now);
      const monthName = getPersianMonthName(persianDate.month);

      const dayStr = toPersianDigits(persianDate.day);
      const yearStr = toPersianDigits(persianDate.year);

      return `${weekday} ${dayStr} ${monthName} ${yearStr}`;
    }

    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /* ------------------------------------------------------------------------ */
  /* FAB                                                                       */
  /* ------------------------------------------------------------------------ */

  const fabOptions = [
    {
      id: 'task',
      label: t.add || 'Add Task',
      icon: Sparkles,
      color: '#7C3AED',
    },
    {
      id: 'medication',
      label: t.addMedication || 'Add Medication',
      icon: Pill,
      color: '#22C55E',
    },
    {
      id: 'consultation',
      label: t.addConsultation || 'Add Consultation',
      icon: Heart,
      color: '#EC4899',
    },
  ];

  const handleNavigate = (route: string) => {
    router.navigate(route as any);
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#0a0a0f', '#14141e']
          : ['#f0f4ff', '#ffffff']
      }
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

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
          style={styles.header}
        >
          <MotiView
            from={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: 'spring',
              damping: 12,
            }}
            style={[
              styles.avatarContainer,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Image
              source={require('../../assets/avatars/model3.png')}
              style={styles.avatar}
            />
          </MotiView>

          <Text
            style={[
              styles.greeting,
              {
                color: colors.textSecondary,
              },
              isRTL && styles.textRTL,
            ]}
          >
            {getGreeting()}, Alex
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
              isRTL && styles.textRTL,
            ]}
          >
            {t.dailyPlanner || 'Daily Planner AI'}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textTertiary,
              },
              isRTL && styles.textRTL,
            ]}
          >
            {t.activitiesToday || 'You have'}{' '}
            {toPersianDigits(totalCount - completedCount)}{' '}
            {t.activitiesToday?.toLowerCase() || 'activities today'}
          </Text>
        </MotiView>

        {/* ------------------------------------------------------------------ */}
        {/* Date Card                                                          */}
        {/* ------------------------------------------------------------------ */}

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
            style={{
              ...styles.dateCard,
              backgroundColor: isDark
                ? colors.surface
                : '#ffffff',
            }}
          >
            <View
              style={[
                styles.dateContent,
                isRTL && styles.dateContentRTL,
              ]}
            >
              <View
                style={[
                  styles.dateLeft,
                  isRTL && styles.dateLeftRTL,
                ]}
              >
                <Calendar
                  size={24}
                  color={colors.primary}
                />

                <View
                  style={[
                    styles.dateTextContainer,
                    isRTL && styles.dateTextContainerRTL,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      {
                        color: colors.text,
                      },
                      isRTL && styles.textRTL,
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
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.progressText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {toPersianDigits(completedCount)}/
                  {toPersianDigits(totalCount)}
                </Text>
              </MotiView>
            </View>

            <View style={styles.progressBarContainer}>
              <MotiView
                from={{
                  width: 0,
                }}
                animate={{
                  width: `${
                    totalCount > 0
                      ? (completedCount / totalCount) * 100
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
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </Card>
        </MotiView>

        {/* ------------------------------------------------------------------ */}
        {/* Timeline                                                           */}
        {/* ------------------------------------------------------------------ */}

        <View
          style={[
            styles.timeline,
            isRTL && styles.timelineRTL,
          ]}
        >
          {events.map((event, index) => {
            const EventIcon = event.icon;

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
                  delay: index * 150,
                  type: 'spring',
                  damping: 15,
                }}
              >
                <View
                  style={[
                    styles.timelineItem,
                    isRTL && styles.timelineItemRTL,
                  ]}
                >
                  {/* Timeline Line */}
                  {index < events.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: colors.border,
                        },
                        isRTL && styles.timelineLineRTL,
                      ]}
                    />
                  )}

                  {/* Timeline Dot */}
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: event.color,
                      },
                      isRTL && styles.timelineDotRTL,
                    ]}
                  />

                  {/* Event Card */}
                  <Card
                    style={{
                      ...styles.eventCard,
                      backgroundColor: isDark
                        ? colors.surface
                        : '#ffffff',
                      borderLeftColor: event.completed
                        ? '#10B981'
                        : event.color,
                      borderLeftWidth: isRTL ? 0 : 4,
                      borderRightWidth: isRTL ? 4 : 0,
                      borderRightColor: isRTL
                        ? event.completed
                          ? '#10B981'
                          : event.color
                        : 'transparent',
                      opacity: event.completed ? 0.8 : 1,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        toggleCompletion(event.id)
                      }
                      style={[
                        styles.eventContent,
                        isRTL &&
                          styles.eventContentRTL,
                      ]}
                      activeOpacity={0.7}
                    >
                      {/* Event Icon */}
                      <View
                        style={[
                          styles.eventIconContainer,
                          {
                            backgroundColor:
                              event.color + '20',
                          },
                          isRTL &&
                            styles.eventIconContainerRTL,
                        ]}
                      >
                        <EventIcon
                          size={24}
                          color={event.color}
                        />
                      </View>

                      {/* Event Text */}
                      <View
                        style={[
                          styles.eventTextContainer,
                          isRTL &&
                            styles.eventTextContainerRTL,
                        ]}
                      >
                        {/* -------------------------------------------------- */}
                        {/* Event Header                                        */}
                        {/* -------------------------------------------------- */}

                        <View
                          style={[
                            styles.eventHeader,
                            isRTL &&
                              styles.eventHeaderRTL,
                          ]}
                        >
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.eventTitle,
                              {
                                color: colors.text,
                                textDecorationLine:
                                  event.completed
                                    ? 'line-through'
                                    : 'none',
                              },
                              isRTL &&
                                styles.textRTL,
                            ]}
                          >
                            {event.title}
                          </Text>

                          {/* Status Icon Wrapper */}
                          <View
                            style={[
                              styles.eventStatusIcon,
                              isRTL &&
                                styles.eventStatusIconRTL,
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
                                  size={22}
                                  color="#10B981"
                                />
                              </MotiView>
                            ) : (
                              <Circle
                                size={22}
                                color={
                                  colors.textTertiary
                                }
                              />
                            )}
                          </View>
                        </View>

                        {/* -------------------------------------------------- */}
                        {/* Event Details                                       */}
                        {/* -------------------------------------------------- */}

                        <View
                          style={[
                            styles.eventDetails,
                            isRTL &&
                              styles.eventDetailsRTL,
                          ]}
                        >
                          <Clock
                            size={14}
                            color={colors.textTertiary}
                          />

                          <Text
                            style={[
                              styles.eventTime,
                              {
                                color:
                                  colors.textSecondary,
                              },
                              isRTL &&
                                styles.textRTL,
                              isRTL &&
                                styles.eventTimeRTL,
                            ]}
                          >
                            {event.time} •{' '}
                            {event.duration}
                          </Text>
                        </View>

                        {/* -------------------------------------------------- */}
                        {/* Category                                            */}
                        {/* -------------------------------------------------- */}

                        <View
                          style={[
                            styles.eventCategory,
                            isRTL &&
                              styles.eventCategoryRTL,
                          ]}
                        >
                          <Text
                            style={[
                              styles.eventCategoryText,
                              {
                                color:
                                  colors.textTertiary,
                              },
                              isRTL &&
                                styles.textRTL,
                            ]}
                          >
                            {event.category}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Card>
                </View>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>

      {/* -------------------------------------------------------------------- */}
      {/* FAB Menu                                                             */}
      {/* -------------------------------------------------------------------- */}

      <AnimatePresence>
        {isFabOpen && (
          <View
            style={[
              styles.fabMenu,
              isRTL && styles.fabMenuRTL,
            ]}
          >
            {fabOptions.map((option, index) => {
              const OptionIcon = option.icon;

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
                    delay: index * 100,
                    type: 'spring',
                    damping: 15,
                  }}
                  style={[
                    styles.fabOption,
                    isRTL &&
                      styles.fabOptionRTL,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.fabOptionButton,
                      {
                        backgroundColor:
                          option.color,
                      },
                    ]}
                    onPress={() => {
                      setIsFabOpen(false);

                      if (option.id === 'task') {
                        handleNavigate(
                          '/schedule/add'
                        );
                      } else if (
                        option.id === 'medication'
                      ) {
                        handleNavigate(
                          '/medication/add'
                        );
                      } else if (
                        option.id === 'consultation'
                      ) {
                        handleNavigate(
                          '/consultation/add'
                        );
                      }
                    }}
                  >
                    <OptionIcon
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.fabOptionLabel,
                      {
                        color: '#FFFFFF',
                      },
                      isRTL && styles.textRTL,
                    ]}
                  >
                    {option.label}
                  </Text>
                </MotiView>
              );
            })}
          </View>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------------- */}
      {/* FAB                                                                   */}
      {/* -------------------------------------------------------------------- */}

      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
          },
          isRTL && styles.fabRTL,
        ]}
        onPress={() =>
          setIsFabOpen(!isFabOpen)
        }
        activeOpacity={0.8}
      >
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

/* ========================================================================== */
/* Styles                                                                     */
/* ========================================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingTop: 80,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 160,
  },

  /* ------------------------------------------------------------------------ */
  /* Header                                                                   */
  /* ------------------------------------------------------------------------ */

  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  avatar: {
    width: 100,
    height: 100,
  },

  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },

  subtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },

  /* ------------------------------------------------------------------------ */
  /* RTL Text                                                                 */
  /* ------------------------------------------------------------------------ */

  textRTL: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },

  /* ------------------------------------------------------------------------ */
  /* Date Card                                                                */
  /* ------------------------------------------------------------------------ */

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

  dateContentRTL: {
    flexDirection: 'row-reverse',
  },

  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  dateLeftRTL: {
    flexDirection: 'row-reverse',
  },

  dateTextContainer: {
    marginLeft: Spacing.sm,
    flex: 1,
  },

  dateTextContainerRTL: {
    marginLeft: 0,
    marginRight: Spacing.sm,
    alignItems: 'flex-end',
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
    marginLeft: Spacing.sm,
  },

  progressText: {
    fontSize: 14,
    fontWeight: '700',
  },

  progressBarContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },

  progressBar: {
    height: 4,
    borderRadius: 2,
  },

  /* ------------------------------------------------------------------------ */
  /* Timeline                                                                 */
  /* ------------------------------------------------------------------------ */

  timeline: {
    paddingTop: Spacing.sm,
  },

  timelineRTL: {
    paddingTop: Spacing.sm,
  },

  timelineItem: {
    paddingLeft: 20,
    paddingBottom: Spacing.md,
    position: 'relative',
  },

  timelineItemRTL: {
    paddingLeft: 0,
    paddingRight: 20,
  },

  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 24,
    bottom: 0,
    width: 2,
  },

  timelineLineRTL: {
    left: 'auto',
    right: 6,
  },

  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },

  timelineDotRTL: {
    left: 'auto',
    right: 0,
  },

  /* ------------------------------------------------------------------------ */
  /* Event Card                                                               */
  /* ------------------------------------------------------------------------ */

  eventCard: {
    marginLeft: Spacing.md,
    padding: Spacing.md,
  },

  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  eventContentRTL: {
    flexDirection: 'row-reverse',
  },

  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    flexShrink: 0,
  },

  eventIconContainerRTL: {
    marginRight: 0,
    marginLeft: Spacing.md,
  },

  /* ------------------------------------------------------------------------ */
  /* Event Text                                                               */
  /* ------------------------------------------------------------------------ */

  eventTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  eventTextContainerRTL: {
    alignItems: 'stretch',
  },

  /* ------------------------------------------------------------------------ */
  /* Event Header                                                             */
  /* ------------------------------------------------------------------------ */

  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minWidth: 0,
  },

  eventHeaderRTL: {
    flexDirection: 'row-reverse',
  },

  eventTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 23,
  },

  /*
   * مهم:
   * فاصله تیک از متن دیگر با margin روی eventTitle کنترل نمی‌شود.
   * این wrapper باعث می‌شود در RTL و LTR فاصله همیشه ثابت بماند.
   */

  eventStatusIcon: {
    marginLeft: Spacing.md,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventStatusIconRTL: {
    marginLeft: 0,
    marginRight: Spacing.md,
  },

  /* ------------------------------------------------------------------------ */
  /* Event Details                                                            */
  /* ------------------------------------------------------------------------ */

  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  eventDetailsRTL: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },

  eventTime: {
    fontSize: 13,
    marginLeft: 4,
  },

  eventTimeRTL: {
    marginLeft: 0,
    marginRight: 4,
  },

  /* ------------------------------------------------------------------------ */
  /* Event Category                                                           */
  /* ------------------------------------------------------------------------ */

  eventCategory: {
    marginTop: 4,
  },

  eventCategoryRTL: {
    alignItems: 'flex-end',
  },

  eventCategoryText: {
    fontSize: 12,
  },

  /* ------------------------------------------------------------------------ */
  /* FAB                                                                      */
  /* ------------------------------------------------------------------------ */

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },

  fabRTL: {
    right: 'auto',
    left: 30,
  },

  fabMenu: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 5,
  },

  fabMenuRTL: {
    right: 'auto',
    left: 20,
    alignItems: 'flex-start',
  },

  fabOption: {
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },

  fabOptionRTL: {
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },

  fabOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});