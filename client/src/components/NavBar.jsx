import { useState } from 'react';
import Logo from '../assets/img/logo.png';
import '../Styles/navBar.css';
import Insumos from './Insumos';
import Content from './Content';
import LoginModal from './LoginModal';

export default function NavBar({}) {
    const [insumos, setInsumos] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleClick = async (e) => {
        e.preventDefault();
        const response = await fetch('http://localhost:3001/api/insumos/');
        const data = await response.json();
        setInsumos(data[0]);
    }

    const  [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogout = () => {
        setIsLoggedIn(false)
    }

    const resetInsumos = () => {
        setInsumos(null);
    }
    
    return (
        <div>
            <nav className='navmenu'>
                <a href="index.html">
                    <img src={Logo} alt="" />
                </a>
                <ul>
                    <li><a href="" onClick={resetInsumos}>Inicio</a></li>
                    <li><a href="#about" onClick={resetInsumos}>Acerca de Nosotros</a></li>
                    <li><a href="" onClick={resetInsumos}>Servicios</a></li>
                    <li><a href="#" onClick = {handleClick} >Insumos</a></li>
                    <li><a href="" onClick={resetInsumos}>Doctores</a></li>
                    <li><a href="" onClick={resetInsumos}>Contactanos</a></li>
                </ul>
            </nav>
            {isLoggedIn ? (
                <div>
                    <span>Bienvenido, Usuario</span>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            ) : (
                <button onClick={() => setIsModalOpen(true)}>Inicia Sesión</button>
            )}
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {insumos ? (<Insumos insumos={insumos} setInsumos={setInsumos} />) : (<Content />)}
        </div>
    );
}

