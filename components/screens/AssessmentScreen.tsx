import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import {
  MotiView,
  AnimatePresence,
} from 'moti';

import {
  Brain,
  Zap,
  Lightbulb,
  BrainCog,
  Eye,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { DomainResult } from '../../context/AssessmentContext';

import ReactionSpeedStage from '../assessment/ReactionSpeedStage';
import LogicPatternStage from '../assessment/LogicPatternStage';
import MemorySequenceStage from '../assessment/MemorySequenceStage';
import AttentionFocusStage from '../assessment/AttentionFocusStage';
import AssessmentReport from '../assessment/AssessmentReport';


const STAGES = [
  {
    key: 'speed',
    Component: ReactionSpeedStage,
    icon: Zap,
    fa: 'سرعت واکنش',
    en: 'Reaction Speed',
  },
  {
    key: 'logic',
    Component: LogicPatternStage,
    icon: Lightbulb,
    fa: 'استدلال منطقی',
    en: 'Logic & Reasoning',
  },
  {
    key: 'memory',
    Component: MemorySequenceStage,
    icon: BrainCog,
    fa: 'حافظه کاری',
    en: 'Working Memory',
  },
  {
    key: 'attention',
    Component: AttentionFocusStage,
    icon: Eye,
    fa: 'تمرکز و توجه',
    en: 'Attention & Focus',
  },
] as const;


type Phase =
  | 'welcome'
  | 'stage'
  | 'report';


interface Props {
  onComplete: (
    results: DomainResult[]
  ) => void;
}


export function AssessmentScreen({
  onComplete,
}: Props) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [phase, setPhase] =
    useState<Phase>('welcome');

  const [stageIndex, setStageIndex] =
    useState(0);

  const [results, setResults] =
    useState<DomainResult[]>([]);


  const handleStageComplete = (
    result: DomainResult
  ) => {
    const newResults = [
      ...results,
      result,
    ];

    setResults(newResults);

    const next =
      stageIndex + 1;

    if (next >= STAGES.length) {
      setPhase('report');
    } else {
      setStageIndex(next);
    }
  };


  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >

      {phase === 'stage' && (
        <View style={styles.progressBar}>
          {STAGES.map((s, i) => (
            <View
              key={s.key}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    i <= stageIndex
                      ? colors.primary
                      : colors.surfaceSecondary,
                },
              ]}
            />
          ))}
        </View>
      )}


      <View style={styles.content}>

        <AnimatePresence
          exitBeforeEnter
        >

          {/* =========================
              WELCOME
          ========================= */}
          {phase === 'welcome' && (
            <MotiView
              key="welcome"
              from={{
                opacity: 0,
                translateY: 12,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              exit={{
                opacity: 0,
                translateY: -12,
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={styles.welcomeWrap}
            >

              <View
                style={[
                  styles.brainIcon,
                  {
                    backgroundColor:
                      colors.primary + '22',
                  },
                ]}
              >
                <Brain
                  size={40}
                  color={colors.primary}
                />
              </View>


              <Text
                style={[
                  styles.welcomeTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'ارزیابی شناختی اولیه'
                  : 'Initial Cognitive Assessment'}
              </Text>


              <Text
                style={[
                  styles.welcomeDesc,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'پیش از ورود به اپ، در ۴ آزمون کوتاه شرکت می‌کنی تا نورا یک پروفایل شناختی اولیه از تو بسازد. هر آزمون کاملاً با بقیه فرق دارد و فقط چند دقیقه زمان می‌برد.'
                  : "Before entering the app, you'll go through 4 short tests so Nora can build your initial cognitive profile. Each test is completely different and takes just a few minutes."}
              </Text>


              <View style={styles.stagesList}>

                {STAGES.map((s, i) => {
                  const Icon = s.icon;

                  return (
                    <View
                      key={s.key}
                      style={[
                        styles.stageRow,
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
                          styles.stageNumber,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.stageNumberText
                          }
                        >
                          {i + 1}
                        </Text>
                      </View>


                      <Icon
                        size={18}
                        color={colors.primary}
                        style={{
                          marginHorizontal:
                            Spacing.sm,
                        }}
                      />


                      <Text
                        style={[
                          styles.stageRowText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {language === 'fa'
                          ? s.fa
                          : s.en}
                      </Text>

                    </View>
                  );
                })}

              </View>


              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  setPhase('stage')
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  {language === 'fa'
                    ? 'شروع ارزیابی'
                    : 'Start Assessment'}
                </Text>
              </TouchableOpacity>

            </MotiView>
          )}


          {/* =========================
              STAGES
          ========================= */}
          {phase === 'stage' && (
            <MotiView
              key={`stage-${stageIndex}`}
              from={{
                opacity: 0,
                translateX: 20,
              }}
              animate={{
                opacity: 1,
                translateX: 0,
              }}
              exit={{
                opacity: 0,
                translateX: -20,
              }}
              transition={{
                type: 'timing',
                duration: 250,
              }}
              style={styles.stageWrap}
            >

              <Text
                style={[
                  styles.stageIndexLabel,
                  {
                    color:
                      colors.textTertiary,
                  },
                ]}
              >
                {language === 'fa'
                  ? `مرحله ${
                      stageIndex + 1
                    } از ${STAGES.length}`
                  : `Stage ${
                      stageIndex + 1
                    } of ${STAGES.length}`}
              </Text>


              {(() => {
                const Stage =
                  STAGES[stageIndex]
                    .Component;

                return (
                  <Stage
                    onComplete={
                      handleStageComplete
                    }
                  />
                );
              })()}

            </MotiView>
          )}


          {/* =========================
              REPORT
          ========================= */}
          {phase === 'report' && (
            <MotiView
              key="report"
              from={{
                opacity: 0,
                translateY: 12,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: 'timing',
                duration: 300,
              }}
              style={styles.reportWrap}
            >
              <AssessmentReport
                results={results}
                onEnterApp={() =>
                  onComplete(results)
                }
              />
            </MotiView>
          )}

        </AnimatePresence>

      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
  },

  progressBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  progressDot: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
  },

  welcomeWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  brainIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  welcomeDesc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  stagesList: {
    width: '100%',
    gap: 10,
    marginBottom: Spacing.xl,
  },

  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginBottom: 2,
  },

  stageNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stageNumberText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },

  stageRowText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  stageWrap: {
    flex: 1,
    justifyContent: 'center',
  },

  stageIndexLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  reportWrap: {
    flex: 1,
  },

});