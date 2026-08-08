import { DomainResult } from '../../context/AssessmentContext';

export interface StageProps {
  onComplete: (result: DomainResult) => void;
}

export function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scoreLevel(score: number, language: 'fa' | 'en'): string {
  if (language === 'fa') {
    if (score >= 85) return 'عالی';
    if (score >= 65) return 'خوب';
    if (score >= 40) return 'متوسط';
    return 'نیازمند تمرین';
  }
  if (score >= 85) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 40) return 'Average';
  return 'Needs practice';
}
