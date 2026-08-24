import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  ArrowLeft,
  Brain,
  Pill,
  Heart,
  Clock,
  Calendar,
  Bell,
  PenLine,
  Check,
  Plus,
  ChevronDown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Spacing, BorderRadius } from '../../constants/theme';

type ActivityType = 'Brain Training' | 'Medication' | 'Consultation';

const ACTIVITY_TYPES: {
  name: ActivityType;
  description: string;
  color: string;
  icon: typeof Brain;
}[] = [
  {
    name: 'Brain Training',
    description: 'Cognitive exercises & games',
    color: '#7C3AED',
    icon: Brain,
  },
  {
    name: 'Medication',
    description: 'Medicine & health reminders',
    color: '#22C55E',
    icon: Pill,
  },
  {
    name: 'Consultation',
    description: 'Appointments & counseling',
    color: '#EC4899',
    icon: Heart,
  },
];

export default function AddSchedule() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [selectedType, setSelectedType] =
    useState<ActivityType>('Brain Training');

  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [reminderOn, setReminderOn] = useState(true);

  const selectedActivity = ACTIVITY_TYPES.find(
    (item) => item.name === selectedType,
  )!;

  const SelectedIcon = selectedActivity.icon;

  const selectType = (type: ActivityType) => {
    setSelectedType(type);
    setTypeMenuOpen(false);
  };

  const handleCreateSchedule = () => {
    if (!title.trim()) {
      Alert.alert(
        'Activity title required',
        'Please enter a title for your activity.',
      );
      return;
    }

    if (!time.trim()) {
      Alert.alert(
        'Time required',
        'Please enter a time for your activity.',
      );
      return;
    }

    Alert.alert(
      'Schedule created',
      `${title.trim()} has been added to your schedule.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ],
    );
  };

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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <MotiView
          from={{
            opacity: 0,
            translateY: -12,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 350,
          }}
          style={styles.header}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
        </MotiView>

        {/* TITLE */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 18,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 80,
          }}
          style={styles.titleBlock}
        >
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleIconWrap}
          >
            <Calendar size={22} color="#FFFFFF" strokeWidth={2.2} />
          </LinearGradient>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Create New Activity
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Plan your healthy routine
          </Text>
        </MotiView>

        {/* ACTIVITY TYPE */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 20,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 160,
          }}
        >
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.text,
              },
            ]}
          >
            Activity Type
          </Text>

          {/* LIQUID TAFFY STYLE SELECTOR */}
          <View style={styles.liquidSelectorContainer}>
            {/* Expanded liquid choices */}
            {typeMenuOpen && (
              <View
                pointerEvents="box-none"
                style={styles.liquidOptionsContainer}
              >
                {ACTIVITY_TYPES.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.name;

                  return (
                    <MotiView
                      key={item.name}
                      from={{
                        opacity: 0,
                        scale: 0.55,
                        translateY: 12,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        translateY: 0,
                      }}
                      transition={{
                        type: 'spring',
                        damping: 15,
                        stiffness: 170,
                        delay: index * 55,
                      }}
                      style={styles.liquidOptionWrapper}
                    >
                      <Pressable
                        onPress={() => selectType(item.name)}
                        style={({ pressed }) => [
                          styles.liquidOption,
                          {
                            backgroundColor: colors.surface,
                            borderColor: isSelected
                              ? item.color
                              : colors.border,
                            transform: [
                              {
                                scale: pressed ? 0.96 : 1,
                              },
                            ],
                          },
                        ]}
                      >
                        {/* Glow */}
                        <View
                          style={[
                            styles.optionGlow,
                            {
                              backgroundColor: item.color,
                              opacity: isSelected ? 0.18 : 0.08,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.optionIcon,
                            {
                              backgroundColor: item.color + '18',
                            },
                          ]}
                        >
                          <Icon
                            size={21}
                            color={item.color}
                            strokeWidth={2.2}
                          />
                        </View>

                        <View style={styles.optionTextContainer}>
                          <Text
                            style={[
                              styles.optionTitle,
                              {
                                color: colors.text,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>

                          <Text
                            style={[
                              styles.optionDescription,
                              {
                                color: colors.textSecondary,
                              },
                            ]}
                            numberOfLines={1}
                          >
                            {item.description}
                          </Text>
                        </View>

                        {isSelected && (
                          <View
                            style={[
                              styles.optionCheck,
                              {
                                backgroundColor: item.color,
                              },
                            ]}
                          >
                            <Check
                              size={12}
                              color="#FFFFFF"
                              strokeWidth={3}
                            />
                          </View>
                        )}
                      </Pressable>
                    </MotiView>
                  );
                })}
              </View>
            )}

            {/* Main liquid button */}
            <Pressable
              onPress={() => setTypeMenuOpen((prev) => !prev)}
              style={({ pressed }) => [
                styles.liquidMainButton,
                {
                  borderColor: selectedActivity.color,
                  backgroundColor: colors.surface,
                  transform: [
                    {
                      scale: pressed ? 0.97 : 1,
                    },
                  ],
                },
              ]}
            >
              {/* Liquid glow */}
              <MotiView
                animate={{
                  scale: typeMenuOpen ? 1.15 : 1,
                  opacity: typeMenuOpen ? 0.25 : 0.14,
                }}
                transition={{
                  type: 'timing',
                  duration: 250,
                }}
                style={[
                  styles.liquidGlow,
                  {
                    backgroundColor: selectedActivity.color,
                  },
                ]}
              />

              {/* Animated blobs */}
              <MotiView
                animate={{
                  scale: typeMenuOpen ? 1.05 : 0.9,
                  rotate: typeMenuOpen ? '8deg' : '0deg',
                }}
                transition={{
                  type: 'spring',
                  damping: 13,
                  stiffness: 180,
                }}
                style={[
                  styles.liquidBlob,
                  {
                    backgroundColor: selectedActivity.color + '18',
                  },
                ]}
              />

              <View
                style={[
                  styles.mainIcon,
                  {
                    backgroundColor: selectedActivity.color + '18',
                  },
                ]}
              >
                <SelectedIcon
                  size={22}
                  color={selectedActivity.color}
                  strokeWidth={2.2}
                />
              </View>

              <View style={styles.mainButtonText}>
                <Text
                  style={[
                    styles.mainButtonLabel,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Activity Type
                </Text>

                <Text
                  style={[
                    styles.mainButtonValue,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {selectedType}
                </Text>
              </View>

              <MotiView
                animate={{
                  rotate: typeMenuOpen ? '180deg' : '0deg',
                }}
                transition={{
                  type: 'timing',
                  duration: 220,
                }}
              >
                <ChevronDown
                  size={20}
                  color={colors.textSecondary}
                />
              </MotiView>
            </Pressable>

            {/* Liquid connector */}
            <MotiView
              animate={{
                opacity: typeMenuOpen ? 1 : 0,
                scaleY: typeMenuOpen ? 1 : 0.2,
              }}
              transition={{
                type: 'timing',
                duration: 180,
              }}
              style={[
                styles.liquidConnector,
                {
                  backgroundColor: selectedActivity.color,
                },
              ]}
            />
          </View>
        </MotiView>

        {/* ACTIVITY TITLE */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 16,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 280,
          }}
          style={styles.inputContainer}
        >
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.text,
              },
            ]}
          >
            Activity Title
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <PenLine
              size={18}
              color={colors.primary}
              strokeWidth={2}
            />

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Morning Meditation"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              returnKeyType="next"
            />
          </View>
        </MotiView>

        {/* TIME */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 16,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 340,
          }}
          style={styles.inputContainer}
        >
          <Text
            style={[
              styles.inputLabel,
              {
                color: colors.text,
              },
            ]}
          >
            Time
          </Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Clock
              size={18}
              color={colors.primary}
              strokeWidth={2}
            />

            <TextInput
              value={time}
              onChangeText={setTime}
              placeholder="e.g., 09:00 AM"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
            />
          </View>
        </MotiView>

        {/* REMINDER */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 16,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 400,
          }}
        >
          <Card
            style={[
              styles.reminderCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.reminderLeft}>
              <MotiView
                animate={{
                  scale: reminderOn ? 1 : 0.94,
                }}
                transition={{
                  type: 'spring',
                  damping: 14,
                }}
                style={[
                  styles.reminderIconWrap,
                  {
                    backgroundColor: colors.primary + '18',
                  },
                ]}
              >
                <Bell
                  size={18}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </MotiView>

              <View style={styles.reminderTextContainer}>
                <Text
                  style={[
                    styles.reminderText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  Set Reminder
                </Text>

                <Text
                  style={[
                    styles.reminderHint,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {reminderOn
                    ? 'Notification enabled'
                    : 'Notification off'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setReminderOn((prev) => !prev)}
              style={[
                styles.reminderToggle,
                {
                  backgroundColor: reminderOn
                    ? colors.primary + '40'
                    : colors.border,
                },
              ]}
            >
              <MotiView
                animate={{
                  translateX: reminderOn ? 20 : 0,
                  scale: reminderOn ? 1 : 0.92,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                  stiffness: 220,
                }}
                style={[
                  styles.reminderToggleDot,
                  {
                    backgroundColor: reminderOn
                      ? colors.primary
                      : colors.textSecondary,
                  },
                ]}
              />
            </TouchableOpacity>
          </Card>
        </MotiView>

        {/* CREATE BUTTON */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 18,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 470,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.86}
            onPress={handleCreateSchedule}
            style={styles.saveWrapper}
          >
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}
            >
              <Plus
                size={19}
                color="#FFFFFF"
                strokeWidth={2.5}
              />

              <Text style={styles.saveText}>
                Create Schedule
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
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
    paddingBottom: 70,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  /* TITLE */

  titleBlock: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },

  titleIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,

    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },

  /* SECTION */

  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },

  /* LIQUID TAFFY SELECTOR */

  liquidSelectorContainer: {
    position: 'relative',
    marginBottom: Spacing.lg,
    zIndex: 20,
  },

  liquidOptionsContainer: {
    position: 'relative',
    gap: 8,
    marginBottom: 10,
  },

  liquidOptionWrapper: {
    width: '100%',
  },

  liquidOption: {
    minHeight: 66,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 2,
  },

  optionGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -45,
    top: -30,
  },

  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 21.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  optionDescription: {
    fontSize: 11,
    marginTop: 3,
  },

  optionCheck: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* MAIN LIQUID BUTTON */

  liquidMainButton: {
    minHeight: 72,
    borderRadius: 25,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',

    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  liquidGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -80,
    top: -50,
  },

  liquidBlob: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    left: -50,
    top: -15,
  },

  mainIcon: {
    width: 47,
    height: 47,
    borderRadius: 23.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  mainButtonText: {
    flex: 1,
  },

  mainButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },

  mainButtonValue: {
    fontSize: 15,
    fontWeight: '600',
  },

  liquidConnector: {
    position: 'absolute',
    width: 18,
    height: 13,
    borderRadius: 9,
    alignSelf: 'center',
    bottom: -7,
    zIndex: -1,
  },

  /* INPUTS */

  inputContainer: {
    marginBottom: Spacing.md,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 7,
  },

  inputWrapper: {
    height: 55,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontSize: 15.5,
    paddingVertical: 0,
  },

  /* REMINDER */

  reminderCard: {
    marginTop: 3,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  reminderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  reminderTextContainer: {
    flex: 1,
  },

  reminderText: {
    fontSize: 15,
    fontWeight: '500',
  },

  reminderHint: {
    fontSize: 11.5,
    marginTop: 3,
  },

  reminderToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },

  reminderToggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  /* SAVE */

  saveWrapper: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',

    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },

  saveButton: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});