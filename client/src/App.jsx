import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx'; // Importa el nuevo layout
import PatientManagement from './components/Patients.jsx';
import Owners from './components/Owners.jsx';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Importa el CSS de AOS
import Home from './Views/Home.jsx';
import Insumos from './components/InsumosComp.jsx';
import Landing from './Views/Landing.jsx';
import ClinicalHistory from './components/ClinicalHistory.jsx';
import Veterinarios from './components/Veterinary.jsx';
import OtherHistorys from './components/OtherHistory.jsx';

const App = () => {
  useEffect(() => {
  AOS.init({
    duration: 1000, // Duración de la animación en milisegundos
    once: true, // Si la animación debe ocurrir solo una vez
  });
}, []);
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Rutas que requieren el navbar */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/historias-clinicas" element={<ClinicalHistory />} />
            <Route path="/propietarios" element={<Owners />} />
            <Route path="/pacientes" element={<PatientManagement/>} />
            <Route path="/insumos" element={<Insumos/>} />
            <Route path="/veterinarios" element={<Veterinarios />} />
            <Route path="/otras-historias" element={<OtherHistorys />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
