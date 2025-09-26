import { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { Container, Row, Col, Button, Card,Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/content.css';
import  Image1  from '../assets/img/hero-carousel/hero-carousel-1.jpg';
import  Image2  from '../assets/img/hero-carousel/hero-carousel-2.jpg';
import  Image3  from '../assets/img/hero-carousel/hero-carousel-3.jpg';
import video from '../assets/img/100658-video-720.mp4';
import { BsTwitter, BsFacebook, BsInstagram, BsLinkedin } from 'react-icons/bs';
import {
  FaHeartbeat, FaPills, FaHospitalUser , FaDna
} from 'react-icons/fa';
import doctor1 from '../assets/img/doctors/doctors-1.jpg';
import doctor2 from '../assets/img/doctors/doctors-2.jpg';
import doctor3 from '../assets/img/doctors/doctors-3.jpg';
import doctor4 from '../assets/img/doctors/doctors-4.jpg';



const doctors = [
  {
    id: 1,
    name: 'Walter White',
    role: 'Chief Medical Officer',
    imgSrc: doctor1,
    social: {
      twitter: '#',
      facebook: '#',
      instagram: '#',
      linkedin: '#',
    },
    delay: 100,
  },
  {
    id: 2,
    name: 'Sarah Jhonson',
    role: 'Anesthesiologist',
    imgSrc: doctor2,
    social: {
      twitter: '#',
      facebook: '#',
      instagram: '#',
      linkedin: '#',
    },
    delay: 200,
  },
  {
    id: 3,
    name: 'William Anderson',
    role: 'Cardiology',
    imgSrc: doctor3,
    social: {
      twitter: '#',
      facebook: '#',
      instagram: '#',
      linkedin: '#',
    },
    delay: 300,
  },
  {
    id: 4,
    name: 'Amanda Jepson',
    role: 'Neurosurgeon',
    imgSrc: doctor4,
    social: {
      twitter: '#',
      facebook: '#',
      instagram: '#',
      linkedin: '#',
    },
    delay: 400,
  },
];

const images = [
  {
    src: Image1,
    title: "Soporte Equino",
    description: "Soporte médico veterinario al instante.",
  },
  {
    src: Image2,
    title: "Somos Una Empresa Confiable",
    description: "Trabajamos con los mejores veterinarios especialistas en el ámbito equino.",
  },
  {
    src: Image3,
    title: "Equipos Especializados",
    description: "Contamos con equipos necesarios para diagnósticos exactos.",
  },
];

 const services = [
    {
      id: 1,
      icon: <FaHeartbeat size={40} className="text-primary" />,
      title: 'Urgencias Medicas',
      description: 'Atendemos cualquier caso en todo el departamento 24h',
      delay: 100,
      href: '#',
    },
    {
      id: 2,
      icon: <FaPills size={40} className="text-primary" />,
      title: 'Insumos Medicos',
      description: 'Venta de insumos medicos para veterinaria',
      delay: 200,
      href: '#',
    },
    {
      id: 3,
      icon: <FaHospitalUser  size={40} className="text-primary" />,
      title: 'Seguimiento',
      description: '',
      delay: 300,
      href: '#',
    },
    {
      id: 4,
      icon: <FaDna size={40} className="text-primary" />,
      title: 'Reproducción Equina',
      description: '',
      delay: 400,
      href: '#',
    },
  ];

export default function Content() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);

  const handleCardClick = (id) => {
    setFlippedCardId(flippedCardId === id ? null : id);
  };

  useEffect(() => {
    const interval = !isHovered ? setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000) : null;

    return () => interval && clearInterval(interval);
  }, [isHovered]);

  return (
    <div>
    <div className="carousel-container">
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
              <a href="#about" className="btn-get-started">Leer Más</a>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
    
    <section
      id="call-to-action"
      className="call-to-action section"
      data-aos="fade-right"
      style={{ backgroundColor: '#0d3b66', color: 'white', padding: '3rem 0' }}
      
    >
      <Container>
        <Row
          className="justify-content-center"
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          <Col xl={10}>
            <div className="text-center">
              <h3>Tienes Una Urgencia? Necesitas Ayuda Al Instante?</h3>
              <p>
                Nuestro mayor servicio es la atencion de urgencias en equinos,
                te puedes comunicar con nostros para brindarte asesoria y
                atenderte
              </p>
              <Button
                href="#appointment"
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

    
    <section id="about" className="about section" data-aos="fade-left">
      {/* Section Title */}
      <Container className="section-title" data-aos="fade-up">
        <h2>
          Acerca De Nosotros
          <br />
        </h2>
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
              src= {video}
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
    

    <section id="services" className="services section" data-aos="fade-right">
      {/* Section Title */}
      <Container className="section-title" data-aos="fade-up">
        <h2>Servicios</h2>
        {/* <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p> */}
      </Container>

      <Container>
        <Row className="gy-4 justify-content-center">
          {services.map(({ id, icon, title, description, delay, href }) => (
            <Col
              key={id}
              lg={4}
              md={6}
              data-aos="fade-up"
              data-aos-delay={delay}
              className="d-flex"
            >
              <Card className="service-item position-relative flex-fill border-0 shadow-sm">
                <Card.Body>
                  <div className="icon mb-3">{icon}</div>
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

    <section id="doctors" className="doctors section light-background" data-aos="fade-left">
      {/* Section Title */}
      <Container className="section-title" data-aos="fade-up">
        <h2>Doctores</h2>
        <p>Tenemos un equipo que brinda apoyo 24h y especializado en equinos</p>
      </Container>

      <Container>
  <Row className="gy-4">
    {doctors.map(({ id, name, role, imgSrc, social, delay }) => (
      <Col
        key={id}
        lg={3}
        md={6}
        className="d-flex align-items-stretch"
        data-aos="fade-up"
        data-aos-delay={delay}
      >
        <div className={`card-flip-container ${flippedCardId === id ? 'flipped' : ''}`} onClick={() => handleCardClick(id)}>
          <div className="card-flipper">
            {/* Cara frontal de la tarjeta */}
            <div className="front-card team-member border-0 shadow-sm w-100">
              <div className="member-img position-relative">
                <Image src={imgSrc} alt={name} fluid />
              </div>
              <div className="member-info text-center">
                <h4 className="mb-1">{name}</h4>
                <p className="text-muted">{role}</p>
              </div>
            </div>

            {/* Cara trasera de la tarjeta */}
            <div className="back-card team-member border-0 shadow-sm w-100 p-4">
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <h5 className="mb-3">Redes Sociales</h5>
                <div className="social d-flex gap-2">
                  <a href={social.twitter} aria-label={`${name} Twitter`} target="_blank" rel="noopener noreferrer">
                    <BsTwitter size={20} className="twitter-icon-color" />
                  </a>
                  <a href={social.facebook} aria-label={`${name} Facebook`} target="_blank" rel="noopener noreferrer">
                    <BsFacebook size={20} className="facebook-icon-color" />
                  </a>
                  <a href={social.instagram} aria-label={`${name} Instagram`} target="_blank" rel="noopener noreferrer">
                    <BsInstagram size={20} className="instagram-icon-color" />
                  </a>
                  <a href={social.linkedin} aria-label={`${name} LinkedIn`} target="_blank" rel="noopener noreferrer">
                    <BsLinkedin size={20} className="linkedin-icon-color" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>
    ))}
  </Row>
</Container>
    </section>

    </div>
  );
}
