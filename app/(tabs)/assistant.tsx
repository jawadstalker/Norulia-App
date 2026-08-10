
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Send,
  Mic,
  Brain,
  Sparkles,
  Activity,
  Pill,
  Calendar,
  FileText,
  Plus,
  ChevronDown,
  Check,
  CircleCheck,
  MessageCircle,
  Lightbulb,
} from 'lucide-react-native';
import { BorderRadius } from '../../constants/theme';

const MIN_TAP_TARGET = 44;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const suggestions = [
  {
    icon: Activity,
    label: 'analyzeSymptoms',
    color: '#EF4444',
  },
  {
    icon: Pill,
    label: 'medication',
    color: '#6366F1',
  },
  {
    icon: Calendar,
    label: 'schedule',
    color: '#8B5CF6',
  },
  {
    icon: FileText,
    label: 'protocol',
    color: '#10B981',
  },
];

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] =
    useState(false);
  const [placeholderNotice, setPlaceholderNotice] =
    useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const noticeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const responseTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const rowDir = isRTL ? 'row-reverse' : 'row';
  const reverseRowDir = isRTL ? 'row' : 'row-reverse';

  const getCurrentTime = () => {
    const now = new Date();

    return now.toLocaleTimeString(
      language === 'fa' ? 'fa-IR' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const notifyLight = () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
  };

  const handleSend = (text?: string) => {
    const messageText = (text ?? inputText).trim();

    if (!messageText) {
      return;
    }

    notifyLight();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsThinking(true);

    responseTimerRef.current = setTimeout(() => {
      const responses = [
        t.breathingExercise ||
          "I understand how you're feeling. Let's work through this together. Would you like to try a breathing exercise?",

        t.mindfulnessSession ||
          "That's a great question! Based on your cognitive patterns, I'd suggest a 5-minute mindfulness session.",

        t.progressInsight ||
          "I've analyzed your recent activities. You're making excellent progress! Keep up the great work.",

        t.weeklyReport ||
          "Let me think about that. Your cognitive health is improving steadily. Would you like to see your weekly report?",
      ];

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          responses[
            Math.floor(Math.random() * responses.length)
          ],
        isUser: false,
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      setIsThinking(false);
      responseTimerRef.current = null;
    }, 1500 + Math.random() * 1000);
  };

  const showComingSoon = (label: string) => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    ).catch(() => {});

    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }

    setPlaceholderNotice(label);

    noticeTimeoutRef.current = setTimeout(() => {
      setPlaceholderNotice(null);
    }, 1800);
  };

  const handleScroll = (event: any) => {
    const {
      contentOffset,
      contentSize,
      layoutMeasurement,
    } = event.nativeEvent;

    const distanceFromBottom =
      contentSize.height -
      contentOffset.y -
      layoutMeasurement.height;

    setShowScrollToBottom(
      distanceFromBottom > 80 && messages.length > 0
    );
  };

  const scrollToBottom = () => {
    notifyLight();

    scrollViewRef.current?.scrollToEnd({
      animated: true,
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollTimerRef.current = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        });

        scrollTimerRef.current = null;
      }, 100);
    }

    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = null;
      }
    };
  }, [messages]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }

      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#09090B', '#111116']
          : ['#F1F3FF', '#FFFFFF', '#F8FAFC']
      }
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.container}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 90 : 0
        }
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
            type: 'timing',
            duration: 400,
          }}
          style={styles.header}
        >
          <View
            style={[
              styles.headerTop,
              {
                flexDirection: rowDir,
              },
            ]}
          >
            <View
              style={[
                styles.aiAvatar,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Image
                source={require('../../assets/avatars/model 2.jpg')}
                style={styles.aiAvatarImage}
              />

              <View
                style={[
                  styles.onlineIndicator,
                  {
                    borderColor: colors.background,
                  },
                ]}
              />
            </View>

            <View style={styles.identity}>
              <View
                style={[
                  styles.nameRow,
                  {
                    flexDirection: rowDir,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.aiName,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {t.novaAI}
                </Text>

                <View
                  style={[
                    styles.nameBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(99,102,241,0.16)'
                        : 'rgba(99,102,241,0.08)',
                    },
                  ]}
                >
                  <Sparkles
                    size={13}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                </View>
              </View>

              <Text
                style={[
                  styles.aiSubtitle,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {t.cognitiveCompanion}
              </Text>

              <View
                style={[
                  styles.statusRow,
                  {
                    flexDirection: rowDir,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: '#4ADE80',
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {t.online}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() =>
                showComingSoon(
                  language === 'fa'
                    ? 'گزینه‌های بیشتر به‌زودی'
                    : 'More options coming soon'
                )
              }
              style={[
                styles.headerButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.055)'
                    : 'rgba(15,23,42,0.045)',
                },
              ]}
            >
              <ChevronDown
                size={19}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </MotiView>

        <MotiView
          from={{
            opacity: 0,
            translateY: 10,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 80,
          }}
          style={[
            styles.memoryCard,
            {
              backgroundColor: isDark
                ? 'rgba(99,102,241,0.09)'
                : 'rgba(99,102,241,0.05)',
              borderColor: isDark
                ? 'rgba(99,102,241,0.18)'
                : 'rgba(99,102,241,0.11)',
            },
          ]}
        >
          <View
            style={[
              styles.memoryHeader,
              {
                flexDirection: rowDir,
              },
            ]}
          >
            <View
              style={[
                styles.memoryIcon,
                {
                  backgroundColor: isDark
                    ? 'rgba(99,102,241,0.17)'
                    : 'rgba(99,102,241,0.09)',
                },
              ]}
            >
              <Brain
                size={19}
                color={colors.primary}
                strokeWidth={2}
              />
            </View>

            <View style={styles.memoryInfo}>
              <Text
                style={[
                  styles.memoryTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.memoryActive}
              </Text>

              <Text
                style={[
                  styles.memoryDescription,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'اطلاعات مهم شما در حافظه فعال است'
                  : 'Important information is available in memory'}
              </Text>
            </View>

            <View
              style={[
                styles.memoryStatus,
                {
                  backgroundColor: isDark
                    ? 'rgba(74,222,128,0.11)'
                    : 'rgba(74,222,128,0.08)',
                },
              ]}
            >
              <CircleCheck
                size={17}
                color="#4ADE80"
                strokeWidth={2}
              />
            </View>
          </View>

          <View
            style={[
              styles.memoryDivider,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.07)'
                  : 'rgba(15,23,42,0.07)',
              },
            ]}
          />

          <View style={styles.memoryList}>
            {[
              t.medicationData,
              t.dailyGoals,
              t.healthData,
            ].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.memoryItem,
                  {
                    flexDirection: rowDir,
                  },
                ]}
              >
                <Check
                  size={14}
                  color="#4ADE80"
                  strokeWidth={2.5}
                />

                <Text
                  style={[
                    styles.memoryText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </MotiView>

        <View style={styles.messagesArea}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={100}
          >
            {messages.length === 0 && (
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 18,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 450,
                }}
                style={styles.welcomeContainer}
              >
                <View
                  style={[
                    styles.welcomeIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(99,102,241,0.14)'
                        : 'rgba(99,102,241,0.08)',
                    },
                  ]}
                >
                  <MessageCircle
                    size={23}
                    color={colors.primary}
                    strokeWidth={2}
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
                  {t.hello}
                </Text>

                <Text
                  style={[
                    styles.welcomeText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {t.cognitiveCompanion}
                </Text>

                <Text
                  style={[
                    styles.welcomeSubtext,
                    {
                      color: colors.textTertiary,
                    },
                  ]}
                >
                  {t.howCanHelp}
                </Text>

                <View style={styles.suggestionHeader}>
                  <Text
                    style={[
                      styles.suggestionTitle,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? 'دسترسی سریع'
                      : 'Quick actions'}
                  </Text>

                  <Lightbulb
                    size={17}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                </View>

                <View style={styles.suggestionsGrid}>
                  {suggestions.map(
                    (suggestion, index) => {
                      const Icon = suggestion.icon;

                      const labelText =
                        t[
                          suggestion.label as keyof typeof t
                        ] || suggestion.label;

                      return (
                        <MotiView
                          key={suggestion.label}
                          from={{
                            opacity: 0,
                            translateY: 8,
                          }}
                          animate={{
                            opacity: 1,
                            translateY: 0,
                          }}
                          transition={{
                            type: 'timing',
                            duration: 300,
                            delay: index * 60,
                          }}
                          style={styles.suggestionWrapper}
                        >
                          <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={labelText}
                            style={[
                              styles.suggestionButton,
                              {
                                backgroundColor:
                                  isDark
                                    ? colors.surface
                                    : '#FFFFFF',
                                borderColor:
                                  colors.border,
                              },
                            ]}
                            onPress={() =>
                              handleSend(labelText)
                            }
                          >
                            <View
                              style={[
                                styles.suggestionIconBg,
                                {
                                  backgroundColor:
                                    `${suggestion.color}15`,
                                },
                              ]}
                            >
                              <Icon
                                size={21}
                                color={suggestion.color}
                                strokeWidth={2}
                              />
                            </View>

                            <Text
                              numberOfLines={2}
                              style={[
                                styles.suggestionLabel,
                                {
                                  color: colors.text,
                                },
                              ]}
                            >
                              {labelText}
                            </Text>
                          </TouchableOpacity>
                        </MotiView>
                      );
                    }
                  )}
                </View>
              </MotiView>
            )}

            {messages.map((message, index) => (
              <MotiView
                key={message.id}
                from={{
                  opacity: 0,
                  translateY: 14,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 300,
                  delay:
                    index === messages.length - 1
                      ? 80
                      : 0,
                }}
                style={[
                  styles.messageWrapper,
                  {
                    flexDirection: message.isUser
                      ? reverseRowDir
                      : rowDir,
                  },
                ]}
              >
                {!message.isUser && (
                  <View
                    style={[
                      styles.messageAvatar,
                      {
                        backgroundColor:
                          colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <Image
                      source={require('../../assets/avatars/model 2.jpg')}
                      style={styles.messageAvatarImage}
                    />
                  </View>
                )}

                <View style={styles.messageContent}>
                  {!message.isUser && (
                    <Text
                      style={[
                        styles.senderName,
                        {
                          color:
                            colors.textSecondary,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {t.novaAI}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      message.isUser
                        ? isRTL
                          ? styles.userBubbleRTL
                          : styles.userBubbleLTR
                        : isRTL
                          ? styles.botBubbleRTL
                          : styles.botBubbleLTR,
                      {
                        backgroundColor:
                          message.isUser
                            ? 'transparent'
                            : isDark
                              ? colors.surface
                              : '#FFFFFF',
                        borderColor:
                          message.isUser
                            ? 'transparent'
                            : colors.border,
                        borderWidth:
                          message.isUser ? 0 : 1,
                      },
                    ]}
                  >
                    {message.isUser ? (
                      <LinearGradient
                        colors={[
                          colors.primary,
                          '#8B5CF6',
                        ]}
                        start={{
                          x: 0,
                          y: 0,
                        }}
                        end={{
                          x: 1,
                          y: 1,
                        }}
                        style={[
                          styles.gradientBubble,
                          isRTL
                            ? styles.userBubbleRTL
                            : styles.userBubbleLTR,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            {
                              color: '#FFFFFF',
                              textAlign: isRTL
                                ? 'right'
                                : 'left',
                            },
                          ]}
                        >
                          {message.text}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={styles.botBubbleContent}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            {
                              color: colors.text,
                              textAlign: isRTL
                                ? 'right'
                                : 'left',
                            },
                          ]}
                        >
                          {message.text}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.timestamp,
                      {
                        color: colors.textTertiary,
                        textAlign:
                          message.isUser
                            ? isRTL
                              ? 'left'
                              : 'right'
                            : isRTL
                              ? 'right'
                              : 'left',
                      },
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                </View>
              </MotiView>
            ))}

            {isTyping && (
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 8,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 250,
                }}
                style={[
                  styles.messageWrapper,
                  {
                    flexDirection: rowDir,
                  },
                ]}
              >
                <View
                  style={[
                    styles.messageAvatar,
                    {
                      backgroundColor:
                        colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/avatars/model 2.jpg')}
                    style={styles.messageAvatarImage}
                  />
                </View>

                <View
                  style={[
                    styles.typingBubble,
                    {
                      backgroundColor: isDark
                        ? colors.surface
                        : '#FFFFFF',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typingText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {isThinking
                      ? t.analyzing
                      : t.thinking}
                  </Text>

                  <View
                    style={[
                      styles.typingDots,
                      {
                        flexDirection: rowDir,
                      },
                    ]}
                  >
                    {[0, 150, 300].map(
                      (delay, index) => (
                        <MotiView
                          key={index}
                          from={{
                            opacity: 0.3,
                            scale: 0.75,
                          }}
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.75, 1, 0.75],
                          }}
                          transition={{
                            loop: true,
                            duration: 700,
                            delay,
                            type: 'timing',
                          }}
                          style={[
                            styles.typingDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />
                      )
                    )}
                  </View>
                </View>
              </MotiView>
            )}
          </ScrollView>

          <AnimatePresence>
            {showScrollToBottom && (
              <MotiView
                from={{
                  opacity: 0,
                  scale: 0.85,
                  translateY: 8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  translateY: 8,
                }}
                transition={{
                  type: 'timing',
                  duration: 200,
                }}
                style={styles.scrollToBottomWrap}
              >
                <TouchableOpacity
                  onPress={scrollToBottom}
                  accessibilityRole="button"
                  accessibilityLabel={
                    language === 'fa'
                      ? 'رفتن به آخرین پیام'
                      : 'Go to latest message'
                  }
                  style={[
                    styles.scrollToBottomButton,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <ChevronDown
                    size={20}
                    color="#FFFFFF"
                    strokeWidth={2.2}
                  />
                </TouchableOpacity>
              </MotiView>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {placeholderNotice && (
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 8,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  translateY: 8,
                }}
                transition={{
                  type: 'timing',
                  duration: 200,
                }}
                style={[
                  styles.noticeToast,
                  {
                    backgroundColor: isDark
                      ? colors.surface
                      : '#1F2937',
                  },
                ]}
              >
                <Text style={styles.noticeToastText}>
                  {placeholderNotice}
                </Text>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <MotiView
          from={{
            opacity: 0,
            translateY: 16,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 350,
            delay: 150,
          }}
          style={[
            styles.inputContainer,
            {
              backgroundColor: isDark
                ? 'rgba(24,24,27,0.96)'
                : 'rgba(255,255,255,0.96)',
              borderColor: colors.border,
              marginBottom:
                insets.bottom > 0
                  ? insets.bottom
                  : 8,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.inputAction}
            accessibilityRole="button"
            accessibilityLabel={
              language === 'fa'
                ? 'پیوست فایل'
                : 'Attach file'
            }
            onPress={() =>
              showComingSoon(
                language === 'fa'
                  ? 'این قابلیت به‌زودی اضافه می‌شود'
                  : 'Coming soon'
              )
            }
          >
            <Plus
              size={21}
              color={colors.textTertiary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t.askNova}
            placeholderTextColor={
              colors.textTertiary
            }
            multiline
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSend()}
          />

          <TouchableOpacity
            style={styles.micButton}
            accessibilityRole="button"
            accessibilityLabel={
              language === 'fa'
                ? 'ورودی صوتی'
                : 'Voice input'
            }
            onPress={() =>
              showComingSoon(
                language === 'fa'
                  ? 'ورودی صوتی به‌زودی اضافه می‌شود'
                  : 'Voice input coming soon'
              )
            }
          >
            <Mic
              size={20}
              color={colors.textTertiary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSend()}
            accessibilityRole="button"
            accessibilityLabel={
              language === 'fa'
                ? 'ارسال'
                : 'Send'
            }
            activeOpacity={0.75}
            disabled={!inputText.trim()}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim().length > 0
                    ? colors.primary
                    : isDark
                      ? '#27272A'
                      : '#E5E7EB',
                opacity:
                  inputText.trim().length > 0
                    ? 1
                    : 0.75,
              },
            ]}
          >
            <Send
              size={19}
              color={
                inputText.trim().length > 0
                  ? '#FFFFFF'
                  : isDark
                    ? '#71717A'
                    : '#9CA3AF'
              }
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </MotiView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },

  header: {
    width: '100%',
    paddingVertical: 8,
  },

  headerTop: {
    width: '100%',
    alignItems: 'center',
  },

  aiAvatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },

  aiAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },

  onlineIndicator: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
  },

  identity: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 11,
  },

  nameRow: {
    alignItems: 'center',
  },

  aiName: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
  },

  nameBadge: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 7,
  },

  aiSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },

  statusRow: {
    alignItems: 'center',
    marginTop: 3,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 5,
  },

  statusText: {
    fontSize: 11,
    lineHeight: 15,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memoryCard: {
    width: '100%',
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },

  memoryHeader: {
    alignItems: 'center',
    minHeight: 42,
  },

  memoryIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memoryInfo: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
  },

  memoryTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },

  memoryDescription: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  memoryStatus: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  memoryDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },

  memoryList: {
    gap: 8,
  },

  memoryItem: {
    minHeight: 20,
    alignItems: 'center',
  },

  memoryText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    marginHorizontal: 8,
  },

  messagesArea: {
    flex: 1,
    minHeight: 0,
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 12,
  },

  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
  },

  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 11,
  },

  welcomeTitle: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },

  welcomeText: {
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },

  welcomeSubtext: {
    maxWidth: 320,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
    textAlign: 'center',
  },

  suggestionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },

  suggestionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  suggestionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  suggestionWrapper: {
    width: '48.3%',
  },

  suggestionButton: {
    width: '100%',
    minHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  suggestionLabel: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 2,
  },

  messageWrapper: {
    width: '100%',
    marginBottom: 14,
    alignItems: 'flex-end',
    paddingHorizontal: 8,
  },

  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 7,
    overflow: 'hidden',
  },

  messageAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 11,
  },

  messageContent: {
    maxWidth: '72%',
    minWidth: 0,
  },

  senderName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
    marginHorizontal: 4,
  },

  messageBubble: {
    maxWidth: '100%',
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 1,
    overflow: 'hidden',
  },

  userBubbleLTR: {
    borderTopRightRadius: 5,
  },

  userBubbleRTL: {
    borderTopLeftRadius: 5,
  },

  botBubbleLTR: {
    borderTopLeftRadius: 5,
  },

  botBubbleRTL: {
    borderTopRightRadius: 5,
  },

  gradientBubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  botBubbleContent: {
    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
    marginHorizontal: 4,
  },

  typingBubble: {
    minHeight: 42,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingText: {
    fontSize: 12,
    marginHorizontal: 5,
  },

  typingDots: {
    alignItems: 'center',
  },

  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 2,
  },

  scrollToBottomWrap: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },

  scrollToBottomButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: MIN_TAP_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },

  noticeToast: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },

  noticeToastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  inputContainer: {
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  inputAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  micButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    fontSize: 15,
    lineHeight: 20,
    paddingHorizontal: 4,
    paddingVertical: 9,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    marginRight: 0,
  },
});

