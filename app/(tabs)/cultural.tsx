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
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const weeklyMovie = {
  title: 'The Odyssey',
  year: '2026',
  duration: '2h 45m',
  rating: '8.9',
  genre: 'Adventure • Epic • Fantasy',
  description:
    'A visually breathtaking journey through ancient Greek mythology, exploring themes of heroism, fate, and the human spirit.',
  reason:
    'This week’s selection is designed to inspire curiosity, reduce mental fatigue, and encourage a more positive perspective.',
  poster: require('../../assets/movies/movie1.jpg'),
};

const recommendations = [
  {
    id: '1',
    title: 'The Sandman',
    genre: 'Fantasy • Drama • Mystery',
    rating: '8.2',
    poster: require('../../assets/movies/movie2.jpg'),
  },
  {
    id: '2',
    title: 'Spider-Man: No Way Home',
    genre: 'Action • Adventure • Superhero',
    rating: '8.7',
    poster: require('../../assets/movies/movie.jpg'),
  },
  {
    id: '3',
    title: 'Shutter Island',
    genre: 'Mystery • Thriller • Drama',
    rating: '8.2',
    poster: require('../../assets/movies/movie3.jpg'),
  },
];

export default function CulturalScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const textAlign = isRTL ? 'right' : 'left';
  const rowDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#211A38', '#151226', '#100E1B']
          : ['#F4F0FF', '#FAF9FF', '#FFFFFF']
      }
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ============================================================= */}
        {/* HEADER                                                         */}
        {/* ============================================================= */}

        <MotiView
          from={{
            opacity: 0,
            translateY: -15,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
          }}
          style={styles.header}
        >
          <View
            style={[
              styles.headerRow,
              {
                flexDirection: rowDirection,
              },
            ]}
          >
            {/* Title */}
            <View
              style={[
                styles.headerTextContainer,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <View
                style={[
                  styles.titleRow,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View
                  style={[
                    styles.titleIconContainer,
                    {
                      backgroundColor: isDark
                        ? 'rgba(167,139,250,0.15)'
                        : 'rgba(124,58,237,0.10)',
                    },
                  ]}
                >
                  <Film
                    size={20}
                    color={colors.primary}
                    strokeWidth={2.4}
                  />
                </View>

                <Text
                  style={[
                    styles.title,
                    {
                      color: colors.text,
                      textAlign,
                    },
                  ]}
                >
                  {t.weeklyCinema || 'Weekly Cinema'}
                </Text>
              </View>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    textAlign,
                  },
                ]}
              >
                {t.weeklyCinemaSubtitle ||
                  'A movie selected for your cognitive wellness'}
              </Text>
            </View>

            {/* Back Icon */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t.back || 'Back'}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : '#FFFFFF',
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.14)'
                    : colors.border,
                },
              ]}
            >
              <ArrowLeft
                size={22}
                color={colors.text}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* ============================================================= */}
        {/* WEEKLY BADGE                                                   */}
        {/* ============================================================= */}

        <MotiView
          from={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 120,
            type: 'spring',
            damping: 16,
          }}
        >
          <View
            style={[
              styles.weekBadge,
              {
                backgroundColor: isDark
                  ? 'rgba(167,139,250,0.15)'
                  : 'rgba(124,58,237,0.08)',
                alignSelf: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <Sparkles
              size={15}
              color={colors.primary}
              strokeWidth={2.4}
            />

            <Text
              style={[
                styles.weekBadgeText,
                {
                  color: colors.primary,
                  marginLeft: isRTL ? 0 : 6,
                  marginRight: isRTL ? 6 : 0,
                },
              ]}
            >
              {t.thisWeeksPick || "THIS WEEK'S PICK"}
            </Text>
          </View>
        </MotiView>

        {/* ============================================================= */}
        {/* FEATURED MOVIE                                                 */}
        {/* ============================================================= */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 25,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: 1,
          }}
          transition={{
            type: 'spring',
            damping: 18,
            stiffness: 140,
            delay: 220,
          }}
        >
          <View
            style={[
              styles.featuredCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Image
              source={weeklyMovie.poster}
              style={styles.poster}
            />

            <LinearGradient
              colors={[
                'transparent',
                isDark
                  ? 'rgba(26,24,37,0.82)'
                  : 'rgba(255,255,255,0.75)',
              ]}
              style={styles.posterOverlay}
            />

            <View
              style={[
                styles.featuredContent,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.movieTitle,
                  {
                    color: colors.text,
                    textAlign,
                  },
                ]}
              >
                {t.weeklyMovieTitle ||
                  weeklyMovie.title}
              </Text>

              <Text
                style={[
                  styles.movieMeta,
                  {
                    color: colors.textSecondary,
                    textAlign,
                  },
                ]}
              >
                {t.weeklyMovieYear ||
                  weeklyMovie.year}{' '}
                •{' '}
                {t.weeklyMovieGenre ||
                  weeklyMovie.genre}
              </Text>

              <View
                style={[
                  styles.statsRow,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View
                  style={[
                    styles.stat,
                    {
                      flexDirection: rowDirection,
                    },
                  ]}
                >
                  <Star
                    size={15}
                    color={colors.warning}
                    fill={colors.warning}
                  />

                  <Text
                    style={[
                      styles.statText,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {weeklyMovie.rating}
                  </Text>
                </View>

                <View
                  style={[
                    styles.stat,
                    {
                      flexDirection: rowDirection,
                    },
                  ]}
                >
                  <Clock
                    size={15}
                    color={colors.textSecondary}
                  />

                  <Text
                    style={[
                      styles.statText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {weeklyMovie.duration}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.description,
                  {
                    color: colors.textSecondary,
                    textAlign,
                  },
                ]}
              >
                {t.weeklyMovieDescription ||
                  weeklyMovie.description}
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.watchButton,
                  {
                    backgroundColor: colors.primary,
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <Play
                  size={18}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                />

                <Text
                  style={[
                    styles.watchButtonText,
                    {
                      marginLeft: isRTL ? 0 : 8,
                      marginRight: isRTL ? 8 : 0,
                    },
                  ]}
                >
                  {t.exploreMovie ||
                    'Explore Movie'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

        {/* ============================================================= */}
        {/* WHY THIS MOVIE                                                 */}
        {/* ============================================================= */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 18,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 360,
            duration: 400,
          }}
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
                flexDirection: rowDirection,
              },
            ]}
          >
            <View
              style={[
                styles.reasonIcon,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Brain
                size={20}
                color="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.reasonContent,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.reasonTitle,
                  {
                    color: colors.text,
                    textAlign,
                  },
                ]}
              >
                {t.whyThisMovie ||
                  'Why this movie?'}
              </Text>

              <Text
                style={[
                  styles.reasonText,
                  {
                    color: colors.textSecondary,
                    textAlign,
                  },
                ]}
              >
                {t.weeklyMovieReason ||
                  weeklyMovie.reason}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* ============================================================= */}
        {/* RECOMMENDATIONS HEADER                                         */}
        {/* ============================================================= */}

        <View
          style={[
            styles.sectionHeader,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          <View
            style={{
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
              flex: 1,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  textAlign,
                },
              ]}
            >
              {t.moreForYou || 'More for you'}
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: colors.textSecondary,
                  textAlign,
                },
              ]}
            >
              {t.moviesBasedOnInterests ||
                'Movies selected based on your interests'}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.seeAllButton}
          >
            <Text
              style={[
                styles.seeAll,
                {
                  color: colors.primary,
                },
              ]}
            >
              {t.seeAll || 'See all'}
            </Text>

            <ChevronRight
              size={16}
              color={colors.primary}
              style={
                isRTL
                  ? {
                      transform: [
                        { scaleX: -1 },
                      ],
                    }
                  : undefined
              }
            />
          </TouchableOpacity>
        </View>

        {/* ============================================================= */}
        {/* MOVIE LIST                                                     */}
        {/* ============================================================= */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.horizontalList,
            {
              flexDirection: rowDirection,
            },
          ]}
        >
          {recommendations.map(
            (movie, index) => {
              let translatedTitle =
                movie.title;
              let translatedGenre =
                movie.genre;

              if (movie.id === '1') {
                translatedTitle =
                  t.rec1Title || movie.title;
                translatedGenre =
                  t.rec1Genre || movie.genre;
              } else if (movie.id === '2') {
                translatedTitle =
                  t.rec2Title || movie.title;
                translatedGenre =
                  t.rec2Genre || movie.genre;
              } else if (movie.id === '3') {
                translatedTitle =
                  t.rec3Title || movie.title;
                translatedGenre =
                  t.rec3Genre || movie.genre;
              }

              return (
                <MotiView
                  key={movie.id}
                  from={{
                    opacity: 0,
                    translateX: 25,
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                  }}
                  transition={{
                    delay:
                      470 + index * 100,
                  }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.movieCard,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Image
                      source={movie.poster}
                      style={styles.smallPoster}
                    />

                    <View
                      style={[
                        styles.movieCardContent,
                        {
                          alignItems: isRTL
                            ? 'flex-end'
                            : 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.smallMovieTitle,
                          {
                            color: colors.text,
                            textAlign,
                          },
                        ]}
                      >
                        {translatedTitle}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.smallMovieGenre,
                          {
                            color:
                              colors.textSecondary,
                            textAlign,
                          },
                        ]}
                      >
                        {translatedGenre}
                      </Text>

                      <View
                        style={[
                          styles.ratingRow,
                          {
                            flexDirection:
                              rowDirection,
                          },
                        ]}
                      >
                        <Star
                          size={13}
                          color={colors.warning}
                          fill={colors.warning}
                        />

                        <Text
                          style={[
                            styles.ratingText,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {movie.rating}
                        </Text>

                        <ChevronRight
                          size={16}
                          color={
                            colors.textTertiary
                          }
                          style={[
                            styles.chevron,
                            isRTL
                              ? {
                                  transform: [
                                    {
                                      scaleX:
                                        -1,
                                    },
                                  ],
                                }
                              : undefined,
                          ]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            }
          )}
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

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 40,
    paddingBottom: 100,
  },

  /* ================================================================ */
  /* HEADER                                                            */
  /* ================================================================ */

  header: {
    marginBottom: Spacing.lg,
  },

  headerRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 58,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },

  titleRow: {
    alignItems: 'center',
  },

  titleIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 9,
  },

  subtitle: {
    fontSize: 12.5,
    marginTop: 7,
    lineHeight: 18,
    maxWidth: 280,
  },

  /* ================================================================ */
  /* BACK BUTTON                                                       */
  /* ================================================================ */

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  /* ================================================================ */
  /* WEEK BADGE                                                        */
  /* ================================================================ */

  weekBadge: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },

  weekBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  /* ================================================================ */
  /* FEATURED MOVIE                                                    */
  /* ================================================================ */

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
    top: 155,
    height: 115,
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
    alignItems: 'center',
    marginTop: 12,
    gap: 18,
  },

  stat: {
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
    width: '100%',
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },

  watchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* ================================================================ */
  /* REASON CARD                                                       */
  /* ================================================================ */

  reasonCard: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    alignItems: 'flex-start',
  },

  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  reasonContent: {
    flex: 1,
    marginHorizontal: Spacing.md,
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

  /* ================================================================ */
  /* SECTION                                                           */
  /* ================================================================ */

  sectionHeader: {
    width: '100%',
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
    lineHeight: 18,
  },

  seeAllButton: {
    minHeight: 36,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* ================================================================ */
  /* MOVIE CARDS                                                       */
  /* ================================================================ */

  horizontalList: {
    paddingRight: Spacing.lg,
    paddingBottom: 4,
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
    width: '100%',
    fontSize: 14,
    fontWeight: '700',
  },

  smallMovieGenre: {
    width: '100%',
    fontSize: 11,
    marginTop: 4,
  },

  ratingRow: {
    width: '100%',
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