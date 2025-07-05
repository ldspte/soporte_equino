import Logo from '../assets/img/logo.png';
import { Link } from 'react-router-dom'; // Importa Link de react-router-dom

export default function NavBarHome() {
  return (
    <div>
      <nav className='navmenu'>
        <Link to="/">
          <img src={Logo} alt="Logo" />
        </Link>
        <ul>
          <li><Link to="/">Inicio</Link></li> {/* Enlace a la página de inicio */}
          <li><Link to="/historias-clinicas">Historias Clínicas</Link></li> {/* Enlace a historias clínicas */}
          <li><Link to="/veterinarios">Veterinarios</Link></li>
          <li><Link to="/insumos">Insumos</Link></li>
          <li><Link to="/propietarios">Propietarios</Link></li>
          <li><Link to="/pacientes">Pacientes</Link></li>
        </ul>
      </nav>
    </div>
  );
}
