import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { AppText as Text } from '../ui/AppText';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Brain,
  Clock,
  Languages,
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
    image: require('../../assets/games/game_10.png'),
    level: 'Medium',
    levelFa: 'متوسط',
    time: '8 min',
    timeFa: '۸ دقیقه',
    route: '/games/BilingualSequence',
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
  {
    id: 'language-challenge',
    title: 'Analogram',
    titleFa: 'آنالوگرام',
    description: 'Improve vocabulary and language recognition',
    descriptionFa: 'دایره لغات و تشخیص زبان خود را تقویت کن',
    image: require('../../assets/games/game7.png'),
    level: 'Hard',
    levelFa: 'سخت',
    time: '7 min',
    timeFa: '۷ دقیقه',
    route: '/games/AnologramGame',
  }
];

export default function BilingualGamesScreen() {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();

  const textAlignStyle = isRTL ? 'right' : 'left';

  const getTitle = (game: (typeof bilingualGames)[0]) =>
    language === 'fa' ? game.titleFa : game.title;

  const getDescription = (game: (typeof bilingualGames)[0]) =>
    language === 'fa'
      ? game.descriptionFa
      : game.description;

  const getLevel = (game: (typeof bilingualGames)[0]) =>
    language === 'fa' ? game.levelFa : game.level;

  const getTime = (game: (typeof bilingualGames)[0]) =>
    language === 'fa' ? game.timeFa : game.time;

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
      {/* ==================== HEADER ==================== */}
      <View
        style={[
          styles.header,
          {
            flexDirection: 'row', // همیشه چپ به راست
          },
        ]}
      >
        {/* دکمه برگشت - همیشه در سمت چپ */}
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={language === 'fa' ? 'بازگشت' : 'Back'}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ArrowLeft
            size={23}
            color={colors.text}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* عنوان و آیکون - همیشه در سمت راست */}
        <View
          style={[
            styles.headerContent,
            {
              alignItems: 'flex-end', // همیشه راست‌چین
            },
          ]}
        >
          <View
            style={[
              styles.titleRow,
              {
                flexDirection: 'row-reverse', // آیکون سمت راست عنوان
              },
            ]}
          >
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: colors.primary + '16',
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
                  alignItems: 'flex-end', // راست‌چین
                },
              ]}
            >
              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: colors.text,
                    textAlign: 'right', // همیشه راست
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
                    color: colors.textSecondary,
                    textAlign: 'right', // همیشه راست
                  },
                ]}
              >
                {bilingualGames.length}{' '}
                {language === 'fa'
                  ? 'بازی برای یادگیری'
                  : 'games to learn'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ==================== INTRO CARD ==================== */}
      <View
        style={[
          styles.introCard,
          {
            backgroundColor: colors.primary + '0B',
            borderColor: colors.primary + '20',
            flexDirection: isRTL
              ? 'row-reverse'
              : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.introIcon,
            {
              backgroundColor: colors.primary + '18',
            },
          ]}
        >
          <Languages
            size={23}
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
                color: colors.textSecondary,
                textAlign: textAlignStyle,
              },
            ]}
          >
            {language === 'fa'
              ? 'مهارت‌های زبان، حافظه و تمرکز خود را با بازی تقویت کنید.'
              : 'Improve your language, memory and focus through fun games.'}
          </Text>
        </View>
      </View>

      {/* ==================== GAMES LIST ==================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {bilingualGames.map((game) => (
          <Card
            key={game.id}
            style={styles.card}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={game.image}
                style={styles.cover}
                resizeMode="cover"
              />

              <View
                style={[
                  styles.imageBadge,
                  {
                    backgroundColor:
                      colors.background + 'E8',
                  },
                ]}
              >
                <Languages
                  size={13}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.imageBadgeText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {language === 'fa'
                    ? 'دوزبانه'
                    : 'Bilingual'}
                </Text>
              </View>
            </View>

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
                {getTitle(game)}
              </Text>

              <Text
                style={[
                  styles.description,
                  {
                    color: colors.textSecondary,
                    textAlign: textAlignStyle,
                  },
                ]}
                numberOfLines={2}
              >
                {getDescription(game)}
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
                <View
                  style={[
                    styles.detailItem,
                    {
                      flexDirection: isRTL
                        ? 'row-reverse'
                        : 'row',
                    },
                  ]}
                >
                  <Brain
                    size={15}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {getLevel(game)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.detailDivider,
                    {
                      backgroundColor: colors.border,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.detailItem,
                    {
                      flexDirection: isRTL
                        ? 'row-reverse'
                        : 'row',
                    },
                  ]}
                >
                  <Clock
                    size={15}
                    color={colors.primary}
                  />

                  <Text
                    style={[
                      styles.detailText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {getTime(game)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() =>
                  router.push(game.route as any)
                }
                activeOpacity={0.82}
              >
                <View style={styles.buttonIcon}>
                  <Play
                    size={14}
                    color={colors.primary}
                    fill={colors.primary}
                  />
                </View>

                <Text style={styles.buttonText}>
                  {t.startGame ||
                    (language === 'fa'
                      ? 'شروع بازی'
                      : 'Start Game')}
                </Text>

                <ChevronLeft
                  size={17}
                  color="#FFFFFF"
                  style={{
                    transform: [{ rotate: '180deg' }],
                  }}
                />
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

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg + 35,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexDirection: 'row', // همیشه چپ به راست
  },

  headerContent: {
    flex: 1,
    alignItems: 'flex-end', // همیشه راست‌چین
  },

  titleRow: {
    alignItems: 'center',
    gap: 11,
    flexDirection: 'row-reverse', // آیکون سمت راست عنوان
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleTextContainer: {
    flex: 1,
    alignItems: 'flex-end', // راست‌چین
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'right', // همیشه راست
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'right', // همیشه راست
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    flexShrink: 0, // جلوگیری از کوچک شدن دکمه
  },

  introCard: {
    marginHorizontal: Spacing.lg,
    marginTop: 5,
    marginBottom: 7,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },

  introIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
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

  content: {
    paddingTop: 14,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 110,
  },

  card: {
    marginBottom: 18,
    overflow: 'hidden',
    borderRadius: 22,
    borderWidth: 1,
  },

  imageWrapper: {
    position: 'relative',
  },

  cover: {
    width: '100%',
    height: 175,
  },

  imageBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  imageBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  info: {
    padding: 16,
  },

  gameTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.2,
  },

  description: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
  },

  details: {
    marginTop: 14,
    alignItems: 'center',
    gap: 11,
  },

  detailItem: {
    alignItems: 'center',
    gap: 5,
  },

  detailText: {
    fontSize: 12,
    fontWeight: '600',
  },

  detailDivider: {
    width: 1,
    height: 15,
  },

  button: {
    marginTop: 17,
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  buttonIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});