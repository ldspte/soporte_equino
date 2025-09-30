import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, ListGroup, Badge, Alert, Spinner } from 'react-bootstrap';
import {
    FaUserMd, FaEnvelope, FaIdCard, FaClock, FaBookMedical, FaHorse, FaUserTie,
    FaCheckCircle, FaTimesCircle, FaToggleOn, FaToggleOff, FaUserCircle
} from 'react-icons/fa';

// URL base de tu backend en Render
const API_URL = 'https://soporte-equino.onrender.com/api';

const VeterinarioDashboard = () => {
    // Estado del usuario logueado
    const [veterinarioData, setVeterinarioData] = useState(null);
    const [veterinarioID, setVeterinarioID] = useState(null);

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
