import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import {
  ArrowLeft,
  Brain,
  Clock,
  Heart,
  Compass,
  ChevronLeft,
  Play,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import { Card } from '../../components/ui/Card';

/* ================================================================
   CATEGORIES
================================================================ */

const categories = [
  {
    id: 'psychological',
    title: 'Psychological Games',
    titleFa: 'بازی‌های روانشناختی',
    description:
      'Train your memory, attention and cognitive skills',
    descriptionFa:
      'حافظه، توجه و مهارت‌های شناختی خود را تقویت کنید',
    icon: Brain,
  },
  {
    id: 'stress',
    title: 'Anti-Stress Games',
    titleFa: 'بازی‌های ضد استرس',
    description:
      'Relax your mind and reduce stress',
    descriptionFa:
      'ذهن خود را آرام کنید و استرس را کاهش دهید',
    icon: Heart,
  },
  {
    id: 'adventure',
    title: 'Adventure Games',
    titleFa: 'بازی‌های ماجراجویی',
    description:
      'Explore new worlds and enjoy exciting challenges',
    descriptionFa:
      'دنیاهای جدید را کشف کنید و از چالش‌های هیجان‌انگیز لذت ببرید',
    icon: Compass,
  },
];

/* ================================================================
   GAMES
================================================================ */

const games = [
  {
    id: '1',
    category: 'psychological',
    title: 'Memory Challenge',
    titleFa: 'چالش حافظه',
    description:
      'Improve memory and cognitive skills',
    descriptionFa:
      'بهبود حافظه و مهارت‌های شناختی',
    image: require('../../assets/games/game3.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '5 min',
    timeFa: '۵ دقیقه',
    route: '/games/memory-challenge',
  },

  {
    id: '2',
    category: 'psychological',
    title: 'Last Survival',
    titleFa: 'آخرین بازمانده',
    description:
      'Train attention and concentration',
    descriptionFa:
      'تمرین توجه و تمرکز',
    image: require('../../assets/games/game2.png'),
    level: 'Medium',
    levelFa: 'متوسط',
    time: '10 min',
    timeFa: '۱۰ دقیقه',
    route: '/games/last-survival',
  },

  {
    id: '3',
    category: 'psychological',
    title: 'Size Discrimination',
    titleFa: 'تشخیص اندازه',
    description: 'Improve reaction speed',
    descriptionFa: 'بهبود قدرت تشخیص',
    image: require('../../assets/games/game5.png'),
    level: 'Hard',
    levelFa: 'سخت',
    time: '7 min',
    timeFa: '۷ دقیقه',
    route: '/games/size-discrimination',
  },

  {
    id: '4',
    category: 'stress',
    title: 'Visual Flow',
    titleFa: 'جریان بصری',
    description: 'Focus on visual flow',
    descriptionFa: 'افزایش قدرت بصری',
    image: require('../../assets/games/game4.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '5 min',
    timeFa: '۵ دقیقه',
    route: '/games/visual-flow',
  },

  {
    id: '6',
    category: 'stress',
    title: 'Relaxing Garden',
    titleFa: 'باغ آرامش',
    description:
      'Enjoy a peaceful relaxing experience',
    descriptionFa:
      'یک تجربه آرام و لذت‌بخش را تجربه کنید',
    image: require('../../assets/games/game6.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '10 min',
    timeFa: '۱۰ دقیقه',
    route: '/games/Relaxe',
  },

  {
    id: '10',
    category: 'adventure',
    title: 'Lost Island',
    titleFa: 'جزیره گمشده',
    description:
      'Explore a mysterious island',
    descriptionFa:
      'یک جزیره مرموز را کشف کنید',
    image: require('../../assets/games/game4.png'),
    level: 'Medium',
    levelFa: 'متوسط',
    time: '15 min',
    timeFa: '۱۵ دقیقه',
    route: '/games/lost-island',
  },

  {
    id: '12',
    category: 'adventure',
    title: 'Noru Puzzle',
    titleFa: 'پازل نورو',
    description:
      'Enter a mysterious psychological puzzle adventure',
    descriptionFa:
      'وارد یک ماجراجویی پازلی و روانشناختی مرموز شوید',
    image: require('../../assets/games/game3.png'),
    level: 'Medium',
    levelFa: 'متوسط',
    time: '15 min',
    timeFa: '۱۵ دقیقه',
    route: 'external:noru-puzzle',
  },
];

/* ================================================================
   HEADER
================================================================ */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  colors: any;
  isRTL: boolean;
  isDark: boolean;
  backLabel?: string;
}

function PageHeader({
  title,
  subtitle,
  onBack,
  colors,
  isRTL,
  isDark,
  backLabel = 'Back',
}: PageHeaderProps) {
  return (
    <View
      style={[
        styles.pageHeader,
        {
          borderBottomColor: isDark
            ? 'rgba(255,255,255,0.06)'
            : colors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={[
          styles.unifiedBackButton,
          {
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.06)'
              : colors.surface,
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
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

      <View
        style={[
          styles.pageHeaderText,
          {
            alignItems: isRTL
              ? 'flex-end'
              : 'flex-start',
          },
        ]}
      >
        <Text
          style={[
            styles.pageHeaderTitle,
            {
              color: colors.text,
              textAlign: isRTL
                ? 'right'
                : 'left',
            },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.pageHeaderSubtitle,
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

/* ================================================================
   MAIN SCREEN
================================================================ */

export default function PsychoScreen() {
  const { colors, isDark } = useTheme();

  const {
    t,
    language,
    isRTL,
  } = useLanguage();

  const router = useRouter();

  const { category } =
    useLocalSearchParams<{
      category?: string;
    }>();

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<string | null>(
    category === 'stress'
      ? 'stress'
      : null,
  );

  const textAlignStyle = isRTL
    ? 'right'
    : 'left';

  useEffect(() => {
    if (category === 'stress') {
      setSelectedCategory('stress');
    }
  }, [category]);

  /* ================================================================
     GAME HELPERS
  ================================================================ */

  const getGameTitle = (
    game: typeof games[number],
  ) => {
    return language === 'fa'
      ? game.titleFa
      : game.title;
  };

  const getGameDescription = (
    game: typeof games[number],
  ) => {
    return language === 'fa'
      ? game.descriptionFa
      : game.description;
  };

  const getGameLevel = (
    game: typeof games[number],
  ) => {
    return language === 'fa'
      ? game.levelFa
      : game.level;
  };

  const getGameTime = (
    game: typeof games[number],
  ) => {
    return language === 'fa'
      ? game.timeFa
      : game.time;
  };

  /* ================================================================
     OPEN NORU PUZZLE
  ================================================================ */

  const openNoruPuzzle = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        language === 'fa'
          ? 'فقط اندروید'
          : 'Android Only',
        language === 'fa'
          ? 'Noru Puzzle در حال حاضر فقط برای اندروید در دسترس است.'
          : 'Noru Puzzle is currently available on Android only.',
      );

      return;
    }

    const packageName =
      'com.IliyaPardazesh.NoruPuzzle';

    const intentUrl =
      `intent:#Intent;package=${packageName};end`;

    try {
      await Linking.openURL(intentUrl);
    } catch (error) {
      console.error(
        'Failed to open Noru Puzzle:',
        error,
      );

      Alert.alert(
        language === 'fa'
          ? 'بازی نصب نیست'
          : 'Game Not Installed',
        language === 'fa'
          ? 'برای اجرای پازل نورو ابتدا بازی را روی دستگاه نصب کنید.'
          : 'Please install Noru Puzzle before launching it.',
      );
    }
  };

  /* ================================================================
     FILTERED GAMES
  ================================================================ */

  const filteredGames = games.filter(
    (game) =>
      game.category ===
      selectedCategory,
  );

  /* ================================================================
     BACK
  ================================================================ */

  const handleBack = () => {
    setSelectedCategory(null);
  };

  /* ================================================================
     CATEGORY PAGE
  ================================================================ */

  if (!selectedCategory) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <PageHeader
          title={
            language === 'fa'
              ? 'بازی‌ها'
              : 'Games'
          }
          subtitle={
            language === 'fa'
              ? 'دسته مورد نظر خود را انتخاب کنید'
              : 'Choose a game category'
          }
          onBack={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          colors={colors}
          isRTL={isRTL}
          isDark={isDark}
          backLabel={t.back}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.content
          }
        >
          {categories.map((categoryItem) => {
            const Icon = categoryItem.icon;

            return (
              <TouchableOpacity
                key={categoryItem.id}
                activeOpacity={0.88}
                onPress={() =>
                  setSelectedCategory(
                    categoryItem.id,
                  )
                }
              >
                <Card
                  style={StyleSheet.flatten([
                    styles.categoryCard,
                    {
                      backgroundColor:
                        isDark
                          ? colors.surface
                          : '#FFFFFF',
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.07)'
                        : 'rgba(0,0,0,0.04)',
                      shadowColor: isDark
                        ? '#000000'
                        : colors.primary,
                    },
                  ])}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          isDark
                            ? `${colors.primary}20`
                            : `${colors.primary}14`,
                        borderColor: isDark
                          ? `${colors.primary}35`
                          : `${colors.primary}20`,
                      },
                    ]}
                  >
                    <Icon
                      size={31}
                      color={
                        colors.primary
                      }
                      strokeWidth={2.1}
                    />
                  </View>

                  <View
                    style={[
                      styles.categoryInfo,
                      {
                        alignItems:
                          isRTL
                            ? 'flex-end'
                            : 'flex-start',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTitle,
                        {
                          color:
                            colors.text,
                          textAlign:
                            textAlignStyle,
                        },
                      ]}
                    >
                      {language === 'fa'
                        ? categoryItem.titleFa
                        : categoryItem.title}
                    </Text>

                    <Text
                      style={[
                        styles.categoryDescription,
                        {
                          color:
                            colors.textSecondary,
                          textAlign:
                            textAlignStyle,
                        },
                      ]}
                    >
                      {language === 'fa'
                        ? categoryItem.descriptionFa
                        : categoryItem.description}
                    </Text>
                  </View>

                  <ChevronLeft
                    size={21}
                    color={
                      colors.textSecondary
                    }
                    strokeWidth={2.2}
                    style={
                      isRTL
                        ? {
                            transform: [
                              {
                                rotate:
                                  '180deg',
                              },
                            ],
                          }
                        : undefined
                    }
                  />
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     SELECTED CATEGORY
  ================================================================ */

  const selectedCategoryData =
    categories.find(
      (categoryItem) =>
        categoryItem.id ===
        selectedCategory,
    );

  /* ================================================================
     GAMES PAGE
  ================================================================ */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <PageHeader
        title={
          language === 'fa'
            ? selectedCategoryData?.titleFa ||
              ''
            : selectedCategoryData?.title ||
              ''
        }
        subtitle={`${filteredGames.length} ${
          language === 'fa'
            ? 'بازی'
            : 'games'
        }`}
        onBack={handleBack}
        colors={colors}
        isRTL={isRTL}
        isDark={isDark}
        backLabel={t.back}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {filteredGames.map((game) => (
          <Card
            key={game.id}
            style={StyleSheet.flatten([
              styles.card,
              {
                backgroundColor:
                  isDark
                    ? colors.surface
                    : '#FFFFFF',
                borderColor: isDark
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(0,0,0,0.04)',
                shadowColor: isDark
                  ? '#000000'
                  : colors.primary,
              },
            ])}
          >
            <View style={styles.coverWrapper}>
              <Image
                source={game.image}
                style={styles.cover}
                resizeMode="cover"
              />

              <View
                style={[
                  styles.coverOverlay,
                  {
                    backgroundColor:
                      isDark
                        ? 'rgba(0,0,0,0.10)'
                        : 'rgba(0,0,0,0.02)',
                  },
                ]}
              />
            </View>

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
                {getGameTitle(game)}
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
                {getGameDescription(
                  game,
                )}
              </Text>

              <View
                style={[
                  styles.details,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <View
                  style={
                    styles.detailItem
                  }
                >
                  <View
                    style={[
                      styles.detailIcon,
                      {
                        backgroundColor:
                          isDark
                            ? `${colors.primary}20`
                            : `${colors.primary}12`,
                      },
                    ]}
                  >
                    <Brain
                      size={15}
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {getGameLevel(game)}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailItem
                  }
                >
                  <View
                    style={[
                      styles.detailIcon,
                      {
                        backgroundColor:
                          isDark
                            ? `${colors.primary}20`
                            : `${colors.primary}12`,
                      },
                    ]}
                  >
                    <Clock
                      size={15}
                      color={
                        colors.primary
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {getGameTime(game)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() => {
                  if (
                    game.route ===
                    'external:noru-puzzle'
                  ) {
                    openNoruPuzzle();
                    return;
                  }

                  router.push(
                    game.route as any,
                  );
                }}
                activeOpacity={0.82}
              >
                <Play
                  size={17}
                  color="#FFFFFF"
                  fill="#FFFFFF"
                  strokeWidth={2}
                />

                <Text
                  style={[
                    styles.buttonText,
                    {
                      marginLeft:
                        isRTL ? 0 : 7,
                      marginRight:
                        isRTL ? 7 : 0,
                    },
                  ]}
                >
                  {t.startGame}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ================================================================
     HEADER
  ================================================================ */

  pageHeader: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: 58,
    paddingBottom: 15,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  unifiedBackButton: {
    width: 44,
    height: 44,

    borderRadius: 14,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,

    marginRight: 12,
  },

  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  pageHeaderTitle: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },

  pageHeaderSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },

  /* ================================================================
     CONTENT
  ================================================================ */

  content: {
    paddingTop: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 110,
  },

  /* ================================================================
     CATEGORY CARDS
  ================================================================ */

  categoryCard: {
    minHeight: 120,
    marginBottom: Spacing.md,
    padding: Spacing.md,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderRadius: 20,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowRadius: 14,
    shadowOpacity: 0.08,

    elevation: 2,
  },

  categoryIcon: {
    width: 62,
    height: 62,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,

    borderWidth: 1,
  },

  categoryInfo: {
    flex: 1,
    minWidth: 0,

    marginHorizontal: 14,
  },

  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },

  categoryDescription: {
    fontSize: 13,
    marginTop: 5,
    lineHeight: 19,
  },

  /* ================================================================
     GAME CARD
  ================================================================ */

  card: {
    marginBottom: Spacing.lg,

    overflow: 'hidden',

    borderRadius: 20,
    borderWidth: 1,

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowRadius: 16,
    shadowOpacity: 0.09,

    elevation: 3,
  },

  coverWrapper: {
    width: '100%',
    height: 175,

    overflow: 'hidden',

    backgroundColor: '#111111',
  },

  cover: {
    width: '100%',
    height: '100%',
  },

  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  /* ================================================================
     GAME INFO
  ================================================================ */

  info: {
    padding: Spacing.md,
  },

  gameTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },

  description: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 21,
  },

  /* ================================================================
     DETAILS
  ================================================================ */

  details: {
    marginTop: Spacing.md,
    alignItems: 'center',
    gap: 18,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  detailIcon: {
    width: 28,
    height: 28,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',
  },

  detailText: {
    fontSize: 13,
    fontWeight: '500',
  },

  /* ================================================================
     START BUTTON
  ================================================================ */

  button: {
    marginTop: Spacing.md,

    minHeight: 48,

    paddingHorizontal: 18,

    borderRadius:
      BorderRadius.full,

    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});