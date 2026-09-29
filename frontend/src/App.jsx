import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './views/Home';
import ProjectDetail from './views/ProjectDetail';
import Login from './views/Login';
import Register from './views/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
        </Route>
        {/* Vista inmersiva: pantalla completa, sin Navbar/Footer ni scroll de página */}
        <Route path="proyecto/:id" element={<ProjectDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
