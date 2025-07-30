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
        setInsumos(data);
    }

    const resetInsumos = () => {
        setInsumos(null);
    }
    
    return (
        <div className='container'>
            <nav className='navbar navbar-expand-lg navbar-light bg-light'>
                <a className='navbar-brand' href="index.html">
                    <img src={Logo} alt="Logo" className='logo' />
                </a>
                <div className='collapse navbar-collapse justify-content-end' id='navbarNav'>
                    <ul className='navbar-nav'>
                        <li className='nav-item'>
                            <a className='nav-link' href="" onClick={resetInsumos}>Inicio</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href="#about" onClick={resetInsumos}>Acerca de Nosotros</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href="" onClick={resetInsumos}>Servicios</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href="#" onClick={handleClick}>Insumos</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href="" onClick={resetInsumos}>Doctores</a>
                        </li>
                        <li className='nav-item'>
                            <a className='nav-link' href="" onClick={resetInsumos}>Contactanos</a>
                        </li>
                    </ul>
                    <button className='btn btn-warning ml-3' onClick={() => setIsModalOpen(true)}>Inicia Sesión</button>
                </div>
            </nav>
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {insumos ? (<Insumos insumos={insumos} setInsumos={setInsumos} />) : (<Content />)}
        </div>
    );
}
