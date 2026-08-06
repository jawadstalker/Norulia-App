import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spacing, BorderRadius } from '../../constants/theme';

export function AuthScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { login, register, isLoading } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (isLogin) {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <View style={[styles.logoSmall, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoEmoji}>🧠</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            {t.appName}
          </Text>
          <Text style={[styles.welcome, { color: colors.textSecondary }]}>
            {t.welcome}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={[styles.form, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.formTitle, { color: colors.text }]}>
            {isLogin ? t.login : t.register}
          </Text>

          {!isLogin && (
            <Input
              label={t.language === 'fa' ? 'نام' : 'Name'}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              leftIcon={<User size={20} color={colors.textTertiary} />}
            />
          )}

          <Input
            label={t.email}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={colors.textTertiary} />}
          />

          <Input
            label={t.password}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={colors.textTertiary} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors.textTertiary} />
                ) : (
                  <Eye size={20} color={colors.textTertiary} />
                )}
              </TouchableOpacity>
            }
          />

          {isLogin && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>
                {t.forgotPassword}
              </Text>
            </TouchableOpacity>
          )}

          <Button
            title={isLogin ? t.login : t.register}
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.submitButton}
            icon={<ArrowIcon size={20} color="#FFFFFF" />}
          />

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchAuth}
          >
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>
              {isLogin ? t.noAccount : t.hasAccount}
            </Text>
            <Text style={[styles.switchLink, { color: colors.primary }]}>
              {isLogin ? t.register : t.login}
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoSmall: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  welcome: {
    fontSize: 16,
  },
  form: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  switchAuth: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  switchText: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
