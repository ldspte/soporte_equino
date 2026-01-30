import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrashAlt, FaPlus, FaTag, FaMoneyBill, FaImage } from 'react-icons/fa';
import API_URL from '../config';

function Insumos() {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewInsumoModal, setShowNewInsumoModal] = useState(false);
    const [showEditInsumoModal, setShowEditInsumoModal] = useState(false);
    const [currentInsumo, setCurrentInsumo] = useState(null);

    const [newInsumo, setNewInsumo] = useState({ Nombre: '', Descripcion: '', Precio: '', Foto: '' });
    const [editInsumo, setEditInsumo] = useState({ Nombre: '', Descripcion: '', Precio: '', Foto: '' });

    // --- Funciones de Utilidad y Hooks ---

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : null;
    }, []);

    // Hook para cargar datos iniciales y asegurar que se ejecute solo si hay token
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            fetchInsumos(token);
        } else {
            setError('No autorizado. Por favor, inicia sesión.');
        }
    }, [getAuthToken]);

    // --- Lógica de Fetch de Datos ---

    const fetchInsumos = async (token) => {
        setLoading(true);
        setError(null);

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/insumos`, {
                method: 'GET',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {

                throw new Error(`Error ${response.status} al obtener insumos`);
            }

            const data = await response.json();
            console.log('Insumos fetched:', data);
            if (Array.isArray(data)) {
                setInsumos(data);
            } else {
                console.error('Data is not an array:', data);
                setError('Formato de datos incorrecto');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers de Formulario ---

    // Función para convertir archivo a base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleInputChange = async (e) => {
        const { name, value, files } = e.target;

        // Si es un input de tipo file, convertir a base64
        if (name === 'Foto' && files && files[0]) {
            try {
                const base64 = await fileToBase64(files[0]);
                setNewInsumo(prev => ({ ...prev, [name]: base64 }));
            } catch (error) {
                console.error('Error al convertir imagen a base64:', error);
                setError('Error al procesar la imagen');
            }
        } else {
            setNewInsumo(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditInputChange = async (e) => {
        const { name, value, files } = e.target;

        // Si es un input de tipo file, convertir a base64
        if (name === 'Foto' && files && files[0]) {
            try {
                const base64 = await fileToBase64(files[0]);
                setEditInsumo(prev => ({ ...prev, [name]: base64 }));
            } catch (error) {
                console.error('Error al convertir imagen a base64:', error);
                setError('Error al procesar la imagen');
            }
        } else {
            setEditInsumo(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmitNewInsumo = async (e) => {
        e.preventDefault();

        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/insumos`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newInsumo)
            });

            if (!response.ok) {
                let errorDetails = '';
                try {
                    const errorJson = await response.json();
                    console.error('Error del servidor:', errorJson);
                    errorDetails = errorJson.message || errorJson.details || errorJson.error || 'Error desconocido';
                } catch (e) {
                    const errorText = await response.text();
                    console.error('Error (texto):', errorText);
                    errorDetails = errorText;
                }
                throw new Error(`Error ${response.status}: ${errorDetails}`);
            }

            fetchInsumos(token);
            setShowNewInsumoModal(false);
            setNewInsumo({ Nombre: '', Descripcion: '', Precio: '', Foto: '' });
            setError(null);
        } catch (error) {
            console.error('Error completo:', error);
            setError(error.message);
        }
    };

    const handleEditInsumo = (insumo) => {
        setCurrentInsumo(insumo);
        setEditInsumo({ Nombre: insumo.Nombre, Descripcion: insumo.Descripcion, Precio: insumo.Precio, Foto: insumo.Foto });
        setShowEditInsumoModal(true);
    };

    const handleSubmitEditInsumo = async (e) => {
        e.preventDefault();

        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/insumos/${currentInsumo.idInsumos}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editInsumo)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar insumo');
            }

            fetchInsumos(token);
            setShowEditInsumoModal(false);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteInsumo = async (idInsumos) => {
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/insumos/${idInsumos}`, {
                method: 'DELETE',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar insumo');
            }

            fetchInsumos(token);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    // --- Lógica de Filtro ---

    const filteredInsumos = insumos.filter(insumo =>
        insumo.Nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insumo.Descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Renderizado ---

    return (
        <div>
            <div className='page-header d-flex justify-content-between align-items-center mt-4 mb-4'>
                <h1>Mis Insumos</h1>
                <Button variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => setShowNewInsumoModal(true)}>
                    <FaPlus className="me-2" /> Nuevo Insumo
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
                                    placeholder="Buscar por Nombre o Descripción"
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
                                        <th><FaTag className='me-1' /> Nombre</th>
                                        <th>Descripción</th>
                                        <th>Foto</th>
                                        <th><FaMoneyBill className='me-1' /> Precio</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInsumos.map(insumo => (
                                        <tr key={insumo.idInsumos}>
                                            <td>{insumo.Nombre}</td>
                                            <td>{insumo.Descripcion}</td>
                                            <td>
                                                {insumo.Foto ? (
                                                    <img
                                                        src={insumo.Foto}
                                                        alt={insumo.Nombre}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=N/A'; }}
                                                    />
                                                ) : (
                                                    <FaImage size={30} className='text-muted' />
                                                )}
                                            </td>
                                            <td>${insumo.Precio}</td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" className='me-2' style={{ color: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => handleEditInsumo(insumo)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteInsumo(insumo.idInsumos)}>
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

            {/* Modal para crear nuevo insumo */}
            <Modal show={showNewInsumoModal} onHide={() => setShowNewInsumoModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Insumo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewInsumo}>
                        <Form.Group controlId="formNombre" className='mb-2'>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={newInsumo.Nombre} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formDescripcion" className='mb-2'>
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control type="text" name="Descripcion" value={newInsumo.Descripcion} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formFoto" className='mb-2'>
                            <Form.Label>Foto</Form.Label>
                            <Form.Control type="file" name="Foto" accept="image/*" onChange={handleInputChange} />
                            {newInsumo.Foto && (
                                <div className="mt-2">
                                    <img src={newInsumo.Foto} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formPrecio" className='mb-4'>
                            <Form.Label>Precio</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control type="number" name="Precio" value={newInsumo.Precio} onChange={handleInputChange} required />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>Crear Insumo</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para editar insumo */}
            <Modal show={showEditInsumoModal} onHide={() => setShowEditInsumoModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Insumo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitEditInsumo}>
                        <Form.Group controlId="formEditNombre" className='mb-2'>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={editInsumo.Nombre} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEditDescripcion" className='mb-2'>
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control type="text" name="Descripcion" value={editInsumo.Descripcion} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEditFoto" className='mb-2'>
                            <Form.Label>Foto (Dejar vacío para no cambiar)</Form.Label>
                            <Form.Control type="file" name="Foto" accept="image/*" onChange={handleEditInputChange} />
                            {editInsumo.Foto && (
                                <div className="mt-2">
                                    <p className="text-muted small">Foto actual:</p>
                                    <img src={editInsumo.Foto} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formEditPrecio" className='mb-4'>
                            <Form.Label>Precio</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control type="number" name="Precio" value={editInsumo.Precio} onChange={handleEditInputChange} required />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>Actualizar Insumo</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Insumos;
