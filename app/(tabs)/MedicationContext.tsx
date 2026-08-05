import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';
import { ArrowLeft, Calendar, CheckCircle, Clock, Pill } from 'lucide-react-native';

export default function MedicationHistory() {
  const { colors } = useTheme();
  const router = useRouter();

  // نمونه داده تاریخچه
  const historyData = [
    {
      month: 'August 2026',
      medications: [
        { name: 'Donepezil', time: '08:00', taken: true },
        { name: 'Memantine', time: '20:00', taken: true },
        { name: 'Vitamin D3', time: '12:00', taken: false },
      ],
    },
    {
      month: 'July 2026',
      medications: [
        { name: 'Donepezil', time: '08:00', taken: true },
        { name: 'Memantine', time: '20:00', taken: true },
        { name: 'Vitamin D3', time: '12:00', taken: true },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Medication History 📋
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {historyData.map((monthData, index) => (
          <View key={index} style={styles.monthSection}>
            <View style={styles.monthHeader}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.monthTitle, { color: colors.text }]}>
                {monthData.month}
              </Text>
            </View>

            {monthData.medications.map((med, medIndex) => (
              <View
                key={medIndex}
                style={[
                  styles.historyItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.historyIcon}>
                  <Pill size={20} color={colors.primary} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyName, { color: colors.text }]}>
                    {med.name}
                  </Text>
                  <View style={styles.historyTime}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={[styles.historyTimeText, { color: colors.textSecondary }]}>
                      {med.time}
                    </Text>
                  </View>
                </View>
                {med.taken ? (
                  <CheckCircle size={22} color="#10B981" />
                ) : (
                  <View style={styles.missedBadge}>
                    <Text style={styles.missedText}>Missed</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  monthSection: {
    marginBottom: Spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  historyTimeText: {
    fontSize: 13,
  },
  missedBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  missedText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
});