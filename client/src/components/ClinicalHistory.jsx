import { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Container, Row, Col, InputGroup, Form, Modal, Badge, Alert } from 'react-bootstrap';
import {
  FaIdCard, FaUserCircle, FaSearch, FaEdit, FaTrashAlt, FaPlus,
  FaSave, FaCalendarPlus, FaPhone, FaMapMarkerAlt, FaEnvelope,
  FaCarSide, FaCamera, FaUser, FaHome, FaCalendarAlt, FaClock, FaTimes,
  FaCheckCircle, FaSpinner, FaBookMedical, FaHorse, FaClipboardList, FaImage
} from 'react-icons/fa';
import API_URL from '../config';
import '../Styles/history.css';

function ClinicalHistory() {
  const [clinicals, setClinical] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [patients, setPatients] = useState([]);
  const [owners, setOwners] = useState([]);

  // Estados Modales
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [showNewClinicalModal, setShowNewClinicalModal] = useState(false);
  const [showEditClinicalModal, setShowEditClinicalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  // Estados de validación
  const [validated, setValidated] = useState(false);
  const [editValidated, setEditValidated] = useState(false);

  // Estados para Historias Clinicas 
  const [currentClinical, setCurrentClinical] = useState(null);
  const [clinicalToDelete, setClinicalToDelete] = useState(null);

  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log(token ? `Bearer ${token}` : "XXXX")
    return token ? `Bearer ${token}` : null;
  }, []);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 10);
  };

  const normalizeClinicalData = useCallback((clinical) => {
    return {
      ...clinical,
      Veterinario: clinical.Veterinario || '',
      Paciente: clinical.Paciente || '',
      Anamnesis: clinical.Anamnesis || '',
      Enfermedades: clinical.Enfermedades || '',
      Vacunas: clinical.Vacunas || '',
      Desparasitacion: clinical.Desparasitacion || '',
      Evaluacion_distancia: clinical.Evaluacion_distancia || '',
      Mucosas: clinical.Mucosas || '',
      Llenado_capilar: clinical.Llenado_capilar || '',
      Pliegue_cutaneo: clinical.Pliegue_cutaneo || '',
      Pulso_digital: clinical.Pulso_digital || '',
      Frecuencia_cardiaca: clinical.Frecuencia_cardiaca || '',
      Frecuencia_respiratoria: clinical.Frecuencia_respiratoria || '',
      Motilidad_gastrointestinal: clinical.Motilidad_gastrointestinal || '',
      Temperatura: clinical.Temperatura || '',
      Pulso: clinical.Pulso || '',
      Aspecto: clinical.Aspecto || '',
      Locomotor: clinical.Locomotor || '',
      Respiratorio: clinical.Respiratorio || '',
      Circulatorio: clinical.Circulatorio || '',
      Digestivo: clinical.Digestivo || '',
      Genitourinario: clinical.Genitourinario || '',
      Sis_nervioso: clinical.Sis_nervioso || '',
      Oidos: clinical.Oidos || '',
      Ojos: clinical.Ojos || '',
      Glangios_linfaticos: clinical.Glangios_linfaticos || '',
      Piel: clinical.Piel || '',
      Diagnostico_integral: clinical.Diagnostico_integral || '',
      Tratamiento: clinical.Tratamiento || '',
      Ayudas_diagnosticas: clinical.Ayudas_diagnosticas || '',
      Observaciones: clinical.Observaciones || '',
      Foto: clinical.Foto || '',
      Fecha: clinical.Fecha || '',
      idHistoria_clinica: clinical.idHistoria_clinica || null
    };
  }, []);

  const initialClinicalState = {
    Veterinario: '',
    Paciente: '',
    Anamnesis: '',
    Enfermedades: '',
    Vacunas: '',
    Desparasitacion: '',
    Evaluacion_distancia: '',
    Mucosas: '',
    Llenado_capilar: '',
    Pliegue_cutaneo: '',
    Pulso_digital: '',
    Frecuencia_cardiaca: '',
    Frecuencia_respiratoria: '',
    Motilidad_gastrointestinal: '',
    Temperatura: '',
    Pulso: '',
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
    Ayudas_diagnosticas: '',
    Observaciones: '',
    Foto: '',
    Fecha: ''
  };


  const loadAllData = useCallback(async (tokenArg) => {
    setLoading(true);
    setError(null);
    const token = tokenArg || getAuthToken();
    if (!token) {
      setLoading(false);
      setError('No hay token de autenticación. Por favor, inicia sesión.');
      return;
    }

    try {
      const userStorage = localStorage.getItem('veterinario');
      let clinicalUrl = `${API_URL}/historia_clinica`;
      let vetId = null;

      if (userStorage) {
        const data = JSON.parse(userStorage);
        const user = data?.user?.[0];
        if (user) {
          setUserData(user);
          if (user.idVeterinario) {
            vetId = user.idVeterinario;
            clinicalUrl += `?veterinarioId=${vetId}`;
          }
        }
      }

      const [resClinical, resOwners, resPatients] = await Promise.all([
        fetch(clinicalUrl, {
          method: 'GET',
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_URL}/propietarios`, {
          method: 'GET',
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        }),
        fetch(`${API_URL}/pacientes${vetId ? `?veterinarioId=${vetId}` : ''}`, {
          method: 'GET',
          headers: { 'Authorization': token, 'Content-Type': 'application/json' }
        })
      ]);

      if (!resClinical.ok && resClinical.status !== 404) {
        const errData = await resClinical.json().catch(() => ({}));
        throw new Error(`Historias: ${resClinical.status} - ${errData.message || 'Error desconocido'}`);
      }
      if (!resOwners.ok) {
        const errData = await resOwners.json().catch(() => ({}));
        throw new Error(`Propietarios: ${resOwners.status} - ${errData.message || 'Error desconocido'}`);
      }
      if (!resPatients.ok) {
        const errData = await resPatients.json().catch(() => ({}));
        throw new Error(`Pacientes: ${resPatients.status} - ${errData.message || 'Error desconocido'}`);
      }

      const [dataClinical, dataOwners, dataPatients] = await Promise.all([
        resClinical.ok ? resClinical.json() : Promise.resolve([]),
        resOwners.json(),
        resPatients.json()
      ]);

      setOwners(dataOwners);
      setPatients(dataPatients);

      const processedClinical = Array.isArray(dataClinical)
        ? dataClinical.map(normalizeClinicalData)
        : dataClinical ? [normalizeClinicalData(dataClinical)] : [];

      setClinical(processedClinical);

      if (!processedClinical.length && resClinical.status !== 404) {
        // Silently handle empty results if they aren't explicitly 404
      } else if (resClinical.status === 404) {
        setError('No se encontraron Historias Clinicas');
      }

    } catch (err) {
      console.error('Error loading initial data: ', err);
      setError(`Error al cargar los datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, normalizeClinicalData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);



  const [newClinical, setNewClinical] = useState(initialClinicalState);
  const [editClinical, setEditClinical] = useState(initialClinicalState);


  // Estados para alertas y mensajes de éxito
  const [showSendingAlert, setShowSendingAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubMessage, setSuccessSubMessage] = useState('');





  // crear Historia clinica

  const handleSubmitNewHistory = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const token = getAuthToken();

    if (!token || !userData?.idVeterinario) {
      setError('No hay token de autenticacion, No se identifica al Veterinario Logueado');
      return;
    }

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setIsUpdating(true);
      if (!newClinical.Paciente) {
        alert('Por favor llena todos los campos');
        return;
      }

      //Preparar Payload
      const payload = {
        ...newClinical,
        Veterinario: userData.idVeterinario,
        Fecha: newClinical.Fecha || new Date().toISOString().split('T')[0]
      };

      const response = await fetch(`${API_URL}/historia_clinica`,
        {
          method: 'POST',
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const data = await response.json();

      setShowNewClinicalModal(false);
      setSuccessMessage('¡Historia clinica Creada!');
      setShowSuccessModal(true);

      setTimeout(() => setShowSuccessModal(false), 3000);

      setClinical(prevClinicals => [normalizeClinicalData(data.clinical || data), ...prevClinicals]);
      setNewClinical(initialClinicalState);
      setValidated(false);

    } catch (error) {
      console.error('Error: ', error);
      alert(`Hubo un error al crear la historia clinica: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
    loadAllData();
  }


  //Actualizar Historia Clinica
  const updateClinical = useCallback(async (idHistoria_clinica, clinicalData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/historia_clinica/${idHistoria_clinica}`, {
        method: 'PUT',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clinicalData)
      });

      if (!response.ok) {
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
      const response = await fetch(`${API_URL}/historia_clinica/${idHistoria_clinica}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al eliminar la historia clinica');
      }
      return true;

    } catch (error) {
      console.error('Error deleting History: ', error);
      throw error;
    }
  }, [getAuthToken]);

  // Efecto eliminado para evitar duplicidad, ya se maneja en loadAllData inicial y actualizaciones manuales





  // --- Funciones de Utilidad ---
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Funciones para manejar la creación y edición de historias clínicas
  const handleInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'Foto' && files && files[0]) {
      try {
        const base64 = await fileToBase64(files[0]);
        setNewClinical(prev => ({ ...prev, [name]: base64 }));
      } catch (error) {
        console.error('Error al convertir imagen:', error);
      }
    } else {
      setNewClinical(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'Foto' && files && files[0]) {
      try {
        const base64 = await fileToBase64(files[0]);
        setEditClinical(prev => ({ ...prev, [name]: base64 }));
      } catch (error) {
        console.error('Error al convertir imagen:', error);
      }
    } else {
      setEditClinical(prev => ({ ...prev, [name]: value }));
    }
  };

  //Handler para mostrar detalles de la historia
  const handleShowDetails = useCallback((clinical) => {
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
    if (!clinical) {
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
    if (history) {
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
      const { idHistoria_clinica, ...clinicalData } = editClinical;
      const payload = {
        ...clinicalData,
        Veterinario: userData.idVeterinario
      };
      console.log('Payload para actualizar: ', payload);
      await updateClinical(idHistoria_clinica, payload);
      await loadAllData();
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
  const confirmDeleteClinical = async () => {
    if (!clinicalToDelete) return;

    try {
      setLoading(true);
      await deleteHistory(clinicalToDelete.idHistoria_clinica);
      await loadAllData();
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
    if (!clinical?.idHistoria_clinica) return false;
    const searchLower = searchTerm.toLowerCase();

    // Buscar nombres en los estados de pacientes y propietarios
    const patient = patients.find(p => p.idPaciente === clinical.Paciente);
    const patientName = patient ? patient.Nombre.toLowerCase() : '';

    const owner = patient ? owners.find(o => o.idPropietario === patient.Propietario) : null;
    const ownerName = owner ? `${owner.Nombre} ${owner.Apellido || ''}`.toLowerCase() : '';

    return (
      (clinical.Observaciones?.toLowerCase() || '').includes(searchLower) ||
      patientName.includes(searchLower) ||
      ownerName.includes(searchLower) ||
      (clinical.Diagnostico_integral?.toLowerCase() || '').includes(searchLower)
    );
  });
  console.log('historias filtradas: ', filteredClinicals)



  // Renderizado del componente
  return (
    <div>
      <div className='page-header d-flex justify-content-between align-items-center mt-4 mb-4'>
        <h1>Mis Historias Clinicas</h1>
        <Button
          variant="primary"
          style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}
          className="d-flex align-items-center"
          onClick={() => setShowNewClinicalModal(true)}
          disabled={loading}
        >
          <FaPlus className="me-2" /> Nueva Historia Clinica
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
                <InputGroup.Text id="basic-addon1" className="text-white" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por Paciente, Propietario u Observaciones"
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
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ color: '#0d3b66' }} role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className='table-responsive'>
              <Table hover className='historias-table'>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Paciente</th>
                    <th>Propietario</th>
                    <th>Observaciones</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicals.map((clinical) => (
                    <tr key={clinical.idHistoria_clinica}>
                      <td className="text-center">
                        {clinical.Foto ? (
                          <img
                            src={clinical.Foto}
                            alt="Horse"
                            style={{
                              width: '45px',
                              height: '45px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '45px',
                              height: '45px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1px solid #dee2e6'
                            }}
                          >
                            <FaHorse color="#adb5bd" size={20} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaHorse className='me-2' />
                          {patients.find(patient => patient.idPaciente === clinical.Paciente)
                            ? `${patients.find(patient => patient.idPaciente === clinical.Paciente).Nombre}` : 'No asignado'
                          }
                        </div>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaUser Circle className='me-2' style={{ color: '#0d3b66' }} />
                          {(() => {
                            const patient = patients.find(patient => patient.idPaciente === clinical.Paciente);
                            if (patient) {
                              const owner = owners.find(owner => owner.idPropietario === patient.Propietario);
                              return owner
                                ? `${owner.Nombre} ${owner.Apellido}`
                                : 'No asignado';
                            }
                            return 'No asignado';
                          })()}
                        </div>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaClipboardList className='me-2' style={{ color: '#0d3b66' }} />
                          {clinical.Observaciones}
                        </div>
                      </td>
                      <td>
                        <div className='d-flex align-items-center'>
                          <FaCalendarAlt className='me-2' style={{ color: '#0d3b66' }} />
                          {clinical.Fecha ? new Date(clinical.Fecha).toLocaleDateString('es-CO') : 'No disponible'}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-primary"
                            style={{ color: '#0d3b66', borderColor: '#0d3b66' }}
                            size="sm"
                            className="me-1"
                            onClick={() => handleShowDetails(clinical)}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="outline-primary"
                            style={{ color: '#0d3b66', borderColor: '#0d3b66' }}
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
        show={showClinicalModal}
        onHide={() => setShowClinicalModal(false)}
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
              <h5 className='border-bottom pb-2 mb-3'>Información Básica</h5>
              <Col md={8}>
                <Row>
                  <Col sm={6}>
                    <p className='mb-1'><strong>Propietario</strong></p>
                    <p className='d-flex align-items-center'>
                      <FaUserCircle className="me-2" style={{ color: '#0d3b66' }} />
                      {(() => {
                        const patient = patients.find(p => p.idPaciente === currentClinical.Paciente);
                        const ownerId = patient ? patient.Propietario : currentClinical.Propietario;
                        const owner = owners.find(o => o.idPropietario === ownerId);
                        return owner ? `${owner.Nombre} ${owner.Apellido || ''}` : `Prop. #${ownerId || '?'}`;
                      })()}
                    </p>
                  </Col>
                  <Col sm={6}>
                    <p className='mb-1'><strong>Paciente</strong></p>
                    <p className='d-flex align-items-center'>
                      <FaHorse className="me-2" style={{ color: '#0d3b66' }} />
                      {(() => {
                        const patient = patients.find(p => p.idPaciente === currentClinical.Paciente);
                        return patient ? `${patient.Nombre} (${patient.Numero_registro || 'S/N'})` : 'No asignado';
                      })()}
                    </p>
                  </Col>
                </Row>
              </Col>

              <Col sm={12} className="text-center mb-3">
                {currentClinical.Foto ? (
                  <img
                    src={currentClinical.Foto}
                    alt="Historia Clínica"
                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
                  />
                ) : (
                  <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #dee2e6' }}>
                    <FaImage size={50} color="#adb5bd" />
                    <p className="mt-2 mb-0 text-muted">Sin foto adjunta</p>
                  </div>
                )}
              </Col>
              <h5>Examen Fisico</h5>
              <Row className='mb-4'>
                <Col sm={6}>
                  <p><strong>Vacunas:</strong></p>
                  <p>{currentClinical.Vacunas}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Enfermedades:</strong></p>
                  <p>{currentClinical.Enfermedades}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Temperatura:</strong></p>
                  <p>{currentClinical.Temperatura}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Pulso:</strong></p>
                  <p>{currentClinical.Pulso}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Frecuencia cardiaca:</strong></p>
                  <p>{currentClinical.Frecuencia_cardiaca}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Tiempo de llenado capilar:</strong></p>
                  <p>{currentClinical.Llenado_capilar}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Mucosas:</strong></p>
                  <p>{currentClinical.Mucosas}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Pliegue cutáneo:</strong></p>
                  <p>{currentClinical.Pliegue_cutaneo}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Frecuencia respiratoria:</strong></p>
                  <p>{currentClinical.Frecuencia_respiratoria}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Motilidad gastrointestinal:</strong></p>
                  <p>{currentClinical.Motilidad_gastrointestinal}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Evaluación a distancia:</strong></p>
                  <p>{currentClinical.Evaluacion_distancia}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Pulso digital:</strong></p>
                  <p>{currentClinical.Pulso_digital}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aspecto general:</strong></p>
                  <p>{currentClinical.Aspecto}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato locomotor:</strong></p>
                  <p>{currentClinical.Locomotor}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato respiratorio:</strong></p>
                  <p>{currentClinical.Respiratorio}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato circulatorio:</strong></p>
                  <p>{currentClinical.Circulatorio}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato digestivo:</strong></p>
                  <p>{currentClinical.Digestivo}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Aparato genitourinario:</strong></p>
                  <p>{currentClinical.Genitourinario}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Sistema Nervioso:</strong></p>
                  <p>{currentClinical.Sis_nervioso}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Oídos:</strong></p>
                  <p>{currentClinical.Oidos}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Ojos:</strong></p>
                  <p>{currentClinical.Ojos}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Glandios linfáticos:</strong></p>
                  <p>{currentClinical.Glangios_linfaticos}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Piel:</strong></p>
                  <p>{currentClinical.Piel}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Diagnóstico integral:</strong></p>
                  <p>{currentClinical.Diagnostico_integral}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Tratamiento:</strong></p>
                  <p>{currentClinical.Tratamiento}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Ayudas diagnósticas:</strong></p>
                  <p>{currentClinical.Ayudas_diagnosticas}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Observaciones:</strong></p>
                  <p>{currentClinical.Observaciones}</p>
                </Col>
                <Col sm={6}>
                  <p><strong>Fecha Historia Clinica </strong></p>
                  <p className="d-flex align-items-center">
                    <FaCalendarPlus className="me-2" style={{ color: '#0d3b66' }} />
                    {currentClinical.Fecha ?
                      new Date(currentClinical.Fecha).toLocaleDateString('es-CO') :
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
          <Button variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => setShowClinicalModal(false)}>
            <FaEdit className="me-2" />
            Editar Información
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Crear Historia Clinica */}
      <Modal
        show={showNewClinicalModal}
        onHide={() => setShowNewClinicalModal(false)}
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
          <Form noValidate validated={validated} onSubmit={handleSubmitNewHistory}>
            <h5 className='border-bottom pb-2 mb-3'>Información Básica</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPaciente">
                  <Form.Label>Paciente *</Form.Label>
                  <Form.Control
                    as="select"
                    name="Paciente"
                    value={newClinical.Paciente}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleccione un paciente</option>
                    {patients.map((patient) => {
                      const owner = owners.find(o => o.idPropietario === patient.Propietario);
                      const ownerName = owner ? `(${owner.Nombre} ${owner.Apellido || ''})` : '(Dueño desconocido)';
                      const regNum = patient.Numero_registro ? ` [Reg: ${patient.Numero_registro}]` : '';
                      return (
                        <option key={patient.idPaciente} value={patient.idPaciente}>
                          {patient.Nombre}{regNum} - {ownerName}
                        </option>
                      );
                    })}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    El paciente es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3" controlId="formFecha">
                  <Form.Label>Fecha de Historia Clínica</Form.Label>
                  <Form.Control
                    type="date"
                    name="Fecha"
                    value={formatDateForInput(newClinical.Fecha)}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    Dejar en blanco para usar la fecha y hora actual.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <h5 className='border-bottom pb-2 mb-3'>Examen Físico</h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formAnamnesis">
                  <Form.Label>Anamnesis *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Anamnesis"
                    value={newClinical.Anamnesis}
                    onChange={handleInputChange}
                    required
                    placeholder="Anamnesis"
                  />
                  <Form.Control.Feedback type="invalid">
                    La anamnesis es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formEnfermedades">
                  <Form.Label>Enfermedades *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Enfermedades"
                    value={newClinical.Enfermedades}
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
                <Form.Group className="mb-3" controlId="formVacunas">
                  <Form.Label>Vacunas *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Vacunas"
                    value={newClinical.Vacunas}
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
                <Form.Group className="mb-3" controlId="formDesparasitacion">
                  <Form.Label>Desparasitacion *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Desparasitacion"
                    value={newClinical.Desparasitacion}
                    onChange={handleInputChange}
                    required
                    placeholder="Desparasitacion"
                  />
                  <Form.Control.Feedback type="invalid">
                    La desparasitacion es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMucosas">
                  <Form.Label>Mucosas *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Mucosas"
                    value={newClinical.Mucosas}
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
                <Form.Group className="mb-3" controlId="formLlenadoCapilar">
                  <Form.Label>Tiempo de llenado capilar *</Form.Label>
                  <Form.Control
                    type="number"
                    name="Llenado_capilar"
                    value={newClinical.Llenado_capilar}
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
                <Form.Group className="mb-3" controlId="formPliegueCutaneo">
                  <Form.Label>Pliegue cutáneo *</Form.Label>
                  <Form.Control
                    type="number"
                    name="Pliegue_cutaneo"
                    value={newClinical.Pliegue_cutaneo}
                    onChange={handleInputChange}
                    required
                    placeholder="Pliegue cutáneo"
                  />
                  <Form.Control.Feedback type="invalid">
                    El pliegue cutáneo es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formFrecuenciaCardiaca">
                  <Form.Label>Frecuencia cardiaca *</Form.Label>
                  <Form.Control
                    type="number"
                    name="Frecuencia_cardiaca"
                    value={newClinical.Frecuencia_cardiaca}
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
                <Form.Group className="mb-3" controlId="formFrecuenciaRespiratoria">
                  <Form.Label>Frecuencia respiratoria *</Form.Label>
                  <Form.Control
                    type="number"
                    name="Frecuencia_respiratoria"
                    value={newClinical.Frecuencia_respiratoria}
                    onChange={handleInputChange}
                    required
                    placeholder="Frecuencia respiratoria"
                  />
                  <Form.Control.Feedback type="invalid">
                    La frecuencia respiratoria es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formMotilidadGastrointestinal">
                  <Form.Label>Motilidad gastrointestinal *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Motilidad_gastrointestinal"
                    value={newClinical.Motilidad_gastrointestinal}
                    onChange={handleInputChange}
                    required
                    placeholder="Motilidad gastrointestinal"
                  />
                  <Form.Control.Feedback type="invalid">
                    La motilidad gastrointestinal es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formTemperatura">
                  <Form.Label>Temperatura *</Form.Label>
                  <Form.Control
                    type="number"
                    name="Temperatura"
                    value={newClinical.Temperatura}
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
                    type="number"
                    name="Pulso"
                    value={newClinical.Pulso}
                    onChange={handleInputChange}
                    required
                    placeholder="Pulso (latidos/minuto)"
                  />
                  <Form.Control.Feedback type="invalid">
                    El pulso es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formEvaluacionDistancia">
                  <Form.Label>Evaluación a distancia *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Evaluacion_distancia"
                    value={newClinical.Evaluacion_distancia}
                    onChange={handleInputChange}
                    required
                    placeholder="Evaluación a distancia"
                  />
                  <Form.Control.Feedback type="invalid">
                    La evaluación a distancia es obligatoria
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="formPulsoDigital">
                  <Form.Label>Pulso digital *</Form.Label>
                  <Form.Control
                    type="text"
                    name="Pulso_digital"
                    value={newClinical.Pulso_digital}
                    onChange={handleInputChange}
                    required
                    placeholder="Pulso digital"
                  />
                  <Form.Control.Feedback type="invalid">
                    El pulso digital es obligatorio
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="formFoto">
              <Form.Label>Foto</Form.Label>
              <Form.Control
                type="file"
                name="Foto"
                accept="image/*"
                onChange={handleInputChange}
              />
              {newClinical.Foto && (
                <div className="mt-2 text-center">
                  <img src={newClinical.Foto} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                </div>
              )}
            </Form.Group>
            <Button type="button" variant="warning" onClick={() => setShowAdditionalFields(!showAdditionalFields)} className='mb-3'>
              {showAdditionalFields ? 'Ocultar Campos Adicionales' : 'Mostrar Campos Adicionales'}
            </Button>
            {showAdditionalFields && (
              <div>
                <h5 className='border-bottom pb-2 mb-3'>Campos Adicionales</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formAspecto">
                      <Form.Label>Aspecto</Form.Label>
                      <Form.Control
                        type="text"
                        name="Aspecto"
                        value={newClinical.Aspecto}
                        onChange={handleInputChange}
                        placeholder="Descripción del aspecto"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formLocomotor">
                      <Form.Label>Aparato locomotor</Form.Label>
                      <Form.Control
                        type="text"
                        name="Locomotor"
                        value={newClinical.Locomotor}
                        onChange={handleInputChange}
                        placeholder="Estado del aparato locomotor"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formRespiratorio">
                      <Form.Label>Aparato respiratorio</Form.Label>
                      <Form.Control
                        type="text"
                        name="Respiratorio"
                        value={newClinical.Respiratorio}
                        onChange={handleInputChange}
                        placeholder="Estado del aparato respiratorio"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formCirculatorio">
                      <Form.Label>Aparato circulatorio</Form.Label>
                      <Form.Control
                        type="text"
                        name="Circulatorio"
                        value={newClinical.Circulatorio}
                        onChange={handleInputChange}
                        placeholder="Estado del aparato circulatorio"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formDigestivo">
                      <Form.Label>Aparato digestivo</Form.Label>
                      <Form.Control
                        type="text"
                        name="Digestivo"
                        value={newClinical.Digestivo}
                        onChange={handleInputChange}
                        placeholder="Estado del aparato digestivo"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formGenitourinario">
                      <Form.Label>Aparato genitourinario</Form.Label>
                      <Form.Control
                        type="text"
                        name="Genitourinario"
                        value={newClinical.Genitourinario}
                        onChange={handleInputChange}
                        placeholder="Estado del aparato genitourinario"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formSisNervioso">
                      <Form.Label>Sistema Nervioso</Form.Label>
                      <Form.Control
                        type="text"
                        name="Sis_nervioso"
                        value={newClinical.Sis_nervioso}
                        onChange={handleInputChange}
                        placeholder="Estado del sistema nervioso"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formOidos">
                      <Form.Label>Oídos</Form.Label>
                      <Form.Control
                        type="text"
                        name="Oidos"
                        value={newClinical.Oidos}
                        onChange={handleInputChange}
                        placeholder="Estado de los oídos"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formOjos">
                      <Form.Label>Ojos</Form.Label>
                      <Form.Control
                        type="text"
                        name="Ojos"
                        value={newClinical.Ojos}
                        onChange={handleInputChange}
                        placeholder="Estado de los ojos"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formGlandiosLinfaticos">
                      <Form.Label>Glándios linfáticos</Form.Label>
                      <Form.Control
                        type="text"
                        name="Glangios_linfaticos"
                        value={newClinical.Glangios_linfaticos}
                        onChange={handleInputChange}
                        placeholder="Estado de los glándios linfáticos"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formPiel">
                      <Form.Label>Piel</Form.Label>
                      <Form.Control
                        type="text"
                        name="Piel"
                        value={newClinical.Piel}
                        onChange={handleInputChange}
                        placeholder="Estado de la piel"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formDiagnosticoIntegral">
                      <Form.Label>Diagnóstico integral</Form.Label>
                      <Form.Control
                        type="text"
                        name="Diagnostico_integral"
                        value={newClinical.Diagnostico_integral}
                        onChange={handleInputChange}
                        placeholder="Diagnóstico integral"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formTratamiento">
                      <Form.Label>Tratamiento *</Form.Label>
                      <Form.Control
                        type="text"
                        name="Tratamiento"
                        value={newClinical.Tratamiento}
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
                    <Form.Group className="mb-3" controlId="formAyudasDiagnosticas">
                      <Form.Label>Ayudas diagnósticas</Form.Label>
                      <Form.Control
                        type="text"
                        name="Ayudas_diagnosticas"
                        value={newClinical.Ayudas_diagnosticas}
                        onChange={handleInputChange}
                        placeholder="Ayudas diagnósticas"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formObservaciones">
                      <Form.Label>Observaciones *</Form.Label>
                      <Form.Control
                        type="text"
                        name="Observaciones"
                        value={newClinical.Observaciones}
                        onChange={handleInputChange}
                        required
                        placeholder="Observaciones adicionales"
                      />
                      <Form.Control.Feedback type="invalid">
                        Las observaciones son obligatorias
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}
            <Button type="submit" variant="warning">
              <FaPlus className="me-2" />
              Crear Historia Clínica
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewClinicalModal(false)}>
            <FaTimes className="me-2" />
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Historia Clinica */}
      <Modal
        show={showEditClinicalModal}
        onHide={() => { setShowEditClinicalModal(false); setEditValidated(false); }}
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
          {editClinical && (
            <Form noValidate validated={editValidated} onSubmit={handleSubmitEditClinical}>
              <h5 className='border-bottom pb-2 mb-3'>Información Básica</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPaciente">
                    <Form.Label>Paciente *</Form.Label>
                    <Form.Control
                      as="select"
                      name="Paciente"
                      value={editClinical.Paciente}
                      onChange={handleEditInputChange}
                      required >
                      <option value="">Seleccione un paciente</option>
                      {patients.map((patient) => {
                        const owner = owners.find(o => o.idPropietario === patient.Propietario);
                        const ownerName = owner ? `(${owner.Nombre} ${owner.Apellido || ''})` : '(Dueño desconocido)';
                        const regNum = patient.Numero_registro ? ` [Reg: ${patient.Numero_registro}]` : '';
                        return (
                          <option key={patient.idPaciente} value={patient.idPaciente}>
                            {patient.Nombre}{regNum} - {ownerName}
                          </option>
                        );
                      })}
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                      El paciente es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFechaEdit">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      name="Fecha"
                      value={formatDateForInput(editClinical.Fecha)}
                      onChange={handleEditInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5 className='border-bottom pb-2 mb-3'>Examen Físico</h5>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formAnamnesis">
                    <Form.Label>Anamnesis *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Anamnesis"
                      value={editClinical.Anamnesis}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Anamnesis"
                    />
                    <Form.Control.Feedback type="invalid">
                      La anamnesis es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formEnfermedades">
                    <Form.Label>Enfermedades *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Enfermedades"
                      value={editClinical.Enfermedades}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Enfermedades conocidas"
                    />
                    <Form.Control.Feedback type="invalid">
                      Las enfermedades son obligatorias
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formVacunas">
                    <Form.Label>Vacunas *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Vacunas"
                      value={editClinical.Vacunas}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Vacunas administradas"
                    />
                    <Form.Control.Feedback type="invalid">
                      Las vacunas son obligatorias
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formDesparasitacion">
                    <Form.Label>Desparasitacion *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Desparasitacion"
                      value={editClinical.Desparasitacion}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Desparasitacion"
                    />
                    <Form.Control.Feedback type="invalid">
                      La desparasitacion es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formMucosas">
                    <Form.Label>Mucosas *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Mucosas"
                      value={editClinical.Mucosas}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Estado de las mucosas"
                    />
                    <Form.Control.Feedback type="invalid">
                      El estado de las mucosas es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formLlenadoCapilar">
                    <Form.Label>Tiempo de llenado capilar *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Llenado_capilar"
                      value={editClinical.Llenado_capilar}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Tiempo de llenado capilar"
                    />
                    <Form.Control.Feedback type="invalid">
                      El tiempo de llenado capilar es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPliegueCutaneo">
                    <Form.Label>Pliegue cutáneo *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Pliegue_cutaneo"
                      value={editClinical.Pliegue_cutaneo}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Pliegue cutáneo"
                    />
                    <Form.Control.Feedback type="invalid">
                      El pliegue cutáneo es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFrecuenciaCardiaca">
                    <Form.Label>Frecuencia cardiaca *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Frecuencia_cardiaca"
                      value={editClinical.Frecuencia_cardiaca}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Frecuencia cardiaca"
                    />
                    <Form.Control.Feedback type="invalid">
                      La frecuencia cardiaca es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formFrecuenciaRespiratoria">
                    <Form.Label>Frecuencia respiratoria *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Frecuencia_respiratoria"
                      value={editClinical.Frecuencia_respiratoria}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Frecuencia respiratoria"
                    />
                    <Form.Control.Feedback type="invalid">
                      La frecuencia respiratoria es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formMotilidadGastrointestinal">
                    <Form.Label>Motilidad gastrointestinal *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Motilidad_gastrointestinal"
                      value={editClinical.Motilidad_gastrointestinal}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Motilidad gastrointestinal"
                    />
                    <Form.Control.Feedback type="invalid">
                      La motilidad gastrointestinal es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formTemperatura">
                    <Form.Label>Temperatura *</Form.Label>
                    <Form.Control
                      type="number"
                      name="Temperatura"
                      value={editClinical.Temperatura}
                      onChange={handleEditInputChange}
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
                      type="number"
                      name="Pulso"
                      value={editClinical.Pulso}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Pulso (latidos/minuto)"
                    />
                    <Form.Control.Feedback type="invalid">
                      El pulso es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formEvaluacionDistanciaEdit">
                    <Form.Label>Evaluación a distancia *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Evaluacion_distancia"
                      value={editClinical.Evaluacion_distancia}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Evaluación a distancia"
                    />
                    <Form.Control.Feedback type="invalid">
                      La evaluación a distancia es obligatoria
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="formPulsoDigitalEdit">
                    <Form.Label>Pulso digital *</Form.Label>
                    <Form.Control
                      type="text"
                      name="Pulso_digital"
                      value={editClinical.Pulso_digital}
                      onChange={handleEditInputChange}
                      required
                      placeholder="Pulso digital"
                    />
                    <Form.Control.Feedback type="invalid">
                      El pulso digital es obligatorio
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="formFotoEdit">
                <Form.Label>Foto</Form.Label>
                <Form.Control
                  type="file"
                  name="Foto"
                  accept="image/*"
                  onChange={handleEditInputChange}
                />
                {editClinical.Foto && (
                  <div className="mt-2 text-center">
                    <img src={editClinical.Foto} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                  </div>
                )}
              </Form.Group>
              <Button type="button" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }} onClick={() => setShowAdditionalFields(!showAdditionalFields)} className='mb-3'>
                {showAdditionalFields ? 'Ocultar Campos Adicionales' : 'Mostrar Campos Adicionales'}
              </Button>
              {showAdditionalFields && (
                <div>
                  <h5 className='border-bottom pb-2 mb-3'>Campos Adicionales</h5>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formAspecto">
                        <Form.Label>Aspecto</Form.Label>
                        <Form.Control
                          type="text"
                          name="Aspecto"
                          value={editClinical.Aspecto}
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
                          name="Locomotor"
                          value={editClinical.Locomotor}
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
                          name="Respiratorio"
                          value={editClinical.Respiratorio}
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
                          name="Circulatorio"
                          value={editClinical.Circulatorio}
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
                          name="Digestivo"
                          value={editClinical.Digestivo}
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
                          name="Genitourinario"
                          value={editClinical.Genitourinario}
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
                          name="Sis_nervioso"
                          value={editClinical.Sis_nervioso}
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
                          name="Oidos"
                          value={editClinical.Oidos}
                          onChange={handleEditInputChange}
                          placeholder="Estado de los oídos"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formOjos">
                        <Form.Label>Ojos</Form.Label>
                        <Form.Control
                          type="text"
                          name="Ojos"
                          value={editClinical.Ojos}
                          onChange={handleEditInputChange}
                          placeholder="Estado de los ojos"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formGlandiosLinfaticos">
                        <Form.Label>Glándios linfáticos</Form.Label>
                        <Form.Control
                          type="text"
                          name="Glangios_linfaticos"
                          value={editClinical.Glangios_linfaticos}
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
                          name="Piel"
                          value={editClinical.Piel}
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
                          name="Diagnostico_integral"
                          value={editClinical.Diagnostico_integral}
                          onChange={handleEditInputChange}
                          placeholder="Diagnóstico integral"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formTratamiento">
                        <Form.Label>Tratamiento *</Form.Label>
                        <Form.Control
                          type="text"
                          name="Tratamiento"
                          value={editClinical.Tratamiento}
                          onChange={handleEditInputChange}
                          required
                          placeholder="Tratamiento recomendado"
                        />
                        <Form.Control.Feedback type="invalid">
                          El tratamiento es obligatorio
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formAyudasDiagnosticas">
                        <Form.Label>Ayudas diagnósticas</Form.Label>
                        <Form.Control
                          type="text"
                          name="Ayudas_diagnosticas"
                          value={editClinical.Ayudas_diagnosticas}
                          onChange={handleEditInputChange}
                          placeholder="Ayudas diagnósticas"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formObservaciones">
                        <Form.Label>Observaciones *</Form.Label>
                        <Form.Control
                          type="text"
                          name="Observaciones"
                          value={editClinical.Observaciones}
                          onChange={handleEditInputChange}
                          required
                          placeholder="Observaciones adicionales"
                        />
                        <Form.Control.Feedback type="invalid">
                          Las observaciones son obligatorias
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}
              <Button type="submit" variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }}>
                <FaSave className="me-2" />
                Actualizar Historia Clínica
              </Button>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowEditClinicalModal(false); setEditValidated(false); }}>
            <FaTimes className="me-2" />
            Cancelar
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
          {clinicalToDelete && (
            <div className="text-center">
              <div className="mb-3">
                <FaUser size={40} className="text-danger" />
              </div>
              <p className="mb-3">
                ¿Está seguro que desea eliminar Historia Clinica?
              </p>
              <div className="alert alert-light">
                <strong>
                  {(() => {
                    const patient = patients.find(p => p.idPaciente === clinicalToDelete.Paciente);
                    return patient ? patient.Nombre : `Paciente #${clinicalToDelete.Paciente}`;
                  })()}
                  {clinicalToDelete.Fecha ? ` - ${new Date(clinicalToDelete.Fecha).toLocaleDateString()}` : ''}
                </strong>
                <br />
                <small className="text-muted">
                  {(() => {
                    const patient = patients.find(p => p.idPaciente === clinicalToDelete.Paciente);
                    const owner = patient ? owners.find(o => o.idPropietario === patient.Propietario) : null;
                    return owner ? `Propietario: ${owner.Nombre} ${owner.Apellido || ''}` : '';
                  })()}
                </small>
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
    </div >
  );
}

export default ClinicalHistory;