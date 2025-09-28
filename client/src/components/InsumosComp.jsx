import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrashAlt, FaPlus, FaTag, FaMoneyBill, FaImage } from 'react-icons/fa';

function Insumos() {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewInsumoModal, setShowNewInsumoModal] = useState(false);
    const [showEditInsumoModal, setShowEditInsumoModal] = useState(false);
    const [currentInsumo, setCurrentInsumo] = useState(null);
    
    const [newInsumo, setNewInsumo] = useState({ Nombre: '', Descripcion: '', Precio: '' });
    const [newInsumoFile, setNewInsumoFile] = useState(null);
    const [editInsumo, setEditInsumo] = useState({ Nombre: '', Descripcion: '', Precio: '' }); // Nota: La foto actual se carga en currentInsumo

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
            const response = await fetch('https://soporte-equino.onrender.com/api/insumos', {
                method: 'GET',
                // Para GET, sí podemos enviar Content-Type: application/json
                headers: { 'Authorization': token , 'Content-Type': 'application/json'}
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    setError('Sesión expirada o permisos insuficientes.');
                    return; 
                }
                throw new Error(`Error ${response.status} al obtener insumos`);
            }
            
            const data = await response.json();
            setInsumos(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers de Formulario ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInsumo(prev => ({ ...prev, [name]: value }));
    };

    const handleNewFileChange = (e) => {
        setNewInsumoFile(e.target.files[0]); // Guardamos el objeto File
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditInsumo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewInsumo = async (e) => {
        e.preventDefault();
        
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }
        
        const formData = new FormData();
        formData.append('Nombre', newInsumo.Nombre);
        formData.append('Descripcion', newInsumo.Descripcion);
        formData.append('Precio', newInsumo.Precio);
        
        // El campo 'Foto' debe coincidir con el campo de Multer
        if (newInsumoFile) {
            formData.append('Foto', newInsumoFile);
        }

        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/insumos', {
                method: 'POST',
                // CORRECCIÓN CLAVE: Solo enviamos Authorization. El navegador configura Content-Type: multipart/form-data
                headers: { 'Authorization': token }, 
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear insumo');
            }
            
            fetchInsumos(token);
            setShowNewInsumoModal(false);
            setNewInsumo({ Nombre: '', Descripcion: '', Precio: '' });
            setNewInsumoFile(null); // Limpiamos el archivo
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditInsumo = (insumo) => {
        setCurrentInsumo(insumo);
        // Cargamos los datos de texto. La foto (el archivo) se maneja en el input.
        setEditInsumo({ Nombre: insumo.Nombre, Descripcion: insumo.Descripcion, Precio: insumo.Precio, Foto: insumo.Foto });
        setNewInsumoFile(null); // Limpiamos el selector de archivos por si quedó algo de antes
        setShowEditInsumoModal(true);
    };

    const handleSubmitEditInsumo = async (e) => {
        e.preventDefault();
        
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        const formData = new FormData();
        formData.append('Nombre', editInsumo.Nombre);
        formData.append('Descripcion', editInsumo.Descripcion);
        formData.append('Precio', editInsumo.Precio);
        
        // Mantenemos el nombre de la foto actual para que el backend sepa cuál es si no se sube una nueva
        formData.append('Foto', editInsumo.Foto || ''); 

        // Capturamos el archivo directamente del input de edición
        const photoInput = e.target.elements.formEditFoto.files[0];
        
        if (photoInput) {
             // Si se seleccionó un nuevo archivo, Multer lo procesará
            formData.append('Foto', photoInput); 
        }

        try {
            const response = await fetch(`https://soporte-equino.onrender.com/api/insumos/${currentInsumo.idInsumos}`, {
                method: 'PUT',
                // CORRECCIÓN CLAVE: Solo enviamos Authorization.
                headers: { 'Authorization': token }, 
                body: formData
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
            const response = await fetch(`https://soporte-equino.onrender.com/api/insumos/${idInsumos}`, {
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
                <Button variant="warning" onClick={() => setShowNewInsumoModal(true)}>
                    <FaPlus className="me-2" /> Nuevo Insumo
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
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th><FaTag className='me-1'/> Nombre</th>
                                        <th>Descripción</th>
                                        <th>Foto</th>
                                        <th><FaMoneyBill className='me-1'/> Precio</th>
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
                                                        src={`https://soporte-equino.onrender.com/uploads/${insumo.Foto}`} 
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
                                                <Button variant="outline-warning" size="sm" className='me-2' onClick={() => handleEditInsumo(insumo)}>
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
                            <Form.Control type="file" name="Foto" onChange={handleNewFileChange} required />
                        </Form.Group>
                        <Form.Group controlId="formPrecio" className='mb-4'>
                            <Form.Label>Precio</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control type="number" name="Precio" value={newInsumo.Precio} onChange={handleInputChange} required />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="warning">Crear Insumo</Button>
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
                            {/* Usamos handleNewFileChange para capturar el nuevo archivo si lo hay */}
                            <Form.Control type="file" name="Foto" onChange={handleNewFileChange} />
                            {currentInsumo?.Foto && (
                                <p className="mt-2 text-muted small">
                                    Archivo actual: **{currentInsumo.Foto}**
                                </p>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formEditPrecio" className='mb-4'>
                            <Form.Label>Precio</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control type="number" name="Precio" value={editInsumo.Precio} onChange={handleEditInputChange} required />
                            </InputGroup>
                        </Form.Group>
                        <Button type="submit" variant="warning">Actualizar Insumo</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Insumos;
