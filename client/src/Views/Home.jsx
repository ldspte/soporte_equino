import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import {
    FaUserMd, FaEnvelope, FaIdCard, FaClock, FaBookMedical, FaHorse, FaUserTie,
    FaToggleOn, FaToggleOff, FaUserCircle, FaEdit, FaSave, FaTimes
} from 'react-icons/fa';
import { BsFacebook, BsInstagram, BsWhatsapp } from 'react-icons/bs';
import API_URL from '../config';

// --- Componente Modal de Edición de Perfil ---

const EditProfileModal = ({ isOpen, onClose, profileData, onSave, loading }) => {
    // Inicializar el estado de la data localmente en el componente
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [validated, setValidated] = useState(false);

    // Sincroniza los datos iniciales cuando se abre el modal
    useEffect(() => {
        if (isOpen && profileData) {
            // Asegurarse de que Redes sea un objeto para el formulario
            let redesObj = {};
            if (profileData.Redes) {
                redesObj = typeof profileData.Redes === 'string' ? JSON.parse(profileData.Redes) : profileData.Redes;
            }
            setFormData({ ...profileData, Redes: redesObj, Contraseña: '', confirmContraseña: '' });
            setFile(null);
            setValidated(false);
        }
    }, [isOpen, profileData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRedesChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            Redes: { ...prev.Redes, [name]: value }
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

        // Validación de coincidencia de contraseñas
        if (formData.Contraseña && formData.Contraseña !== formData.confirmContraseña) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        // Serializar Redes a string para el backend
        const { confirmContraseña, ...restOfData } = formData;
        const dataToSave = {
            ...restOfData,
            Redes: JSON.stringify(formData.Redes || {})
        };

        // Si la contraseña está vacía, la eliminamos para no sobreescribir con un string vacío
        if (!dataToSave.Contraseña) {
            delete dataToSave.Contraseña;
        }

        onSave(dataToSave, file);
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className='border-bottom border-primary'>
                <Modal.Title><FaEdit className="me-2 text-primary" /> Editar Perfil</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <Alert variant="info" className="py-2 small">
                        Nota: Complete los campos de contraseña solo si desea cambiar su clave actual.
                    </Alert>
                    <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
                    <Row>
                        <Col md={6} className="mb-3">
                            <Form.Label className='small fw-bold'>Nombre *</Form.Label>
                            <Form.Control type="text" name="Nombre" value={formData.Nombre || ''} onChange={handleInputChange} required />
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className='small fw-bold'>Apellido</Form.Label>
                            <Form.Control type="text" name="Apellido" value={formData.Apellido || ''} onChange={handleInputChange} />
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className='small fw-bold'>Cédula *</Form.Label>
                            <Form.Control type="text" name="Cedula" value={formData.Cedula || ''} onChange={handleInputChange} required />
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className='small fw-bold'>Correo *</Form.Label>
                            <Form.Control type="email" name="Correo" value={formData.Correo || ''} onChange={handleInputChange} required />
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className='small fw-bold'>Especialidad</Form.Label>
                            <Form.Control type="text" name="Especialidad" value={formData.Especialidad || ''} onChange={handleInputChange} placeholder="Ej: Odontología Equina" />
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className='small fw-bold'>Foto de Perfil</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Col>
                        <Col md={12} className="mb-3">
                            <Form.Label className='small fw-bold'>Descripción</Form.Label>
                            <Form.Control as="textarea" rows={2} name="Descripcion" value={formData.Descripcion || ''} onChange={handleInputChange} />
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className='small fw-bold'>Nueva Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="Contraseña"
                                value={formData.Contraseña || ''}
                                onChange={handleInputChange}
                                placeholder="Dejar en blanco para no cambiar"
                                minLength={6}
                            />
                        </Col>
                        <Col md={6} className="mb-3">
                            <Form.Label className='small fw-bold'>Confirmar Nueva Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmContraseña"
                                value={formData.confirmContraseña || ''}
                                onChange={handleInputChange}
                                placeholder="Repita la nueva contraseña"
                                isInvalid={formData.Contraseña && formData.Contraseña !== formData.confirmContraseña}
                            />
                            <Form.Control.Feedback type="invalid">
                                Las contraseñas no coinciden.
                            </Form.Control.Feedback>
                        </Col>
                    </Row>

                    <h5 className="border-bottom pb-2 mb-3 mt-3">Redes Sociales</h5>
                    <Row>
                        <Col md={4} className="mb-2">
                            <Form.Label className='small fw-bold'><BsWhatsapp className="me-1 text-success" /> WhatsApp</Form.Label>
                            <Form.Control type="text" name="whatsapp" value={formData.Redes?.whatsapp || ''} onChange={handleRedesChange} />
                        </Col>
                        <Col md={4} className="mb-2">
                            <Form.Label className='small fw-bold'><BsFacebook className="me-1 text-primary" /> Facebook</Form.Label>
                            <Form.Control type="url" name="facebook" value={formData.Redes?.facebook || ''} onChange={handleRedesChange} />
                        </Col>
                        <Col md={4} className="mb-2">
                            <Form.Label className='small fw-bold'><BsInstagram className="me-1 text-danger" /> Instagram</Form.Label>
                            <Form.Control type="url" name="instagram" value={formData.Redes?.instagram || ''} onChange={handleRedesChange} />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" /> Guardar</>}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

// --- Componente Principal Dashboard ---

const VeterinarioDashboard = () => {
    // 1. Estados
    const [veterinarioData, setVeterinarioData] = useState(null);
    const [veterinarioID, setVeterinarioID] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [historyCount, setHistoryCount] = useState(0);
    const [patientCount, setPatientCount] = useState(0);
    const [ownerCount, setOwnerCount] = useState(0);
    const [recentHistories, setRecentHistories] = useState([]);
    const [patients, setPatients] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Helpers
    const getAuthHeader = useCallback(() => {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : null;
    }, []);

    const formatUser = useCallback((user) => {
        if (!user) return null;
        let finalFoto = user.Foto;

        // Manejar el caso de Buffer object (sesiones persistentes o retornos crudos)
        if (finalFoto && typeof finalFoto === 'object' && finalFoto.type === 'Buffer' && Array.isArray(finalFoto.data)) {
            try {
                const uint8Array = new Uint8Array(finalFoto.data);
                let binary = '';
                for (let i = 0; i < uint8Array.length; i++) {
                    binary += String.fromCharCode(uint8Array[i]);
                }
                finalFoto = `data:image/jpeg;base64,${window.btoa(binary)}`;
            } catch (e) {
                console.error("Error converting photo Buffer:", e);
            }
        }

        const redes = typeof user.Redes === 'string' ? JSON.parse(user.Redes || '{}') : (user.Redes || {});
        return { ...user, Foto: finalFoto, Redes: redes };
    }, []);

    // 3. Inicialización
    useEffect(() => {
        const initDashboard = () => {
            const userStorage = localStorage.getItem('veterinario');
            if (!userStorage) return;

            try {
                const userData = JSON.parse(userStorage);
                const rawUser = userData.user?.[0];
                if (rawUser) {
                    const formatted = formatUser(rawUser);
                    setVeterinarioData(formatted);
                    setVeterinarioID(formatted.idVeterinario);
                }
            } catch (e) {
                console.error("Error initializing dashboard session:", e);
            }
        };
        initDashboard();
    }, [formatUser]);

    // 4. Carga de Datos
    const loadDashboardData = useCallback(async () => {
        if (!veterinarioID) return;
        setLoading(true);
        setError(null);
        const token = getAuthHeader();

        try {
            const fetchOpts = { headers: { 'Authorization': token, 'Content-Type': 'application/json' } };

            const [respStats, respPat, respOwn] = await Promise.all([
                fetch(`${API_URL}/dashboard/stats?veterinarioId=${veterinarioID}`, fetchOpts),
                fetch(`${API_URL}/pacientes?veterinarioId=${veterinarioID}`, fetchOpts),
                fetch(`${API_URL}/propietarios`, fetchOpts)
            ]);

            if (!respStats.ok || !respPat.ok || !respOwn.ok) {
                const errData = await respStats.json().catch(() => ({}));
                throw new Error(errData.message || `Error en servidor: ${respStats.status}`);
            }

            const [dataStats, dataPatients, dataOwners] = await Promise.all([
                respStats.json(),
                respPat.json(),
                respOwn.json()
            ]);

            // Actualizar estados con la data recibida
            setHistoryCount(dataStats.historyCount);
            setRecentHistories(dataStats.recentHistories);
            setPatients(dataPatients);
            setPatientCount(dataStats.patientCount); // Usamos el conteo del stats que es exacto para el vet
            setOwners(dataOwners);
            setOwnerCount(dataStats.ownerCount); // Usamos el conteo del stats

        } catch (err) {
            console.error("Error loading dashboard metrics:", err);
            setError(`Error al cargar la información: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [veterinarioID, getAuthHeader]);

    useEffect(() => {
        if (veterinarioID) {
            loadDashboardData();
        }
    }, [veterinarioID, loadDashboardData]);

    // 5. Handlers
    const handleToggleStatus = async () => {
        if (!veterinarioData) return;
        const token = getAuthHeader();
        const nextEstado = veterinarioData.Estado === 'Activo' ? 'Inactivo' : 'Activo';

        try {
            const response = await fetch(`${API_URL}/veterinarios/${veterinarioData.idVeterinario}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...veterinarioData, Estado: nextEstado, Redes: JSON.stringify(veterinarioData.Redes) })
            });

            if (response.ok) {
                const updatedObj = await response.json();
                const finalUser = formatUser(updatedObj);

                // Actualizar local y storage
                const userStorage = JSON.parse(localStorage.getItem('veterinario'));
                localStorage.setItem('veterinario', JSON.stringify({ ...userStorage, user: [finalUser] }));
                setVeterinarioData(finalUser);
            }
        } catch (err) {
            setError("Error al cambiar estado.");
        }
    };

    const handleUpdateProfile = async (formData, file) => {
        const token = getAuthHeader();
        setLoading(true);

        try {
            const dataToSubmit = { ...formData };
            if (file) {
                const base64 = await new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => res(reader.result);
                    reader.onerror = e => rej(e);
                });
                dataToSubmit.Foto = base64;
            }

            const response = await fetch(`${API_URL}/veterinarios/${formData.idVeterinario}`, {
                method: 'PUT',
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSubmit)
            });

            if (!response.ok) throw new Error("Update failed");

            const updatedObj = await response.json();
            const finalUser = formatUser(updatedObj);

            // Update local state and persistence
            const userStorage = JSON.parse(localStorage.getItem('veterinario'));
            localStorage.setItem('veterinario', JSON.stringify({ ...userStorage, user: [finalUser] }));
            setVeterinarioData(finalUser);
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            setError("Error al actualizar el perfil.");
        } finally {
            setLoading(false);
        }
    };

    if (!veterinarioData && !loading) return <Alert variant="danger" className="m-5 text-center">Sesión no encontrada.</Alert>;
    if (loading && !veterinarioData) return <div className="text-center p-5"><Spinner animation="border" /></div>;

    const { Nombre, Apellido, Correo, Foto, Estado, Redes, Especialidad, Cedula } = veterinarioData || {};
    const isActivo = Estado === 'Activo';

    return (
        <Container className="my-5" data-aos="fade-in">
            <h1 className="mb-4 text-primary fw-bold">
                <FaUserMd size={40} className="me-3" /> Dr(a). {Nombre} {Apellido}
            </h1>

            {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}

            <Row>
                <Col lg={4} className="mb-4">
                    <Card className="shadow-lg border-0 h-100" style={{ borderRadius: '20px' }}>
                        <Card.Body className="text-center p-4">
                            <div className="mb-4 position-relative d-inline-block">
                                {Foto ? (
                                    <img src={Foto} alt="Perfil" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '50%', border: '5px solid #0d6efd', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
                                ) : (
                                    <FaUserCircle size={150} className='text-light bg-primary rounded-circle shadow' />
                                )}
                                <Badge bg={isActivo ? 'success' : 'danger'} className="position-absolute bottom-0 end-0 p-2 border border-white rounded-circle" style={{ width: '30px', height: '30px' }}>&nbsp;</Badge>
                            </div>

                            <h3 className="fw-bold mb-1">{Nombre} {Apellido}</h3>
                            <p className="text-primary fw-bold mb-3">{Especialidad || 'Veterinario'}</p>

                            <div className="d-flex flex-column gap-2 mb-4">
                                <Button variant="primary" onClick={() => setShowEditModal(true)}><FaEdit className="me-2" /> Editar Perfil</Button>
                                <Button variant={isActivo ? "outline-danger" : "outline-success"} onClick={handleToggleStatus}>
                                    {isActivo ? <><FaToggleOff className="me-2" /> Desactivar</> : <><FaToggleOn className="me-2" /> Activar</>}
                                </Button>
                            </div>

                            <ListGroup variant="flush" className="text-start mb-4">
                                <ListGroup.Item className="border-0 px-0 small"><FaIdCard className="me-2 text-primary" /> <strong>ID:</strong> {Cedula}</ListGroup.Item>
                                <ListGroup.Item className="border-0 px-0 small"><FaEnvelope className="me-2 text-primary" /> <strong>Email:</strong> {Correo}</ListGroup.Item>
                            </ListGroup>

                            {Redes && (
                                <div className="d-flex justify-content-center gap-3 border-top pt-3">
                                    {Redes.whatsapp && (
                                        <a href={`https://wa.me/${Redes.whatsapp.toString().replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                                            <BsWhatsapp size={22} className="text-success" />
                                        </a>
                                    )}
                                    {Redes.facebook && <a href={Redes.facebook} target="_blank" rel="noreferrer"><BsFacebook size={22} className="text-primary" /></a>}
                                    {Redes.instagram && <a href={Redes.instagram} target="_blank" rel="noreferrer"><BsInstagram size={22} className="text-danger" /></a>}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Row className="mb-4">
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm border-0 text-center p-3 h-100" style={{ borderRadius: '15px' }}>
                                <FaBookMedical size={35} className="text-primary mx-auto mb-2" />
                                <h4 className="fw-bold mb-0">{loading ? '...' : historyCount}</h4>
                                <span className="small text-muted">Historias Clínicas</span>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm border-0 text-center p-3 h-100" style={{ borderRadius: '15px' }}>
                                <FaHorse size={35} className="text-primary mx-auto mb-2" />
                                <h4 className="fw-bold mb-0">{loading ? '...' : patientCount}</h4>
                                <span className="small text-muted">Pacientes</span>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="shadow-sm border-0 text-center p-3 h-100" style={{ borderRadius: '15px' }}>
                                <FaUserTie size={35} className="text-primary mx-auto mb-2" />
                                <h4 className="fw-bold mb-0">{loading ? '...' : ownerCount}</h4>
                                <span className="small text-muted">Propietarios</span>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="shadow-lg border-0" style={{ borderRadius: '20px' }}>
                        <Card.Header className="bg-white border-bottom p-4">
                            <h5 className="mb-0 fw-bold"><FaClock className="me-2 text-primary" /> Historias Recientes</h5>
                        </Card.Header>
                        <ListGroup variant="flush">
                            {recentHistories.length > 0 ? (
                                recentHistories.map(h => {
                                    // Fallback manual si el JOIN falló
                                    const patientFallback = !h.NombrePaciente ? patients.find(p => p.idPaciente === h.Paciente) : null;
                                    const patientName = h.NombrePaciente || (patientFallback ? patientFallback.Nombre : `Paciente #${h.Paciente}`);

                                    const ownerId = h.Propietario || (patientFallback ? patientFallback.Propietario : null);
                                    const ownerFallback = !h.NombrePropietario && ownerId ? owners.find(o => o.idPropietario === ownerId) : null;
                                    const ownerName = h.NombrePropietario
                                        ? `${h.NombrePropietario} ${h.ApellidoPropietario || ''}`
                                        : (ownerFallback ? `${ownerFallback.Nombre} ${ownerFallback.Apellido || ''}` : `Prop. #${ownerId || '?'}`);

                                    return (
                                        <ListGroup.Item key={h.idHistoria_clinica} className="p-4 d-flex justify-content-between align-items-center">
                                            <div>
                                                <h6 className="fw-bold mb-1">
                                                    <span className="text-primary">{patientName}</span>
                                                    <span className="text-muted small ms-2">
                                                        ({ownerName})
                                                    </span>
                                                </h6>
                                                <p className="mb-0 text-muted small">{h.Observaciones?.substring(0, 70)}...</p>
                                            </div>
                                            <Badge bg="primary" style={{ fontSize: '0.8rem' }}>{new Date(h.Fecha).toLocaleDateString()}</Badge>
                                        </ListGroup.Item>
                                    );
                                })
                            ) : (
                                <div className="p-5 text-center text-muted">Aún no has registrado ninguna historia.</div>
                            )}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>

            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                profileData={veterinarioData}
                onSave={handleUpdateProfile}
                loading={loading}
            />
        </Container>
    );
};

export default VeterinarioDashboard;
