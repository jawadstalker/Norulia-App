import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Brain,
  Pill,
  Heart,
  Calendar,
  Bell,
  BellOff,
  PenLine,
  Check,
  Minus,
  Plus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

type ActivityKey = 'training' | 'medication' | 'consultation';

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

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export default function AddSchedule() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isRTL } = useLanguage();

  const TEXTS = {
    headerTitle: isRTL ? 'فعالیت جدید' : 'New Activity',
    headerSubtitle: isRTL ? 'افزودن به برنامه روزانه' : 'Add to your schedule',
    heroTitle: isRTL ? 'برنامه‌ریزی هوشمند' : 'Plan something meaningful',
    heroDescription: isRTL
      ? 'یک یادآور ساده برای روتین روزانه‌ات بساز'
      : 'Create a simple reminder for your daily routine.',
    activityTypeLabel: isRTL ? 'نوع فعالیت' : 'Activity type',
    detailsLabel: isRTL ? 'جزئیات فعالیت' : 'Activity details',
    titleLabel: isRTL ? 'عنوان فعالیت' : 'Activity title',
    titlePlaceholder: isRTL ? 'مثلاً مدیتیشن صبحگاهی' : 'e.g. Morning meditation',
    timeLabel: isRTL ? 'زمان یادآوری' : 'Reminder time',
    quickPicks: isRTL ? 'انتخاب سریع' : 'Quick picks',
    reminderLabel: isRTL ? 'یادآوری' : 'Reminder',
    reminderOnText: isRTL
      ? 'در این ساعت به تو یادآوری می‌شود'
      : 'You will be reminded at this time.',
    reminderOffText: isRTL ? 'اعلانی ارسال نمی‌شود' : 'No notification will be sent.',
    previewLabel: isRTL ? 'پیش‌نمایش فعالیت' : 'Activity preview',
    previewPlaceholder: isRTL ? 'فعالیت جدید تو' : 'Your new activity',
    createButton: isRTL ? 'ساخت فعالیت' : 'Create Activity',
    createHint: isRTL
      ? 'بعداً می‌تونی این فعالیت رو ویرایش یا حذف کنی'
      : 'You can edit or remove this activity later.',
    missingTitleTitle: isRTL ? 'عنوان لازم است' : 'Activity title required',
    missingTitleMessage: isRTL
      ? 'لطفاً یک عنوان برای فعالیت خود وارد کن.'
      : 'Please enter a title for your activity.',
    successTitle: isRTL ? 'فعالیت ساخته شد' : 'Schedule created',
    successMessage: isRTL ? 'به برنامه روزانه‌ات اضافه شد.' : 'has been added to your schedule.',
    ok: isRTL ? 'باشه' : 'OK',
  };

  const ACTIVITY_CONFIG: {
    key: ActivityKey;
    name: string;
    description: string;
    color: string;
    icon: typeof Brain;
  }[] = [
    {
      key: 'training',
      name: isRTL ? 'تمرین ذهنی' : 'Brain Training',
      description: isRTL ? 'بازی‌ها و تمرین‌های شناختی' : 'Cognitive exercises & games',
      color: '#7C3AED',
      icon: Brain,
    },
    {
      key: 'medication',
      name: isRTL ? 'دارو' : 'Medication',
      description: isRTL ? 'یادآور مصرف دارو' : 'Medicine & health reminders',
      color: '#22C55E',
      icon: Pill,
    },
    {
      key: 'consultation',
      name: isRTL ? 'مشاوره' : 'Consultation',
      description: isRTL ? 'جلسات و قرار ملاقات' : 'Appointments & counseling',
      color: '#EC4899',
      icon: Heart,
    },
  ];

  const TIME_PRESETS = [
    { label: isRTL ? 'صبح' : 'Morning', hour: 8, minute: 0 },
    { label: isRTL ? 'ظهر' : 'Noon', hour: 12, minute: 30 },
    { label: isRTL ? 'عصر' : 'Evening', hour: 18, minute: 0 },
    { label: isRTL ? 'شب' : 'Night', hour: 21, minute: 30 },
  ];

  const [selectedKey, setSelectedKey] = useState<ActivityKey>('training');
  const [title, setTitle] = useState('');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [reminderOn, setReminderOn] = useState(true);
  const [titleFocused, setTitleFocused] = useState(false);
  const [titleError, setTitleError] = useState(false);

  const selectedActivity = useMemo(
    () => ACTIVITY_CONFIG.find((item) => item.key === selectedKey) ?? ACTIVITY_CONFIG[0],
    [selectedKey, isRTL],
  );

  const SelectedIcon = selectedActivity.icon;

  const lightHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const selectionHaptic = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const handleSelectType = (key: ActivityKey) => {
    selectionHaptic();
    setSelectedKey(key);
  };

  const adjustHour = (direction: 1 | -1) => {
    selectionHaptic();
    setHour((current) => (current + direction + 24) % 24);
  };

  const adjustMinute = (direction: 1 | -1) => {
    selectionHaptic();
    setMinute((current) => (current + direction * 5 + 60) % 60);
  };

  const applyPreset = (presetHour: number, presetMinute: number) => {
    selectionHaptic();
    setHour(presetHour);
    setMinute(presetMinute);
  };

  const toggleReminder = () => {
    lightHaptic();
    setReminderOn((value) => !value);
  };

  const timeLabel = isRTL
    ? `${toPersianDigits(pad(hour))}:${toPersianDigits(pad(minute))}`
    : `${pad(hour)}:${pad(minute)}`;

  const handleCreateSchedule = () => {
    if (!title.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setTitleError(true);
      setTimeout(() => setTitleError(false), 1200);
      Alert.alert(TEXTS.missingTitleTitle, TEXTS.missingTitleMessage);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Alert.alert(
      TEXTS.successTitle,
      `${title.trim()} ${TEXTS.successMessage}`,
      [
        {
          text: TEXTS.ok,
          onPress: () => router.back(),
        },
      ],
    );
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <MotiView
            from={{ opacity: 0, translateY: -12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 350 }}
            style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
          >
            <TouchableOpacity
              onPress={() => {
                lightHaptic();
                router.back();
              }}
              activeOpacity={0.75}
              style={[
                styles.backButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={20} color={colors.text} strokeWidth={2.2} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {TEXTS.headerTitle}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {TEXTS.headerSubtitle}
              </Text>
            </View>

            <View style={styles.headerSpacer} />
          </MotiView>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            <MotiView
              from={{ opacity: 0, translateY: 14 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 60 }}
              style={[
                styles.hero,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <LinearGradient
                colors={[selectedActivity.color, selectedActivity.color + 'AA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroIcon}
              >
                <Calendar size={22} color="#FFFFFF" strokeWidth={2.2} />
              </LinearGradient>

              <View style={styles.heroText}>
                <Text style={[styles.heroTitle, { color: colors.text }]}>
                  {TEXTS.heroTitle}
                </Text>
                <Text style={[styles.heroDescription, { color: colors.textSecondary }]}>
                  {TEXTS.heroDescription}
                </Text>
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 120 }}
              style={styles.section}
            >
              <SectionHeader title={TEXTS.activityTypeLabel} colors={colors} isRTL={isRTL} />

              <View style={[styles.typeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {ACTIVITY_CONFIG.map((activity, index) => {
                  const Icon = activity.icon;
                  const isSelected = selectedKey === activity.key;

                  return (
                    <MotiView
                      key={activity.key}
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'timing', duration: 300, delay: 140 + index * 60 }}
                      style={styles.typeCardWrapper}
                    >
                      <Pressable
                        onPress={() => handleSelectType(activity.key)}
                        style={({ pressed }) => [
                          styles.typeCard,
                          {
                            backgroundColor: isSelected
                              ? activity.color + '14'
                              : colors.surface,
                            borderColor: isSelected ? activity.color : colors.border,
                            borderWidth: isSelected ? 1.5 : 1,
                            transform: [{ scale: pressed ? 0.96 : 1 }],
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.typeIcon,
                            { backgroundColor: activity.color + '1C' },
                          ]}
                        >
                          <Icon size={20} color={activity.color} strokeWidth={2.1} />
                        </View>

                        <Text
                          style={[styles.typeName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {activity.name}
                        </Text>

                        <Text
                          style={[styles.typeDescription, { color: colors.textSecondary }]}
                          numberOfLines={2}
                        >
                          {activity.description}
                        </Text>

                        {isSelected && (
                          <View
                            style={[styles.typeCheck, { backgroundColor: activity.color }]}
                          >
                            <Check size={11} color="#FFFFFF" strokeWidth={3} />
                          </View>
                        )}
                      </Pressable>
                    </MotiView>
                  );
                })}
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 200 }}
              style={styles.section}
            >
              <SectionHeader title={TEXTS.detailsLabel} colors={colors} isRTL={isRTL} />

              <Text
                style={[
                  styles.fieldLabel,
                  { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
                ]}
              >
                {TEXTS.titleLabel}
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  {
                    backgroundColor: colors.surface,
                    borderColor: titleError
                      ? colors.error
                      : titleFocused
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <View style={[styles.inputIcon, { backgroundColor: colors.primary + '14' }]}>
                  <PenLine size={16} color={colors.primary} strokeWidth={2.2} />
                </View>

                <TextInput
                  value={title}
                  onChangeText={(value) => {
                    setTitle(value);
                    if (titleError) {
                      setTitleError(false);
                    }
                  }}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  placeholder={TEXTS.titlePlaceholder}
                  placeholderTextColor={colors.textSecondary}
                  style={[
                    styles.input,
                    { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  returnKeyType="done"
                />
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 260 }}
              style={styles.section}
            >
              <SectionHeader title={TEXTS.timeLabel} colors={colors} isRTL={isRTL} />

              <View
                style={[
                  styles.timeCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={[styles.timeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <TimeStepper
                    displayValue={isRTL ? toPersianDigits(pad(hour)) : pad(hour)}
                    onIncrease={() => adjustHour(1)}
                    onDecrease={() => adjustHour(-1)}
                    color={selectedActivity.color}
                    colors={colors}
                  />

                  <Text style={[styles.timeColon, { color: colors.text }]}>:</Text>

                  <TimeStepper
                    displayValue={isRTL ? toPersianDigits(pad(minute)) : pad(minute)}
                    onIncrease={() => adjustMinute(1)}
                    onDecrease={() => adjustMinute(-1)}
                    color={selectedActivity.color}
                    colors={colors}
                  />
                </View>

                <Text
                  style={[
                    styles.quickPicksLabel,
                    { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {TEXTS.quickPicks}
                </Text>

                <View style={[styles.presetRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {TIME_PRESETS.map((preset) => {
                    const isActive = preset.hour === hour && preset.minute === minute;

                    return (
                      <Pressable
                        key={preset.label}
                        onPress={() => applyPreset(preset.hour, preset.minute)}
                        style={({ pressed }) => [
                          styles.presetChip,
                          {
                            backgroundColor: isActive
                              ? selectedActivity.color
                              : colors.surfaceSecondary,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            { color: isActive ? '#FFFFFF' : colors.textSecondary },
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 320 }}
              style={styles.section}
            >
              <SectionHeader title={TEXTS.reminderLabel} colors={colors} isRTL={isRTL} />

              <View
                style={[
                  styles.reminderCard,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View
                  style={[styles.reminderLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <View
                    style={[
                      styles.reminderIcon,
                      { backgroundColor: reminderOn ? colors.primary + '14' : colors.border },
                    ]}
                  >
                    {reminderOn ? (
                      <Bell size={19} color={colors.primary} strokeWidth={2} />
                    ) : (
                      <BellOff size={19} color={colors.textSecondary} strokeWidth={2} />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.reminderText,
                      { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {reminderOn ? TEXTS.reminderOnText : TEXTS.reminderOffText}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{ checked: reminderOn }}
                  onPress={toggleReminder}
                  style={[
                    styles.switch,
                    { backgroundColor: reminderOn ? colors.primary : colors.border },
                  ]}
                >
                  <MotiView
                    animate={{ translateX: reminderOn ? (isRTL ? -20 : 20) : 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 180 }}
                    style={[styles.switchThumb, { backgroundColor: '#FFFFFF' }]}
                  />
                </Pressable>
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 380 }}
              style={[
                styles.summaryCard,
                { flexDirection: isRTL ? 'row-reverse' : 'row' },
                {
                  backgroundColor: selectedActivity.color + '0C',
                  borderColor: selectedActivity.color + '30',
                },
              ]}
            >
              <View
                style={[styles.summaryIcon, { backgroundColor: selectedActivity.color + '1C' }]}
              >
                <SelectedIcon size={19} color={selectedActivity.color} strokeWidth={2} />
              </View>

              <View style={styles.summaryContent}>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {TEXTS.previewLabel}
                </Text>

                <Text
                  style={[
                    styles.summaryTitle,
                    { color: colors.text, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                  numberOfLines={1}
                >
                  {title.trim() || TEXTS.previewPlaceholder}
                </Text>

                <Text
                  style={[
                    styles.summaryMeta,
                    { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
                  ]}
                >
                  {selectedActivity.name}  •  {timeLabel}
                </Text>
              </View>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 18 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 440 }}
              style={styles.createSection}
            >
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleCreateSchedule}
                style={styles.saveWrapper}
              >
                <LinearGradient
                  colors={[selectedActivity.color, selectedActivity.color + 'CC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButton}
                >
                  <Check size={19} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.saveText}>{TEXTS.createButton}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={[styles.createHint, { color: colors.textSecondary }]}>
                {TEXTS.createHint}
              </Text>
            </MotiView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SectionHeader({
  title,
  colors,
  isRTL,
}: {
  title: string;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );
}

function TimeStepper({
  displayValue,
  onIncrease,
  onDecrease,
  color,
  colors,
}: {
  displayValue: string;
  onIncrease: () => void;
  onDecrease: () => void;
  color: string;
  colors: any;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={onIncrease}
        style={({ pressed }) => [
          styles.stepperButton,
          { backgroundColor: color + '14', opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Plus size={16} color={color} strokeWidth={2.4} />
      </Pressable>

      <View style={[styles.stepperValueBox, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.stepperValue, { color: colors.text }]}>{displayValue}</Text>
      </View>

      <Pressable
        onPress={onDecrease}
        style={({ pressed }) => [
          styles.stepperButton,
          { backgroundColor: color + '14', opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Minus size={16} color={color} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 48,
  },

  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 6,
    paddingBottom: 12,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  headerSubtitle: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },

  headerSpacer: {
    width: 42,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hero: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 13,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },

  heroDescription: {
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 4,
    textAlign: 'right',
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  sectionLine: {
    height: 1,
    flex: 1,
  },

  typeRow: {
    gap: 9,
  },

  typeCardWrapper: {
    flex: 1,
  },

  typeCard: {
    minHeight: 118,
    borderRadius: 19,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  typeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  typeName: {
    fontSize: 12.5,
    fontWeight: '800',
    textAlign: 'center',
  },

  typeDescription: {
    fontSize: 9.5,
    marginTop: 3,
    textAlign: 'center',
    lineHeight: 13,
  },

  typeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 8,
  },

  inputContainer: {
    height: 57,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  inputIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 9,
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '600',
  },

  timeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
  },

  timeRow: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  timeColon: {
    fontSize: 22,
    fontWeight: '800',
  },

  stepper: {
    alignItems: 'center',
    gap: 8,
  },

  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepperValueBox: {
    width: 64,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepperValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  quickPicksLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 9,
  },

  presetRow: {
    gap: 8,
  },

  presetChip: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  presetChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  reminderCard: {
    minHeight: 78,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reminderLeft: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  reminderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 11,
  },

  reminderText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
  },

  switch: {
    width: 48,
    height: 28,
    borderRadius: 15,
    padding: 4,
    justifyContent: 'center',
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },

  summaryCard: {
    minHeight: 76,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    marginBottom: 18,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 11,
  },

  summaryContent: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 9.5,
    fontWeight: '600',
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  summaryMeta: {
    fontSize: 10.5,
    marginTop: 3,
  },

  createSection: {
    alignItems: 'center',
  },

  saveWrapper: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',

    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },

  saveButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  createHint: {
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
});