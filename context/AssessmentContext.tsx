import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type CognitiveDomain = 'speed' | 'logic' | 'memory' | 'attention';

export interface DomainResult {
  domain: CognitiveDomain;
  score: number; // 0-100
  detail: string; // short human readable metric, e.g. "میانگین ۳۴۰ میلی‌ثانیه"
}

interface AssessmentContextType {
  isCompleted: boolean;
  isLoading: boolean;
  results: DomainResult[];
  completeAssessment: (results: DomainResult[]) => Promise<void>;
  resetAssessment: () => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const KEY_PREFIX = '@neurolia_assessment_';

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<DomainResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAssessment(userId);
    } else {
      setResults([]);
      setIsCompleted(false);
      setIsLoading(false);
    }
  }, [userId]);

  const loadAssessment = async (uid: string) => {
    setIsLoading(true);
    try {
      const raw = await AsyncStorage.getItem(KEY_PREFIX + uid);
      if (raw) {
        setResults(JSON.parse(raw));
        setIsCompleted(true);
      } else {
        setResults([]);
        setIsCompleted(false);
      }
    } catch (error) {
      console.error('Error loading assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeAssessment = async (newResults: DomainResult[]) => {
    if (!userId) return;
    try {
      await AsyncStorage.setItem(KEY_PREFIX + userId, JSON.stringify(newResults));
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
    setResults(newResults);
    setIsCompleted(true);
  };

  const resetAssessment = async () => {
    if (!userId) return;
    try {
      await AsyncStorage.removeItem(KEY_PREFIX + userId);
    } catch (error) {
      console.error('Error resetting assessment:', error);
    }
    setResults([]);
    setIsCompleted(false);
  };

  const value: AssessmentContextType = {
    isCompleted,
    isLoading,
    results,
    completeAssessment,
    resetAssessment,
  };

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
