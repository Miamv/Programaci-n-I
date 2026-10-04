import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import ProjectDetail from './views/ProjectDetail';
import Login from './views/Login';
import Register from './views/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<ProtectedRoute />}>
              <Route index element={<Home />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="registro" element={<Register />} />
          </Route>
          {/* Vista inmersiva: pantalla completa, sin Navbar/Footer ni scroll de página */}
          <Route path="proyecto/:id" element={<ProjectDetail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
