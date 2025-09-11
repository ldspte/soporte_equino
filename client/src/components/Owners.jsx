import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
// import '../Styles/owner.css';

function Owners() {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewOwnerModal, setShowNewOwnerModal] = useState(false);
    const [showEditOwnerModal, setShowEditOwnerModal] = useState(false);
    const [currentOwner, setCurrentOwner] = useState(null);
    const [newOwner, setNewOwner] = useState({ Cedula: '', Nombre: '', Apellido: '', Telefono: '' });
    const [editOwner, setEditOwner] = useState({ Cedula: '', Nombre: '', Apellido: '', Telefono: '' });

    useEffect(() => {
        fetchOwners();
    }, []);

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/propietarios');
            if (!response.ok) throw new Error('Error al obtener propietarios');
            const data = await response.json();
            setOwners(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewOwner(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditOwner(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewOwner = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/propietarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOwner)
            });
            if (!response.ok) throw new Error('Error al crear propietario');
            fetchOwners();
            setShowNewOwnerModal(false);
            setNewOwner({ Cedula: '', Nombre: '', Apellido: '', Telefono: '' });
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditOwner = (owner) => {
        setCurrentOwner(owner);
        setEditOwner(owner);
        setShowEditOwnerModal(true);
    };

    const handleSubmitEditOwner = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://soporte-equino.onrender.com/api/propietarios/${currentOwner.idPropietario}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editOwner)
            });
            if (!response.ok) throw new Error('Error al actualizar propietario');
            fetchOwners();
            setShowEditOwnerModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteOwner = async (idPropietario) => {
        try {
            const response = await fetch(`https://soporte-equino.onrender.com/api/propietarios/${idPropietario}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar propietario');
            fetchOwners();
        } catch (error) {
            setError(error.message);
        }
    };

    const filteredOwners = owners.filter(owner => 
        owner.Cedula.toString().includes(searchTerm) ||
        owner.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        owner.Apellido.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    return (
        <div>
            <div className='page-header d-flex justify-content-between align-items-center mt-4 mb-4'>
                <h1>Mis Propietarios</h1>
                <Button variant="warning" onClick={() => setShowNewOwnerModal(true)}>
                    <FaPlus className="me-2" /> Nuevo Propietario
                </Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Cedula, Nombre o Apellido"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            <Card>
                <Card.Body>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>Teléfono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOwners.map(owner => (
                                    <tr key={owner.idPropietario}>
                                        <td>{owner.Cedula}</td>
                                        <td>{owner.Nombre}</td>
                                        <td>{owner.Apellido}</td>
                                        <td>{owner.Telefono}</td>
                                        <td>
                                            <Button variant="outline-warning" onClick={() => handleEditOwner(owner)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" onClick={() => handleDeleteOwner(owner.idPropietario)}>
                                                <FaTrashAlt />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para crear nuevo propietario */}
            <Modal show={showNewOwnerModal} onHide={() => setShowNewOwnerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Propietario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewOwner}>
                        <Form.Group controlId="formCedula">
                            <Form.Label>Cédula</Form.Label>
                            <Form.Control type="number" name="Cedula" value={newOwner.Cedula} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={newOwner.Nombre} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formApellido">
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control type="text" name="Apellido" value={newOwner.Apellido} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formTelefono">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control type="text" name="Telefono" value={newOwner.Telefono} onChange={handleInputChange} required />
                        </Form.Group>
                        <Button type="submit" variant="warning">Crear Propietario</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para editar propietario */}
            <Modal show={showEditOwnerModal} onHide={() => setShowEditOwnerModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Propietario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitEditOwner}>
                        <Form.Group controlId="formCedula">
                            <Form.Label>Cédula</Form.Label>
                            <Form.Control type="text" name="cedula" value={editOwner.Cedula} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="nombre" value={editOwner.Nombre} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formApellido">
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control type="text" name="apellido" value={editOwner.Apellido} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formTelefono">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control type="text" name="telefono" value={editOwner.Telefono} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Button type="submit" variant="warning">Actualizar Propietario</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Owners;
