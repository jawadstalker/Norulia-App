import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Play, Clock, Star } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ===== DATA (Non-translatable) =====
const weeklyMovieData = {
  year: '2013',
  duration: '1h 54m',
  rating: '7.3',
  poster: require('../../assets/movies/movie.jpg'),
};

const recommendationsData = [
  {
    id: '1',
    rating: '8.1',
    poster: require('../../assets/movies/movie.jpg'),
  },
  {
    id: '2',
    rating: '8.0',
    poster: require('../../assets/movies/movie.jpg'),
  },
  {
    id: '3',
    rating: '8.3',
    poster: require('../../assets/movies/movie.jpg'),
  },
];

export default function CulturalScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  // ===== Combine translatable text with data =====
  const weeklyMovie = {
    ...weeklyMovieData,
    title: t.weeklyMovieTitle,
    genre: t.weeklyMovieGenre,
    description: t.weeklyMovieDescription,
    reason: t.weeklyMovieReason,
  };

  const recommendationTexts = [
    { title: t.rec1Title, genre: t.rec1Genre },
    { title: t.rec2Title, genre: t.rec2Genre },
    { title: t.rec3Title, genre: t.rec3Genre },
  ];

  const recommendations = recommendationsData.map((movie, index) => ({
    ...movie,
    ...recommendationTexts[index],
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}  // ✅ اصلاح شد
        >
          <ChevronIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.weeklyCinema}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Hero Section */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.heroContainer}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent || colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroBadge}>{t.thisWeeksPick}</Text>
            <Text style={styles.heroTitle}>{weeklyMovie.title}</Text>
            <Text style={styles.heroGenre}>{weeklyMovie.genre}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.metaItem}>
                <Clock size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{weeklyMovie.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Star size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.metaText}>{weeklyMovie.rating}</Text>
              </View>
              <Text style={styles.metaText}>{weeklyMovie.year}</Text>
            </View>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => {}}
              activeOpacity={0.8}
            >
              <Text style={styles.exploreButtonText}>{t.exploreMovie}</Text>
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Image source={weeklyMovie.poster} style={styles.heroPoster} />
        </LinearGradient>
      </MotiView>

      {/* Why This Movie */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 150 }}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t.whyThisMovie}
        </Text>
        <View style={[styles.reasonCard, { backgroundColor: colors.surface }]}>  {/* ✅ اصلاح شد */}
          <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
            {weeklyMovie.reason}
          </Text>
        </View>
      </MotiView>

      {/* Recommendations */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500, delay: 300 }}
        style={styles.section}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t.moreForYou}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {t.moviesBasedOnInterests}
            </Text>
          </View>
          <TouchableOpacity onPress={() => {}}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>
              {t.seeAll}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendationsList}
        >
          {recommendations.map((movie, index) => (
            <MotiView
              key={movie.id}
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 400, delay: 400 + index * 100 }}
              style={styles.recommendationCard}
            >
              <TouchableOpacity onPress={() => {}} activeOpacity={0.8}>
                <Image source={movie.poster} style={styles.recPoster} />
                <View style={[styles.recRating, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                  <Star size={12} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.recRatingText}>{movie.rating}</Text>
                </View>
                <Text style={[styles.recTitle, { color: colors.text }]} numberOfLines={1}>
                  {movie.title}
                </Text>
                <Text style={[styles.recGenre, { color: colors.textSecondary }]} numberOfLines={1}>
                  {movie.genre}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  heroContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  heroGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    minHeight: 200,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroGenre: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  exploreButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroPoster: {
    width: 80,
    height: 120,
    borderRadius: 12,
    marginLeft: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reasonCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 22,
  },
  recommendationsList: {
    gap: 12,
    paddingRight: Spacing.lg,
  },
  recommendationCard: {
    width: 140,
    marginRight: 12,
  },
  recPoster: {
    width: 140,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  recRating: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  recRatingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  recGenre: {
    fontSize: 12,
  },
});