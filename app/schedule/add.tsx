import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { ArrowLeft, Brain, Pill, Heart, Clock, Calendar, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../../components/ui/Card';
import { Spacing, BorderRadius } from '../../constants/theme';

export default function AddSchedule() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedType, setSelectedType] = useState<string>('Brain Training');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');

  const types = [
    { name: 'Brain Training', icon: Brain, color: '#7C3AED' },
    { name: 'Medication', icon: Pill, color: '#22C55E' },
    { name: 'Consultation', icon: Heart, color: '#EC4899' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Create New Activity</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Plan your healthy routine
        </Text>

        {/* Activity Types */}
        <View style={styles.typesContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Activity Type</Text>
          {types.map((item, index) => {
            const Icon = item.icon;
            const isSelected = selectedType === item.name;
            return (
              <MotiView
                key={item.name}
                from={{ opacity: 0, translateY: 30 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: index * 100, type: 'spring', damping: 15 }}
              >
                <TouchableOpacity
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: isSelected
                        ? item.color + '20'
                        : colors.surface,
                      borderColor: isSelected ? item.color : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedType(item.name)}
                >
                  <View
                    style={[styles.typeIcon, { backgroundColor: item.color + '20' }]}
                  >
                    <Icon size={24} color={item.color} />
                  </View>
                  <Text style={[styles.typeName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Activity Title</Text>
          <TextInput
            placeholder="e.g., Morning Meditation"
            value={title}
            onChangeText={setTitle}
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
        </View>

        {/* Time Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
          <View style={styles.timeInputWrapper}>
            <Clock size={20} color={colors.primary} style={styles.timeIcon} />
            <TextInput
              placeholder="e.g., 09:00 AM"
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
        </View>

        {/* Reminder Toggle */}
        <Card
          style={{
            padding: Spacing.md,
            backgroundColor: colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={styles.reminderLeft}>
            <Bell size={20} color={colors.primary} />
            <Text style={[styles.reminderText, { color: colors.text }]}>
              Set Reminder
            </Text>
          </View>
          <View
            style={[
              styles.reminderToggle,
              { backgroundColor: colors.primary + '40' },
            ]}
          >
            <View
              style={[styles.reminderToggleDot, { backgroundColor: colors.primary }]}
            />
          </View>
        </Card>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveWrapper}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>Create Schedule</Text>
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
    marginBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  typesContainer: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
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
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  reminderToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
    justifyContent: 'center',
  },
  reminderToggleDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  saveWrapper: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  saveButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});