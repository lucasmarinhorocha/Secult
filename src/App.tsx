import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeContext';
import { syncService } from './services/offline-sync';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Layout from './components/Common/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Insumos from './components/Insumos/Insumos';
import Ocorrencias from './components/Ocorrencias/Ocorrencias';
import Documentos from './components/Documentos/Documentos';
import Presenca from './components/Presenca/Presenca';
import AdminUsers from './components/Admin/AdminUsers';
import { HomeTiles } from './components/Home/HomeTiles';

// Componente ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


// Componente Principal da Aplicação
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Inicializar sincronização offline
  useEffect(() => {
    syncService.monitorConnection();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeTiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/insumos"
          element={
            <ProtectedRoute>
              <Layout>
                <Insumos />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ocorrencias"
          element={
            <ProtectedRoute>
              <Layout>
                <Ocorrencias />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/documentos"
          element={
            <ProtectedRoute>
              <Layout>
                <Documentos />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/presenca"
          element={
            <ProtectedRoute>
              <Layout>
                <Presenca />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect padrão */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeModeProvider>
  );
};

export default App;