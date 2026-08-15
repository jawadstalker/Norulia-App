import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import {
  Plus,
  ArrowLeft,
  Clock,
  Pill,
  CheckCircle,
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

const MEDICATIONS_STORAGE_KEY = '@neurolia_medications';

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

const getDateKey = (date: Date = new Date()) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function AddMedication() {
  const { colors } = useTheme();

  const { t, isRTL } = useLanguage();

  const router = useRouter();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');

  const [type, setType] = useState(
    t.cognitive || 'Cognitive'
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanDosage = dosage.trim();
    const cleanTime = time.trim();

    if (
      !cleanName ||
      !cleanDosage ||
      !cleanTime
    ) {
      Alert.alert(
        t.error || 'Error',
        t.pleaseFillAllFields ||
          'Please fill all fields'
      );

      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const stored =
        await AsyncStorage.getItem(
          MEDICATIONS_STORAGE_KEY
        );

      let medications: Medication[] = [];

      if (stored) {
        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            medications = parsed;
          }
        } catch {
          medications = [];
        }
      }

      /*
       * یک ID یکتا تولید می‌کنیم.
       * Date.now در اکثر موارد کافی است.
       */
      const newMedication: Medication = {
        id: Date.now(),

        name: cleanName,

        dosage: cleanDosage,

        time: cleanTime,

        status: 'pending',

        type,

        adherence: 0,

        date: getDateKey(),
      };

      const updatedMedications = [
        ...medications,
        newMedication,
      ];

      await AsyncStorage.setItem(
        MEDICATIONS_STORAGE_KEY,
        JSON.stringify(
          updatedMedications
        )
      );

      /*
       * ابتدا ذخیره انجام شده،
       * سپس کاربر به صفحه قبل برمی‌گردد.
       */
      Alert.alert(
        t.success || 'Success!',
        `${cleanName} (${cleanDosage}) ${
          t.addedSuccessfully ||
          'added successfully!'
        }`,
        [
          {
            text:
              t.great ||
              'OK',

            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error(
        'Failed to save medication:',
        error
      );

      Alert.alert(
        t.error || 'Error',
        t.somethingWentWrong ||
          'Something went wrong while saving the medication.'
      );
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    {
      key: 'cognitive',
      value:
        t.cognitive ||
        'Cognitive',
    },

    {
      key: 'supplement',
      value:
        t.supplement ||
        'Supplement',
    },

    {
      key: 'other',
      value:
        t.other ||
        'Other',
    },
  ];

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
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* =========================
            HEADER
        ========================== */}

        <View
          style={[
            styles.header,
            {
              flexDirection: isRTL
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
              size={22}
              color={colors.text}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View
            style={styles.headerCenter}
          >
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '18',
                },
              ]}
            >
              <Pill
                size={22}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={[
                styles.title,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {t.addMedicationTitle ||
                'Add Medication'}
            </Text>
          </View>

          <View
            style={styles.headerSpacer}
          />
        </View>

        {/* =========================
            FORM
        ========================== */}

        <View style={styles.form}>
          {/* NAME */}

          <View>
            <Text
              style={[
                styles.label,
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
              {t.medicationName ||
                'Medication Name'}
            </Text>

            <TextInput
              placeholder={
                t.medicationNamePlaceholder ||
                'e.g., Donepezil'
              }
              value={name}
              onChangeText={
                setName
              }
              autoCapitalize="words"
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.surface,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
              placeholderTextColor={
                colors.textSecondary
              }
            />
          </View>

          {/* DOSAGE */}

          <View>
            <Text
              style={[
                styles.label,
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
              {t.dosage ||
                'Dosage'}
            </Text>

            <TextInput
              placeholder={
                t.dosagePlaceholder ||
                'e.g., 10mg'
              }
              value={dosage}
              onChangeText={
                setDosage
              }
              style={[
                styles.input,
                {
                  backgroundColor:
                    colors.surface,
                  color:
                    colors.text,
                  borderColor:
                    colors.border,
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
              placeholderTextColor={
                colors.textSecondary
              }
            />
          </View>

          {/* TIME */}

          <View>
            <Text
              style={[
                styles.label,
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
              {t.time ||
                'Time'}
            </Text>

            <View
              style={
                styles.timeInputWrapper
              }
            >
              <Clock
                size={20}
                color={
                  colors.primary
                }
                style={[
                  styles.timeIcon,
                  {
                    left: isRTL
                      ? undefined
                      : 15,

                    right: isRTL
                      ? 15
                      : undefined,
                  },
                ]}
              />

              <TextInput
                placeholder={
                  t.timePlaceholder ||
                  'e.g., 20:00'
                }
                value={time}
                onChangeText={
                  setTime
                }
                keyboardType="numbers-and-punctuation"
                style={[
                  styles.timeInput,
                  {
                    backgroundColor:
                      colors.surface,

                    color:
                      colors.text,

                    borderColor:
                      colors.border,

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',

                    paddingLeft:
                      isRTL
                        ? 15
                        : 50,

                    paddingRight:
                      isRTL
                        ? 50
                        : 15,
                  },
                ]}
                placeholderTextColor={
                  colors.textSecondary
                }
              />
            </View>
          </View>

          {/* TYPE */}

          <View>
            <Text
              style={[
                styles.label,
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
              {t.medicationType ||
                'Medication Type'}
            </Text>

            <View
              style={[
                styles.typeContainer,
                {
                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
              {typeOptions.map(
                (option) => {
                  const selected =
                    type ===
                    option.value;

                  return (
                    <TouchableOpacity
                      key={
                        option.key
                      }
                      style={[
                        styles.typeButton,

                        {
                          backgroundColor:
                            selected
                              ? colors.primary
                              : colors.surface,

                          borderColor:
                            selected
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setType(
                          option.value
                        )
                      }
                      activeOpacity={
                        0.8
                      }
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          {
                            color:
                              selected
                                ? '#FFFFFF'
                                : colors.text,
                          },
                        ]}
                      >
                        {
                          option.value
                        }
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>
        </View>

        {/* =========================
            SAVE BUTTON
        ========================== */}

        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
          style={[
            styles.saveButtonWrapper,
            {
              opacity:
                saving ? 0.7 : 1,
            },
          ]}
        >
          <LinearGradient
            colors={[
              '#7C3AED',
              '#3B82F6',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={
              styles.saveButton
            }
          >
            {saving ? (
              <Text
                style={
                  styles.saveButtonText
                }
              >
                {t.saving ||
                  'Saving...'}
              </Text>
            ) : (
              <>
                <CheckCircle
                  size={21}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {t.saveMedication ||
                    'Save Medication'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      padding:
        Spacing.lg,

      paddingTop:
        Spacing.xl,

      paddingBottom:
        Spacing.xxl ||
        40,
    },

    header: {
      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginBottom:
        Spacing.xl,
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

    headerCenter: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 10,

      flex: 1,

      justifyContent:
        'center',
    },

    headerIcon: {
      width: 40,

      height: 40,

      borderRadius: 12,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    title: {
      fontSize: 22,

      fontWeight:
        '700',
    },

    headerSpacer: {
      width: 42,
    },

    form: {
      gap:
        Spacing.lg,
    },

    label: {
      fontSize: 15,

      fontWeight:
        '600',

      marginBottom: 8,
    },

    input: {
      height: 55,

      borderRadius:
        BorderRadius.lg,

      paddingHorizontal:
        15,

      borderWidth: 1,

      fontSize: 16,
    },

    timeInputWrapper: {
      position:
        'relative',

      width: '100%',
    },

    timeIcon: {
      position:
        'absolute',

      top: 17,

      zIndex: 2,
    },

    timeInput: {
      width: '100%',

      height: 55,

      borderRadius:
        BorderRadius.lg,

      borderWidth: 1,

      fontSize: 16,
    },

    typeContainer: {
      gap: 10,
    },

    typeButton: {
      flex: 1,

      paddingVertical:
        13,

      borderRadius:
        BorderRadius.md,

      borderWidth: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      minHeight: 48,
    },

    typeButtonText: {
      fontSize: 14,

      fontWeight:
        '600',

      textAlign:
        'center',
    },

    saveButtonWrapper: {
      marginTop:
        Spacing.xl,

      borderRadius:
        BorderRadius.lg,

      overflow:
        'hidden',
    },

    saveButton: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingVertical:
        17,

      gap: 10,
    },

    saveButtonText: {
      color:
        '#FFFFFF',

      fontSize: 17,

      fontWeight:
        '700',
    },
  });