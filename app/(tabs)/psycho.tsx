
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import {
  ArrowLeft,
  Brain,
  Clock,
  Trophy,
  Heart,
  Compass,
  ChevronLeft,
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

  // {
  //   id: '3',
  //   category: 'psychological',
  //   title: 'Stroop',
  //   titleFa: 'تست واکنش',
  //   description: 'Improve reaction speed',
  //   descriptionFa: 'بهبود سرعت واکنش',
  //   image: require('../../assets/games/game9.png'),
  //   level: 'Hard',
  //   levelFa: 'سخت',
  //   time: '7 min',
  //   timeFa: '۷ دقیقه',
  //   route: '/games/stroop',
  // },

  {
    id: '4',
    category: 'stress',
    title: 'Visual Flow',
    titleFa: 'جریان بصری',
    description: 'Focuse on Flow',
    descriptionFa: 'افزایش قدرت بصری',
    image: require('../../assets/games/game4.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '5 min',
    timeFa: '۵ دقیقه',
    route: '/games/visual-flow',
  },

  // {
  //   id: '5',
  //   category: 'psychological',
  //   title: 'Word Puzzle',
  //   titleFa: 'جمله بندی',
  //   description: 'Enjoy a peaceful relaxing experience',
  //   descriptionFa: 'یک تجربه آرام و لذت‌بخش را تجربه کنید',
  //   image: require('../../assets/games/game8.png'),
  //   level: 'Easy',
  //   levelFa: 'آسان',
  //   time: '10 min',
  //   timeFa: '۱۰ دقیقه',
  //   route: '/games/Word',
  // },

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
    id: '11',
    category: 'adventure',
    title: 'Forest Adventure',
    titleFa: 'ماجراجویی در جنگل',
    description:
      'Discover the secrets of the forest',
    descriptionFa:
      'رازهای جنگل را کشف کنید',
    image: require('../../assets/games/game3.png'),
    level: 'Hard',
    levelFa: 'سخت',
    time: '20 min',
    timeFa: '۲۰ دقیقه',
    route: '/games/forest-adventure',
  },
];

/* ================================================================
   SHARED HEADER
   ================================================================

   مهم:
   این Header در هر دو صفحه استفاده می‌شود.

   ساختار فیزیکی همیشه:

   ┌──────┐ ┌─────────────────────────────┐
   │  ←   │ │ عنوان                       │
   └──────┘ │ توضیحات                     │
            └─────────────────────────────┘

   دکمه همیشه سمت چپ است.
   RTL فقط روی متن تأثیر دارد.
================================================================ */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  colors: any;
  isRTL: boolean;
  backLabel?: string;
}

function PageHeader({
  title,
  subtitle,
  onBack,
  colors,
  isRTL,
  backLabel = 'Back',
}: PageHeaderProps) {
  return (
    <View
      style={[
        styles.pageHeader,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* ==========================================================
         BACK BUTTON

         این دکمه هیچ وابستگی به RTL ندارد.

         نه row-reverse
         نه scaleX
         نه right
         نه position وابسته به RTL

         بنابراین همیشه سمت چپ می‌ماند.
      ========================================================== */}

      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={[
          styles.unifiedBackButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <ArrowLeft
          size={21}
          color={colors.text}
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      {/* ==========================================================
         TITLE AREA

         این قسمت مستقل از دکمه برگشت است.
         RTL فقط این بخش را راست‌چین می‌کند.
      ========================================================== */}

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
  const { colors } = useTheme();

  const {
    t,
    language,
    isRTL,
  } = useLanguage();

  const router = useRouter();

  const {
    category,
  } =
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

  /* ================================================================
     CATEGORY PARAMETER
  ================================================================ */

  useEffect(() => {
    if (category === 'stress') {
      setSelectedCategory('stress');
    }
  }, [category]);

  /* ================================================================
     LOCALIZATION HELPERS
  ================================================================ */

  const getGameTitle = (
    game: typeof games[0],
  ) => {
    return language === 'fa'
      ? game.titleFa
      : game.title;
  };

  const getGameDescription = (
    game: typeof games[0],
  ) => {
    return language === 'fa'
      ? game.descriptionFa
      : game.description;
  };

  const getGameLevel = (
    game: typeof games[0],
  ) => {
    return language === 'fa'
      ? game.levelFa
      : game.level;
  };

  const getGameTime = (
    game: typeof games[0],
  ) => {
    return language === 'fa'
      ? game.timeFa
      : game.time;
  };

  const filteredGames = games.filter(
    (game) =>
      game.category ===
      selectedCategory,
  );

  /* ================================================================
     DETAIL PAGE BACK
     
     فقط دسته‌بندی را می‌بندد.
  ================================================================ */

  const handleBack = () => {
    setSelectedCategory(null);
  };

  /* ================================================================
     PAGE 1 — CATEGORIES
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
        {/* ======================================================
           SHARED HEADER

           همان Header صفحه دوم است.
           بنابراین جای دکمه دقیقاً یکسان است.
        ====================================================== */}

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
          backLabel={t.back}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.content
          }
        >
          {/* ====================================================
             CATEGORIES
          ==================================================== */}

          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.85}
                onPress={() =>
                  setSelectedCategory(
                    category.id,
                  )
                }
              >
                <Card
                  style={
                    styles.categoryCard
                  }
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          colors.primary +
                          '18',
                      },
                    ]}
                  >
                    <Icon
                      size={34}
                      color={
                        colors.primary
                      }
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
                        ? category.titleFa
                        : category.title}
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
                        ? category.descriptionFa
                        : category.description}
                    </Text>
                  </View>

                  <ChevronLeft
                    size={22}
                    color={
                      colors.textSecondary
                    }
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
      (category) =>
        category.id ===
        selectedCategory,
    );

  /* ================================================================
     PAGE 2 — GAMES
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
      {/* ==========================================================
         SHARED HEADER

         دقیقاً همان Header صفحه اول.
         دکمه همیشه سمت چپ.
      ========================================================== */}

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
        backLabel={t.back}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* ======================================================
           GAMES
        ====================================================== */}

        {filteredGames.map((game) => (
          <Card
            key={game.id}
            style={styles.card}
          >
            <Image
              source={game.image}
              style={styles.cover}
              resizeMode="cover"
            />

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
                  <Brain
                    size={16}
                    color={
                      colors.primary
                    }
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
                    {getGameLevel(game)}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailItem
                  }
                >
                  <Clock
                    size={16}
                    color={
                      colors.primary
                    }
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
     SHARED HEADER

     هر دو صفحه دقیقاً از همین Header استفاده می‌کنند.

     ترتیب فیزیکی:
     
     [ BACK ] [ TITLE / SUBTITLE ]

     بنابراین در RTL هم دکمه سمت چپ باقی می‌ماند.
  ================================================================ */

  pageHeader: {
    width: '100%',

    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 15,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  unifiedBackButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,

    /*
     * مهم:
     * این margin همیشه یکسان است.
     * RTL روی آن تأثیر نمی‌گذارد.
     */
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
    paddingBottom: 100,
  },

  /* ================================================================
     CATEGORY PAGE
  ================================================================ */

  categoryCard: {
    minHeight: 120,

    marginBottom: Spacing.md,

    padding: Spacing.md,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 14,
  },

  categoryIcon: {
    width: 64,
    height: 64,

    borderRadius: 20,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  categoryInfo: {
    flex: 1,
    minWidth: 0,
  },

  categoryTitle: {
    fontSize: 19,
    fontWeight: '800',
  },

  categoryDescription: {
    fontSize: 13,

    marginTop: 5,

    lineHeight: 19,
  },

  /* ================================================================
     GAME CARDS
  ================================================================ */

  card: {
    marginBottom: Spacing.lg,

    overflow: 'hidden',

    borderRadius: 18,
  },

  cover: {
    width: '100%',
    height: 170,

    borderRadius: 18,
  },

  info: {
    padding: Spacing.md,
  },

  gameTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  description: {
    marginTop: 6,

    fontSize: 14,

    lineHeight: 20,
  },

  details: {
    marginTop: Spacing.md,

    gap: 20,
  },

  detailItem: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 5,
  },

  detailText: {
    fontSize: 13,
  },

  button: {
    marginTop: Spacing.md,

    paddingVertical: 12,

    borderRadius:
      BorderRadius.full,

    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',

    fontWeight: '700',
  },
});
