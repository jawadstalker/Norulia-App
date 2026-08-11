import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Play,
  Star,
  Clock,
  Sparkles,
  Brain,
  Film,
  BookOpen,
  Bookmark,
  ChevronRight,
  CalendarDays,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing } from '../../constants/theme';

// ================================================================
// DATA
// ================================================================

const weeks = [
  {
    id: 1,
    label: 'Week 1',
    shortLabel: 'W1',
    theme: 'Curiosity & Purpose',

    movie: {
      title: 'The Odyssey',
      year: '2026',
      duration: '2h 45m',
      rating: '8.9',
      genre: 'Adventure • Epic • Fantasy',
      description:
        'A visually breathtaking journey through ancient Greek mythology, exploring heroism, fate, and the human spirit.',
      poster: require('../../assets/movies/movie1.jpg'),
    },

    book: {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      genre: 'Adventure • Philosophy',
      rating: '8.1',
      description:
        'A timeless story about dreams, purpose, courage, and discovering your own path.',
      cover: require('../../assets/movies/book1.jpg'),
    },

    reason:
      'This week focuses on curiosity, imagination, purpose, and exploring new perspectives.',
  },

  {
    id: 2,
    label: 'Week 2',
    shortLabel: 'W2',
    theme: 'Meaning & Resilience',

    movie: {
      title: 'The Sandman',
      year: '2026',
      duration: '2h 18m',
      rating: '8.2',
      genre: 'Fantasy • Drama • Mystery',
      description:
        'A mysterious journey between dreams and reality where memory and identity begin to collide.',
      poster: require('../../assets/movies/movie2.jpg'),
    },

    book: {
      title: 'Man’s Search for Meaning',
      author: 'Viktor E. Frankl',
      genre: 'Psychology • Philosophy',
      rating: '8.8',
      description:
        'A powerful reflection on meaning, resilience, and the human ability to find purpose.',
      cover: require('../../assets/movies/book2.jpg'),
    },

    reason:
      'This week is designed around reflection, emotional awareness, meaning, and psychological resilience.',
  },

  {
    id: 3,
    label: 'Week 3',
    shortLabel: 'W3',
    theme: 'Choices & Growth',

    movie: {
      title: 'Spider-Man: No Way Home',
      year: '2021',
      duration: '2h 28m',
      rating: '8.7',
      genre: 'Action • Adventure • Superhero',
      description:
        'A fast-paced story about identity, responsibility, choices, and the consequences of our decisions.',
      poster: require('../../assets/movies/movie.jpg'),
    },

    book: {
      title: 'Atomic Habits',
      author: 'James Clear',
      genre: 'Self Development',
      rating: '8.6',
      description:
        'A practical exploration of how small behavioral changes can create remarkable results.',
      cover: require('../../assets/movies/book3.jpg'),
    },

    reason:
      'This week emphasizes decision-making, personal responsibility, habits, and gradual positive change.',
  },

  {
    id: 4,
    label: 'Week 4',
    shortLabel: 'W4',
    theme: 'Mind & Perception',

    movie: {
      title: 'Shutter Island',
      year: '2010',
      duration: '2h 18m',
      rating: '8.2',
      genre: 'Mystery • Thriller • Drama',
      description:
        'A psychologically intense mystery that challenges perception, memory, and the nature of reality.',
      poster: require('../../assets/movies/movie3.jpg'),
    },

    book: {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      genre: 'Psychology • Cognitive Science',
      rating: '8.4',
      description:
        'An exploration of the two systems that shape our judgments, decisions, and everyday thinking.',
      cover: require('../../assets/movies/book4.jpg'),
    },

    reason:
      'The final week encourages critical thinking, perspective taking, attention, and understanding how the mind works.',
  },
];

// ================================================================
// SHARED HEADER
// ================================================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  onBack: () => void;
  colors: any;
  isDark: boolean;
  isRTL: boolean;
  backLabel: string;
}

function PageHeader({
  title,
  subtitle,
  eyebrow,
  icon,
  onBack,
  colors,
  isDark,
  isRTL,
  backLabel,
}: PageHeaderProps) {
  return (
    <View style={styles.headerRoot}>
      {/* BACK BUTTON - ALWAYS LEFT */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={[
          styles.headerBackButton,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.08)'
              : '#FFFFFF',

            borderColor: isDark
              ? 'rgba(255,255,255,0.12)'
              : colors.border,
          },
        ]}
      >
        <ArrowLeft
          size={21}
          color={colors.text}
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      {/* TEXT AREA */}
      <View
        style={[
          styles.headerTextArea,
          {
            alignItems: isRTL
              ? 'flex-end'
              : 'flex-start',
          },
        ]}
      >
        {eyebrow ? (
          <Text
            style={[
              styles.headerEyebrow,
              {
                color: colors.primary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {eyebrow}
          </Text>
        ) : null}

        <View
          style={[
            styles.headerTitleRow,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          {icon ? (
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(167,139,250,0.16)'
                    : 'rgba(124,58,237,0.09)',
                },
              ]}
            >
              {icon}
            </View>
          ) : null}

          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',

                marginLeft:
                  isRTL || !icon ? 0 : 10,

                marginRight:
                  isRTL && icon ? 10 : 0,
              },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>

        {subtitle ? (
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ================================================================
// MAIN SCREEN
// ================================================================

export default function CulturalScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [selectedWeek, setSelectedWeek] = useState<number | null>(
    null,
  );

  const currentWeek =
    selectedWeek !== null
      ? weeks[selectedWeek]
      : null;

  // FIX: Define gradient colors properly for LinearGradient
  const gradientColors: [string, string, string] = isDark
    ? ['#211A38', '#151226', '#100E1B']
    : ['#F4F0FF', '#FAF9FF', '#FFFFFF'];

  const handleBack = () => {
    if (selectedWeek !== null) {
      setSelectedWeek(null);
    } else {
      router.back();
    }
  };

  // PAGE 1 — WEEK LIST
  if (selectedWeek === null) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <MotiView
            from={{
              opacity: 0,
              translateY: -20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              duration: 400,
            }}
          >
            <PageHeader
              title={
                t.weeklyCinema ||
                'Cultural Journey'
              }
              subtitle={
                t.weeklyCinemaSubtitle ||
                'A movie and a book selected for your cognitive wellness'
              }
              icon={
                <Film
                  size={20}
                  color={colors.primary}
                  strokeWidth={2.4}
                />
              }
              onBack={handleBack}
              colors={colors}
              isDark={isDark}
              isRTL={isRTL}
              backLabel={t.back || 'Back'}
            />
          </MotiView>

          {/* INTRO */}
          <MotiView
            from={{
              opacity: 0,
              translateY: 20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              delay: 100,
              duration: 450,
            }}
          >
            <View
              style={[
                styles.introCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(167,139,250,0.10)'
                    : 'rgba(124,58,237,0.055)',

                  borderColor: isDark
                    ? 'rgba(167,139,250,0.18)'
                    : 'rgba(124,58,237,0.10)',
                },
              ]}
            >
              <View
                style={[
                  styles.introIcon,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <Sparkles
                  size={19}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={[
                  styles.introTextContainer,
                  {
                    alignItems: isRTL
                      ? 'flex-end'
                      : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.introTitle,
                    {
                      color: colors.text,
                      textAlign: isRTL
                        ? 'right'
                        : 'left',
                    },
                  ]}
                >
                  {t.monthlyJourney ||
                    'Your 4-Week Journey'}
                </Text>

                <Text
                  style={[
                    styles.introText,
                    {
                      color:
                        colors.textSecondary,
                      textAlign: isRTL
                        ? 'right'
                        : 'left',
                    },
                  ]}
                >
                  {t.chooseWeek ||
                    'Choose a week to discover your cultural recommendations.'}
                </Text>
              </View>
            </View>
          </MotiView>

          {/* WEEKS */}
          <View style={styles.weekGrid}>
            {weeks.map((week, index) => {
              const isCurrent = index === 0;

              return (
                <MotiView
                  key={week.id}
                  from={{
                    opacity: 0,
                    translateY: 25,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                    scale: 1,
                  }}
                  transition={{
                    delay: 150 + index * 80,
                    type: 'spring',
                    damping: 16,
                    stiffness: 130,
                  }}
                  style={styles.weekGridItem}
                >
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() =>
                      setSelectedWeek(index)
                    }
                    style={[
                      styles.weekCard,
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
                        styles.weekCardTop,
                        {
                          flexDirection: isRTL
                            ? 'row-reverse'
                            : 'row',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.weekNumberCircle,
                          {
                            backgroundColor:
                              isCurrent
                                ? colors.primary
                                : isDark
                                ? 'rgba(167,139,250,0.14)'
                                : 'rgba(124,58,237,0.08)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.weekNumber,
                            {
                              color: isCurrent
                                ? '#FFFFFF'
                                : colors.primary,
                            },
                          ]}
                        >
                          {week.id}
                        </Text>
                      </View>

                      {isCurrent && (
                        <View
                          style={[
                            styles.currentBadge,
                            {
                              backgroundColor:
                                isDark
                                  ? 'rgba(167,139,250,0.14)'
                                  : 'rgba(124,58,237,0.08)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.currentBadgeText,
                              {
                                color:
                                  colors.primary,
                              },
                            ]}
                          >
                            {t.current ||
                              'START'}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.weekCardTitle,
                        {
                          color: colors.text,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {t.week || 'Week'}{' '}
                      {week.id}
                    </Text>

                    <Text
                      style={[
                        styles.weekCardTheme,
                        {
                          color: colors.primary,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {week.theme}
                    </Text>

                    <View
                      style={[
                        styles.previewRow,
                        {
                          flexDirection: isRTL
                            ? 'row-reverse'
                            : 'row',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.previewItem,
                          {
                            backgroundColor:
                              isDark
                                ? 'rgba(255,255,255,0.055)'
                                : '#F7F5FC',
                          },
                        ]}
                      >
                        <Film
                          size={16}
                          color={colors.primary}
                        />
                      </View>

                      <View
                        style={[
                          styles.previewItem,
                          {
                            backgroundColor:
                              isDark
                                ? 'rgba(255,255,255,0.055)'
                                : '#F7F5FC',
                          },
                        ]}
                      >
                        <BookOpen
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </View>

                    <View
                      style={[
                        styles.weekCardFooter,
                        {
                          flexDirection: isRTL
                            ? 'row-reverse'
                            : 'row',
                          borderTopColor:
                            colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.exploreText,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {t.explore ||
                          'Explore'}
                      </Text>

                      <ChevronRight
                        size={18}
                        color={
                          colors.primary
                        }
                      />
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Sparkles
              size={15}
              color={colors.primary}
            />

            <Text
              style={[
                styles.footerText,
                {
                  color:
                    colors.textTertiary,
                },
              ]}
            >
              {t.culturalWellness ||
                'Small moments of culture can create meaningful moments for the mind.'}
            </Text>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>
    );
  }

  // PAGE 2 — WEEK DETAIL
  // FIX: currentWeek is guaranteed not null here
  const weekData = currentWeek!;

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <MotiView
          from={{
            opacity: 0,
            translateY: -20,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            duration: 400,
          }}
        >
          <PageHeader
            title={weekData.theme}
            eyebrow={`${t.week || 'WEEK'} ${weekData.id}`}
            onBack={handleBack}
            colors={colors}
            isDark={isDark}
            isRTL={isRTL}
            backLabel={t.back || 'Back'}
          />
        </MotiView>

        {/* PROGRESS */}
        <MotiView
          from={{
            opacity: 0,
            translateY: 15,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 100,
            duration: 400,
          }}
        >
          <View style={styles.progressContainer}>
            {weeks.map((week, index) => (
              <View
                key={week.id}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor:
                      index <= selectedWeek
                        ? colors.primary
                        : isDark
                        ? 'rgba(255,255,255,0.10)'
                        : '#E8E3F0',
                  },
                ]}
              />
            ))}
          </View>
        </MotiView>

        {/* WEEK INTRO */}
        <View
          style={[
            styles.weekIntro,
            {
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
            },
          ]}
        >
          <View
            style={[
              styles.weekBadge,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',

                backgroundColor: isDark
                  ? 'rgba(167,139,250,0.13)'
                  : 'rgba(124,58,237,0.08)',
              },
            ]}
          >
            <CalendarDays
              size={15}
              color={colors.primary}
            />

            <Text
              style={[
                styles.weekBadgeText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {t.week || 'WEEK'}{' '}
              {weekData.id}
            </Text>
          </View>

          <Text
            style={[
              styles.recommendationTitle,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {t.recommendations ||
              'Your weekly recommendations'}
          </Text>

          <Text
            style={[
              styles.recommendationSubtitle,
              {
                color:
                  colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {t.culturalWellness ||
              'Take some time to explore, reflect, and discover something meaningful.'}
          </Text>
        </View>

        {/* MOVIE */}
        <MotiView
          key={`movie-${selectedWeek}`}
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
            stiffness: 130,
          }}
        >
          <View
            style={[
              styles.movieCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.cardTopRow,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.mediaLabel,
                  {
                    backgroundColor: isDark
                      ? 'rgba(167,139,250,0.13)'
                      : 'rgba(124,58,237,0.08)',

                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <Film
                  size={15}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.mediaLabelText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {t.movie || 'MOVIE'}
                </Text>
              </View>

              <View
                style={[
                  styles.rating,
                  {
                    flexDirection: 'row',
                  },
                ]}
              >
                <Star
                  size={14}
                  color={colors.warning}
                  fill={colors.warning}
                />

                <Text
                  style={[
                    styles.ratingText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {weekData.movie.rating}
                </Text>
              </View>
            </View>

            <View style={styles.posterContainer}>
              <Image
                source={weekData.movie.poster}
                style={styles.poster}
              />

              <LinearGradient
                colors={[
                  'transparent',
                  isDark
                    ? 'rgba(15,12,24,0.85)'
                    : 'rgba(255,255,255,0.88)',
                ]}
                style={styles.posterOverlay}
              />
            </View>

            <View
              style={[
                styles.movieContent,
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
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                {weekData.movie.title}
              </Text>

              <Text
                style={[
                  styles.movieMeta,
                  {
                    color:
                      colors.textSecondary,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                {weekData.movie.year} •{' '}
                {weekData.movie.genre}
              </Text>

              <View
                style={[
                  styles.statsRow,
                  {
                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <View style={styles.stat}>
                  <Clock
                    size={14}
                    color={
                      colors.textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.statText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {weekData.movie.duration}
                  </Text>
                </View>

                <View style={styles.stat}>
                  <Star
                    size={14}
                    color={colors.warning}
                    fill={colors.warning}
                  />

                  <Text
                    style={[
                      styles.statText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {weekData.movie.rating}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.description,
                  {
                    color:
                      colors.textSecondary,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                {weekData.movie.description}
              </Text>

              <TouchableOpacity
                activeOpacity={0.86}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      colors.primary,

                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <Play
                  size={16}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                />

                <Text
                  style={[
                    styles.primaryButtonText,
                    {
                      marginLeft:
                        isRTL ? 0 : 8,
                      marginRight:
                        isRTL ? 8 : 0,
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

        {/* BOOK */}
        <MotiView
          key={`book-${selectedWeek}`}
          from={{
            opacity: 0,
            translateY: 25,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            delay: 100,
            duration: 450,
          }}
        >
          <View
            style={[
              styles.bookCard,
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
                styles.cardTopRow,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.mediaLabel,
                  {
                    backgroundColor: isDark
                      ? 'rgba(167,139,250,0.13)'
                      : 'rgba(124,58,237,0.08)',

                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <BookOpen
                  size={15}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.mediaLabelText,
                    {
                      color:
                        colors.primary,
                    },
                  ]}
                >
                  {t.book || 'BOOK'}
                </Text>
              </View>

              <Bookmark
                size={18}
                color={colors.textTertiary}
              />
            </View>

            <View
              style={[
                styles.bookBody,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <Image
                source={weekData.book.cover}
                style={styles.bookCover}
              />

              <View
                style={[
                  styles.bookInfo,
                  {
                    alignItems: isRTL
                      ? 'flex-end'
                      : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bookTitle,
                    {
                      color: colors.text,
                      textAlign: isRTL
                        ? 'right'
                        : 'left',
                    },
                  ]}
                >
                  {weekData.book.title}
                </Text>

                <Text
                  style={[
                    styles.bookAuthor,
                    {
                      color:
                        colors.textSecondary,
                      textAlign: isRTL
                        ? 'right'
                        : 'left',
                    },
                  ]}
                >
                  {weekData.book.author}
                </Text>

                <Text
                  style={[
                    styles.bookGenre,
                    {
                      color:
                        colors.textTertiary,
                      textAlign: isRTL
                        ? 'right'
                        : 'left',
                    },
                  ]}
                >
                  {weekData.book.genre}
                </Text>

                <View
                  style={styles.bookRating}
                >
                  <Star
                    size={14}
                    color={colors.warning}
                    fill={colors.warning}
                  />

                  <Text
                    style={[
                      styles.bookRatingText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {weekData.book.rating}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={[
                styles.bookDescription,
                {
                  color:
                    colors.textSecondary,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {weekData.book.description}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.secondaryButton,
                {
                  borderColor:
                    colors.primary,

                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <BookOpen
                size={16}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.secondaryButtonText,
                  {
                    color:
                      colors.primary,

                    marginLeft:
                      isRTL ? 0 : 8,

                    marginRight:
                      isRTL ? 8 : 0,
                  },
                ]}
              >
                {t.exploreBook ||
                  'Explore Book'}
              </Text>

              <ChevronRight
                size={17}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* WHY THIS WEEK */}
        <View
          style={[
            styles.reasonCard,
            {
              backgroundColor: isDark
                ? 'rgba(167,139,250,0.10)'
                : 'rgba(124,58,237,0.055)',

              borderColor: isDark
                ? 'rgba(167,139,250,0.18)'
                : 'rgba(124,58,237,0.11)',

              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.reasonIcon,
              {
                backgroundColor:
                  colors.primary,
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
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {t.whyThisWeek ||
                'Why this week?'}
            </Text>

            <Text
              style={[
                styles.reasonText,
                {
                  color:
                    colors.textSecondary,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {weekData.reason}
            </Text>
          </View>
        </View>

        {/* NAVIGATION */}
        <View
          style={[
            styles.navigationRow,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          {selectedWeek > 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setSelectedWeek(
                  selectedWeek - 1,
                )
              }
              style={[
                styles.navButton,
                {
                  borderColor:
                    colors.border,
                  backgroundColor:
                    colors.surface,
                },
              ]}
            >
              <ArrowLeft
                size={17}
                color={colors.text}
              />

              <Text
                style={[
                  styles.navButtonText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.previous ||
                  'Previous'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {selectedWeek < weeks.length - 1 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setSelectedWeek(
                  selectedWeek + 1,
                )
              }
              style={[
                styles.nextButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.nextButtonText
                }
              >
                {t.next || 'Next'}
              </Text>

              <ChevronRight
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </LinearGradient>
  );
}

// ================================================================
// STYLES
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 70,
    paddingBottom: 90,
  },

  headerRoot: {
    width: '100%',
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  headerBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },

  headerTextArea: {
    flex: 1,
    minWidth: 0,
  },

  headerEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 3,
  },

  headerTitleRow: {
    alignItems: 'center',
    maxWidth: '100%',
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    flexShrink: 1,
  },

  headerSubtitle: {
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 7,
  },

  introCard: {
    width: '100%',
    minHeight: 86,
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  introTextContainer: {
    flex: 1,
    marginHorizontal: 13,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  introText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  weekGridItem: {
    width: '48.2%',
    marginBottom: 14,
  },

  weekCard: {
    minHeight: 190,
    borderRadius: 22,
    borderWidth: 1,
    padding: 15,
    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  weekCardTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  weekNumberCircle: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekNumber: {
    fontSize: 17,
    fontWeight: '900',
  },

  currentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },

  currentBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  weekCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 15,
  },

  weekCardTheme: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 4,
    lineHeight: 15,
  },

  previewRow: {
    gap: 7,
    marginTop: 15,
  },

  previewItem: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekCardFooter: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  exploreText: {
    fontSize: 10.5,
    fontWeight: '600',
  },

  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },

  footerText: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
  },

  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 23,
  },

  progressSegment: {
    height: 4,
    flex: 1,
    borderRadius: 4,
  },

  weekIntro: {
    marginBottom: 20,
  },

  weekBadge: {
    minHeight: 31,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },

  weekBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  recommendationTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
  },

  recommendationSubtitle: {
    fontSize: 12.5,
    lineHeight: 19,
    marginTop: 5,
  },

  movieCard: {
    borderRadius: 23,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },

  cardTopRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 12,
  },

  mediaLabel: {
    minHeight: 29,
    paddingHorizontal: 9,
    borderRadius: 10,
    alignItems: 'center',
    gap: 6,
  },

  mediaLabelText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  rating: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '800',
  },

  posterContainer: {
    width: '100%',
    height: 265,
    position: 'relative',
  },

  poster: {
    width: '100%',
    height: '100%',
  },

  posterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },

  movieContent: {
    padding: 17,
  },

  movieTitle: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 29,
  },

  movieMeta: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  statsRow: {
    alignItems: 'center',
    gap: 17,
    marginTop: 12,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  statText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  description: {
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 14,
  },

  primaryButton: {
    width: '100%',
    height: 47,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 17,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  bookCard: {
    borderRadius: 23,
    borderWidth: 1,
    paddingBottom: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },

  bookBody: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },

  bookCover: {
    width: 105,
    height: 150,
    borderRadius: 11,
  },

  bookInfo: {
    flex: 1,
    marginHorizontal: 14,
  },

  bookTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },

  bookAuthor: {
    fontSize: 12.5,
    marginTop: 5,
  },

  bookGenre: {
    fontSize: 10.5,
    marginTop: 7,
    lineHeight: 15,
  },

  bookRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 11,
  },

  bookRatingText: {
    fontSize: 12,
    fontWeight: '800',
  },

  bookDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginHorizontal: 15,
    marginTop: 15,
  },

  secondaryButton: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1.2,
    marginHorizontal: 15,
    marginTop: 15,
    paddingHorizontal: 14,
    alignItems: 'center',
  },

  secondaryButtonText: {
    fontSize: 12.5,
    fontWeight: '800',
  },

  reasonCard: {
    width: '100%',
    padding: 14,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'flex-start',
  },

  reasonIcon: {
    width: 41,
    height: 41,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  reasonContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  reasonTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 5,
  },

  reasonText: {
    fontSize: 12.5,
    lineHeight: 19,
  },

  navigationRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  navButton: {
    height: 43,
    minWidth: 105,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  navButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  nextButton: {
    height: 43,
    minWidth: 95,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 70,
  },
});