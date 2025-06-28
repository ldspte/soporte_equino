import { useState, useEffect } from 'react';
import { Card, Table, Button, Dropdown, Container, Row, Col, InputGroup, Form, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaBell, 
  FaUserPlus, FaUserCircle, FaCog, FaSignOutAlt, FaChartLine, 
  FaClipboardList, FaCalendarAlt, FaSearch, FaFilter, FaCarAlt, 
  FaEdit, FaTrashAlt, FaPlus, FaSave 
} from 'react-icons/fa';
import LayoutBarButton from '../components/LayoutBarButton';
import './Conductores.css';

const Conductores = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historias, setHistorias] = useState([]);
  const [filteredHistorias, setFilteredHistorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [currentHistory, setCurrentHistory] = useState(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  // Estado para el formulario de nuevo conductor
  const [showNewHistoryModal, setShowNewHistoryModal] = useState(false);
  const [newHistory, setNewHistory] = useState({
    Veterinario: '',
    Paciente: '',
    Vacunas: '',
    Enfermedades: '',
    Temperatura: '',
    Pulso: '', Frecuencia_cardiaca: '',
    Llenado_capilar: '',
    Mucosas: '',
    Pulso_digital: '',
    Aspecto: '',
    Locomotor: '',
    Respiratorio: '',
    Circulatorio: '',
    Digestivo: '',
    Genitourinario: '',
    Sis_nervioso: '',
    Oidos: '',
    Ojos: '',
    Glangios_linfaticos: '',
    Piel: '',
    Diagnostico_integral: '',
    Tratamiento: '',
    Prescripcion: '',
    Observaciones: ''
 });
  const [validated, setValidated] = useState(false);
  
  const historiasPorPagina = 8;

  const [historyStep, setHistoryStep] = useState(1);
const totalHistorySteps = 4;

// Funciones para navegación de pasos
const nextHistoryStep = () => {
  if (historyStep < totalHistorySteps) {
    setHistoryStep(historyStep + 1);
  }
};

const prevHistoryStep = () => {
  if (historyStep > 1) {
    setHistoryStep(historyStep - 1);
  }
};

const resetHistoryForm = () => {
  setHistoryStep(1);
  setShowNewHistoryModal(false);
};

  useEffect(() => {
    const fetchHistorias = async () => {
      try {
        // Simulación de llamada API
        const response = await fetch('http://localhost:3001/api/historia_clinica', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const historyData = await response.json();
        console.log(historyData[0]);
        
        setHistorias(historyData[0]);
        setFilteredHistorias(historyData[0]);
      } catch (error) {
        console.error("Error al cargar datos de Historias CLinicas", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistorias();
  }, []);
  
  useEffect(() => {
    // Filtrar conductores según búsqueda y estado
    let filtered = historias;
    
    // Aplicar filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(historia => 
        historia.veterinario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historia.propietario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        historia.paciente?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredHistorias(filtered);
    setCurrentPage(1); // Resetear a primera página al filtrar
  }, [searchTerm, filterStatus, conductores]);
  
  // Formatear fecha a formato español
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Gestionar el cambio de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Calcular índices para paginación
  const indexOfLastHistoria = currentPage * historiasPorPagina;
  const indexOfFirstHistoria = indexOfLastHistoria - historiasPorPagina;
  const currentConductores = filteredHistorias.slice(indexOfFirstHistoria, indexOfLastHistoria);
  
  // Calcular total de páginas
  const totalPages = Math.ceil(filteredHistorias.length / historiasPorPagina);
  
  // Mostrar detalles de conductor
  const handleShowDetails = (driver) => {
    setCurrentDriver(driver);
    setShowModal(true);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewHistory({
      ...newDriver,
      [name]: value
    });
  };

  // Manejar envío del formulario
  const handleSubmitNewHistory = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }



    try {
      const response = await fetch('',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newHistory),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta')
      }

      const data = await response.json()

      const newClinicalHistory = {
        ...newHistory,
        idHistoria_Clinica: data.idHistoria_Clinica || historias.length + 1,
        ultimoReporte: new Date().toISOString(),
      }
      
    } catch (error) {
      
    }
    
    // Aquí iría la lógica para guardar el nuevo conductor
    // Por ahora, simulamos añadirlo a la lista local
    const newDriverWithId = {
      ...newDriver,
      id_conductor: conductores.length + 1, // Generar ID temporal
      ultimoReporte: new Date().toISOString()
    };
    
    setConductores([...conductores, newDriverWithId]);
    
    // Cerrar modal y resetear form
    setShowNewDriverModal(false);
    setNewDriver({
      Veterinario: '',
      Paciente: '',
      Vacunas: '',
      Enfermedades: '',
      Temperatura: '',
      Pulso: '', Frecuencia_cardiaca: '',
      Llenado_capilar: '',
      Mucosas: '',
      Pulso_digital: '',
      Aspecto: '',
      Locomotor: '',
      Respiratorio: '',
      Circulatorio: '',
      Digestivo: '',
      Genitourinario: '',
      Sis_nervioso: '',
      Oidos: '',
      Ojos: '',
      Glangios_linfaticos: '',
      Piel: '',
      Diagnostico_integral: '',
      Tratamiento: '',
      Prescripcion: '',
      Observaciones: ''
    });
    setValidated(false);
  };
  
  // Componente de Paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination-container d-flex justify-content-between align-items-center mt-3">
        <div className="showing-entries">
          Mostrando {indexOfFirstConductor + 1} a {Math.min(indexOfLastConductor, filteredConductores.length)} de {filteredConductores.length} registros
        </div>
        <ul className="pagination mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <a className="page-link" href="#!" onClick={() => handlePageChange(Math.max(1, currentPage - 1))}>
              Anterior
            </a>
          </li>
          {[...Array(totalPages)].map((_, i) => (
            <li key={i} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
              <a className="page-link" href="#!" onClick={() => handlePageChange(i + 1)}>
                {i + 1}
              </a>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <a className="page-link" href="#!" onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}>
              Siguiente
            </a>
          </li>
        </ul>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-grow text-warning" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p>Cargando conductores...</p>
      </div>
    );
  }
  
  const conductoresContent = (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gestión de Historias Clinicas</h1>
        <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewDriverModal(true)}
        >
          <FaPlus className="me-2" /> Nueva Historia Clinica
        </Button>
      </div>
      
      {/* Filtros y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={8}>
              <InputGroup>
                <InputGroup.Text id="basic-addon1" className="bg-warning text-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por nombre o propietario "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} lg={4} className="mt-3 mt-md-0">
              <InputGroup>
                <InputGroup.Text id="filter-addon" className="bg-warning text-white">
                  <FaFilter />
                </InputGroup.Text>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="En ruta">En ruta</option>
                  <option value="Descanso">Descanso</option>
                  <option value="Inactivo">Inactivo</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Listado de conductores */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUsers className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Historias Clnicas</h5>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="conductores-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cédula</th>
                  <th>Vehículo</th>
                  <th>Ciudad</th>
                  <th>Estado</th>
                  <th>Calificación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentConductores.map(conductor => (
                  <tr key={conductor.id_conductor}>
                    <td>{conductor.nombre_conductor}</td>
                    <td>{conductor.documento}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaCarAlt className="me-2 text-warning" />
                        {conductor.vehiculoAsignado}
                      </div>
                    </td>
                    <td>{conductor.ciudad}</td>
                    <td>
                      <EstadoBadge estado={conductor.estado} />
                    </td>
                    <td>
                      <div className="rating">
                        <span className="rating-value">{conductor.calificacion}</span>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i}
                              className={`star ${i < Math.floor(conductor.calificacion) ? 'filled' : ''}`}
                            >★</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleShowDetails(conductor)}
                        >
                          Ver
                        </Button>
                        <Button variant="outline-warning" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                        <Button variant="outline-danger" size="sm">
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {filteredConductores.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron conductores con los criterios de búsqueda.</p>
            </div>
          )}
          
          {/* Paginación */}
          {renderPagination()}
        </Card.Body>
      </Card>
      
      {/* Modal de detalles del conductor */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>Detalles de Historia Clnica</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDriver && (
            <div className="driver-detail">
              <Row>
                <Col md={4} className="text-center mb-4 mb-md-0">
                  <div className="driver-avatar mb-3">
                    <FaUserCircle size={100} className="text-warning" />
                  </div>
                  <h4>{currentDriver.nombre_conductor}</h4>
                  <p className="mb-1">
                    <EstadoBadge estado={currentDriver.estado} />
                  </p>
                  <p className="text-muted">
                    <FaIdCard className="me-2" />
                    {currentDriver.documento}
                  </p>
                  <p className="text-muted">
                    {currentDriver.tipo_documento}
                  </p>
                </Col>
                <Col md={8}>
                  <h5 className="mb-3">Información de Contacto</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Teléfono:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaPhone className="me-2 text-warning" />
                        {currentDriver.telefono}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Email:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaEnvelope className="me-2 text-warning" />
                        {currentDriver.correo_conductor}
                      </p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Ciudad:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaMapMarkerAlt className="me-2 text-warning" />
                        {currentDriver.ciudad}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Licencia:</strong></p>
                      <p className="d-flex align-items-center">
                        <Badge bg="warning" className="me-2">
                          {currentDriver.tipo_licencia}
                        </Badge>
                      </p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Información Laboral</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Experiencia:</strong></p>
                      <p>{formatDate(currentDriver.experiencia)}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Último Reporte:</strong></p>
                      <p>{formatDate(currentDriver.ultimoReporte)}</p>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Licencia:</strong></p>
                      <p>{formatDate(currentDriver.tipo_licencia)}</p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Fecha de vencimiento:</strong></p>
                      <p>{formatDate(currentDriver.fecha_vencimiento)}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Vehículo</h5>
                  <Row className="mb-3">
                    <Col sm={6}>
                      <p className="mb-1"><strong>Placa:</strong></p>
                      <p className="d-flex align-items-center">
                        <FaCarAlt className="me-2 text-warning" />
                        {currentDriver.vehiculoAsignado}
                      </p>
                    </Col>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Modelo:</strong></p>
                      <p>{currentDriver.modeloVehiculo}</p>
                    </Col>
                  </Row>
                  
                  <h5 className="mb-3 mt-4">Estadísticas</h5>
                  <Row>
                    <Col sm={6}>
                      <p className="mb-1"><strong>Viajes Completados:</strong></p>
                      <h3 className="text-warning">{currentDriver.viajesCompletados}</h3>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal para crear nuevo conductor */}
      <Modal
        show={showNewDriverModal}
        onHide={() => setShowNewDriverModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewDriver}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaUserPlus className="me-2 text-warning" />
              Registrar Nueva Historia Clinica
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-driver-form">
              {/* Información personal */}
              <h5 className="border-bottom pb-2 mb-3">Información Personal</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Documento</Form.Label>
                    <Form.Select
                      name="tipo_documento"
                      value={newDriver.tipo_documento}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PAS">Pasaporte</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de documento
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número de Documento</Form.Label>
                    <Form.Control
                      type="text"
                      name="documento"
                      value={newDriver.documento}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      El número de documento es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre_conductor"
                      value={newDriver.nombre_conductor}
                      onChange={handleInputChange}
                      required
                      maxLength={45}
                    />
                    <Form.Control.Feedback type="invalid">
                      El nombre es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido</Form.Label>
                    <Form.Control
                      type="text"
                      name="apellido_conductor"
                      value={newDriver.apellido_conductor}
                      onChange={handleInputChange}
                      required
                      maxLength={45}
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo Electrónico</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaEnvelope />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="correo_conductor"
                        value={newDriver.correo_conductor}
                        onChange={handleInputChange}
                        required
                        maxLength={45}
                      />
                      <Form.Control.Feedback type="invalid">
                        Ingrese un correo electrónico válido
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaPhone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={newDriver.telefono}
                        onChange={handleInputChange}
                        required
                        maxLength={45}
                      />
                      <Form.Control.Feedback type="invalid">
                        El teléfono es obligatorio
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>URL de Foto</Form.Label>
                    <Form.Control
                      type="text"
                      name="foto"
                      value={newDriver.foto}
                      onChange={handleInputChange}
                      maxLength={200}
                    />
                    <Form.Text className="text-muted">
                      Opcional: URL de la imagen del conductor
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Dirección y ubicación */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Ubicación</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ciudad</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaMapMarkerAlt />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="ciudad"
                        value={newDriver.ciudad}
                        onChange={handleInputChange}
                        required
                        maxLength={100}
                      />
                      <Form.Control.Feedback type="invalid">
                        La ciudad es obligatoria
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección</Form.Label>
                    <Form.Control
                      type="text"
                      name="direccion"
                      value={newDriver.direccion}
                      onChange={handleInputChange}
                      required
                      maxLength={250}
                    />
                    <Form.Control.Feedback type="invalid">
                      La dirección es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Información de licencia */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Licencia</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipo de Licencia</Form.Label>
                    <Form.Select
                      name="tipo_licencia"
                      value={newDriver.tipo_licencia}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="A1">A1 - Motocicletas</option>
                      <option value="A2">A2 - Motocicletas, motocarros, cuatrimotos</option>
                      <option value="B1">B1 - Automóviles, camionetas</option>
                      <option value="B2">B2 - Camiones rígidos, buses</option>
                      <option value="B3">B3 - Vehículos articulados</option>
                      <option value="C1">C1 - Automóviles, camionetas servicio público</option>
                      <option value="C2">C2 - Camiones rígidos, buses servicio público</option>
                      <option value="C3">C3 - Vehículos articulados servicio público</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      Seleccione un tipo de licencia
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Vencimiento</Form.Label>
                    <Form.Control
                      type="date"
                      name="fecha_vencimiento"
                      value={newDriver.fecha_vencimiento}
                      onChange={handleInputChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      La fecha de vencimiento es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Años de Experiencia</Form.Label>
                    <Form.Control
                      type="number"
                      name="experiencia"
                      value={newDriver.experiencia}
                      onChange={handleInputChange}
                      min="0"
                      max="50"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Información de cuenta */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Cuenta</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      name="contraseña"
                      value={newDriver.contraseña}
                      onChange={handleInputChange}
                      required
                      maxLength={250}
                    />
                    <Form.Control.Feedback type="invalid">
                      La contraseña es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      name="estado"
                      value={newDriver.estado}
                      onChange={handleInputChange}
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                      <option value="En ruta">En ruta</option>
                      <option value="Descanso">Descanso</option>
                      <option value="Entrenamiento">Entrenamiento</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Información de vehículo */}
              <h5 className="border-bottom pb-2 mb-3 mt-4">Información de Vehículo</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Placa del Vehículo</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-warning text-white">
                        <FaCarAlt />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="vehiculoAsignado"
                        value={newDriver.vehiculoAsignado}
                        onChange={handleInputChange}
                        placeholder="Ej: ABC123"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Modelo del Vehículo</Form.Label>
                    <Form.Control
                      type="text"
                      name="modeloVehiculo"
                      value={newDriver.modeloVehiculo}
                      onChange={handleInputChange}
                      placeholder="Ej: Toyota Corolla 2023"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewDriverModal(false)}>
              Cancelar
            </Button>
            <Button variant="warning" type="submit">
              <FaSave className="me-2" /> Guardar Conductor
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
    </>
  );

  return (
    <LayoutBarButton userData={userData}>
      {conductoresContent}
    </LayoutBarButton>
  );
};

export default Conductores;