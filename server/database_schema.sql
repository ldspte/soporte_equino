-- Script de creación de base de datos para Soporte Equino
CREATE DATABASE IF NOT EXISTS soporte_equino;
USE soporte_equino;

-- Tabla de Veterinarios
CREATE TABLE IF NOT EXISTS `veterinario` (
  `idVeterinario` int(11) NOT NULL AUTO_INCREMENT,
  `Cedula` varchar(20) DEFAULT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Apellido` varchar(100) NOT NULL,
  `Correo` varchar(150) NOT NULL UNIQUE,
  `Descripcion` text DEFAULT NULL,
  `Especialidad` varchar(100) DEFAULT NULL,
  `Contraseña` varchar(255) NOT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Redes` text DEFAULT NULL,
  `Estado` varchar(20) DEFAULT 'Activo',
  `resetToken` varchar(255) DEFAULT NULL,
  `resetTokenExpiry` datetime DEFAULT NULL,
  PRIMARY KEY (`idVeterinario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Propietarios
CREATE TABLE IF NOT EXISTS `propietario` (
  `idPropietario` int(11) NOT NULL AUTO_INCREMENT,
  `Cedula` varchar(20) DEFAULT NULL,
  `Nombre` varchar(100) NOT NULL,
  `Apellido` varchar(100) NOT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `CalificacionPromedio` decimal(3,2) DEFAULT '0.00',
  `TotalCalificaciones` int(11) DEFAULT '0',
  `idVeterinario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idPropietario`),
  KEY `fk_propietario_veterinario` (`idVeterinario`),
  CONSTRAINT `fk_propietario_veterinario` FOREIGN KEY (`idVeterinario`) REFERENCES `veterinario` (`idVeterinario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Pacientes
CREATE TABLE IF NOT EXISTS `paciente` (
  `idPaciente` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Numero_registro` varchar(50) DEFAULT NULL,
  `Numero_chip` varchar(50) DEFAULT NULL,
  `Raza` varchar(100) DEFAULT NULL,
  `Edad_valor` int(11) DEFAULT NULL,
  `Edad_unidad` varchar(10) DEFAULT NULL,
  `Fecha_referencia` date DEFAULT NULL,
  `Sexo` varchar(10) DEFAULT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Propietario` int(11) DEFAULT NULL,
  `idVeterinario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idPaciente`),
  KEY `fk_paciente_propietario` (`Propietario`),
  KEY `fk_paciente_veterinario` (`idVeterinario`),
  CONSTRAINT `fk_paciente_propietario` FOREIGN KEY (`Propietario`) REFERENCES `propietario` (`idPropietario`) ON DELETE SET NULL,
  CONSTRAINT `fk_paciente_veterinario` FOREIGN KEY (`idVeterinario`) REFERENCES `veterinario` (`idVeterinario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Insumos
CREATE TABLE IF NOT EXISTS `insumos` (
  `idInsumos` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(100) NOT NULL,
  `Descripcion` text DEFAULT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Precio` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`idInsumos`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Historias Clínicas
CREATE TABLE IF NOT EXISTS `historia_clinica` (
  `idHistoria_clinica` int(11) NOT NULL AUTO_INCREMENT,
  `Veterinario` int(11) DEFAULT NULL,
  `Paciente` int(11) DEFAULT NULL,
  `Vacunas` text DEFAULT NULL,
  `Enfermedades` text DEFAULT NULL,
  `Anamnesis` text DEFAULT NULL,
  `Evaluacion_distancia` text DEFAULT NULL,
  `Desparasitacion` text DEFAULT NULL,
  `Pliegue_cutaneo` varchar(100) DEFAULT NULL,
  `Frecuencia_respiratoria` varchar(100) DEFAULT NULL,
  `Motilidad_gastrointestinal` varchar(100) DEFAULT NULL,
  `Temperatura` varchar(50) DEFAULT NULL,
  `Pulso` varchar(50) DEFAULT NULL,
  `Frecuencia_cardiaca` varchar(100) DEFAULT NULL,
  `Llenado_capilar` varchar(100) DEFAULT NULL,
  `Mucosas` varchar(100) DEFAULT NULL,
  `Pulso_digital` varchar(100) DEFAULT NULL,
  `Aspecto` text DEFAULT NULL,
  `Locomotor` text DEFAULT NULL,
  `Respiratorio` text DEFAULT NULL,
  `Circulatorio` text DEFAULT NULL,
  `Digestivo` text DEFAULT NULL,
  `Genitourinario` text DEFAULT NULL,
  `Sis_nervioso` text DEFAULT NULL,
  `Oidos` text DEFAULT NULL,
  `Ojos` text DEFAULT NULL,
  `Glangios_linfaticos` text DEFAULT NULL,
  `Piel` text DEFAULT NULL,
  `Diagnostico_integral` text DEFAULT NULL,
  `Tratamiento` text DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  `Ayudas_diagnosticas` text DEFAULT NULL,
  `Foto` varchar(255) DEFAULT NULL,
  `Fecha` date DEFAULT NULL,
  PRIMARY KEY (`idHistoria_clinica`),
  KEY `fk_historia_veterinario` (`Veterinario`),
  KEY `fk_historia_paciente` (`Paciente`),
  CONSTRAINT `fk_historia_paciente` FOREIGN KEY (`Paciente`) REFERENCES `paciente` (`idPaciente`) ON DELETE CASCADE,
  CONSTRAINT `fk_historia_veterinario` FOREIGN KEY (`Veterinario`) REFERENCES `veterinario` (`idVeterinario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de Seguimientos
CREATE TABLE IF NOT EXISTS `seguimiento` (
  `idSeguimiento` int(11) NOT NULL AUTO_INCREMENT,
  `idHistoria_clinica` int(11) NOT NULL,
  `Fecha` datetime DEFAULT NULL,
  `Descripcion` text DEFAULT NULL,
  `Tratamiento` text DEFAULT NULL,
  `Observaciones` text DEFAULT NULL,
  `idVeterinario` int(11) DEFAULT NULL,
  PRIMARY KEY (`idSeguimiento`),
  KEY `fk_seguimiento_historia` (`idHistoria_clinica`),
  KEY `fk_seguimiento_veterinario` (`idVeterinario`),
  CONSTRAINT `fk_seguimiento_historia` FOREIGN KEY (`idHistoria_clinica`) REFERENCES `historia_clinica` (`idHistoria_clinica`) ON DELETE CASCADE,
  CONSTRAINT `fk_seguimiento_veterinario` FOREIGN KEY (`idVeterinario`) REFERENCES `veterinario` (`idVeterinario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
