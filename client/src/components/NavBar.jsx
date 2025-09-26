import { useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import Logo from '../assets/img/logo.png';
import Insumos from './Insumos';
import Content from './Content';
import LoginModal from './LoginModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/navbar.css';

export default function NavBar() {
    const [insumos, setInsumos] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const handleClick = async (e) => {
        e.preventDefault();
        const response = await fetch('https://soporte-equino.onrender.com/api/insumos/');
        const data = await response.json();
        setInsumos(data);
    }

    const resetInsumos = () => {
        setInsumos(null);
    }
    
    return (
        <div className='container'>
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
                    <Button variant="primary" onClick={() => setIsModalOpen(true)}>Inicia Sesión</Button>
                </Navbar.Collapse>
            </Navbar>
            <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {insumos ? (<Insumos insumos={insumos} setInsumos={setInsumos} />) : (<Content />)}
        </div>
    );
}
