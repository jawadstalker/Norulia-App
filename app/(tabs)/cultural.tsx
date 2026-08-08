import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  Sparkles,
  Brain,
  ChevronRight,
  Film,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const weeklyMovie = {
  title: 'The Secret Life of Walter Mitty',
  year: '2013',
  duration: '1h 54m',
  rating: '7.3',
  genre: 'Adventure • Comedy • Drama',
  description:
    'A visually beautiful journey about escaping routine, discovering courage, and finding meaning in everyday life.',
  reason:
    'This week’s selection is designed to inspire curiosity, reduce mental fatigue, and encourage a more positive perspective.',
  poster: require('../../assets/movies/movie.jpg'),
};

const recommendations = [
  {
    id: '1',
    title: 'Inside Out',
    genre: 'Animation • Family',
    rating: '8.1',
    poster: require('../../assets/movies/movie.jpg'),
  },
  {
    id: '2',
    title: 'Soul',
    genre: 'Animation • Drama',
    rating: '8.0',
    poster: require('../../assets/movies/movie.jpg'),
  },
  {
    id: '3',
    title: 'Good Will Hunting',
    genre: 'Drama',
    rating: '8.3',
    poster: require('../../assets/movies/movie.jpg'),
  },
];

export default function CulturalScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#211A38', '#151226', '#100E1B']
          : ['#F4F0FF', '#FAF9FF', '#FFFFFF']
      }
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: colors.surface }]}
      >
        <ArrowLeft size={22} color={colors.text} />
        <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 500 }}
        >
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Film size={22} color={colors.primary} />
                <Text style={[styles.title, { color: colors.text }]}>
                  Weekly Cinema
                </Text>
              </View>

              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                A movie selected for your cognitive wellness
              </Text>
            </View>

            <View
              style={[styles.avatarContainer, { backgroundColor: colors.primary }]}
            >
              <Image
                source={require('../../assets/avatars/model 2.jpg')}
                style={styles.avatar}
              />
            </View>
          </View>
        </MotiView>

        {/* Weekly Label */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 150 }}
        >
          <View
            style={[
              styles.weekBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(167,139,250,0.15)'
                  : 'rgba(124,58,237,0.08)',
              },
            ]}
          >
            <Sparkles size={16} color={colors.primary} />
            <Text style={[styles.weekBadgeText, { color: colors.primary }]}>
              THIS WEEK'S PICK
            </Text>
          </View>
        </MotiView>

        {/* Featured Movie */}
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.96 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 140, delay: 250 }}
        >
          <View
            style={[
              styles.featuredCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Image source={weeklyMovie.poster} style={styles.poster} />

            <LinearGradient
              colors={[
                'transparent',
                isDark ? 'rgba(26,24,37,0.75)' : 'rgba(255,255,255,0.7)',
              ]}
              style={styles.posterOverlay}
            />

            <View style={styles.featuredContent}>
              <Text style={[styles.movieTitle, { color: colors.text }]}>
                {weeklyMovie.title}
              </Text>

              <Text style={[styles.movieMeta, { color: colors.textSecondary }]}>
                {weeklyMovie.year} • {weeklyMovie.genre}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Star size={15} color={colors.warning} fill={colors.warning} />
                  <Text style={[styles.statText, { color: colors.text }]}>
                    {weeklyMovie.rating}
                  </Text>
                </View>

                <View style={styles.stat}>
                  <Clock size={15} color={colors.textSecondary} />
                  <Text style={[styles.statText, { color: colors.textSecondary }]}>
                    {weeklyMovie.duration}
                  </Text>
                </View>
              </View>

              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {weeklyMovie.description}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.watchButton, { backgroundColor: colors.primary }]}
              >
                <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.watchButtonText}>Explore Movie</Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* Why this movie */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
        >
          <View
            style={[
              styles.reasonCard,
              {
                backgroundColor: isDark
                  ? 'rgba(167,139,250,0.10)'
                  : 'rgba(124,58,237,0.06)',
                borderColor: isDark
                  ? 'rgba(167,139,250,0.2)'
                  : 'rgba(124,58,237,0.12)',
              },
            ]}
          >
            <View style={[styles.reasonIcon, { backgroundColor: colors.primary }]}>
              <Brain size={20} color="#FFFFFF" />
            </View>

            <View style={styles.reasonContent}>
              <Text style={[styles.reasonTitle, { color: colors.text }]}>
                Why this movie?
              </Text>
              <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                {weeklyMovie.reason}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* Recommendations */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              More for you
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Movies selected based on your interests
            </Text>
          </View>

          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {recommendations.map((movie, index) => (
            <MotiView
              key={movie.id}
              from={{ opacity: 0, translateX: 30 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: 500 + index * 100 }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.movieCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Image source={movie.poster} style={styles.smallPoster} />

                <View style={styles.movieCardContent}>
                  <Text
                    numberOfLines={1}
                    style={[styles.smallMovieTitle, { color: colors.text }]}
                  >
                    {movie.title}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[styles.smallMovieGenre, { color: colors.textSecondary }]}
                  >
                    {movie.genre}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Star size={13} color={colors.warning} fill={colors.warning} />
                    <Text style={[styles.ratingText, { color: colors.text }]}>
                      {movie.rating}
                    </Text>
                    <ChevronRight
                      size={16}
                      color={colors.textTertiary}
                      style={styles.chevron}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: Spacing.xxl,
    marginLeft: Spacing.lg,
    marginBottom: -Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 6,
    maxWidth: 270,
    lineHeight: 19,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: 48,
    height: 48,
  },
  weekBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  weekBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  featuredCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  poster: {
    width: '100%',
    height: 270,
  },
  posterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 160,
    height: 110,
  },
  featuredContent: {
    padding: Spacing.lg,
  },
  movieTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  movieMeta: {
    fontSize: 13,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 18,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: Spacing.md,
  },
  watchButton: {
    height: 48,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: 8,
  },
  watchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reasonCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  horizontalList: {
    paddingRight: Spacing.lg,
  },
  movieCard: {
    width: 180,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: Spacing.md,
  },
  smallPoster: {
    width: '100%',
    height: 220,
  },
  movieCardContent: {
    padding: Spacing.sm + 2,
  },
  smallMovieTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  smallMovieGenre: {
    fontSize: 11,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  chevron: {
    marginLeft: 'auto',
  },
  bottomSpace: {
    height: 100,
  },
});