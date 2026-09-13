import React, {
  useState,
} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  AppText as Text,
} from '../ui/AppText';

import {
  MotiView,
  MotiText,
  AnimatePresence,
} from 'moti';

import {
  LinearGradient,
} from 'expo-linear-gradient';

import * as Haptics from 'expo-haptics';

import {
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  ArrowLeft,
  Brain,
  Sparkles,
} from 'lucide-react-native';

import {
  useTheme,
} from '../../context/ThemeContext';

import {
  useLanguage,
} from '../../context/LanguageContext';

import {
  useAuth,
} from '../../context/AuthContext';

import {
  Input,
} from '../ui/Input';

import {
  Spacing,
  BorderRadius,
  Fonts,
} from '../../constants/theme';

/* ================================================================
   AUTH SCREEN
================================================================ */

export function AuthScreen() {
  const {
    colors,
    isDark,
  } = useTheme();

  const {
    t,
    isRTL,
  } = useLanguage();

  const {
    login,
    register,
    isLoading,
  } = useAuth();

  /* ==============================================================
     STATE
  ============================================================== */

  const [
    isLogin,
    setIsLogin,
  ] = useState(true);

  const [
    direction,
    setDirection,
  ] = useState<1 | -1>(1);

  const [
    username,
    setUsername,
  ] = useState('');

  const [
    phone,
    setPhone,
  ] = useState('');

  const [
    name,
    setName,
  ] = useState('');

  const [
    showPhone,
    setShowPhone,
  ] = useState(false);

  const [
    focusedField,
    setFocusedField,
  ] = useState<string | null>(
    null
  );

  const [
    pressed,
    setPressed,
  ] = useState(false);

  const [
    tabWidth,
    setTabWidth,
  ] = useState(0);

  /* ==============================================================
     FONT CONFIGURATION
  ============================================================== */

  const textFontFamily =
    isRTL
      ? Fonts.persian
      : Fonts.regular;

  const mediumTextFontFamily =
    isRTL
      ? Fonts.persian
      : Fonts.medium;

  const semiBoldTextFontFamily =
    isRTL
      ? Fonts.persian
      : Fonts.semiBold;

  const boldTextFontFamily =
    isRTL
      ? Fonts.persian
      : Fonts.bold;

  const persianSafeWeight =
    isRTL
      ? undefined
      : '400';

  const mediumSafeWeight =
    isRTL
      ? undefined
      : '500';

  const semiBoldSafeWeight =
    isRTL
      ? undefined
      : '600';

  const boldSafeWeight =
    isRTL
      ? undefined
      : '700';

  /* ==============================================================
     SUBMIT
  ============================================================== */

  const handleSubmit = async () => {
    if (isLoading) {
      return;
    }

    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    );

    /*
     * USERNAME VALIDATION
     */

    if (!username.trim()) {
      Alert.alert(
        'نام کاربری',
        'لطفاً نام کاربری خود را وارد کنید.'
      );

      return;
    }

    /*
     * PASSWORD VALIDATION
     */

    if (!phone.trim()) {
      Alert.alert(
        'رمز ورود',
        'لطفاً رمز ورود خود را وارد کنید.'
      );

      return;
    }

    /*
     * REGISTER NAME VALIDATION
     */

    if (
      !isLogin &&
      !name.trim()
    ) {
      Alert.alert(
        'نام',
        'لطفاً نام خود را وارد کنید.'
      );

      return;
    }

    try {
      /*
       * LOGIN
       */

      if (isLogin) {
        console.log(
          '[AUTH SCREEN] Starting login...'
        );

        console.log(
          '[AUTH SCREEN] Username:',
          username.trim()
        );

        console.log(
          '[AUTH SCREEN] Password:',
          phone.trim()
        );

        await login(
          username.trim(),
          phone.trim()
        );

        console.log(
          '[AUTH SCREEN] Login completed successfully.'
        );
      }

      /*
       * REGISTER
       */

      else {
        console.log(
          '[AUTH SCREEN] Starting register...'
        );

        await register(
          name.trim(),
          username.trim(),
          phone.trim()
        );

        console.log(
          '[AUTH SCREEN] Register completed successfully.'
        );
      }
    } catch (error) {
      console.error(
        '[AUTH SCREEN] Submit failed:',
        error
      );

      let message =
        'ورود انجام نشد. لطفاً دوباره تلاش کنید.';

      if (
        error instanceof Error &&
        error.message
      ) {
        message = error.message;
      }

      Alert.alert(
        'ورود ناموفق',
        message
      );
    }
  };

  /* ==============================================================
     SWITCH LOGIN / REGISTER
  ============================================================== */

  const switchMode = (
    toLogin: boolean
  ) => {
    if (
      toLogin === isLogin
    ) {
      return;
    }

    Haptics.selectionAsync();

    setDirection(
      toLogin
        ? -1
        : 1
    );

    setIsLogin(
      toLogin
    );
  };

  /* ==============================================================
     DIRECTIONAL ARROW
  ============================================================== */

  const ArrowIcon =
    isRTL
      ? ArrowLeft
      : ArrowRight;

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <LinearGradient
      colors={
        isDark
          ? [
              '#211A38',
              '#171331',
              '#100E1B',
            ]
          : [
              '#F4F0FF',
              '#FAF9FF',
              '#FFFFFF',
            ]
      }
      style={
        styles.container
      }
    >

      {/* ========================================================
          FLOATING AMBIENT ORB
      ======================================================== */}

      <MotiView
        from={{
          translateY: -20,
          translateX: -10,
          scale: 1,
        }}
        animate={{
          translateY: 30,
          translateX: 10,
          scale: 1.15,
        }}
        transition={{
          type: 'timing',
          duration: 7000,
          loop: true,
          repeatReverse: true,
        }}
        style={[
          styles.orb,
          {
            top: -60,
            left: -50,
            backgroundColor:
              colors.primary,
            opacity:
              isDark
                ? 0.28
                : 0.18,
          },
        ]}
      />

      <MotiView
        from={{
          translateY: 20,
          translateX: 10,
          scale: 1,
        }}
        animate={{
          translateY: -25,
          translateX: -15,
          scale: 1.2,
        }}
        transition={{
          type: 'timing',
          duration: 9000,
          loop: true,
          repeatReverse: true,
        }}
        style={[
          styles.orb,
          {
            bottom: -40,
            right: -60,
            width: 220,
            height: 220,
            backgroundColor:
              colors.accent,
            opacity:
              isDark
                ? 0.22
                : 0.15,
          },
        ]}
      />

      {/* ========================================================
          KEYBOARD CONTAINER
      ======================================================== */}

      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={
          styles.flex
        }
      >

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >

          {/* ====================================================
              HEADER / LOGO
          ==================================================== */}

          <View
            style={
              styles.header
            }
          >

            <View
              style={
                styles.logoWrapper
              }
            >

              <MotiView
                from={{
                  rotate: '0deg',
                }}
                animate={{
                  rotate: '360deg',
                }}
                transition={{
                  type: 'timing',
                  duration: 14000,
                  loop: true,
                  repeatReverse: false,
                }}
                style={
                  styles.logoRing
                }
              >

                <LinearGradient
                  colors={[
                    colors.primary,
                    colors.accent,
                    colors.primary,
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.logoRingGradient
                  }
                />

              </MotiView>

              <MotiView
                from={{
                  opacity: 0,
                  scale: 0.4,
                  rotate: '-25deg',
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: '0deg',
                }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 140,
                  delay: 100,
                }}
                style={[
                  styles.logoCore,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >

                <Brain
                  size={34}
                  color="#FFFFFF"
                />

              </MotiView>

              <MotiView
                from={{
                  opacity: 0,
                  scale: 0.5,
                  translateX: 22,
                  translateY: -18,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  translateX: 22,
                  translateY: -18,
                }}
                transition={{
                  type: 'spring',
                  damping: 9,
                  delay: 450,
                }}
                style={
                  styles.sparkleBadge
                }
              >

                <Sparkles
                  size={14}
                  color={
                    colors.primary
                  }
                />

              </MotiView>

            </View>

            {/* ==================================================
                APP NAME
            ================================================== */}

            <MotiText
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
                duration: 450,
                delay: 220,
              }}
              style={[
                styles.appName,
                {
                  color:
                    colors.text,

                  fontFamily:
                    boldTextFontFamily,

                  fontWeight:
                    boldSafeWeight,

                  writingDirection:
                    isRTL
                      ? 'rtl'
                      : 'ltr',
                },
              ]}
            >
              {t.appName}
            </MotiText>

            {/* ==================================================
                WELCOME
            ================================================== */}

            <MotiText
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
                duration: 450,
                delay: 340,
              }}
              style={[
                styles.welcome,
                {
                  color:
                    colors.textSecondary,

                  fontFamily:
                    textFontFamily,

                  fontWeight:
                    persianSafeWeight,

                  writingDirection:
                    isRTL
                      ? 'rtl'
                      : 'ltr',

                  textAlign:
                    isRTL
                      ? 'right'
                      : 'center',
                },
              ]}
            >
              {t.welcome}
            </MotiText>

          </View>

          {/* ====================================================
              FORM CARD
          ==================================================== */}

          <MotiView
            from={{
              opacity: 0,
              translateY: 40,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: 1,
            }}
            transition={{
              type: 'spring',
              damping: 16,
              stiffness: 120,
              delay: 250,
            }}
            style={[
              styles.form,
              {
                backgroundColor:
                  colors.surface,

                shadowColor:
                  isDark
                    ? colors.primary
                    : '#000',
              },
            ]}
          >

            {/* ==================================================
                TAB SWITCHER
            ================================================== */}

            <View
              onLayout={(e) =>
                setTabWidth(
                  e.nativeEvent
                    .layout.width
                )
              }
              style={[
                styles.tabsContainer,
                {
                  backgroundColor:
                    colors.surfaceSecondary,
                },
              ]}
            >

              {tabWidth > 0 && (
                <MotiView
                  animate={{
                    translateX:
                      isLogin
                        ? 2
                        : tabWidth / 2 - 2,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 20,
                    stiffness: 220,
                  }}
                  style={[
                    styles.tabIndicator,
                    {
                      width:
                        tabWidth / 2 - 4,

                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />
              )}

              <TouchableOpacity
                style={
                  styles.tabButton
                }
                activeOpacity={0.8}
                onPress={() =>
                  switchMode(true)
                }
              >

                <MotiText
                  animate={{
                    color:
                      isLogin
                        ? '#FFFFFF'
                        : colors.textSecondary,
                  } as any}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={[
                    styles.tabText,
                    {
                      fontFamily:
                        boldTextFontFamily,

                      fontWeight:
                        boldSafeWeight,

                      writingDirection:
                        isRTL
                          ? 'rtl'
                          : 'ltr',
                    },
                  ]}
                >
                  {t.login}
                </MotiText>

              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.tabButton
                }
                activeOpacity={0.8}
                onPress={() =>
                  switchMode(false)
                }
              >

                <MotiText
                  animate={{
                    color:
                      !isLogin
                        ? '#FFFFFF'
                        : colors.textSecondary,
                  } as any}
                  transition={{
                    type: 'timing',
                    duration: 200,
                  }}
                  style={[
                    styles.tabText,
                    {
                      fontFamily:
                        boldTextFontFamily,

                      fontWeight:
                        boldSafeWeight,

                      writingDirection:
                        isRTL
                          ? 'rtl'
                          : 'ltr',
                    },
                  ]}
                >
                  {t.register}
                </MotiText>

              </TouchableOpacity>

            </View>

            {/* ==================================================
                ANIMATED FORM
            ================================================== */}

            <AnimatePresence
              exitBeforeEnter
              custom={
                direction
              }
            >

              <MotiView
                key={
                  isLogin
                    ? 'login'
                    : 'register'
                }
                from={{
                  opacity: 0,
                  translateX:
                    36 * direction,
                }}
                animate={{
                  opacity: 1,
                  translateX: 0,
                }}
                exit={{
                  opacity: 0,
                  translateX:
                    -36 * direction,
                }}
                transition={{
                  type: 'timing',
                  duration: 280,
                }}
              >

                {/* ============================================
                    NAME
                ============================================ */}

                {!isLogin && (
                  <MotiView
                    from={{
                      opacity: 0,
                      translateY: -8,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      translateY: 0,
                      scale: 1,
                    }}
                    transition={{
                      type: 'timing',
                      duration: 320,
                      delay: 60,
                    }}
                  >

                    <FieldWrapper
                      fieldKey="name"
                      focusedField={
                        focusedField
                      }
                    >

                      <Input
                        label="نام"
                        value={
                          name
                        }
                        onChangeText={
                          setName
                        }
                        placeholder="نام خود را وارد کنید"
                        onFocus={() =>
                          setFocusedField(
                            'name'
                          )
                        }
                        onBlur={() =>
                          setFocusedField(
                            null
                          )
                        }
                        leftIcon={
                          <User
                            size={20}
                            color={
                              colors.textTertiary
                            }
                          />
                        }
                      />

                    </FieldWrapper>

                  </MotiView>
                )}

                {/* ============================================
                    USERNAME
                ============================================ */}

                <MotiView
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
                    duration: 320,
                    delay: 100,
                  }}
                >

                  <FieldWrapper
                    fieldKey="username"
                    focusedField={
                      focusedField
                    }
                  >

                    <Input
                      label="نام کاربری"
                      value={
                        username
                      }
                      onChangeText={
                        setUsername
                      }
                      placeholder="نام کاربری خود را وارد کنید"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() =>
                        setFocusedField(
                          'username'
                        )
                      }
                      onBlur={() =>
                        setFocusedField(
                          null
                        )
                      }
                      leftIcon={
                        <User
                          size={20}
                          color={
                            colors.textTertiary
                          }
                        />
                      }
                    />

                  </FieldWrapper>

                </MotiView>

                {/* ============================================
                    PASSWORD
                ============================================ */}

                <MotiView
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
                    duration: 320,
                    delay: 160,
                  }}
                >

                  <FieldWrapper
                    fieldKey="phone"
                    focusedField={
                      focusedField
                    }
                  >

                    <Input
                      label="رمز ورود"
                      value={
                        phone
                      }
                      onChangeText={
                        setPhone
                      }
                      placeholder="رمز ورود خود را وارد کنید"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={
                        !showPhone
                      }
                      onFocus={() =>
                        setFocusedField(
                          'phone'
                        )
                      }
                      onBlur={() =>
                        setFocusedField(
                          null
                        )
                      }
                      leftIcon={
                        <Lock
                          size={20}
                          color={
                            colors.textTertiary
                          }
                        />
                      }
                      rightIcon={
                        <TouchableOpacity
                          onPress={() =>
                            setShowPhone(
                              !showPhone
                            )
                          }
                          hitSlop={{
                            top: 8,
                            bottom: 8,
                            left: 8,
                            right: 8,
                          }}
                        >

                          <AnimatePresence
                            exitBeforeEnter
                          >

                            <MotiView
                              key={
                                showPhone
                                  ? 'visible'
                                  : 'hidden'
                              }
                              from={{
                                opacity: 0,
                                scale: 0.5,
                                rotate: '-45deg',
                              }}
                              animate={{
                                opacity: 1,
                                scale: 1,
                                rotate: '0deg',
                              }}
                              exit={{
                                opacity: 0,
                                scale: 0.5,
                                rotate: '45deg',
                              }}
                              transition={{
                                type: 'timing',
                                duration: 180,
                              }}
                            >

                              {showPhone ? (
                                <Eye
                                  size={20}
                                  color={
                                    colors.textTertiary
                                  }
                                />
                              ) : (
                                <EyeOff
                                  size={20}
                                  color={
                                    colors.textTertiary
                                  }
                                />
                              )}

                            </MotiView>

                          </AnimatePresence>

                        </TouchableOpacity>
                      }
                    />

                  </FieldWrapper>

                </MotiView>

                {/* ============================================
                    LOGIN INFO
                ============================================ */}

                {isLogin && (
                  <MotiView
                    from={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    transition={{
                      type: 'timing',
                      duration: 300,
                      delay: 220,
                    }}
                    style={
                      styles.loginHintWrapper
                    }
                  >

                    <Text
                      style={[
                        styles.loginHint,
                        {
                          color:
                            colors.textSecondary,

                          fontFamily:
                            textFontFamily,

                          fontWeight:
                            persianSafeWeight,

                          writingDirection:
                            isRTL
                              ? 'rtl'
                              : 'ltr',
                        },
                      ]}
                    >
                      لطفاً نام کاربری و رمز ورود ثبت‌شده خود را وارد کنید.
                    </Text>

                  </MotiView>
                )}

                {/* ============================================
                    SUBMIT BUTTON
                ============================================ */}

                <MotiView
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
                    duration: 320,
                    delay: 260,
                  }}
                >

                  <TouchableOpacity
                    activeOpacity={0.9}
                    disabled={
                      isLoading
                    }
                    onPressIn={() =>
                      setPressed(
                        true
                      )
                    }
                    onPressOut={() =>
                      setPressed(
                        false
                      )
                    }
                    onPress={
                      handleSubmit
                    }
                  >

                    <MotiView
                      animate={{
                        scale:
                          pressed
                            ? 0.97
                            : 1,
                      }}
                      transition={{
                        type: 'timing',
                        duration: 120,
                      }}
                      style={[
                        styles.submitButton,
                        {
                          backgroundColor:
                            colors.primary,
                        },
                      ]}
                    >

                      {!isLoading && (
                        <MotiView
                          from={{
                            translateX: -140,
                          }}
                          animate={{
                            translateX: 220,
                          }}
                          transition={{
                            type: 'timing',
                            duration: 2200,
                            loop: true,
                            delay: 400,
                          }}
                          style={
                            styles.shimmer
                          }
                        >

                          <LinearGradient
                            colors={[
                              'transparent',
                              'rgba(255,255,255,0.35)',
                              'transparent',
                            ]}
                            start={{
                              x: 0,
                              y: 0,
                            }}
                            end={{
                              x: 1,
                              y: 0,
                            }}
                            style={
                              styles.shimmerGradient
                            }
                          />

                        </MotiView>
                      )}

                      <AnimatePresence
                        exitBeforeEnter
                      >

                        {isLoading ? (

                          <MotiView
                            key="loading"
                            from={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                          >

                            <MotiView
                              from={{
                                rotate: '0deg',
                              }}
                              animate={{
                                rotate: '360deg',
                              }}
                              transition={{
                                type: 'timing',
                                duration: 700,
                                loop: true,
                              }}
                              style={
                                styles.loadingRing
                              }
                            />

                          </MotiView>

                        ) : (

                          <MotiView
                            key="idle"
                            from={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            exit={{
                              opacity: 0,
                            }}
                            style={
                              styles.submitContent
                            }
                          >

                            <Text
                              style={[
                                styles.submitText,
                                {
                                  fontFamily:
                                    boldTextFontFamily,

                                  fontWeight:
                                    boldSafeWeight,

                                  writingDirection:
                                    isRTL
                                      ? 'rtl'
                                      : 'ltr',
                                },
                              ]}
                            >
                              {isLogin
                                ? t.login
                                : t.register}
                            </Text>

                            <ArrowIcon
                              size={20}
                              color="#FFFFFF"
                            />

                          </MotiView>

                        )}

                      </AnimatePresence>

                    </MotiView>

                  </TouchableOpacity>

                </MotiView>

                {/* ============================================
                    SWITCH AUTH MODE
                ============================================ */}

                <MotiView
                  from={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    type: 'timing',
                    duration: 300,
                    delay: 320,
                  }}
                  style={
                    styles.switchAuth
                  }
                >

                  <Text
                    style={[
                      styles.switchText,
                      {
                        color:
                          colors.textSecondary,

                        fontFamily:
                          textFontFamily,

                        fontWeight:
                          persianSafeWeight,

                        writingDirection:
                          isRTL
                            ? 'rtl'
                            : 'ltr',
                      },
                    ]}
                  >
                    {isLogin
                      ? t.noAccount
                      : t.hasAccount}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      switchMode(
                        !isLogin
                      )
                    }
                  >

                    <Text
                      style={[
                        styles.switchLink,
                        {
                          color:
                            colors.primary,

                          fontFamily:
                            semiBoldTextFontFamily,

                          fontWeight:
                            semiBoldSafeWeight,

                          writingDirection:
                            isRTL
                              ? 'rtl'
                              : 'ltr',
                        },
                      ]}
                    >
                      {isLogin
                        ? t.register
                        : t.login}
                    </Text>

                  </TouchableOpacity>

                </MotiView>

              </MotiView>

            </AnimatePresence>

          </MotiView>

        </ScrollView>

      </KeyboardAvoidingView>

    </LinearGradient>
  );
}

/* ================================================================
   FIELD WRAPPER
================================================================ */

function FieldWrapper({
  fieldKey,
  focusedField,
  children,
}: {
  fieldKey: string;
  focusedField: string | null;
  children: React.ReactNode;
}) {
  const isFocused =
    focusedField ===
    fieldKey;

  return (
    <MotiView
      animate={{
        scale:
          isFocused
            ? 1.015
            : 1,
      }}
      transition={{
        type: 'spring',
        damping: 18,
        stiffness: 220,
      }}
    >
      {children}
    </MotiView>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
    },

    flex: {
      flex: 1,
    },

    orb: {
      position: 'absolute',

      width: 260,
      height: 260,

      borderRadius: 200,
    },

    scrollContent: {
      flexGrow: 1,

      paddingHorizontal:
        Spacing.lg,

      paddingTop:
        Spacing.xxl * 1.6,

      paddingBottom:
        Spacing.xxl,
    },

    header: {
      alignItems: 'center',

      marginBottom:
        Spacing.xl,
    },

    logoWrapper: {
      width: 100,
      height: 100,

      alignItems: 'center',
      justifyContent: 'center',

      marginBottom:
        Spacing.md,
    },

    logoRing: {
      position: 'absolute',

      width: 100,
      height: 100,

      borderRadius: 50,

      overflow: 'hidden',

      padding: 4,
    },

    logoRingGradient: {
      flex: 1,

      borderRadius: 50,
    },

    logoCore: {
      width: 84,
      height: 84,

      borderRadius: 42,

      alignItems: 'center',
      justifyContent: 'center',
    },

    sparkleBadge: {
      position: 'absolute',

      width: 28,
      height: 28,

      borderRadius: 14,

      backgroundColor: '#FFFFFF',

      alignItems: 'center',
      justifyContent: 'center',

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity: 0.15,

      shadowRadius: 4,

      elevation: 4,
    },

    appName: {
      fontSize: 32,

      marginBottom:
        Spacing.xs,
    },

    welcome: {
      fontSize: 16,
    },

    form: {
      borderRadius:
        BorderRadius.xl,

      padding:
        Spacing.lg,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity: 0.14,

      shadowRadius: 24,

      elevation: 8,
    },

    tabsContainer: {
      flexDirection: 'row',

      borderRadius:
        BorderRadius.lg,

      padding: 2,

      marginBottom:
        Spacing.lg,

      position: 'relative',

      overflow: 'hidden',
    },

    tabIndicator: {
      position: 'absolute',

      top: 2,
      bottom: 2,

      borderRadius:
        BorderRadius.md,
    },

    tabButton: {
      flex: 1,

      paddingVertical: 11,

      alignItems: 'center',
      justifyContent: 'center',

      zIndex: 1,
    },

    tabText: {
      fontSize: 14,
    },

    loginHintWrapper: {
      marginTop: 2,

      marginBottom:
        Spacing.md,

      paddingHorizontal: 2,
    },

    loginHint: {
      fontSize: 12,

      lineHeight: 20,

      textAlign: 'right',
    },

    submitButton: {
      height: 52,

      borderRadius:
        BorderRadius.lg,

      alignItems: 'center',

      justifyContent: 'center',

      marginTop:
        Spacing.md,

      overflow: 'hidden',
    },

    submitContent: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent: 'center',

      gap: 8,
    },

    submitText: {
      color: '#FFFFFF',

      fontSize: 16,
    },

    shimmer: {
      position: 'absolute',

      top: 0,
      bottom: 0,

      width: 90,
    },

    shimmerGradient: {
      flex: 1,

      width: 90,

      transform: [
        {
          skewX: '-20deg',
        },
      ],
    },

    loadingRing: {
      width: 22,
      height: 22,

      borderRadius: 11,

      borderWidth: 2.5,

      borderColor:
        'rgba(255,255,255,0.35)',

      borderTopColor:
        '#FFFFFF',
    },

    switchAuth: {
      flexDirection: 'row',

      justifyContent: 'center',

      alignItems: 'center',

      marginTop:
        Spacing.lg,

      gap:
        Spacing.xs,
    },

    switchText: {
      fontSize: 14,
    },

    switchLink: {
      fontSize: 14,
    },

  });