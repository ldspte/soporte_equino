import React, { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Button, Card, Image, Spinner, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/content.css';
import Image1 from '../assets/img/hero-carousel/hero-carousel-1.jpg';
import Image2 from '../assets/img/hero-carousel/hero-carousel-2.jpg';
import Image3 from '../assets/img/hero-carousel/hero-carousel-3.jpg';
import video from '../assets/img/100658-video-720.mp4';
import { BsTwitter, BsFacebook, BsInstagram, BsLinkedin, BsWhatsapp } from 'react-icons/bs'; // Importamos BsWhatsapp
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
    { id: 1, icon: <FaHeartbeat size={40} className="text-primary" />, title: 'Urgencias Medicas', description: 'Atendemos cualquier caso en todo el departamento 24h', delay: 100, href: '#', },
    { id: 2, icon: <FaPills size={40} className="text-primary" />, title: 'Insumos Medicos', description: 'Venta de insumos medicos para veterinaria', delay: 200, href: '#', },
    { id: 3, icon: <FaHospitalUser size={40} className="text-primary" />, title: 'Seguimiento', description: '', delay: 300, href: '#', },
    { id: 4, icon: <FaDna size={40} className="text-primary" />, title: 'Reproducción Equina', description: '', delay: 400, href: '#', },
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
                // NOTA: Asumo que esta ruta es PÚBLICA, ya que está en la página de aterrizaje (Landing)
                // y que el backend devuelve un campo 'Redes' como string JSON.
                const response = await fetch(`${API_URL}/veterinariosstatus`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    throw new Error('Error al obtener la lista de doctores.');
                }
                const data = await response.json();
                
                // Asegurar que solo se muestren los activos y parsear el JSON de Redes
                const activeDoctors = data.filter(d => d.Estado === 'Activo').map(d => {
                    let redes = {};
                    try {
                        // Intenta parsear el campo Redes (si viene como string JSON)
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

        // Inicia el carrusel (si no está en hover)
        const interval = !isHovered ? setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000) : null;
        
        // Carga los datos de los doctores
        fetchDoctors();

        return () => interval && clearInterval(interval);
    }, [isHovered]);


    // Función auxiliar para renderizar estrellas (promedio de 4.5 para ejemplo)
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const stars = [];

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<FaStar key={i} color="#ffc107" size={14} />);
            } else if (hasHalfStar && i === fullStars) {
                // Aquí podrías poner una media estrella si tienes el icono,
                // por simplicidad, dejamos el espacio como vacío
                stars.push(<FaStar key={i} color="#e4e5e9" size={14} />); 
            } else {
                stars.push(<FaStar key={i} color="#e4e5e9" size={14} />);
            }
        }
        return <div className="d-flex justify-content-center gap-1">{stars}</div>;
    };


    return (
        <div>
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
                style={{ backgroundColor: '#0d3b66', color: 'white', padding: '3rem 0' }}
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

            {/* --- SECCIÓN ACERCA DE NOSOTROS --- */}
            <section id="about" className="about section" data-aos="fade-left">
                <Container className="section-title" data-aos="fade-up">
                    <h2>Acerca De Nosotros</h2>
                    <p>Breve descripcion de lo que hacemos...</p>
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
            
            {/* --- SECCIÓN SERVICIOS --- */}
            <section id="services" className="services section" data-aos="fade-right">
                <Container className="section-title" data-aos="fade-up">
                    <h2>Servicios</h2>
                </Container>
                <Container>
                    <Row className="gy-4 justify-content-center">
                        {services.map(({ id, icon, title, description, delay, href }) => (
                            <Col key={id} lg={4} md={6} data-aos="fade-up" data-aos-delay={delay} className="d-flex">
                                <Card className="service-item position-relative flex-fill border-0 shadow-sm text-center">
                                    <Card.Body>
                                        <div className="icon mb-3 text-warning">{icon}</div>
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

            {/* --- SECCIÓN DOCTORES ACTIVOS --- */}
            <section id="doctors" className="doctors section light-background" data-aos="fade-left">
                <Container className="section-title" data-aos="fade-up">
                    <h2 className='text-center'>Doctores Activos</h2>
                    <p>Tenemos un equipo que brinda apoyo 24h y especializado en equinos</p>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                </Container>

                <Container>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="warning" className="me-2" />
                            Cargando doctores...
                        </div>
                    ) : (
                        <Row className="gy-4 justify-content-center">
                            {doctors.map((doctor, index) => {
                                // Desestructurar el objeto Redes con valores por defecto
                                const { facebook, instagram, whatsapp } = doctor.Redes || {};
                                
                                return (
                                    <Col
                                        key={doctor.idVeterinario}
                                        lg={3}
                                        md={6}
                                        className="d-flex align-items-stretch"
                                        data-aos="fade-up"
                                        data-aos-delay={(index % 4) * 100} // Retardo para efecto visual
                                    >
                                        <div className={`card-flip-container ${flippedCardId === doctor.idVeterinario ? 'flipped' : ''}`} onClick={() => handleCardClick(doctor.idVeterinario)}>
                                            <div className="card-flipper">
                                                {/* Cara frontal de la tarjeta */}
                                                <div className="front-card team-member border-0 shadow-lg w-100">
                                                    <div className="member-img position-relative text-center p-3">
                                                        {doctor.Foto ? (
                                                            <Image 
                                                                src={`https://soporte-equino.onrender.com/uploads/${doctor.Foto}`} 
                                                                alt={doctor.Nombre} 
                                                                className="rounded-circle"
                                                                style={{ width: '100px', height: '100px', objectFit: 'cover', border: '3px solid #ffc107' }}
                                                            />
                                                        ) : (
                                                            <FaUserCircle size={100} className='text-muted' />
                                                        )}
                                                    </div>
                                                    <div className="member-info text-center p-3">
                                                        <h4 className="mb-1">{`${doctor.Nombre || ''} ${doctor.Apellido || ''}`}</h4>
                                                        <p className="text-warning small fw-bold">Veterinario Activo</p>
                                                        {renderStars(4.5)} 
                                                    </div>
                                                </div>

                                                {/* Cara trasera de la tarjeta */}
                                                <div className="back-card team-member bg-light border-0 shadow-lg w-100 p-4">
                                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                        <h5 className="mb-3 text-warning">Contáctalo</h5>
                                                        <p className="text-muted small mb-1">{doctor.Correo}</p>
                                                        
                                                        {/* Redes Sociales Condicionales */}
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
                                                            {/* Si el campo 'Redes' trae otros enlaces, agrégalos aquí */}
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
