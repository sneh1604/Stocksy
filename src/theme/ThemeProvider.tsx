import React, { createContext, useContext } from 'react';
import { darkColors } from './darkTheme';

const ThemeContext = createContext(darkColors);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={darkColors}>
      {children}
    </ThemeContext.Provider>
  );
};
