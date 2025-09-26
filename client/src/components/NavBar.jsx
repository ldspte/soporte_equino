import { useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import Logo from '../assets/img/logo.png';
import Insumos from './Insumos';
import Content from './Content';
import LoginModal from './LoginModal';
import ForgotPasswordModal from './ForgotPasswordModal'; // Importa el modal de recuperación
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/navbar.css';

export default function NavBar() {
    const [insumos, setInsumos] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Renombrado para mayor claridad
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false); // Nuevo estado para el modal de recuperación
    
    const handleClick = async (e) => {
        e.preventDefault();
        const response = await fetch('https://soporte-equino.onrender.com/api/insumos/');
        const data = await response.json();
        setInsumos(data);
    }

    const resetInsumos = () => {
        setInsumos(null);
    }

    // Nueva función para manejar la apertura del modal de recuperación
    const handleOpenForgotModal = () => {
        setIsLoginModalOpen(false); // Cierra el modal de login
        setIsForgotModalOpen(true); // Abre el modal de recuperación
    };
    
    return (
        <div className='container sticky-top'>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="index.html">
                    <img src={Logo} alt="Logo" className='logo' />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link href="" onClick={resetInsumos}>Inicio</Nav.Link>
                        <Nav.Link href="#about" onClick={resetInsumos}>Acerca de Nosotros</Nav.Link>
                        <Nav.Link href="#services" onClick={resetInsumos}>Servicios</Nav.Link>
                        <Nav.Link href="#" onClick={handleClick}>Insumos</Nav.Link>
                        <Nav.Link href="#doctors" onClick={resetInsumos}>Doctores</Nav.Link>
                        <Nav.Link href="#contact" onClick={resetInsumos}>Contactanos</Nav.Link>
                    </Nav>
                    <Button variant="primary" onClick={() => setIsLoginModalOpen(true)}>Inicia Sesión</Button>
                </Navbar.Collapse>
            </Navbar>

            {/* Renderiza ambos modales, controlados por sus propios estados en este componente */}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
                onOpenForgot={handleOpenForgotModal} // Pasa la nueva función al modal de login
            />
            
            <ForgotPasswordModal 
                isOpen={isForgotModalOpen} 
                onClose={() => setIsForgotModalOpen(false)} 
            />

            {insumos ? (<Insumos insumos={insumos} setInsumos={setInsumos} />) : (<Content />)}
        </div>
    );
}