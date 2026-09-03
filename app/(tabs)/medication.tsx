import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import {
  useRouter,
  useFocusEffect,
} from 'expo-router';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

import { Card } from '../../components/ui/Card';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import {
  Pill,
  Clock,
  Plus,
  CheckCircle,
  Calendar,
  Flame,
  Brain,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react-native';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  time: string;
  status: 'taken' | 'pending' | 'missed';
  type: string;
  adherence: number;
  date: string;
}

const MEDICATIONS_STORAGE_KEY = '@neurolia_medications';

const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

function toPersianDate(date: Date): {
  year: number;
  month: number;
  day: number;
} {
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

function getPersianMonthName(
  month: number,
  t: any
): string {
  const monthNames = [
    t.monthFarvardin || 'فروردین',
    t.monthOrdibehesht || 'اردیبهشت',
    t.monthKhordad || 'خرداد',
    t.monthTir || 'تیر',
    t.monthMordad || 'مرداد',
    t.monthShahrivar || 'شهریور',
    t.monthMehr || 'مهر',
    t.monthAban || 'آبان',
    t.monthAzar || 'آذر',
    t.monthDey || 'دی',
    t.monthBahman || 'بهمن',
    t.monthEsfand || 'اسفند',
  ];

  return monthNames[month - 1] || '';
}

export default function MedicationScreen() {
  const { colors, isDark, isAthlete } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  // ============================================================
  // Unified theme color
  // ============================================================

  const themeColor = isAthlete
    ? '#22C55E'
    : isDark
      ? 'rgba(73, 194, 226, 1)'
      : colors.primary;

  const iconColor = themeColor;

  const primarySoft = isAthlete
    ? 'rgba(34,197,94,0.10)'
    : isDark
      ? 'rgba(73, 194, 226, 0.18)'
      : 'rgba(107,90,166,0.10)';

  const primaryMedium = isAthlete
    ? 'rgba(34,197,94,0.25)'
    : isDark
      ? 'rgba(73, 194, 226, 0.30)'
      : 'rgba(107,90,166,0.18)';

  const gradientColors = isAthlete
    ? ['#22C55E', '#16A34A'] as const
    : isDark
      ? [
          'rgba(73, 194, 226, 1)',
          'rgba(73, 194, 226, 0.8)',
        ] as const
      : [colors.primary, colors.primary] as const;

  const addGradientColors = gradientColors;

  // ============================================================
  // Default medications
  // ============================================================

  const createDefaultMedications = useCallback(
    (): Medication[] => {
      const today = getDateKey();

      return [
        {
          id: 1,
          name: 'Donepezil',
          dosage: '10mg',
          time: '08:00',
          status: 'taken',
          type: t.cognitive || 'Cognitive',
          adherence: 85,
          date: today,
        },
        {
          id: 2,
          name: 'Memantine',
          dosage: '20mg',
          time: '20:00',
          status: 'pending',
          type: t.cognitive || 'Cognitive',
          adherence: 92,
          date: today,
        },
      ];
    },
    [t]
  );

  const [medications, setMedications] = useState<Medication[]>(
    createDefaultMedications()
  );

  // ============================================================
  // Load medications
  // ============================================================

  const loadMedications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(
        MEDICATIONS_STORAGE_KEY
      );

      if (stored) {
        const parsed: Medication[] = JSON.parse(stored);
        setMedications(parsed);
        return;
      }

      const defaults = createDefaultMedications();

      setMedications(defaults);

      await AsyncStorage.setItem(
        MEDICATIONS_STORAGE_KEY,
        JSON.stringify(defaults)
      );
    } catch (error) {
      console.error(
        'Failed to load medications:',
        error
      );
    }
  }, [createDefaultMedications]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications])
  );

  // ============================================================
  // Date
  // ============================================================

  const todayKey = getDateKey();
  const now = new Date();
  const persianDate = toPersianDate(now);

  const calendarTitle = useMemo(() => {
    if (isRTL) {
      const monthName = getPersianMonthName(
        persianDate.month,
        t
      );

      const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

      const persianYear = persianDate.year
        .toString()
        .split('')
        .map(
          digit =>
            persianDigits[
              parseInt(digit, 10)
            ] || digit
        )
        .join('');

      return `${monthName} ${persianYear}`;
    }

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
  }, [isRTL, persianDate, t, now]);

  // ============================================================
  // Today's medications
  // ============================================================

  const todayMedications = useMemo(() => {
    return medications.filter(
      medication => medication.date === todayKey
    );
  }, [medications, todayKey]);

  const takenCount = todayMedications.filter(
    medication => medication.status === 'taken'
  ).length;

  const pendingCount = todayMedications.filter(
    medication => medication.status !== 'taken'
  ).length;

  const totalToday = todayMedications.length;

  const nextMedication = todayMedications
    .filter(
      medication => medication.status !== 'taken'
    )
    .sort((a, b) =>
      a.time.localeCompare(b.time)
    )[0];

  // ============================================================
  // Unified status color
  // ============================================================

  const getStatusColor = (
    _status: Medication['status']
  ) => {
    return iconColor;
  };

  // ============================================================
  // Mark as taken
  // ============================================================

  const markAsTaken = useCallback(
    async (id: number) => {
      const medication = medications.find(
        item => item.id === id
      );

      if (!medication) {
        return;
      }

      if (medication.status === 'taken') {
        return;
      }

      const updatedMedications = medications.map(
        item => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            status: 'taken' as const,
            adherence: Math.min(
              100,
              item.adherence + 5
            ),
          };
        }
      );

      setMedications(updatedMedications);

      try {
        await AsyncStorage.setItem(
          MEDICATIONS_STORAGE_KEY,
          JSON.stringify(updatedMedications)
        );

        Alert.alert(
          `✓ ${
            t.medicationTaken ||
            'Medication Taken'
          }`,
          `${medication.name} (${medication.dosage}) ${
            t.medicationTakenMessage ||
            'marked as taken!'
          }`,
          [
            {
              text: t.great || 'Great!',
            },
          ]
        );
      } catch (error) {
        console.error(
          'Failed to save medication:',
          error
        );
      }
    },
    [medications, t]
  );

  // ============================================================
  // Refresh
  // ============================================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    loadMedications().finally(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    });
  }, [loadMedications]);

  // ============================================================
  // Greeting
  // ============================================================

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

  // ============================================================
  // Calendar
  // ============================================================

  const baseCalendarDays = [
    {
      day: t.daySat || 'Sat',
      taken: true,
    },
    {
      day: t.daySun || 'Sun',
      taken: true,
    },
    {
      day: t.dayMon || 'Mon',
      taken: true,
    },
    {
      day: t.dayTue || 'Tue',
      taken: true,
    },
    {
      day: t.dayWed || 'Wed',
      taken: false,
    },
    {
      day: t.dayThu || 'Thu',
      taken: false,
    },
    {
      day: t.dayFri || 'Fri',
      taken: false,
    },
  ];

  const calendarDays = useMemo(() => {
    return isRTL
      ? [...baseCalendarDays].reverse()
      : baseCalendarDays;
  }, [isRTL, t]);

  // ============================================================
  // Back
  // ============================================================

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/psycho');
    }
  }, [router]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <View
        style={[
          styles.pageHeader,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={
            t.back || 'Back'
          }
          style={[
            styles.unifiedBackButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ArrowLeft
            size={21}
            color={iconColor}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.pageHeaderText,
            {
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.pageHeaderTitle,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
            numberOfLines={2}
          >
            {t.medications || 'Medications'}
          </Text>

          <Text
            style={[
              styles.pageHeaderSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {totalToday}{' '}
            {t.medicinesToday ||
              'medicines today'}
          </Text>
        </View>

        <View
          style={[
            styles.avatarWrapper,
            {
              backgroundColor: primarySoft,
            },
          ]}
        >
          <Image
            source={require('../../assets/avatars/model1.jpg')}
            style={styles.characterImage}
          />
        </View>
      </View>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={iconColor}
          />
        }
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: -15,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
          }}
          style={styles.header}
        >
          <View
            style={[
              styles.headerContent,
              {
                flexDirection: 'row',
              },
            ]}
          >
            <View
              style={[
                styles.headerTextContainer,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.greeting,
                  {
                    color: colors.text,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
                numberOfLines={1}
              >
                {getGreeting()},{' '}
                {user?.name ||
                  t.there ||
                  'there'}
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color:
                      colors.textSecondary,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                {t.yourMedicationJourney ||
                  'Your medication journey'}
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color:
                      colors.textSecondary,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                {t.isUnderControl ||
                  'is under control'}
              </Text>
            </View>
          </View>

          {/* ====================================================
              STATUS BAR
          ==================================================== */}

          <View
            style={[
              styles.statusBar,
              {
                backgroundColor: primarySoft,
              },
            ]}
          >
            <View style={styles.statusItem}>
              <Flame
                size={19}
                color={iconColor}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                7{' '}
                {t.daysPerfect ||
                  'days perfect'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDivider,
                {
                  backgroundColor:
                    primaryMedium,
                },
              ]}
            />

            <View style={styles.statusItem}>
              <Pill
                size={19}
                color={iconColor}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {totalToday}{' '}
                {t.medicinesToday ||
                  'medicines today'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDivider,
                {
                  backgroundColor:
                    primaryMedium,
                },
              ]}
            />

            <View style={styles.statusItem}>
              <Clock
                size={19}
                color={iconColor}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.next || 'Next'}{' '}
                {nextMedication?.time ||
                  '—'}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* ======================================================
            STATS
        ====================================================== */}

        <View style={styles.statsGrid}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <View style={styles.statContent}>
              <Pill
                size={24}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.statNumberWhite
                }
              >
                {totalToday}
              </Text>

              <Text
                style={
                  styles.statLabelWhite
                }
              >
                {t.today || 'Today'}
              </Text>
            </View>
          </LinearGradient>

          <Card
            style={{
              flex: 1,
              padding: Spacing.md,
              alignItems: 'center',
            }}
          >
            <View
              style={[
                styles.statIconContainer,
                {
                  backgroundColor:
                    primarySoft,
                },
              ]}
            >
              <CheckCircle
                size={24}
                color={iconColor}
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: iconColor,
                },
              ]}
            >
              {takenCount}
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
              {t.taken || 'Taken'}
            </Text>
          </Card>

          <Card
            style={{
              flex: 1,
              padding: Spacing.md,
              alignItems: 'center',
            }}
          >
            <View
              style={[
                styles.statIconContainer,
                {
                  backgroundColor:
                    primarySoft,
                },
              ]}
            >
              <Clock
                size={24}
                color={iconColor}
              />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: iconColor,
                },
              ]}
            >
              {pendingCount}
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
              {t.pending || 'Pending'}
            </Text>
          </Card>
        </View>

        {/* ======================================================
            ADD MEDICATION
        ====================================================== */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push(
              '/medication/add' as any
            )
          }
          style={styles.addButtonWrapper}
        >
          <LinearGradient
            colors={addGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Plus
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={styles.addButtonText}
            >
              {t.addMedication ||
                'Add Medication'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ======================================================
            CALENDAR
        ====================================================== */}

        <Card
          style={{
            padding: Spacing.md,
            marginBottom: Spacing.md,
          }}
        >
          <View
            style={[
              styles.calendarHeader,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <Calendar
              size={20}
              color={iconColor}
            />

            <Text
              style={[
                styles.calendarTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {calendarTitle}
            </Text>
          </View>

          <View
            style={styles.calendarGrid}
          >
            {calendarDays.map(
              (day, index) => (
                <View
                  key={index}
                  style={
                    styles.calendarDay
                  }
                >
                  <Text
                    style={[
                      styles.calendarDayText,
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
                      styles.calendarDot,
                      {
                        backgroundColor:
                          day.taken
                            ? iconColor
                            : colors.border,
                      },
                    ]}
                  />
                </View>
              )
            )}
          </View>
        </Card>

        {/* ======================================================
            TODAY'S MEDICATIONS
        ====================================================== */}

        <View
          style={styles.medicationSection}
        >
          <View
            style={[
              styles.sectionHeader,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {t.todaysMedications ||
                "Today's Medications"}
            </Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  '/medication/history' as any
                )
              }
              style={[
                styles.viewAllButton,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <Text
                style={[
                  styles.viewAll,
                  {
                    color: iconColor,
                  },
                ]}
              >
                {t.viewAll || 'View All'}
              </Text>

              <ChevronRight
                size={16}
                color={iconColor}
                style={
                  isRTL
                    ? {
                        transform: [
                          {
                            scaleX: -1,
                          },
                        ],
                      }
                    : undefined
                }
              />
            </TouchableOpacity>
          </View>

          {todayMedications.length ===
          0 ? (
            <Card
              style={styles.emptyCard}
            >
              <Pill
                size={30}
                color={iconColor}
              />

              <Text
                style={[
                  styles.emptyText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {t.noMedicationsToday ||
                  'No medications scheduled for today'}
              </Text>
            </Card>
          ) : (
            todayMedications.map(
              (med, index) => (
                <MotiView
                  key={med.id}
                  from={{
                    opacity: 0,
                    translateY: 15,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    delay: index * 100,
                    type: 'timing',
                    duration: 350,
                  }}
                >
                  <Card
                    style={[
                      styles.medicationCard,
                      {
                        marginBottom:
                          Spacing.sm,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.medicationRow,
                        {
                          flexDirection:
                            isRTL
                              ? 'row-reverse'
                              : 'row',
                        },
                      ]}
                    >
                      {/* Medication icon */}

                      <View
                        style={[
                          styles.medicationIcon,
                          {
                            backgroundColor:
                              primarySoft,
                          },
                        ]}
                      >
                        <Pill
                          size={24}
                          color={iconColor}
                        />
                      </View>

                      {/* Medication info */}

                      <View
                        style={
                          styles.medicationInfo
                        }
                      >
                        <Text
                          style={[
                            styles.medicationName,
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
                          {med.name}
                        </Text>

                        <View
                          style={[
                            styles.medicationDetails,
                            {
                              flexDirection:
                                isRTL
                                  ? 'row-reverse'
                                  : 'row',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.medicationDosage,
                              {
                                color:
                                  colors.textSecondary,
                              },
                            ]}
                          >
                            {med.dosage}
                          </Text>

                          <View
                            style={[
                              styles.medicationType,
                              {
                                flexDirection:
                                  isRTL
                                    ? 'row-reverse'
                                    : 'row',
                              },
                            ]}
                          >
                            <Brain
                              size={14}
                              color={
                                iconColor
                              }
                            />

                            <Text
                              style={[
                                styles.medicationTypeText,
                                {
                                  color:
                                    colors.textSecondary,
                                },
                              ]}
                            >
                              {med.type}
                            </Text>
                          </View>
                        </View>

                        {/* Time */}

                        <View
                          style={[
                            styles.timeContainer,
                            {
                              flexDirection:
                                isRTL
                                  ? 'row-reverse'
                                  : 'row',
                            },
                          ]}
                        >
                          <Clock
                            size={14}
                            color={
                              iconColor
                            }
                          />

                          <Text
                            style={[
                              styles.medicationTime,
                              {
                                color:
                                  colors.textSecondary,
                              },
                            ]}
                          >
                            {med.time}
                          </Text>
                        </View>

                        {/* Adherence */}

                        <View
                          style={[
                            styles.adherenceContainer,
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
                              styles.adherenceBar,
                              {
                                backgroundColor:
                                  colors.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.adherenceFill,
                                {
                                  width: `${med.adherence}%`,
                                  backgroundColor:
                                    getStatusColor(
                                      med.status
                                    ),
                                },
                              ]}
                            />
                          </View>

                          <Text
                            style={[
                              styles.adherenceText,
                              {
                                color:
                                  colors.textSecondary,
                              },
                            ]}
                          >
                            {med.adherence}%{' '}
                            {t.adherence ||
                              'adherence'}
                          </Text>
                        </View>
                      </View>

                      {/* Status button */}

                      <TouchableOpacity
                        activeOpacity={
                          med.status ===
                          'taken'
                            ? 1
                            : 0.7
                        }
                        onPress={() => {
                          if (
                            med.status ===
                              'pending' ||
                            med.status ===
                              'missed'
                          ) {
                            markAsTaken(
                              med.id
                            );
                          }
                        }}
                        disabled={
                          med.status ===
                          'taken'
                        }
                        style={[
                          styles.statusButton,
                          {
                            borderColor:
                              `${iconColor}25`,
                            backgroundColor:
                              `${iconColor}08`,
                          },
                        ]}
                      >
                        {med.status ===
                        'taken' ? (
                          <View
                            style={
                              styles.statusContainer
                            }
                          >
                            <CheckCircle
                              size={22}
                              color={
                                iconColor
                              }
                            />

                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    iconColor,
                                },
                              ]}
                            >
                              {t.taken ||
                                'Taken'}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={
                              styles.statusContainer
                            }
                          >
                            <Clock
                              size={22}
                              color={
                                iconColor
                              }
                            />

                            <Text
                              style={[
                                styles.statusText,
                                {
                                  color:
                                    iconColor,
                                },
                              ]}
                            >
                              {t.tapToTake ||
                                'Tap to take'}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Card>
                </MotiView>
              )
            )
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: 40,
  },

  pageHeader: {
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 40,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  unifiedBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
  },

  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  pageHeaderTitle: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },

  pageHeaderSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },

  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
    marginLeft: Spacing.md,
  },

  characterImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },

  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  headerContent: {
    width: '100%',
    alignItems: 'center',
    minHeight: 82,
  },

  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },

  greeting: {
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 5,
  },

  headerSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },

  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },

  statusDivider: {
    width: 1,
    height: 20,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  gradientCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statContent: {
    alignItems: 'center',
  },

  statNumberWhite: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 3,
  },

  statLabelWhite: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },

  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: '700',
  },

  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  addButtonWrapper: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  calendarHeader: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },

  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  calendarDay: {
    alignItems: 'center',
    gap: 4,
  },

  calendarDayText: {
    fontSize: 12,
    fontWeight: '500',
  },

  calendarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  medicationSection: {
    marginBottom: Spacing.lg,
  },

  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  viewAllButton: {
    alignItems: 'center',
    gap: 2,
  },

  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },

  medicationCard: {
    padding: Spacing.md,
  },

  medicationRow: {
    alignItems: 'flex-start',
  },

  medicationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },

  medicationInfo: {
    flex: 1,
    minWidth: 0,
  },

  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  medicationDetails: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  medicationDosage: {
    fontSize: 13,
  },

  medicationType: {
    alignItems: 'center',
    gap: 4,
  },

  medicationTypeText: {
    fontSize: 12,
  },

  timeContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },

  medicationTime: {
    fontSize: 12,
  },

  adherenceContainer: {
    alignItems: 'center',
    gap: 8,
  },

  adherenceBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },

  adherenceFill: {
    height: '100%',
    borderRadius: 2,
  },

  adherenceText: {
    fontSize: 10,
  },

  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: BorderRadius.md,
    marginLeft: 4,
    minWidth: 68,
    borderWidth: 1,
  },

  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },

  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },

  bottomSpace: {
    height: 100,
  },
});