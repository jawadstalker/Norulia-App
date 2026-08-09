import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

import {
  Zap,
  Lightbulb,
  BrainCog,
  Eye,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import {
  DomainResult,
  CognitiveDomain,
} from '../../context/AssessmentContext';

import { scoreLevel } from './types';

const DOMAIN_META: Record<
  CognitiveDomain,
  {
    icon: any;
    color: string;
    fa: string;
    en: string;
  }
> = {
  speed: {
    icon: Zap,
    color: '#F59E0B',
    fa: 'سرعت واکنش',
    en: 'Reaction Speed',
  },

  logic: {
    icon: Lightbulb,
    color: '#8B5CF6',
    fa: 'استدلال منطقی',
    en: 'Logic & Reasoning',
  },

  memory: {
    icon: BrainCog,
    color: '#10B981',
    fa: 'حافظه کاری',
    en: 'Working Memory',
  },

  attention: {
    icon: Eye,
    color: '#3B82F6',
    fa: 'تمرکز و توجه',
    en: 'Attention & Focus',
  },
};

const DOMAIN_ORDER: CognitiveDomain[] = [
  'speed',
  'logic',
  'memory',
  'attention',
];

interface Props {
  results: DomainResult[];
  onEnterApp: () => void;
}

function ScoreBar({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const safeScore = Math.max(
    0,
    Math.min(100, score)
  );

  return (
    <View style={styles.scoreBarTrack}>
      <View
        style={[
          styles.scoreBarFill,
          {
            width: `${safeScore}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

export default function AssessmentReport({
  results,
  onEnterApp,
}: Props) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const isFa = language === 'fa';

  const byDomain = useMemo(() => {
    const map: Partial<
      Record<CognitiveDomain, DomainResult>
    > = {};

    results.forEach((result) => {
      map[result.domain] = result;
    });

    return map;
  }, [results]);

  const overall = useMemo(() => {
    if (!results.length) {
      return 0;
    }

    const total = results.reduce(
      (sum, result) => sum + result.score,
      0
    );

    return Math.round(
      total / results.length
    );
  }, [results]);

  const handleEnterApp = () => {
    console.log(
      '================================'
    );

    console.log(
      '[ASSESSMENT REPORT] ENTER APP PRESSED'
    );

    console.log(
      '[ASSESSMENT REPORT] Results:',
      results
    );

    console.log(
      '[ASSESSMENT REPORT] onEnterApp type:',
      typeof onEnterApp
    );

    if (
      typeof onEnterApp !== 'function'
    ) {
      console.error(
        '[ASSESSMENT REPORT] ERROR: onEnterApp is not a function'
      );

      return;
    }

    try {
      onEnterApp();

      console.log(
        '[ASSESSMENT REPORT] onEnterApp called'
      );
    } catch (error) {
      console.error(
        '[ASSESSMENT REPORT] onEnterApp error:',
        error
      );
    }

    console.log(
      '================================'
    );
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Spacing.xxl + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View
            style={[
              styles.successIcon,
              {
                backgroundColor:
                  colors.primary + '18',
              },
            ]}
          >
            <CheckCircle2
              size={34}
              color={colors.primary}
              strokeWidth={2.5}
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            {isFa
              ? 'پروفایل شناختی تو آماده است'
              : 'Your Cognitive Profile Is Ready'}
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {isFa
              ? 'نتیجه ارزیابی اولیه‌ات آماده شده. نورا می‌تواند بر اساس این پروفایل تجربه شخصی‌تری برایت بسازد.'
              : 'Your initial assessment is complete. Nora can use this profile to personalize your experience.'}
          </Text>
        </View>

        {/* OVERALL SCORE */}

        <View
          style={[
            styles.overallCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.overallLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {isFa
              ? 'امتیاز کلی'
              : 'Overall Score'}
          </Text>

          <View
            style={styles.scoreRow}
          >
            <Text
              style={[
                styles.overallScore,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {overall}
            </Text>

            <Text
              style={[
                styles.scoreOutOf,
                {
                  color:
                    colors.textTertiary,
                },
              ]}
            >
              /100
            </Text>
          </View>

          <Text
            style={[
              styles.overallTier,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {scoreLevel(
              overall,
              language
            )}
          </Text>

          <ScoreBar
            score={overall}
            color={colors.primary}
          />
        </View>

        {/* SECTION TITLE */}

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {isFa
              ? 'نتایج حوزه‌ها'
              : 'Your Results'}
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {isFa
              ? 'عملکردت در چهار حوزه شناختی'
              : 'Your performance across four cognitive domains'}
          </Text>
        </View>

        {/* DOMAIN CARDS */}

        <View style={styles.domains}>
          {DOMAIN_ORDER.map(
            (domain) => {
              const result =
                byDomain[domain];

              const meta =
                DOMAIN_META[domain];

              const Icon = meta.icon;

              const score =
                result?.score ?? 0;

              return (
                <View
                  key={domain}
                  style={[
                    styles.domainCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.domainTop
                    }
                  >
                    <View
                      style={[
                        styles.domainIcon,
                        {
                          backgroundColor:
                            meta.color +
                            '18',
                        },
                      ]}
                    >
                      <Icon
                        size={21}
                        color={
                          meta.color
                        }
                        strokeWidth={2.3}
                      />
                    </View>

                    <View
                      style={
                        styles.domainInfo
                      }
                    >
                      <Text
                        style={[
                          styles.domainTitle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {isFa
                          ? meta.fa
                          : meta.en}
                      </Text>

                      <Text
                        style={[
                          styles.domainDetail,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {result?.detail ||
                          (isFa
                            ? 'اطلاعاتی ثبت نشده'
                            : 'No details available')}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.scoreBadge,
                        {
                          backgroundColor:
                            meta.color +
                            '15',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.domainScore,
                          {
                            color:
                              meta.color,
                          },
                        ]}
                      >
                        {score}
                      </Text>
                    </View>
                  </View>

                  <ScoreBar
                    score={score}
                    color={meta.color}
                  />

                  <View
                    style={
                      styles.domainBottom
                    }
                  >
                    <Text
                      style={[
                        styles.domainTier,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {scoreLevel(
                        score,
                        language
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.percentText,
                        {
                          color:
                            colors.textTertiary,
                        },
                      ]}
                    >
                      {score}%
                    </Text>
                  </View>
                </View>
              );
            }
          )}
        </View>

        {/* INFO */}

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor:
                colors.surfaceSecondary ||
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.infoTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {isFa
              ? 'یک نکته مهم'
              : 'A quick note'}
          </Text>

          <Text
            style={[
              styles.infoText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {isFa
              ? 'این ارزیابی یک سنجش اولیه و سرگرم‌کننده است و تشخیص پزشکی یا بالینی محسوب نمی‌شود.'
              : 'This is a light first-pass assessment and is not a clinical or medical diagnosis.'}
          </Text>
        </View>

        {/* ENTER APP BUTTON */}

        <Pressable
          onPress={handleEnterApp}
          accessibilityRole="button"
          accessibilityLabel={
            isFa
              ? 'ورود به اپ'
              : 'Enter the app'
          }
          android_ripple={{
            color:
              'rgba(255,255,255,0.18)',
          }}
          style={({ pressed }) => [
            styles.enterButton,
            {
              backgroundColor:
                colors.primary,
              opacity: pressed
                ? 0.82
                : 1,
              transform: [
                {
                  scale: pressed
                    ? 0.98
                    : 1,
                },
              ],
            },
          ]}
        >
          <Text
            style={
              styles.enterButtonText
            }
          >
            {isFa
              ? 'ورود به اپ'
              : 'Enter the App'}
          </Text>

          <ArrowLeft
            size={22}
            color="#FFFFFF"
            strokeWidth={2.5}
          />
        </Pressable>

        <Text
          style={[
            styles.bottomHint,
            {
              color:
                colors.textTertiary,
            },
          ]}
        >
          {isFa
            ? 'با ورود، به صفحه اصلی نورا منتقل می‌شوی'
            : "You'll be taken to Nora's home screen"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },

  scroll: {
    flex: 1,
    width: '100%',
  },

  scrollContent: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    alignItems: 'stretch',
  },

  header: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: Spacing.lg,
  },

  successIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  title: {
    width: '100%',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  subtitle: {
    width: '100%',
    maxWidth: 430,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
  },

  overallCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  overallLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },

  overallScore: {
    fontSize: 52,
    lineHeight: 60,
    fontWeight: '900',
  },

  scoreOutOf: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },

  overallTier: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: Spacing.md,
  },

  scoreBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor:
      'rgba(128,128,128,0.14)',
  },

  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  sectionHeader: {
    width: '100%',
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },

  domains: {
    width: '100%',
  },

  domainCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 12,
  },

  domainTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  domainIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  domainInfo: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },

  domainTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  domainDetail: {
    fontSize: 11,
    lineHeight: 17,
  },

  scoreBadge: {
    minWidth: 48,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  domainScore: {
    fontSize: 19,
    fontWeight: '900',
  },

  domainBottom: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  domainTier: {
    fontSize: 11,
    fontWeight: '700',
  },

  percentText: {
    fontSize: 10,
    fontWeight: '600',
  },

  infoCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 11,
    lineHeight: 18,
  },

  enterButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  bottomHint: {
    width: '100%',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    marginTop: Spacing.sm,
  },
});