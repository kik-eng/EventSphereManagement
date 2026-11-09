import React from 'react';
import AppRoute from './config/AppRoute';
import { ThemeProvider } from './core/context/ThemeContext';
import ChatbotWidget from './core/component/ChatbotWidget';

function App() {
  return (
    <ThemeProvider>
      <AppRoute />
      <ChatbotWidget/>
    </ThemeProvider>
  );
}

export default App;
