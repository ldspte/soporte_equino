import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus, FaHorseHead, FaIdCard } from 'react-icons/fa';
import API_URL from '../config';

function PatientManagement() {
    const [patients, setPatients] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [showEditPatientModal, setShowEditPatientModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ Nombre: '', Numero_registro: '', Numero_chip: '', Edad: '', Raza: '', Sexo: '', Foto: '', Propietario: '' });
    const [editPatient, setEditPatient] = useState({ Nombre: '', Numero_registro: '', Numero_chip: '', Edad: '', Raza: '', Sexo: '', Foto: '', Propietario: '' });
    const [currentPatient, setCurrentPatient] = useState(null);

    // --- Funciones de Utilidad y Hooks ---

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : null;
    }, []);

    // 1. Hook para cargar datos iniciales (pacientes y propietarios)
    useEffect(() => {
        const token = getAuthToken();
        if (token) {
            fetchPatients(token);
            fetchOwners(token);
        } else {
            setError('No autorizado. Por favor, inicia sesión.');
        }
    }, [getAuthToken]);

    // --- Lógica de Fetch de Datos ---

    // 2. fetchPatients recibe el token directamente, eliminando la doble verificación
    const fetchPatients = async (token) => {
        setLoading(true);
        setError(null);

        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/pacientes`, {
                method: 'GET',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
                    return;
                }
                throw new Error(`Error ${response.status} al obtener pacientes`);
            }

            const data = await response.json();
            setPatients(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. fetchOwners también recibe el token y se asegura de que solo se carguen datos una vez
    const fetchOwners = async (token) => {
        setLoading(true);
        setError(null);

        if (!token) {
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
            setOwners(data);
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
                setNewPatient(prev => ({ ...prev, [name]: base64 }));
            } catch (error) {
                console.error('Error al convertir imagen a base64:', error);
                setError('Error al procesar la imagen');
            }
        } else {
            setNewPatient(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleEditInputChange = async (e) => {
        const { name, value, files } = e.target;

        // Si es un input de tipo file, convertir a base64
        if (name === 'Foto' && files && files[0]) {
            try {
                const base64 = await fileToBase64(files[0]);
                setEditPatient(prev => ({ ...prev, [name]: base64 }));
            } catch (error) {
                console.error('Error al convertir imagen a base64:', error);
                setError('Error al procesar la imagen');
            }
        } else {
            setEditPatient(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmitNewPatient = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/pacientes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(newPatient)
            });

            if (!response.ok) {
                let errorMessage = 'Error al crear paciente';
                try {
                    const errorJson = await response.json();
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            // Refrescar datos y cerrar modal
            fetchPatients(token);
            setShowNewPatientModal(false);
            setNewPatient({ Nombre: '', Numero_registro: '', Numero_chip: '', Edad: '', Raza: '', Sexo: '', Foto: '', Propietario: '' });
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEditPatient = (patient) => {
        setCurrentPatient(patient);
        setEditPatient(patient);
        setShowEditPatientModal(true);
    };

    const handleSubmitEditPatient = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/pacientes/${currentPatient.idPaciente}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(editPatient)
            });

            if (!response.ok) {
                let errorMessage = 'Error al actualizar paciente';
                try {
                    const errorJson = await response.json();
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            fetchPatients(token);
            setShowEditPatientModal(false);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeletePatient = async (idPaciente) => {
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/pacientes/${idPaciente}`, {
                method: 'DELETE',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar paciente');
            }

            fetchPatients(token);
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    // --- Lógica de Filtro ---

    const filteredPatients = patients.filter(patient =>
        patient.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.Numero_registro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (owners.find(owner => owner.idPropietario === patient.Propietario)?.Nombre.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // --- Renderizado ---

    return (
        <div>
            <div className='page-header d-flex justify-content-between align-items-center mt-4 mb-4'>
                <h1>Mis Pacientes</h1>
                <Button variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => setShowNewPatientModal(true)}>
                    <FaPlus className="me-2" /> Nuevo Paciente
                </Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text className="text-white" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por Nombre, Registro o Propietario"
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
                                        <th>#</th>
                                        <th>Foto</th>
                                        <th>Nombre</th>
                                        <th>Registro</th>
                                        <th>Raza</th>
                                        <th>Sexo</th>
                                        <th>Propietario</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((patient, index) => (
                                        <tr key={patient.idPaciente}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {patient.Foto ? (
                                                    <img
                                                        src={patient.Foto}
                                                        alt={patient.Nombre}
                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/50x50/cccccc/333333?text=Eq'; }}
                                                    />
                                                ) : (
                                                    <FaHorseHead size={30} className='text-muted' />
                                                )}
                                            </td>
                                            <td> {patient.Nombre}</td>
                                            <td><FaIdCard className='me-2 text-info' /> {patient.Numero_registro}</td>
                                            <td>{patient.Raza}</td>
                                            <td>{patient.Sexo === 'M' ? 'Macho' : patient.Sexo === 'F' ? 'Hembra' : patient.Sexo}</td>
                                            <td>
                                                <FaUserCircle className='me-2 text-success' />
                                                {owners.find(owner => owner.idPropietario === patient.Propietario)
                                                    ? `${owners.find(owner => owner.idPropietario === patient.Propietario).Nombre} ${owners.find(owner => owner.idPropietario === patient.Propietario).Apellido}`
                                                    : 'No asignado'}
                                            </td>
                                            <td>
                                                <Button variant="outline-primary" size="sm" className='me-2' style={{ color: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => handleEditPatient(patient)}>
                                                    <FaEdit />
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDeletePatient(patient.idPaciente)}>
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


            {/* Modal para crear nuevo paciente */}
            <Modal show={showNewPatientModal} onHide={() => setShowNewPatientModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Paciente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewPatient}>
                        <Form.Group controlId="formNombre" className='mb-2'>
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={newPatient.Nombre} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formNumero" className='mb-2'>
                            <Form.Label>Numero de Registro</Form.Label>
                            <Form.Control type="text" name="Numero_registro" value={newPatient.Numero_registro} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group controlId="formChip" className='mb-2'>
                            <Form.Label>Numero Chip</Form.Label>
                            <Form.Control type="text" name="Numero_chip" value={newPatient.Numero_chip} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group controlId="formEdad" className='mb-2'>
                            <Form.Label>Edad</Form.Label>
                            <Form.Control type="number" name="Edad" value={newPatient.Edad} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formRaza" className='mb-2'>
                            <Form.Label>Raza</Form.Label>
                            <Form.Control type="text" name="Raza" value={newPatient.Raza} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formSexo" className='mb-2'>
                            <Form.Label>Sexo</Form.Label>
                            <Form.Control as="select" name="Sexo" value={newPatient.Sexo} onChange={handleInputChange} required>
                                <option value="">Seleccione</option>
                                <option value="M">Macho</option>
                                <option value="F">Hembra</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formFoto" className='mb-2'>
                            <Form.Label>Foto</Form.Label>
                            <Form.Control type="file" name="Foto" accept="image/*" onChange={handleInputChange} />
                            {newPatient.Foto && (
                                <div className="mt-2">
                                    <img src={newPatient.Foto} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                </div>
                            )}
                        </Form.Group>
                        <Form.Group controlId="formPropietario" className='mb-4'>
                            <Form.Label>Propietario</Form.Label>
                            <Form.Control as="select" name="Propietario" value={newPatient.Propietario} onChange={handleInputChange} required>
                                <option value="">Seleccione un propietario</option>
                                {owners.map(owner => (
                                    <option key={owner.idPropietario} value={owner.idPropietario}>{owner.Nombre} {owner.Apellido}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>Crear Paciente</Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal para editar paciente */}
            <Modal show={showEditPatientModal} onHide={() => setShowEditPatientModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Paciente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editPatient && (
                        <Form onSubmit={handleSubmitEditPatient}>
                            <Form.Group controlId="formNombre" className='mb-2'>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control type="text" name="Nombre" value={editPatient.Nombre} onChange={handleEditInputChange} required />
                            </Form.Group>
                            <Form.Group controlId="formNumero" className='mb-2'>
                                <Form.Label>Numero de Registro</Form.Label>
                                <Form.Control type="text" name="Numero_registro" value={editPatient.Numero_registro} onChange={handleEditInputChange} />
                            </Form.Group>
                            <Form.Group controlId="formChip" className='mb-2'>
                                <Form.Label>Numero de Chip</Form.Label>
                                <Form.Control type="text" name="Numero_chip" value={editPatient.Numero_chip} onChange={handleEditInputChange} />
                            </Form.Group>
                            <Form.Group controlId="formEdad" className='mb-2'>
                                <Form.Label>Edad</Form.Label>
                                <Form.Control type="number" name="Edad" value={editPatient.Edad} onChange={handleEditInputChange} required />
                            </Form.Group>
                            <Form.Group controlId="formRaza" className='mb-2'>
                                <Form.Label>Raza</Form.Label>
                                <Form.Control type="text" name="Raza" value={editPatient.Raza} onChange={handleEditInputChange} required />
                            </Form.Group>
                            <Form.Group controlId="formSexo" className='mb-2'>
                                <Form.Label>Sexo</Form.Label>
                                <Form.Control as="select" name="Sexo" value={editPatient.Sexo} onChange={handleEditInputChange} required>
                                    <option value="">Seleccione</option>
                                    <option value="M">Macho</option>
                                    <option value="F">Hembra</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId="formEditFoto" className='mb-2'>
                                <Form.Label>Foto (Dejar vacío para no cambiar)</Form.Label>
                                <Form.Control type="file" name="Foto" accept="image/*" onChange={handleEditInputChange} />
                                {editPatient.Foto && (
                                    <div className="mt-2">
                                        <img src={editPatient.Foto} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                    </div>
                                )}
                            </Form.Group>
                            <Form.Group controlId="formPropietario" className='mb-4'>
                                <Form.Label>Propietario</Form.Label>
                                <Form.Control as="select" name="Propietario" value={editPatient.Propietario} onChange={handleEditInputChange} required>
                                    <option value="">Seleccione un propietario</option>
                                    {owners.map(owner => (
                                        <option key={owner.idPropietario} value={owner.idPropietario}>{owner.Nombre} {owner.Apellido}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>Actualizar Paciente</Button>
                        </Form>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default PatientManagement;
