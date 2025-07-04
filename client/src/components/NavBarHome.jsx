import Logo from '../assets/img/logo.png';
import { useState } from 'react';

export default function NavBarHome({}) {
  return (
    <div>
      <nav className='navmenu'>
        <a href="index.html">
            <img src={Logo} alt="" />
        </a>
        <ul>
            <li><a href="" >Inicio</a></li>
            <li><a href="" >Historias Clinicas</a></li>
            <li><a href="" >Veterinarios</a></li>
            <li><a href="" >Insumos</a></li>
            <li><a href="" >Propietarios</a></li>
            <li><a href="" >Pacientes</a></li>
        </ul>
      </nav>
    </div>
  )
}
