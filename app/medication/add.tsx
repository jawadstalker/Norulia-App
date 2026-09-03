
import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
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
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function AddMedication() {
  const { colors, isDark, isAthlete } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState(t.cognitive || 'Cognitive');

  const [saving, setSaving] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [savedMedicationName, setSavedMedicationName] = useState('');

  // ============================================================
  // UNIFIED THEME COLOR
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
      ? 'rgba(73,194,226,0.18)'
      : `${colors.primary}18`;

  const primaryMedium = isAthlete
    ? 'rgba(34,197,94,0.25)'
    : isDark
      ? 'rgba(73,194,226,0.30)'
      : `${colors.primary}30`;

  const gradientColors = isAthlete
    ? ['#22C55E', '#16A34A'] as const
    : isDark
      ? ['rgba(73, 194, 226, 1)', 'rgba(73, 194, 226, 0.8)'] as const
      : [colors.primary, colors.primary] as const;

  // ============================================================
  // SAVE MEDICATION
  // ============================================================

  const handleSave = async () => {
    const cleanName = name.trim();
    const cleanDosage = dosage.trim();
    const cleanTime = time.trim();

    if (!cleanName || !cleanDosage || !cleanTime) {
      setErrorMessage(
        t.pleaseFillAllFields || 'Please fill all fields'
      );

      setErrorModalVisible(true);
      return;
    }

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      const stored = await AsyncStorage.getItem(
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
        JSON.stringify(updatedMedications)
      );

      setSavedMedicationName(cleanName);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error(
        'Failed to save medication:',
        error
      );

      setErrorMessage(
        t.somethingWentWrong ||
          'Something went wrong while saving the medication.'
      );

      setErrorModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  const handleBack = () => {
    if (saving) {
      return;
    }

    router.back();
  };

  // ============================================================
  // MEDICATION TYPES
  // ============================================================

  const typeOptions = [
    {
      key: 'cognitive',
      value: t.cognitive || 'Cognitive',
    },
    {
      key: 'supplement',
      value: t.supplement || 'Supplement',
    },
    {
      key: 'other',
      value: t.other || 'Other',
    },
  ];

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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.75}
          >
            <ArrowLeft
              size={22}
              color={iconColor}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.headerTitleContainer,
              {
                flexDirection: isRTL
                  ? 'row'
                  : 'row-reverse',
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  textAlign: 'right',
                },
              ]}
            >
              {t.addMedicationTitle || 'Add Medication'}
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* ======================================================
            FORM
        ====================================================== */}

        <View style={styles.form}>
          {/* Medication Name */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t.medicationName || 'Medication Name'}
            </Text>

            <TextInput
              placeholder={
                t.medicationNamePlaceholder ||
                'e.g., Donepezil'
              }
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholderTextColor={
                colors.textSecondary
              }
            />
          </View>

          {/* Dosage */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t.dosage || 'Dosage'}
            </Text>

            <TextInput
              placeholder={
                t.dosagePlaceholder || 'e.g., 10mg'
              }
              value={dosage}
              onChangeText={setDosage}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              placeholderTextColor={
                colors.textSecondary
              }
            />
          </View>

          {/* Time */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t.time || 'Time'}
            </Text>

            <View style={styles.timeInputWrapper}>
              <Clock
                size={20}
                color={iconColor}
                strokeWidth={2.2}
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
                onChangeText={setTime}
                keyboardType="numbers-and-punctuation"
                style={[
                  styles.timeInput,
                  {
                    backgroundColor:
                      colors.surface,
                    color: colors.text,
                    borderColor:
                      colors.border,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                    paddingLeft: isRTL
                      ? 15
                      : 50,
                    paddingRight: isRTL
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

          {/* Type */}

          <View style={styles.fieldContainer}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {t.type || 'Type'}
            </Text>

            <View
              style={[
                styles.typeContainer,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              {typeOptions.map((option) => {
                const selected =
                  type === option.value;

                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() =>
                      setType(option.value)
                    }
                    activeOpacity={0.8}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          selected
                            ? themeColor
                            : colors.surface,
                        borderColor:
                          selected
                            ? themeColor
                            : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color: selected
                            ? '#FFFFFF'
                            : colors.text,
                        },
                      ]}
                    >
                      {option.value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save */}

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={[
              styles.saveButton,
              {
                opacity: saving ? 0.65 : 1,
              },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveGradient}
            >
              <Text style={styles.saveButtonText}>
                {saving
                  ? t.saving || 'Saving...'
                  : t.save || 'Save Medication'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ========================================================
          SUCCESS MODAL
      ======================================================== */}

      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSuccessModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.successModal,
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
                styles.successIconContainer,
                {
                  backgroundColor:
                    primarySoft,
                },
              ]}
            >
              <CheckCircle
                size={52}
                color={iconColor}
                strokeWidth={2}
              />
            </View>

            <Text
              style={[
                styles.modalTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {t.success || 'Success!'}
            </Text>

            <Text
              style={[
                styles.modalMessage,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {savedMedicationName}
              {'\n'}
              {t.addedSuccessfully ||
                'Medication added successfully.'}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSuccessClose}
              style={[
                styles.modalButton,
                {
                  backgroundColor:
                    themeColor,
                },
              ]}
            >
              <Text
                style={styles.modalButtonText}
              >
                {t.great || t.ok || 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          ERROR MODAL
      ======================================================== */}

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setErrorModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setErrorModalVisible(false)
          }
        >
          <Pressable
            style={[
              styles.successModal,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={[
                styles.errorIconContainer,
                {
                  backgroundColor:
                    primarySoft,
                },
              ]}
            >
              <AlertCircle
                size={52}
                color={iconColor}
                strokeWidth={2}
              />
            </View>

            <Text
              style={[
                styles.modalTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {t.error || 'Error'}
            </Text>

            <Text
              style={[
                styles.modalMessage,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {errorMessage}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                setErrorModalVisible(false)
              }
              style={[
                styles.modalButton,
                {
                  backgroundColor:
                    themeColor,
                },
              ]}
            >
              <Text
                style={styles.modalButtonText}
              >
                {t.ok || 'OK'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal:
      Spacing?.lg || 20,
    paddingTop:
      Spacing?.md || 16,
    paddingBottom: 40,
  },

  header: {
    width: '100%',
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 24,
    paddingTop: 50,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent:
      'flex-end',
    gap: 10,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    flexShrink: 1,
  },

  headerSpacer: {
    width: 44,
  },

  form: {
    gap: 20,
  },

  fieldContainer: {
    width: '100%',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    width: '100%',
    minHeight: 54,
    borderWidth: 1,
    borderRadius:
      BorderRadius?.md || 14,
    paddingHorizontal: 16,
    fontSize: 15,
  },

  timeInputWrapper: {
    position: 'relative',
    width: '100%',
  },

  timeIcon: {
    position: 'absolute',
    top: 17,
    zIndex: 2,
  },

  timeInput: {
    width: '100%',
    minHeight: 54,
    borderWidth: 1,
    borderRadius:
      BorderRadius?.md || 14,
    fontSize: 15,
  },

  typeContainer: {
    width: '100%',
    gap: 8,
  },

  typeButton: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  saveButton: {
    width: '100%',
    minHeight: 56,
    borderRadius:
      BorderRadius?.md || 14,
    overflow: 'hidden',
    marginTop: 8,
  },

  saveGradient: {
    flex: 1,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  successModal: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },

  successIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  errorIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },

  modalMessage: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 24,
  },

  modalButton: {
    width: '100%',
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

