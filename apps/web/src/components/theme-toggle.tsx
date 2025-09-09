import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { useThemeStore, type ThemePreference } from '@/stores/theme-store';

const labelMap: Record<ThemePreference, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
} as const;

export const ThemeToggle: React.FC = () => {
  const preference = useThemeStore(s => s.preference);
  const isDarkMode = useThemeStore(s => s.isDarkMode);
  const cyclePreference = useThemeStore(s => s.cyclePreference);

  const renderIcon = () => {
    if (preference === 'system') return <Laptop className="size-4" />;
    return isDarkMode ? <Moon className="size-4" /> : <Sun className="size-4" />;
  };

  return (
    <Tooltip content={`Theme: ${labelMap[preference]}`}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Toggle theme (current: ${labelMap[preference]})`}
        onClick={cyclePreference}
      >
        {renderIcon()}
      </Button>
    </Tooltip>
  );
};

