import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useAuth,
} from './AuthContext';

export type CognitiveDomain =
  | 'speed'
  | 'logic'
  | 'memory'
  | 'attention';

export interface DomainResult {
  domain: CognitiveDomain;

  score: number;

  detail: string;
}

interface AssessmentContextType {
  isCompleted: boolean;

  isLoading: boolean;

  results: DomainResult[];

  completeAssessment: (
    results: DomainResult[]
  ) => Promise<void>;

  resetAssessment: () => Promise<void>;
}

const AssessmentContext =
  createContext<
    AssessmentContextType | undefined
  >(undefined);

const KEY_PREFIX =
  '@neurolia_assessment_';

export function AssessmentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } =
    useAuth();

  const userId =
    user?.id ?? null;

  const [
    isCompleted,
    setIsCompleted,
  ] = useState(false);

  const [
    results,
    setResults,
  ] = useState<
    DomainResult[]
  >([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const loadAssessment =
    useCallback(
      async (uid: string) => {
        setIsLoading(
          true
        );

        try {
          const raw =
            await AsyncStorage.getItem(
              KEY_PREFIX + uid
            );

          if (!raw) {
            setResults([]);
            setIsCompleted(
              false
            );

            return;
          }

          try {
            const parsedResults =
              JSON.parse(
                raw
              );

            if (
              Array.isArray(
                parsedResults
              )
            ) {
              setResults(
                parsedResults
              );

              setIsCompleted(
                true
              );
            } else {
              setResults([]);
              setIsCompleted(
                false
              );
            }
          } catch (
            parseError
          ) {
            console.error(
              '[ASSESSMENT] Invalid saved results:',
              parseError
            );

            setResults([]);
            setIsCompleted(
              false
            );
          }
        } catch (error) {
          console.error(
            '[ASSESSMENT] Error loading assessment:',
            error
          );

          setResults([]);
          setIsCompleted(
            false
          );
        } finally {
          setIsLoading(
            false
          );
        }
      },
      []
    );

  useEffect(() => {
    if (userId) {
      loadAssessment(
        userId
      );

      return;
    }

    setResults([]);
    setIsCompleted(
      false
    );
    setIsLoading(
      false
    );
  }, [
    userId,
    loadAssessment,
  ]);

  const completeAssessment =
    useCallback(
      async (
        newResults: DomainResult[]
      ) => {
        if (!userId) {
          return;
        }

        /*
         * Update local UI immediately.
         */
        setResults(
          newResults
        );

        setIsCompleted(
          true
        );

        try {
          await AsyncStorage.setItem(
            KEY_PREFIX +
              userId,
            JSON.stringify(
              newResults
            )
          );
        } catch (error) {
          console.error(
            '[ASSESSMENT] Error saving assessment:',
            error
          );
        }
      },
      [userId]
    );

  const resetAssessment =
    useCallback(
      async () => {
        if (!userId) {
          return;
        }

        setResults([]);
        setIsCompleted(
          false
        );

        try {
          await AsyncStorage.removeItem(
            KEY_PREFIX +
              userId
          );
        } catch (error) {
          console.error(
            '[ASSESSMENT] Error resetting assessment:',
            error
          );
        }
      },
      [userId]
    );

  const value =
    useMemo<AssessmentContextType>(
      () => ({
        isCompleted,

        isLoading,

        results,

        completeAssessment,

        resetAssessment,
      }),
      [
        isCompleted,
        isLoading,
        results,
        completeAssessment,
        resetAssessment,
      ]
    );

  return (
    <AssessmentContext.Provider
      value={value}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context =
    useContext(
      AssessmentContext
    );

  if (
    context ===
    undefined
  ) {
    throw new Error(
      'useAssessment must be used within an AssessmentProvider'
    );
  }

  return context;
}