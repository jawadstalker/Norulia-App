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
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useFocusEffect,
  useRouter,
} from 'expo-router';

import {
  useTheme,
} from '../../context/ThemeContext';

import {
  useLanguage,
} from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Pill,
  XCircle,
} from 'lucide-react-native';

const MEDICATIONS_STORAGE_KEY =
  '@neurolia_medications';

interface Medication {
  id: number;
  name: string;
  dosage: string;
  time: string;
  status:
    | 'taken'
    | 'pending'
    | 'missed';
  type: string;
  adherence: number;
  date: string;
}

interface HistoryItem {
  medication: Medication;
  date: string;
}

const getDateKey = (
  date: Date = new Date()
) => {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDate = (
  dateString: string
) => {
  const date =
    new Date(
      `${dateString}T12:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return dateString;
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );
};

export default function MedicationHistory() {
  const { colors } =
    useTheme();

  const {
    t,
    isRTL,
  } = useLanguage();

  const router =
    useRouter();

  const [
    medications,
    setMedications,
  ] = useState<
    Medication[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const loadMedications =
    useCallback(
      async () => {
        try {
          setLoading(true);

          const stored =
            await AsyncStorage.getItem(
              MEDICATIONS_STORAGE_KEY
            );

          if (!stored) {
            setMedications([]);
            return;
          }

          const parsed =
            JSON.parse(stored);

          if (
            Array.isArray(parsed)
          ) {
            setMedications(
              parsed
            );
          } else {
            setMedications([]);
          }
        } catch (error) {
          console.error(
            'Failed to load medication history:',
            error
          );

          setMedications([]);
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /*
   * هر بار که کاربر وارد صفحه History
   * می‌شود، اطلاعات جدید خوانده می‌شود.
   */
  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [
      loadMedications,
    ])
  );

  /*
   * تاریخچه را بر اساس تاریخ گروه‌بندی می‌کنیم.
   */
  const groupedHistory =
    useMemo(() => {
      const groups =
        new Map<
          string,
          Medication[]
        >();

      const sorted =
        [...medications].sort(
          (a, b) => {
            if (
              a.date !== b.date
            ) {
              return b.date.localeCompare(
                a.date
              );
            }

            return a.time.localeCompare(
              b.time
            );
          }
        );

      sorted.forEach(
        (medication) => {
          const existing =
            groups.get(
              medication.date
            ) || [];

          existing.push(
            medication
          );

          groups.set(
            medication.date,
            existing
          );
        }
      );

      return Array.from(
        groups.entries()
      );
    }, [medications]);

  const getStatusLabel =
    (
      status: Medication['status']
    ) => {
      switch (status) {
        case 'taken':
          return (
            t.taken ||
            t.medicationTaken ||
            'Taken'
          );

        case 'missed':
          return (
            t.missed ||
            'Missed'
          );

        case 'pending':
        default:
          return (
            t.pending ||
            'Pending'
          );
      }
    };

  const getStatusColor =
    (
      status: Medication['status']
    ) => {
      switch (status) {
        case 'taken':
          return '#10B981';

        case 'missed':
          return '#EF4444';

        case 'pending':
        default:
          return '#F59E0B';
      }
    };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* =========================
          HEADER
      ========================== */}

      <View
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
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
          activeOpacity={0.75}
        >
          <ArrowLeft
            size={21}
            color={colors.text}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        <View
          style={styles.headerTitleContainer}
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
            {t.medicationHistory ||
              'Medication History'}
          </Text>
        </View>

        <View
          style={
            styles.headerSpacer
          }
        />
      </View>

      {/* =========================
          CONTENT
      ========================== */}

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {loading ? (
          <View
            style={
              styles.loadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.loadingText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {t.loading ||
                'Loading...'}
            </Text>
          </View>
        ) : groupedHistory.length ===
          0 ? (
          <View
            style={[
              styles.emptyContainer,
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
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <Pill
                size={34}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {t.noMedicationHistory ||
                'No Medication History'}
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {t.noMedicationHistoryMessage ||
                'Your medication history will appear here after you add medications.'}
            </Text>

            <TouchableOpacity
              style={[
                styles.emptyButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
              onPress={() =>
                router.push(
                  '/medication/add'
                )
              }
              activeOpacity={0.8}
            >
              <Text
                style={
                  styles.emptyButtonText
                }
              >
                {t.addMedication ||
                  'Add Medication'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          groupedHistory.map(
            ([
              date,
              meds,
            ]) => (
              <View
                key={date}
                style={
                  styles.dateSection
                }
              >
                {/* DATE HEADER */}

                <View
                  style={[
                    styles.dateHeader,
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
                      styles.calendarIcon,
                      {
                        backgroundColor:
                          colors.primary +
                          '15',
                      },
                    ]}
                  >
                    <Calendar
                      size={19}
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.dateInfo
                    }
                  >
                    <Text
                      style={[
                        styles.dateTitle,
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
                      {formatDate(
                        date
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.dateCount,
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
                        meds.length
                      }{' '}
                      {t.medications ||
                        'medications'}
                    </Text>
                  </View>
                </View>

                {/* MEDICATIONS */}

                {meds.map(
                  (
                    medication
                  ) => {
                    const statusColor =
                      getStatusColor(
                        medication.status
                      );

                    return (
                      <View
                        key={
                          medication.id
                        }
                        style={[
                          styles.historyItem,
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
                        {/* ICON */}

                        <View
                          style={[
                            styles.historyIcon,
                            {
                              backgroundColor:
                                colors.primary +
                                '12',

                              marginRight:
                                isRTL
                                  ? 0
                                  : Spacing.md,

                              marginLeft:
                                isRTL
                                  ? Spacing.md
                                  : 0,
                            },
                          ]}
                        >
                          <Pill
                            size={21}
                            color={
                              colors.primary
                            }
                          />
                        </View>

                        {/* INFO */}

                        <View
                          style={
                            styles.historyInfo
                          }
                        >
                          <Text
                            style={[
                              styles.historyName,
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
                              medication.name
                            }
                          </Text>

                          <Text
                            style={[
                              styles.dosage,
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
                              medication.dosage
                            }
                          </Text>

                          <View
                            style={[
                              styles.historyTime,
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
                                colors.textSecondary
                              }
                            />

                            <Text
                              style={[
                                styles.historyTimeText,
                                {
                                  color:
                                    colors.textSecondary,
                                },
                              ]}
                            >
                              {
                                medication.time
                              }
                            </Text>
                          </View>
                        </View>

                        {/* STATUS */}

                        <View
                          style={
                            styles.statusContainer
                          }
                        >
                          {medication.status ===
                          'taken' ? (
                            <CheckCircle
                              size={
                                23
                              }
                              color={
                                statusColor
                              }
                            />
                          ) : medication.status ===
                            'missed' ? (
                            <XCircle
                              size={
                                23
                              }
                              color={
                                statusColor
                              }
                            />
                          ) : (
                            <View
                              style={[
                                styles.statusBadge,
                                {
                                  backgroundColor:
                                    statusColor +
                                    '18',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.statusText,
                                  {
                                    color:
                                      statusColor,
                                  },
                                ]}
                              >
                                {getStatusLabel(
                                  medication.status
                                )}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            )
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    header: {
      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        Spacing.lg,

      paddingTop:
        Spacing.xl,

      paddingBottom:
        Spacing.md,
    },

    backButton: {
      width: 42,

      height: 42,

      borderRadius: 21,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,
    },

    headerTitleContainer: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    headerTitle: {
      fontSize: 21,

      fontWeight:
        '700',
    },

    headerSpacer: {
      width: 42,
    },

    scrollContent: {
      padding:
        Spacing.lg,

      paddingTop: 4,

      paddingBottom:
        Spacing.xxl ||
        40,
    },

    loadingContainer: {
      minHeight: 300,

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 12,
    },

    loadingText: {
      fontSize: 14,
    },

    emptyContainer: {
      borderRadius:
        BorderRadius.xl ||
        20,

      borderWidth: 1,

      padding:
        Spacing.xl,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        Spacing.xl,
    },

    emptyIcon: {
      width: 72,

      height: 72,

      borderRadius: 36,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        Spacing.md,
    },

    emptyTitle: {
      fontSize: 19,

      fontWeight:
        '700',

      marginBottom: 8,

      textAlign:
        'center',
    },

    emptyText: {
      fontSize: 14,

      lineHeight: 22,

      textAlign:
        'center',

      marginBottom:
        Spacing.lg,
    },

    emptyButton: {
      paddingHorizontal:
        Spacing.xl,

      paddingVertical:
        13,

      borderRadius:
        BorderRadius.md ||
        12,
    },

    emptyButtonText: {
      color:
        '#FFFFFF',

      fontSize: 15,

      fontWeight:
        '700',
    },

    dateSection: {
      marginBottom:
        Spacing.xl,
    },

    dateHeader: {
      alignItems:
        'center',

      marginBottom:
        Spacing.md,

      gap: 10,
    },

    calendarIcon: {
      width: 40,

      height: 40,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    dateInfo: {
      flex: 1,
    },

    dateTitle: {
      fontSize: 17,

      fontWeight:
        '700',
    },

    dateCount: {
      fontSize: 12,

      marginTop: 2,
    },

    historyItem: {
      alignItems:
        'center',

      padding:
        Spacing.md,

      borderRadius:
        BorderRadius.md,

      borderWidth: 1,

      marginBottom:
        Spacing.sm,
    },

    historyIcon: {
      width: 42,

      height: 42,

      borderRadius: 21,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    historyInfo: {
      flex: 1,

      minWidth: 0,
    },

    historyName: {
      fontSize: 16,

      fontWeight:
        '700',
    },

    dosage: {
      fontSize: 13,

      marginTop: 2,
    },

    historyTime: {
      alignItems:
        'center',

      gap: 4,

      marginTop: 4,
    },

    historyTimeText: {
      fontSize: 13,
    },

    statusContainer: {
      marginLeft: 8,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    statusBadge: {
      paddingHorizontal:
        9,

      paddingVertical: 5,

      borderRadius:
        BorderRadius.sm ||
        8,
    },

    statusText: {
      fontSize: 11,

      fontWeight:
        '600',
    },
  });