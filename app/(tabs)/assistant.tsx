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
  Dimensions
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { 
  Send, 
  Mic, 
  Brain, 
  Sparkles,
  Heart,
  Activity,
  Pill,
  Calendar,
  FileText,
  Plus
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

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
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
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
    setIsThinking(true);

    setTimeout(() => {
      const responses = [
        t.breathingExercise || "I understand how you're feeling. Let's work through this together. Would you like to try a breathing exercise?",
        t.mindfulnessSession || "That's a great question! Based on your cognitive patterns, I'd suggest a 5-minute mindfulness session.",
        t.progressInsight || "I've analyzed your recent activities. You're making excellent progress! Keep up the great work.",
        t.weeklyReport || "Let me think about that. Your cognitive health is improving steadily. Would you like to see your weekly report?",
        "That's interesting. I notice you've been consistent with your medication schedule. Well done!",
      ];
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: getCurrentTime(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      setIsThinking(false);
    }, 1500 + Math.random() * 1000);
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
      colors={isDark ? ['#09090B', '#18181B'] : ['#EEF2FF', '#FFFFFF', '#F8FAFC']}
      style={styles.gradientContainer}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: 'transparent' }]}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* ===== HEADER ===== */}
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 600 }}
          style={styles.header}
        >
          <MotiView
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              loop: true,
              duration: 2500,
              type: 'timing',
            }}
          >
            <View style={[
              styles.aiAvatar,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
              }
            ]}>
              <View style={styles.glowRing} />
              <Image
                source={require('../../assets/avatars/model 2.jpg')}
                style={styles.aiAvatarImage}
              />
            </View>
          </MotiView>
          
          <Text style={[styles.aiName, { color: colors.text }]}>
            {t.novaAI || 'Nova AI'} <Text style={styles.aiSparkle}>✨</Text>
          </Text>
          <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
            {t.cognitiveCompanion || 'Cognitive Companion'}
          </Text>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: '#4ade80' }]} />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {t.online || 'Online'}
            </Text>
          </View>
        </MotiView>

        {/* ===== MEMORY CARD ===== */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 150 }}
          style={[styles.memoryCard, { 
            backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)',
            borderColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
          }]}
        >
          <View style={styles.memoryHeader}>
            <Brain size={18} color={colors.primary} />
            <Text style={[styles.memoryTitle, { color: colors.text }]}>
              {t.memoryActive || 'Memory Active'}
            </Text>
          </View>
          <View style={styles.memoryItems}>
            <View style={styles.memoryItem}>
              <Text style={styles.memoryCheck}>✓</Text>
              <Text style={[styles.memoryText, { color: colors.textSecondary }]}>
                {t.medicationData || 'Medication'}
              </Text>
            </View>
            <View style={styles.memoryItem}>
              <Text style={styles.memoryCheck}>✓</Text>
              <Text style={[styles.memoryText, { color: colors.textSecondary }]}>
                {t.dailyGoals || 'Goals'}
              </Text>
            </View>
            <View style={styles.memoryItem}>
              <Text style={styles.memoryCheck}>✓</Text>
              <Text style={[styles.memoryText, { color: colors.textSecondary }]}>
                {t.healthData || 'Health Data'}
              </Text>
            </View>
          </View>
        </MotiView>

        {/* ===== MESSAGES ===== */}
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
              <Sparkles size={42} color={colors.primary} />
              <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                {t.hello || 'Hello!'} 👋
              </Text>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
                {t.cognitiveCompanion || "I'm Nova, your cognitive health companion."}
              </Text>
              <Text style={[styles.welcomeSubtext, { color: colors.textTertiary }]}>
                {t.howCanHelp || 'How can I support you today?'}
              </Text>

              {/* ===== SUGGESTIONS GRID - 2 Columns 2 Rows ===== */}
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
                        style={[styles.suggestionButton, { 
                          backgroundColor: isDark ? colors.surface : '#FFFFFF',
                          borderColor: colors.border,
                        }]}
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
              from={{
                opacity: 0,
                scale: 0.9,
                translateY: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                translateY: 0,
              }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 200,
                delay: index === messages.length - 1 ? 100 : 0,
              }}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userWrapper : styles.botWrapper,
              ]}
            >
              {!message.isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                  <Image
                    source={require('../../assets/avatars/model 2.jpg')}
                    style={styles.avatarImage}
                  />
                </View>
              )}

              <View style={{ maxWidth: '80%' }}>
                {!message.isUser && (
                  <Text style={[styles.senderName, { color: colors.textSecondary }]}>
                    {t.novaAI || 'Nova'}
                  </Text>
                )}
                
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.botBubble,
                    {
                      backgroundColor: message.isUser ? undefined : (isDark ? colors.surface : '#FFFFFF'),
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
                      style={styles.gradientBubble}
                    >
                      <Text style={[styles.messageText, { color: '#FFFFFF' }]}>
                        {message.text}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text style={[styles.messageText, { color: colors.text }]}>
                      {message.text}
                    </Text>
                  )}
                </View>
                <Text style={[styles.timestamp, { 
                  color: colors.textTertiary,
                  textAlign: message.isUser ? 'right' : 'left',
                  marginHorizontal: message.isUser ? 0 : Spacing.sm,
                }]}>
                  {message.timestamp}
                </Text>
              </View>

              {message.isUser && (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.userAvatarText}>You</Text>
                </View>
              )}
            </MotiView>
          ))}

          {/* ===== TYPING INDICATOR WITH EXPANDING AVATAR ===== */}
          {isTyping && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={[styles.messageWrapper, styles.botWrapper]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.surfaceSecondary }]}>
                <MotiView
                  animate={{
                    scale: isThinking ? [1, 1.15, 1] : 1,
                  }}
                  transition={{
                    loop: isThinking,
                    duration: 1200,
                    type: 'timing',
                  }}
                  style={styles.avatarContainer}
                >
                  <Image
                    source={require('../../assets/avatars/model 2.jpg')}
                    style={styles.avatarImage}
                  />
                  
                  {/* ===== EXPANDING RING OUTSIDE AVATAR ===== */}
                  {isThinking && (
                    <MotiView
                      from={{ 
                        scale: 1,
                        opacity: 0.6,
                      }}
                      animate={{ 
                        scale: 1.6,
                        opacity: 0,
                      }}
                      transition={{
                        loop: true,
                        duration: 1500,
                        type: 'timing',
                        repeatReverse: false,
                      }}
                      style={[styles.expandingRing, { borderColor: colors.primary }]}
                    />
                  )}
                  
                  {/* ===== SECOND EXPANDING RING ===== */}
                  {isThinking && (
                    <MotiView
                      from={{ 
                        scale: 1,
                        opacity: 0.4,
                      }}
                      animate={{ 
                        scale: 1.8,
                        opacity: 0,
                      }}
                      transition={{
                        loop: true,
                        duration: 1500,
                        delay: 500,
                        type: 'timing',
                        repeatReverse: false,
                      }}
                      style={[styles.expandingRing, { borderColor: colors.primary }]}
                    />
                  )}
                </MotiView>
              </View>
              
              <View style={styles.typingWrapper}>
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                  {isThinking ? (t.analyzing || 'Nova is thinking') : (t.thinking || 'Typing')}
                </Text>
                <View style={styles.typingDots}>
                  {[0, 150, 300].map((delay, index) => (
                    <MotiView
                      key={index}
                      from={{ opacity: 0.3, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        loop: true,
                        duration: 600,
                        delay: delay,
                        type: 'timing',
                      }}
                      style={[styles.typingDot, { backgroundColor: colors.primary }]}
                    />
                  ))}
                </View>
              </View>
            </MotiView>
          )}
        </ScrollView>

        {/* ===== INPUT ===== */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          style={[styles.inputContainer, {
            backgroundColor: isDark ? 'rgba(24,24,27,0.95)' : 'rgba(255,255,255,0.95)',
            borderColor: colors.border,
          }]}
        >
          <TouchableOpacity style={styles.menuButton}>
            <Plus size={22} color={colors.textTertiary} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { color: colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t.askNova || 'Ask Nova...'}
            placeholderTextColor={colors.textTertiary}
            multiline
          />

          <TouchableOpacity style={styles.voiceButton}>
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
              style={[styles.sendButton, { 
                backgroundColor: inputText.trim().length > 0 ? colors.primary : colors.border 
              }]}
              disabled={!inputText.trim()}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </MotiView>
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
    paddingTop: 80,
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // ===== HEADER =====
  header: {
    alignItems: 'center',
    paddingTop: Spacing.md,
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
  aiAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  aiName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  aiSparkle: {
    fontSize: 18,
  },
  aiSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '400',
  },

  // ===== MEMORY CARD =====
  memoryCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  memoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  memoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
  memoryItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memoryCheck: {
    fontSize: 12,
    color: '#4ADE80',
    marginRight: 4,
  },
  memoryText: {
    fontSize: 12,
    fontWeight: '400',
  },

  // ===== MESSAGES =====
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: Spacing.md,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  userWrapper: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    marginLeft: 40,
  },
  botWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginRight: 40,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
    marginBottom: 4,
  },
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
  userBubble: {
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  botBubble: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  gradientBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.6,
  },

  // ===== TYPING =====
  typingWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingLeft: 4,
  },
  typingText: {
    fontSize: 13,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  
  // ===== EXPANDING RING =====
  expandingRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },

  // ===== WELCOME =====
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  welcomeSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },

  // ===== SUGGESTIONS GRID - 2 Columns 2 Rows =====
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    width: '100%',
    paddingHorizontal: 4,
  },
  suggestionWrapper: {
    width: '48%',
    marginBottom: 10,
  },
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
  suggestionLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ===== INPUT =====
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 40,
  },
  voiceButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});