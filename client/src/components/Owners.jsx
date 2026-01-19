import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus, FaPhone, FaIdCard, FaStar } from 'react-icons/fa';

const API_URL = 'https://soporte-equino.onrender.com/api';

// --- Componente de Calificación de Estrellas (Anidado) ---
const StarRating = ({ ownerId, initialRating = 0, onRatingUpdated }) => {
    const [rating, setRating] = useState(Number(initialRating));
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Actualizar la calificación local cuando initialRating cambie (ej: al recargar la tabla)
    useEffect(() => {
        setRating(Number(initialRating));
    }, [initialRating]);

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : null;
    }, []);

    const sendRating = async (newRating) => {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
            setError("No autorizado. Inicie sesión de nuevo.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/propietarios/${ownerId}/rate`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating: newRating })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al enviar la calificación.');
            }

            const data = await response.json();

            // Llama a la función del componente padre para actualizar la lista completa
            if (onRatingUpdated) {
                onRatingUpdated(data.newAverageRating);
            }

            setRating(Number(data.newAverageRating)); // Actualizar el promedio localmente

        } catch (err) {
            console.error('Error al calificar:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setError(null), 3000);
        }
    };

    return (
        <div className="d-flex align-items-center">
            {loading && <Spinner animation="border" size="sm" style={{ color: '#0d3b66' }} className="me-2" />}
            {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                    <FaStar
                        key={index}
                        color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                        size={18}
                        onClick={() => sendRating(ratingValue)}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        style={{ cursor: loading ? 'not-allowed' : 'pointer', transition: 'color 200ms' }}
                        title={`Calificar con ${ratingValue} estrellas`}
                    />
                );
            })}
            {Number(rating) > 0 && <small className="ms-2 text-muted">({Number(rating).toFixed(1)})</small>}
            {error && <Alert variant="danger" className="ms-2 p-1 px-2 small">{error.substring(0, 50)}</Alert>}
        </div>
    );
};
// --- Fin Componente de Calificación ---


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
        return token ? `Bearer ${token}` : null;
    }, []);

    // Función para obtener propietarios
    const fetchOwners = useCallback(async (token) => {
        setLoading(true);
        setError(null);

        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/propietarios`, {
                method: 'GET',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                    return;
                }
                throw new Error(`Error ${response.status} al obtener propietarios`);
            }

            const data = await response.json();
            // Asegúrate de que el backend trae CalificacionPromedio
            setOwners(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hook para cargar datos iniciales
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            fetchOwners(token);
        } else {
            setError('No autorizado. Por favor, inicia sesión.');
        }
    }, [getAuthToken, fetchOwners]);

    // --- Handlers de Formulario y CRUD (sin cambios significativos) ---

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
        if (!token) { setError('No autorizado.'); return; }

        try {
            const response = await fetch(`${API_URL}/propietarios`, {
                method: 'POST',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
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
        setEditOwner({ ...owner });
        setShowEditOwnerModal(true);
    };

    const handleSubmitEditOwner = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) { setError('No autorizado.'); return; }

        try {
            const response = await fetch(`${API_URL}/propietarios/${currentOwner.idPropietario}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
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
        if (!token) { setError('No autorizado.'); return; }

        try {
            const response = await fetch(`${API_URL}/propietarios/${idPropietario}`, {
                method: 'DELETE',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
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

    // --- NUEVO HANDLER PARA ACTUALIZAR LA CALIFICACIÓN ---
    const handleRatingUpdated = (updatedRating) => {
        // Esta función se llama desde StarRating y fuerza una recarga de la tabla.
        const token = getAuthToken();
        if (token) fetchOwners(token);
    };

    // --- Lógica de Filtro ---

    const filteredOwners = owners.filter(owner => {
        const termLower = searchTerm.toLowerCase();
        return (
            owner.Cedula?.toString().includes(searchTerm) ||
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
                <Button variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => setShowNewOwnerModal(true)}>
                    <FaPlus className="me-2" /> Nuevo Propietario
                </Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text className='text-white' style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>
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
                            <div className="spinner-border" style={{ color: '#0d3b66' }} role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th><FaIdCard className='me-1' /> Cédula</th>
                                        <th><FaUserCircle className='me-1' /> Nombre</th>
                                        <th>Apellido</th>
                                        <th><FaPhone className='me-1' /> Teléfono</th>
                                        <th>Calificación</th> {/* Nueva Columna */}
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

                                            {/* Columna de Calificación */}
                                            <td>
                                                <StarRating
                                                    ownerId={owner.idPropietario}
                                                    initialRating={owner.CalificacionPromedio || 0}
                                                    onRatingUpdated={handleRatingUpdated} // Pasamos el handler
                                                />
                                            </td>

                                            <td>
                                                <Button variant="outline-primary" size="sm" className='me-2' style={{ color: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => handleEditOwner(owner)}>
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

            {/* Modal para crear nuevo propietario (Sin cambios) */}
            <Modal show={showNewOwnerModal} onHide={() => setShowNewOwnerModal(false)} centered>
                {/* ... Contenido del Modal de Creación ... */}
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
                        <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>Crear Propietario</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para editar propietario (Sin cambios) */}
            <Modal show={showEditOwnerModal} onHide={() => setShowEditOwnerModal(false)} centered>
                {/* ... Contenido del Modal de Edición ... */}
                <Modal.Header closeButton>
                    <Modal.Title>Editar Propietario</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitEditOwner}>
                        <Form.Group controlId="formEditCedula" className='mb-2'>
                            <Form.Label>Cédula</Form.Label>
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
                        <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>Actualizar Propietario</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Owners;
