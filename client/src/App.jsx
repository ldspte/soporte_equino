import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Views/Home.jsx';
import Landing from './Views/Landing.jsx';
import ClinicalHistory from './components/ClinicalHistory.jsx';
import AuthenticatedLayout from './components/AuthenticatedLayout'; // Importa el nuevo layout

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
          </Route>
        </Routes>
      </Router>
    </div>
  );
};

export default App;
