import { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Row, Col, Alert, Table, Modal } from 'react-bootstrap';
import {
  FaSearch, FaHorse, FaUser, FaUserCircle, FaClipboardList,
  FaCalendarAlt, FaBookMedical, FaImage, FaTimes
} from 'react-icons/fa';
import API_URL from '../config';

function OtherHistorys() {
  const [registro, setRegistro] = useState('');
  const [paciente, setPaciente] = useState('');
  const [propietario, setPropietario] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // Estados para ver detalles
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [currentClinical, setCurrentClinical] = useState(null);

  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

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

  const handleShowDetails = (clinical) => {
    setCurrentClinical(normalizeClinicalData(clinical));
    setShowClinicalModal(true);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setResults([]);

    if (!registro.trim()) {
      setError('El número de registro es obligatorio para la búsqueda.');
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setError('No hay token de autenticación. Por favor, inicie sesión.');
        setLoading(false);
        return;
      }

      // Construir query params para la búsqueda
      const params = new URLSearchParams();
      params.append('registro', registro.trim());
      if (paciente.trim()) params.append('paciente', paciente.trim());
      if (propietario.trim()) params.append('propietario', propietario.trim());

      const response = await fetch(`${API_URL}/historia_clinica/buscar?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al buscar historias clínicas');
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setError('No se encontraron historias clínicas con los criterios proporcionados.');
        setResults([]);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError(`Error en la búsqueda: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mb-4">Buscar Historias Clínicas</h2>
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="formRegistro">
                  <Form.Label>Número de Registro *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ingrese número de registro"
                    value={registro}
                    onChange={(e) => setRegistro(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="formPaciente">
                  <Form.Label>Paciente</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del paciente"
                    value={paciente}
                    onChange={(e) => setPaciente(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="formPropietario">
                  <Form.Label>Propietario</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre del propietario"
                    value={propietario}
                    onChange={(e) => setPropietario(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" style={{ backgroundColor: '#0d3b66', borderColor: '#0d3b66' }} type="submit" disabled={loading}>
              <FaSearch className="me-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </Card.Body>
      </Card>

      {results.length > 0 && (
        <Card>
          <Card.Body>
            <h4>Resultados de la búsqueda</h4>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>ID / Registro</th>
                    <th>Paciente</th>
                    <th>Propietario</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((clinical) => (
                    <tr key={clinical.idHistoria_clinica}>
                      <td>{clinical.idHistoria_clinica}</td>
                      <td>
                        <FaHorse className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.NombrePaciente || 'No asignado'}
                      </td>
                      <td>
                        <FaUserCircle className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.NombrePropietario ? `${clinical.NombrePropietario} ${clinical.ApellidoPropietario || ''}` : 'No asignado'}
                      </td>
                      <td>
                        <FaCalendarAlt className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.Fecha ? new Date(clinical.Fecha).toLocaleDateString('es-CO') : 'No disponible'}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowDetails(clinical)}
                          style={{ color: '#0d3b66', borderColor: '#0d3b66' }}
                        >
                          Ver Detalles
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

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
              <Row>
                <Col sm={6}>
                  <p className='mb-1'><strong>Propietario</strong></p>
                  <p className='d-flex align-items-center'>
                    <FaUserCircle className="me-2" style={{ color: '#0d3b66' }} />
                    {currentClinical.NombrePropietario ? `${currentClinical.NombrePropietario} ${currentClinical.ApellidoPropietario || ''}` : 'No asignado'}
                  </p>
                </Col>
                <Col sm={6}>
                  <p className='mb-1'><strong>Paciente</strong></p>
                  <p className='d-flex align-items-center'>
                    <FaHorse className="me-2" style={{ color: '#0d3b66' }} />
                    {currentClinical.NombrePaciente || 'No asignado'}
                  </p>
                </Col>
              </Row>

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
                <Col sm={6}><p><strong>Vacunas:</strong> {currentClinical.Vacunas}</p></Col>
                <Col sm={6}><p><strong>Enfermedades:</strong> {currentClinical.Enfermedades}</p></Col>
                <Col sm={6}><p><strong>Temperatura:</strong> {currentClinical.Temperatura}</p></Col>
                <Col sm={6}><p><strong>Pulso:</strong> {currentClinical.Pulso}</p></Col>
                <Col sm={6}><p><strong>Frecuencia cardiaca:</strong> {currentClinical.Frecuencia_cardiaca}</p></Col>
                <Col sm={6}><p><strong>Tiempo de llenado capilar:</strong> {currentClinical.Llenado_capilar}</p></Col>
                <Col sm={6}><p><strong>Mucosas:</strong> {currentClinical.Mucosas}</p></Col>
                <Col sm={6}><p><strong>Pliegue cutáneo:</strong> {currentClinical.Pliegue_cutaneo}</p></Col>
                <Col sm={6}><p><strong>Frecuencia respiratoria:</strong> {currentClinical.Frecuencia_respiratoria}</p></Col>
                <Col sm={6}><p><strong>Motilidad gastrointestinal:</strong> {currentClinical.Motilidad_gastrointestinal}</p></Col>
                <Col sm={6}><p><strong>Evaluación a distancia:</strong> {currentClinical.Evaluacion_distancia}</p></Col>
                <Col sm={6}><p><strong>Pulso digital:</strong> {currentClinical.Pulso_digital}</p></Col>
              </Row>

              <h5>Sistemas</h5>
              <Row className='mb-4'>
                <Col sm={6}><p><strong>Aspecto general:</strong> {currentClinical.Aspecto}</p></Col>
                <Col sm={6}><p><strong>Aparato locomotor:</strong> {currentClinical.Locomotor}</p></Col>
                <Col sm={6}><p><strong>Aparato respiratorio:</strong> {currentClinical.Respiratorio}</p></Col>
                <Col sm={6}><p><strong>Aparato circulatorio:</strong> {currentClinical.Circulatorio}</p></Col>
                <Col sm={6}><p><strong>Aparato digestivo:</strong> {currentClinical.Digestivo}</p></Col>
                <Col sm={6}><p><strong>Aparato genitourinario:</strong> {currentClinical.Genitourinario}</p></Col>
                <Col sm={6}><p><strong>Sistema nervioso:</strong> {currentClinical.Sis_nervioso}</p></Col>
                <Col sm={6}><p><strong>Piel:</strong> {currentClinical.Piel}</p></Col>
              </Row>

              <h5>Diagnóstico y Tratamiento</h5>
              <Row>
                <Col sm={12}><p><strong>Diagnóstico integral:</strong> {currentClinical.Diagnostico_integral}</p></Col>
                <Col sm={12}><p><strong>Tratamiento:</strong> {currentClinical.Tratamiento}</p></Col>
                <Col sm={12}><p><strong>Observaciones:</strong> {currentClinical.Observaciones}</p></Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClinicalModal(false)}>
            <FaTimes className="me-2" />
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default OtherHistorys;
