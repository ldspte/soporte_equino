import { useState } from 'react';
import { Navbar, Nav, Button, Modal } from 'react-bootstrap'; // Se eliminó Badge y otras imports no usadas
import Logo from '../assets/img/logo.png';
import Insumos from './Insumos';
import Content from './Content';
import LoginModal from './LoginModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/navBar.css';

export default function NavBar() {
    const [showInsumos, setShowInsumos] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

    const handleInsumosClick = (e) => {
        e.preventDefault();
        setShowInsumos(true);
    }

    const handleInicioClick = (e) => {
        if (e) e.preventDefault();
        setShowInsumos(false);
    }

    const handleOpenForgotModal = () => {
        setIsLoginModalOpen(false); // Cierra el modal de login
        setIsForgotModalOpen(true); // Abre el modal de recuperación
    };

    return (
        // 1. Eliminamos 'container sticky-top' del div para evitar conflictos
        // y para asegurarnos de que la barra de navegación ocupe todo el ancho.
        <div>
            {/* 2. Aplicamos fixed="top" al Navbar para fijarlo */}
            <Navbar bg="light" expand="lg" className="shadow-sm" fixed="top">
                <div className="container">
                    <Navbar.Brand href="#" onClick={handleInicioClick}>
                        <img src={Logo} alt="Logo" className='logo' height="40" />
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto me-auto"> {/* Usamos me-auto para alinear a la izquierda */}
                            <Nav.Link href="#" onClick={handleInicioClick}>Inicio</Nav.Link>
                            <Nav.Link href="#about" onClick={handleInicioClick}>Acerca de Nosotros</Nav.Link>
                            <Nav.Link href="#services" onClick={handleInicioClick}>Servicios</Nav.Link>
                            <Nav.Link href="#" onClick={handleInsumosClick}>Insumos</Nav.Link>
                            <Nav.Link href="#doctors" onClick={handleInicioClick}>Doctores</Nav.Link>
                            <Nav.Link href="#contact" onClick={handleInicioClick}>Contactanos</Nav.Link>
                        </Nav>
                        <Button variant="primary" className='button1' onClick={() => setIsLoginModalOpen(true)}>Inicia Sesión</Button>
                    </Navbar.Collapse>
                </div>
            </Navbar>

            {/* AÑADIR MARGEN: Espacio para compensar la barra fija. 
            Estableceremos un padding superior en el div contenedor del contenido principal. 
            Usaremos un estilo inline temporal o una clase CSS como 'mt-5' si tienes Bootstrap 5.
            Aquí lo simulamos con un padding. */}
            <div style={{ paddingTop: '70px' }}>
                {showInsumos ? (<Insumos />) : (<Content />)}
            </div>


            {/* Renderiza los modales fuera del flujo principal de la página */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onOpenForgot={handleOpenForgotModal}
            />

            <ForgotPasswordModal
                isOpen={isForgotModalOpen}
                onClose={() => setIsForgotModalOpen(false)}
            />
        </div>
    );
}
