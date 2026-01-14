import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import API_URL from '../config';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            // En el backend, ya respondes con un mensaje genérico por seguridad.
            // Por eso, verificamos si la respuesta fue exitosa para mostrar un mensaje de éxito al usuario.
            if (response.ok) {
                setSuccess('Si el correo existe, se ha enviado un enlace de recuperación. Por favor, revisa tu bandeja de entrada.');
                setEmail(''); // Limpia el campo de email
            } else {
                // Si hay un error, el backend enviará un mensaje de error
                const data = await response.json();
                setError(data.message || 'Hubo un error al enviar la solicitud.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor. Por favor, intenta de nuevo más tarde.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Recuperar Contraseña</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <p>Ingresa tu correo electrónico para enviarte un enlace de recuperación.</p>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="forgotPasswordEmail" className="mb-3">
                        <Form.Label>Correo Electrónico:</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="d-grid gap-2">
                        <Button
                            variant="warning"
                            type="submit"
                            disabled={loading}
                            className="mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane className="me-2" />
                                    Enviar Enlace
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ForgotPasswordModal;