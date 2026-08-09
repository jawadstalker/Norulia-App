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
  BookOpen,
  Check,
  RotateCcw,
} from 'lucide-react-native';

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
    textFa: 'بیت‌ها را یکی‌یکی بخوانید و سعی کنید آن‌ها را به خاطر بسپارید.',
  },
  {
    id: '2',
    title: 'Beautiful Words',
    titleFa: 'سخنان زیبا',
    poet: 'Memory Practice',
    poetFa: 'تمرین حافظه',
    text: 'Read carefully, close your eyes, and repeat the lines from memory.',
    textFa: 'با دقت بخوانید، چشمان خود را ببندید و بیت‌ها را از حفظ تکرار کنید.',
  },
  {
    id: '3',
    title: 'Daily Poetry',
    titleFa: 'شعر روزانه',
    poet: 'Memory Practice',
    poetFa: 'تمرین حافظه',
    text: 'Practice a small part every day to strengthen your memory.',
    textFa: 'هر روز بخش کوچکی را تمرین کنید تا حافظه شما تقویت شود.',
  },
];

export default function PoemsScreen() {
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();
  const router = useRouter();

  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  const textAlignStyle = isRTL ? 'right' : 'left';

  const currentPoem = selectedPoem;

  const title = language === 'fa' ? 'حفظ شعر' : 'Poem Memorization';

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

  if (currentPoem) {
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
            styles.header,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.surface,
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
          </TouchableOpacity>

          <View
            style={[
              styles.headerTitleContainer,
              {
                alignItems: isRTL ? 'flex-end' : 'flex-start',
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
              {getPoemTitle(currentPoem)}
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
              {getPoemPoet(currentPoem)}
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Card style={styles.practiceCard}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: colors.primary + '18',
                },
              ]}
            >
              <BookOpen
                size={34}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.practiceTitle,
                {
                  color: colors.text,
                  textAlign: textAlignStyle,
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
                  textAlign: textAlignStyle,
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
              onPress={() => setShowAnswer(!showAnswer)}
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
              placeholderTextColor={colors.textSecondary}
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
              <Check size={20} color={colors.primary} />

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
      </View>
    );
  }

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
        onPress={handleBack}
        style={[
          styles.topBackButton,
          {
            backgroundColor: colors.surface,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
        activeOpacity={0.8}
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

        <Text
          style={[
            styles.backText,
            {
              color: colors.text,
              textAlign: textAlignStyle,
            },
          ]}
        >
          {language === 'fa' ? 'بازگشت' : 'Back'}
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
          {title}
        </Text>

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
            <Card style={styles.poemCard}>
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor: colors.primary + '18',
                  },
                ]}
              >
                <BookOpen
                  size={30}
                  color={colors.primary}
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

              <ArrowLeft
                size={21}
                color={colors.textSecondary}
                style={
                  isRTL
                    ? undefined
                    : {
                        transform: [{ rotate: '180deg' }],
                      }
                }
              />
            </Card>
          </TouchableOpacity>
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

  topBackButton: {
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
    lineHeight: 22,
  },

  poemCard: {
    minHeight: 105,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    flexDirection: 'row',
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

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
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