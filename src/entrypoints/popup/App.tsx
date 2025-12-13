import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';

const { ROUTES } = useAppConfig();

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route
              path={ROUTES.LOGIN}
              element={
                <Content>
                  <Login />
                </Content>
              }
            />

            <Route
              path={ROUTES.HOME}
              element={
                <Content>
                  <Home />
                </Content>
              }
            />
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </Router>
        <LicenseModal />
      </ThemeProvider>
    </AuthProvider>
  );
}
