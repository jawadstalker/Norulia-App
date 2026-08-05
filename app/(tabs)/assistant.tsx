import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Send, User, Mic, Paperclip } from 'lucide-react-native';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const suggestions = [
  { icon: '🩺', label: 'Analyze symptoms' },
  { icon: '💊', label: 'Medication' },
  { icon: '📅', label: 'Schedule' },
  { icon: '📄', label: 'Protocol' },
];

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: getCurrentTime(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand how you're feeling. Let's work through this together. Would you like to try a breathing exercise?",
        isUser: false,
        timestamp: getCurrentTime(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <LinearGradient
      colors={isDark ? ['#0a0a0f', '#14141e'] : ['#f0f4ff', '#ffffff']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: 'transparent' }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <View style={styles.header}>
          <MotiView
            from={{ scale: 0.95 }}
            animate={{ scale: 1.05 }}
            transition={{
              type: 'timing',
              loop: true,
              duration: 1800,
            }}
          >
            <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
              <View style={styles.glowRing} />
              <Image
                source={require('../../assets/avatars/model1.jpg')}
                style={styles.aiAvatarImage}
              />
            </View>
          </MotiView>
          <Text style={[styles.aiName, { color: colors.text }]}>Nova AI</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: '#4ade80' }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>Online</Text>
          </View>
          <Text style={[styles.statusSubtext, { color: colors.textTertiary }]}>Always ready to help</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
              style={styles.welcomeContainer}
            >
              <Text style={[styles.welcomeEmoji, { color: colors.text }]}>👋</Text>
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>Hello!</Text>
              <Text style={[styles.welcomeSubtitle, { color: colors.text }]}>
                I'm <Text style={{ color: colors.primary, fontWeight: '700' }}>Nova</Text>,
              </Text>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                your personal AI assistant.
              </Text>
              <Text style={[styles.welcomeText, { color: colors.textTertiary, marginTop: 4 }]}>
                Ask me anything.
              </Text>

              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                  <MotiView
                    key={index}
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 80 }}
                  >
                    <TouchableOpacity
                      style={[styles.suggestionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => handleSend(suggestion.label)}
                    >
                      <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                      <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion.label}</Text>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
            </MotiView>
          )}

          {messages.map((message, index) => (
            <MotiView
              key={message.id}
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 150 }}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userWrapper : styles.botWrapper,
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: message.isUser ? colors.primary : colors.surfaceSecondary }]}>
                {message.isUser ? (
                  <User size={20} color="#FFFFFF" />
                ) : (
                  <Image
                  source={require('../../assets/avatars/model1.jpg')}
                    style={styles.avatarImage}
                  />
                )}
              </View>
              <View>
                <View
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor: message.isUser ? colors.primary : isDark ? colors.surface : '#ffffff',
                      borderColor: message.isUser ? 'transparent' : colors.border,
                      borderWidth: message.isUser ? 0 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: message.isUser ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
                <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                  {message.timestamp}
                </Text>
              </View>
            </MotiView>
          ))}

          {isTyping && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={[styles.messageWrapper, styles.botWrapper]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                <Image
                  source={require('../../assets/avatars/model1.jpg')}
                  style={styles.avatarImage}
                />
              </View>
              <View style={[styles.messageBubble, { backgroundColor: isDark ? colors.surface : '#ffffff', borderColor: colors.border, borderWidth: 1 }]}>
                <View style={styles.typingContainer}>
                  <MotiView
                    from={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ loop: true, duration: 600, delay: 0 }}
                    style={[styles.typingDot, { backgroundColor: colors.primary }]}
                  />
                  <MotiView
                    from={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ loop: true, duration: 600, delay: 150 }}
                    style={[styles.typingDot, { backgroundColor: colors.primary }]}
                  />
                  <MotiView
                    from={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ loop: true, duration: 600, delay: 300 }}
                    style={[styles.typingDot, { backgroundColor: colors.primary }]}
                  />
                </View>
              </View>
            </MotiView>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(20,20,30,0.8)' : 'rgba(255,255,255,0.8)', borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.attachmentButton}>
            <Paperclip size={22} color={colors.textTertiary} />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? colors.surface : '#f0f4ff', color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
          <TouchableOpacity style={styles.micButton}>
            <Mic size={22} color={colors.textTertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[styles.sendButton, { backgroundColor: colors.primary }]}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  aiAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  aiAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  aiName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: Spacing.lg,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botWrapper: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: Spacing.sm,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    backdropFilter: 'blur(10px)',
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: Spacing.sm,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentButton: {
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
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: 8,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    margin: 4,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});