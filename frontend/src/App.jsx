import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import ProjectDetail from './views/ProjectDetail';
import Login from './views/Login';
import Register from './views/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './views/Profile';
import QuoteRequest from './views/QuoteRequest';
import InquiriesList from './views/InquiriesList';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './views/AdminDashboard';
import ProjectForm from './views/ProjectForm';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Rutas Públicas */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Navigate to="/registro" replace />} />
            <Route path="registro" element={<Register />} />

            {/* Rutas Autenticadas Protegidas (Perfil, Solicitudes/Checkout) */}
            <Route element={<ProtectedRoute />}>
              <Route path="perfil" element={<Profile />} />
              <Route path="solicitudes" element={<InquiriesList />} />
              <Route path="solicitud" element={<QuoteRequest />} />
            </Route>

            {/* Rutas de Administración Protegidas por Rol (ADMIN / OWNER) */}
            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/proyectos" element={<AdminDashboard />} />
              <Route path="admin/proyectos/nuevo" element={<ProjectForm />} />
              <Route path="admin/proyectos/:id/editar" element={<ProjectForm />} />
            </Route>
          </Route>

          {/* Vista inmersiva: pantalla completa, sin Navbar/Footer ni scroll de página */}
          <Route path="proyecto/:id" element={<ProjectDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
