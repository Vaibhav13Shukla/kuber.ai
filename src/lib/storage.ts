/**
 * Local Storage Utility for Onboarding State
 * Tracks: Language, Permissions, First Launch
 */

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  selectedLanguage: string | null;
  permissionsGranted: {
    microphone: boolean;
    camera: boolean;
  };
  firstLaunchDate: string | null;
}

const STORAGE_KEY = 'kuber_onboarding';

export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return getDefaultState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();
    
    return JSON.parse(stored);
  } catch (error) {
    console.error('[Storage] Failed to read onboarding state:', error);
    return getDefaultState();
  }
}

export function setOnboardingState(state: Partial<OnboardingState>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getOnboardingState();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[Storage] Failed to save onboarding state:', error);
  }
}

export function markOnboardingComplete(): void {
  setOnboardingState({
    hasCompletedOnboarding: true,
    firstLaunchDate: new Date().toISOString(),
  });
}

export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function getDefaultState(): OnboardingState {
  return {
    hasCompletedOnboarding: false,
    selectedLanguage: null,
    permissionsGranted: {
      microphone: false,
      camera: false,
    },
    firstLaunchDate: null,
  };
}
