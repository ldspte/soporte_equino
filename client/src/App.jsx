import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthenticatedLayout from './components/AuthenticatedLayout.jsx'; // Importa el nuevo layout
import PatientManagement from './components/Patients.jsx';
import Owners from './components/Owners.jsx';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './Views/Home.jsx';
import Insumos from './components/InsumosComp.jsx';
import Landing from './Views/Landing.jsx';
import ClinicalHistory from './components/ClinicalHistory.jsx';

const App = () => {
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
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
