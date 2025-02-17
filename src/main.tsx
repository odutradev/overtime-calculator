import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';

import GlobalStyles from '@styles/globalStyles';
import Router from '@routes/index';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles />
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
