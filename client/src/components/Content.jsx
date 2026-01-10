import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Button, Card, Image, Spinner, Badge, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/content.css';
import Image1 from '../assets/img/hero-carousel/hero-carousel-1.jpg';
import Image2 from '../assets/img/hero-carousel/hero-carousel-2.jpg';
import Image3 from '../assets/img/hero-carousel/hero-carousel-3.jpg';
import video from '../assets/img/100658-video-720.mp4';
import { BsTwitter, BsFacebook, BsInstagram, BsLinkedin, BsWhatsapp } from 'react-icons/bs';
import {
    FaHeartbeat, FaPills, FaHospitalUser, FaDna, FaUserMd, FaStar, FaUserCircle
} from 'react-icons/fa';

// URL base de tu backend en Render
const API_URL = 'https://soporte-equino.onrender.com/api';

const images = [
    { src: Image1, title: "Soporte Equino", description: "Soporte médico veterinario al instante." },
    { src: Image2, title: "Somos Una Empresa Confiable", description: "Trabajamos con los mejores veterinarios especialistas en el ámbito equino." },
    { src: Image3, title: "Equipos Especializados", description: "Contamos con equipos necesarios para diagnósticos exactos." },
];

const services = [
    { id: 1, icon: <FaHeartbeat size={40} className="text-primary" />, title: 'Urgencias Medicas:', description: 'Respuesta rápida y experta para cólicos, heridas, partos complicados y emergencias neurológicas o cardiopulmonares.', delay: 100, href: '#', },
    { id: 2, icon: <FaPills size={40} className="text-primary" />, title: 'Insumos Pecuarios:', description: 'Productos esenciales para garantizar el bienestar de los animales y el personal.', delay: 200, href: '#', },
    { id: 3, icon: <FaHospitalUser size={40} className="text-primary" />, title: 'Seguimiento:', description: 'Acceso fácil y seguro a la historia clínica de tu caballo para un cuidado óptimo.', delay: 300, href: '#', },
    { id: 4, icon: <FaDna size={40} className="text-primary" />, title: 'Reproducción:', description: 'Servicios especializados en preñez, transferencia de embriones y manejo de reproductores.', delay: 400, href: '#', },
];

export default function Content() {
    const [index, setIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [flippedCardId, setFlippedCardId] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleCardClick = (id) => {
        setFlippedCardId(flippedCardId === id ? null : id);
    };

    // Lógica para la obtención de veterinarios
    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/veterinariosstatus`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de doctores.');
                }
                const data = await response.json();

                const activeDoctors = data.filter(d => d.Estado === 'Activo').map(d => {
                    let redes = {};
                    try {
                        redes = d.Redes ? JSON.parse(d.Redes) : {};
                    } catch (e) {
                        console.warn("Error parseando JSON de Redes:", d.Redes);
                    }
                    return { ...d, Redes: redes };
                });

                setDoctors(activeDoctors);
            } catch (error) {
                console.error("Error al cargar doctores:", error);
                setError(`Error al cargar los doctores: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        const interval = !isHovered ? setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000) : null;

        fetchDoctors();

        return () => interval && clearInterval(interval);
    }, [isHovered]);


    return (
        // CONTENEDOR PRINCIPAL: Fondo blanco, texto oscuro (#1D2D44)
        <div style={{ backgroundColor: 'white', color: '#1D2D44' }}>
            <div className="carousel-container">
                {/* --- SECCIÓN CAROUSEL --- */}
                <Carousel
                    activeIndex={index}
                    onSelect={setIndex}
                    interval={null}
                    slide={false}
                    fade={false}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {images.map((image, idx) => (
                        <Carousel.Item key={idx} className="carousel-item">
                            <div
                                className="carousel-image"
                                style={{
                                    backgroundImage: `url(${image.src})`,
                                }}
                            />
                            <Carousel.Caption className="custom-caption">
                                <h2 className="carousel-title">{image.title}</h2>
                                <p className="carousel-description">{image.description}</p>
                                <a href="#about" className="button2 btn">Leer Más</a>
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </div>

            {/* --- SECCIÓN CALL TO ACTION --- */}
            <section
                id="call-to-action"
                className="call-to-action section"
                data-aos="fade-right"
                style={{ backgroundColor: '#1D2D44', color: 'white', padding: '3rem 0' }}
            >
                <Container>
                    <Row className="justify-content-center" data-aos="zoom-in" data-aos-delay="100">
                        <Col xl={10}>
                            <div className="text-center">
                                <h3>Tienes Una Urgencia? Necesitas Ayuda Al Instante?</h3>
                                <p>Nuestro mayor servicio es la atencion de urgencias en equinos, te puedes comunicar con nostros para brindarte asesoria y atenderte</p>
                                <Button
                                    href="#doctors"
                                    variant="primary"
                                    className="cta-btn"
                                    style={{ backgroundColor: '#084c8d', borderColor: '#084c8d' }}
                                >
                                    Llamar Ahora
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- SECCIÓN ACERCA DE NOSOTROS (BLANCO) --- */}
            <section id="about" className="about section" data-aos="fade-left" style={{ backgroundColor: 'white', color: '#1D2D44', padding: '60px 0' }}>
                <Container className="section-title" data-aos="fade-up">
                    <h2>Acerca De Nosotros</h2>
                    <p>Soporte Equino fue fundado por un veterinario especializado en equinos, quien reconoció una carencia en la disponibilidad de veterinarios de campo, especialmente en situaciones de emergencia y durante fines de semana y festividades como diciembre. Nuestra plataforma está diseñada para optimizar la búsqueda de colegas capacitados, permitiendo a los veterinarios de campo remitir rápidamente a profesionales disponibles, garantizando así una atención oportuna y eficaz. Además, facilitamos a los propietarios el contacto con veterinarios cercanos o de confianza. Soporte Equino también ofrece un sistema para elaborar historias clínicas concisas y confiables, lo que facilita la evaluación de pacientes, criaderos y propietarios. Asimismo, nuestra plataforma proporcionará insumos y artículos esenciales para los entusiastas del mundo animal, fomentando la pasión por el campo de generación en generación.</p>
                </Container>
                <Container>
                    <Row className="gy-4">
                        <Col
                            lg={6}
                            className="position-relative align-self-start"
                            data-aos="fade-up"
                            data-aos-delay="100"
                        >
                            {/* Video */}
                            <video
                                src={video}
                                loop
                                muted
                                autoPlay
                                className="img-fluid"
                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                            />
                        </Col>

                        <Col
                            lg={6}
                            className="content"
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            <h3>Medicina Veterinaria Equina</h3>
                            <p className="fst-italic">mas info.....</p>
                            <ul>
                                <li>
                                    <i className="bi bi-check2-all"></i> <span>Primer punto importante</span>
                                </li>
                                <li>
                                    <i className="bi bi-check2-all"></i> <span>Segundo punto importante</span>
                                </li>
                                <li>
                                    <i className="bi bi-check2-all"></i> <span>Tercer punto importante</span>
                                </li>
                            </ul>
                            <p>{/* Puedes agregar más texto aquí si quieres */}</p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* --- SECCIÓN SERVICIOS (BLANCO) --- */}
            <section id="services" className="services section" data-aos="fade-right" style={{ padding: '60px 0', backgroundColor: 'white' }}>
                <Container className="section-title" data-aos="fade-up">
                    <h2 className="text-dark">Servicios</h2> {/* Color de texto oscuro */}
                </Container>
                <Container>
                    <Row className="gy-4 justify-content-center">
                        {services.map(({ id, icon, title, description, delay, href }) => (
                            <Col key={id} lg={4} md={6} data-aos="fade-up" data-aos-delay={delay} className="d-flex">
                                <Card className="service-item position-relative flex-fill border-0 shadow-sm text-center" style={{ backgroundColor: 'white', color: '#1D2D44' }}>
                                    <Card.Body>
                                        <div className="icon mb-3 text-primary">{icon}</div>
                                        <Card.Title as="a" href={href} className="stretched-link text-decoration-none text-dark">
                                            {title}
                                        </Card.Title>
                                        {description && <Card.Text>{description}</Card.Text>}
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* --- SECCIÓN DOCTORES ACTIVOS (AZUL) --- */}
            <section id="doctors" className="doctors section" data-aos="fade-left" style={{ padding: '60px 0', backgroundColor: '#1D2D44' }}>
                <Container className="section-title" data-aos="fade-up">
                    <h2 className='text-center text-white'>Doctores Activos</h2>
                    <p className="text-white">Tenemos un equipo que brinda apoyo 24h y especializado en equinos</p>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Container>

                <Container style={{ marginTop: '100px' }}>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="light" className="me-2" />
                            Cargando doctores...
                        </div>
                    ) : (
                        <Row className="gy-4 justify-content-center">
                            {doctors.map((doctor, index) => {
                                const { facebook, instagram, whatsapp } = doctor.Redes || {};

                                return (
                                    <Col
                                        key={doctor.idVeterinario}
                                        lg={3}
                                        md={6}
                                        className="d-flex align-items-stretch"
                                        data-aos="fade-up"
                                        data-aos-delay={(index % 4) * 100}
                                    >
                                        <div className={`card-flip-container ${flippedCardId === doctor.idVeterinario ? 'flipped' : ''}`} onClick={() => handleCardClick(doctor.idVeterinario)}>
                                            <div className="card-flipper">
                                                {/* Cara frontal de la tarjeta (BLANCA) */}
                                                <div className="front-card team-member border-0 shadow-lg w-100" style={{ backgroundColor: 'white', color: '#1D2D44' }}>
                                                    <div className="member-img position-relative text-center p-3">
                                                        {doctor.Foto ? (
                                                            <Image
                                                                src={doctor.Foto}
                                                                alt={doctor.Nombre}
                                                                className="rounded-circle"
                                                                style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid #1D2D44' }}
                                                            />
                                                        ) : (
                                                            <FaUserCircle size={100} className='text-muted' />
                                                        )}
                                                    </div>
                                                    <div className="member-info text-center p-3">
                                                        <h4 className="mb-1">{`${doctor.Nombre || ''} ${doctor.Apellido || ''}`}</h4>
                                                        <p className="text-primary small fw-bold">{doctor.Especialidad || 'Veterinario General'}</p>
                                                        <p className="small text-muted mb-0">{doctor.Descripcion ? (doctor.Descripcion.length > 80 ? doctor.Descripcion.substring(0, 80) + '...' : doctor.Descripcion) : 'Sin descripción disponible.'}</p>
                                                    </div>
                                                </div>

                                                {/* Cara trasera de la tarjeta (BLANCA) */}
                                                <div className="back-card team-member border-0 shadow-lg w-100 p-4" style={{ backgroundColor: 'white', color: '#1D2D44' }}>
                                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                        <h5 className="mb-3 text-primary">Contáctalo</h5>
                                                        <p className="text-muted small mb-1">{doctor.Correo}</p>

                                                        <div className="social d-flex gap-3 mt-3">
                                                            {whatsapp && (
                                                                <a href={`https://wa.me/${whatsapp}`} aria-label={`${doctor.Nombre} WhatsApp`} target="_blank" rel="noopener noreferrer">
                                                                    <BsWhatsapp size={20} className="text-success" />
                                                                </a>
                                                            )}
                                                            {facebook && (
                                                                <a href={facebook} aria-label={`${doctor.Nombre} Facebook`} target="_blank" rel="noopener noreferrer">
                                                                    <BsFacebook size={20} className="text-primary" />
                                                                </a>
                                                            )}
                                                            {instagram && (
                                                                <a href={instagram} aria-label={`${doctor.Nombre} Instagram`} target="_blank" rel="noopener noreferrer">
                                                                    <BsInstagram size={20} className="text-danger" />
                                                                </a>
                                                            )}
                                                        </div>
                                                        <p className='text-muted small mt-3'>(Haz clic para contactar)</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}

                </Container>
            </section>
        </div>
    );
}
