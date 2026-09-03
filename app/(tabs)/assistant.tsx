
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
  'https://iliyacore.ir/neurolia/send_message.php';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatResponse {
  status?: string;
  reply?: unknown;
  message?: unknown;
}

export default function AssistantScreen() {
  const { colors, isDark, theme } = useTheme();
  const { isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [welcomeFinished, setWelcomeFinished] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const abortController = useRef<AbortController | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * Keep icon color synchronized with the active theme.
   */
  const getIconColor = useCallback(() => {
    if (theme === 'athlete') {
      return colors.primary;
    }

    if (isDark) {
      return 'rgba(73,194,226,1)';
    }

    if (theme === 'light') {
      return '#7B61FF';
    }

    return colors.primary || '#7B61FF';
  }, [colors.primary, isDark, theme]);

  const iconColor = getIconColor();

  const welcomeMessage =
    language === 'fa'
      ? 'سلام، روز بخیر !\nمن نورولیا هستم.\nراجع به چیزی دوست داری با هم صحبت کنیم؟'
      : 'Hello, good day!\nI am Neurolia.\nIs there something you would like to talk about?';

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
        welcomeMessage.slice(0, index + 1)
      );

      index += 1;

      typingTimer.current = setTimeout(
        typeNextCharacter,
        32
      );
    };

    typingTimer.current = setTimeout(
      typeNextCharacter,
      500
    );

    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }
    };
  }, [language, hasStarted, welcomeMessage]);

  const getCurrentTime = useCallback(() => {
    return new Date().toLocaleTimeString(
      language === 'fa' ? 'fa-IR' : 'en-US',
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

  const addMessage = useCallback(
    (text: string, isUser: boolean) => {
      const message: Message = {
        id:
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
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

  /*
   * API request
   */
  const requestAssistant = useCallback(
    async (text: string) => {
      abortController.current?.abort();

      const controller =
        new AbortController();

      abortController.current =
        controller;

      const response = await fetch(
        CHAT_API_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            message: text,
          }),
          signal: controller.signal,
        }
      );

      const raw = await response.text();

      console.log(
        'NEUROLIA SERVER RESPONSE:',
        raw
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${raw}`
        );
      }

      if (!raw.trim()) {
        throw new Error(
          'Empty response from server'
        );
      }

      let parsed: ChatResponse;

      try {
        parsed =
          JSON.parse(raw) as ChatResponse;
      } catch {
        throw new Error(
          'Invalid JSON response from server'
        );
      }

      if (parsed.status !== 'success') {
        const serverMessage =
          typeof parsed.message === 'string'
            ? parsed.message
            : '';

        throw new Error(
          serverMessage ||
          'خطا در دریافت پاسخ از سرور'
        );
      }

      const reply =
        typeof parsed.reply === 'string'
          ? parsed.reply.trim()
          : '';

      if (!reply) {
        throw new Error(
          'Empty assistant reply'
        );
      }

      return reply;
    },
    []
  );

  /*
   * Send message
   */
  const handleSend = useCallback(
    async (value?: string) => {
      const text = (
        value ?? inputText
      ).trim();

      if (!text || isTyping) {
        return;
      }

      lightHaptic();

      setRequestError(false);
      setInputText('');

      if (!hasStarted) {
        setHasStarted(true);

        await new Promise(resolve =>
          setTimeout(resolve, 420)
        );
      }

      addMessage(text, true);

      setIsTyping(true);

      inputRef.current?.blur();

      try {
        const answer =
          await requestAssistant(text);

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
          'NEUROLIA PHP CHAT ERROR:',
          error
        );

        setRequestError(true);

        addMessage(
          language === 'fa'
            ? 'در ارتباط با دستیار هوشمند مشکلی پیش آمد. لطفاً دوباره تلاش کن.'
            : 'I could not connect to the AI assistant. Please try again.',
          false
        );
      } finally {
        setIsTyping(false);
        abortController.current = null;
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

  /*
   * Retry last request
   */
  const handleRetry = useCallback(() => {
    const lastUser =
      [...messages]
        .reverse()
        .find(
          message => message.isUser
        );

    if (!lastUser || isTyping) {
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

    handleSend(lastUser.text);
  }, [
    messages,
    isTyping,
    handleSend,
  ]);

  /*
   * Automatically scroll to newest message.
   */
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () =>
      clearTimeout(timer);
  }, [messages]);

  /*
   * Cleanup
   */
  useEffect(() => {
    return () => {
      abortController.current?.abort();

      if (typingTimer.current) {
        clearTimeout(
          typingTimer.current
        );
      }
    };
  }, []);

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
          {/* ====================================================== */}
          {/* WELCOME SCENE                                          */}
          {/* ====================================================== */}

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
                style={
                  styles.welcomeScene
                }
                pointerEvents="box-none"
              >
                <MotiView
                  from={{
                    opacity: 0,
                    translateX:
                      isRTL
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
                    translateX:
                      isRTL
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
                      '../../assets/avatars/model8.png'
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

                <MotiView
                  from={{
                    opacity: 0,
                    translateX:
                      isRTL
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
                    translateX:
                      isRTL
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
                          styles.neuroliaDot,
                          {
                            backgroundColor:
                              iconColor,
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.neuroliaName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Neurolia
                      </Text>

                      <Sparkles
                        size={15}
                        color={iconColor}
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

          {/* ====================================================== */}
          {/* CHAT HEADER                                            */}
          {/* ====================================================== */}

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
                    style={
                      styles.headerAvatarContainer
                    }
                  >
                    <Image
                      source={require(
                        '../../assets/avatars/model8.png'
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
                        Neurolia
                      </Text>

                      <View
                        style={[
                          styles.aiPill,
                          {
                            backgroundColor:
                              theme === 'athlete'
                                ? 'rgba(52,199,89,0.14)'
                                : isDark
                                ? 'rgba(130,116,216,0.18)'
                                : 'rgba(130,116,216,0.10)',
                          },
                        ]}
                      >
                        <Sparkles
                          size={11}
                          color={iconColor}
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
                            theme === 'athlete'
                              ? colors.primary
                              : '#39D98A',
                        },
                      ]}
                    />
                  </View>
                </View>
              </MotiView>
            )}
          </AnimatePresence>

          {/* ====================================================== */}
          {/* CHAT AREA                                              */}
          {/* ====================================================== */}

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
                scrollEventThrottle={16}
              >
                {messages.map(message => (
                  <MotiView
                    key={message.id}
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
                    {/* Assistant avatar */}
                    {!message.isUser && (
                      <View
                        style={
                          styles.messageAvatarContainer
                        }
                      >
                        <Image
                          source={require(
                            '../../assets/avatars/model8.png'
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
                              ? theme === 'athlete'
                                ? '#2D7D46'
                                : colors.primary
                              : isDark
                              ? 'rgba(255,255,255,0.065)'
                              : '#FFFFFF',

                          borderColor:
                            message.isUser
                              ? theme === 'athlete'
                                ? '#2D7D46'
                                : colors.primary
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
                        {message.text}
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
                        {message.timestamp}
                      </Text>
                    </View>
                  </MotiView>
                ))}

                {/* ================================================== */}
                {/* NEUROLIA TYPING INDICATOR                         */}
                {/* ================================================== */}

                {isTyping && (
                  <MotiView
                    from={{
                      opacity: 0,
                      translateX: -18,
                      translateY: 8,
                      scale: 0.94,
                    }}
                    animate={{
                      opacity: 1,
                      translateX: 0,
                      translateY: 0,
                      scale: 1,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 16,
                      stiffness: 180,
                    }}
                    style={[
                      styles.typingRow,
                      {
                        /*
                         * IMPORTANT:
                         * Always keep typing indicator
                         * on the assistant side.
                         */
                        justifyContent:
                          'flex-start',

                        flexDirection:
                          'row',

                        alignSelf:
                          'flex-start',
                      },
                    ]}
                  >
                    {/* Neurolia avatar */}
                    <MotiView
                      from={{
                        scale: 0.92,
                        opacity: 0.7,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        type: 'timing',
                        duration: 500,
                      }}
                      style={
                        styles.messageAvatarContainer
                      }
                    >
                      <Image
                        source={require(
                          '../../assets/avatars/model8.png'
                        )}
                        style={
                          styles.messageAvatarImage
                        }
                      />
                    </MotiView>

                    {/* Animated typing bubble */}
                    <MotiView
                      from={{
                        scale: 0.92,
                        opacity: 0.7,
                      }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        type: 'timing',
                        duration: 650,
                      }}
                      style={[
                        styles.typingBubble,
                        {
                          backgroundColor:
                            isDark
                              ? 'rgba(255,255,255,0.065)'
                              : '#FFFFFF',

                          borderColor:
                            isDark
                              ? 'rgba(255,255,255,0.08)'
                              : 'rgba(0,0,0,0.06)',
                        },
                      ]}
                    >
                      <View
                        style={
                          styles.typingDots
                        }
                      >
                        {/* Dot 1 */}
                        <MotiView
                          from={{
                            translateY: 0,
                            scale: 0.75,
                            opacity: 0.45,
                          }}
                          animate={{
                            translateY: -6,
                            scale: 1.15,
                            opacity: 1,
                          }}
                          transition={{
                            type: 'timing',
                            duration: 420,
                            loop: true,
                            repeatReverse: true,
                            delay: 0,
                          }}
                          style={[
                            styles.typingDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />

                        {/* Dot 2 */}
                        <MotiView
                          from={{
                            translateY: 0,
                            scale: 0.75,
                            opacity: 0.45,
                          }}
                          animate={{
                            translateY: -6,
                            scale: 1.15,
                            opacity: 1,
                          }}
                          transition={{
                            type: 'timing',
                            duration: 420,
                            loop: true,
                            repeatReverse: true,
                            delay: 140,
                          }}
                          style={[
                            styles.typingDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />

                        {/* Dot 3 */}
                        <MotiView
                          from={{
                            translateY: 0,
                            scale: 0.75,
                            opacity: 0.45,
                          }}
                          animate={{
                            translateY: -6,
                            scale: 1.15,
                            opacity: 1,
                          }}
                          transition={{
                            type: 'timing',
                            duration: 420,
                            loop: true,
                            repeatReverse: true,
                            delay: 280,
                          }}
                          style={[
                            styles.typingDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />
                      </View>
                    </MotiView>
                  </MotiView>
                )}

                {/* ================================================== */}
                {/* RETRY                                               */}
                {/* ================================================== */}

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
                      color={iconColor}
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

              {/* Scroll-to-bottom button */}
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
                            animated: true,
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

        {/* ======================================================== */}
        {/* INPUT AREA                                               */}
        {/* ======================================================== */}

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
                color={iconColor}
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
                  : 'Message Neurolia...'
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
                      : iconColor
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

/* ================================================================ */
/* STYLES                                                           */
/* ================================================================ */

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  mainContent: {
    flex: 1,
    position: 'relative',
  },

  /* ============================================================ */
  /* WELCOME                                                      */
  /* ============================================================ */

  welcomeScene: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    paddingHorizontal: 18,
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

  neuroliaDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  neuroliaName: {
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

  /* ============================================================ */
  /* HEADER                                                        */
  /* ============================================================ */

  chatHeader: {
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  headerInner: {
    minHeight: 62,
    alignItems: 'center',
  },

  headerAvatarContainer: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
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

  /* ============================================================ */
  /* CHAT                                                          */
  /* ============================================================ */

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

  messageAvatarContainer: {
    width: 32,
    height: 32,

    alignItems: 'center',
    justifyContent: 'center',
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

  /* ============================================================ */
  /* TYPING INDICATOR                                             */
  /* ============================================================ */

  typingRow: {
    width: '100%',
    marginBottom: 12,

    /*
     * Critical:
     * This makes the loader stay on the assistant side.
     */
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',

    flexDirection: 'row',
    alignItems: 'flex-end',

    gap: 8,
  },

  typingBubble: {
    minWidth: 72,
    minHeight: 46,

    paddingHorizontal: 16,

    borderRadius: 20,
    borderWidth: 1,

    justifyContent: 'center',
    alignItems: 'center',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 2,
  },

  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    height: 20,
  },

  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  /* ============================================================ */
  /* RETRY                                                         */
  /* ============================================================ */

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

  /* ============================================================ */
  /* SCROLL BUTTON                                                 */
  /* ============================================================ */

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

  /* ============================================================ */
  /* INPUT                                                         */
  /* ============================================================ */

  inputArea: {
    width: '100%',

    paddingTop: 8,

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

