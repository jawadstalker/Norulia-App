import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  RotateCcw,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';
import { Card } from '../ui/Card';

type Poem = {
  id: string;
  title: string;
  titleFa: string;
  poet: string;
  poetFa: string;
  text: string;
  textFa: string;
};

const poems: Poem[] = [
  {
    id: '1',
    title: 'The First Lesson',
    titleFa: 'درس اول',
    poet: 'Memory Practice',
    poetFa: 'تمرین حافظه',
    text: 'Learn the lines one by one and try to remember them.',
    textFa:
      'بیت‌ها را یکی‌یکی بخوانید و سعی کنید آن‌ها را به خاطر بسپارید.',
  },
  {
    id: '2',
    title: 'Beautiful Words',
    titleFa: 'سخنان زیبا',
    poet: 'Memory Practice',
    poetFa: 'تمرین حافظه',
    text:
      'Read carefully, close your eyes, and repeat the lines from memory.',
    textFa:
      'با دقت بخوانید، چشمان خود را ببندید و بیت‌ها را از حفظ تکرار کنید.',
  },
  {
    id: '3',
    title: 'Daily Poetry',
    titleFa: 'شعر روزانه',
    poet: 'Memory Practice',
    poetFa: 'تمرین حافظه',
    text:
      'Practice a small part every day to strengthen your memory.',
    textFa:
      'هر روز بخش کوچکی را تمرین کنید تا حافظه شما تقویت شود.',
  },
];

export default function PoemsScreen() {
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();
  const router = useRouter();

  const [selectedPoem, setSelectedPoem] =
    useState<Poem | null>(null);

  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const currentPoem = selectedPoem;

  const textAlignStyle = isRTL ? 'right' : 'left';

  const title =
    language === 'fa'
      ? 'حفظ شعر'
      : 'Poem Memorization';

  const subtitle =
    language === 'fa'
      ? 'شعر مورد نظر خود را انتخاب کنید و تمرین حفظ کردن را شروع کنید'
      : 'Choose a poem and start your memorization practice';

  const getPoemTitle = (poem: Poem) =>
    language === 'fa' ? poem.titleFa : poem.title;

  const getPoemPoet = (poem: Poem) =>
    language === 'fa' ? poem.poetFa : poem.poet;

  const getPoemText = (poem: Poem) =>
    language === 'fa' ? poem.textFa : poem.text;

  const progressText = useMemo(() => {
    if (!currentPoem) return '';

    return language === 'fa'
      ? 'متن را بخوانید، سپس آن را از حفظ بازگو کنید.'
      : 'Read the text, then try to recall it from memory.';
  }, [currentPoem, language]);

  const resetPractice = () => {
    setShowAnswer(false);
    setUserAnswer('');
  };

  /**
   * ------------------------------------------
   * BACK LOGIC
   * ------------------------------------------
   */
  const handleBack = () => {
    if (currentPoem) {
      setSelectedPoem(null);
      resetPractice();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  /**
   * ------------------------------------------
   * BACK ICON
   *
   * نکته:
   * جهت این آیکون را تغییر نمی‌دهیم.
   * همان ArrowLeft است که در صفحه اول درست بود.
   * ------------------------------------------
   */
  const BackIcon = ArrowLeft;

  /**
   * ------------------------------------------
   * صفحه تمرین شعر
   * ------------------------------------------
   */
  if (currentPoem) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
        edges={['top']}
      >
        {/* ======================================
            HEADER
           ====================================== */}

        <View style={styles.detailHeader}>
          {/* دکمه برگشت - همیشه سمت چپ */}
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              language === 'fa'
                ? 'بازگشت'
                : 'Back'
            }
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
            <BackIcon
              size={23}
              color={colors.text}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          {/* عنوان وسط Header */}
          <View style={styles.detailHeaderCenter}>
            <Text
              numberOfLines={1}
              style={[
                styles.detailHeaderTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {getPoemTitle(currentPoem)}
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.detailHeaderSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {getPoemPoet(currentPoem)}
            </Text>
          </View>

          {/* فضای متقارن سمت راست */}
          <View style={styles.headerSidePlaceholder} />
        </View>

        {/* ======================================
            CONTENT
           ====================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.detailContent}
        >
          <Card style={styles.practiceCard}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    colors.primary + '18',
                },
              ]}
            >
              <BookOpen
                size={34}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>

            <Text
              style={[
                styles.practiceTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {language === 'fa'
                ? 'تمرین حفظ'
                : 'Memorization Practice'}
            </Text>

            <Text
              style={[
                styles.practiceSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {progressText}
            </Text>

            <View
              style={[
                styles.poemBox,
                {
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  styles.poemText,
                  {
                    color: colors.text,
                    textAlign: textAlignStyle,
                  },
                ]}
              >
                {getPoemText(currentPoem)}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() =>
                setShowAnswer(!showAnswer)
              }
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>
                {showAnswer
                  ? language === 'fa'
                    ? 'مخفی کردن متن'
                    : 'Hide Text'
                  : language === 'fa'
                    ? 'مشاهده متن'
                    : 'Show Text'}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.inputLabel,
                {
                  color: colors.text,
                  textAlign: textAlignStyle,
                },
              ]}
            >
              {language === 'fa'
                ? 'آنچه به خاطر سپرده‌اید بنویسید'
                : 'Write what you remember'}
            </Text>

            <TextInput
              value={userAnswer}
              onChangeText={setUserAnswer}
              multiline
              placeholder={
                language === 'fa'
                  ? 'متن را از حفظ بنویسید...'
                  : 'Write the poem from memory...'
              }
              placeholderTextColor={
                colors.textSecondary
              }
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  textAlign: textAlignStyle,
                },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.checkButton,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                },
              ]}
              activeOpacity={0.8}
            >
              <Check
                size={20}
                color={colors.primary}
                strokeWidth={2.5}
              />

              <Text
                style={[
                  styles.checkButtonText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'بررسی پاسخ'
                  : 'Check Answer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={resetPractice}
              style={styles.resetButton}
              activeOpacity={0.7}
            >
              <RotateCcw
                size={17}
                color={colors.textSecondary}
                strokeWidth={2.2}
              />

              <Text
                style={[
                  styles.resetText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'شروع دوباره'
                  : 'Start Again'}
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /**
   * ------------------------------------------
   * صفحه اصلی لیست شعرها
   * ------------------------------------------
   */

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      edges={['top']}
    >
      {/* ======================================
          HEADER اصلی
         ====================================== */}

      <View style={styles.mainHeader}>
        {/* دکمه برگشت - سمت چپ */}
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            language === 'fa'
              ? 'بازگشت'
              : 'Back'
          }
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
          <BackIcon
            size={23}
            color={colors.text}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* عنوان واقعی وسط */}
        <View style={styles.mainHeaderCenter}>
          <Text
            style={[
              styles.mainHeaderTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        {/* فضای متقارن */}
        <View style={styles.headerSidePlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {subtitle}
        </Text>

        {poems.map((poem) => (
          <TouchableOpacity
            key={poem.id}
            activeOpacity={0.85}
            onPress={() => {
              setSelectedPoem(poem);
              resetPractice();
            }}
          >
            <Card
              style={[
                styles.poemCard,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor:
                      colors.primary + '18',
                  },
                ]}
              >
                <BookOpen
                  size={30}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <View
                style={[
                  styles.cardInfo,
                  {
                    alignItems: isRTL
                      ? 'flex-end'
                      : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                      textAlign: textAlignStyle,
                    },
                  ]}
                >
                  {getPoemTitle(poem)}
                </Text>

                <Text
                  style={[
                    styles.cardPoet,
                    {
                      color: colors.textSecondary,
                      textAlign: textAlignStyle,
                    },
                  ]}
                >
                  {getPoemPoet(poem)}
                </Text>
              </View>

              {/* فلش ورود به صفحه شعر */}
              {isRTL ? (
                <ArrowLeft
                  size={21}
                  color={colors.textSecondary}
                  strokeWidth={2.2}
                />
              ) : (
                <ArrowRight
                  size={21}
                  color={colors.textSecondary}
                  strokeWidth={2.2}
                />
              )}
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop:50,
    flex: 1,
  },

  mainHeader: {
    height: 64,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailHeader: {
    height: 64,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },

  /**
   * فضای دو طرف Header
   */
  headerSidePlaceholder: {
    width: 44,
    height: 44,
  },

  /**
   * مرکز Header صفحه اصلی
   */
  mainHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },

  /**
   * مرکز Header صفحه تمرین
   */
  detailHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },

  detailHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  detailHeaderSubtitle: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  /**
   * ==========================================
   * CONTENT
   * ==========================================
   */
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  detailContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 100,
  },

  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },

  /**
   * ==========================================
   * POEM CARDS
   * ==========================================
   */
  poemCard: {
    minHeight: 105,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 14,
  },

  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },

  cardPoet: {
    fontSize: 13,
    marginTop: 5,
  },

  /**
   * ==========================================
   * PRACTICE CARD
   * ==========================================
   */
  practiceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },

  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },

  practiceTitle: {
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
  },

  practiceSubtitle: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
    textAlign: 'center',
  },

  poemBox: {
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    minHeight: 150,
    justifyContent: 'center',
  },

  poemText: {
    fontSize: 17,
    lineHeight: 30,
  },

  primaryButton: {
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 22,
    marginBottom: 8,
  },

  input: {
    minHeight: 130,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },

  checkButton: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  checkButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },

  resetButton: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  resetText: {
    fontSize: 13,
    fontWeight: '600',
  },
});