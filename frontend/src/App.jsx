import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import ProjectDetail from './views/ProjectDetail';
import Login from './views/Login';
import Register from './views/Register';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Portfolio público. Home sin protección. Los guards de rutas privadas se agregarán en TP8 con backend real. */}
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Navigate to="/registro" replace />} />
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
