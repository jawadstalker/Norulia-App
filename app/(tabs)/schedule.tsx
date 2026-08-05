import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Calendar, Clock, CheckCircle, Circle, Plus, Bell, Pill, Brain, Heart, Moon } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';

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

  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Meditation Session',
      time: '09:00 AM',
      category: 'Mindfulness',
      duration: '20 min',
      completed: true,
      icon: Brain,
      color: '#6366F1'
    },
    {
      id: '2',
      title: 'Take Medication',
      time: '12:00 PM',
      category: 'Health',
      duration: '5 min',
      completed: false,
      icon: Pill,
      color: '#22C55E'
    },
    {
      id: '3',
      title: 'Therapy Session',
      time: '03:00 PM',
      category: 'Mental Health',
      duration: '45 min',
      completed: false,
      icon: Heart,
      color: '#EC4899'
    },
    {
      id: '4',
      title: 'Evening Relaxation',
      time: '08:00 PM',
      category: 'Wellness',
      duration: '30 min',
      completed: false,
      icon: Moon,
      color: '#8B5CF6'
    }
  ]);

  const toggleCompletion = (id: string) => {
    setEvents(prev =>
      prev.map(event =>
        event.id === id ? { ...event, completed: !event.completed } : event
      )
    );
  };

  const completedCount = events.filter(e => e.completed).length;
  const totalCount = events.length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getDateDisplay = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <LinearGradient
      colors={isDark ? ['#0a0a0f', '#14141e'] : ['#f0f4ff', '#ffffff']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Image
              source={require('../../assets/avatars/model3.png')}
              style={styles.avatar}
            />
          </View>

          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {getGreeting()}, Alex
          </Text>

          <Text style={[styles.title, { color: colors.text }]}>
            Daily Planner AI
          </Text>

          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
            You have {totalCount - completedCount} activities today
          </Text>
        </View>

        <Card style={{ ...styles.dateCard, backgroundColor: isDark ? colors.surface : '#ffffff' }}>
          <View style={styles.dateContent}>
            <View style={styles.dateLeft}>
              <Calendar size={24} color={colors.primary} />
              <View style={styles.dateTextContainer}>
                <Text style={[styles.dateDay, { color: colors.text }]}>{getDateDisplay()}</Text>
              </View>
            </View>
            <View style={[styles.progressCircle, { borderColor: colors.primary }]}>
              <Text style={[styles.progressText, { color: colors.primary }]}>
                {completedCount}/{totalCount}
              </Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(completedCount / totalCount) * 100}%`,
                  backgroundColor: colors.primary
                }
              ]}
            />
          </View>
        </Card>

        <View style={styles.timeline}>
          {events.map((event, index) => (
            <MotiView
              key={event.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 150, type: 'spring', damping: 15 }}
            >
              <View style={styles.timelineItem}>
                {index < events.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                )}
                <View style={[styles.timelineDot, { backgroundColor: event.color }]} />
                <Card
                  style={{
                    ...styles.eventCard,
                    backgroundColor: isDark ? colors.surface : '#ffffff',
                    borderLeftColor: event.color,
                    borderLeftWidth: 4
                  }}
                >
                  <TouchableOpacity
                    onPress={() => toggleCompletion(event.id)}
                    style={styles.eventContent}
                  >
                    <View style={[styles.eventIconContainer, { backgroundColor: event.color + '20' }]}>
                      <event.icon size={24} color={event.color} />
                    </View>
                    <View style={styles.eventTextContainer}>
                      <View style={styles.eventHeader}>
                        <Text style={[styles.eventTitle, { color: colors.text }]}>
                          {event.title}
                        </Text>
                        {event.completed ? (
                          <CheckCircle size={20} color={colors.success} />
                        ) : (
                          <Circle size={20} color={colors.textTertiary} />
                        )}
                      </View>
                      <View style={styles.eventDetails}>
                        <Clock size={14} color={colors.textTertiary} />
                        <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                          {event.time} • {event.duration}
                        </Text>
                      </View>
                      <View style={styles.eventCategory}>
                        <Text style={[styles.eventCategoryText, { color: colors.textTertiary }]}>
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => {}}
      >
        <Plus size={28} color="#FFFFFF" />
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
    paddingBottom: 120,
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
  },
});