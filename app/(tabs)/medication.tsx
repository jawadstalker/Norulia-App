import React, { useState, useMemo } from 'react';
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
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';
import {
  Pill,
  Clock,
  Plus,
  CheckCircle,
  Calendar,
  Flame,
  Brain,
  ChevronRight,
  ChevronLeft,
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

function getPersianMonthName(month: number, t: any): string {
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
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);

  const [medications, setMedications] = useState<Medication[]>([
    {
      id: 1,
      name: 'Donepezil',
      dosage: '10mg',
      time: '08:00',
      status: 'taken',
      type: t.cognitive || 'Cognitive',
      adherence: 85,
      date: '2026-08-05',
    },
    {
      id: 2,
      name: 'Memantine',
      dosage: '20mg',
      time: '20:00',
      status: 'pending',
      type: t.cognitive || 'Cognitive',
      adherence: 92,
      date: '2026-08-05',
    },
    {
      id: 3,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      time: '12:00',
      status: 'missed',
      type: t.supplement || 'Supplement',
      adherence: 70,
      date: '2026-08-05',
    },
  ]);

  const now = new Date();
  const persianDate = toPersianDate(now);

  const calendarTitle = useMemo(() => {
    if (isRTL) {
      const monthName = getPersianMonthName(persianDate.month, t);

      const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

      const persianYear = persianDate.year
        .toString()
        .split('')
        .map((d) => persianDigits[parseInt(d)] || d)
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
  }, [isRTL, persianDate, t]);

  const todayMedications = medications.filter(
    (m) => m.date === '2026-08-05'
  );

  const takenCount = todayMedications.filter(
    (m) => m.status === 'taken'
  ).length;

  const pendingCount = todayMedications.filter(
    (m) => m.status === 'pending'
  ).length;

  const totalToday = todayMedications.length;

  const markAsTaken = (id: number) => {
    setMedications((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'taken' as const,
              adherence: Math.min(100, item.adherence + 5),
            }
          : item
      )
    );

    const med = medications.find((m) => m.id === id);

    if (med) {
      Alert.alert(
        `✅ ${t.medicationTaken || 'Medication Taken'}`,
        `${med.name} (${med.dosage}) ${
          t.medicationTakenMessage || 'marked as taken!'
        }`,
        [{ text: t.great || 'Great!' }]
      );
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return '#10B981';

      case 'pending':
        return '#F59E0B';

      case 'missed':
        return '#EF4444';

      default:
        return colors.primary;
    }
  };

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

  const baseCalendarDays = [
    { day: t.daySat || 'Sat', taken: true },
    { day: t.daySun || 'Sun', taken: true },
    { day: t.dayMon || 'Mon', taken: true },
    { day: t.dayTue || 'Tue', taken: true },
    { day: t.dayWed || 'Wed', taken: false },
    { day: t.dayThu || 'Thu', taken: false },
    { day: t.dayFri || 'Fri', taken: false },
  ];

  const calendarDays = useMemo(() => {
    return isRTL
      ? [...baseCalendarDays].reverse()
      : baseCalendarDays;
  }, [isRTL, t]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
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
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t.back || 'Back'}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
              style={[
                styles.backButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <ChevronLeft
                size={26}
                strokeWidth={3}
                color={colors.text}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.headerTextContainer,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.greeting,
                  {
                    color: colors.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
                numberOfLines={1}
              >
                {getGreeting()}, {user?.name || t.there || 'there'}
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
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
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {t.isUnderControl || 'is under control'}
              </Text>
            </View>

            <View
              style={[
                styles.avatarWrapper,
                {
                  backgroundColor: colors.primary + '18',
                },
              ]}
            >
              <Image
                source={require('../../assets/avatars/model1.jpg')}
                style={styles.characterImage}
              />
            </View>
          </View>

          <View
            style={[
              styles.statusBar,
              {
                backgroundColor: colors.primary + '08',
              },
            ]}
          >
            <View style={styles.statusItem}>
              <Flame size={19} color="#F97316" />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                7 {t.daysPerfect || 'days perfect'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDivider,
                {
                  backgroundColor: colors.primary + '20',
                },
              ]}
            />

            <View style={styles.statusItem}>
              <Pill size={19} color={colors.primary} />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {totalToday}{' '}
                {t.medicinesToday || 'medicines today'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDivider,
                {
                  backgroundColor: colors.primary + '20',
                },
              ]}
            />

            <View style={styles.statusItem}>
              <Clock size={19} color="#3B82F6" />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.next || 'Next'}{' '}
                {medications.find(
                  (m) => m.status === 'pending'
                )?.time || '—'}
              </Text>
            </View>
          </View>
        </MotiView>

        <View style={styles.statsGrid}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={styles.gradientCard}
          >
            <View style={styles.statContent}>
              <Pill size={24} color="#FFFFFF" />

              <Text style={styles.statNumberWhite}>
                {totalToday}
              </Text>

              <Text style={styles.statLabelWhite}>
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
                  backgroundColor: '#10B98120',
                },
              ]}
            >
              <CheckCircle size={24} color="#10B981" />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: '#10B981',
                },
              ]}
            >
              {takenCount}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
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
                  backgroundColor: '#F59E0B20',
                },
              ]}
            >
              <Clock size={24} color="#F59E0B" />
            </View>

            <Text
              style={[
                styles.statNumber,
                {
                  color: '#F59E0B',
                },
              ]}
            >
              {pendingCount}
            </Text>

            <Text
              style={[
                styles.statLabel,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {t.pending || 'Pending'}
            </Text>
          </Card>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push('/medication/add' as any)
          }
          style={styles.addButtonWrapper}
        >
          <LinearGradient
            colors={['#7C3AED', '#3B82F6']}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={styles.addButton}
          >
            <Plus size={20} color="#FFFFFF" />

            <Text style={styles.addButtonText}>
              {t.addMedication || 'Add Medication'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

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
              color={colors.primary}
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

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <View
                key={index}
                style={styles.calendarDay}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {day.day}
                </Text>

                <View
                  style={[
                    styles.calendarDot,
                    {
                      backgroundColor: day.taken
                        ? '#10B981'
                        : colors.border,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.medicationSection}>
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
                router.push('/medication/history' as any)
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
                    color: colors.primary,
                  },
                ]}
              >
                {t.viewAll || 'View All'}
              </Text>

              <ChevronRight
                size={16}
                color={colors.primary}
                style={
                  isRTL
                    ? {
                        transform: [{ scaleX: -1 }],
                      }
                    : undefined
                }
              />
            </TouchableOpacity>
          </View>

          {medications
            .filter((m) => m.date === '2026-08-05')
            .map((med, index) => (
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
                      marginBottom: Spacing.sm,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.medicationRow,
                      {
                        flexDirection: isRTL
                          ? 'row-reverse'
                          : 'row',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.medicationIcon,
                        {
                          backgroundColor:
                            colors.primary + '20',
                        },
                      ]}
                    >
                      <Pill
                        size={24}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.medicationInfo}>
                      <Text
                        style={[
                          styles.medicationName,
                          {
                            color: colors.text,
                            textAlign: isRTL
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
                            flexDirection: isRTL
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
                              flexDirection: isRTL
                                ? 'row-reverse'
                                : 'row',
                            },
                          ]}
                        >
                          <Brain
                            size={14}
                            color={colors.primary}
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

                      <View
                        style={[
                          styles.timeContainer,
                          {
                            flexDirection: isRTL
                              ? 'row-reverse'
                              : 'row',
                          },
                        ]}
                      >
                        <Clock
                          size={14}
                          color={
                            colors.textSecondary
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

                      <View
                        style={[
                          styles.adherenceContainer,
                          {
                            flexDirection: isRTL
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

                    <TouchableOpacity
                      activeOpacity={
                        med.status === 'pending'
                          ? 0.7
                          : 1
                      }
                      onPress={() =>
                        med.status === 'pending' &&
                        markAsTaken(med.id)
                      }
                      disabled={
                        med.status === 'taken'
                      }
                      style={styles.statusButton}
                    >
                      {med.status === 'taken' ? (
                        <View
                          style={styles.statusContainer}
                        >
                          <CheckCircle
                            size={22}
                            color="#10B981"
                          />

                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: '#10B981',
                              },
                            ]}
                          >
                            {t.taken || 'Taken'}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={styles.statusContainer}
                        >
                          <Clock
                            size={22}
                            color="#F59E0B"
                          />

                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: '#F59E0B',
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
            ))}
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
  header: {
    paddingTop: 40,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    minHeight: 82,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: Spacing.md,
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    marginLeft: 4,
    minWidth: 62,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bottomSpace: {
    height: 100,
  },
});