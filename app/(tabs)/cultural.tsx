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

const weeks = [
  {
    id: 1,
    label: 'Week 1',
    shortLabel: 'W1',
    theme: {
      en: 'Mind & Basic Calm',
      fa: 'آشنایی با ذهن و آرامش پایه',
    },
    movie: {
      title: {
        en: 'Good Will Hunting',
        fa: 'ویل هانتینگ نابغه',
      },
      year: '1997',
      duration: {
        en: '2h 6m',
        fa: '۲ ساعت و ۶ دقیقه',
      },
      rating: '8.3',
      genre: {
        en: 'Drama • Romance • Psychological',
        fa: 'درام • عاشقانه • روانشناختی',
      },
      description: {
        en: 'Will Hunting is a twenty-year-old young man from South Boston who, despite having a criminal record, is a mathematical genius who has developed his knowledge largely on his own. After being released on probation, he works as a janitor at the Massachusetts Institute of Technology. The film follows a psychologist who tries to help Will discover his potential and confront his troubled past. A powerful story about personal growth, friendship, and the importance of human connection.',
        fa: 'ویل هانتینگ، جوان بیست ساله‌ای از جنوب بوستون، با وجود اینکه سابقه زندان دارد، نابغه‌ای در ریاضیات است که دانش خود را به‌صورت خودآموخته پرورش داده است. او پس از آزادی مشروط به عنوان نظافتچی در مؤسسه فناوری ماساچوست مشغول به کار می‌شود. داستان فیلم درباره تلاش یک روانشناس برای کمک به ویل در کشف استعدادهایش و رهایی از گذشته دشوار اوست؛ فیلمی تأثیرگذار درباره رشد شخصی، دوستی و اهمیت ارتباط انسانی.',
      },
      poster: require('../../assets/movies/movie_1.jpg'),
    },
    book: {
      title: {
        en: 'Psycho-Logical',
        fa: 'ذهن پریشان',
      },
      author: {
        en: 'Psycho-Logical',
        fa: 'Psycho-Logical',
      },
      genre: {
        en: 'Psychology • Neuroscience • Self-help',
        fa: 'روانشناسی • علوم اعصاب • خودیاری',
      },
      rating: '4.3',
      year: '2021',
      description: {
        en: 'One in four people experiences some form of mental health problem during a year, while anxiety and depression alone affect more than 500 million people worldwide. This book explores why psychological problems have become so widespread and examines how modern life can disrupt our mental wellbeing. It explains complex psychological concepts in a simple way and provides practical approaches for understanding the mind and managing stress and anxiety.',
        fa: 'از هر چهار نفر، یک نفر در طول سال دچار نوعی مشکل سلامت روان می‌شود و تنها اضطراب و افسردگی بیش از ۵۰۰ میلیون نفر را در سراسر جهان تحت‌تأثیر قرار داده‌اند. اما چرا این مشکلات تا این حد فراگیر شده‌اند؟ چه چیزی در زندگی مدرن روان ما را تحت‌تأثیر قرار می‌دهد؟ این کتاب به بررسی عمیق این موضوع می‌پردازد و راهکارهایی برای مدیریت استرس و اضطراب ارائه می‌دهد. نویسنده با زبانی ساده مفاهیم پیچیده روانشناسی را توضیح می‌دهد و به خواننده کمک می‌کند درک بهتری از ذهن خود پیدا کند.',
      },
      cover: require('../../assets/movies/Book_1.jpg'),
    },
    reason: {
      en: 'This week focuses on understanding the mind, developing psychological awareness, and building a foundation for calm and emotional wellbeing.',
      fa: 'این هفته بر شناخت ذهن، افزایش آگاهی روانشناختی و ایجاد پایه‌ای برای آرامش و سلامت هیجانی تمرکز دارد.',
    },
  },
  {
    id: 2,
    label: 'Week 2',
    shortLabel: 'W2',
    theme: {
      en: 'Emotional Regulation & Acceptance',
      fa: 'تنظیم هیجانات و پذیرش',
    },
    movie: {
      title: {
        en: 'Everything Everywhere All at Once',
        fa: 'همه‌چیز همه‌جا به‌یکباره',
      },
      year: '2022',
      duration: {
        en: '2h 19m',
        fa: '۲ ساعت و ۱۹ دقیقه',
      },
      rating: '8.0',
      genre: {
        en: 'Sci-Fi • Comedy • Drama',
        fa: 'علمی‌تخیلی • کمدی • درام',
      },
      description: {
        en: 'A Chinese-American woman dealing with a tax audit suddenly finds herself caught in a chaotic adventure across multiple realities. The film explores acceptance, family love, identity, and finding meaning in everyday life.',
        fa: 'داستان زنی چینی-آمریکایی که درگیر حسابرسی مالیاتی است و ناگهان خود را در میان ماجراجویی عجیب و دیوانه‌واری برای نجات جهان می‌یابد. فیلم درباره پذیرش، عشق خانوادگی، هویت و پیدا کردن معنا در زندگی روزمره است.',
      },
      poster: require('../../assets/movies/movie_2.jpg'),
    },
    book: {
      title: {
        en: 'The Happiness Trap',
        fa: 'تله شادی',
      },
      author: {
        en: 'Russ Harris',
        fa: 'راس هریس',
      },
      genre: {
        en: 'Psychology • Self-help • Cognitive Therapy',
        fa: 'روانشناسی • خودیاری • درمان شناختی',
      },
      rating: '4.2',
      year: '2008',
      description: {
        en: 'Based on Acceptance and Commitment Therapy (ACT), this book explains how the constant pursuit of happiness can sometimes make us unhappy. It teaches practical ways to stop fighting negative thoughts and instead build a richer and more meaningful life through acceptance and psychological flexibility.',
        fa: 'آیا مانند میلیون‌ها نفر در دام شادی گرفتار شده‌اید؟ راس هریس توضیح می‌دهد که تلاش مداوم برای یافتن خوشبختی گاهی می‌تواند باعث ناراحتی بیشتر شود. این کتاب بر اساس درمان مبتنی بر پذیرش و تعهد یا ACT نوشته شده و به شما کمک می‌کند به جای مبارزه با افکار منفی، زندگی غنی‌تر و معنادارتری بسازید. کتاب شامل تکنیک‌های عملی برای کاهش استرس و افزایش آرامش است.',
      },
      cover: require('../../assets/movies/Book_2.jpg'),
    },
    reason: {
      en: 'This week focuses on emotional awareness, acceptance, psychological flexibility, and learning to respond to difficult thoughts more effectively.',
      fa: 'این هفته بر آگاهی هیجانی، پذیرش، انعطاف‌پذیری روانشناختی و یادگیری واکنش مؤثرتر به افکار و احساسات دشوار تمرکز دارد.',
    },
  },
  {
    id: 3,
    label: 'Week 3',
    shortLabel: 'W3',
    theme: {
      en: 'Creativity & Burnout Prevention',
      fa: 'شکوفایی خلاقیت و پیشگیری از فرسودگی',
    },
    movie: {
      title: {
        en: 'Frida',
        fa: 'فریدا',
      },
      year: '2002',
      duration: {
        en: '2h 3m',
        fa: '۲ ساعت و ۳ دقیقه',
      },
      rating: '7.4',
      genre: {
        en: 'Biography • Drama • Art',
        fa: 'بیوگرافی • درام • هنری',
      },
      description: {
        en: 'A film about the life of Mexican surrealist painter Frida Kahlo. The story portrays her passionate and painful life and shows how art helped her cope with physical disability and the challenges she faced.',
        fa: 'این فیلم درباره زندگی نقاش مکزیکی سورئالیست، فریدا کالو است. فیلم زندگی پر از درد و رنج اما پرشور او را به تصویر می‌کشد و نشان می‌دهد چگونه هنر به او کمک کرد تا با محدودیت‌های جسمی و سختی‌های زندگی کنار بیاید. بازی درخشان سلما هایک و طراحی صحنه‌های چشمگیر از ویژگی‌های این فیلم است.',
      },
      poster: require('../../assets/movies/movie_3.jpg'),
    },
    book: {
      title: {
        en: "The Artist's Way",
        fa: 'راه هنرمند',
      },
      author: {
        en: 'Julia Cameron',
        fa: 'جولیا کامرون',
      },
      genre: {
        en: 'Creativity • Art • Self-discovery • Psychology',
        fa: 'خلاقیت • هنر • خودشناسی • روانشناسی',
      },
      rating: '4.1',
      year: '1992',
      description: {
        en: "The Artist's Way is a revolutionary program for personal renewal that helps readers reconnect with themselves and rediscover their creativity. The twelve-week program includes techniques such as Morning Pages and Artist Dates to identify and overcome creative blocks.",
        fa: 'کتاب «راه هنرمند» یک برنامه برای نوسازی شخصی است که به شما کمک می‌کند دوباره به مسیر خود بازگردید و احساسات و خلاقیتتان را کشف کنید. این کتاب شامل تمرین‌های ۱۲ هفته‌ای برای شکوفایی خلاقیت است. روش‌هایی مانند صبح‌نویسی و قرار هنری به شما کمک می‌کنند موانع خلاقیت را شناسایی کرده و از بین ببرید.',
      },
      cover: require('../../assets/movies/Book_3.jpg'),
    },
    reason: {
      en: 'This week focuses on creativity, self-expression, psychological recovery, and protecting yourself from emotional and mental burnout.',
      fa: 'این هفته بر خلاقیت، خودبیانگری، بازیابی روانی و محافظت از خود در برابر فرسودگی هیجانی و ذهنی تمرکز دارد.',
    },
  },
  {
    id: 4,
    label: 'Week 4',
    shortLabel: 'W4',
    theme: {
      en: 'Emotional Roots & Deep Calm',
      fa: 'ریشه‌های هیجانی و آرامش عمیق',
    },
    movie: {
      title: {
        en: 'The Secret World of Arrietty',
        fa: 'دنیای مخفی آریتی',
      },
      year: '2010',
      duration: {
        en: '1h 35m',
        fa: '۱ ساعت و ۳۵ دقیقه',
      },
      rating: '7.6',
      genre: {
        en: 'Animation • Adventure • Family • Fantasy',
        fa: 'انیمیشن • ماجراجویی • خانوادگی • فانتزی',
      },
      description: {
        en: 'Arrietty is a young Borrower, one of a tiny people who live secretly within human homes. She meets a sick young boy and their friendship soon creates danger for her family. A beautiful Studio Ghibli animation exploring empathy, trust, nature, accepting differences, and the importance of home and family.',
        fa: 'آریتی دختری از نژاد قرض‌گیرندگان است؛ موجوداتی ریزاندام که در مخفیگاه‌های خانه‌های انسان‌ها زندگی می‌کنند. او با یک پسر بیمار آشنا می‌شود و این آشنایی به‌زودی خطراتی را برای خانواده‌اش به همراه می‌آورد. انیمیشنی زیبا از استودیو جیبلی که به موضوعاتی مانند همدلی، اعتماد، ارتباط با طبیعت، پذیرش تفاوت‌ها و اهمیت خانه و خانواده می‌پردازد.',
      },
      poster: require('../../assets/movies/movie_4.jpg'),
    },
    book: {
      title: {
        en: 'Scattered Minds',
        fa: 'ذهن فروپاشیده',
      },
      author: {
        en: 'Gabor Maté',
        fa: 'گابور ماته',
      },
      genre: {
        en: 'Psychology • Neuroscience • Mental Health',
        fa: 'روانشناسی • علوم اعصاب • اختلالات روانی',
      },
      rating: '4.4',
      year: '2019',
      description: {
        en: 'Scattered Minds by Gabor Maté presents a different perspective on ADHD and explores how developmental and environmental factors may influence its formation. The book examines emotional and psychological roots and offers approaches for understanding and managing the condition.',
        fa: 'کتاب «ذهن فروپاشیده» اثر گابور ماته با نگاهی متفاوت به اختلال نقص توجه و بیش‌فعالی ADHD می‌پردازد. نویسنده عوامل محیطی و تجربیات دوران کودکی را در رشد این اختلال مهم می‌داند و به بررسی ریشه‌های هیجانی و روانی آن می‌پردازد. کتاب برای والدین، معلمان و افرادی که به دنبال درک عمیق‌تر این موضوع هستند مفید است.',
      },
      cover: require('../../assets/movies/Book_4.jpg'),
    },
    reason: {
      en: 'The final week focuses on emotional roots, deeper self-understanding, empathy, acceptance, and developing a stronger sense of inner calm.',
      fa: 'هفته پایانی بر ریشه‌های هیجانی، خودشناسی عمیق‌تر، همدلی، پذیرش و ایجاد احساس آرامش درونی تمرکز دارد.',
    },
  },
];

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
  iconColor: string;
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
  iconColor,
}: PageHeaderProps) {
  return (
    <View style={styles.headerRoot}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={[
          styles.headerBackButton,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : colors.border,
          },
        ]}
      >
        <ArrowLeft size={21} color={iconColor} strokeWidth={2.5} />
      </TouchableOpacity>

      <View
        style={[
          styles.headerTextArea,
          {
            alignItems: isRTL ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        {eyebrow ? (
          <Text
            style={[
              styles.headerEyebrow,
              {
                color: colors.primary,
                textAlign: isRTL ? 'right' : 'left',
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
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          {icon ? (
            <View
              style={[
                styles.headerIcon,
                {
                  backgroundColor: isDark ? 'rgba(167,139,250,0.16)' : 'rgba(124,58,237,0.09)',
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
                textAlign: isRTL ? 'right' : 'left',
                marginLeft: isRTL || !icon ? 0 : 10,
                marginRight: isRTL && icon ? 10 : 0,
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
                textAlign: isRTL ? 'right' : 'left',
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

export default function CulturalScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const currentWeek = selectedWeek !== null ? weeks[selectedWeek] : null;

  const iconColor = isDark ? 'rgba(73, 194, 226, 1)' : colors.text;

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

  const getLocalized = (obj: any) => {
    return isRTL ? obj.fa : obj.en;
  };

  const navigationLabels = {
    previous: isRTL ? 'قبلی' : 'Previous',
    next: isRTL ? 'بعدی' : 'Next',
  };

  if (selectedWeek === null) {
    return (
      <LinearGradient colors={gradientColors} style={styles.container}>
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
              title={t.weeklyCinema || 'سفر فرهنگی'}
              subtitle={t.weeklyCinemaSubtitle || 'یک فیلم و یک کتاب متناسب با سلامت شناختی شما'}
              icon={<Film size={20} color={iconColor} strokeWidth={2.4} />}
              onBack={handleBack}
              colors={colors}
              isDark={isDark}
              isRTL={isRTL}
              backLabel={t.back || 'بازگشت'}
              iconColor={iconColor}
            />
          </MotiView>

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
                  backgroundColor: isDark ? 'rgba(167,139,250,0.10)' : 'rgba(124,58,237,0.055)',
                  borderColor: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.10)',
                },
              ]}
            >
              <View
                style={[
                  styles.introIcon,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Sparkles size={19} color="#FFFFFF" />
              </View>

              <View
                style={[
                  styles.introTextContainer,
                  {
                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.introTitle,
                    {
                      color: colors.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t.monthlyJourney || 'سفر چهار هفته‌ای شما'}
                </Text>

                <Text
                  style={[
                    styles.introText,
                    {
                      color: colors.textSecondary,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {t.chooseWeek || 'یک هفته را انتخاب کنید تا پیشنهادهای فرهنگی آن را ببینید.'}
                </Text>
              </View>
            </View>
          </MotiView>

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
                    onPress={() => setSelectedWeek(index)}
                    style={[
                      styles.weekCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.weekCardTop,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.weekNumberCircle,
                          {
                            backgroundColor: isCurrent
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
                              color: isCurrent ? '#FFFFFF' : colors.primary,
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
                              backgroundColor: isDark
                                ? 'rgba(167,139,250,0.14)'
                                : 'rgba(124,58,237,0.08)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.currentBadgeText,
                              {
                                color: colors.primary,
                              },
                            ]}
                          >
                            {t.current || 'شروع'}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.weekCardTitle,
                        {
                          color: colors.text,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {t.week || 'هفته'} {week.id}
                    </Text>

                    <Text
                      style={[
                        styles.weekCardTheme,
                        {
                          color: colors.primary,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {getLocalized(week.theme)}
                    </Text>

                    <View
                      style={[
                        styles.previewRow,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.previewItem,
                          {
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.055)'
                              : '#F7F5FC',
                          },
                        ]}
                      >
                        <Film size={16} color={iconColor} />
                      </View>

                      <View
                        style={[
                          styles.previewItem,
                          {
                            backgroundColor: isDark
                              ? 'rgba(255,255,255,0.055)'
                              : '#F7F5FC',
                          },
                        ]}
                      >
                        <BookOpen size={16} color={iconColor} />
                      </View>
                    </View>

                    <View
                      style={[
                        styles.weekCardFooter,
                        {
                          flexDirection: isRTL ? 'row-reverse' : 'row',
                          borderTopColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.exploreText,
                          {
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {t.explore || 'مشاهده'}
                      </Text>

                      <ChevronRight size={18} color={iconColor} />
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Sparkles size={15} color={iconColor} />
            <Text
              style={[
                styles.footerText,
                {
                  color: colors.textTertiary,
                },
              ]}
            >
              {t.culturalWellness || 'لحظات کوچک فرهنگی می‌توانند لحظات معناداری برای ذهن ایجاد کنند.'}
            </Text>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </LinearGradient>
    );
  }

  const weekData = currentWeek!;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
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
            title={getLocalized(weekData.theme)}
            eyebrow={`${t.week || 'هفته'} ${weekData.id}`}
            onBack={handleBack}
            colors={colors}
            isDark={isDark}
            isRTL={isRTL}
            backLabel={t.back || 'بازگشت'}
            iconColor={iconColor}
          />
        </MotiView>

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
                    backgroundColor: index <= selectedWeek ? colors.primary : isDark
                      ? 'rgba(255,255,255,0.10)'
                      : '#E8E3F0',
                  },
                ]}
              />
            ))}
          </View>
        </MotiView>

        <View
          style={[
            styles.weekIntro,
            {
              alignItems: isRTL ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <View
            style={[
              styles.weekBadge,
              {
                flexDirection: isRTL ? 'row-reverse' : 'row',
                backgroundColor: isDark ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.08)',
              },
            ]}
          >
            <CalendarDays size={15} color={iconColor} />
            <Text
              style={[
                styles.weekBadgeText,
                {
                  color: colors.primary,
                },
              ]}
            >
              {t.week || 'هفته'} {weekData.id}
            </Text>
          </View>

          <Text
            style={[
              styles.recommendationTitle,
              {
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t.recommendations || 'پیشنهادهای هفتگی شما'}
          </Text>

          <Text
            style={[
              styles.recommendationSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {t.culturalWellness || 'کمی زمان بگذارید تا کشف کنید، تأمل کنید و چیزی معنادار پیدا کنید.'}
          </Text>
        </View>

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
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.cardTopRow,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.mediaLabel,
                  {
                    backgroundColor: isDark ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.08)',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Film size={15} color={iconColor} />
                <Text
                  style={[
                    styles.mediaLabelText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {t.movie || 'فیلم'}
                </Text>
              </View>

              <View style={styles.rating}>
                <Star size={14} color={colors.warning} fill={colors.warning} />
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
              <Image source={weekData.movie.poster} style={styles.poster} />
              <LinearGradient
                colors={[
                  'transparent',
                  isDark ? 'rgba(15,12,24,0.85)' : 'rgba(255,255,255,0.88)',
                ]}
                style={styles.posterOverlay}
              />
            </View>

            <View
              style={[
                styles.movieContent,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.movieTitle,
                  {
                    color: colors.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {getLocalized(weekData.movie.title)}
              </Text>

              <Text
                style={[
                  styles.movieMeta,
                  {
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {weekData.movie.year} • {getLocalized(weekData.movie.genre)}
              </Text>

              <View
                style={[
                  styles.statsRow,
                  {
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View style={styles.stat}>
                  <Clock size={14} color={iconColor} />
                  <Text
                    style={[
                      styles.statText,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {getLocalized(weekData.movie.duration)}
                  </Text>
                </View>

                <View style={styles.stat}>
                  <Star size={14} color={colors.warning} fill={colors.warning} />
                  <Text
                    style={[
                      styles.statText,
                      {
                        color: colors.text,
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
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {getLocalized(weekData.movie.description)}
              </Text>

              <TouchableOpacity
                activeOpacity={0.86}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text
                  style={[
                    styles.primaryButtonText,
                    {
                      marginLeft: isRTL ? 0 : 8,
                      marginRight: isRTL ? 8 : 0,
                    },
                  ]}
                >
                  {t.exploreMovie || 'مشاهده فیلم'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotiView>

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
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.cardTopRow,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.mediaLabel,
                  {
                    backgroundColor: isDark ? 'rgba(167,139,250,0.13)' : 'rgba(124,58,237,0.08)',
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <BookOpen size={15} color={iconColor} />
                <Text
                  style={[
                    styles.mediaLabelText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {t.book || 'کتاب'}
                </Text>
              </View>

              <Bookmark size={18} color={iconColor} />
            </View>

            <View
              style={[
                styles.bookBody,
                {
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <Image source={weekData.book.cover} style={styles.bookCover} />

              <View
                style={[
                  styles.bookInfo,
                  {
                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bookTitle,
                    {
                      color: colors.text,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {getLocalized(weekData.book.title)}
                </Text>

                <Text
                  style={[
                    styles.bookAuthor,
                    {
                      color: colors.textSecondary,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {getLocalized(weekData.book.author)}
                </Text>

                <Text
                  style={[
                    styles.bookGenre,
                    {
                      color: colors.textTertiary,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                >
                  {getLocalized(weekData.book.genre)}
                </Text>

                <View style={styles.bookRating}>
                  <Star size={14} color={colors.warning} fill={colors.warning} />
                  <Text
                    style={[
                      styles.bookRatingText,
                      {
                        color: colors.text,
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
                  color: colors.textSecondary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {getLocalized(weekData.book.description)}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.secondaryButton,
                {
                  borderColor: colors.primary,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <BookOpen size={16} color={iconColor} />
              <Text
                style={[
                  styles.secondaryButtonText,
                  {
                    color: colors.primary,
                    marginLeft: isRTL ? 0 : 8,
                    marginRight: isRTL ? 8 : 0,
                  },
                ]}
              >
                {t.exploreBook || 'مشاهده کتاب'}
              </Text>

              <ChevronRight size={17} color={iconColor} />
            </TouchableOpacity>
          </View>
        </MotiView>

        <View
          style={[
            styles.reasonCard,
            {
              backgroundColor: isDark ? 'rgba(167,139,250,0.10)' : 'rgba(124,58,237,0.055)',
              borderColor: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.11)',
              flexDirection: isRTL ? 'row-reverse' : 'row',
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
            <Brain size={20} color="#FFFFFF" />
          </View>

          <View
            style={[
              styles.reasonContent,
              {
                alignItems: isRTL ? 'flex-end' : 'flex-start',
              },
            ]}
          >
            <Text
              style={[
                styles.reasonTitle,
                {
                  color: colors.text,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {t.whyThisWeek || 'چرا این هفته؟'}
            </Text>

            <Text
              style={[
                styles.reasonText,
                {
                  color: colors.textSecondary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
            >
              {getLocalized(weekData.reason)}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.navigationRow,
            {
              flexDirection: 'row',
            },
          ]}
        >
          {selectedWeek > 0 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedWeek(selectedWeek - 1)}
              accessibilityRole="button"
              accessibilityLabel={navigationLabels.previous}
              style={[
                styles.navButton,
                styles.previousButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              <ArrowLeft size={17} color={iconColor} strokeWidth={2.3} />
              <Text
                style={[
                  styles.navButtonText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {navigationLabels.previous}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navPlaceholder} />
          )}

          {selectedWeek < weeks.length - 1 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedWeek(selectedWeek + 1)}
              accessibilityRole="button"
              accessibilityLabel={navigationLabels.next}
              style={[
                styles.nextButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.nextButtonText}>{navigationLabels.next}</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={styles.navPlaceholder} />
          )}
        </View>

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
  previousButton: {
    alignSelf: 'flex-start',
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
    alignSelf: 'flex-end',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  navPlaceholder: {
    minWidth: 95,
    height: 43,
  },
  bottomSpace: {
    height: 70,
  },
});