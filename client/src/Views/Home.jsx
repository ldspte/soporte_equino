import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import {
    FaUserMd, FaEnvelope, FaIdCard, FaClock, FaBookMedical, FaHorse, FaUserTie,
    FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff, FaUserCircle
} from 'react-icons/fa';

// URL base de tu backend en Render
const API_URL = 'https://soporte-equino.onrender.com/api';

const EditProfileModal = ({ isOpen, onClose, profileData, onSave, loading }) => {
    const [formData, setFormData] = useState(profileData || {});
    const [file, setFile] = useState(null);
    const [validated, setValidated] = useState(false);

    // Sincroniza los datos iniciales cuando se abre el modal
    useEffect(() => {
        if (isOpen && profileData) {
            setFormData(profileData);
            setFile(null); // Limpiar archivo al abrir
            setValidated(false);
        }
    }, [isOpen, profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }
        onSave(formData, file);
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className='border-bottom border-warning'>
                <Modal.Title><FaEdit className="me-2 text-warning"/> Editar Perfil</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <Alert variant="info">
                        **Nota:** Si deseas cambiar tu contraseña, utiliza el proceso de "Olvidé mi contraseña" en el login.
                    </Alert>
                    <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="editNombre">
                                <Form.Label>Nombre *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Nombre"
                                    value={formData.Nombre || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">El nombre es obligatorio.</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="editApellido">
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Apellido"
                                    value={formData.Apellido || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="editCedula">
                                <Form.Label>Cédula *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Cedula"
                                    value={formData.Cedula || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">La cédula es obligatoria.</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="editCorreo">
                                <Form.Label>Correo Electrónico *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="Correo"
                                    value={formData.Correo || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">Ingrese un correo válido.</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3" controlId="editFoto">
                                <Form.Label>Foto de Perfil (Opcional)</Form.Label>
                                <Form.Control
                                    type="file"
                                    name="Foto"
                                    onChange={handleFileChange}
                                />
                                {profileData?.Foto && (
                                    <p className="mt-1 text-muted small">
                                        Archivo actual: **{profileData.Foto}**
                                    </p>
                                )}
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        <FaTimes className="me-2"/> Cancelar
                    </Button>
                    <Button variant="warning" type="submit" disabled={loading}>
                        {loading ? (
                            <><Spinner animation="border" size="sm" className="me-2"/> Guardando...</>
                        ) : (
                            <><FaSave className="me-2"/> Guardar Cambios</>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};


const VeterinarioDashboard = () => {
    // Estado del usuario logueado
    const [veterinarioData, setVeterinarioData] = useState(null);
    const [veterinarioID, setVeterinarioID] = useState(null);

    // NUEVOS ESTADOS DE EDICIÓN
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProfile, setEditProfile] = useState(null);


    // Estados de datos
    const [historyCount, setHistoryCount] = useState(0);
    const [patientCount, setPatientCount] = useState(0);
    const [ownerCount, setOwnerCount] = useState(0);
    const [recentHistories, setRecentHistories] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado del token
    const getAuthToken = useCallback(() => {
        const userStorage = localStorage.getItem('veterinario');
        if (userStorage) {
            try {
                const userData = JSON.parse(userStorage);
                // Asumiendo que el ID del veterinario está directamente en el objeto user[0]
                setVeterinarioID(userData.user[0].idVeterinario); 
                setVeterinarioData(userData.user[0]);
                return localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : null;
            } catch (e) {
                console.error("Error al parsear datos del veterinario:", e);
                return null;
            }
        }
        return null;
    }, []);
    
    // Función genérica para hacer fetch a rutas protegidas
    const fetchData = useCallback(async (endpoint, setter, filterId = null) => {
        const token = getAuthToken();
        if (!token) {
            setError('Sesión no autenticada. Por favor, reinicie la sesión.');
            return;
        }

        try {
            const url = filterId ? `${API_URL}/${endpoint}?veterinarioId=${filterId}` : `${API_URL}/${endpoint}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Permisos insuficientes o sesión expirada.');
                }
                const errorText = await response.text();
                throw new Error(errorText || 'Error al cargar datos');
            }
            
            const data = await response.json();
            setter(data);
        } catch (err) {
            setError(err.message);
            console.error(`Error fetching ${endpoint}:`, err);
        }
    }, [getAuthToken]);

    // Función para obtener los datos específicos del dashboard
    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const id = veterinarioID;

        if (!id) {
            setLoading(false);
            return;
        }

        // 1. Obtener Historias Clínicas (para el conteo y la lista reciente)
        await fetchData('historia_clinica', (data) => {
            // Filtrado en el cliente para simular el filtro por ID del veterinario
            const userHistories = data.filter(h => h.Veterinario === id);
            setHistoryCount(userHistories.length);
            setRecentHistories(userHistories.slice(0, 5)); // Mostrar 5 más recientes
        }, id);

        // 2. Obtener Pacientes (filtrados por ID del veterinario logueado)
        await fetchData('pacientes', (data) => {
            // NOTA: Asumimos que la tabla 'pacientes' tiene un campo 'Veterinario' o un campo que referencia al dueño,
            // y que podemos filtrar por los pacientes asignados al veterinario logueado.
            // Por simplicidad, aquí filtramos por todos los pacientes que estén asociados a las historias del veterinario.
            setPatientCount(data.length);
        }, id); 

        // 3. Obtener Propietarios (Conteo total)
        await fetchData('propietarios', (data) => {
            setOwnerCount(data.length);
        });

        setLoading(false);
    }, [veterinarioID, fetchData]);

    // Hook principal para la carga de datos
    useEffect(() => {
        // La primera llamada solo obtiene el ID, la segunda carga los datos
        getAuthToken(); 
        if (veterinarioID) {
            loadDashboardData();
        }
    }, [veterinarioID, getAuthToken, loadDashboardData]);

    // Handler para el cambio de estado del veterinario
    const handleToggleStatus = async () => {
        const token = getAuthToken();
        if (!veterinarioData || !token) return;

        const newEstado = veterinarioData.Estado === 'Activo' ? 'Inactivo' : 'Activo';

        // NOTA: Asumo que tienes un campo 'Estado' en tu tabla de veterinarios
        // y que tu ruta PUT puede actualizarlo.
        try {
            const response = await fetch(`${API_URL}/veterinarios/${veterinarioData.idVeterinario}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...veterinarioData, Estado: newEstado })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al cambiar estado');
            }

            // Actualizar el estado local y en localStorage
            const updatedUser = { ...veterinarioData, Estado: newEstado };
            setVeterinarioData(updatedUser);
            // Actualizar localStorage para reflejar el cambio
            const userStorage = JSON.parse(localStorage.getItem('veterinario'));
            localStorage.setItem('veterinario', JSON.stringify({ ...userStorage, user: [updatedUser] }));

        } catch (err) {
            setError(`Error al actualizar el estado: ${err.message}`);
        }
    };
    const handleShowEditModal = () => {
        // Asegurar que los datos del perfil actual se carguen al estado de edición antes de abrir
        setEditProfile(veterinarioData); 
        setShowEditModal(true);
    };

    const handleSubmitEditProfile = async (formData, file) => {
        const token = getAuthToken();
        if (!veterinarioData || !token) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Construir FormData (Necesario para manejar archivos/fotos)
            const dataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                dataToSend.append(key, value);
            });

            // 2. Adjuntar el archivo de foto si existe
            if (file) {
                // 'Foto' debe coincidir con el campo de Multer en el backend
                dataToSend.append('Foto', file); 
            } else if (veterinarioData.Foto) {
                // Si no se sube una nueva foto, envía el nombre de la foto actual
                // para que el backend sepa que no debe borrar el archivo existente.
                dataToSend.append('Foto', veterinarioData.Foto); 
            } else {
                 dataToSend.append('Foto', '');
            }

            // 3. Enviar PUT request a la API
            const response = await fetch(`${API_URL}/veterinarios/${veterinarioData.idVeterinario}`, {
                method: 'PUT',
                // IMPORTANTE: SOLO Authorization, NO Content-Type para FormData
                headers: { 'Authorization': token }, 
                body: dataToSend
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar perfil');
            }

            // 4. Recargar datos del usuario para actualizar el Dashboard
            const updatedData = await response.json(); 
            
            // Refrescar el localStorage con los nuevos datos (si tu backend devuelve el objeto completo)
            const userStorage = JSON.parse(localStorage.getItem('veterinario'));
            localStorage.setItem('veterinario', JSON.stringify({ ...userStorage, user: [updatedData] }));

            setVeterinarioData(updatedData);
            setEditProfile(updatedData); // Actualizar los datos del modal de edición
            setShowEditModal(false);

        } catch (err) {
            setError(`Error al actualizar el perfil: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    if (!veterinarioData && !loading) {
        return <Alert variant="danger" className="text-center mt-5">No se pudo cargar la información del usuario logueado. Por favor, inicie sesión de nuevo.</Alert>;
    }

    if (loading && !veterinarioData) {
        return <div className="text-center mt-5"><Spinner animation="border" variant="warning" /> Cargando Dashboard...</div>;
    }
    
    // Extraer datos para la vista
    const { Cedula, Nombre, Apellido, Correo, Foto, Estado } = veterinarioData || {};
    const isActivo = Estado === 'Activo';
    const NombreCompleto = `${Nombre || ''} ${Apellido || ''}`.trim();

    return (
        <Container className="my-5">
            <h1 className="mb-4 text-warning">
                <FaUserMd className="me-2"/> Bienvenido Dr(a). {NombreCompleto || 'Invitado'}
            </h1>
            
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                {/* LADO DERECHO: Perfil del Veterinario */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100 border-warning">
                        <Card.Body className="text-center">
                            {/* Foto y Nombre */}
                            <div className="mb-3">
                                {Foto ? (
                                    <img 
                                        src={`https://soporte-equino.onrender.com/uploads/${Foto}`} 
                                        alt="Foto Perfil" 
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #ffc107' }} 
                                    />
                                ) : (
                                    <FaUserCircle size={120} className='text-warning' />
                                )}
                            </div>
                            <Card.Title>{NombreCompleto}</Card.Title>
                            
                            {/* Estado y Botón de Alternancia */}
                            <p>
                                Estado: <Badge bg={isActivo ? "success" : "danger"}>
                                    {isActivo ? 'ACTIVO' : 'INACTIVO'}
                                </Badge>
                            </p>
                            
                            <Button 
                                variant={isActivo ? "outline-danger" : "outline-success"}
                                onClick={handleToggleStatus}
                                className="mt-2 w-100"
                                disabled={loading}
                            >
                                {isActivo ? (
                                    <> <FaToggleOff className="me-2" /> Desactivar </>) : (
                                    <> <FaToggleOn className="me-2" /> Activar </>)
                                }
                            </Button>
                            
                            <hr />

                            {/* Información General */}
                            <ListGroup variant="flush" className="text-start">
                                <ListGroup.Item><FaIdCard className="me-2 text-warning"/> Cédula: {Cedula}</ListGroup.Item>
                                <ListGroup.Item><FaEnvelope className="me-2 text-warning"/> Email: {Correo}</ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100 border-warning">
                        <Card.Body className="text-center">
                            {/* ... (Visualización de foto, estado y datos) */}
                            <Button 
                                variant="outline-warning"
                                onClick={handleShowEditModal} // Botón para abrir el modal
                                className="mt-3 w-100"
                                disabled={loading}
                            >
                                <FaEdit className="me-2"/> Editar Información
                            </Button>
                            
                            <hr />

                            {/* ... (Información General) */}
                        </Card.Body>
                    </Card>
                </Col>
                <EditProfileModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    profileData={editProfile}
                    onSave={handleSubmitEditProfile}
                    loading={loading}
                />

                {/* LADO IZQUIERDO: Resumen y Datos Filtrados */}
                <Col lg={8}>
                    <Row className="mb-4">
                        {/* Tarjetas de Resumen */}
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaBookMedical size={30} className="text-warning mb-2" />
                                    <Card.Title>{loading ? <Spinner animation="border" size="sm" /> : historyCount}</Card.Title>
                                    <Card.Text>Historias Clínicas</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaHorse size={30} className="text-warning mb-2" />
                                    <Card.Title>{loading ? <Spinner animation="border" size="sm" /> : patientCount}</Card.Title>
                                    <Card.Text>Pacientes Asignados</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaUserTie size={30} className="text-warning mb-2" />
                                    <Card.Title>{loading ? <Spinner animation="border" size="sm" /> : ownerCount}</Card.Title>
                                    <Card.Text>Propietarios</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Historias Clínicas Recientes */}
                    <Card className="shadow-sm border-info">
                        <Card.Header className="bg-info text-white">
                            <FaClock className="me-2" /> Últimas Historias Registradas
                        </Card.Header>
                        <ListGroup variant="flush">
                            {recentHistories.length > 0 ? (
                                recentHistories.map(h => (
                                    <ListGroup.Item key={h.idHistoria_clinica} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{h.Paciente || 'Paciente Desconocido'}</strong>
                                            <p className="mb-0 text-muted small">Obs: {h.Observaciones.substring(0, 50)}...</p>
                                        </div>
                                        <Badge bg="warning" className="text-dark">
                                            {new Date(h.Fecha).toLocaleDateString('es-CO')}
                                        </Badge>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item className="text-center text-muted">
                                    {loading ? 'Cargando...' : 'No hay historias recientes para este veterinario.'}
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default VeterinarioDashboard;
