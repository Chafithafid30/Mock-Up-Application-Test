import type { ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ItemsPage from './pages/ItemsPage';
import POSPage from './pages/POSPage';
import ReportsPage from './pages/ReportsPage';
import StockPage from './pages/StockPage';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { isAuth } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={isAuth ? <Navigate to="/items" replace /> : <LoginPage />}
        />
        <Route path="/items" element={<PrivateRoute><ItemsPage /></PrivateRoute>} />
        <Route path="/pos" element={<PrivateRoute><POSPage /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="/stock" element={<PrivateRoute><StockPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to={isAuth ? "/items" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}