import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Brain,
  Clock,
  Languages,
  ChevronLeft,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import { Card } from '../../components/ui/Card';

// --------------------------------------------------
// DATA
// --------------------------------------------------

const bilingualGames = [
  {
    id: 'word',
    title: 'Word Puzzle',
    titleFa: 'جمله بندی',
    description: 'Build sentences and improve your language skills',
    descriptionFa: 'جمله‌ها را بساز و مهارت زبانی خود را تقویت کن',
    image: require('../../assets/games/game8.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '10 min',
    timeFa: '۱۰ دقیقه',
    route: '/games/Word',
  },
  {
    id: 'memory-bilingual',
    title: 'Bilingual Memory',
    titleFa: 'حافظه دوزبانه',
    description: 'Train your memory with two languages',
    descriptionFa: 'حافظه خود را با دو زبان تقویت کن',
    image: require('../../assets/games/game3.png'),
    level: 'Medium',
    levelFa: 'متوسط',
    time: '8 min',
    timeFa: '۸ دقیقه',
    route: '/games/memory-challenge',
  },
  {
    id: 'language-challenge',
    title: 'Language Challenge',
    titleFa: 'چالش زبان',
    description: 'Improve vocabulary and language recognition',
    descriptionFa: 'دایره لغات و تشخیص زبان خود را تقویت کن',
    image: require('../../assets/games/game9.png'),
    level: 'Hard',
    levelFa: 'سخت',
    time: '7 min',
    timeFa: '۷ دقیقه',
    route: '/games/stroop',
  },
];

// --------------------------------------------------
// SCREEN
// --------------------------------------------------

export default function BilingualGamesScreen() {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();

  const textAlignStyle = isRTL ? 'right' : 'left';

  const getTitle = (game: (typeof bilingualGames)[0]) => {
    return language === 'fa' ? game.titleFa : game.title;
  };

  const getDescription = (
    game: (typeof bilingualGames)[0],
  ) => {
    return language === 'fa'
      ? game.descriptionFa
      : game.description;
  };

  const getLevel = (game: (typeof bilingualGames)[0]) => {
    return language === 'fa'
      ? game.levelFa
      : game.level;
  };

  const getTime = (game: (typeof bilingualGames)[0]) => {
    return language === 'fa'
      ? game.timeFa
      : game.time;
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            flexDirection: isRTL
              ? 'row-reverse'
              : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.headerTitleContainer,
            {
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
            },
          ]}
        >
          <View
            style={[
              styles.titleRow,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor:
                    colors.primary + '18',
                },
              ]}
            >
              <Languages
                size={22}
                color={colors.primary}
              />
            </View>

            <View
              style={[
                styles.titleTextContainer,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: colors.text,
                    textAlign: textAlignStyle,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'بازی‌های دوزبانه'
                  : 'Bilingual Games'}
              </Text>

              <Text
                style={[
                  styles.headerSubtitle,
                  {
                    color:
                      colors.textSecondary,
                    textAlign: textAlignStyle,
                  },
                ]}
              >
                {bilingualGames.length}{' '}
                {language === 'fa'
                  ? 'بازی'
                  : 'games'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={[
            styles.backButton,
            {
              backgroundColor:
                colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ArrowLeft
            size={21}
            color={colors.text}
            style={
              isRTL
                ? {
                    transform: [
                      {
                        scaleX: -1,
                      },
                    ],
                  }
                : undefined
            }
          />
        </TouchableOpacity>
      </View>

      {/* INTRO */}

      <View
        style={[
          styles.introCard,
          {
            backgroundColor:
              colors.primary + '0C',
            borderColor:
              colors.primary + '20',
          },
        ]}
      >
        <View
          style={[
            styles.introIcon,
            {
              backgroundColor:
                colors.primary + '18',
            },
          ]}
        >
          <Languages
            size={24}
            color={colors.primary}
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
                textAlign: textAlignStyle,
              },
            ]}
          >
            {language === 'fa'
              ? 'یادگیری با بازی'
              : 'Learn Through Games'}
          </Text>

          <Text
            style={[
              styles.introDescription,
              {
                color:
                  colors.textSecondary,
                textAlign: textAlignStyle,
              },
            ]}
          >
            {language === 'fa'
              ? 'مهارت‌های زبانی، حافظه و تمرکز خود را با بازی‌های دوزبانه تقویت کنید.'
              : 'Improve your language, memory and attention skills through bilingual games.'}
          </Text>
        </View>
      </View>

      {/* GAMES */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {bilingualGames.map(game => (
          <Card
            key={game.id}
            style={styles.card}
          >
            {/* IMAGE */}

            <Image
              source={game.image}
              style={styles.cover}
              resizeMode="cover"
            />

            {/* INFO */}

            <View style={styles.info}>
              <Text
                style={[
                  styles.gameTitle,
                  {
                    color: colors.text,
                    textAlign:
                      textAlignStyle,
                  },
                ]}
              >
                {getTitle(game)}
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    color:
                      colors.textSecondary,
                    textAlign:
                      textAlignStyle,
                  },
                ]}
              >
                {getDescription(game)}
              </Text>

              {/* DETAILS */}

              <View
                style={[
                  styles.details,
                  {
                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <View
                  style={[
                    styles.detailItem,
                    {
                      flexDirection:
                        isRTL
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                >
                  <Brain
                    size={16}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {getLevel(game)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailItem,
                    {
                      flexDirection:
                        isRTL
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                >
                  <Clock
                    size={16}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {getTime(game)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailItem,
                    {
                      flexDirection:
                        isRTL
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                >
                  <Languages
                    size={16}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? 'دوزبانه'
                      : 'Bilingual'}
                  </Text>
                </View>
              </View>

              {/* START BUTTON */}

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  router.push(
                    game.route as any,
                  )
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  {t.startGame ||
                    (language === 'fa'
                      ? 'شروع بازی'
                      : 'Start Game')}
                </Text>

                <ChevronLeft
                  size={18}
                  color="#FFFFFF"
                  style={
                    isRTL
                      ? {
                          transform: [
                            {
                              rotate:
                                '0deg',
                            },
                          ],
                        }
                      : {
                          transform: [
                            {
                              rotate:
                                '180deg',
                            },
                          ],
                        }
                  }
                />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ------------------------------------------------
  // HEADER
  // ------------------------------------------------

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop:
      Spacing.lg + 35,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitleContainer: {
    flex: 1,
  },

  titleRow: {
    alignItems: 'center',
    gap: 10,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ------------------------------------------------
  // INTRO
  // ------------------------------------------------

  introCard: {
    marginHorizontal: Spacing.lg,
    marginTop: 6,
    marginBottom: 5,
    padding: 15,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },

  introIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  introTextContainer: {
    flex: 1,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  introDescription: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 4,
  },

  // ------------------------------------------------
  // CONTENT
  // ------------------------------------------------

  content: {
    paddingTop: 15,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  // ------------------------------------------------
  // GAME CARD
  // ------------------------------------------------

  card: {
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderRadius: 20,
  },

  cover: {
    width: '100%',
    height: 175,
    borderRadius: 18,
  },

  info: {
    padding: Spacing.md,
  },

  gameTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  description: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
  },

  // ------------------------------------------------
  // DETAILS
  // ------------------------------------------------

  details: {
    marginTop: Spacing.md,
    gap: 14,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  detailItem: {
    alignItems: 'center',
    gap: 5,
  },

  detailText: {
    fontSize: 12,
  },

  // ------------------------------------------------
  // BUTTON
  // ------------------------------------------------

  button: {
    marginTop: Spacing.md,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: 6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});