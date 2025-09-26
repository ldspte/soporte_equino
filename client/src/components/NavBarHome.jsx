import React, { useState } from 'react';
import Logo from '../assets/img/logo.png';
import { Link, useNavigate } from 'react-router-dom'; // Importa Link y useNavigate de react-router-dom
import { Navbar, Nav, Button, Modal } from 'react-bootstrap'; // Importa componentes de Bootstrap

export default function NavBarHome() {
  const navigate = useNavigate(); // Cambia useHistory por useNavigate
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  const handleLogout = () => {
    // Aquí puedes agregar la lógica para cerrar sesión, como eliminar el token del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('veterinario');
    // Redirigir a la página de inicio o de login
    navigate('/'); // Cambia history.push por navigate
  };

  const handleShowModal = () => setShowModal(true); // Muestra el modal
  const handleCloseModal = () => setShowModal(false); // Cierra el modal

  return (
    <>
      <Navbar bg="light" expand="lg" className="mb-4">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src={Logo} alt="Logo" height="40" />
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/home">Inicio</Nav.Link>
              <Nav.Link as={Link} to="/historias-clinicas">Mis Historias Clínicas</Nav.Link>
              <Nav.Link as={Link} to="/veterinarios">Veterinarios</Nav.Link>
              <Nav.Link as={Link} to="/insumos">Insumos</Nav.Link>
              <Nav.Link as={Link} to="/propietarios">Propietarios</Nav.Link>
              <Nav.Link as={Link} to="/pacientes">Pacientes</Nav.Link>
              <Nav.Link as={Link} to="/otras-historias">Otras Historias Clinicas</Nav.Link>
            </Nav>
            <Button variant="outline-danger" onClick={handleShowModal}>Cerrar Sesión</Button>
          </Navbar.Collapse>
        </div>
      </Navbar>

      {/* Modal de Confirmación */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cierre de Sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que deseas cerrar sesión?</Modal.Body>
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
