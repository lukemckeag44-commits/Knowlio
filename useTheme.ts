import { useAppStore } from './store';
import { lightTheme, darkTheme, ThemeColors } from './theme';

export const useTheme = (): ThemeColors => {
    const darkMode = useAppStore((state) => state.darkMode);
    return darkMode ? darkTheme : lightTheme;
};
