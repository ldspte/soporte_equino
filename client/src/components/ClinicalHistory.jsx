import {useState, useEffect, useCallback} from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge, Alert } from 'react-bootstrap';
import {
  FaIdCard, FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus, 
  FaSave, FaCalendarPlus, FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaCarSide, FaCamera, FaUser, FaHome, FaCalendarAlt, FaClock, FaTimes,
  FaCheckCircle, FaSpinner, FaBookMedical, FaHorse, FaClipboardList
} from 'react-icons/fa'

function ClinicalHistory() {
    const [clinicals, setClinical] = useState([]);
    const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

    // EStado Modales
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [showNewClinicalModal, setShowNewClinicalModal] = useState(false);
  const [showEditClinicalModal, setShowEditClinicalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


    // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  
  // Estados para Historias Clinicas 
  const [currentClinical, setCurrentClinical] = useState(null);
  const [clinicalToDelete, setClinicalToDelete] = useState(null);

   const initialCLinicalState = {
    veterinario: '',
    paciente: '',
    vacunas: '',
    enfermedades: '',
    temperatura: '',
    pulso: '',
    frecuencia_cardiaca: '',
    llenado_capilar: '',
    mucosas: '',
    pulso_digital: '',
    aspecto: '',
    locomotor: '',
    respiratorio: '',
    circulatorio: '',
    digestivo: '',
    genitourinario: '',
    sis_nervioso: '',
    oidos: '',
    glangios_linfaticos: '',
    piel: '',
    diagnostico_integral: '',
    tratamiento: '',
    prescripcion: '',
    observaciones: ''
  }

  const normalizeClinicalData = useCallback((clinical) => {
    return{
    veterinario: clinical.veterinario  || '',
    paciente: clinical.paciente  || '',
    vacunas: clinical.vacunas  || '',
    enfermedades: clinical.enfermedades  || '',
    temperatura: clinical.temperatura  || '',
    pulso: clinical.piel  || '',
    frecuencia_cardiaca: clinical.frecuencia_cardiaca  || '',
    llenado_capilar: clinical.llenado_capilar  || '',
    mucosas: clinical.mucosas  || '',
    pulso_digital: clinical.pulso_digital  || '',
    aspecto: clinical.aspecto  || '',
    locomotor: clinical.locomotor  || '',
    respiratorio: clinical.respiratorio  || '',
    circulatorio: clinical.circulatorio  || '',
    digestivo: clinical.digestivo  || '',
    genitourinario: clinical.genitourinario  || '',
    sis_nervioso: clinical.sis_nervioso  || '',
    oidos: clinical.oidos  || '',
    glangios_linfaticos: clinical.glangios_linfaticos  || '',
    piel: clinical.piel  || '',
    diagnostico_integral: clinical.diagnostico_integral  || '',
    tratamiento: clinical.tratamiento  || '',
    prescripcion: clinical.prescripcion  || '',
    observaciones: clinical.observaciones  || ''
  };
}, []);


    const [newClinical, setNewClinical] = useState(initialCLinicalState);
  const [editClinical, setEditClinical] = useState(initialCLinicalState);

  // Estados para alertas y mensajes de éxito
  const [showSendingAlert, setShowSendingAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');


  useEffect(() => {
      const fetchData = () => {
        const userStorage = localStorage.getItem('veterinario');
        if (userStorage) {
          setUser(JSON.parse(userStorage));
        }
      };
      fetchData();
    }, []);

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem('token');
        console.log(token ? `Bearer ${token}` : "XXXX")
        return token ? `Bearer ${token}` : null;
    }, []);

    //Obtener historias clinicas
    const fetchClinical = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            if (!token) {
              setError('No hay token de autenticación');
              setLoading(false);
              return;
            }
            const response = await fetch('http://localhost:3001/api/clinical_history',
            {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok){
                const errorText = await response.text();
                if (response.status === 401 || response.status === 403){
                    localStorage.removeItem('token');
                    setError('Sesion expirada. Por favor, inicie sesión nuevamente');
                    return;
                }
                throw new Error(errorText || 'Error al obtener las historias clinicas')
            }

            const data = await response.json();
            const processedData = Array.isArray(data) ? data.map(normalizeClinicalData) : [normalizeClinicalData(data)];

            if (!processedData.length){
                setError('No se encontraron Historias Clinicas');
            }

            setClinical(processedData);

        } catch (error) {
            console.error('Error encontrando Historias Clinicas: ', error);
            setError(`Error al cargar Historias Clinicas:  ${error.message}`);
            setClinical([]);
        } finally{
            setLoading(false);
        }

    }, [getAuthToken, normalizeClinicalData])

 

  // crear Historia clinica

  const handleSubmitNewHistory = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const token = getAuthToken();

    if(!token) {
        setError('No hay token de autenticacion');
        return;
    }

    if (form.checkValidity() === false){
        e.stopPropagation();
        setValidated(true);
        return;
    }

    try {
      setIsUpdating(true);
      if(!newClinical.veterinario || !newClinical.paciente){
          alert('Por favor llena todos los campos');
          return;
      }

      //Preparar Payload
      const payload = {
        ...newClinical,
        veterinario: newClinical.veterinario,
        paciente: newClinical.paciente,
        vacunas: newClinical.vacunas,
        enfermedades: newClinical.enfermedades,
        temperatura: newClinical.temperatura,
        pulso: newClinical.pulso,
        frecuencia_cardiaca: newClinical.frecuencia_cardiaca,
        llenado_capilar: newClinical.llenado_capilar,
        mucosas: newClinical.mucosas,
        pulso_digital: newClinical.pulso_digital,
        aspecto: newClinical.aspecto,
        locomotor: newClinical.locomotor,
        respiratorio: newClinical.respiratorio,
        circulatorio: newClinical.circulatorio,
        digestivo: newClinical.digestivo,
        genitourinario: newClinical.genitourinario,
        sis_nervioso: newClinical.sis_nervioso,
        oidos: newClinical.oidos,
        glangios_linfaticos: newClinical.glangios_linfaticos,
        piel: newClinical.piel,
        diagnostico_integral: newClinical.diagnostico_integral,
        tratamiento: newClinical.tratamiento,
        prescripcion: newClinical.prescripcion,
        observaciones: newClinical.observaciones
      };

      const response = await fetch('http://localhost:3001/api/clinical_history',
        {
          method: 'POST',
          headers:{
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      )

      if(!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();

      setShowNewClinicalModal(false);
      setSuccessMessage('¡Historia clinica Creada!');
      setShowSuccessModal(true);

      setTimeout(() => setShowSuccessModal(false), 3000);

      setClinical(prevClinicals => [normalizeClinicalData(data.clinical || data), ...prevClinicals]);
      setNewClinical(initialCLinicalState);
      setValidated(false);

    } catch (error) {
      console.error('Error: ', error);
      alert(`Hubo un error al crear la historia clinica: ${error.message}`);
    } finally{
      setIsUpdating(false);
    }
    fetchClinical();
  }


  //Actualizar Historia Clinica
  const updateClinical = useCallback(async (idHistoria_clinica, clinicalData) => {
    try{
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/clinical_history/${idHistoria_clinica}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clinicalData)
      });

      if(!response.ok){
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar Historia clinica.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating History: ', error.message);
      throw error;
    }
  }, [getAuthToken]);

  //Eliminar Historia Clinica

  const deleteHistory = useCallback(async (idHistoria_clinica) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/clinical_history/${idHistoria_clinica}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if(!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar la historia clinica');
      }
      return true;

    } catch (error) {
      console.error('Error deleting History: ', error);
      throw error;
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchClinical();
  }, [fetchClinical]);

  //HANDLERS 

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setNewClinical(prev => ({...prev, [name]: value}));
  };

  const handleEditInputChange = (e) => {
    const {name, value} = e.target;
    setEditClinical(prev => ({...prev, [name]: value}))
  };


  //Handler para mostrar detalles de la historia
  const handleShowDetails = useCallback((history) => {
    if (!clinical) {
      setError('Historia Clinica Invalida');
      return;
    }

    setCurrentClinical(normalizeClinicalData(clinical));
    setShowClinicalModal(true);
    setError(null)
  }, [normalizeClinicalData]);

  //Handler para editar Historia
  const handleEditClinical = useCallback((clinical) => {
    if(!clinical) {
      setError('Historia clinica invalida para editar');
      return;
    }

    setShowClinicalModal(false);
    setEditClinical(normalizeClinicalData(clinical));
    setShowEditClinicalModal(true);
    setEditValidated(false);
    setError(null);
  }, [normalizeClinicalData]);

  //Handler para eliminar Historia Clinica
  const handleDeleteClinical = useCallback((idHistoria_clinica) => {
    const history = clinicals.find(c => c.idHistoria_clinica === idHistoria_clinica);
    if(history){
      setClinicalToDelete(history);
      setShowDeleteModal(true);
    }
  }, [clinicals]);

  //Handler para enviar edicion de Historia Clinica
  const handleSubmitEditClinical = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setEditValidated(true);
      return;
    }
    try {
      setLoading(true);
      const {idHistoria_clinica, ...clinicalData} = editClinical;
      await updateClinical(idHistoria_clinica, driverData);
      await fetchClinical();
      setShowEditClinicalModal(false);
      setEditValidated(false);
      setError(null);

      //Modales de Exito

      setSuccessMessage('Historia clinica Actualizada Exitosamente!');
      setSuccessSubMessage('Los cambios han sido guardados correctamente');
      setShowEditSuccessModal(true);

      //ocultar modales

      setTimeout(() => setShowEditSuccessModal(false), 3000);
    } catch (error) {
      setError(`Error al actualizar Historia Clinica: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Confirmar eliminacion de Historia Clinica
  const confirmDeleteClinical = async() => {
    if(!clinicalToDelete) return;

    try {
      setLoading(true);
      await deleteHistory(clinicalToDelete.idHistoria_clinica);
      await fetchClinical();
      setShowDeleteModal(false);
      setClinicalToDelete(null);
      setError(null);

      //Mostrar modal de exito
      setSuccessMessage('Historia Clinica Eliminada exitosamente!');
      setSuccessSubMessage('La historia clinica fue removida del sistema con exito');
      setShowDeleteSuccessModal(true);

      setTimeout(() => setShowDeleteSuccessModal(false), 3000);
    } catch (error) {
      setError(`Error al Eliminar la Historia Clinica: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar Historias Clinicas
  const filteredClinicals = clinicals.filter((clinical) => {
    if(!clinical?.idHistoria_clinica) return false;
    const searchLower = searchTerm.toLowerCase();
    return(
      (clinical.veterinario?.toLowerCase() || '').includes(searchLower) || (clinical.paciente?.toLowerCase() || '').includes(searchLower) || (clinical.propietario?.toLowerCase() || '').includes(searchLower)
    )
  })



  return (
    
    <div>
      <div className='page-header d-flex justify-content-between align-items-center mt-4 mb-4'>
      <h1>Mis Historias Clinicas</h1>
      <Button 
          variant="warning" 
          className="d-flex align-items-center"
          onClick={() => setShowNewClinicalModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> Nuevo Conductor
        </Button>
      </div>
    {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
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
                  placeholder="Buscar por documento, nombre, apellido, municipio o email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* listado historias clinicas */}
      <Card>
        <Card.header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaBookMedical className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Historias Clinicas</h5>
            </div>
            <small className="text-muted">
              {filteredDrivers.length} Historia(s) encontrada(s)
            </small>  
          </div>
        </Card.header>

        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ): (
            <div className='table-responsive'>
              <Table hover className='historias-table'>
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Propietario</th>
                    <th>Observaciones</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClinicals.map((clinical) => (
                    <tr key= {clinical.idHistoria_clinica}>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaHorse className= 'me-2 text-warning'/>
                          {clinical.paciente}
                        </div>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaUserCircle className= 'me-2 text-warning'/>
                          {clinical.propietario}
                        </div>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaClipboardList className= 'me-2 text-warning'/>
                          {clinical.observaciones}
                        </div>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaCalendarAlt className= 'me-2 text-warning'/>
                          {clinical.fecha}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleShowDetails(clinical)}
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-1"
                            onClick={() => handleEditClinical(clinical)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteClinical(clinical.idHistoria_clinica)}
                            disabled={loading}
                          >
                            <FaTrashAlt />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          {!loading && filteredClinicals.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron historias clinicas con los criterios de búsqueda.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal Detalles Historia Clinica */}
      <Modal
        show={showDriverModal} 
        onHide={() => setShowDriverModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className='border-bottom border-warning'>
          <Modal.Title>
            <FaBookMedical className="me-2 text-warning" />
            Detalles Historia Clinica
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentClinical && (
            <div className="clinical-detail">
              <h5 className='border-bottom pb-2 mb-3'>Infromacion Basica</h5>
              <Col md={8}>
                <Row>
                  <Col sm={6}>
                      <p className='mb-1'><strong>Veterinario</strong></p>
                      <p>
                        <Badge bg="info" className='fs-6'>
                          {currentClinical.veterinario}
                        </Badge>
                      </p>
                  </Col>
                  <Col sm={6}>
                      <p className='mb-1'><strong>Propietario</strong></p>
                      <p className='d-flex align-items-center'>
                        <FaUserCircle className="me-2 text-warning"/>
                        {currentClinical.propietario}
                      </p>
                  </Col>
                  <Col sm={6}>
                      <p className='mb-1'><strong>Paciente</strong></p>
                      <p className='d-flex align-items-center'>
                        <FaHorse className="me-2 text-warning"/>
                        {currentClinical.paciente}
                      </p>
                  </Col>
                </Row>
              </Col>

              <h5>Examen Fisico</h5>
              <Row className='mb-4'>
                <Col sm={6}>
                  <p><strong>Vacunas:</strong></p>
                  <p>{currentClinical.vacunas}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Enfermedades:</strong></p>
                  <p>{currentClinical.enfermedades}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Temperatura:</strong></p>
                  <p>{currentClinical.temperatura}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Pulso:</strong></p>
                  <p>{currentClinical.pulso}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Frecuencia cardiaca:</strong></p>
                  <p>{currentClinical.frecuencia_cardiaca}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Tiempo de llenado capilar:</strong></p>
                  <p>{currentClinical.llenado_capilar}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Mucosas</strong></p>
                  <p>{currentClinical.mucosas}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Pulso digital:</strong></p>
                  <p>{currentClinical.pulso_digital}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aspecto general:</strong></p>
                  <p>{currentClinical.aspecto}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato locomotor</strong></p>
                  <p>{currentClinical.locomotor}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato respiratorio:</strong></p>
                  <p>{currentClinical.respiratorio}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato circulatorio</strong></p>
                  <p>{currentClinical.circulatorio}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato digestivo</strong></p>
                  <p>{currentClinical.digestivo}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato genitourinario</strong></p>
                  <p>{currentClinical.genitourinario}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Sistema Nervioso</strong></p>
                  <p>{currentClinical.sis_nervioso}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Oidos:</strong></p>
                  <p>{currentClinical.oidos}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Glanglios linfaticos</strong></p>
                  <p>{currentClinical.glangios_linfaticos}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Piel</strong></p>
                  <p>{currentClinical.piel}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Diagnostico integral</strong></p>
                  <p>{currentClinical.diagnostico_integral}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Tratamiento:</strong></p>
                  <p>{currentClinical.tratamiento}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Prescripcion:</strong></p>
                  <p>{currentClinical.prescripcion}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Observaciones:</strong></p>
                  <p>{currentClinical.observaciones}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Fecha Historia Clinica</strong></p>
                  <p className="d-flex align-items-center">
                    <FaCalendarPlus className="me-2 text-warning" />
                    {currentClinical.fecha ? 
                      new Date(currentClinical.fecha).toLocaleDateString('es-CO') : 
                      'No disponible'
                    }
                  </p>
                </Col>
              </Row>

            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClinicalModal(false)}>
            <FaTimes className="me-2" />
            Cerrar
          </Button>
          <Button variant="warning" onClick={() => handleEditClinical(currentClinical)}>
            <FaEdit className="me-2" /> 
            Editar Información
          </Button>
        </Modal.Footer>
      </Modal>
      
     {/* Modal Crear Historia Clinica */}
<Modal
  show={showCreateClinicalModal} 
  onHide={() => setShowCreateClinicalModal(false)}
  size="lg"
  centered
>
  <Modal.Header closeButton className='border-bottom border-warning'>
    <Modal.Title>
      <FaBookMedical className="me-2 text-warning" />
      Crear Historia Clinica
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form noValidate validated={validated} onSubmit={handleCreateClinical}>
      <h5 className='border-bottom pb-2 mb-3'>Información Básica</h5>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formVeterinario">
            <Form.Label>Veterinario *</Form.Label>
            <Form.Control
              type="text"
              name="veterinario"
              value={newClinical.veterinario}
              onChange={handleInputChange}
              required
              placeholder="Nombre del veterinario"
            />
            <Form.Control.Feedback type="invalid">
              El veterinario es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPropietario">
            <Form.Label>Propietario *</Form.Label>
            <Form.Control
              type="text"
              name="propietario"
              value={newClinical.propietario}
              onChange={handleInputChange}
              required
              placeholder="Nombre del propietario"
            />
            <Form.Control.Feedback type="invalid">
              El propietario es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPaciente">
            <Form.Label>Paciente *</Form.Label>
            <Form.Control
              type="text"
              name="paciente"
              value={newClinical.paciente}
              onChange={handleInputChange}
              required
              placeholder="Nombre del paciente"
            />
            <Form.Control.Feedback type="invalid">
              El paciente es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <h5 className='mt-4'>Examen Físico</h5>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formVacunas">
            <Form.Label>Vacunas *</Form.Label>
            <Form.Control
              type="text"
              name="vacunas"
              value={newClinical.vacunas}
              onChange={handleInputChange}
              required
              placeholder="Vacunas administradas"
            />
            <Form.Control.Feedback type="invalid">
              Las vacunas son obligatorias
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formEnfermedades">
            <Form.Label>Enfermedades *</Form.Label>
            <Form.Control
              type="text"
              name="enfermedades"
              value={newClinical.enfermedades}
              onChange={handleInputChange}
              required
              placeholder="Enfermedades conocidas"
            />
            <Form.Control.Feedback type="invalid">
              Las enfermedades son obligatorias
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formTemperatura">
            <Form.Label>Temperatura *</Form.Label>
            <Form.Control
              type="text"
              name="temperatura"
              value={newClinical.temperatura}
              onChange={handleInputChange}
              required
              placeholder="Temperatura (°C)"
            />
            <Form.Control.Feedback type="invalid">
              La temperatura es obligatoria
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPulso">
            <Form.Label>Pulso *</Form.Label>
            <Form.Control
              type="text"
              name="pulso"
              value={newClinical.pulso}
              onChange={handleInputChange}
              required
              placeholder="Pulso (latidos/minuto)"
            />
            <Form.Control.Feedback type="invalid">
              El pulso es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formFrecuenciaCardiaca">
            <Form.Label>Frecuencia cardiaca *</Form.Label>
            <Form.Control
              type="text"
              name="frecuencia_cardiaca"
              value={newClinical.frecuencia_cardiaca}
              onChange={handleInputChange}
              required
              placeholder="Frecuencia cardiaca"
            />
            <Form.Control.Feedback type="invalid">
              La frecuencia cardiaca es obligatoria
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formLlenadoCapilar">
            <Form.Label>Tiempo de llenado capilar *</Form.Label>
            <Form.Control
              type="text"
              name="llenado_capilar"
              value={newClinical.llenado_capilar}
              onChange={handleInputChange}
              required
              placeholder="Tiempo de llenado capilar"
            />
            <Form.Control.Feedback type="invalid">
              El tiempo de llenado capilar es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formMucosas">
            <Form.Label>Mucosas *</Form.Label>
            <Form.Control
              type="text"
              name="mucosas"
              value={newClinical.mucosas}
              onChange={handleInputChange}
              required
              placeholder="Estado de las mucosas"
            />
            <Form.Control.Feedback type="invalid">
              El estado de las mucosas es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPulsoDigital">
            <Form.Label>Pulso digital *</Form.Label>
            <Form.Control
              type="text"
              name="pulso_digital"
              value={newClinical.pulso_digital}
              onChange={handleInputChange}
              required
              placeholder="Estado del pulso digital"
            />
            <Form.Control.Feedback type="invalid">
              El estado del pulso digital es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formAspecto">
            <Form.Label>Aspecto general *</Form.Label>
            <Form.Control
              type="text"
              name="aspecto"
              value={newClinical.aspecto}
              onChange={handleInputChange}
              required
              placeholder="Descripción del aspecto"
            />
            <Form.Control.Feedback type="invalid">
              La descripción del aspecto es obligatoria
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formLocomotor">
            <Form.Label>Aparato locomotor *</Form.Label>
            <Form.Control
              type="text"
              name="locomotor"
              value={newClinical.locomotor}
              onChange={handleInputChange}
              required
              placeholder="Estado del aparato locomotor"
            />
            <Form.Control.Feedback type="invalid">
              El estado del aparato locomotor es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formRespiratorio">
            <Form.Label>Aparato respiratorio *</Form.Label>
            <Form.Control
              type="text"
              name="respiratorio"
              value={newClinical.respiratorio}
              onChange={handleInputChange}
              required
              placeholder="Estado del aparato respiratorio"
            />
            <Form.Control.Feedback type="invalid">
              El estado del aparato respiratorio es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formCirculatorio">
            <Form.Label>Aparato circulatorio *</Form.Label>
            <Form.Control
              type="text"
              name="circulatorio"
              value={newClinical.circulatorio}
              onChange={handleInputChange}
              required
              placeholder="Estado del aparato circulatorio"
            />
            <Form.Control.Feedback type="invalid">
              El estado del aparato circulatorio es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formDigestivo">
            <Form.Label>Aparato digestivo *</Form.Label>
            <Form.Control
              type="text"
              name="digestivo"
              value={newClinical.digestivo}
              onChange={handleInputChange}
              required
              placeholder="Estado del aparato digestivo"
            />
            <Form.Control.Feedback type="invalid">
              El estado del aparato digestivo es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formGenitourinario">
            <Form.Label>Aparato genitourinario *</Form.Label>
            <Form.Control
              type="text"
              name="genitourinario"
              value={newClinical.genitourinario}
              onChange={handleInputChange}
              required
              placeholder="Estado del aparato genitourinario"
            />
            <Form.Control.Feedback type="invalid">
              El estado del aparato genitourinario es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formSisNervioso">
            <Form.Label>Sistema Nervioso *</Form.Label>
            <Form.Control
              type="text"
              name="sis_nervioso"
              value={newClinical.sis_nervioso}
              onChange={handleInputChange}
              required
              placeholder="Estado del sistema nervioso"
            />
            <Form.Control.Feedback type="invalid">
              El estado del sistema nervioso es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formOidos">
            <Form.Label>Oídos *</Form.Label>
            <Form.Control
              type="text"
              name="oidos"
              value={newClinical.oidos}
              onChange={handleInputChange}
              required
              placeholder="Estado de los oídos"
            />
            <Form.Control.Feedback type="invalid">
              El estado de los oídos es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formGlandiosLinfaticos">
            <Form.Label>Glándios linfáticos *</Form.Label>
            <Form.Control
              type="text"
              name="glangios_linfaticos"
              value={newClinical.glangios_linfaticos}
              onChange={handleInputChange}
              required
              placeholder="Estado de los glándios linfáticos"
            />
            <Form.Control.Feedback type="invalid">
              El estado de los glándios linfáticos es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPiel">
            <Form.Label>Piel *</Form.Label>
            <Form.Control
              type="text"
              name="piel"
              value={newClinical.piel}
              onChange={handleInputChange}
              required
              placeholder="Estado de la piel"
            />
            <Form.Control.Feedback type="invalid">
              El estado de la piel es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formDiagnosticoIntegral">
            <Form.Label>Diagnóstico integral *</Form.Label>
            <Form.Control
              type="text"
              name="diagnostico_integral"
              value={newClinical.diagnostico_integral}
              onChange={handleInputChange}
              required
              placeholder="Diagnóstico integral"
            />
            <Form.Control.Feedback type="invalid">
              El diagnóstico integral es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formTratamiento">
            <Form.Label>Tratamiento *</Form.Label>
            <Form.Control
              type="text"
              name="tratamiento"
              value={newClinical.tratamiento}
              onChange={handleInputChange}
              required
              placeholder="Tratamiento recomendado"
            />
            <Form.Control.Feedback type="invalid">
              El tratamiento es obligatorio
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formPrescripcion">
            <Form.Label>Prescripción *</Form.Label>
            <Form.Control
              type="text"
              name="prescripcion"
              value={newClinical.prescripcion}
              onChange={handleInputChange}
              required
              placeholder="Prescripción médica"
            />
            <Form.Control.Feedback type="invalid">
              La prescripción es obligatoria
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formObservaciones">
            <Form.Label>Observaciones *</Form.Label>
            <Form.Control
              type="text"
              name="observaciones"
              value={newClinical.observaciones}
              onChange={handleInputChange}
              required
              placeholder="Observaciones adicionales"
            />
            <Form.Control.Feedback type="invalid">
              Las observaciones son obligatorias
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3" controlId="formFecha">
            <Form.Label>Fecha Historia Clínica *</Form.Label>
            <Form.Control
              type="date"
              name="fecha"
              value={newClinical.fecha}
              onChange={handleInputChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              La fecha es obligatoria
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Button type="submit" variant="warning">
        <FaPlus className="me-2" /> 
        Crear Historia Clínica
      </Button>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowCreateClinicalModal(false)}>
      <FaTimes className="me-2" />
      Cerrar
    </Button>
  </Modal.Footer>
</Modal>

{/* Modal Editar Historia Clinica */}
<Modal
  show={showEditClinicalModal}
  onHide={() => {setShowEditClinicalModal(false)
    setEditValidated(false)
  }}
  size="lg"
  centered
>
  <Modal.Header closeButton className='border-bottom border-warning'>
    <Modal.Title>
      <FaBookMedical className="me-2 text-warning" />
      Editar Historia Clínica
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {selectedClinical && (
      <Form noValidate validated={validated} onSubmit={handleSubmitEditClinical}>
        <h5 className='border-bottom pb-2 mb-3'>Información Básica</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formVeterinario">
              <Form.Label>Veterinario</Form.Label>
              <Form.Control
                type="text"
                name="veterinario"
                value={editClinical.veterinario || ''}
                onChange={handleEditInputChange}
                placeholder="Nombre del veterinario"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formPropietario">
              <Form.Label>Propietario *</Form.Label>
              <Form.Control
                type="text"
                name="propietario"
                value={editClinical.propietario || ''}
                onChange={handleEditInputChange}
                required
                placeholder="Nombre del propietario"
              />
              <Form.Control.Feedback type="invalid">
                El propietario es obligatorio
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formPaciente">
              <Form.Label>Paciente *</Form.Label>
              <Form.Control
                type="text"
                name="paciente"
                value={editClinical.paciente || ''}
                onChange={handleEditInputChange}
                required
                placeholder="Nombre del paciente"
              />
              <Form.Control.Feedback type="invalid">
                El paciente es obligatorio
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <h5 className='mt-4'>Examen Físico</h5>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formVacunas">
              <Form.Label>Vacunas</Form.Label>
              <Form.Control
                type="text"
                name="vacunas"
                value={editClinical.vacunas || ''}
                onChange={handleEditInputChange}
                placeholder="Vacunas administradas"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formEnfermedades">
              <Form.Label>Enfermedades</Form.Label>
              <Form.Control
                type="text"
                name="enfermedades"
                value={editClinical.enfermedades || ''}
                onChange={handleEditInputChange}
                placeholder="Enfermedades conocidas"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formTemperatura">
              <Form.Label>Temperatura</Form.Label>
              <Form.Control
                type="text"
                name="temperatura"
                value={editClinical.temperatura || ''}
                onChange={handleEditInputChange}
                placeholder="Temperatura (°C)"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formPulso">
              <Form.Label>Pulso</Form.Label>
              <Form.Control
                type="text"
                name="pulso"
                value={editClinical.pulso || ''}
                onChange={handleEditInputChange}
                placeholder="Pulso (latidos/minuto)"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formFrecuenciaCardiaca">
              <Form.Label>Frecuencia cardiaca</Form.Label>
              <Form.Control
                type="text"
                name="frecuencia_cardiaca"
                value={editClinical.frecuencia_cardiaca || ''}
                onChange={handleEditInputChange}
                placeholder="Frecuencia cardiaca"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formLlenadoCapilar">
              <Form.Label>Tiempo de llenado capilar</Form.Label>
              <Form.Control
                type="text"
                name="llenado_capilar"
                value={editClinical.llenado_capilar || ''}
                onChange={handleEditInputChange}
                placeholder="Tiempo de llenado capilar"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formMucosas">
              <Form.Label>Mucosas</Form.Label>
              <Form.Control
                type="text"
                name="mucosas"
                value={editClinical.mucosas || ''}
                onChange={handleEditInputChange}
                placeholder="Estado de las mucosas"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formPulsoDigital">
              <Form.Label>Pulso digital</Form.Label>
              <Form.Control
                type="text"
                name="pulso_digital"
                value={editClinical.pulso_digital || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del pulso digital"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formAspecto">
              <Form.Label>Aspecto general</Form.Label>
              <Form.Control
                type="text"
                name="aspecto"
                value={editClinical.aspecto || ''}
                onChange={handleEditInputChange}
                placeholder="Descripción del aspecto"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formLocomotor">
              <Form.Label>Aparato locomotor</Form.Label>
              <Form.Control
                type="text"
                name="locomotor"
                value={editClinical.locomotor || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del aparato locomotor"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formRespiratorio">
              <Form.Label>Aparato respiratorio</Form.Label>
              <Form.Control
                type="text"
                name="respiratorio"
                value={editClinical.respiratorio || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del aparato respiratorio"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formCirculatorio">
              <Form.Label>Aparato circulatorio</Form.Label>
              <Form.Control
                type="text"
                name="circulatorio"
                value={editClinical.circulatorio || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del aparato circulatorio"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formDigestivo">
              <Form.Label>Aparato digestivo</Form.Label>
              <Form.Control
                type="text"
                name="digestivo"
                value={editClinical.digestivo || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del aparato digestivo"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formGenitourinario">
              <Form.Label>Aparato genitourinario</Form.Label>
              <Form.Control
                type="text"
                name="genitourinario"
                value={editClinical.genitourinario || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del aparato genitourinario"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formSisNervioso">
              <Form.Label>Sistema Nervioso</Form.Label>
              <Form.Control
                type="text"
                name="sis_nervioso"
                value={editClinical.sis_nervioso || ''}
                onChange={handleEditInputChange}
                placeholder="Estado del sistema nervioso"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formOidos">
              <Form.Label>Oídos</Form.Label>
              <Form.Control
                type="text"
                name="oidos"
                value={editClinical.oidos || ''}
                onChange={handleEditInputChange}
                placeholder="Estado de los oídos"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formGlandiosLinfaticos">
              <Form.Label>Glándios linfáticos</Form.Label>
              <Form.Control
                type="text"
                name="glangios_linfaticos"
                value={editClinical.glangios_linfaticos || ''}
                onChange={handleEditInputChange}
                placeholder="Estado de los glándios linfáticos"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formPiel">
              <Form.Label>Piel</Form.Label>
              <Form.Control
                type="text"
                name="piel"
                value={editClinical.piel || ''}
                onChange={handleEditInputChange}
                placeholder="Estado de la piel"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formDiagnosticoIntegral">
              <Form.Label>Diagnóstico integral</Form.Label>
              <Form.Control
                type="text"
                name="diagnostico_integral"
                value={editClinical.diagnostico_integral || ''}
                onChange={handleEditInputChange}
                placeholder="Diagnóstico integral"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formTratamiento">
              <Form.Label>Tratamiento</Form.Label>
              <Form.Control
                type="text"
                name="tratamiento"
                value={editClinical.tratamiento || ''}
                onChange={handleEditInputChange}
                placeholder="Tratamiento recomendado"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formPrescripcion">
              <Form.Label>Prescripción</Form.Label>
              <Form.Control
                type="text"
                name="prescripcion"
                value={editClinical.prescripcion || ''}
                onChange={handleEditInputChange}
                placeholder="Prescripción médica"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formObservaciones">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                type="text"
                name="observaciones"
                value={editClinical.observaciones || ''}
                onChange={handleEditInputChange}
                placeholder="Observaciones adicionales"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="formFecha">
              <Form.Label>Fecha Historia Clínica</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={editClinical.fecha ? selectedClinical.fecha.split('T')[0] : ''}
                onChange={handleEditInputChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => {setShowEditClinicalModal(false);
      setEditValidated(false)
    }}>
      <FaTimes className="me-2" />
      Cancelar
    </Button>
    <Button 
              variant="warning" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Actualizando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Actualizar Conductor
                </>
              )}
            </Button>
  </Modal.Footer>
</Modal>

{/* Modal de confirmación para eliminar */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom border-danger">
          <Modal.Title className="text-danger">
            <FaTrashAlt className="me-2" />
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {driverToDelete && (
            <div className="text-center">
              <div className="mb-3">
                <FaUser size={40} className="text-danger" />
              </div>
              <p className="mb-3">
                ¿Está seguro que desea eliminar Historia Clinica?
              </p>
              <div className="alert alert-light">
                <strong>
                  {clinicalToDelete.paciente} {clinicalToDelete.fecha}
                </strong>
                <br />
              </div>
              <p className="text-danger small">
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDeleteClinical}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Eliminando...
              </>
            ) : (
              <>
                <FaTrashAlt className="me-2" />
                Sí, Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>



    </div>
  )
}

export default ClinicalHistory
