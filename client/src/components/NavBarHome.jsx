import React, { useState, useEffect } from 'react';
import Logo from '../assets/img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Modal, Badge } from 'react-bootstrap';
import { FaSignOutAlt, FaBookMedical, FaUserMd, FaWarehouse, FaUserTie, FaHorse } from 'react-icons/fa';

// Definición de Roles
// Los roles deben coincidir con lo que devuelve tu backend (e.g., 'Administrador', 'Veterinario')
const ROLES = {
    ADMIN: 'Administrador',
    GENERAL: 'Veterinario'
};

// Mapa de permisos de navegación
const NAV_PERMISSIONS = [
    { name: 'Inicio', path: '/home', icon: FaHorse, roles: [ROLES.ADMIN, ROLES.GENERAL] },
    { name: 'Mis Historias Clínicas', path: '/historias-clinicas', icon: FaBookMedical, roles: [ROLES.GENERAL, ROLES.ADMIN] },
    { name: 'Otras Historias Clínicas', path: '/otras-historias', icon: FaBookMedical, roles: [ROLES.ADMIN, ROLES.GENERAL] }, // Solo para Administrador
    { name: 'Propietarios', path: '/propietarios', icon: FaUserTie, roles: [ROLES.ADMIN, ROLES.GENERAL] },
    { name: 'Pacientes', path: '/pacientes', icon: FaHorse, roles: [ROLES.ADMIN, ROLES.GENERAL] },
    { name: 'Insumos', path: '/insumos', icon: FaWarehouse, roles: [ROLES.ADMIN] }, // Solo para Administrador
    { name: 'Veterinarios', path: '/veterinarios', icon: FaUserMd, roles: [ROLES.ADMIN] }, // Solo para Administrador
];


export default function NavBarHome() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');

    // 1. Hook para cargar el rol del usuario al montar el componente
    useEffect(() => {
        const userStorage = localStorage.getItem('veterinario');
        if (userStorage) {
            try {
                const userData = JSON.parse(userStorage);
                // Asumiendo que la estructura guardada es { token: '...', user: { Rol: '...' } }
                setUserRole(userData.user?.Rol); 
                setUserName(userData.user?.Nombre);
            } catch (e) {
                console.error("Error al parsear datos del veterinario:", e);
                // Si hay un error, forzar el cierre de sesión
                handleLogout(); 
            }
        }
    }, []);

    const handleLogout = () => {
        // Elimina el token del localStorage y redirige. 
        // Esto debe ser llamado por el AuthProvider en una app real, pero lo hacemos aquí por simplicidad.
        localStorage.removeItem('token');
        localStorage.removeItem('veterinario');
        navigate('/', { replace: true });
    };

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
                <div className="container">
                    <Link to="/home" className="navbar-brand">
                        <img src={Logo} alt="Logo" height="40" />
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            {/* 2. Renderizado Condicional de Enlaces */}
                            {NAV_PERMISSIONS.map((item) => (
                                item.roles.includes(userRole) && (
                                    <Nav.Link key={item.path} as={Link} to={item.path}>
                                        <item.icon className="me-1 text-warning"/> {item.name}
                                    </Nav.Link>
                                )
                            ))}
                        </Nav>
                        
                        <Nav>
                            {userName && (
                                <Nav.Item className="d-flex align-items-center me-3">
                                    <Badge bg="warning" className="text-dark">
                                        <FaUserCircle className="me-1"/> {userName}
                                    </Badge>
                                </Nav.Item>
                            )}
                            <Button variant="danger" onClick={handleShowModal}>
                                <FaSignOutAlt className="me-2"/> Cerrar Sesión
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </div>
            </Navbar>

            {/* Modal de Confirmación */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className="border-bottom border-danger">
                    <Modal.Title><FaSignOutAlt className="me-2 text-danger"/> Confirmar Cierre de Sesión</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center py-2">
                        <p className="mb-0">¿Estás seguro de que deseas cerrar la sesión actual?</p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={() => { handleLogout(); handleCloseModal(); }}>
                        Cerrar Sesión
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
