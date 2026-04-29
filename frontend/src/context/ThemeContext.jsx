/* ThemeContext.jsx — Dark mode removed. Stub kept to avoid import errors. */
import { createContext, useContext } from 'react'
const ThemeContext = createContext({ theme: 'light', toggle: () => {}, isDark: false })
export function ThemeProvider({ children }) { return children }
export const useTheme = () => useContext(ThemeContext)
