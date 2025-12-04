import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge, Alert } from 'react-bootstrap';
import {
  FaIdCard, FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus,
  FaSave, FaCalendarPlus, FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaCarSide, FaCamera, FaUser, FaHome, FaCalendarAlt, FaClock, FaTimes,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';

// Constantes para estados del veterinario
const VETERINARIO_STATUS = [
  { value: 'Activo', label: 'Activo' },
  { value: 'Inactivo', label: 'Inactivo' }
];

const Veterinarios = () => {
  // Estados principales
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [veterinarios, setVeterinarios] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para modales
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showSendingAlert, setShowSendingAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showVeterinarioModal, setShowVeterinarioModal] = useState(false);
  const [showNewVeterinarioModal, setShowNewVeterinarioModal] = useState(false);
  const [showEditVeterinarioModal, setShowEditVeterinarioModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');


  // Estados para veterinarios
  const [currentVeterinario, setCurrentVeterinario] = useState(null);
  const [veterinarioToDelete, setVeterinarioToDelete] = useState(null);

  // Estado inicial para nuevo veterinario
  const initialVeterinarioState = {
    Cedula: '',
    Nombre: '',
    Apellido: '',
    Correo: '',
    Descripcion: ''
  };

  const [newVeterinario, setNewVeterinario] = useState(initialVeterinarioState);
  const [editVeterinario, setEditVeterinario] = useState(initialVeterinarioState);

  // Estados de validaci贸n
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  // Funci贸n para obtener el token de autenticaci贸n
  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

  // Funci贸n para normalizar datos de veterinarios
  const normalizeVeterinarioData = useCallback((veterinario) => {
    return {
      idVeterinario: veterinario.idVeterinario || '',
      Cedula: veterinario.Cedula || '',
      Nombre: veterinario.Nombre || '',
      Apellido: veterinario.Apellido || '',
      Correo: veterinario.Correo || '',
      Descripcion: veterinario.Descripcion || '',
    };
  }, []);

  // Funci贸n para obtener todos los veterinarios
  const fetchVeterinarios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticaci贸n');
        setLoading(false);
        return;
      }

      const response = await fetch('https://soporte-equino.onrender.com/api/veterinarios', {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setError('Sesi贸n expirada. Por favor, inicie sesi贸n nuevamente.');
          return;
        }
        throw new Error(errorText || 'Error al obtener los veterinarios');
      }

      const data = await response.json();
      const processedData = Array.isArray(data) ? data.map(normalizeVeterinarioData) : [normalizeVeterinarioData(data)];

      if (!processedData.length) {
        setError('No se encontraron veterinarios');
      }

      setVeterinarios(processedData);
      console.log('Veterinarios cargados:', processedData);

    } catch (error) {
      console.error('Error fetching veterinarios:', error);
      setError(`Error al cargar los veterinarios: ${error.message}`);
      setVeterinarios([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, normalizeVeterinarioData]);

  // Funci贸n para crear un nuevo veterinario
  const handleSubmitNewVeterinario = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const token = getAuthToken();

    if (!token) {
      setError('No hay token de autenticaci贸n');
      return;
    }

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setIsUpdating(true);

      // Validar campos requeridos
      if (!newVeterinario.Cedula || !newVeterinario.Nombre || !newVeterinario.Correo) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }
      // Mostrar alert de env铆o de contrase帽a
      setShowSendingAlert(true);
      setTimeout(() => setShowSendingAlert(false), 3000);

      // Preparar payload
      const payload = {
        ...newVeterinario,
        Cedula: newVeterinario.Cedula.toString(),
        Nombre: newVeterinario.Nombre.trim(),
        Apellido: newVeterinario.Apellido.trim(),
        Correo: newVeterinario.Correo.trim(),
      };

      const response = await fetch('https://soporte-equino.onrender.com/api/veterinarios', {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }
      const data = await response.json();
      // Cerrar modal de crear y mostrar modal de 茅xito
      setShowNewVeterinarioModal(false);
      setSuccessMessage('隆Veterinario creado exitosamente!');
      setSuccessSubMessage('Contrase帽a enviada al correo electr贸nico');
      setShowSuccessModal(true);


      setTimeout(() => setShowSuccessModal(false), 3000);

      // Actualizar el estado local con el nuevo veterinario
      setVeterinarios(prevVeterinarios => [normalizeVeterinarioData(data.veterinario || data), ...prevVeterinarios]);
      setNewVeterinario(initialVeterinarioState);
      setValidated(false);

    } catch (error) {
      console.error('Error:', error);
      alert(`Hubo un error al crear el veterinario: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
    fetchVeterinarios();
  };

  // Funci贸n para editar un veterinario
  const updateVeterinario = useCallback(async (idVeterinario, veterinarioData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`https://soporte-equino.onrender.com/api/veterinarios/${idVeterinario}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(veterinarioData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al actualizar el veterinario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating veterinario:', error.message);
      throw error;
    }
  }, [getAuthToken]);

  // Funci贸n para eliminar un veterinario
  const deleteVeterinario = useCallback(async (veterinarioId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`https://soporte-equino.onrender.com/api/veterinarios/${veterinarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar el veterinario');
      }

      return true;
    } catch (error) {
      console.error('Error deleting veterinario:', error);
      throw error;
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchVeterinarios();
  }, [fetchVeterinarios]);

  // Handlers para cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVeterinario(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditVeterinario(prev => ({ ...prev, [name]: value }));
  };

  // Handler para mostrar detalles del veterinario
  const handleShowDetails = useCallback((veterinario) => {
    if (!veterinario) {
      setError('Veterinario inv谩lido seleccionado');
      return;
    }

    setCurrentVeterinario(normalizeVeterinarioData(veterinario));
    setShowVeterinarioModal(true);
    setError(null);
  }, [normalizeVeterinarioData]);

  // Handler para editar veterinario
  const handleEditVeterinario = useCallback((veterinario) => {
    if (!veterinario) {
      setError('Veterinario inv谩lido para editar');
      return;
    }

    setShowVeterinarioModal(false);
    setEditVeterinario(normalizeVeterinarioData(veterinario));
    setShowEditVeterinarioModal(true);
    setEditValidated(false);
    setError(null);
  }, [normalizeVeterinarioData]);

  // Handler para eliminar veterinario
  const handleDeleteVeterinario = useCallback((veterinarioId) => {
    const veterinario = veterinarios.find(v => v.idVeterinario === veterinarioId);
    if (veterinario) {
      setVeterinarioToDelete(veterinario);
      setShowDeleteModal(true);
    }
  }, [veterinarios]);

  // Handler para enviar edici贸n de veterinario
  const handleSubmitEditVeterinario = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setEditValidated(true);
      return;
    }

    try {
      setLoading(true);
      const { idVeterinario, ...veterinarioData } = editVeterinario;
      await updateVeterinario(idVeterinario, veterinarioData);
      await fetchVeterinarios();

      setShowEditVeterinarioModal(false);
      setEditValidated(false);
      setError(null);

      // Mostrar modal de 茅xito para edici贸n
      setSuccessMessage('隆Veterinario actualizado exitosamente!');
      setSuccessSubMessage('Los cambios han sido guardados correctamente');
      setShowEditSuccessModal(true);

      // Ocultar modal despu茅s de 2 segundos
      setTimeout(() => setShowEditSuccessModal(false), 2000);

    } catch (error) {
      setError(`Error al actualizar el veterinario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar eliminaci贸n de veterinario
  const confirmDeleteVeterinario = async () => {
    if (!veterinarioToDelete) return;

    try {
      setLoading(true);
      await deleteVeterinario(veterinarioToDelete.idVeterinario);
      await fetchVeterinarios();
      setShowDeleteModal(false);
      setVeterinarioToDelete(null);
      setError(null);

      // Mostrar modal de 茅xito para eliminaci贸n
      setSuccessMessage('隆Veterinario eliminado exitosamente!');
      setShowDeleteSuccessModal(true);

      // Ocultar modal despu茅s de 2 segundos
      setTimeout(() => setShowDeleteSuccessModal(false), 2000);

    } catch (error) {
      setError(`Error al eliminar el veterinario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar veterinarios
  const filteredVeterinarios = veterinarios.filter((veterinario) => {
    if (!veterinario?.idVeterinario) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      (veterinario.Cedula?.toString() || '').toLowerCase().includes(searchLower) ||
      (veterinario.Nombre?.toLowerCase() || '').includes(searchLower) ||
      (veterinario.Apellido?.toLowerCase() || '').includes(searchLower) ||
      (veterinario.Correo?.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div>
      <div className="page-header d-flex justify-content-between align-items-center mt-4 mb-4">
        <h1>Gesti贸n de Veterinarios</h1>
        <Button
          variant="warning"
          className="d-flex align-items-center"
          onClick={() => setShowNewVeterinarioModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> Nuevo Veterinario
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filtros y b煤squeda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={8}>
              <InputGroup>
                <InputGroup.Text id="basic-addon1" className="bg-warning text-white">
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por c茅dula, nombre o correo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Listado de veterinarios */}
      <Card>
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaUserCircle className="text-warning me-2" size={20} />
              <h5 className="mb-0">Listado de Veterinarios</h5>
            </div>
            <small className="text-muted">
              {filteredVeterinarios.length} veterinario(s) encontrado(s)
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-warning" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="veterinarios-table">
                <thead>
                  <tr>
                    <th>C茅dula</th>
                    <th>Nombre Completo</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVeterinarios.map((veterinario) => (
                    <tr key={veterinario.idVeterinario}>
                      <td>{veterinario.Cedula}</td>
                      <td>{`${veterinario.Nombre || ''} ${veterinario.Apellido || ''}`.trim() || 'Sin nombre'}</td>
                      <td>{veterinario.Correo || 'Sin correo'}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-1"
                            onClick={() => handleShowDetails(veterinario)}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="me-1"
                            onClick={() => handleEditVeterinario(veterinario)}
                            disabled={loading}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteVeterinario(veterinario.idVeterinario)}
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

          {!loading && filteredVeterinarios.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No se encontraron veterinarios con los criterios de b煤squeda.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de detalles del veterinario */}
      <Modal
        show={showVeterinarioModal}
        onHide={() => setShowVeterinarioModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-bottom border-warning">
          <Modal.Title>
            <FaUser className="me-2 text-warning" />
            Detalles del Veterinario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentVeterinario && (
            <div className="veterinario-detail">
              <h5 className="border-bottom pb-2 mb-3">Informaci贸n de Identificaci贸n</h5>
              <Row className="mb-4">
                <Col md={6}>
                  <p className="mb-1"><strong>C茅dula:</strong></p>
                  <p>{currentVeterinario.Cedula}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Nombre:</strong></p>
                  <p>{currentVeterinario.Nombre}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Apellido:</strong></p>
                  <p>{currentVeterinario.Apellido}</p>
                </Col>
                <Col md={6}>
                  <p className="mb-1"><strong>Email:</strong></p>
                  <p>{currentVeterinario.Correo}</p>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVeterinarioModal(false)}>
            <FaTimes className="me-2" />
            Cerrar
          </Button>
          <Button variant="warning" onClick={() => handleEditVeterinario(currentVeterinario)}>
            <FaEdit className="me-2" />
            Editar Informaci贸n
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para crear nuevo veterinario */}
      <Modal
        show={showNewVeterinarioModal}
        onHide={() => {
          setShowNewVeterinarioModal(false);
          setValidated(false);
          setNewVeterinario(initialVeterinarioState);
        }}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={validated} onSubmit={handleSubmitNewVeterinario}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaUser className="me-2 text-warning" />
              Registrar Nuevo Veterinario
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="new-veterinario-form">
              <h5 className="border-bottom pb-2 mb-3">Informaci贸n de Identificaci贸n</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>C茅dula *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Cedula"
                      value={newVeterinario.Cedula}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese la c茅dula"
                    />
                    <Form.Control.Feedback type="invalid">
                      La c茅dula es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Nombre"
                      value={newVeterinario.Nombre}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese el nombre"
                    />
                    <Form.Control.Feedback type="invalid">
                      El nombre es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Apellido"
                      value={newVeterinario.Apellido}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese el apellido"
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="Correo"
                      value={newVeterinario.Correo}
                      onChange={handleInputChange}
                      required
                      placeholder="ejemplo@correo.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingrese un email v谩lido
                    </Form.Control.Feedback>
                  </Form.Group>              </Col>
              </Row>
              <Row className="mb-3">
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripci髇</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="Descripcion"
                      value={newVeterinario.Descripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese una descripci髇 breve del veterinario (especialidad, a駉s de experiencia, etc.)"
                    />
                  </Form.Group>
                </Col>
              </Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripci髇</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="Descripcion"
                      value={newVeterinario.Descripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese una descripci髇 breve del veterinario (especialidad, a駉s de experiencia, etc.)"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewVeterinarioModal(false);
                setValidated(false);
                setNewVeterinario(initialVeterinarioState);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={loading || isUpdating}
            >
              {isUpdating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Guardar Veterinario
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal para editar veterinario */}
      <Modal
        show={showEditVeterinarioModal}
        onHide={() => {
          setShowEditVeterinarioModal(false);
          setEditValidated(false);
        }}
        size="lg"
        centered
        backdrop="static"
      >
        <Form noValidate validated={editValidated} onSubmit={handleSubmitEditVeterinario}>
          <Modal.Header closeButton className="border-bottom border-warning">
            <Modal.Title>
              <FaEdit className="me-2 text-warning" />
              Editar Veterinario
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="edit-veterinario-form">
              <h5 className="border-bottom pb-2 mb-3">Informaci贸n de Identificaci贸n</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>C茅dula *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Cedula"
                      value={editVeterinario.Cedula}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ingrese la c茅dula"
                    />
                    <Form.Control.Feedback type="invalid">
                      La c茅dula es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Nombre"
                      value={editVeterinario.Nombre}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ingrese el nombre"
                    />
                    <Form.Control.Feedback type="invalid">
                      El nombre es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Apellido"
                      value={editVeterinario.Apellido}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Ingrese el apellido"
                    />
                    <Form.Control.Feedback type="invalid">
                      El apellido es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="Correo"
                      value={editVeterinario.Correo}
                      onChange={handleEditInputChange}
                      required
                      placeholder="ejemplo@correo.com"
                    />
                    <Form.Control.Feedback type="invalid">
                      Ingrese un email v谩lido
                    </Form.Control.Feedback>
                  </Form.Group>              </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Descripci髇</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="Descripcion"
                      value={newVeterinario.Descripcion}
                      onChange={handleInputChange}
                      placeholder="Ingrese una descripci髇 breve del veterinario (especialidad, a駉s de experiencia, etc.)"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditVeterinarioModal(false);
                setEditValidated(false);
              }}
              disabled={loading}
            >
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
                  Actualizar Veterinario
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de confirmaci贸n para eliminar */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton className="border-bottom border-danger">
          <Modal.Title className="text-danger">
            <FaTrashAlt className="me-2" />
            Confirmar Eliminaci贸n
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {veterinarioToDelete && (
            <div className="text-center">
              <div className="mb-3">
                <FaUser size={40} className="text-danger" />
              </div>
              <p className="mb-3">
                驴Est谩 seguro que desea eliminar al veterinario?
              </p>
              <div className="alert alert-light">
                <strong>
                  {veterinarioToDelete.Nombre} {veterinarioToDelete.Apellido}
                </strong>
                <br />
                <small className="text-muted">
                  C茅dula: {veterinarioToDelete.Cedula}
                </small>
              </div>
              <p className="text-danger small">
                <strong>Esta acci贸n no se puede deshacer.</strong>
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
            onClick={confirmDeleteVeterinario}
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
                S铆, Eliminar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Alert flotante para env铆o de contrase帽a */}
      {showSendingAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          minWidth: '300px'
        }}>
          <Alert variant="info" className="d-flex align-items-center shadow">
            <FaSpinner className="me-2 fa-spin" />
            <div>
              <strong>Enviando contrase帽a por defecto</strong>
              <br />
              <small>Se est谩 enviando al correo del Veterinario...</small>
            </div>
          </Alert>
        </div>
      )}

      {/* Modal de 茅xito para crear veterinario */}
      <Modal
        show={showSuccessModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <FaCheckCircle size={50} className="text-success" />
          </div>
          <h5 className="text-success mb-2">{successMessage}</h5>
          <p className="text-muted mb-0">
            <FaEnvelope className="me-1" />
            {successSubMessage}
          </p>
        </Modal.Body>
      </Modal>

      {/* Modal de 茅xito para editar veterinario */}
      <Modal
        show={showEditSuccessModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <FaCheckCircle size={50} className="text-success" />
          </div>
          <h5 className="text-success mb-2">{successMessage}</h5>
          <p className="text-muted mb-0">{successSubMessage}</p>
        </Modal.Body>
      </Modal>

      {/* Modal de 茅xito para eliminar veterinario */}
      <Modal
        show={showDeleteSuccessModal}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <FaCheckCircle size={50} className="text-success" />
          </div>
          <h5 className="text-success mb-2">{successMessage}</h5>
          <p className="text-muted mb-0">{successSubMessage}</p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Veterinarios;
