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
import { ArrowLeft, Brain, Pill, Heart, Clock, Calendar, Bell, PenLine, Check } from 'lucide-react-native';
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
  const [reminderOn, setReminderOn] = useState(true);

  const types = [
    { name: 'Brain Training', icon: Brain, color: '#7C3AED' },
    { name: 'Medication', icon: Pill, color: '#22C55E' },
    { name: 'Consultation', icon: Heart, color: '#EC4899' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.titleBlock}
        >
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.titleIconWrap}
          >
            <Calendar size={22} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.text }]}>Create New Activity</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Plan your healthy routine
          </Text>
        </MotiView>

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
                transition={{ delay: 100 + index * 90, type: 'spring', damping: 15 }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: isSelected ? item.color + '14' : colors.surface,
                      borderColor: isSelected ? item.color : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                      shadowColor: isSelected ? item.color : '#000',
                      shadowOpacity: isSelected ? 0.25 : 0.05,
                    },
                  ]}
                  onPress={() => setSelectedType(item.name)}
                >
                  <View style={[styles.typeIcon, { backgroundColor: item.color + '20' }]}>
                    <Icon size={22} color={item.color} />
                  </View>
                  <Text style={[styles.typeName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <MotiView
                    animate={{
                      opacity: isSelected ? 1 : 0,
                      scale: isSelected ? 1 : 0.5,
                    }}
                    transition={{ type: 'timing', duration: 200 }}
                    style={[styles.selectedBadge, { backgroundColor: item.color }]}
                  >
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </MotiView>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 380 }}
        >
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Activity Title</Text>
            <View style={styles.iconInputWrapper}>
              <PenLine size={18} color={colors.primary} style={styles.timeIcon} />
              <TextInput
                placeholder="e.g., Morning Meditation"
                value={title}
                onChangeText={setTitle}
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

          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
            <View style={styles.iconInputWrapper}>
              <Clock size={18} color={colors.primary} style={styles.timeIcon} />
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
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 460 }}
        >
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
              <View style={[styles.reminderIconWrap, { backgroundColor: colors.primary + '18' }]}>
                <Bell size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.reminderText, { color: colors.text }]}>
                  Set Reminder
                </Text>
                <Text style={[styles.reminderHint, { color: colors.textSecondary }]}>
                  {reminderOn ? 'Notification enabled' : 'Notification off'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setReminderOn((prev) => !prev)}
              style={[
                styles.reminderToggle,
                { backgroundColor: reminderOn ? colors.primary + '40' : colors.border },
              ]}
            >
              <MotiView
                animate={{ translateX: reminderOn ? 20 : 0 }}
                transition={{ type: 'timing', duration: 200 }}
                style={[styles.reminderToggleDot, { backgroundColor: reminderOn ? colors.primary : colors.textSecondary }]}
              />
            </TouchableOpacity>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 540 }}
        >
          <TouchableOpacity style={styles.saveWrapper} activeOpacity={0.85}>
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.saveButton}
            >
              <Calendar size={18} color="#FFFFFF" />
              <Text style={styles.saveText}>Create Schedule</Text>
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
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  titleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
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
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  iconInputWrapper: {
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
    gap: 10,
  },
  reminderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: {
    fontSize: 15,
    fontWeight: '500',
  },
  reminderHint: {
    fontSize: 12,
    marginTop: 2,
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
  saveWrapper: {
    marginTop: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  saveButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});