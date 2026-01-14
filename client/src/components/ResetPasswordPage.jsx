import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaLock } from 'react-icons/fa';
import API_URL from '../config';

const ResetPasswordPage = () => {
    // 1. Extraer el token de la URL
    const { token } = useParams();
    const navigate = useNavigate();

    // 2. Estados para el formulario y mensajes
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // 3. Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            // 4. Enviar la nueva contraseña y el token al backend
            const response = await fetch(`${API_URL}/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, confirmPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message);
                // 5. Redirigir al usuario al login después de un breve tiempo
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setError(data.message || 'Error al restablecer la contraseña.');
            }
        } catch (err) {
            console.error('Error al conectar con el servidor:', err);
            setError('Error de conexión con el servidor. Intenta de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Card className="p-4 shadow" style={{ maxWidth: '450px', width: '100%' }}>
                <Card.Body>
                    <div className="text-center mb-4">
                        <FaLock size={50} className="text-warning" />
                        <h4 className="mt-3">Restablecer Contraseña</h4>
                    </div>
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nueva Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Ingresa tu nueva contraseña"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength="6"
                                placeholder="Confirma tu nueva contraseña"
                            />
                        </Form.Group>
                        <div className="d-grid">
                            <Button
                                variant="warning"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Cargando...
                                    </>
                                ) : 'Cambiar Contraseña'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ResetPasswordPage;