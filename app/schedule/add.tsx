import React, {
  useMemo,
  useState,
} from 'react';

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

import {
  useRouter,
} from 'expo-router';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  MotiView,
} from 'moti';

import * as Haptics from 'expo-haptics';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
  Clock,
  Sparkles,
} from 'lucide-react-native';

import {
  useTheme,
} from '../../context/ThemeContext';

import {
  useLanguage,
} from '../../context/LanguageContext';

const STORAGE_KEY =
  '@neurolia_schedule_custom_events';

type ActivityKey =
  | 'training'
  | 'medication'
  | 'consultation';

interface StoredScheduleEvent {
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

      return Number.isNaN(number)
        ? char
        : digits[number];
    })
    .join('');
}

function pad(
  value: number,
) {
  return String(value).padStart(
    2,
    '0',
  );
}

export default function AddSchedule() {
  const router =
    useRouter();

  const {
    colors,
  } = useTheme();

  const {
    isRTL,
  } = useLanguage();

  const TEXTS = {
    headerTitle:
      isRTL
        ? 'فعالیت جدید'
        : 'New Activity',

    headerSubtitle:
      isRTL
        ? 'افزودن به برنامه روزانه'
        : 'Add to your schedule',

    heroTitle:
      isRTL
        ? 'برنامه‌ریزی هوشمند'
        : 'Plan something meaningful',

    heroDescription:
      isRTL
        ? 'یک فعالیت جدید برای برنامه روزانه‌ات بساز.'
        : 'Create a new activity for your daily routine.',

    activityTypeLabel:
      isRTL
        ? 'نوع فعالیت'
        : 'Activity type',

    detailsLabel:
      isRTL
        ? 'جزئیات فعالیت'
        : 'Activity details',

    titleLabel:
      isRTL
        ? 'عنوان فعالیت'
        : 'Activity title',

    titlePlaceholder:
      isRTL
        ? 'مثلاً تمرین تمرکز صبحگاهی'
        : 'e.g. Morning focus training',

    timeLabel:
      isRTL
        ? 'زمان'
        : 'Time',

    quickPicks:
      isRTL
        ? 'انتخاب سریع'
        : 'Quick picks',

    reminderLabel:
      isRTL
        ? 'یادآوری'
        : 'Reminder',

    reminderOnText:
      isRTL
        ? 'در زمان مشخص‌شده یادآوری می‌شود'
        : 'You will be reminded at this time.',

    reminderOffText:
      isRTL
        ? 'اعلانی ارسال نمی‌شود'
        : 'No notification will be sent.',

    previewLabel:
      isRTL
        ? 'پیش‌نمایش'
        : 'Preview',

    previewPlaceholder:
      isRTL
        ? 'فعالیت جدید تو'
        : 'Your new activity',

    createButton:
      isRTL
        ? 'افزودن به برنامه'
        : 'Add to Schedule',

    createHint:
      isRTL
        ? 'برنامه در صفحه Schedule ذخیره خواهد شد.'
        : 'The activity will appear on your Schedule.',

    missingTitleTitle:
      isRTL
        ? 'عنوان لازم است'
        : 'Activity title required',

    missingTitleMessage:
      isRTL
        ? 'لطفاً یک عنوان برای فعالیت وارد کن.'
        : 'Please enter a title for your activity.',

    successTitle:
      isRTL
        ? 'برنامه اضافه شد'
        : 'Activity added',

    successMessage:
      isRTL
        ? 'با موفقیت به برنامه امروز اضافه شد.'
        : 'has been added to your schedule.',

    ok:
      isRTL
        ? 'باشه'
        : 'OK',
  };

  /*
   * مهم:
   * دیگر برای هر نوع فعالیت رنگ جداگانه نداریم.
   *
   * همه Activity ها از colors.primary استفاده می‌کنند
   * تا با Theme انتخاب‌شده هماهنگ باشند.
   */
  const ACTIVITY_CONFIG: {
    key: ActivityKey;
    name: string;
    description: string;
    color: string;
    icon: typeof Brain;
    category: string;
  }[] = [
    {
      key: 'training',

      name:
        isRTL
          ? 'تمرین ذهنی'
          : 'Brain Training',

      description:
        isRTL
          ? 'بازی و تمرین شناختی'
          : 'Cognitive exercises & games',

      color:
        colors.primary,

      icon:
        Brain,

      category:
        isRTL
          ? 'تمرین ذهنی'
          : 'Brain Training',
    },

    {
      key: 'medication',

      name:
        isRTL
          ? 'دارو'
          : 'Medication',

      description:
        isRTL
          ? 'یادآور مصرف دارو'
          : 'Medicine reminder',

      color:
        colors.primary,

      icon:
        Pill,

      category:
        isRTL
          ? 'سلامت'
          : 'Health',
    },

    {
      key: 'consultation',

      name:
        isRTL
          ? 'مشاوره'
          : 'Consultation',

      description:
        isRTL
          ? 'جلسه و قرار مشاوره'
          : 'Counseling appointment',

      color:
        colors.primary,

      icon:
        Heart,

      category:
        isRTL
          ? 'سلامت روان'
          : 'Mental Health',
    },
  ];

  const TIME_PRESETS = [
    {
      label:
        isRTL
          ? 'صبح'
          : 'Morning',

      hour:
        8,

      minute:
        0,
    },

    {
      label:
        isRTL
          ? 'ظهر'
          : 'Noon',

      hour:
        12,

      minute:
        30,
    },

    {
      label:
        isRTL
          ? 'عصر'
          : 'Evening',

      hour:
        18,

      minute:
        0,
    },

    {
      label:
        isRTL
          ? 'شب'
          : 'Night',

      hour:
        21,

      minute:
        30,
    },
  ];

  const [
    selectedKey,
    setSelectedKey,
  ] =
    useState<ActivityKey>(
      'training',
    );

  const [
    title,
    setTitle,
  ] =
    useState('');

  const [
    hour,
    setHour,
  ] =
    useState(9);

  const [
    minute,
    setMinute,
  ] =
    useState(0);

  const [
    reminderOn,
    setReminderOn,
  ] =
    useState(true);

  const [
    titleFocused,
    setTitleFocused,
  ] =
    useState(false);

  const [
    titleError,
    setTitleError,
  ] =
    useState(false);

  const selectedActivity =
    useMemo(
      () =>
        ACTIVITY_CONFIG.find(
          (item) =>
            item.key ===
            selectedKey,
        ) ??
        ACTIVITY_CONFIG[0],

      [
        selectedKey,
        isRTL,
        colors.primary,
      ],
    );

  const SelectedIcon =
    selectedActivity.icon;

  const lightHaptic =
    () => {
      Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light,
      ).catch(
        () => {},
      );
    };

  const selectionHaptic =
    () => {
      Haptics.selectionAsync().catch(
        () => {},
      );
    };

  const handleSelectType =
    (
      key: ActivityKey,
    ) => {
      selectionHaptic();

      setSelectedKey(
        key,
      );
    };

  const adjustHour =
    (
      direction: 1 | -1,
    ) => {
      selectionHaptic();

      setHour(
        (current) =>
          (
            current +
            direction +
            24
          ) % 24,
      );
    };

  const adjustMinute =
    (
      direction: 1 | -1,
    ) => {
      selectionHaptic();

      setMinute(
        (current) =>
          (
            current +
            direction * 5 +
            60
          ) % 60,
      );
    };

  const applyPreset =
    (
      presetHour: number,
      presetMinute: number,
    ) => {
      selectionHaptic();

      setHour(
        presetHour,
      );

      setMinute(
        presetMinute,
      );
    };

  const toggleReminder =
    () => {
      lightHaptic();

      setReminderOn(
        (value) =>
          !value,
      );
    };

  const timeLabel =
    isRTL
      ? `${toPersianDigits(
          pad(hour),
        )}:${toPersianDigits(
          pad(minute),
        )}`
      : `${pad(hour)}:${pad(
          minute,
        )}`;

  /*
   * ذخیره فعالیت در Schedule
   */
  const handleCreateSchedule =
    async () => {
      const cleanTitle =
        title.trim();

      if (!cleanTitle) {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(
          () => {},
        );

        setTitleError(
          true,
        );

        setTimeout(
          () =>
            setTitleError(
              false,
            ),
          1200,
        );

        Alert.alert(
          TEXTS.missingTitleTitle,
          TEXTS.missingTitleMessage,
        );

        return;
      }

      try {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(
          () => {},
        );

        const stored =
          await AsyncStorage.getItem(
            STORAGE_KEY,
          );

        let current:
          StoredScheduleEvent[] =
          [];

        if (stored) {
          try {
            const parsed =
              JSON.parse(
                stored,
              );

            if (
              Array.isArray(
                parsed,
              )
            ) {
              current =
                parsed;
            }
          } catch {
            current =
              [];
          }
        }

        const newEvent:
          StoredScheduleEvent =
          {
            id:
              `custom-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

            title:
              cleanTitle,

            time:
              timeLabel,

            category:
              selectedActivity.category,

            duration:
              selectedKey ===
              'consultation'
                ? isRTL
                  ? '۴۵ دقیقه'
                  : '45 min'
                : selectedKey ===
                    'training'
                  ? isRTL
                    ? '۲۰ دقیقه'
                    : '20 min'
                  : isRTL
                    ? '۵ دقیقه'
                    : '5 min',

            completed:
              false,

            iconType:
              selectedKey ===
              'training'
                ? 'brain'
                : selectedKey ===
                    'medication'
                  ? 'pill'
                  : 'heart',

            /*
             * رنگ ذخیره‌شده هم از Theme فعلی می‌آید.
             */
            color:
              colors.primary,

            reminderEnabled:
              reminderOn,

            createdAt:
              Date.now(),
          };

        const next =
          [
            ...current,
            newEvent,
          ];

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            next,
          ),
        );

        Alert.alert(
          TEXTS.successTitle,

          `${cleanTitle} ${TEXTS.successMessage}`,

          [
            {
              text:
                TEXTS.ok,

              onPress:
                () => {
                  router.replace(
                    '/(tabs)/schedule',
                  );
                },
            },
          ],
        );
      } catch (error) {
        console.error(
          'CREATE SCHEDULE ERROR:',
          error,
        );

        Alert.alert(
          isRTL
            ? 'خطا'
            : 'Error',

          isRTL
            ? 'ذخیره برنامه انجام نشد.'
            : 'The activity could not be saved.',
        );
      }
    };

  return (
    <LinearGradient
      colors={[
        colors.background,
        colors.background,
      ]}
      style={
        styles.container
      }
    >
      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          'top',
          'bottom',
        ]}
      >
        <KeyboardAvoidingView
          style={
            styles.flex
          }
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }
        >

          {/* ========================================================== */}
          {/* HEADER                                                     */}
          {/* ========================================================== */}

          <View
            style={[
              styles.header,
              {
                /*
                 * عمداً row-reverse نداریم.
                 *
                 * بنابراین Back همیشه سمت چپ می‌ماند.
                 */
                flexDirection:
                  'row',
              },
            ]}
          >

            {/* BACK - ALWAYS LEFT */}

            <TouchableOpacity
              activeOpacity={
                0.75
              }
              onPress={() => {
                lightHaptic();

                router.back();
              }}
              style={[
                styles.backButton,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <ArrowLeft
                size={
                  20
                }
                color={
                  colors.primary
                }
                strokeWidth={
                  2.2
                }
              />
            </TouchableOpacity>

            <View
              style={
                styles.headerCenter
              }
            >
              <Text
                style={[
                  styles.headerTitle,
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
                {
                  TEXTS.headerTitle
                }
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
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
                {
                  TEXTS.headerSubtitle
                }
              </Text>
            </View>

            {/* RIGHT BALANCE SPACE */}

            <View
              style={
                styles.headerSpacer
              }
            />

          </View>

          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.scrollContent
            }
          >

            {/* ======================================================== */}
            {/* HERO                                                     */}
            {/* ======================================================== */}

            <MotiView
              from={{
                opacity:
                  0,

                translateY:
                  12,
              }}
              animate={{
                opacity:
                  1,

                translateY:
                  0,
              }}
              transition={{
                type:
                  'timing',

                duration:
                  400,
              }}
              style={[
                styles.hero,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    colors.border,
                },
              ]}
            >

              <View
                style={[
                  styles.heroIcon,
                  {
                    backgroundColor:
                      colors.primary +
                      '18',

                    borderColor:
                      colors.primary +
                      '30',

                    borderWidth:
                      1,
                  },
                ]}
              >
                <Sparkles
                  size={
                    22
                  }
                  color={
                    colors.primary
                  }
                  strokeWidth={
                    2.2
                  }
                />
              </View>

              <View
                style={
                  styles.heroText
                }
              >
                <Text
                  style={[
                    styles.heroTitle,
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
                  {
                    TEXTS.heroTitle
                  }
                </Text>

                <Text
                  style={[
                    styles.heroDescription,
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
                  {
                    TEXTS.heroDescription
                  }
                </Text>
              </View>

            </MotiView>

            {/* ======================================================== */}
            {/* ACTIVITY TYPE                                            */}
            {/* ======================================================== */}

            <View
              style={
                styles.section
              }
            >

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
                {
                  TEXTS.activityTypeLabel
                }
              </Text>

              <View
                style={[
                  styles.typeRow,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >

                {ACTIVITY_CONFIG.map(
                  (
                    activity,
                  ) => {
                    const Icon =
                      activity.icon;

                    const selected =
                      selectedKey ===
                      activity.key;

                    return (
                      <Pressable
                        key={
                          activity.key
                        }
                        onPress={() =>
                          handleSelectType(
                            activity.key,
                          )
                        }
                        style={({ pressed }) => [
                          styles.typeCard,

                          {
                            backgroundColor:
                              selected
                                ? colors.primary +
                                  '12'
                                : colors.surface,

                            borderColor:
                              selected
                                ? colors.primary
                                : colors.border,

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
                            styles.typeIcon,
                            {
                              backgroundColor:
                                colors.primary +
                                '18',
                            },
                          ]}
                        >
                          <Icon
                            size={
                              20
                            }
                            color={
                              colors.primary
                            }
                            strokeWidth={
                              2.1
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.typeName,
                            {
                              color:
                                colors.text,

                              textAlign:
                                isRTL
                                  ? 'right'
                                  : 'left',
                            },
                          ]}
                          numberOfLines={
                            1
                          }
                        >
                          {
                            activity.name
                          }
                        </Text>

                        <Text
                          style={[
                            styles.typeDescription,
                            {
                              color:
                                colors.textSecondary,

                              textAlign:
                                isRTL
                                  ? 'right'
                                  : 'left',
                            },
                          ]}
                          numberOfLines={
                            2
                          }
                        >
                          {
                            activity.description
                          }
                        </Text>

                        {selected && (
                          <View
                            style={[
                              styles.typeCheck,
                              {
                                backgroundColor:
                                  colors.primary,
                              },
                            ]}
                          >
                            <Check
                              size={
                                11
                              }
                              color={
                                colors.background
                              }
                              strokeWidth={
                                3
                              }
                            />
                          </View>
                        )}

                      </Pressable>
                    );
                  },
                )}

              </View>
            </View>

            {/* ======================================================== */}
            {/* DETAILS                                                  */}
            {/* ======================================================== */}

            <View
              style={
                styles.section
              }
            >

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
                {
                  TEXTS.detailsLabel
                }
              </Text>

              <Text
                style={[
                  styles.fieldLabel,
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
                {
                  TEXTS.titleLabel
                }
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',

                    backgroundColor:
                      colors.surface,

                    borderColor:
                      titleError
                        ? colors.error
                        : titleFocused
                          ? colors.primary
                          : colors.border,
                  },
                ]}
              >

                <View
                  style={[
                    styles.inputIcon,
                    {
                      backgroundColor:
                        colors.primary +
                        '18',
                    },
                  ]}
                >
                  <PenLine
                    size={
                      16
                    }
                    color={
                      colors.primary
                    }
                    strokeWidth={
                      2.2
                    }
                  />
                </View>

                <TextInput
                  value={
                    title
                  }
                  onChangeText={(
                    value,
                  ) => {
                    setTitle(
                      value,
                    );

                    if (
                      titleError
                    ) {
                      setTitleError(
                        false,
                      );
                    }
                  }}
                  onFocus={() =>
                    setTitleFocused(
                      true,
                    )
                  }
                  onBlur={() =>
                    setTitleFocused(
                      false,
                    )
                  }
                  placeholder={
                    TEXTS.titlePlaceholder
                  }
                  placeholderTextColor={
                    colors.textSecondary
                  }
                  style={[
                    styles.input,
                    {
                      color:
                        colors.text,

                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                  returnKeyType="done"
                />

              </View>

            </View>

            {/* ======================================================== */}
            {/* TIME                                                     */}
            {/* ======================================================== */}

            <View
              style={
                styles.section
              }
            >

              <View
                style={[
                  styles.sectionTitleRow,
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
                    styles.sectionTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    TEXTS.timeLabel
                  }
                </Text>

                <View
                  style={[
                    styles.clockBadge,
                    {
                      backgroundColor:
                        colors.primary +
                        '15',
                    },
                  ]}
                >
                  <Clock
                    size={
                      13
                    }
                    color={
                      colors.primary
                    }
                  />
                </View>

              </View>

              <View
                style={[
                  styles.timePicker,
                  {
                    backgroundColor:
                      colors.surface,

                    borderColor:
                      colors.border,
                  },
                ]}
              >

                <View
                  style={
                    styles.timePart
                  }
                >

                  <TouchableOpacity
                    activeOpacity={
                      0.7
                    }
                    onPress={() =>
                      adjustHour(
                        1,
                      )
                    }
                    style={[
                      styles.stepButton,
                      {
                        backgroundColor:
                          colors.background,

                        borderColor:
                          colors.border,

                        borderWidth:
                          1,
                      },
                    ]}
                  >
                    <Plus
                      size={
                        17
                      }
                      color={
                        colors.primary
                      }
                    />
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.timeNumber,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {isRTL
                      ? toPersianDigits(
                          pad(
                            hour,
                          ),
                        )
                      : pad(
                          hour,
                        )}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={
                      0.7
                    }
                    onPress={() =>
                      adjustHour(
                        -1,
                      )
                    }
                    style={[
                      styles.stepButton,
                      {
                        backgroundColor:
                          colors.background,

                        borderColor:
                          colors.border,

                        borderWidth:
                          1,
                      },
                    ]}
                  >
                    <Minus
                      size={
                        17
                      }
                      color={
                        colors.primary
                      }
                    />
                  </TouchableOpacity>

                </View>

                <Text
                  style={[
                    styles.timeSeparator,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  :
                </Text>

                <View
                  style={
                    styles.timePart
                  }
                >

                  <TouchableOpacity
                    activeOpacity={
                      0.7
                    }
                    onPress={() =>
                      adjustMinute(
                        1,
                      )
                    }
                    style={[
                      styles.stepButton,
                      {
                        backgroundColor:
                          colors.background,

                        borderColor:
                          colors.border,

                        borderWidth:
                          1,
                      },
                    ]}
                  >
                    <Plus
                      size={
                        17
                      }
                      color={
                        colors.primary
                      }
                    />
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.timeNumber,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {isRTL
                      ? toPersianDigits(
                          pad(
                            minute,
                          ),
                        )
                      : pad(
                          minute,
                        )}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={
                      0.7
                    }
                    onPress={() =>
                      adjustMinute(
                        -1,
                      )
                    }
                    style={[
                      styles.stepButton,
                      {
                        backgroundColor:
                          colors.background,

                        borderColor:
                          colors.border,

                        borderWidth:
                          1,
                      },
                    ]}
                  >
                    <Minus
                      size={
                        17
                      }
                      color={
                        colors.primary
                      }
                    />
                  </TouchableOpacity>

                </View>

              </View>

              <Text
                style={[
                  styles.quickLabel,
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
                {
                  TEXTS.quickPicks
                }
              </Text>

              <View
                style={[
                  styles.presets,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >

                {TIME_PRESETS.map(
                  (
                    preset,
                  ) => {
                    const selected =
                      hour ===
                        preset.hour &&
                      minute ===
                        preset.minute;

                    return (
                      <Pressable
                        key={
                          preset.label
                        }
                        onPress={() =>
                          applyPreset(
                            preset.hour,
                            preset.minute,
                          )
                        }
                        style={[
                          styles.preset,

                          {
                            backgroundColor:
                              selected
                                ? colors.primary +
                                  '14'
                                : colors.surface,

                            borderColor:
                              selected
                                ? colors.primary
                                : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetText,
                            {
                              color:
                                selected
                                  ? colors.primary
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          {
                            preset.label
                          }
                        </Text>
                      </Pressable>
                    );
                  },
                )}

              </View>

            </View>

            {/* ======================================================== */}
            {/* REMINDER                                                 */}
            {/* ======================================================== */}

            <Pressable
              onPress={
                toggleReminder
              }
              style={[
                styles.reminderCard,

                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    reminderOn
                      ? colors.primary +
                        '45'
                      : colors.border,

                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >

              <View
                style={[
                  styles.reminderIcon,
                  {
                    backgroundColor:
                      reminderOn
                        ? colors.primary +
                          '15'
                        : colors.background,
                  },
                ]}
              >
                {reminderOn ? (
                  <Bell
                    size={
                      19
                    }
                    color={
                      colors.primary
                    }
                  />
                ) : (
                  <BellOff
                    size={
                      19
                    }
                    color={
                      colors.textSecondary
                    }
                  />
                )}
              </View>

              <View
                style={
                  styles.reminderText
                }
              >

                <Text
                  style={[
                    styles.reminderTitle,
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
                  {
                    TEXTS.reminderLabel
                  }
                </Text>

                <Text
                  style={[
                    styles.reminderDescription,
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
                  {reminderOn
                    ? TEXTS.reminderOnText
                    : TEXTS.reminderOffText}
                </Text>

              </View>

              <View
                style={[
                  styles.switch,

                  {
                    backgroundColor:
                      reminderOn
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <MotiView
                  animate={{
                    translateX:
                      reminderOn
                        ? isRTL
                          ? -19
                          : 19
                        : 0,
                  }}
                  transition={{
                    type:
                      'spring',

                    damping:
                      16,

                    stiffness:
                      180,
                  }}
                  style={[
                    styles.switchKnob,
                    {
                      backgroundColor:
                        colors.background,

                      borderColor:
                        colors.border,

                      borderWidth:
                        1,
                    },
                  ]}
                />
              </View>

            </Pressable>

            {/* ======================================================== */}
            {/* PREVIEW                                                  */}
            {/* ======================================================== */}

            <View
              style={
                styles.section
              }
            >

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
                {
                  TEXTS.previewLabel
                }
              </Text>

              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor:
                      colors.surface,

                    borderColor:
                      colors.primary +
                      '35',

                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >

                <View
                  style={[
                    styles.previewIcon,
                    {
                      backgroundColor:
                        colors.primary +
                        '15',
                    },
                  ]}
                >
                  <SelectedIcon
                    size={
                      22
                    }
                    color={
                      colors.primary
                    }
                  />
                </View>

                <View
                  style={
                    styles.previewBody
                  }
                >

                  <Text
                    numberOfLines={
                      1
                    }
                    style={[
                      styles.previewTitle,
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
                    {title.trim() ||
                      TEXTS.previewPlaceholder}
                  </Text>

                  <View
                    style={[
                      styles.previewMeta,
                      {
                        flexDirection:
                          isRTL
                            ? 'row-reverse'
                            : 'row',
                      },
                    ]}
                  >

                    <Clock
                      size={
                        12
                      }
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={[
                        styles.previewMetaText,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {
                        timeLabel
                      }
                    </Text>

                    <Text
                      style={[
                        styles.previewDot,
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
                        styles.previewMetaText,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {selectedKey ===
                      'consultation'
                        ? isRTL
                          ? '۴۵ دقیقه'
                          : '45 min'
                        : selectedKey ===
                            'training'
                          ? isRTL
                            ? '۲۰ دقیقه'
                            : '20 min'
                          : isRTL
                            ? '۵ دقیقه'
                            : '5 min'}
                    </Text>

                  </View>

                  <View
                    style={[
                      styles.previewCategory,
                      {
                        backgroundColor:
                          colors.primary +
                          '12',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.previewCategoryText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      {
                        selectedActivity.category
                      }
                    </Text>
                  </View>

                </View>

              </View>

            </View>

            {/* ======================================================== */}
            {/* CREATE BUTTON                                            */}
            {/* ======================================================== */}

            <MotiView
              from={{
                opacity:
                  0,

                translateY:
                  10,
              }}
              animate={{
                opacity:
                  1,

                translateY:
                  0,
              }}
              transition={{
                type:
                  'timing',

                duration:
                  400,
              }}
            >

              <TouchableOpacity
                activeOpacity={
                  0.85
                }
                onPress={
                  handleCreateSchedule
                }
                style={[
                  styles.createButton,

                  {
                    backgroundColor:
                      colors.primary,

                    shadowColor:
                      colors.primary,
                  },
                ]}
              >

                <Calendar
                  size={
                    19
                  }
                  color={
                    colors.background
                  }
                  strokeWidth={
                    2.2
                  }
                />

                <Text
                  style={[
                    styles.createButtonText,
                    {
                      color:
                        colors.background,
                    },
                  ]}
                >
                  {
                    TEXTS.createButton
                  }
                </Text>

              </TouchableOpacity>

              <Text
                style={[
                  styles.createHint,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {
                  TEXTS.createHint
                }
              </Text>

            </MotiView>

          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Header                                                              */
/* -------------------------------------------------------------------------- */

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
      {
        title
      }
    </Text>
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

    safeArea: {
      flex: 1,
    },

    flex: {
      flex: 1,
    },

    /*
     * Header همیشه LTR layout دارد
     * تا Back در سمت چپ باقی بماند.
     */
    header: {
      paddingTop: 40,
      minHeight: 66,

      paddingHorizontal: 18,

      alignItems:
        'center',

      flexDirection:
        'row',
    },

    backButton: {
      width: 43,

      height: 43,

      borderRadius: 30,

      borderWidth: 1,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    headerCenter: {
      flex: 1,

      alignItems:
        'center',

      marginHorizontal:
        12,
    },

    headerTitle: {
      fontSize: 17,

      fontWeight:
        '900',
    },

    headerSubtitle: {
      fontSize: 9,

      fontWeight:
        '600',

      marginTop: 3,
    },

    headerSpacer: {
      width: 43,
    },

    scrollContent: {
      paddingHorizontal: 18,

      paddingTop: 10,

      paddingBottom: 40,
    },

    hero: {
      borderWidth: 1,

      borderRadius: 23,

      padding: 15,

      flexDirection:
        'row',

      alignItems:
        'center',

      marginBottom: 25,
    },

    heroIcon: {
      width: 48,

      height: 48,

      borderRadius: 16,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight: 12,
    },

    heroText: {
      flex: 1,
    },

    heroTitle: {
      fontSize: 15,

      fontWeight:
        '900',
    },

    heroDescription: {
      fontSize: 10,

      lineHeight: 15,

      marginTop: 3,
    },

    section: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 15,

      fontWeight:
        '900',

      marginBottom: 11,
    },

    sectionTitleRow: {
      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    clockBadge: {
      width: 28,

      height: 28,

      borderRadius: 9,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    typeRow: {
      gap: 8,
    },

    typeCard: {
      flex: 1,

      minHeight: 142,

      borderRadius: 18,

      borderWidth: 1,

      padding: 10,

      position:
        'relative',
    },

    typeIcon: {
      width: 37,

      height: 37,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom: 9,
    },

    typeName: {
      fontSize: 11,

      fontWeight:
        '900',
    },

    typeDescription: {
      fontSize: 8,

      lineHeight: 12,

      marginTop: 4,
    },

    typeCheck: {
      position:
        'absolute',

      top: 9,

      right: 9,

      width: 18,

      height: 18,

      borderRadius: 9,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    fieldLabel: {
      fontSize: 10,

      fontWeight:
        '700',

      marginBottom: 7,
    },

    inputContainer: {
      minHeight: 57,

      borderWidth: 1,

      borderRadius: 17,

      alignItems:
        'center',

      paddingHorizontal: 10,
    },

    inputIcon: {
      width: 35,

      height: 35,

      borderRadius: 11,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    input: {
      flex: 1,

      fontSize: 12,

      fontWeight:
        '600',

      paddingHorizontal: 9,

      paddingVertical: 0,

      minHeight: 55,
    },

    timePicker: {
      minHeight: 145,

      borderWidth: 1,

      borderRadius: 21,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 15,
    },

    timePart: {
      alignItems:
        'center',

      gap: 8,
    },

    stepButton: {
      width: 38,

      height: 32,

      borderRadius: 10,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    timeNumber: {
      fontSize: 35,

      fontWeight:
        '900',

      letterSpacing: 1,
    },

    timeSeparator: {
      fontSize: 30,

      fontWeight:
        '900',

      marginTop: 4,
    },

    quickLabel: {
      fontSize: 9,

      fontWeight:
        '700',

      marginTop: 12,

      marginBottom: 7,
    },

    presets: {
      gap: 7,
    },

    preset: {
      flex: 1,

      minHeight: 35,

      borderRadius: 11,

      borderWidth: 1,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    presetText: {
      fontSize: 9,

      fontWeight:
        '800',
    },

    reminderCard: {
      minHeight: 72,

      borderRadius: 19,

      borderWidth: 1,

      paddingHorizontal: 11,

      paddingVertical: 9,

      alignItems:
        'center',

      marginBottom: 24,
    },

    reminderIcon: {
      width: 42,

      height: 42,

      borderRadius: 14,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginHorizontal: 5,
    },

    reminderText: {
      flex: 1,

      marginHorizontal: 9,
    },

    reminderTitle: {
      fontSize: 12,

      fontWeight:
        '900',
    },

    reminderDescription: {
      fontSize: 8,

      lineHeight: 13,

      marginTop: 3,
    },

    switch: {
      width: 45,

      height: 26,

      borderRadius: 14,

      padding: 3,

      justifyContent:
        'center',
    },

    switchKnob: {
      width: 20,

      height: 20,

      borderRadius: 10,
    },

    previewCard: {
      minHeight: 88,

      borderWidth: 1,

      borderRadius: 21,

      padding: 12,

      alignItems:
        'center',
    },

    previewIcon: {
      width: 46,

      height: 46,

      borderRadius: 15,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginHorizontal: 5,
    },

    previewBody: {
      flex: 1,

      marginHorizontal: 5,
    },

    previewTitle: {
      fontSize: 13,

      fontWeight:
        '900',
    },

    previewMeta: {
      alignItems:
        'center',

      gap: 5,

      marginTop: 4,
    },

    previewMetaText: {
      fontSize: 9,

      fontWeight:
        '600',
    },

    previewDot: {
      fontSize: 9,
    },

    previewCategory: {
      alignSelf:
        'flex-start',

      paddingHorizontal: 7,

      paddingVertical: 3,

      borderRadius: 7,

      marginTop: 5,
    },

    previewCategoryText: {
      fontSize: 8,

      fontWeight:
        '800',
    },

    createButton: {
      height: 57,

      borderRadius: 18,

      alignItems:
        'center',

      justifyContent:
        'center',

      flexDirection:
        'row',

      gap: 8,

      shadowOffset: {
        width: 0,

        height: 7,
      },

      shadowOpacity: 0.25,

      shadowRadius: 14,

      elevation: 6,
    },

    createButtonText: {
      fontSize: 13,

      fontWeight:
        '900',
    },

    createHint: {
      textAlign:
        'center',

      fontSize: 8,

      fontWeight:
        '500',

      marginTop: 9,
    },
  });