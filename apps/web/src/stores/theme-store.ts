import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference;
  isDarkMode: boolean;
  setPreference: (preference: ThemePreference) => void;
  cyclePreference: () => void;
  applyThemeToDocument: (doc?: Document) => void;
  initializeTheme: () => void;
}

const THEME_STORAGE_KEY = 'theme';

const getSystemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

const computeIsDark = (preference: ThemePreference) =>
  preference === 'dark' || (preference === 'system' && getSystemPrefersDark());

const applyClassToDocument = (isDark: boolean, doc: Document = document) => {
  const root = doc.documentElement;
  root.classList.toggle('dark', isDark);
  // Improve native form controls and scrollbars
  (root as HTMLElement).style.colorScheme = isDark ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      isDarkMode: false,

      setPreference: (preference: ThemePreference) => {
        set({ preference });
        const isDark = computeIsDark(preference);
        set({ isDarkMode: isDark });
        try {
          applyClassToDocument(isDark);
        } catch (error) {
          // no-op in non-browser environments
        }
      },

      cyclePreference: () => {
        const order: ThemePreference[] = ['light', 'dark', 'system'];
        const current = get().preference;
        const next = order[(order.indexOf(current) + 1) % order.length];
        get().setPreference(next);
      },

      applyThemeToDocument: (doc?: Document) => {
        const isDark = computeIsDark(get().preference);
        set({ isDarkMode: isDark });
        try {
          applyClassToDocument(isDark, doc ?? document);
        } catch (error) {
          // ignore if document is not available
        }
      },

      initializeTheme: () => {
        // Apply immediately based on persisted/system preference
        get().applyThemeToDocument();

        // React to system changes when preference is system
        if (typeof window !== 'undefined') {
          const media = window.matchMedia('(prefers-color-scheme: dark)');
          const handler = () => {
            if (get().preference === 'system') {
              const isDark = media.matches;
              set({ isDarkMode: isDark });
              try {
                applyClassToDocument(isDark);
              } catch (error) {
                // ignore
              }
            }
          };

          try {
            media.addEventListener('change', handler);
          } catch {
            // Fallback for Safari
            // @ts-expect-error legacy API
            media.addListener(handler);
          }
        }
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: state => ({ preference: state.preference }),
    },
  ),
);

