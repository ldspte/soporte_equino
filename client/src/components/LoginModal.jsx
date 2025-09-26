import { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useAuth } from './AuthProvider'

const LoginModal = ({ isOpen, onClose,  }) => {
    if (!isOpen) return null;
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const response = await fetch('https://soporte-equino.onrender.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Correo: email,
                    Contraseña: password
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess(true);
                await localStorage.setItem('token', data.token);
                await localStorage.setItem('veterinario', JSON.stringify(data));
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    const handleOpenForgotModal = () => {
        onOpenForgot(); // Llama a la función del componente padre (NavBar)
    };

    return (
        <>
        <Modal show={isOpen} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Iniciar Sesión</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">¡Login exitoso! Redirigiendo...</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="username">
                        <Form.Label>Usuario:</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={email} 
                            required 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </Form.Group>
                    <Form.Group controlId="password">
                        <Form.Label>Contraseña:</Form.Label>
                        <Form.Control 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Button variant="warning" type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : 'Iniciar Sesión'}
                    </Button>
                    <Button variant="secondary" onClick={onClose} className="ml-2">
                        Cerrar
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Button variant="link" onClick={handleOpenForgotModal}>
                        ¿Olvidaste tu contraseña?
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
        <ForgotPasswordModal 
                isOpen={showForgotModal} 
                onClose={() => setShowForgotModal(false)} 
            />
        </>
    );
};

export default LoginModal;
