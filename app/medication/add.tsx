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
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ArrowLeft, Clock, Pill, Brain } from 'lucide-react-native';

export default function AddMedication() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState(t.cognitive || 'Cognitive');

  const handleSave = () => {
    if (!name || !dosage || !time) {
      Alert.alert(t.error || 'Error', t.pleaseFillAllFields || 'Please fill all fields');
      return;
    }

    // TODO: ذخیره در MedicationContext
    Alert.alert(
      t.success || 'Success!',
      `${name} (${dosage}) ${t.addedSuccessfully || 'added successfully!'}`,
      [
        {
          text: t.great || 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // گزینه‌های نوع دارو با ترجمه
  const typeOptions = [
    { key: 'cognitive', value: t.cognitive || 'Cognitive' },
    { key: 'supplement', value: t.supplement || 'Supplement' },
    { key: 'other', value: t.other || 'Other' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {t.addMedicationTitle || 'Add Medication 💊'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t.medicationName || 'Medication Name'}
          </Text>
          <TextInput
            placeholder={t.medicationNamePlaceholder || 'e.g., Donepezil'}
            value={name}
            onChangeText={setName}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {t.dosage || 'Dosage'}
          </Text>
          <TextInput
            placeholder={t.dosagePlaceholder || 'e.g., 10mg'}
            value={dosage}
            onChangeText={setDosage}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {t.time || 'Time'}
          </Text>
          <View style={styles.timeInputWrapper}>
            <Clock size={20} color={colors.primary} style={styles.timeIcon} />
            <TextInput
              placeholder={t.timePlaceholder || 'e.g., 20:00'}
              value={time}
              onChangeText={setTime}
              style={[
                styles.timeInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            {t.medicationType || 'Medication Type'}
          </Text>
          <View style={styles.typeContainer}>
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === option.value ? colors.primary : colors.surface,
                    borderColor: type === option.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setType(option.value)}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === option.value ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {option.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveButtonWrapper}>
          <LinearGradient
            colors={['#7C3AED', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButton}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {t.saveMedication || 'Save Medication'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  form: {
    gap: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 55,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: 16,
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timeIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  timeInput: {
    flex: 1,
    height: 55,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 50,
    borderWidth: 1,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButtonWrapper: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});