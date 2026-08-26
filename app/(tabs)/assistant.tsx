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
  Sparkles,
  RotateCcw,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

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
    const object =
      value as Record<string, unknown>;

    const keys = [
      'response',
      'message',
      'reply',
      'answer',
      'text',
      'content',
    ];

    for (const key of keys) {
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
  const { isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [inputText, setInputText] =
    useState('');

  const [isTyping, setIsTyping] =
    useState(false);

  const [hasStarted, setHasStarted] =
    useState(false);

  const [welcomeText, setWelcomeText] =
    useState('');

  const [welcomeFinished, setWelcomeFinished] =
    useState(false);

  const [requestError, setRequestError] =
    useState(false);

  const [showScrollButton, setShowScrollButton] =
    useState(false);

  const scrollRef =
    useRef<ScrollView>(null);

  const inputRef =
    useRef<TextInput>(null);

  const abortController =
    useRef<AbortController | null>(null);

  const typingTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const conversationId =
    useRef(
      `neurolia-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`
    );

  const welcomeMessage =
    language === 'fa'
      ? 'سلام، روز بخیر 🌱\nمن نورولیا هستم.\nراجع به چیزی دوست داری با هم صحبت کنیم؟'
      : 'Hello, good day 🌱\nI am Norulia.\nIs there something you would like to talk about?';

  /*
   * Welcome typing animation
   */
  useEffect(() => {
    if (hasStarted) {
      return;
    }

    setWelcomeText('');
    setWelcomeFinished(false);

    let index = 0;

    const typeNextCharacter = () => {
      if (index >= welcomeMessage.length) {
        setWelcomeFinished(true);
        return;
      }

      setWelcomeText(
        welcomeMessage.slice(
          0,
          index + 1
        )
      );

      index += 1;

      typingTimer.current =
        setTimeout(
          typeNextCharacter,
          32
        );
    };

    typingTimer.current =
      setTimeout(
        typeNextCharacter,
        500
      );

    return () => {
      if (typingTimer.current) {
        clearTimeout(
          typingTimer.current
        );
      }
    };
  }, [
    language,
    hasStarted,
    welcomeMessage,
  ]);

  const getCurrentTime =
    useCallback(() => {
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

  const lightHaptic =
    useCallback(() => {
      Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light
      ).catch(() => {});
    }, []);

  const addMessage =
    useCallback(
      (
        text: string,
        isUser: boolean
      ) => {
        const message: Message = {
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
          text,
          isUser,
          timestamp:
            getCurrentTime(),
        };

        setMessages(prev => [
          ...prev,
          message,
        ]);
      },
      [getCurrentTime]
    );

  const requestAssistant =
    useCallback(
      async (text: string) => {
        abortController.current?.abort();

        const controller =
          new AbortController();

        abortController.current =
          controller;

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

              body: JSON.stringify({
                message: text,

                conversation_id:
                  conversationId.current,

                language:
                  language === 'fa'
                    ? 'fa'
                    : 'en',
              }),

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
            'Empty response'
          );
        }

        try {
          const parsed =
            JSON.parse(raw) as ChatResponse;

          const result =
            normalizeResponseText(
              parsed
            );

          if (result) {
            return result;
          }

          throw new Error(
            'Invalid assistant response'
          );
        } catch (error) {
          if (
            raw.trim().startsWith('{') ||
            raw.trim().startsWith('[')
          ) {
            throw error;
          }

          return raw.trim();
        }
      },
      [language]
    );

  const handleSend =
    useCallback(
      async (value?: string) => {
        const text =
          (value ?? inputText).trim();

        if (!text || isTyping) {
          return;
        }

        lightHaptic();

        setRequestError(false);
        setInputText('');

        /*
         * Start chat.
         */
        if (!hasStarted) {
          setHasStarted(true);

          await new Promise(resolve =>
            setTimeout(
              resolve,
              420
            )
          );
        }

        addMessage(
          text,
          true
        );

        setIsTyping(true);

        inputRef.current?.blur();

        try {
          const answer =
            await requestAssistant(
              text
            );

          if (!answer) {
            throw new Error(
              'Empty assistant answer'
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
              ? 'در ارتباط با دستیار هوشمند مشکلی پیش آمد. لطفاً اتصال سرور را بررسی کنید و دوباره تلاش کنید.'
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
        hasStarted,
        lightHaptic,
        addMessage,
        requestAssistant,
        language,
      ]
    );

  const handleRetry =
    useCallback(() => {
      const lastUser =
        [...messages]
          .reverse()
          .find(
            message =>
              message.isUser
          );

      if (!lastUser) {
        return;
      }

      setMessages(prev => {
        const lastAssistant =
          [...prev]
            .reverse()
            .find(
              message =>
                !message.isUser
            );

        if (!lastAssistant) {
          return prev;
        }

        return prev.filter(
          message =>
            message.id !==
            lastAssistant.id
        );
      });

      setRequestError(false);

      handleSend(
        lastUser.text
      );
    }, [
      messages,
      handleSend,
    ]);

  /*
   * Auto scroll.
   */
  useEffect(() => {
    if (
      messages.length === 0
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);

    return () =>
      clearTimeout(timer);
  }, [messages]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      abortController.current?.abort();

      if (
        typingTimer.current
      ) {
        clearTimeout(
          typingTimer.current
        );
      }
    };
  }, []);

  const handleScroll =
    useCallback(
      (event: any) => {
        const {
          contentOffset,
          contentSize,
          layoutMeasurement,
        } =
          event.nativeEvent;

        const distance =
          contentSize.height -
          contentOffset.y -
          layoutMeasurement.height;

        setShowScrollButton(
          distance > 120 &&
            messages.length > 0
        );
      },
      [messages.length]
    );

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

  const inputBackground =
    isDark
      ? 'rgba(255,255,255,0.055)'
      : 'rgba(0,0,0,0.035)';

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

        {/* =====================================================
            MAIN CONTENT
            ===================================================== */}

        <View
          style={[
            styles.mainContent,
            {
              paddingTop:
                hasStarted
                  ? 0
                  : insets.top,
            },
          ]}
        >

          {/* =====================================================
              WELCOME SCENE
              ===================================================== */}

          <AnimatePresence>
            {!hasStarted && (
              <MotiView
                from={{
                  opacity: 1,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 350,
                }}
                style={[
                  styles.welcomeScene,
                ]}
                pointerEvents="box-none"
              >

                {/* Avatar */}

                <MotiView
                  from={{
                    opacity: 0,
                    translateX: isRTL
                      ? 180
                      : -180,
                    scale: 0.92,
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    translateX: isRTL
                      ? 280
                      : -280,
                    scale: 0.88,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 18,
                    stiffness: 110,
                    delay: 150,
                  }}
                  style={[
                    styles.welcomeAvatarContainer,
                    {
                      alignSelf:
                        isRTL
                          ? 'flex-end'
                          : 'flex-start',
                    },
                  ]}
                >
                  <Image
                    source={require(
                      '../../assets/avatars/modell.png'
                    )}
                    style={
                      styles.welcomeAvatar
                    }
                    resizeMode="contain"
                  />

                  <View
                    style={[
                      styles.avatarGlow,
                      {
                        backgroundColor:
                          colors.primary,

                        opacity:
                          isDark
                            ? 0.12
                            : 0.08,
                      },
                    ]}
                  />
                </MotiView>

                {/* Dialog */}

                <MotiView
                  from={{
                    opacity: 0,
                    translateX: isRTL
                      ? -190
                      : 190,
                    scale: 0.94,
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    translateX: isRTL
                      ? -300
                      : 300,
                    scale: 0.92,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 18,
                    stiffness: 105,
                    delay: 380,
                  }}
                  style={[
                    styles.dialogWrapper,
                    {
                      alignSelf:
                        isRTL
                          ? 'flex-start'
                          : 'flex-end',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.dialogBubble,
                      {
                        backgroundColor:
                          isDark
                            ? 'rgba(255,255,255,0.075)'
                            : 'rgba(255,255,255,0.92)',

                        borderColor:
                          isDark
                            ? 'rgba(255,255,255,0.11)'
                            : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >

                    <View
                      style={[
                        styles.dialogHeader,
                        {
                          flexDirection:
                            isRTL
                              ? 'row-reverse'
                              : 'row',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.noruliaDot,
                          {
                            backgroundColor:
                              colors.primary,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.noruliaName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Norulia
                      </Text>

                      <Sparkles
                        size={15}
                        color={
                          colors.primary
                        }
                        strokeWidth={2.2}
                      />
                    </View>

                    <Text
                      style={[
                        styles.welcomeText,
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
                      {welcomeText}

                      {!welcomeFinished && (
                        <Text
                          style={{
                            color:
                              colors.primary,
                          }}
                        >
                          ▌
                        </Text>
                      )}
                    </Text>

                    <View
                      style={[
                        styles.dialogTail,
                        isRTL
                          ? styles.dialogTailLeft
                          : styles.dialogTailRight,
                        {
                          backgroundColor:
                            isDark
                              ? 'rgba(255,255,255,0.075)'
                              : 'rgba(255,255,255,0.92)',
                        },
                      ]}
                    />
                  </View>
                </MotiView>

              </MotiView>
            )}
          </AnimatePresence>

          {/* =====================================================
              CHAT HEADER
              ===================================================== */}

          <AnimatePresence>
            {hasStarted && (
              <MotiView
                from={{
                  opacity: 0,
                  translateY: -90,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'spring',
                  damping: 18,
                  stiffness: 120,
                }}
                style={[
                  styles.chatHeader,
                  {
                    paddingTop:
                      Math.max(
                        insets.top,
                        10
                      ),
                  },
                ]}
              >
                <View
                  style={[
                    styles.headerInner,
                    {
                      flexDirection:
                        isRTL
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                >

                  <View
                    style={[
                      styles.headerAvatar,
                      {
                        borderColor:
                          colors.primary,
                      },
                    ]}
                  >
                    <Image
                      source={require(
                        '../../assets/avatars/modell.png'
                      )}
                      style={
                        styles.headerAvatarImage
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.headerText,
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
                        styles.headerNameRow,
                        {
                          flexDirection:
                            isRTL
                              ? 'row-reverse'
                              : 'row',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.headerName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Norulia
                      </Text>

                      <View
                        style={[
                          styles.aiPill,
                          {
                            backgroundColor:
                              isDark
                                ? 'rgba(130,116,216,0.18)'
                                : 'rgba(130,116,216,0.10)',
                          },
                        ]}
                      >
                        <Sparkles
                          size={11}
                          color={
                            colors.primary
                          }
                        />
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.headerStatus,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {language === 'fa'
                        ? 'دستیار هوشمند'
                        : 'AI Assistant'}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.headerOnline
                    }
                  >
                    <View
                      style={[
                        styles.onlineDot,
                        {
                          backgroundColor:
                            '#39D98A',
                        },
                      ]}
                    />
                  </View>

                </View>
              </MotiView>
            )}
          </AnimatePresence>

          {/* =====================================================
              CHAT AREA
              ===================================================== */}

          {hasStarted && (
            <View
              style={styles.chatArea}
            >
              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                contentContainerStyle={[
                  styles.messagesContent,
                  {
                    paddingTop: 16,
                    paddingBottom: 24,
                  },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={
                  false
                }
                onScroll={
                  handleScroll
                }
                scrollEventThrottle={
                  16
                }
              >

                {messages.map(
                  message => (
                    <MotiView
                      key={
                        message.id
                      }
                      from={{
                        opacity: 0,
                        translateY: 12,
                        scale: 0.96,
                      }}
                      animate={{
                        opacity: 1,
                        translateY: 0,
                        scale: 1,
                      }}
                      transition={{
                        type: 'timing',
                        duration: 260,
                      }}
                      style={[
                        styles.messageRow,
                        {
                          justifyContent:
                            message.isUser
                              ? 'flex-end'
                              : 'flex-start',
                        },
                      ]}
                    >

                      {!message.isUser && (
                        <View
                          style={[
                            styles.messageAvatar,
                            {
                              borderColor:
                                colors.primary,
                            },
                          ]}
                        >
                          <Image
                            source={require(
                              '../../assets/avatars/modell.png'
                            )}
                            style={
                              styles.messageAvatarImage
                            }
                          />
                        </View>
                      )}

                      <View
                        style={[
                          styles.messageBubble,

                          message.isUser
                            ? styles.userBubble
                            : styles.assistantBubble,

                          {
                            backgroundColor:
                              message.isUser
                                ? colors.primary
                                : isDark
                                ? 'rgba(255,255,255,0.065)'
                                : '#FFFFFF',

                            borderColor:
                              message.isUser
                                ? colors.primary
                                : isDark
                                ? 'rgba(255,255,255,0.09)'
                                : 'rgba(0,0,0,0.06)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.messageText,
                            {
                              color:
                                message.isUser
                                  ? '#FFFFFF'
                                  : colors.text,

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

                        <Text
                          style={[
                            styles.timestamp,
                            {
                              color:
                                message.isUser
                                  ? 'rgba(255,255,255,0.65)'
                                  : colors.textSecondary,

                              textAlign:
                                isRTL
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
                    style={[
                      styles.typingRow,
                      {
                        flexDirection:
                          isRTL
                            ? 'row-reverse'
                            : 'row',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.messageAvatar,
                        {
                          borderColor:
                            colors.primary,
                        },
                      ]}
                    >
                      <Image
                        source={require(
                          '../../assets/avatars/modell.png'
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
                            isDark
                              ? 'rgba(255,255,255,0.065)'
                              : '#FFFFFF',
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.typingDots
                        }
                      >
                        <View
                          style={[
                            styles.typingDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.typingDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />

                        <View
                          style={[
                            styles.typingDot,
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

                {requestError && (
                  <TouchableOpacity
                    onPress={
                      handleRetry
                    }
                    style={[
                      styles.retryButton,
                      {
                        borderColor:
                          colors.primary,
                      },
                    ]}
                  >
                    <RotateCcw
                      size={15}
                      color={
                        colors.primary
                      }
                    />

                    <Text
                      style={[
                        styles.retryText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      {language === 'fa'
                        ? 'تلاش دوباره'
                        : 'Try again'}
                    </Text>
                  </TouchableOpacity>
                )}

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
                      onPress={() =>
                        scrollRef.current?.scrollToEnd(
                          {
                            animated:
                              true,
                          }
                        )
                      }
                      style={[
                        styles.scrollButton,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.scrollArrow
                        }
                      >
                        ↓
                      </Text>
                    </TouchableOpacity>
                  </MotiView>
                )}
              </AnimatePresence>

            </View>
          )}

        </View>

        {/* =====================================================
            FIXED INPUT AREA
            این قسمت عمداً خارج از welcomeScene است
            و همیشه پایین صفحه می‌ماند.
            ===================================================== */}

        <View
          style={[
            styles.inputArea,
            {
              paddingBottom:
                Math.max(
                  insets.bottom,
                  10
                ),

              paddingHorizontal: 14,

              /*
               * مهم:
               * Input همیشه بالاتر از Welcome Scene باشد.
               */
              zIndex: 100,
              elevation: 100,
            },
          ]}
        >

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  inputBackground,

                borderColor:
                  isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.07)',
              },
            ]}
          >

            <TouchableOpacity
              style={
                styles.micButton
              }
              onPress={
                lightHaptic
              }
            >
              <Mic
                size={21}
                color={
                  colors.textSecondary
                }
              />
            </TouchableOpacity>

            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={
                setInputText
              }
              placeholder={
                language === 'fa'
                  ? 'پیامت را بنویس...'
                  : 'Message Norulia...'
              }
              placeholderTextColor={
                colors.textSecondary
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
              onSubmitEditing={() =>
                handleSend()
              }
            />

            <TouchableOpacity
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
                      : 'rgba(0,0,0,0.07)',
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
                  size={19}
                  color={
                    inputText.trim()
                      ? '#FFFFFF'
                      : colors.textSecondary
                  }
                  strokeWidth={2.4}
                />
              )}
            </TouchableOpacity>

          </View>
        </View>

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

  /*
   * کل محتوای بالایی.
   * Input دیگر داخل این بخش نیست.
   */
  mainContent: {
    flex: 1,
    position: 'relative',
  },

  /*
   * WELCOME
   *
   * نکته مهم:
   * absoluteFillObject حذف شده.
   * بنابراین Welcome دیگر کل صفحه را نمی‌پوشاند.
   */
  welcomeScene: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    zIndex: 10,

    justifyContent: 'center',

    paddingHorizontal: 18,

    /*
     * فضای امن برای Input پایین.
     * باعث می‌شود آواتار و دیالوگ وارد ناحیه چت‌باکس نشوند.
     */
    paddingBottom: 100,
  },

  welcomeAvatarContainer: {
    width: 190,
    height: 300,

    justifyContent: 'center',
    alignItems: 'center',

    position: 'relative',

    zIndex: 2,
  },

  welcomeAvatar: {
    width: 190,
    height: 300,

    zIndex: 3,
  },

  avatarGlow: {
    position: 'absolute',

    width: 150,
    height: 150,

    borderRadius: 75,

    zIndex: 1,
  },

  dialogWrapper: {
    width: '72%',
    maxWidth: 390,

    marginTop: -70,

    zIndex: 4,
  },

  dialogBubble: {
    borderWidth: 1,

    borderRadius: 24,

    paddingHorizontal: 20,
    paddingVertical: 18,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.12,
    shadowRadius: 22,

    elevation: 8,
  },

  dialogHeader: {
    alignItems: 'center',

    gap: 7,

    marginBottom: 10,
  },

  noruliaDot: {
    width: 7,
    height: 7,

    borderRadius: 4,
  },

  noruliaName: {
    fontSize: 13,

    fontWeight: '800',

    letterSpacing: 0.2,
  },

  welcomeText: {
    fontSize: 18,

    lineHeight: 29,

    fontWeight: '600',
  },

  dialogTail: {
    position: 'absolute',

    width: 18,
    height: 18,

    bottom: -7,

    transform: [
      {
        rotate: '45deg',
      },
    ],
  },

  dialogTailRight: {
    right: 28,
  },

  dialogTailLeft: {
    left: 28,
  },

  /*
   * HEADER
   */

  chatHeader: {
    zIndex: 20,

    paddingHorizontal: 16,

    paddingBottom: 12,
  },

  headerInner: {
    minHeight: 62,

    alignItems: 'center',
  },

  headerAvatar: {
    width: 46,
    height: 46,

    borderRadius: 23,

    borderWidth: 1.5,

    overflow: 'hidden',

    justifyContent: 'center',
    alignItems: 'center',
  },

  headerAvatarImage: {
    width: 44,
    height: 44,

    resizeMode: 'contain',
  },

  headerText: {
    flex: 1,

    marginHorizontal: 11,
  },

  headerNameRow: {
    alignItems: 'center',

    gap: 6,
  },

  headerName: {
    fontSize: 17,

    fontWeight: '800',
  },

  aiPill: {
    width: 22,
    height: 22,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',
  },

  headerStatus: {
    fontSize: 11,

    marginTop: 2,
  },

  headerOnline: {
    width: 28,
    height: 28,

    alignItems: 'center',
    justifyContent: 'center',
  },

  onlineDot: {
    width: 9,
    height: 9,

    borderRadius: 5,
  },

  /*
   * CHAT
   */

  chatArea: {
    flex: 1,

    position: 'relative',

    zIndex: 1,
  },

  messages: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 14,
  },

  messageRow: {
    width: '100%',

    marginBottom: 12,

    flexDirection: 'row',

    alignItems: 'flex-end',

    gap: 8,
  },

  messageAvatar: {
    width: 32,
    height: 32,

    borderRadius: 16,

    borderWidth: 1,

    overflow: 'hidden',

    justifyContent: 'center',
    alignItems: 'center',
  },

  messageAvatarImage: {
    width: 31,
    height: 31,

    resizeMode: 'contain',
  },

  messageBubble: {
    maxWidth: '78%',

    borderWidth: 1,

    paddingHorizontal: 14,
    paddingVertical: 11,

    borderRadius: 19,
  },

  userBubble: {
    borderBottomRightRadius: 5,
  },

  assistantBubble: {
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 15,

    lineHeight: 23,

    fontWeight: '500',
  },

  timestamp: {
    fontSize: 9,

    marginTop: 5,
  },

  typingRow: {
    marginBottom: 12,

    alignItems: 'flex-end',

    gap: 8,
  },

  typingBubble: {
    minWidth: 66,

    minHeight: 42,

    paddingHorizontal: 15,

    borderRadius: 18,

    justifyContent: 'center',
  },

  typingDots: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 5,
  },

  typingDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    opacity: 0.7,
  },

  retryButton: {
    alignSelf: 'center',

    flexDirection: 'row',

    alignItems: 'center',

    gap: 7,

    borderWidth: 1,

    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 8,

    marginTop: 5,
  },

  retryText: {
    fontSize: 12,

    fontWeight: '700',
  },

  scrollButtonWrapper: {
    position: 'absolute',

    right: 16,
    bottom: 14,

    zIndex: 20,
  },

  scrollButton: {
    width: 38,
    height: 38,

    borderRadius: 19,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 6,
  },

  scrollArrow: {
    color: '#FFFFFF',

    fontSize: 20,

    fontWeight: '800',

    marginTop: -3,
  },

  /*
   * INPUT
   *
   * این بخش در پایین KeyboardAvoidingView قرار دارد
   * و هیچ‌وقت داخل Welcome Scene نیست.
   */

  inputArea: {
    width: '100%',

    paddingTop: 8,

    /*
     * مهم‌ترین قسمت:
     */
    position: 'relative',

    zIndex: 100,

    elevation: 100,
  },

  inputContainer: {
    minHeight: 58,

    borderRadius: 29,

    borderWidth: 1,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 6,
  },

  input: {
    flex: 1,

    maxHeight: 110,

    minHeight: 44,

    fontSize: 15,

    paddingHorizontal: 8,

    paddingTop: 11,

    paddingBottom: 10,
  },

  micButton: {
    width: 42,
    height: 46,

    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButton: {
    width: 44,
    height: 44,

    borderRadius: 22,

    alignItems: 'center',
    justifyContent: 'center',
  },
});