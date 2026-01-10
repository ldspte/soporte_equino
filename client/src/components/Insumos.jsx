import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaWhatsapp, FaTag, FaInfoCircle, FaMoneyBillWave } from 'react-icons/fa';
import '../Styles/insumos.css';

export default function Insumos() {
    const [insumos, setInsumos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsumos = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://soporte-equino.onrender.com/api/insumosview');
                if (!response.ok) throw new Error('Error al cargar los insumos');
                const data = await response.json();
                setInsumos(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching insumos:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInsumos();
    }, []);

    return (
        <section className="public-insumos-section py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '80vh' }}>
            <Container>
                <div className="text-center mb-5" data-aos="fade-up">
                    <h1 className="display-4 fw-bold" style={{ color: '#0d3b66' }}>Nuestros Insumos</h1>
                    <div style={{ width: '80px', height: '4px', backgroundColor: '#0d3b66', margin: '15px auto' }}></div>
                    <p className="lead text-muted">Explora nuestra selección de productos de alta calidad para el cuidado equino.</p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" style={{ color: '#0d3b66' }} role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                        <p className="mt-2 text-muted">Cargando productos...</p>
                    </div>
                ) : error ? (
                    <Alert variant="danger" className="text-center">
                        <FaInfoCircle className="me-2" /> {error}
                    </Alert>
                ) : insumos.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted">No hay insumos disponibles en este momento.</p>
                    </div>
                ) : (
                    <Row className="gy-4">
                        {insumos.map((insumo) => (
                            <Col key={insumo.idInsumos} lg={3} md={4} sm={6}>
                                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all card-custom" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                    <div className="position-relative">
                                        {insumo.Foto ? (
                                            <Card.Img
                                                variant="top"
                                                src={insumo.Foto}
                                                style={{ height: '220px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/eeeeee/333333?text=Sin+Imagen'; }}
                                            />
                                        ) : (
                                            <div style={{ height: '220px', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FaTag size={40} className="text-muted opacity-50" />
                                            </div>
                                        )}
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <Badge bg="primary" style={{ backgroundColor: '#0d3b66', padding: '8px 12px' }}>
                                                <FaMoneyBillWave className="me-1" /> ${insumo.Precio}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="fw-bold mb-2" style={{ color: '#0d3b66', fontSize: '1.2rem' }}>
                                            {insumo.Nombre}
                                        </Card.Title>
                                        <Card.Text className="text-muted small flex-grow-1" style={{ fontSize: '0.9rem' }}>
                                            {insumo.Descripcion}
                                        </Card.Text>
                                        <Button
                                            href="https://www.whatsapp.com"
                                            target="_blank"
                                            className="mt-3 w-100 border-0 d-flex align-items-center justify-content-center py-2 btn-whatsapp"
                                            style={{ backgroundColor: '#25D366', color: 'white', fontWeight: 'bold', borderRadius: '8px' }}
                                        >
                                            <FaWhatsapp className="me-2" size={20} /> Pedir por WhatsApp
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
            <style>
                {`
                .hover-shadow:hover {
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
                    transform: translateY(-5px);
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
                .btn-whatsapp:hover {
                    background-color: #128C7E !important;
                    filter: brightness(1.1);
                }
                .card-custom {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card-custom:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
                }
                `}
            </style>
        </section>
    );
}
