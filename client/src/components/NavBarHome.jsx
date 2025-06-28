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
            <li><a href="" onClick={handleClickHistoria}>Inicio</a></li>
            <li><a href="" onClick={handleClickHistoria}>Historias Clinicas</a></li>
            <li><a href="" onClick={handleClickHistoria}>Veterinarios</a></li>
            <li><a href="" onClick = {handleClickInsumos} >Insumos</a></li>
            <li><a href="" onClick={handleClickHistoria}>Propietarios</a></li>
            <li><a href="" onClick={handleClickHistoria}>Pacientes</a></li>
        </ul>
      </nav>
    </div>
  )
}
