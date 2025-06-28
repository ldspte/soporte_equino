import React, { useState } from 'react';
import image1 from '../assets/img/hero-carousel/hero-carousel-1.jpg';
import image2 from '../assets/img/hero-carousel/hero-carousel-2.jpg';
import image3 from '../assets/img/hero-carousel/hero-carousel-3.jpg';
import '../Styles/content.css';


const images = [
  {
    src: image1,
    title: "Soporte Equino",
    description: "Soporte medico veterinario al instante.",
  },
  {
    src: image2,
    title: "Somos Una Empresa Confiable",
    description: "Trabajamos de la mano de los mejores veterinarios y especialistas en el ambito equino para brindar una atencion especializada de gran calidad, siempre es primordial la salud del equino",
  },
  {
    src: image3,
    title: "Equipos Especializados",
    description: "Contamos con los equipos necesarios para los diferentes servicios que prestamos para poder dar un diagnostico exacto.",
  },
];


export default function Content() {
  const [currentIndex, setCurrentIndex] = useState(0);


  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };


  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };


  return (
    <div className="carousel">
      <div className="carousel-item" style={{ backgroundImage: `url(${images[currentIndex].src})` }}>
        <div className="container">
          <h2>{images[currentIndex].title}</h2>
          <p>{images[currentIndex].description}</p>
          <a href="#about" className="btn-get-started">Leer Más</a>
        </div>
      </div>
      <button className="carousel-control-prev" onClick={prevSlide}>
        &lt;
      </button>
      <button className="carousel-control-next" onClick={nextSlide}>
        &gt;
      </button>
    </div>
  );
}