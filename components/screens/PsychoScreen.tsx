import React, { useEffect, useState } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '../ui/AppText';

import { useRouter, useLocalSearchParams } from 'expo-router';

import {
  ArrowLeft,
  Brain,
  Clock,
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

import { Card } from '../ui/Card';

const categories = [
  {
    id: 'psychological',
    title: 'Psychological Games',
    titleFa: 'بازی‌های روانشناختی',
    description: 'Train your memory, attention and cognitive skills',
    descriptionFa: 'حافظه، توجه و مهارت‌های شناختی خود را تقویت کنید',
    icon: Brain,
  },
  {
    id: 'stress',
    title: 'Anti-Stress Games',
    titleFa: 'بازی‌های ضد استرس',
    description: 'Relax your mind and reduce stress',
    descriptionFa: 'ذهن خود را آرام کنید و استرس را کاهش دهید',
    icon: Heart,
  },
  {
    id: 'adventure',
    title: 'Adventure Games',
    titleFa: 'بازی‌های ماجراجویی',
    description: 'Explore new worlds and enjoy exciting challenges',
    descriptionFa:
      'دنیاهای جدید را کشف کنید و از چالش‌های هیجان‌انگیز لذت ببرید',
    icon: Compass,
  },
];

const games = [
  {
    id: '1',
    category: 'psychological',
    title: 'Memory Challenge',
    titleFa: 'چالش حافظه',
    description: 'Improve memory and cognitive skills',
    descriptionFa: 'بهبود حافظه و مهارت‌های شناختی',
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
    description: 'Train attention and concentration',
    descriptionFa: 'تمرین توجه و تمرکز',
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
    title: 'Stroop',
    titleFa: 'تست واکنش',
    description: 'Improve reaction speed',
    descriptionFa: 'بهبود سرعت واکنش',
    image: require('../../assets/games/game9.png'),
    level: 'Hard',
    levelFa: 'سخت',
    time: '7 min',
    timeFa: '۷ دقیقه',
    route: '/games/stroop',
  },
  {
    id: '4',
    category: 'stress',
    title: 'Visual Flow',
    titleFa: 'جریان بصری',
    description: 'Focus on Flow',
    descriptionFa: 'افزایش قدرت بصری',
    image: require('../../assets/games/game4.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '5 min',
    timeFa: '۵ دقیقه',
    route: '/games/visual-flow',
  },
  {
    id: '5',
    category: 'psychological',
    title: 'Word Puzzle',
    titleFa: 'جمله بندی',
    description: 'Enjoy a peaceful relaxing experience',
    descriptionFa: 'یک تجربه آرام و لذت‌بخش را تجربه کنید',
    image: require('../../assets/games/game8.png'),
    level: 'Easy',
    levelFa: 'آسان',
    time: '10 min',
    timeFa: '۱۰ دقیقه',
    route: '/games/Word',
  },
  {
    id: '6',
    category: 'stress',
    title: 'Relaxing Garden',
    titleFa: 'باغ آرامش',
    description: 'Enjoy a peaceful relaxing experience',
    descriptionFa: 'یک تجربه آرام و لذت‌بخش را تجربه کنید',
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
    description: 'Explore a mysterious island',
    descriptionFa: 'یک جزیره مرموز را کشف کنید',
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
    description: 'Discover the secrets of the forest',
    descriptionFa: 'رازهای جنگل را کشف کنید',
    image: require('../../assets/games/game3.png'),
    level: 'Hard',
    levelFa: 'سخت',
    time: '20 min',
    timeFa: '۲۰ دقیقه',
    route: '/games/forest-adventure',
  },
  {
    id: '12',
    category: 'psychological',
    title: 'Size Discrimination',
    titleFa: 'تشخیص اندازه',
    description: 'Test your visual perception threshold',
    descriptionFa: 'آستانه ادراک بصری خود را بسنج',
    image: require('../../assets/games/game1.png'),
    level: 'Medium',
    levelFa: 'متوسط',
    time: '5 min',
    timeFa: '۵ دقیقه',
    route: '/games/size-discrimination',
  },
];

export default function PsychoScreen() {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();
  

  const { category } = useLocalSearchParams<{
    category?: string;
  }>();

  const [selectedCategory, setSelectedCategory] = useState<
    string | null
  >(category === 'stress' ? 'stress' : null);

  const textAlignStyle = isRTL ? 'right' : 'left';
  const GREEN_COLOR = '#22C55E'; // رنگ سبز ثابت برای آیکون‌ها

  useEffect(() => {
    if (
      category === 'stress' ||
      category === 'psychological' ||
      category === 'adventure'
    ) {
      setSelectedCategory(category);
    }
  }, [category]);

  const getGameTitle = (game: (typeof games)[0]) => {
    return language === 'fa'
      ? game.titleFa
      : game.title;
  };

  const getGameDescription = (
    game: (typeof games)[0]
  ) => {
    return language === 'fa'
      ? game.descriptionFa
      : game.description;
  };

  const getGameLevel = (game: (typeof games)[0]) => {
    return language === 'fa'
      ? game.levelFa
      : game.level;
  };

  const getGameTime = (game: (typeof games)[0]) => {
    return language === 'fa'
      ? game.timeFa
      : game.time;
  };

  const filteredGames = games.filter(
    (game) => game.category === selectedCategory
  );

  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (!selectedCategory) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
          activeOpacity={0.8}
        >
          <ArrowLeft
            size={22}
            color={colors.text}
            style={
              isRTL
                ? {
                    transform: [{ scaleX: -1 }],
                  }
                : undefined
            }
          />

          <Text
            style={[
              styles.backText,
              {
                color: colors.text,
                textAlign: textAlignStyle,
              },
            ]}
          >
            {t.back}
          </Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            {language === 'fa' ? 'بازی‌ها' : 'Games'}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {language === 'fa'
              ? 'دسته مورد نظر خود را انتخاب کنید'
              : 'Choose a game category'}
          </Text>

          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() =>
                  setSelectedCategory(item.id)
                }
              >
                <Card style={styles.categoryCard}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor: GREEN_COLOR + '18', // پس‌زمینه سبز با透明度
                      },
                    ]}
                  >
                    <Icon
                      size={34}
                      color={GREEN_COLOR} // رنگ سبز
                    />
                  </View>

                  <View
                    style={[
                      styles.categoryInfo,
                      {
                        alignItems: isRTL
                          ? 'flex-end'
                          : 'flex-start',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTitle,
                        {
                          color: colors.text,
                          textAlign: textAlignStyle,
                        },
                      ]}
                    >
                      {language === 'fa'
                        ? item.titleFa
                        : item.title}
                    </Text>

                    <Text
                      style={[
                        styles.categoryDescription,
                        {
                          color:
                            colors.textSecondary,
                          textAlign: textAlignStyle,
                        },
                      ]}
                    >
                      {language === 'fa'
                        ? item.descriptionFa
                        : item.description}
                    </Text>
                  </View>

                  <ChevronLeft
                    size={22}
                    color={colors.textSecondary}
                    style={
                      isRTL
                        ? {
                            transform: [
                              {
                                rotate: '180deg',
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

  const selectedCategoryData = categories.find(
    (item) => item.id === selectedCategory
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.gameHeader,
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
              ? selectedCategoryData?.titleFa
              : selectedCategoryData?.title}
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.textSecondary,
                textAlign: textAlignStyle,
              },
            ]}
          >
            {filteredGames.length}{' '}
            {language === 'fa'
              ? 'بازی'
              : 'games'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={[
            styles.headerBackButton,
            {
              backgroundColor: colors.surface,
            },
          ]}
        >
          <ArrowLeft
            size={21}
            color={colors.text}
            style={
              isRTL
                ? {
                    transform: [{ scaleX: -1 }],
                  }
                : undefined
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
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
                    textAlign: textAlignStyle,
                  },
                ]}
              >
                {getGameTitle(game)}
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    color: colors.textSecondary,
                    textAlign: textAlignStyle,
                  },
                ]}
              >
                {getGameDescription(game)}
              </Text>

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
                <View style={styles.detailItem}>
                  <Brain
                    size={16}
                    color={GREEN_COLOR} // رنگ سبز
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

                <View style={styles.detailItem}>
                  <Clock
                    size={16}
                    color={GREEN_COLOR} // رنگ سبز
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
                    backgroundColor: GREEN_COLOR, // پس‌زمینه سبز دکمه
                  },
                ]}
                onPress={() =>
                  router.push(game.route as any)
                }
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingTop: 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },

  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 60,
    marginLeft: Spacing.lg,
    gap: 7,
  },

  backText: {
    fontSize: 15,
    fontWeight: '600',
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.md,
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Spacing.lg,
  },

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
  },

  categoryInfo: {
    flex: 1,
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

  gameHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

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
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});