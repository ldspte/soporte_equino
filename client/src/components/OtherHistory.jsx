import { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Row, Col, Alert, Table } from 'react-bootstrap';
import { FaSearch, FaHorse, FaUser, FaUserCircle, FaClipboardList, FaCalendarAlt } from 'react-icons/fa';

function OtherHistorys() {
  const [registro, setRegistro] = useState('');
  const [paciente, setPaciente] = useState('');
  const [propietario, setPropietario] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : null;
  }, []);

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

      const response = await fetch(`https://soporte-equino.onrender.com/api/historia_clinica/buscar?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          setError('Sesión expirada. Por favor, inicie sesión nuevamente.');
          setLoading(false);
          return;
        }
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
                    <th>Número de Registro</th>
                    <th>Paciente</th>
                    <th>Propietario</th>
                    <th>Observaciones</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((clinical) => (
                    <tr key={clinical.idHistoria_clinica || clinical.id}>
                      <td>{clinical.Registro || clinical.idHistoria_clinica || 'N/A'}</td>
                      <td>
                        <FaHorse className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.Paciente || 'No asignado'}
                      </td>
                      <td>
                        <FaUser Circle className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.Propietario || 'No asignado'}
                      </td>
                      <td>
                        <FaClipboardList className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.Observaciones || 'Sin observaciones'}
                      </td>
                      <td>
                        <FaCalendarAlt className="me-2" style={{ color: '#0d3b66' }} />
                        {clinical.Fecha ? new Date(clinical.Fecha).toLocaleDateString('es-CO') : 'No disponible'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

export default OtherHistorys;
