import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Spinner, Modal, Form, InputGroup } from 'react-bootstrap';
import {
    FaUserMd, FaEnvelope, FaIdCard, FaClock, FaBookMedical, FaHorse, FaUserTie,
    FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff, FaUserCircle, FaEdit, FaSave, FaTimes
} from 'react-icons/fa';
import { BsFacebook, BsInstagram, BsWhatsapp } from 'react-icons/bs';

// URL base de tu backend en Render
const API_URL = 'https://soporte-equino.onrender.com/api';

// --- Componente Modal de Edición de Perfil ---

const EditProfileModal = ({ isOpen, onClose, profileData, onSave, loading }) => {
    // Inicializar el estado de la data, asegurando que 'Redes' siempre sea un objeto
    const initialFormData = {
        ...profileData,
        // Asegurarse de que Redes sea un objeto, incluso si viene null o string vacío
        Redes: profileData?.Redes && typeof profileData.Redes === 'string'
            ? (JSON.parse(profileData.Redes) || {})
            : (profileData?.Redes || {})
    };

    const [formData, setFormData] = useState(initialFormData);
    const [file, setFile] = useState(null);
    const [validated, setValidated] = useState(false);

    // Sincroniza los datos iniciales cuando se abre el modal
    useEffect(() => {
        if (isOpen && profileData) {
            setFormData(initialFormData);
            setFile(null);
            setValidated(false);
        }
    }, [isOpen, profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // NUEVO: Handler para campos de Redes Sociales
    const handleRedesChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            Redes: {
                ...prev.Redes,
                [name]: value
            }
        }));
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

        // Antes de guardar, serializar el objeto Redes a un string JSON
        const dataToSave = {
            ...formData,
            Redes: JSON.stringify(formData.Redes)
        };

        onSave(dataToSave, file);
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className='border-bottom border-primary'>
                <Modal.Title><FaEdit className="me-2 text-primary" /> Editar Perfil</Modal.Title>
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
                        <Col md={12}>
                            <Form.Group className="mb-3" controlId="editEspecialidad">
                                <Form.Label>Especialidad</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Especialidad"
                                    value={formData.Especialidad || ''}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Odontología Equina"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group className="mb-3" controlId="editDescripcion">
                                <Form.Label>Descripción Profesional</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="Descripcion"
                                    value={formData.Descripcion || ''}
                                    onChange={handleInputChange}
                                    placeholder="Breve descripción de su experiencia y servicios..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <h5 className="border-bottom pb-2 mb-3 mt-4">Redes Sociales</h5>
                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="redesWhatsapp">
                                <Form.Label><BsWhatsapp className="me-1 text-success" /> WhatsApp (Número)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="whatsapp"
                                    value={formData.Redes?.whatsapp || ''}
                                    onChange={handleRedesChange}
                                    placeholder="Ej: 573101234567"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="redesFacebook">
                                <Form.Label><BsFacebook className="me-1 text-primary" /> Facebook (URL)</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="facebook"
                                    value={formData.Redes?.facebook || ''}
                                    onChange={handleRedesChange}
                                    placeholder="Ej: https://facebook.com/usuario"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="redesInstagram">
                                <Form.Label><BsInstagram className="me-1 text-danger" /> Instagram (URL)</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="instagram"
                                    value={formData.Redes?.instagram || ''}
                                    onChange={handleRedesChange}
                                    placeholder="Ej: https://instagram.com/usuario"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        <FaTimes className="me-2" /> Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <><Spinner animation="border" size="sm" className="me-2" /> Guardando...</>
                        ) : (
                            <><FaSave className="me-2" /> Guardar Cambios</>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// --- Componente Principal Dashboard ---

const VeterinarioDashboard = () => {
    // Estado del usuario logueado
    const [veterinarioData, setVeterinarioData] = useState(null);
    const [veterinarioID, setVeterinarioID] = useState(null);

    // NUEVOS ESTADOS DE EDICIÓN
    const [showEditModal, setShowEditModal] = useState(false);
    const [editProfile, setEditProfile] = useState(null); // Datos cargados para el formulario

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
                setVeterinarioID(userData.user?.[0]?.idVeterinario);

                // Asegurar que Redes se parsee si viene como string JSON
                const rawData = userData.user?.[0];
                if (rawData?.Redes && typeof rawData.Redes === 'string') {
                    rawData.Redes = JSON.parse(rawData.Redes);
                }

                setVeterinarioData(rawData);
                setEditProfile(rawData); // Inicializar datos de edición

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

        // 2. Obtener Pacientes 
        await fetchData('pacientes', (data) => {
            setPatientCount(data.length);
        }, id);

        // 3. Obtener Propietarios
        await fetchData('propietarios', (data) => {
            setOwnerCount(data.length);
        });

        setLoading(false);
    }, [veterinarioID, fetchData]);

    // Hook principal para la carga de datos
    useEffect(() => {
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
            const userStorage = JSON.parse(localStorage.getItem('veterinario'));
            localStorage.setItem('veterinario', JSON.stringify({ ...userStorage, user: [updatedUser] }));
            setVeterinarioData(updatedUser);

        } catch (err) {
            setError(`Error al actualizar el estado: ${err.message}`);
        }
    };

    // Handler para abrir el modal de edición
    const handleShowEditModal = () => {
        setEditProfile(veterinarioData);
        setShowEditModal(true);
    };

    const handleSubmitEditProfile = async (formData, file) => {
        const token = getAuthToken();
        if (!veterinarioData || !token) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Construir FormData
            const dataToSend = new FormData();

            // Adjuntar todos los campos de texto
            Object.entries(formData).forEach(([key, value]) => {
                dataToSend.append(key, value);
            });

            // 2. Adjuntar el archivo de foto
            if (file) {
                dataToSend.append('Foto', file);
            } else if (veterinarioData.Foto) {
                dataToSend.append('Foto', veterinarioData.Foto);
            } else {
                dataToSend.append('Foto', '');
            }

            // 3. Enviar PUT request a la API
            const response = await fetch(`${API_URL}/veterinarios/${veterinarioData.idVeterinario}`, {
                method: 'PUT',
                headers: { 'Authorization': token },
                body: dataToSend
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar perfil');
            }

            // 4. Recargar datos del usuario para actualizar el Dashboard
            const updatedData = await response.json();

            // Asegurarse de que el campo Redes del objeto retornado sea JSON si lo devuelve como string
            if (updatedData.Redes && typeof updatedData.Redes === 'string') {
                updatedData.Redes = JSON.parse(updatedData.Redes);
            }

            // Refrescar el localStorage con los nuevos datos
            const userStorage = JSON.parse(localStorage.getItem('veterinario'));
            localStorage.setItem('veterinario', JSON.stringify({ ...userStorage, user: [updatedData] }));

            setVeterinarioData(updatedData);
            setEditProfile(updatedData);
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
        return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /> Cargando Dashboard...</div>;
    }

    // Extracción de datos y Redes Sociales
    const { Cedula, Nombre, Apellido, Correo, Foto, Estado, Redes } = veterinarioData || {};
    const RedesParsed = Redes || {}; // Ya debería ser un objeto gracias a getAuthToken
    const isActivo = Estado === 'Activo';
    const NombreCompleto = `${Nombre || ''} ${Apellido || ''}`.trim();

    return (
        <Container className="my-5">
            <h1 className="mb-4 text-primary">
                <FaUserMd className="me-2" /> Bienvenido Dr(a). {NombreCompleto || 'Invitado'}
            </h1>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                {/* LADO DERECHO: Perfil del Veterinario */}
                <Col lg={4} className="mb-4">
                    <Card className="shadow-sm h-100 border-primary">
                        <Card.Body className="text-center">
                            {/* Foto y Nombre */}
                            <div className="mb-3">
                                {Foto ? (
                                    <img
                                        src={`https://soporte-equino.onrender.com/uploads/${Foto}`}
                                        alt="Foto Perfil"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/120x120/007bff/ffffff?text=Sin+Foto" }}
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '4px solid #0d6efd' }}
                                    />
                                ) : (
                                    <FaUserCircle size={120} className='text-primary' />
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
                                variant="outline-primary"
                                onClick={handleShowEditModal}
                                className="mb-2 w-100"
                                disabled={loading}
                            >
                                <FaEdit className="me-2" /> Editar Información
                            </Button>

                            <Button
                                variant={isActivo ? "outline-danger" : "outline-success"}
                                onClick={handleToggleStatus}
                                className="w-100"
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
                                <ListGroup.Item><FaIdCard className="me-2 text-primary" /> Cédula: {Cedula}</ListGroup.Item>
                                <ListGroup.Item><FaEnvelope className="me-2 text-primary" /> Email: {Correo}</ListGroup.Item>
                            </ListGroup>

                            {/* Enlaces de Redes Sociales en la Vista */}
                            {(RedesParsed.whatsapp || RedesParsed.facebook || RedesParsed.instagram) && (
                                <>
                                    <h6 className="mt-3 border-top pt-2">Redes</h6>
                                    <div className="d-flex justify-content-center gap-3">
                                        {RedesParsed.whatsapp && (
                                            <a href={`https://wa.me/${RedesParsed.whatsapp}`} target="_blank" rel="noopener noreferrer">
                                                <BsWhatsapp size={24} className="text-success" />
                                            </a>
                                        )}
                                        {RedesParsed.facebook && (
                                            <a href={RedesParsed.facebook} target="_blank" rel="noopener noreferrer">
                                                <BsFacebook size={24} className="text-primary" />
                                            </a>
                                        )}
                                        {RedesParsed.instagram && (
                                            <a href={RedesParsed.instagram} target="_blank" rel="noopener noreferrer">
                                                <BsInstagram size={24} className="text-danger" />
                                            </a>
                                        )}
                                    </div>
                                </>
                            )}

                        </Card.Body>
                    </Card>
                </Col>

                {/* LADO IZQUIERDO: Resumen y Datos Filtrados */}
                <Col lg={8}>
                    <Row className="mb-4">
                        {/* Tarjetas de Resumen */}
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaBookMedical size={30} className="text-primary mb-2" />
                                    <Card.Title>{loading ? <Spinner animation="border" size="sm" /> : historyCount}</Card.Title>
                                    <Card.Text>Historias Clínicas</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaHorse size={30} className="text-primary mb-2" />
                                    <Card.Title>{loading ? <Spinner animation="border" size="sm" /> : patientCount}</Card.Title>
                                    <Card.Text>Pacientes Asignados</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm text-center">
                                <Card.Body>
                                    <FaUserTie size={30} className="text-primary mb-2" />
                                    <Card.Title>{loading ? <Spinner animation="border" size="sm" /> : ownerCount}</Card.Title>
                                    <Card.Text>Propietarios</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Historias Clínicas Recientes */}
                    <Card className="shadow-sm border-info">
                        <Card.Header className="bg-primary text-white">
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
                                        <Badge bg="primary" className="text-dark">
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

            {/* Modal de Edición de Perfil (RENDERIZADO) */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                profileData={editProfile}
                onSave={handleSubmitEditProfile}
                loading={loading}
            />
        </Container>
    );
};

export default VeterinarioDashboard;
