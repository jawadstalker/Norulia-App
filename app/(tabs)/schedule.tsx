import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Bell,
  Pill,
  Brain,
  Heart,
  Moon,
  X,
  Sparkles,
} from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Event {
  id: string;
  title: string;
  time: string;
  category: string;
  duration: string;
  completed: boolean;
  icon: any;
  color: string;
}

export default function ScheduleScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: t.meditationSession || 'Meditation Session',
      time: '09:00 AM',
      category: t.mindfulness || 'Mindfulness',
      duration: '20 ' + (t.minutes || 'min'),
      completed: true,
      icon: Brain,
      color: '#6366F1',
    },
    {
      id: '2',
      title: t.takeMedication || 'Take Medication',
      time: '12:00 PM',
      category: t.health || 'Health',
      duration: '5 ' + (t.minutes || 'min'),
      completed: false,
      icon: Pill,
      color: '#22C55E',
    },
    {
      id: '3',
      title: t.therapySession || 'Therapy Session',
      time: '03:00 PM',
      category: t.mentalHealth || 'Mental Health',
      duration: '45 ' + (t.minutes || 'min'),
      completed: false,
      icon: Heart,
      color: '#EC4899',
    },
    {
      id: '4',
      title: t.eveningRelaxation || 'Evening Relaxation',
      time: '08:00 PM',
      category: t.wellness || 'Wellness',
      duration: '30 ' + (t.minutes || 'min'),
      completed: false,
      icon: Moon,
      color: '#8B5CF6',
    },
  ]);

  const [isFabOpen, setIsFabOpen] = useState(false);

  const toggleCompletion = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, completed: !event.completed } : event
      )
    );
  };

  const completedCount = events.filter((e) => e.completed).length;
  const totalCount = events.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.goodMorning || 'Good morning';
    if (hour < 17) return t.goodAfternoon || 'Good afternoon';
    return t.goodEvening || 'Good evening';
  };

  const getDateDisplay = () => {
    const now = new Date();
    return now.toLocaleDateString(t.language === 'fa' ? 'fa-IR' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const fabOptions = [
    { id: 'task', label: t.add || 'Add Task', icon: Sparkles, color: '#7C3AED' },
    { id: 'medication', label: t.addMedication || 'Add Medication', icon: Pill, color: '#22C55E' },
    { id: 'consultation', label: t.addConsultation || 'Add Consultation', icon: Heart, color: '#EC4899' },
  ];

  return (
    <LinearGradient
      colors={isDark ? ['#0a0a0f', '#14141e'] : ['#f0f4ff', '#ffffff']}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header with Animated Avatar */}
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
          >
            <Image
              source={require('../../assets/avatars/model3.png')}
              style={styles.avatar}
            />
            <MotiView
              from={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2000, loop: true }}
              style={[styles.avatarGlow, { borderColor: colors.primary }]}
            />
          </MotiView>

          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {getGreeting()}, Alex
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>
            {t.dailyPlanner || 'Daily Planner AI'}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            {t.activitiesToday || 'You have'} {totalCount - completedCount} {t.activitiesToday?.toLowerCase() || 'activities today'}
          </Text>
        </MotiView>

        {/* Date Card with Progress */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100, type: 'spring', damping: 15 }}
        >
          <Card
            style={{
              ...styles.dateCard,
              backgroundColor: isDark ? colors.surface : '#ffffff',
            }}
          >
            <View style={styles.dateContent}>
              <View style={styles.dateLeft}>
                <Calendar size={24} color={colors.primary} />
                <View style={styles.dateTextContainer}>
                  <Text style={[styles.dateDay, { color: colors.text }]}>
                    {getDateDisplay()}
                  </Text>
                </View>
              </View>
              <MotiView
                from={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 200, type: 'spring', damping: 12 }}
                style={[styles.progressCircle, { borderColor: colors.primary }]}
              >
                <Text style={[styles.progressText, { color: colors.primary }]}>
                  {completedCount}/{totalCount}
                </Text>
              </MotiView>
            </View>
            <View style={styles.progressBarContainer}>
              <MotiView
                from={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ delay: 300, type: 'timing', duration: 800 }}
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </Card>
        </MotiView>

        {/* Timeline */}
        <View style={styles.timeline}>
          {events.map((event, index) => (
            <MotiView
              key={event.id}
              from={{ opacity: 0, translateY: 40, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{
                delay: index * 150,
                type: 'spring',
                damping: 15,
              }}
            >
              <View style={styles.timelineItem}>
                {index < events.length - 1 && (
                  <View
                    style={[styles.timelineLine, { backgroundColor: colors.border }]}
                  />
                )}
                <View style={[styles.timelineDot, { backgroundColor: event.color }]} />
                <Card
                  style={{
                    ...styles.eventCard,
                    backgroundColor: isDark ? colors.surface : '#ffffff',
                    borderLeftColor: event.completed ? '#10B981' : event.color,
                    borderLeftWidth: 4,
                    opacity: event.completed ? 0.8 : 1,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleCompletion(event.id)}
                    style={styles.eventContent}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.eventIconContainer,
                        { backgroundColor: event.color + '20' },
                      ]}
                    >
                      <event.icon size={24} color={event.color} />
                    </View>
                    <View style={styles.eventTextContainer}>
                      <View style={styles.eventHeader}>
                        <Text
                          style={[
                            styles.eventTitle,
                            {
                              color: colors.text,
                              textDecorationLine: event.completed
                                ? 'line-through'
                                : 'none',
                            },
                          ]}
                        >
                          {event.title}
                        </Text>
                        {event.completed ? (
                          <MotiView
                            from={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                          >
                            <CheckCircle size={22} color="#10B981" />
                          </MotiView>
                        ) : (
                          <Circle size={22} color={colors.textTertiary} />
                        )}
                      </View>
                      <View style={styles.eventDetails}>
                        <Clock size={14} color={colors.textTertiary} />
                        <Text
                          style={[styles.eventTime, { color: colors.textSecondary }]}
                        >
                          {event.time} • {event.duration}
                        </Text>
                      </View>
                      <View style={styles.eventCategory}>
                        <Text
                          style={[
                            styles.eventCategoryText,
                            { color: colors.textTertiary },
                          ]}
                        >
                          {event.category}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              </View>
            </MotiView>
          ))}
        </View>
      </ScrollView>

      {/* FAB with Animation */}
      <AnimatePresence>
        {isFabOpen && (
          <View style={styles.fabMenu}>
            {fabOptions.map((option, index) => (
              <MotiView
                key={option.id}
                from={{ opacity: 0, scale: 0.5, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, translateY: 20 }}
                transition={{ delay: index * 100, type: 'spring', damping: 15 }}
                style={styles.fabOption}
              >
                <TouchableOpacity
                  style={[styles.fabOptionButton, { backgroundColor: option.color }]}
                  onPress={() => {
                    setIsFabOpen(false);
                    if (option.id === 'task') {
                      router.push('/schedule/add' as any);
                    } else if (option.id === 'medication') {
                      router.push('/medication/add' as any);
                    } else if (option.id === 'consultation') {
                      router.push('/consultation/add' as any);
                    }
                  }}
                >
                  <option.icon size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={[styles.fabOptionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
              </MotiView>
            ))}
          </View>
        )}
      </AnimatePresence>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setIsFabOpen(!isFabOpen)}
        activeOpacity={0.8}
      >
        <MotiView
          animate={{ rotate: isFabOpen ? '45deg' : '0deg' }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <Plus size={28} color="#FFFFFF" />
        </MotiView>
        {isFabOpen && (
          <MotiView
            from={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.3 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 1000, loop: true }}
            style={[styles.fabGlow, { backgroundColor: colors.primary }]}
          />
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 160,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  avatarGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    opacity: 0.4,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  dateCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
  },
  dateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTextContainer: {
    marginLeft: Spacing.sm,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  timeline: {
    paddingTop: Spacing.sm,
  },
  timelineItem: {
    paddingLeft: 20,
    paddingBottom: Spacing.md,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 6,
    top: 24,
    bottom: 0,
    width: 2,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 1,
  },
  eventCard: {
    marginLeft: Spacing.md,
    padding: Spacing.md,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventTime: {
    fontSize: 13,
    marginLeft: 4,
  },
  eventCategory: {
    marginTop: 4,
  },
  eventCategoryText: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  fabGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.3,
    zIndex: -1,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 5,
  },
  fabOption: {
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  fabOptionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  fabOptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    color: '#FFFFFF',
  },
});