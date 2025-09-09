import { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';

function Insumos() {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewInsumoModal, setShowNewInsumoModal] = useState(false);
    const [showEditInsumoModal, setShowEditInsumoModal] = useState(false);
    const [currentInsumo, setCurrentInsumo] = useState(null);
    const [newInsumo, setNewInsumo] = useState({ Nombre: '', Descripcion: '', Foto: null, Precio: '' });
    const [editInsumo, setEditInsumo] = useState({ Nombre: '', Descripcion: '', Foto: null, Precio: '' });

    useEffect(() => {
        fetchInsumos();
    }, []);

    const fetchInsumos = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/insumos');
            if (!response.ok) throw new Error('Error al obtener insumos');
            const data = await response.json();
            setInsumos(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInsumo(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewInsumo(prev => ({ ...prev, Foto: e.target.files[0] }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditInsumo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewInsumo = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(newInsumo).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await fetch('http://localhost:3001/api/insumos', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Error al crear insumo');
            fetchInsumos();
            setShowNewInsumoModal(false);
            setNewInsumo({ Nombre: '', Descripcion: '', Foto: null, Precio: '' });
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditInsumo = (insumo) => {
        setCurrentInsumo(insumo);
        setEditInsumo(insumo);
        setShowEditInsumoModal(true);
    };

    const handleSubmitEditInsumo = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(editInsumo).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await fetch(`http://localhost:3001/api/insumos/${currentInsumo.idInsumos}`, {
                method: 'PUT',
                body: formData
            });
            if (!response.ok) throw new Error('Error al actualizar insumo');
            fetchInsumos();
            setShowEditInsumoModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteInsumo = async (idInsumos) => {
        try {
            const response = await fetch(`http://localhost:3001/api/insumos/${idInsumos}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar insumo');
            fetchInsumos();
        } catch (error) {
            setError(error.message);
        }
    };

    const filteredInsumos = insumos.filter(insumo => 
        insumo.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        insumo.Descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <InputGroup.Text>
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
                        <Table hover>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Foto</th>
                                    <th>Precio</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInsumos.map(insumo => (
                                    <tr key={insumo.idInsumos}>
                                        <td>{insumo.Nombre}</td>
                                        <td>{insumo.Descripcion}</td>
                                        <td>
                                            <img src={`http://localhost:3001/uploads/${insumo.Foto}`} alt={insumo.Nombre} style={{ width: '50px' }} />
                                        </td>
                                        <td>{insumo.Precio}</td>
                                        <td>
                                            <Button variant="outline-warning" onClick={() => handleEditInsumo(insumo)}>
                                                <FaEdit />
                                            </Button>
                                            <Button variant="outline-danger" onClick={() => handleDeleteInsumo(insumo.idInsumos)}>
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

            {/* Modal para crear nuevo insumo */}
            <Modal show={showNewInsumoModal} onHide={() => setShowNewInsumoModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Insumo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form enctype="multipart/form-data" onSubmit={handleSubmitNewInsumo}>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={newInsumo.Nombre} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formDescripcion">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control type="text" name="Descripcion" value={newInsumo.Descripcion} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formFoto">
                            <Form.Label>Foto</Form.Label>
                            <Form.Control type="file" name="Foto" onChange={handleFileChange} required />
                        </Form.Group>
                        <Form.Group controlId="formPrecio">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control type="number" name="Precio" value={newInsumo.Precio} onChange={handleInputChange} required />
                        </Form.Group>
                        <Button type="submit" variant="warning">Crear Insumo</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para editar insumo */}
            <Modal show={showEditInsumoModal} onHide={() => setShowEditInsumoModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Insumo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitEditInsumo}>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={editInsumo.Nombre} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formDescripcion">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control type="text" name="Descripcion" value={editInsumo.Descripcion} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formFoto">
                            <Form.Label>Foto</Form.Label>
                            <Form.Control type="file" name="Foto" onChange={handleFileChange} />
                        </Form.Group>
                        <Form.Group controlId="formPrecio">
                            <Form.Label>Precio</Form.Label>
                            <Form.Control type="number" name="Precio" value={editInsumo.Precio} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Button type="submit" variant="warning">Actualizar Insumo</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default Insumos;
