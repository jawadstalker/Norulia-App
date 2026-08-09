import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
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
  Bell,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Flame,
  Brain,
  ChevronRight,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// نوع داده برای دارو
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

// تابع برای تبدیل تاریخ میلادی به شمسی
function toPersianDate(date: Date): { year: number; month: number; day: number } {
  // الگوریتم تبدیل تقویم میلادی به شمسی
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  // محاسبه روزهای گذشته از ابتدای سال میلادی
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let daysPassed = 0;
  for (let i = 1; i < gregorianMonth; i++) {
    daysPassed += daysInMonth[i];
  }
  daysPassed += gregorianDay;

  // اضافه کردن روز برای سال کبیسه
  const isLeap = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || (gregorianYear % 400 === 0);
  if (isLeap && gregorianMonth > 2) {
    daysPassed += 1;
  }

  // محاسبه سال شمسی
  let persianYear = gregorianYear - 622;
  let persianMonth = 1;
  let persianDay = daysPassed - 79;

  // تنظیم برای روزهای قبل از شروع سال شمسی
  if (persianDay <= 0) {
    persianYear -= 1;
    persianDay += 365;
    if ((persianYear + 1) % 4 === 0) {
      persianDay += 1;
    }
  }

  // محاسبه ماه و روز شمسی
  const persianDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
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

  return { year: persianYear, month: persianMonth, day: persianDay };
}

// تابع برای دریافت نام ماه شمسی
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

  // State برای مدیریت داروها
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

  // دریافت تاریخ فعلی
  const now = new Date();
  const persianDate = toPersianDate(now);

  // عنوان تقویم بر اساس زبان
  const calendarTitle = useMemo(() => {
    if (isRTL) {
      // فارسی: نمایش ماه و سال شمسی
      const monthName = getPersianMonthName(persianDate.month, t);
      // تبدیل عدد سال شمسی به حروف فارسی
      const persianYearStr = persianDate.year.toString();
      const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
      const persianYear = persianYearStr
        .split('')
        .map(d => persianDigits[parseInt(d)] || d)
        .join('');
      return `${monthName} ${persianYear}`;
    } else {
      // انگلیسی: نمایش ماه و سال میلادی
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }
  }, [isRTL, persianDate, t, now]);

  // محاسبه آمار
  const todayMedications = medications.filter(m => m.date === '2026-08-05');
  const takenCount = todayMedications.filter(m => m.status === 'taken').length;
  const pendingCount = todayMedications.filter(m => m.status === 'pending').length;
  const missedCount = todayMedications.filter(m => m.status === 'missed').length;
  const totalToday = todayMedications.length;

  // تابع برای علامت زدن داروی مصرف شده
  const markAsTaken = (id: number) => {
    setMedications(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: 'taken' as const, adherence: Math.min(100, item.adherence + 5) }
          : item
      )
    );
    
    // نمایش پیام تأیید
    const med = medications.find(m => m.id === id);
    if (med) {
      Alert.alert(
        `✅ ${t.medicationTaken || 'Medication Taken'}`,
        `${med.name} (${med.dosage}) ${t.medicationTakenMessage || 'marked as taken!'}`,
        [{ text: t.great || 'Great!' }]
      );
    }
  };

  // تابع برای حذف دارو
  const removeMedication = (id: number) => {
    Alert.alert(
      t.removeMedication || 'Remove Medication',
      t.areYouSureRemove || 'Are you sure you want to remove this medication?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.delete || 'Remove',
          style: 'destructive',
          onPress: () => {
            setMedications(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return <CheckCircle size={22} color="#10B981" />;
      case 'pending':
        return <Clock size={22} color="#F59E0B" />;
      case 'missed':
        return <AlertCircle size={22} color="#EF4444" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'taken':
        return t.taken || 'Taken';
      case 'pending':
        return t.pending || 'Pending';
      case 'missed':
        return t.missed || 'Missed';
      default:
        return '';
    }
  };

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

  // داده‌های تقویم - با ترتیب صحیح هفته (شنبه تا جمعه)
  const baseCalendarDays = [
    { day: t.daySat, taken: true },    // شنبه - Saturday
    { day: t.daySun, taken: true },    // یکشنبه - Sunday
    { day: t.dayMon, taken: true },    // دوشنبه - Monday
    { day: t.dayTue, taken: true },    // سه‌شنبه - Tuesday
    { day: t.dayWed, taken: false },   // چهارشنبه - Wednesday
    { day: t.dayThu, taken: false },   // پنج‌شنبه - Thursday
    { day: t.dayFri, taken: false },   // جمعه - Friday
  ];

  // بر اساس RTL بودن، ترتیب نمایش را تعیین می‌کنیم
  const calendarDays = useMemo(() => {
    if (isRTL) {
      return [...baseCalendarDays].reverse();
    }
    return baseCalendarDays;
  }, [isRTL, t]);

  // دریافت زمان روز برای سلام
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || 'Good morning';
    if (hour < 17) return t.goodAfternoon || 'Good afternoon';
    return t.goodEvening || 'Good evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.greeting, { color: colors.text }]}>
                {getGreeting()}, {user?.name || t.there || 'there'} 
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {t.yourMedicationJourney || 'Your medication journey'}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {t.isUnderControl || 'is under control'}
              </Text>
            </View>
            
            <View style={[styles.avatarWrapper, { backgroundColor: colors.primary + '20' }]}>
              <Image
                source={require('../../assets/avatars/model1.jpg')}
                style={styles.characterImage}
              />
              <MotiView
                from={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: 0.6, scale: 1.2 }}
                transition={{
                  type: 'timing',
                  duration: 2000,
                  loop: true,
                  repeatReverse: true,
                }}
                style={[styles.glowRing, { borderColor: colors.primary }]}
              />
            </View>
          </View>

          <View style={styles.statusBar}>
            <View style={styles.statusItem}>
              <Flame size={20} color="#F97316" />
              <Text style={[styles.statusText, { color: colors.text }]}>
                7 {t.daysPerfect || 'days perfect'}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Pill size={20} color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {totalToday} {t.medicinesToday || 'medicines today'}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusItem}>
              <Clock size={20} color="#3B82F6" />
              <Text style={[styles.statusText, { color: colors.text }]}>
                {t.next || 'Next'} {medications.find(m => m.status === 'pending')?.time || '—'}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <View style={styles.statContent}>
              <Pill size={24} color="#FFFFFF" />
              <Text style={styles.statNumberWhite}>{totalToday}</Text>
              <Text style={styles.statLabelWhite}>{t.today || 'Today'}</Text>
            </View>
          </LinearGradient>

          <Card style={{ flex: 1, padding: Spacing.md, alignItems: 'center' }}>
            <View style={[styles.statIconContainer, { backgroundColor: '#10B98120' }]}>
              <CheckCircle size={24} color="#10B981" />
            </View>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{takenCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t.taken || 'Taken'}
            </Text>
          </Card>

          <Card style={{ flex: 1, padding: Spacing.md, alignItems: 'center' }}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F59E0B20' }]}>
              <Clock size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t.pending || 'Pending'}
            </Text>
          </Card>
        </View>

        {/* Add Medication Button */}
        <TouchableOpacity
          onPress={() => router.push('/medication/add' as any)}
          style={styles.addButtonWrapper}
        >
          <LinearGradient
            colors={['#7C3AED', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>
              {t.addMedication || 'Add Medication'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Calendar */}
        <Card style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
          <View style={styles.calendarHeader}>
            <Calendar size={20} color={colors.primary} />
            <Text style={[styles.calendarTitle, { color: colors.text }]}>
              {calendarTitle}
            </Text>
          </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <View key={index} style={styles.calendarDay}>
                <Text style={[styles.calendarDayText, { color: colors.textSecondary }]}>
                  {day.day}
                </Text>
                <View
                  style={[
                    styles.calendarDot,
                    {
                      backgroundColor: day.taken ? '#10B981' : colors.border,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* Medication List */}
        <View style={styles.medicationSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.todaysMedications || "Today's Medications"}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/medication/history' as any)}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAll, { color: colors.primary }]}>
                {t.viewAll || 'View All'}
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {medications.filter(m => m.date === '2026-08-05').map((med, index) => (
            <MotiView
              key={med.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 }}
            >
              <Card style={styles.medicationCard}>
                <View style={styles.medicationRow}>
                  <View style={[styles.medicationIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Pill size={24} color={colors.primary} />
                  </View>
                  
                  <View style={styles.medicationInfo}>
                    <Text style={[styles.medicationName, { color: colors.text }]}>
                      {med.name}
                    </Text>
                    <View style={styles.medicationDetails}>
                      <Text style={[styles.medicationDosage, { color: colors.textSecondary }]}>
                        {med.dosage}
                      </Text>
                      <View style={styles.medicationType}>
                        <Brain size={14} color={colors.primary} />
                        <Text style={[styles.medicationTypeText, { color: colors.textSecondary }]}>
                          {med.type}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.timeContainer}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={[styles.medicationTime, { color: colors.textSecondary }]}>
                        {med.time}
                      </Text>
                    </View>
                    <View style={styles.adherenceContainer}>
                      <View style={[styles.adherenceBar, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.adherenceFill,
                            {
                              width: `${med.adherence}%`,
                              backgroundColor: getStatusColor(med.status),
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.adherenceText, { color: colors.textSecondary }]}>
                        {med.adherence}% {t.adherence || 'adherence'}
                      </Text>
                    </View>
                  </View>

                  {/* Status Button - Clickable */}
                  <TouchableOpacity
                    onPress={() => med.status === 'pending' && markAsTaken(med.id)}
                    style={styles.statusButton}
                    disabled={med.status === 'taken'}
                  >
                    {med.status === 'taken' ? (
                      <View style={styles.statusContainer}>
                        <CheckCircle size={22} color="#10B981" />
                        <Text style={[styles.statusText, { color: '#10B981' }]}>
                          {t.taken || 'Taken'}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.statusContainer}>
                        <Clock size={22} color="#F59E0B" />
                        <Text style={[styles.statusText, { color: '#F59E0B' }]}>
                          {t.tapToTake || 'Tap to take'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
            </MotiView>
          ))}
        </View>

        {/* Smart Reminder */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 300 }}
        >
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reminderGradient}
          >
            <View style={styles.reminderContent}>
              <View style={styles.reminderIconContainer}>
                <Bell size={28} color="#FFFFFF" />
                <MotiView
                  from={{ scale: 0.8, opacity: 0.3 }}
                  animate={{ scale: 1.2, opacity: 0.8 }}
                  transition={{
                    type: 'timing',
                    duration: 1000,
                    loop: true,
                    repeatReverse: true,
                  }}
                  style={styles.pulseRing}
                />
              </View>
              <View style={styles.reminderTextContainer}>
                <Text style={styles.reminderTitle}>
                  {t.nextMedication || 'Next Medication'}
                </Text>
                <Text style={styles.reminderMedication}>
                  {medications.find(m => m.status === 'pending')?.name || t.allTaken || 'All taken! 🎉'}
                </Text>
                <Text style={styles.reminderTime}>
                  {medications.find(m => m.status === 'pending')?.time || '—'}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.takeNowButton}
                onPress={() => {
                  const pending = medications.find(m => m.status === 'pending');
                  if (pending) markAsTaken(pending.id);
                }}
              >
                <Text style={styles.takeNowText}>
                  {t.takeNow || 'Take Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </MotiView>

        {/* AI Button */}
        <TouchableOpacity
          style={[styles.aiButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/ai' as any)}
        >
          <Brain size={24} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>
            {t.askNeuroliaAI || 'Ask Neurolia AI'}
          </Text>
        </TouchableOpacity>

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
    paddingTop: Spacing.xl,
  },
  header: {
    paddingTop:40,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  characterImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
  },
  glowRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    opacity: 0.5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderRadius: BorderRadius.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
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
    flexDirection: 'row',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 2,
  },
  medicationCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  medicationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 13,
  },
  medicationType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  medicationTypeText: {
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  medicationTime: {
    fontSize: 12,
  },
  adherenceContainer: {
    flexDirection: 'row',
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
    marginLeft: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  reminderGradient: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIconContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -6,
    left: -6,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  reminderMedication: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reminderTime: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  takeNowButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  takeNowText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 100,
  },
});