import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus, FaPhone, FaIdCard } from 'react-icons/fa';

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

    // --- Funciones de Utilidad y Hooks ---

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        // El token viene con el prefijo 'Bearer ' para el header
        return token ? `Bearer ${token}` : null; 
    }, []);
    
    // Hook para cargar datos iniciales y asegurar que se ejecute solo si hay token
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            // Pasamos el token directamente a la función fetchOwners
            fetchOwners(token); 
        } else {
            setError('No autorizado. Por favor, inicia sesión.');
        }
    }, [getAuthToken]);

    // --- Lógica de Fetch de Datos ---

    const fetchOwners = async (token) => {
        setLoading(true);
        setError(null);
        
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/propietarios',{
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Usamos el token con 'Bearer ' incluido
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                 if (response.status === 401) {
                     setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                     return; 
                 }
                 throw new Error(`Error ${response.status} al obtener propietarios`);
            }
            
            const data = await response.json();
            setOwners(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers de Formulario ---
    
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
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }
        
        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/propietarios', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(newOwner)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear propietario');
            }
            
            fetchOwners(token);
            setShowNewOwnerModal(false);
            setNewOwner({ Cedula: '', Nombre: '', Apellido: '', Telefono: '' });
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditOwner = (owner) => {
        setCurrentOwner(owner);
        // Usamos spread operator para crear una copia limpia
        setEditOwner({...owner}); 
        setShowEditOwnerModal(true);
    };

    const handleSubmitEditOwner = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }
        
        try {
            const response = await fetch(`https://soporte-equino.onrender.com/api/propietarios/${currentOwner.idPropietario}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(editOwner)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar propietario');
            }
            
            fetchOwners(token);
            setShowEditOwnerModal(false);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteOwner = async (idPropietario) => {
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }
        
        try {
            const response = await fetch(`https://soporte-equino.onrender.com/api/propietarios/${idPropietario}`, {
                method: 'DELETE', 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar propietario');
            }
            
            fetchOwners(token);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    // --- Lógica de Filtro ---
    
    const filteredOwners = owners.filter(owner => {
        const termLower = searchTerm.toLowerCase();
        return (
            owner.Cedula?.toString().includes(searchTerm) || // Búsqueda por Cédula (parcial)
            owner.Nombre?.toLowerCase().includes(termLower) || 
            owner.Apellido?.toLowerCase().includes(termLower) ||
            owner.Telefono?.includes(searchTerm) 
        );
    });

    // --- Renderizado ---

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
                                <InputGroup.Text className='bg-warning text-white'>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Cédula, Nombre, Apellido o Teléfono"
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
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th><FaIdCard className='me-1'/> Cédula</th>
                                        <th><FaUserCircle className='me-1'/> Nombre</th>
                                        <th>Apellido</th>
                                        <th><FaPhone className='me-1'/> Teléfono</th>
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
                                                <Button variant="outline-warning" size="sm" className='me-2' onClick={() => handleEditOwner(owner)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteOwner(owner.idPropietario)}>
                                                    <FaTrashAlt />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para crear nuevo propietario */}
            <Modal show={showNewOwnerModal} onHide={() => setShowNewOwnerModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Propietario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewOwner}>
                        <Form.Group controlId="formCedula" className='mb-2'>
                            <Form.Label>Cédula</Form.Label>
                            <Form.Control type="number" name="Cedula" value={newOwner.Cedula} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formNombre" className='mb-2'>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={newOwner.Nombre} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formApellido" className='mb-2'>
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control type="text" name="Apellido" value={newOwner.Apellido} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formTelefono" className='mb-4'>
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control type="text" name="Telefono" value={newOwner.Telefono} onChange={handleInputChange} required />
                        </Form.Group>
                        <Button type="submit" variant="warning">Crear Propietario</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para editar propietario */}
            <Modal show={showEditOwnerModal} onHide={() => setShowEditOwnerModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Propietario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitEditOwner}>
                        <Form.Group controlId="formEditCedula" className='mb-2'>
                            <Form.Label>Cédula</Form.Label>
                            {/* Usamos el nombre del campo como está en el estado: Cedula */}
                            <Form.Control type="number" name="Cedula" value={editOwner.Cedula} onChange={handleEditInputChange} required /> 
                        </Form.Group>
                        <Form.Group controlId="formEditNombre" className='mb-2'>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={editOwner.Nombre} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEditApellido" className='mb-2'>
                            <Form.Label>Apellido</Form.Label>
                            <Form.Control type="text" name="Apellido" value={editOwner.Apellido} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEditTelefono" className='mb-4'>
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control type="text" name="Telefono" value={editOwner.Telefono} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Button type="submit" variant="warning">Actualizar Propietario</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Owners;
