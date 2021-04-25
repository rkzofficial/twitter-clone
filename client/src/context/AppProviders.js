import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import GlobalStyle from 'shared/global-style';
import ThemeProvider from 'shared/theme-provider';
import ErrorBoundary from 'components/ErrorBoundary';
import AuthProvider from './AuthContext';
import UserProvider from './UserContext';
import { AlertProvider } from './AlertContext';

const queryClient = new QueryClient();

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <GlobalStyle />
              <AlertProvider>{children}</AlertProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default AppProviders;
