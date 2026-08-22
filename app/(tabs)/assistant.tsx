import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
  ActivityIndicator,
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
  AlertCircle,
  RotateCcw,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BorderRadius } from '../../constants/theme';

const CHAT_API_URL =
  'https://smith-wrongful-punctual.ngrok-free.dev/chat';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatResponse {
  response?: unknown;
  message?: unknown;
  reply?: unknown;
  answer?: unknown;
  text?: unknown;
  content?: unknown;
  data?: unknown;
  error?: unknown;
}

const suggestions = [
  {
    icon: Activity,
    label: 'analyzeSymptoms',
    fallback: 'Analyze my symptoms',
  },
  {
    icon: Pill,
    label: 'medication',
    fallback: 'Help me with my medication',
  },
  {
    icon: Calendar,
    label: 'schedule',
    fallback: 'Help me with my schedule',
  },
  {
    icon: FileText,
    label: 'protocol',
    fallback: 'Explain my protocol',
  },
];

const normalizeResponseText = (
  value: unknown
): string | null => {
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = normalizeResponseText(item);
      if (result) {
        return result;
      }
    }
  }
  if (
    value &&
    typeof value === 'object'
  ) {
    const object = value as Record<string, unknown>;
    const possibleKeys = [
      'response',
      'message',
      'reply',
      'answer',
      'text',
      'content',
    ];
    for (const key of possibleKeys) {
      if (key in object) {
        const result =
          normalizeResponseText(object[key]);
        if (result) {
          return result;
        }
      }
    }
    if ('data' in object) {
      const result =
        normalizeResponseText(object.data);
      if (result) {
        return result;
      }
    }
    if ('choices' in object) {
      const result =
        normalizeResponseText(object.choices);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] =
    useState<Message[]>([]);
  const [inputText, setInputText] =
    useState('');
  const [isTyping, setIsTyping] =
    useState(false);
  const [showScrollButton, setShowScrollButton] =
    useState(false);
  const [notice, setNotice] =
    useState<string | null>(null);
  const [requestError, setRequestError] =
    useState(false);

  const scrollRef =
    useRef<ScrollView>(null);
  const inputRef =
    useRef<TextInput>(null);
  const noticeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
  const scrollTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );
  const abortController =
    useRef<AbortController | null>(null);
  const conversationId =
    useRef(
      `neurolia-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
    );

  const getCurrentTime = useCallback(() => {
    return new Date().toLocaleTimeString(
      language === 'fa'
        ? 'fa-IR'
        : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  }, [language]);

  const lightHaptic = useCallback(() => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
  }, []);

  const showNotice = useCallback(
    (message: string) => {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Warning
      ).catch(() => {});
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
      setNotice(message);
      noticeTimer.current =
        setTimeout(() => {
          setNotice(null);
        }, 2200);
    },
    []
  );

  const scrollToBottom = useCallback(() => {
    lightHaptic();
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  }, [lightHaptic]);

  const handleScroll = useCallback(
    (event: any) => {
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
        distance > 100 &&
          messages.length > 0
      );
    },
    [messages.length]
  );

  const addMessage = useCallback(
    (
      text: string,
      isUser: boolean
    ) => {
      const message: Message = {
        id: `${Date.now()}-${
          isUser ? 'user' : 'assistant'
        }-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        text,
        isUser,
        timestamp: getCurrentTime(),
      };
      setMessages(prev => [
        ...prev,
        message,
      ]);
    },
    [getCurrentTime]
  );

  const requestAssistant = useCallback(
    async (text: string) => {
      abortController.current?.abort();
      const controller =
        new AbortController();
      abortController.current =
        controller;
      const body = {
        message: text,
        conversation_id:
          conversationId.current,
        language:
          language === 'fa'
            ? 'fa'
            : 'en',
      };
      const response =
        await fetch(
          CHAT_API_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
              Accept:
                'application/json, text/plain, */*',
            },
            body: JSON.stringify(body),
            signal:
              controller.signal,
          }
        );
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }
      const raw =
        await response.text();
      if (!raw.trim()) {
        throw new Error(
          'Empty response from server'
        );
      }
      try {
        const parsed =
          JSON.parse(raw) as ChatResponse;
        const textResponse =
          normalizeResponseText(parsed);
        if (textResponse) {
          return textResponse;
        }
        throw new Error(
          'Unable to find assistant response'
        );
      } catch (jsonError) {
        if (
          raw.trim().startsWith('{') ||
          raw.trim().startsWith('[')
        ) {
          throw jsonError;
        }
        return raw.trim();
      }
    },
    [language]
  );

  const handleSend = useCallback(
    async (value?: string) => {
      const text =
        (value ?? inputText).trim();
      if (
        !text ||
        isTyping
      ) {
        return;
      }
      lightHaptic();
      setRequestError(false);
      addMessage(
        text,
        true
      );
      setInputText('');
      setIsTyping(true);
      inputRef.current?.blur();
      await new Promise(resolve =>
        setTimeout(resolve, 80)
      );
      try {
        const answer =
          await requestAssistant(text);
        if (!answer) {
          throw new Error(
            'Assistant returned empty response'
          );
        }
        addMessage(
          answer,
          false
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === 'AbortError'
        ) {
          return;
        }
        console.error(
          'NEUROLIA AI CHAT ERROR:',
          error
        );
        setRequestError(true);
        addMessage(
          language === 'fa'
            ? 'در ارتباط با دستیار هوشمند مشکلی پیش آمد. اتصال سرور را بررسی کنید و دوباره تلاش کنید.'
            : 'I could not connect to the AI assistant. Please check the server connection and try again.',
          false
        );
      } finally {
        setIsTyping(false);
        abortController.current =
          null;
      }
    },
    [
      inputText,
      isTyping,
      lightHaptic,
      addMessage,
      requestAssistant,
      language,
    ]
  );

  const handleRetry = useCallback(() => {
    const lastUserMessage =
      [...messages]
        .reverse()
        .find(message => message.isUser);
    if (!lastUserMessage) {
      return;
    }
    setMessages(prev => {
      const lastAssistantIndex =
        [...prev]
          .map((message, index) => ({
            message,
            index,
          }))
          .reverse()
          .find(
            item => !item.message.isUser
          );
      if (
        lastAssistantIndex &&
        lastAssistantIndex.index >
          prev.findIndex(
            message =>
              message.id ===
              lastUserMessage.id
          )
      ) {
        return prev.filter(
          (_, index) =>
            index !==
            lastAssistantIndex.index
        );
      }
      return prev;
    });
    setRequestError(false);
    handleSend(
      lastUserMessage.text
    );
  }, [
    messages,
    handleSend,
  ]);

  const handleSuggestion = useCallback(
    (suggestion: {
      label: string;
      fallback: string;
    }) => {
      const translation =
        t[
          suggestion.label as keyof typeof t
        ];
      const text =
        typeof translation === 'string' &&
        translation.trim()
          ? translation
          : suggestion.fallback;
      handleSend(text);
    },
    [t, handleSend]
  );

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    if (scrollTimer.current) {
      clearTimeout(
        scrollTimer.current
      );
    }
    scrollTimer.current =
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    return () => {
      if (scrollTimer.current) {
        clearTimeout(
          scrollTimer.current
        );
      }
    };
  }, [messages]);

  useEffect(() => {
    return () => {
      abortController.current?.abort();
      if (noticeTimer.current) {
        clearTimeout(
          noticeTimer.current
        );
      }
      if (scrollTimer.current) {
        clearTimeout(
          scrollTimer.current
        );
      }
    };
  }, []);

  const backgroundGradient =
    isDark
      ? [
          colors.background,
          colors.surfaceSecondary,
        ] as const
      : [
          colors.background,
          '#FFFFFF',
        ] as const;

  const buttonGradient =
    [
      colors.primary,
      colors.primaryLight,
    ] as const;

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 88
            : 0
        }
      >
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
              paddingTop:
                Math.max(
                  insets.top,
                  8
                ),
            },
          ]}
        >
          <View
            style={[
              styles.headerContent,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.avatarWrapper,
                {
                  backgroundColor:
                    isDark
                      ? 'rgba(130,116,216,0.22)'
                      : 'rgba(130,116,216,0.14)',
                  borderColor:
                    isDark
                      ? 'rgba(164,155,230,0.32)'
                      : 'rgba(130,116,216,0.18)',
                },
              ]}
            >
              <Image
                source={require(
                  '../../assets/avatars/model 2.jpg'
                )}
                style={styles.avatar}
              />
              <View
                style={[
                  styles.onlineDot,
                  {
                    borderColor:
                      isDark
                        ? colors.surfaceSecondary
                        : '#FFFFFF',
                  },
                ]}
              />
            </View>
            <View
              style={[
                styles.headerIdentity,
                {
                  alignItems:
                    isRTL
                      ? 'flex-end'
                      : 'flex-start',
                },
              ]}
            >
              <View
                style={[
                  styles.nameLine,
                  {
                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.aiName,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {t.novaAI ||
                    'Nova AI'}
                </Text>
                <View
                  style={[
                    styles.aiBadge,
                    {
                      backgroundColor:
                        isDark
                          ? 'rgba(130,116,216,0.18)'
                          : 'rgba(130,116,216,0.10)',
                    },
                  ]}
                >
                  <Sparkles
                    size={12}
                    color={
                      colors.primary
                    }
                    strokeWidth={2.3}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.onlineRow,
                  {
                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                <View
                  style={
                    styles.onlineIndicator
                  }
                />
                <Text
                  style={[
                    styles.onlineText,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  {t.online ||
                    'Online'}
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
                  backgroundColor:
                    isDark
                      ? 'rgba(255,255,255,0.055)'
                      : 'rgba(15,23,42,0.045)',
                },
              ]}
            >
              <MoreHorizontal
                size={21}
                color={
                  colors.textSecondary
                }
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.headerLine,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          />
        </MotiView>

        <View style={styles.chatArea}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              messages.length === 0 &&
                styles.emptyScroll,
            ]}
            showsVerticalScrollIndicator={
              false
            }
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
                style={styles.welcome}
              >
                <View
                  style={[
                    styles.welcomeIcon,
                    {
                      backgroundColor:
                        isDark
                          ? 'rgba(130,116,216,0.15)'
                          : 'rgba(130,116,216,0.09)',
                    },
                  ]}
                >
                  <MessageCircle
                    size={25}
                    color={
                      colors.primary
                    }
                    strokeWidth={2}
                  />
                </View>
                <Text
                  style={[
                    styles.welcomeTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {t.hello ||
                    'Hello'}
                </Text>
                <Text
                  style={[
                    styles.welcomeDescription,
                    {
                      color:
                        colors.textSecondary,
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
                      color:
                        colors.textTertiary,
                    },
                  ]}
                >
                  {t.howCanHelp ||
                    'How can I help you today?'}
                </Text>
                <View
                  style={
                    styles.quickActions
                  }
                >
                  {suggestions.map(
                    (
                      suggestion,
                      index
                    ) => {
                      const Icon =
                        suggestion.icon;
                      const translation =
                        t[
                          suggestion.label as keyof typeof t
                        ];
                      const label =
                        typeof translation ===
                          'string' &&
                        translation.trim()
                          ? translation
                          : suggestion.fallback;
                      return (
                        <MotiView
                          key={
                            suggestion.label
                          }
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
                            delay:
                              index * 70,
                          }}
                          style={
                            styles.quickActionWrapper
                          }
                        >
                          <TouchableOpacity
                            activeOpacity={
                              0.78
                            }
                            onPress={() =>
                              handleSuggestion(
                                suggestion
                              )
                            }
                            style={[
                              styles.quickAction,
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
                                styles.quickIcon,
                                {
                                  backgroundColor:
                                    isDark
                                      ? 'rgba(130,116,216,0.13)'
                                      : 'rgba(130,116,216,0.07)',
                                },
                              ]}
                            >
                              <Icon
                                size={20}
                                color={
                                  colors.primary
                                }
                                strokeWidth={2}
                              />
                            </View>
                            <Text
                              numberOfLines={
                                2
                              }
                              style={[
                                styles.quickLabel,
                                {
                                  color:
                                    colors.text,
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

            {messages.map(
              (
                message,
                index
              ) => (
                <MotiView
                  key={
                    message.id
                  }
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
                      index ===
                      messages.length -
                        1
                        ? 50
                        : 0,
                  }}
                  style={[
                    styles.messageRow,
                    {
                      flexDirection:
                        message.isUser
                          ? 'row-reverse'
                          : 'row',
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
                          borderColor:
                            colors.border,
                        },
                      ]}
                    >
                      <Image
                        source={require(
                          '../../assets/avatars/model 2.jpg'
                        )}
                        style={
                          styles.messageAvatarImage
                        }
                      />
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageColumn,
                      {
                        alignItems:
                          message.isUser
                            ? 'flex-end'
                            : 'flex-start',
                      },
                    ]}
                  >
                    {!message.isUser && (
                      <Text
                        style={[
                          styles.sender,
                          {
                            color:
                              colors.textSecondary,
                            textAlign:
                              isRTL
                                ? 'right'
                                : 'left',
                          },
                        ]}
                      >
                        {t.novaAI ||
                          'Nova AI'}
                      </Text>
                    )}
                    {message.isUser ? (
                      <LinearGradient
                        colors={
                          buttonGradient
                        }
                        start={{
                          x: 0,
                          y: 0,
                        }}
                        end={{
                          x: 1,
                          y: 1,
                        }}
                        style={[
                          styles.userBubble,
                          styles.userBubbleRight,
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            {
                              color:
                                '#FFFFFF',
                              textAlign:
                                isRTL
                                  ? 'right'
                                  : 'left',
                            },
                          ]}
                        >
                          {
                            message.text
                          }
                        </Text>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.assistantBubble,
                          styles.assistantBubbleLeft,
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
                            styles.messageText,
                            {
                              color:
                                colors.text,
                              textAlign:
                                isRTL
                                  ? 'right'
                                  : 'left',
                            },
                          ]}
                        >
                          {
                            message.text
                          }
                        </Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.timestamp,
                        {
                          color:
                            colors.textTertiary,
                          textAlign:
                            message.isUser
                              ? 'right'
                              : 'left',
                        },
                      ]}
                    >
                      {
                        message.timestamp
                      }
                    </Text>
                  </View>
                </MotiView>
              )
            )}

            <AnimatePresence>
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
                  exit={{
                    opacity: 0,
                    translateY: 5,
                  }}
                  style={[
                    styles.typingRow,
                    {
                      flexDirection:
                        'row',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.messageAvatar,
                      {
                        backgroundColor:
                          colors.surfaceSecondary,
                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    <Image
                      source={require(
                        '../../assets/avatars/model 2.jpg'
                      )}
                      style={
                        styles.messageAvatarImage
                      }
                    />
                  </View>
                  <View
                    style={[
                      styles.typingBubble,
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
                        styles.typingDots
                      }
                    >
                      <MotiView
                        from={{
                          opacity: 0.3,
                          translateY: 0,
                        }}
                        animate={{
                          opacity: 1,
                          translateY: -3,
                        }}
                        transition={{
                          type: 'timing',
                          duration: 350,
                          loop: true,
                        }}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      />
                      <MotiView
                        from={{
                          opacity: 0.3,
                          translateY: 0,
                        }}
                        animate={{
                          opacity: 1,
                          translateY: -3,
                        }}
                        transition={{
                          type: 'timing',
                          duration: 350,
                          delay: 100,
                          loop: true,
                        }}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      />
                      <MotiView
                        from={{
                          opacity: 0.3,
                          translateY: 0,
                        }}
                        animate={{
                          opacity: 1,
                          translateY: -3,
                        }}
                        transition={{
                          type: 'timing',
                          duration: 350,
                          delay: 200,
                          loop: true,
                        }}
                        style={[
                          styles.dot,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </MotiView>
              )}
            </AnimatePresence>
          </ScrollView>

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
                style={
                  styles.scrollButtonWrapper
                }
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    scrollToBottom
                  }
                  style={[
                    styles.scrollButton,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <ChevronDown
                    size={20}
                    color={
                      colors.text
                    }
                  />
                </TouchableOpacity>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <View
          style={[
            styles.inputArea,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  10
                ),
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                showNotice(
                  language === 'fa'
                    ? 'افزودن فایل به‌زودی'
                    : 'Attachments coming soon'
                )
              }
              style={
                styles.inputIconButton
              }
            >
              <Plus
                size={21}
                color={
                  colors.textSecondary
                }
                strokeWidth={2}
              />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={
                setInputText
              }
              placeholder={
                t.typeMessage ||
                (language === 'fa'
                  ? 'پیام خود را بنویسید...'
                  : 'Type a message...')
              }
              placeholderTextColor={
                colors.textTertiary
              }
              multiline
              maxLength={2000}
              editable={!isTyping}
              textAlign={
                isRTL
                  ? 'right'
                  : 'left'
              }
              style={[
                styles.input,
                {
                  color:
                    colors.text,
                },
              ]}
              onSubmitEditing={() => {
                if (
                  Platform.OS !==
                  'web'
                ) {
                  handleSend();
                }
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                showNotice(
                  language === 'fa'
                    ? 'ورودی صوتی به‌زودی'
                    : 'Voice input coming soon'
                )
              }
              style={
                styles.inputIconButton
              }
            >
              <Mic
                size={20}
                color={
                  colors.textSecondary
                }
                strokeWidth={2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              disabled={
                !inputText.trim() ||
                isTyping
              }
              onPress={() =>
                handleSend()
              }
              style={[
                styles.sendButton,
                {
                  backgroundColor:
                    inputText.trim() &&
                    !isTyping
                      ? colors.primary
                      : isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(15,23,42,0.07)',
                },
              ]}
            >
              {isTyping ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Send
                  size={18}
                  color={
                    inputText.trim()
                      ? '#FFFFFF'
                      : colors.textTertiary
                  }
                  strokeWidth={2.2}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <AnimatePresence>
          {notice && (
            <MotiView
              from={{
                opacity: 0,
                translateY: 20,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                translateY: 10,
                scale: 0.97,
              }}
              style={[
                styles.notice,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <AlertCircle
                size={17}
                color={
                  colors.primary
                }
              />
              <Text
                style={[
                  styles.noticeText,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {notice}
              </Text>
            </MotiView>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {requestError &&
            !isTyping && (
              <MotiView
                from={{
                  opacity: 0,
                  translateY: 10,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                exit={{
                  opacity: 0,
                  translateY: 10,
                }}
                style={[
                  styles.errorBar,
                  {
                    backgroundColor:
                      isDark
                        ? 'rgba(228,123,123,0.12)'
                        : 'rgba(217,107,107,0.08)',
                    borderColor:
                      isDark
                        ? 'rgba(228,123,123,0.22)'
                        : 'rgba(217,107,107,0.18)',
                  },
                ]}
              >
                <AlertCircle
                  size={16}
                  color={
                    colors.error
                  }
                />
                <Text
                  style={[
                    styles.errorText,
                    {
                      color:
                        colors.error,
                    },
                  ]}
                >
                  {language ===
                  'fa'
                    ? 'اتصال به سرور برقرار نشد'
                    : 'Connection failed'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={
                    handleRetry
                  }
                  style={
                    styles.retryButton
                  }
                >
                  <RotateCcw
                    size={15}
                    color={
                      colors.error
                    }
                  />
                  <Text
                    style={[
                      styles.retryText,
                      {
                        color:
                          colors.error,
                      },
                    ]}
                  >
                    {language ===
                    'fa'
                      ? 'تلاش مجدد'
                      : 'Retry'}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            )}
        </AnimatePresence>
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
  },
  header: {
    paddingHorizontal: 18,
  },
  headerContent: {
    minHeight: 72,
    alignItems: 'center',
  },
  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'visible',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#55C99A',
    borderWidth: 2,
  },
  headerIdentity: {
    flex: 1,
    marginHorizontal: 12,
  },
  nameLine: {
    alignItems: 'center',
    gap: 7,
  },
  aiName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  aiBadge: {
    width: 23,
    height: 23,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineRow: {
    alignItems: 'center',
    marginTop: 3,
    gap: 5,
  },
  onlineIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#55C99A',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLine: {
    height: 1,
    marginTop: 2,
    opacity: 0.65,
  },
  chatArea: {
    flex: 1,
    position: 'relative',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },
  emptyScroll: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  welcome: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  welcomeDescription: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '500',
  },
  welcomeHint: {
    marginTop: 5,
    fontSize: 13,
  },
  quickActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 28,
    gap: 10,
  },
  quickActionWrapper: {
    width: '47%',
    maxWidth: 190,
  },
  quickAction: {
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  messageRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 17,
  },
  messageAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 7,
  },
  messageAvatarImage: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },
  messageColumn: {
    maxWidth: '78%',
  },
  sender: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
    paddingHorizontal: 3,
  },
  userBubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userBubbleRight: {
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  assistantBubbleLeft: {
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    paddingHorizontal: 3,
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typingBubble: {
    minWidth: 64,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scrollButtonWrapper: {
    position: 'absolute',
    right: 18,
    bottom: 18,
  },
  scrollButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  inputArea: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  inputWrapper: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  inputIconButton: {
    width: 40,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notice: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 88,
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    elevation: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  errorBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 76,
    minHeight: 42,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '700',
  },
});