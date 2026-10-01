// // src/context/ThemeProvider.jsx
// import { useEffect, useState } from 'react';
// import { ThemeContext } from './ThemeContext';

// const ThemeProvider = ({ children }) => {
//     const [theme, setTheme] = useState(localStorage.getItem('life-theme') || 'light');

//     useEffect(() => {
//         document.documentElement.setAttribute('data-theme', theme);
//         localStorage.setItem('life-theme', theme);
//     }, [theme]);

//     return (
//         <ThemeContext.Provider value={{ theme, setTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     );
// };

// export default ThemeProvider;
// src/context/ThemeProvider.jsx
import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("life-theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("life-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
