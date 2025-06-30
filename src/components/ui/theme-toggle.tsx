import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  return (
    <Button aria-label="Toggle dark mode" variant="ghost" size="icon" onClick={toggle}>
      {theme === 'dark' ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
    </Button>
  );
}; 