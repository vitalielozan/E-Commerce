import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from '../context/AuthProvider.jsx';
import ThemeProvider from '../context/ThemeProvider.jsx';
import CartFavProvider from '../context/CartFavProvider.jsx';
import { useDarkMode } from '../hooks/useDarkMode.js';

/**
 * Ordinea contează: CartFavProvider își reîncarcă datele când se schimbă
 * utilizatorul, deci trebuie să se afle sub AuthProvider.
 */
function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartFavProvider>
            {children}
            <Toasts />
          </CartFavProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

/** Notificările urmează tema, altfel rămân albe pe fundal întunecat. */
function Toasts() {
  const { darkMode } = useDarkMode();

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={2600}
      theme={darkMode ? 'dark' : 'light'}
      newestOnTop
      closeOnClick
    />
  );
}

export default AppProviders;
