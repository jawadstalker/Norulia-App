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

import {
  Send,
  Mic,
  Plus,
  Sparkles,
  Activity,
  Pill,
  Calendar,
  FileText,
  MessageCircle,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
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
  },
  {
    icon: Pill,
    label: 'medication',
  },
  {
    icon: Calendar,
    label: 'schedule',
  },
  {
    icon: FileText,
    label: 'protocol',
  },
];

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const responseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rowDirection = isRTL ? 'row-reverse' : 'row';

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString(
      language === 'fa' ? 'fa-IR' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const lightHaptic = () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
  };

  const showNotice = (message: string) => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Warning
    ).catch(() => {});

    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }

    setNotice(message);

    noticeTimer.current = setTimeout(() => {
      setNotice(null);
    }, 1800);
  };

  const handleSend = (value?: string) => {
    const text = (value ?? inputText).trim();

    if (!text || isTyping) {
      return;
    }

    lightHaptic();

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text,
      isUser: true,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    responseTimer.current = setTimeout(() => {
      const responses = [
        t.breathingExercise ||
          "I understand. Let's work through this together. Would you like to try a short breathing exercise?",

        t.mindfulnessSession ||
          'Based on your recent activity, a short mindfulness session could be helpful.',

        t.progressInsight ||
          "You're making good progress. Keep following your daily routine.",

        t.weeklyReport ||
          'I can help you review your recent progress and organize your next steps.',
      ];

      const response: Message = {
        id: `${Date.now()}-assistant`,
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: getCurrentTime(),
      };

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      responseTimer.current = null;
    }, 1300 + Math.random() * 900);
  };

  const handleScroll = (event: any) => {
    const {
      contentOffset,
      contentSize,
      layoutMeasurement,
    } = event.nativeEvent;

    const distance =
      contentSize.height -
      contentOffset.y -
      layoutMeasurement.height;

    setShowScrollButton(
      distance > 100 && messages.length > 0
    );
  };

  const scrollToBottom = () => {
    lightHaptic();

    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  };

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    scrollTimer.current = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 80);

    return () => {
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [messages]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }

      if (responseTimer.current) {
        clearTimeout(responseTimer.current);
      }

      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, []);

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#09090B', '#101014']
          : ['#F7F8FF', '#FFFFFF']
      }
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios' ? 'padding' : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 88 : 0
        }
      >

        {/* =====================================================
            HEADER
           ===================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: -12,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 350,
          }}
          style={[
            styles.header,
            {
              paddingTop: Math.max(insets.top, 8),
            },
          ]}
        >
          <View
            style={[
              styles.headerContent,
              {
                flexDirection: rowDirection,
              },
            ]}
          >
            <View
              style={[
                styles.avatarWrapper,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Image
                source={require('../../assets/avatars/model 2.jpg')}
                style={styles.avatar}
              />

              <View
                style={[
                  styles.onlineDot,
                  {
                    borderColor: isDark
                      ? '#101014'
                      : '#FFFFFF',
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.headerIdentity,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <View
                style={[
                  styles.nameLine,
                  {
                    flexDirection: rowDirection,
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
                  {t.novaAI || 'Nova AI'}
                </Text>

                <View
                  style={[
                    styles.aiBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(99,102,241,0.18)'
                        : 'rgba(99,102,241,0.10)',
                    },
                  ]}
                >
                  <Sparkles
                    size={12}
                    color={colors.primary}
                    strokeWidth={2.3}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.onlineRow,
                  {
                    flexDirection: rowDirection,
                  },
                ]}
              >
                <View style={styles.onlineIndicator} />

                <Text
                  style={[
                    styles.onlineText,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {t.online || 'Online'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                showNotice(
                  language === 'fa'
                    ? 'گزینه‌های بیشتر به‌زودی'
                    : 'More options coming soon'
                )
              }
              style={[
                styles.moreButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.055)'
                    : 'rgba(15,23,42,0.045)',
                },
              ]}
            >
              <MoreHorizontal
                size={21}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.headerLine,
              {
                backgroundColor: colors.border,
              },
            ]}
          />
        </MotiView>

        {/* =====================================================
            CHAT AREA
           ===================================================== */}

        <View style={styles.chatArea}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              messages.length === 0 && styles.emptyScroll,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={100}
          >

            {/* ================= EMPTY STATE ================= */}

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
                style={styles.welcome}
              >
                <View
                  style={[
                    styles.welcomeIcon,
                    {
                      backgroundColor: isDark
                        ? 'rgba(99,102,241,0.14)'
                        : 'rgba(99,102,241,0.09)',
                    },
                  ]}
                >
                  <MessageCircle
                    size={25}
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
                  {t.hello || 'Hello'}
                </Text>

                <Text
                  style={[
                    styles.welcomeDescription,
                    {
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  {t.cognitiveCompanion ||
                    'Your cognitive companion'}
                </Text>

                <Text
                  style={[
                    styles.welcomeHint,
                    {
                      color: colors.textTertiary,
                    },
                  ]}
                >
                  {t.howCanHelp ||
                    'How can I help you today?'}
                </Text>

                <View style={styles.quickActions}>
                  {suggestions.map(
                    (suggestion, index) => {
                      const Icon = suggestion.icon;

                      const label =
                        t[
                          suggestion.label as keyof typeof t
                        ] || suggestion.label;

                      return (
                        <MotiView
                          key={suggestion.label}
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
                            duration: 300,
                            delay: index * 70,
                          }}
                          style={styles.quickActionWrapper}
                        >
                          <TouchableOpacity
                            activeOpacity={0.78}
                            onPress={() =>
                              handleSend(label)
                            }
                            style={[
                              styles.quickAction,
                              {
                                backgroundColor:
                                  isDark
                                    ? colors.surface
                                    : '#FFFFFF',
                                borderColor:
                                  colors.border,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.quickIcon,
                                {
                                  backgroundColor:
                                    isDark
                                      ? 'rgba(99,102,241,0.12)'
                                      : 'rgba(99,102,241,0.07)',
                                },
                              ]}
                            >
                              <Icon
                                size={20}
                                color={colors.primary}
                                strokeWidth={2}
                              />
                            </View>

                            <Text
                              numberOfLines={2}
                              style={[
                                styles.quickLabel,
                                {
                                  color: colors.text,
                                },
                              ]}
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>
                        </MotiView>
                      );
                    }
                  )}
                </View>
              </MotiView>
            )}

            {/* ================= MESSAGES ================= */}

            {messages.map((message, index) => (
              <MotiView
                key={message.id}
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
                  duration: 280,
                  delay:
                    index === messages.length - 1
                      ? 50
                      : 0,
                }}
                style={[
                  styles.messageRow,
                  {
                    flexDirection: message.isUser
                      ? isRTL
                        ? 'row'
                        : 'row-reverse'
                      : rowDirection,
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

                <View style={styles.messageColumn}>
                  {!message.isUser && (
                    <Text
                      style={[
                        styles.sender,
                        {
                          color: colors.textSecondary,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {t.novaAI || 'Nova AI'}
                    </Text>
                  )}

                  {message.isUser ? (
                    <LinearGradient
                      colors={[
                        colors.primary,
                        '#8B5CF6',
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.userBubble,
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
                      style={[
                        styles.botBubble,
                        {
                          backgroundColor: isDark
                            ? colors.surface
                            : '#FFFFFF',
                          borderColor: colors.border,
                        },
                        isRTL
                          ? styles.botBubbleRTL
                          : styles.botBubbleLTR,
                      ]}
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

                  <Text
                    style={[
                      styles.timestamp,
                      {
                        color: colors.textTertiary,
                        textAlign: message.isUser
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

            {/* ================= TYPING ================= */}

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
                  duration: 220,
                }}
                style={[
                  styles.messageRow,
                  {
                    flexDirection: rowDirection,
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
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {t.analyzing || 'Thinking'}
                  </Text>

                  <View
                    style={[
                      styles.typingDots,
                      {
                        flexDirection: rowDirection,
                      },
                    ]}
                  >
                    {[0, 150, 300].map(delay => (
                      <MotiView
                        key={delay}
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
                    ))}
                  </View>
                </View>
              </MotiView>
            )}
          </ScrollView>

          {/* Scroll to bottom */}

          <AnimatePresence>
            {showScrollButton && (
              <MotiView
                from={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                }}
                style={styles.scrollButtonWrapper}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={scrollToBottom}
                  style={[
                    styles.scrollButton,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <ChevronDown
                    size={20}
                    color="#FFFFFF"
                    strokeWidth={2.3}
                  />
                </TouchableOpacity>
              </MotiView>
            )}
          </AnimatePresence>

          {/* Notice */}

          <AnimatePresence>
            {notice && (
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
                style={[
                  styles.notice,
                  {
                    backgroundColor: isDark
                      ? '#27272A'
                      : '#1F2937',
                  },
                ]}
              >
                <Text style={styles.noticeText}>
                  {notice}
                </Text>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        {/* =====================================================
            INPUT
           ===================================================== */}

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
            type: 'timing',
            duration: 350,
          }}
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDark
                ? 'rgba(24,24,27,0.97)'
                : 'rgba(255,255,255,0.97)',
              borderColor: colors.border,
              marginBottom:
                insets.bottom > 0
                  ? insets.bottom
                  : 8,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              showNotice(
                language === 'fa'
                  ? 'پیوست فایل به‌زودی اضافه می‌شود'
                  : 'File attachments are coming soon'
              )
            }
            style={styles.inputIconButton}
          >
            <Plus
              size={21}
              color={colors.textTertiary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              t.askNova ||
              (language === 'fa'
                ? 'از Nova چیزی بپرسید...'
                : 'Ask Nova anything...')
            }
            placeholderTextColor={colors.textTertiary}
            multiline
            style={[
              styles.input,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSend()}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              showNotice(
                language === 'fa'
                  ? 'ورودی صوتی به‌زودی اضافه می‌شود'
                  : 'Voice input is coming soon'
              )
            }
            style={styles.inputIconButton}
          >
            <Mic
              size={20}
              color={colors.textTertiary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.78}
            disabled={!inputText.trim()}
            onPress={() => handleSend()}
            style={[
              styles.sendButton,
              {
                backgroundColor: inputText.trim()
                  ? colors.primary
                  : isDark
                    ? '#27272A'
                    : '#E5E7EB',
              },
            ]}
          >
            <Send
              size={18}
              color={
                inputText.trim()
                  ? '#FFFFFF'
                  : colors.textTertiary
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
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  /* ================= HEADER ================= */

  header: {
    width: '100%',
  },

  headerContent: {
    paddingTop: 50,
    minHeight: 66,
    alignItems: 'center',
  },

  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
  },

  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
  },

  headerIdentity: {
    flex: 1,
    marginHorizontal: 11,
  },

  nameLine: {
    alignItems: 'center',
  },

  aiName: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },

  aiBadge: {
    width: 23,
    height: 23,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },

  onlineRow: {
    alignItems: 'center',
    marginTop: 2,
  },

  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
    marginHorizontal: 5,
  },

  onlineText: {
    fontSize: 11,
    lineHeight: 15,
  },

  moreButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerLine: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    marginTop: 5,
    opacity: 0.7,
  },

  /* ================= CHAT ================= */

  chatArea: {
    flex: 1,
    minHeight: 0,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 18,
  },

  emptyScroll: {
    flexGrow: 1,
  },

  /* ================= WELCOME ================= */

  welcome: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 20,
  },

  welcomeIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  welcomeTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    textAlign: 'center',
  },

  welcomeDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 2,
  },

  welcomeHint: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 3,
  },

  /* ================= QUICK ACTIONS ================= */

  quickActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
    rowGap: 10,
  },

  quickActionWrapper: {
    width: '48.5%',
  },

  quickAction: {
    minHeight: 91,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  quickLabel: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
  },

  /* ================= MESSAGES ================= */

  messageRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingHorizontal: 4,
  },

  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    overflow: 'hidden',
    marginHorizontal: 7,
  },

  messageAvatarImage: {
    width: 32,
    height: 32,
  },

  messageColumn: {
    maxWidth: '76%',
    minWidth: 0,
  },

  sender: {
    fontSize: 10.5,
    fontWeight: '500',
    marginHorizontal: 4,
    marginBottom: 4,
  },

  userBubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 19,
    maxWidth: '100%',
  },

  userBubbleLTR: {
    borderTopRightRadius: 5,
  },

  userBubbleRTL: {
    borderTopLeftRadius: 5,
  },

  botBubble: {
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 19,
    maxWidth: '100%',
  },

  botBubbleLTR: {
    borderTopLeftRadius: 5,
  },

  botBubbleRTL: {
    borderTopRightRadius: 5,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },

  timestamp: {
    fontSize: 9.5,
    marginTop: 4,
    marginHorizontal: 4,
    opacity: 0.65,
  },

  /* ================= TYPING ================= */

  typingBubble: {
    minHeight: 42,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  typingText: {
    fontSize: 11.5,
    marginHorizontal: 4,
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

  /* ================= SCROLL BUTTON ================= */

  scrollButtonWrapper: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
  },

  scrollButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: MIN_TAP_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.18,
    shadowRadius: 7,
  },

  /* ================= NOTICE ================= */

  notice: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },

  noticeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  /* ================= INPUT ================= */

  inputWrapper: {
    width: '100%',
    minHeight: 56,
    borderRadius: 19,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  inputIconButton: {
    width: 43,
    height: 43,
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
  },
});