import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
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
} from 'lucide-react-native';

const { width } = Dimensions.get('window');
const MIN_TAP_TARGET = 44;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const suggestions = [
  { icon: Activity, label: 'analyzeSymptoms', color: '#EF4444' },
  { icon: Pill, label: 'medication', color: '#6366F1' },
  { icon: Calendar, label: 'schedule', color: '#8B5CF6' },
  { icon: FileText, label: 'protocol', color: '#10B981' },
];

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL, language } = useLanguage();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [placeholderNotice, setPlaceholderNotice] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const isNearBottomRef = useRef(true);
  const noticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const notifyLight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleSend = (text?: string) => {
    const messageText = (text ?? inputText).trim();
    if (!messageText) return;

    notifyLight();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    setIsThinking(true);

    setTimeout(() => {
      const responses = [
        t.breathingExercise,
        t.mindfulnessSession,
        t.progressInsight,
        t.weeklyReport,
      ];

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: getCurrentTime(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000);
  };

  const showComingSoon = (label: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    setPlaceholderNotice(label);
    noticeTimeoutRef.current = setTimeout(() => setPlaceholderNotice(null), 1800);
  };

  useEffect(() => {
    if (messages.length > 0 && isNearBottomRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
    };
  }, []);

  const handleScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    const nearBottom = distanceFromBottom < 80;
    isNearBottomRef.current = nearBottom;
    setShowScrollToBottom(!nearBottom && messages.length > 0);
  };

  const scrollToBottom = () => {
    notifyLight();
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const rowDir = isRTL ? 'row-reverse' : 'row';
  const reverseRowDir = isRTL ? 'row' : 'row-reverse';

  return (
    <LinearGradient
      colors={isDark ? ['#09090B', '#18181B'] : ['#EEF2FF', '#FFFFFF', '#F8FAFC']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { paddingTop: insets.top + Spacing.xs }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 600 }}
          style={styles.header}
        >
          <MotiView
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ loop: true, duration: 2500, type: 'timing' }}
          >
            <View
              style={[
                styles.aiAvatar,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
              ]}
            >
              <View style={styles.glowRing} />
              <Image source={require('../../assets/avatars/model 2.jpg')} style={styles.aiAvatarImage} />
            </View>
          </MotiView>

          <Text style={[styles.aiName, { color: colors.text }]}>
            {t.novaAI} <Text style={styles.aiSparkle}>✨</Text>
          </Text>
          <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
            {t.cognitiveCompanion}
          </Text>

          <View style={[styles.statusContainer, { flexDirection: rowDir }]}>
            <View style={[styles.statusDot, { backgroundColor: '#4ade80' }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>{t.online}</Text>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 150 }}
          style={[
            styles.memoryCard,
            {
              backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)',
              borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
            },
          ]}
        >
          <View style={[styles.memoryHeader, { flexDirection: rowDir }]}>
            <Brain size={18} color={colors.primary} />
            <Text
              style={[
                styles.memoryTitle,
                { color: colors.text, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 },
              ]}
            >
              {t.memoryActive}
            </Text>
          </View>
          <View style={[styles.memoryItems, { flexDirection: rowDir }]}>
            <View style={[styles.memoryItem, { flexDirection: rowDir }]}>
              <Text style={styles.memoryCheck}>✓</Text>
              <Text style={[styles.memoryText, { color: colors.textSecondary }]}>
                {t.medicationData}
              </Text>
            </View>
            <View style={[styles.memoryItem, { flexDirection: rowDir }]}>
              <Text style={styles.memoryCheck}>✓</Text>
              <Text style={[styles.memoryText, { color: colors.textSecondary }]}>
                {t.dailyGoals}
              </Text>
            </View>
            <View style={[styles.memoryItem, { flexDirection: rowDir }]}>
              <Text style={styles.memoryCheck}>✓</Text>
              <Text style={[styles.memoryText, { color: colors.textSecondary }]}>
                {t.healthData}
              </Text>
            </View>
          </View>
        </MotiView>

        <View style={{ flex: 1 }}>
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
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 500 }}
                style={styles.welcomeContainer}
              >
                <Sparkles size={42} color={colors.primary} />
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>{t.hello} 👋</Text>
                <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                  {t.cognitiveCompanion}
                </Text>
                <Text style={[styles.welcomeSubtext, { color: colors.textTertiary }]}>
                  {t.howCanHelp}
                </Text>

                <View style={styles.suggestionsGrid}>
                  {suggestions.map((suggestion, index) => {
                    const labelText = t[suggestion.label as keyof typeof t] || suggestion.label;
                    return (
                      <MotiView
                        key={index}
                        from={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 80 }}
                        style={styles.suggestionWrapper}
                      >
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityLabel={labelText}
                          style={[
                            styles.suggestionButton,
                            { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border },
                          ]}
                          onPress={() => handleSend(labelText)}
                        >
                          <View style={[styles.suggestionIconBg, { backgroundColor: suggestion.color + '15' }]}>
                            <suggestion.icon size={24} color={suggestion.color} />
                          </View>
                          <Text style={[styles.suggestionLabel, { color: colors.text }]}>
                            {labelText}
                          </Text>
                        </TouchableOpacity>
                      </MotiView>
                    );
                  })}
                </View>
              </MotiView>
            )}

            {messages.map((message, index) => (
              <MotiView
                key={message.id}
                from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                  type: 'spring',
                  damping: 20,
                  stiffness: 200,
                  delay: index === messages.length - 1 ? 100 : 0,
                }}
                style={[
                  styles.messageWrapper,
                  { flexDirection: message.isUser ? reverseRowDir : rowDir },
                ]}
              >
                {!message.isUser && (
                  <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                    <Image source={require('../../assets/avatars/model 2.jpg')} style={styles.avatarImage} />
                  </View>
                )}

                <View style={{ maxWidth: '80%' }}>
                  {!message.isUser && (
                    <Text
                      style={[
                        styles.senderName,
                        { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
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
                        backgroundColor: message.isUser ? undefined : isDark ? colors.surface : '#FFFFFF',
                        borderColor: message.isUser ? 'transparent' : colors.border,
                        borderWidth: message.isUser ? 0 : 1,
                      },
                    ]}
                  >
                    {message.isUser ? (
                      <LinearGradient
                        colors={[colors.primary, '#8B5CF6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradientBubble, isRTL ? styles.userBubbleRTL : styles.userBubbleLTR]}
                      >
                        <Text style={[styles.messageText, { color: '#FFFFFF', textAlign: isRTL ? 'right' : 'left' }]}>
                          {message.text}
                        </Text>
                      </LinearGradient>
                    ) : (
                      <Text style={[styles.messageText, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
                        {message.text}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.timestamp,
                      {
                        color: colors.textTertiary,
                        textAlign: message.isUser ? (isRTL ? 'left' : 'right') : (isRTL ? 'right' : 'left'),
                        marginHorizontal: message.isUser ? 0 : Spacing.sm,
                      },
                    ]}
                  >
                    {message.timestamp}
                  </Text>
                </View>

                {message.isUser && (
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.userAvatarText}>{language === 'fa' ? 'شما' : 'You'}</Text>
                  </View>
                )}
              </MotiView>
            ))}

            {isTyping && (
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={[styles.messageWrapper, { flexDirection: rowDir }]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                  <MotiView
                    animate={{ scale: isThinking ? [1, 1.15, 1] : 1 }}
                    transition={{ loop: isThinking, duration: 1200, type: 'timing' }}
                    style={styles.avatarContainer}
                  >
                    <Image source={require('../../assets/avatars/model 2.jpg')} style={styles.avatarImage} />

                    {isThinking && (
                      <MotiView
                        from={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ loop: true, duration: 1500, type: 'timing', repeatReverse: false }}
                        style={[styles.expandingRing, { borderColor: colors.primary }]}
                      />
                    )}
                    {isThinking && (
                      <MotiView
                        from={{ scale: 1, opacity: 0.4 }}
                        animate={{ scale: 1.8, opacity: 0 }}
                        transition={{ loop: true, duration: 1500, delay: 500, type: 'timing', repeatReverse: false }}
                        style={[styles.expandingRing, { borderColor: colors.primary }]}
                      />
                    )}
                  </MotiView>
                </View>

                <View style={[styles.typingWrapper, { flexDirection: rowDir }]}>
                  <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                    {isThinking ? t.analyzing : t.thinking}
                  </Text>
                  <View style={[styles.typingDots, { flexDirection: rowDir }]}>
                    {[0, 150, 300].map((delay, index) => (
                      <MotiView
                        key={index}
                        from={{ opacity: 0.3, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ loop: true, duration: 600, delay, type: 'timing' }}
                        style={[styles.typingDot, { backgroundColor: colors.primary }]}
                      />
                    ))}
                  </View>
                </View>
              </MotiView>
            )}
          </ScrollView>

          <AnimatePresence>
            {showScrollToBottom && (
              <MotiView
                from={{ opacity: 0, translateY: 10, scale: 0.9 }}
                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                exit={{ opacity: 0, translateY: 10, scale: 0.9 }}
                transition={{ type: 'timing', duration: 200 }}
                style={styles.scrollToBottomWrap}
              >
                <TouchableOpacity
                  onPress={scrollToBottom}
                  accessibilityRole="button"
                  accessibilityLabel={language === 'fa' ? 'رفتن به آخرین پیام' : 'Go to latest message'}
                  style={[styles.scrollToBottomButton, { backgroundColor: colors.primary }]}
                >
                  <ChevronDown size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </MotiView>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {placeholderNotice && (
              <MotiView
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: 8 }}
                transition={{ type: 'timing', duration: 200 }}
                style={[styles.noticeToast, { backgroundColor: isDark ? colors.surface : '#1F2937' }]}
              >
                <Text style={styles.noticeToastText}>{placeholderNotice}</Text>
              </MotiView>
            )}
          </AnimatePresence>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={[
            styles.inputContainer,
            {
              flexDirection: rowDir,
              backgroundColor: isDark ? 'rgba(24,24,27,0.95)' : 'rgba(255,255,255,0.95)',
              borderColor: colors.border,
              marginBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.menuButton}
            accessibilityRole="button"
            accessibilityLabel={language === 'fa' ? 'پیوست فایل' : 'Attach file'}
            onPress={() => showComingSoon(language === 'fa' ? 'این قابلیت به‌زودی اضافه می‌شود' : 'Coming soon')}
          >
            <Plus size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t.askNova}
            placeholderTextColor={colors.textTertiary}
            multiline
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => handleSend()}
          />

          <TouchableOpacity
            style={styles.voiceButton}
            accessibilityRole="button"
            accessibilityLabel={language === 'fa' ? 'ورودی صوتی' : 'Voice input'}
            onPress={() => showComingSoon(language === 'fa' ? 'ورودی صوتی به‌زودی اضافه می‌شود' : 'Voice input coming soon')}
          >
            <Mic size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <MotiView
            animate={{
              scale: inputText.trim().length > 0 ? 1 : 0.9,
              opacity: inputText.trim().length > 0 ? 1 : 0.5,
            }}
          >
            <TouchableOpacity
              onPress={() => handleSend()}
              accessibilityRole="button"
              accessibilityLabel={language === 'fa' ? 'ارسال' : 'Send'}
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim().length > 0 ? colors.primary : colors.border },
              ]}
              disabled={!inputText.trim()}
            >
              <Send size={18} color="#FFFFFF" style={isRTL ? styles.sendIconRTL : undefined} />
            </TouchableOpacity>
          </MotiView>
        </MotiView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  container: { flex: 1 },

  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: Spacing.sm,
  },
  aiAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  aiAvatarImage: { width: 64, height: 64, borderRadius: 32 },
  glowRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  aiName: { fontSize: 22, fontWeight: '700', marginTop: Spacing.sm },
  aiSparkle: { fontSize: 18 },
  aiSubtitle: { fontSize: 13, fontWeight: '400', marginTop: 2 },
  statusContainer: { alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 6 },
  statusText: { fontSize: 12, fontWeight: '400' },

  memoryCard: { padding: 14, borderRadius: 20, borderWidth: 1, marginBottom: Spacing.md },
  memoryHeader: { alignItems: 'center', marginBottom: 8 },
  memoryTitle: { fontSize: 13, fontWeight: '600' },
  memoryItems: { flexWrap: 'wrap', gap: 12 },
  memoryItem: { alignItems: 'center', gap: 4 },
  memoryCheck: { fontSize: 12, color: '#4ADE80' },
  memoryText: { fontSize: 12, fontWeight: '400' },

  messagesContainer: { flex: 1 },
  messagesContent: { paddingBottom: Spacing.md },
  messageWrapper: { marginBottom: Spacing.md, alignItems: 'flex-start' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  avatarContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 32, height: 32, borderRadius: 16 },
  userAvatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  senderName: { fontSize: 11, fontWeight: '500', marginBottom: 4, marginHorizontal: 4 },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userBubbleLTR: { borderTopRightRadius: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden' },
  userBubbleRTL: { borderTopLeftRadius: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, overflow: 'hidden' },
  botBubbleLTR: { borderTopLeftRadius: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  botBubbleRTL: { borderTopRightRadius: 6, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  gradientBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  messageText: { fontSize: 15, lineHeight: 22 },
  timestamp: { fontSize: 10, marginTop: 4, opacity: 0.6 },

  typingWrapper: { alignItems: 'center', paddingHorizontal: 4 },
  typingText: { fontSize: 13, marginHorizontal: 8 },
  typingDots: { alignItems: 'center' },
  typingDot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 2 },
  expandingRing: { position: 'absolute', width: 32, height: 32, borderRadius: 16, borderWidth: 2 },

  scrollToBottomWrap: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
  },
  scrollToBottomButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: MIN_TAP_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  noticeToast: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  noticeToastText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },

  welcomeContainer: { alignItems: 'center', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg },
  welcomeTitle: { fontSize: 28, fontWeight: '700', marginTop: Spacing.md, marginBottom: Spacing.xs },
  welcomeText: { fontSize: 16, fontWeight: '400', textAlign: 'center' },
  welcomeSubtext: { fontSize: 14, marginTop: 4, textAlign: 'center' },

  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    width: '100%',
    paddingHorizontal: 4,
  },
  suggestionWrapper: { width: '48%', marginBottom: 10 },
  suggestionButton: {
    height: 80,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  suggestionLabel: { fontSize: 13, fontWeight: '500' },

  inputContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  menuButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 8, maxHeight: 100, minHeight: 40 },
  voiceButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: MIN_TAP_TARGET,
    height: MIN_TAP_TARGET,
    borderRadius: MIN_TAP_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIconRTL: { transform: [{ scaleX: -1 }] },
});