import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaPaperPlane } from 'react-icons/fa';
import API_URL from '../config';

const ContactModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        tipo: 'Veterinario', // Valor por defecto
        mensaje: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [validated, setValidated] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Error al enviar el mensaje. Intente de nuevo más tarde.');
            }

            setStatus({ type: 'success', msg: '¡Mensaje enviado con éxito! Nos contactaremos pronto contigo.' });
            setFormData({ nombre: '', correo: '', telefono: '', tipo: 'Veterinario', mensaje: '' });
            setValidated(false);

            // Cerrar el modal después de un breve delay
            setTimeout(() => {
                onClose();
                setStatus({ type: '', msg: '' });
            }, 3000);

        } catch (error) {
            setStatus({ type: 'danger', msg: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered size="lg">
            <Modal.Header closeButton className='border-bottom border-primary'>
                <Modal.Title className="text-primary fw-bold">Contactanos</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body className="p-4">
                    <p className="mb-4 fw-bold text-secondary">
                        ¿Quieres hacer parte de Soporte Equino? Si eres veterinario o quieres pautar tus productos envíanos tu información y nos contactaremos pronto contigo.
                    </p>

                    {status.msg && <Alert variant={status.type}>{status.msg}</Alert>}

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Nombre Completo *</Form.Label>
                        <Form.Control
                            required
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Ej: Juan Pérez"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Correo Electrónico *</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleInputChange}
                                    placeholder="ejemplo@correo.com"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">Teléfono / WhatsApp *</Form.Label>
                                <Form.Control
                                    required
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 310 123 4567"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">¿Qué te interesa? *</Form.Label>
                        <Form.Select name="tipo" value={formData.tipo} onChange={handleInputChange}>
                            <option value="Veterinario">Soy Veterinario - Quiero unirme</option>
                            <option value="Aliado">Quiero pautar mis productos (Aliado)</option>
                            <option value="Otro">Otro / Consulta General</option>
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="small fw-bold">Mensaje / Información adicional *</Form.Label>
                        <Form.Control
                            required
                            as="textarea"
                            rows={4}
                            name="mensaje"
                            value={formData.mensaje}
                            onChange={handleInputChange}
                            placeholder="Cuéntanos un poco sobre ti o tu negocio..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>Cerrar</Button>
                    <Button variant="primary" type="submit" disabled={loading} className="px-4">
                        {loading ? <Spinner animation="border" size="sm" /> : <><FaPaperPlane className="me-2" /> Enviar Información</>}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ContactModal;
