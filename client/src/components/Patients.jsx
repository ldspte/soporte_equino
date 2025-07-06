import { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, InputGroup, Form, Modal, Alert } from 'react-bootstrap';
import { FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
// import '../Styles/patient.css';

function PatientManagement() {
    const [patients, setPatients] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [showEditPatientModal, setShowEditPatientModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ Nombre: '', Edad: '', Raza: '', Sexo: '', Propietario: '' });
    const [editPatient, setEditPatient] = useState({ Nombre: '', Edad: '', Raza: '', Sexo: '', Propietario: '' });
    const [currentPatient, setCurrentPatient] = useState(null);

    useEffect(() => {
        fetchPatients();
        fetchOwners();
    }, []);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/pacientes');
            if (!response.ok) throw new Error('Error al obtener pacientes');
            const data = await response.json();
            setPatients(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/propietarios');
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
        setNewPatient(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditPatient(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitNewPatient = async (e) => {
        e.preventDefault();
        try {
            console.log(newPatient);
            const response = await fetch('http://localhost:3001/api/pacientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPatient)
            });
            if (!response.ok) throw new Error('Error al crear paciente');
            fetchPatients();
            setShowNewPatientModal(false);
            setNewPatient({ Nombre: '', Edad: '', Raza: '', Sexo: '', Propietario: '' });
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
        try {
            const response = await fetch(`http://localhost:3001/api/pacientes/${currentPatient.idPaciente}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editPatient)
            });
            if (!response.ok) throw new Error('Error al actualizar paciente');
            fetchPatients();
            setShowEditPatientModal(false);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeletePatient = async (idPaciente) => {
        try {
            const response = await fetch(`http://localhost:3001/api/pacientes/${idPaciente}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Error al eliminar paciente');
            fetchPatients();
        } catch (error) {
            setError(error.message);
        }
    };

    const filteredPatients = patients.filter(patient => 
        patient.Nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por nombre"
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
                        <th>#</th> {/* Nueva columna para enumerar */}
                        <th>Nombre</th>
                        <th>Edad</th>
                        <th>Raza</th>
                        <th>Sexo</th>
                        <th>Propietario</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPatients.map((patient, index) => (
                        <tr key={patient.idPaciente}>
                            <td>{index + 1}</td> {/* Mostrar el índice + 1 para enumerar desde 1 */}
                            <td>{patient.Nombre}</td>
                            <td>{patient.Edad}</td>
                            <td>{patient.Raza}</td>
                            <td>{patient.Sexo}</td>
                            <td>
                                {owners.find(owner => owner.idPropietario === patient.Propietario)
                                    ? `${owners.find(owner => owner.idPropietario === patient.Propietario).Nombre} ${owners.find(owner => owner.idPropietario === patient.Propietario).Apellido}`
                                    : 'No asignado'}
                            </td>
                            <td>
                                <Button variant="outline-warning" onClick={() => handleEditPatient(patient)}>
                                    <FaEdit />
                                </Button>
                                <Button variant="outline-danger" onClick={() => handleDeletePatient(patient.id)}>
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


            {/* Modal para crear nuevo paciente */}
            <Modal show={showNewPatientModal} onHide={() => setShowNewPatientModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Crear Paciente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitNewPatient}>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={newPatient.Nombre} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEdad">
                            <Form.Label>Edad</Form.Label>
                            <Form.Control type="text" name="Edad" value={newPatient.Edad} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formRaza">
                            <Form.Label>Raza</Form.Label>
                            <Form.Control type="text" name="Raza" value={newPatient.Raza} onChange={handleInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formSexo">
                            <Form.Label>Sexo</Form.Label>
                            <Form.Control as="select" name="Sexo" value={newPatient.Sexo} onChange={handleInputChange} required>
                                <option value="">Seleccione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formPropietario">
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
            <Modal show={showEditPatientModal} onHide={() => setShowEditPatientModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Paciente</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmitEditPatient}>
                        <Form.Group controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control type="text" name="Nombre" value={editPatient.Nombre} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formEdad">
                            <Form.Label>Edad</Form.Label>
                            <Form.Control type="number" name="Edad" value={editPatient.Edad} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formRaza">
                            <Form.Label>Raza</Form.Label>
                            <Form.Control type="text" name="Raza" value={editPatient.Raza} onChange={handleEditInputChange} required />
                        </Form.Group>
                        <Form.Group controlId="formSexo">
                            <Form.Label>Sexo</Form.Label>
                            <Form.Control as="select" name="Sexo" value={editPatient.Sexo} onChange={handleEditInputChange} required>
                                <option value="">Seleccione</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formPropietario">
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
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default PatientManagement;
