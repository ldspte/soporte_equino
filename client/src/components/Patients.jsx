import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus, FaHorseHead, FaIdCard } from 'react-icons/fa';

function PatientManagement() {
    const [patients, setPatients] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [showEditPatientModal, setShowEditPatientModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ Nombre: '', Numero_registro:'', Numero_chip:'', Edad: '', Raza: '', Sexo: '', Foto:'', Propietario: '' });
    const [editPatient, setEditPatient] = useState({ Nombre: '', Numero_registro:'', Numero_chip:'', Edad: '', Raza: '', Sexo: '', Foto:'', Propietario: ''});
    const [currentPatient, setCurrentPatient] = useState(null);

    // --- Funciones de Utilidad y Hooks ---

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        // console.log(token ? `Bearer ${token}` : "XXXX") // Descomenta si necesitas depurar el token
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
    }, [getAuthToken]); // Dependencia del token para asegurar que la carga se ejecute solo si hay token
    
    // --- Lógica de Fetch de Datos ---

    // 2. fetchPatients recibe el token directamente, eliminando la doble verificación
    const fetchPatients = async (token) => {
        setLoading(true);
        setError(null); // Limpiar errores antes de la nueva petición
        
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/pacientes',{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
            // El error principal ya se manejaría en el useEffect, pero esta es una buena práctica
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/propietarios',{
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
        setNewPatient(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditPatient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewPatient = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            setError('No autorizado. Por favor, inicia sesión.');
            return;
        }
        
        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newPatient)
            });
            
            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(errorText || 'Error al crear paciente');
            }
            
            // Refrescar datos y cerrar modal
            fetchPatients(token);
            setShowNewPatientModal(false);
            setNewPatient({ Nombre: '', Numero_registro: '', Numero_chip:'', Edad: '', Raza: '', Sexo: '', Foto:'', Propietario: '' });
            setError(null); // Limpiar errores si la operación fue exitosa
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
            const response = await fetch(`https://soporte-equino.onrender.com/api/pacientes/${currentPatient.idPaciente}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editPatient)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar paciente');
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
            const response = await fetch(`https://soporte-equino.onrender.com/api/pacientes/${idPaciente}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
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
                <Button variant="warning" onClick={() => setShowNewPatientModal(true)}>
                    <FaPlus className="me-2" /> Nuevo Paciente
                </Button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text className="bg-warning text-white">
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
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
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
                                            <td><FaHorseHead className='me-2 text-warning'/> {patient.Nombre}</td>
                                            <td><FaIdCard className='me-2 text-info'/> {patient.Numero_registro}</td>
                                            <td>{patient.Raza}</td>
                                            <td>{patient.Sexo}</td>
                                            <td>
                                                <FaUserCircle className='me-2 text-success'/>
                                                {owners.find(owner => owner.idPropietario === patient.Propietario)
                                                    ? `${owners.find(owner => owner.idPropietario === patient.Propietario).Nombre} ${owners.find(owner => owner.idPropietario === patient.Propietario).Apellido}`
                                                    : 'No asignado'}
                                            </td>
                                            <td>
                                                <Button variant="outline-warning" size="sm" className='me-2' onClick={() => handleEditPatient(patient)}>
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
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formFoto" className='mb-2'>
                            <Form.Label>Foto</Form.Label>
                            {/* Nota: En un entorno de producción real, el campo 'file' debe manejarse con FormData, no solo con el valor del input. */}
                            <Form.Control type="file" name="Foto" onChange={handleInputChange} />
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
                        <Button type="submit" variant="warning">Crear Paciente</Button>
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
                                <Form.Control type="text" name="Numero_chip" value={editPatient.Numero_chip} onChange={handleEditInputChange}/>
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
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </Form.Control>
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
                            <Button type="submit" variant="warning">Actualizar Paciente</Button>
                        </Form>
                     )}
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default PatientManagement;
