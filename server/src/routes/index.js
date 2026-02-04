const express = require('express');
const route = express.Router();
const { body, validationResult } = require('express-validator');
const { db } = require('../database'); // Asegúrate de tener tu pool de conexiones configurado
const SECRET_KEY = process.env.SECRET_KEY || 'lossimpsom';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// const { OAuth2Client } = require('google-auth-library');
// const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const multer = require('multer');
// // --- Configuración de Multer ---
// // --- Configuración de Multer ---
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const { getItems, getItemById, createItem, updateItem, deleteItem } = require('../controllers/itemsController');
const { getVeterinarys, getVeterinaryById, createVeterinary, updateVeterinary, deleteVeterinary, getVeterinarystatus } = require('../controllers/veterinaryController')
const { getOwners, getOwnerById, createOwner, updateOwner, deleteOwner, rateOwner } = require('../controllers/ownerController');
const { getClinicalHistory, getClinicalHistoryById, createClinicalHistory, updateClinicalHistory, deleteClinicalHistory, getDashboardStats } = require('../controllers/clinicalHystory');
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController')


//RUTAS PROTEGIDAS
const authenticateToken = (req, res, next) => {
    // Obtener el token del encabezado de la solicitud
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // El token se envía como "Bearer TOKEN"

    if (!token) {
        // Si no hay token, el usuario no está autenticado
        return res.status(401).send('Acceso denegado. No se proporcionó token de autenticación.');
    }

    // Verificar el token
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // Si el token no es válido o ha expirado
            return res.status(403).send('Token de autenticación inválido.');
        }

        // Si el token es válido, guardar los datos del usuario en el objeto de solicitud
        // para que las rutas puedan acceder a ellos
        req.user = user;
        next(); // Continuar con la siguiente función (la ruta)
    });
};

// LOGIN VETERINARIOS
route.post('/api/login', [
    body('Correo').isString().notEmpty(),
    body('Contraseña').isString().notEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { Correo, Contraseña } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM veterinario WHERE Correo = ?', [Correo]);
        if (!users.length || !(await bcrypt.compare(Contraseña, users[0].Contraseña))) {
            return res.status(401).send('Invalid credentials');
        }

        const user = users[0];
        // Convertir Foto Buffer a base64 para que el frontend la vea
        if (user.Foto && Buffer.isBuffer(user.Foto)) {
            const base64String = user.Foto.toString('base64');
            user.Foto = `data:image/jpeg;base64,${base64String}`;
        }

        const token = jwt.sign({ id: user.idVeterinario }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: [user] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

/* 
// LOGIN CON GOOGLE - COMENTADO TEMPORALMENTE POR PROBLEMAS DE LIBRERÍA EN RENDER
route.post('/api/google-login', async (req, res) => {
    const { credential } = req.body;
    try {
        // 1. Verificar el token de Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload['email'];

        // 2. Buscar al veterinario por correo
        const [users] = await db.query('SELECT * FROM veterinario WHERE Correo = ?', [email]);
        if (!users.length) {
            return res.status(401).json({ 
                message: 'No se encontró un veterinario registrado con este correo de Google.' 
            });
        }

        const user = users[0];
        
        // Convertir Foto Buffer a base64
        if (user.Foto && Buffer.isBuffer(user.Foto)) {
            const base64String = user.Foto.toString('base64');
            user.Foto = `data:image/jpeg;base64,${base64String}`;
        }

        // 3. Generar nuestro propio JWT
        const token = jwt.sign({ id: user.idVeterinario }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token, user: [user] });
    } catch (error) {
        console.error('Error en Google Login:', error);
        res.status(500).json({ message: 'Error al autenticar con Google' });
    }
});
*/

//CONTRASEÑA POR DEFECTO

// Configurar Gmail con tu App Password - NUEVO
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL,
        pass: process.env.PASSWORD
    }
});

route.post('/api/send-password', (req, res) => {
    const { correo, contraseña } = req.body;

    const mailOptions = {
        from: 'Correo del dani o de soporte equino',
        to: correo,
        subject: 'Bienvenido a Soporte Equino',
        text: `Se ha creado tu cuenta en Soporte Equino y Tu contraseña es: ${contraseña}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).send('Correo enviado: ' + info.response);
    });
});

// NUEVA RUTA: CONTACTO LANDING
route.post('/api/contact', async (req, res) => {
    const { nombre, correo, telefono, tipo, mensaje } = req.body;

    if (!nombre || !correo || !mensaje) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, correo, mensaje)' });
    }

    const mailOptions = {
        from: `Contact Form <${process.env.MAIL}>`,
        to: 'dpaskate@gmail.com',
        subject: `Nuevo mensaje de contacto: ${tipo}`,
        html: `
            <h3>Nuevo mensaje desde el sitio web de Soporte Equino</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Correo:</strong> ${correo}</p>
            <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
            <p><strong>Interés:</strong> ${tipo}</p>
            <p><strong>Mensaje:</strong></p>
            <p>${mensaje}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Correo enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar correo de contacto:', error);
        res.status(500).json({ error: 'Error al enviar el correo' });
    }
});


// INSUMOS

route.get('/api/insumos', authenticateToken, async (req, res) => {
    try {
        const values = await getItems();
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los insumos' });
    }
});

route.get('/api/insumosview', async (req, res) => {
    try {
        const values = await getItems();
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los insumos' });
    }
});

route.get('/api/insumos/:idInsumos', authenticateToken, async (req, res) => {
    const { idInsumos } = req.params;
    try {
        const values = await getItemById(idInsumos);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el insumo' });
    }
});

route.post('/api/insumos', authenticateToken, async (req, res) => {
    const { Nombre, Descripcion, Foto, Precio } = req.body;
    console.log('📝 Creando insumo:', { Nombre, Descripcion, Precio, tieneFoto: !!Foto });

    try {
        // Convertir base64 a buffer para almacenar en LONGBLOB
        let fotoBuffer = null;
        if (Foto) {
            console.log('🖼️ Procesando imagen base64...');
            // Extraer solo los datos base64 (sin el prefijo data:image/...)
            const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
            fotoBuffer = Buffer.from(base64Data, 'base64');
            console.log('✅ Buffer creado, tamaño:', fotoBuffer.length, 'bytes');
        }

        const values = await createItem(Nombre, Descripcion, fotoBuffer, Precio);
        console.log('✅ Insumo creado exitosamente');
        res.status(201).json(values);
    } catch (error) {
        console.error('❌ Error al crear insumo:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            error: 'Error al crear el insumo',
            message: error.message,
            details: error.sqlMessage || error.toString()
        });
    }
});

route.put('/api/insumos/:idInsumos', authenticateToken, async (req, res) => {
    const { idInsumos } = req.params;
    const { Nombre, Descripcion, Foto, Precio } = req.body;
    try {
        // Convertir base64 a buffer si se proporciona una nueva foto
        let fotoBuffer = Foto;
        if (Foto && Foto.startsWith('data:image')) {
            // Es una nueva imagen en base64
            const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
            fotoBuffer = Buffer.from(base64Data, 'base64');
        }

        const values = await updateItem(idInsumos, Nombre, Descripcion, fotoBuffer, Precio);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el insumo' });
    }
});


route.delete('/api/insumos/:idInsumos', authenticateToken, async (req, res) => {
    const { idInsumos } = req.params;
    try {
        const values = await deleteItem(idInsumos);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el insumo' });
    }
});


// VETERINARIOS

route.get('/api/veterinarios', authenticateToken, async (req, res) => {
    try {
        const values = await getVeterinarys();
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Veterinarios' });
    }
});

route.get('/api/veterinariosstatus', async (req, res) => {
    try {
        const values = await getVeterinarystatus();
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Veterinarios' });
    }
});

route.get('/api/veterinarios/:idVeterinario', authenticateToken, async (req, res) => {
    const { idVeterinario } = req.params;
    try {
        const values = await getVeterinaryById(idVeterinario);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Veterinario' });
    }
});


route.post('/api/veterinarios', authenticateToken, async (req, res) => {
    const { Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, Foto, Redes } = req.body;

    try {
        const values = await createVeterinary(Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, Foto, Redes);
        res.status(201).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el Veterinario' });
    }
});

route.put('/api/veterinarios/:idVeterinario', authenticateToken, async (req, res) => {
    const { idVeterinario } = req.params;
    const {
        Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad,
        Estado, estado, Foto, Redes, redes,
        Contraseña, contrasena, password
    } = req.body;

    // Normalizar campos que podrían venir con diferente capitalización o sin ñ
    const finalEstado = Estado || estado;
    const finalRedes = Redes || redes;
    const finalContrasena = Contraseña || contrasena || password;

    try {
        await updateVeterinary(
            idVeterinario, Cedula, Nombre, Apellido, Correo,
            Descripcion, Especialidad, Foto, finalEstado,
            finalRedes, finalContrasena
        );

        const updated = await getVeterinaryById(idVeterinario);
        if (updated.length === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado después de actualizar' });
        }
        res.status(200).json(updated[0]);
    } catch (error) {
        console.error('Error al actualizar veterinario:', error);
        res.status(500).json({ error: 'Error al actualizar el Veterinario', details: error.message });
    }
});

route.delete('/api/veterinarios/:idVeterinario', authenticateToken, async (req, res) => {
    const { idVeterinario } = req.params;
    try {
        const values = await deleteVeterinary(idVeterinario);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el Veterinario' });
    }
});

//PROPIETARIOS

route.get('/api/propietarios', authenticateToken, async (req, res) => {
    try {
        const veterinarioId = req.user.id;
        const values = await getOwners(veterinarioId);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Propietarios', message: error.message });
    }
});

route.get('/api/propietarios/:idPropietario', authenticateToken, async (req, res) => {
    const { idPropietario } = req.params;
    try {
        const values = await getOwnerById(idPropietario);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Propietario' });
    }
});

route.post('/api/propietarios', authenticateToken, async (req, res) => {
    const { Cedula, Nombre, Apellido, Telefono } = req.body;
    const idVeterinario = req.user.id;
    try {
        const values = await createOwner(Cedula, Nombre, Apellido, Telefono, idVeterinario);
        res.status(201).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el propietario' });
    }
});

route.put('/api/propietarios/:idPropietario', authenticateToken, async (req, res) => {
    const { idPropietario } = req.params;
    const { Cedula, Nombre, Apellido, Telefono } = req.body;
    const idVeterinario = req.user.id;
    try {
        // Primero verificar si el propietario pertenece al veterinario
        const [owner] = await db.query('SELECT * FROM propietario WHERE idPropietario = ? AND idVeterinario = ?', [idPropietario, idVeterinario]);
        if (!owner.length) {
            return res.status(403).json({ error: 'No tienes permiso para editar este propietario' });
        }

        const values = await updateOwner(idPropietario, Cedula, Nombre, Apellido, Telefono);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el Propietario' });
    }
});

route.delete('/api/propietarios/:idPropietario', authenticateToken, async (req, res) => {
    const { idPropietario } = req.params;
    const idVeterinario = req.user.id;
    try {
        // Verificar propiedad
        const [owner] = await db.query('SELECT * FROM propietario WHERE idPropietario = ? AND idVeterinario = ?', [idPropietario, idVeterinario]);
        if (!owner.length) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este propietario' });
        }

        const values = await deleteOwner(idPropietario);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el Propietario' });
    }
});

route.post('/api/propietarios/:idPropietario/rate', authenticateToken, async (req, res) => {
    const { idPropietario } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    try {
        const result = await rateOwner(idPropietario, rating);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al calificar al propietario' });
    }
});

//HISTORIA CLINICA

route.get('/api/historia_clinica', authenticateToken, async (req, res) => {
    const veterinarioId = req.user.id;
    try {
        const values = await getClinicalHistory(veterinarioId);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las Historias Clinicas', message: error.message });
    }
});

route.get('/api/historia_clinica/buscar', authenticateToken, async (req, res) => {
    const { registro, paciente, propietario } = req.query;
    try {
        let sql = `
            SELECT h.*, p.Nombre as NombrePaciente, pr.Nombre as NombrePropietario, pr.Apellido as ApellidoPropietario 
            FROM historia_clinica h
            LEFT JOIN paciente p ON h.Paciente = p.idPaciente
            LEFT JOIN propietario pr ON p.Propietario = pr.idPropietario
            WHERE 1=1
        `;
        const params = [];

        if (registro) {
            sql += " AND (p.Numero_registro LIKE ? OR h.idHistoria_clinica LIKE ?)";
            params.push(`%${registro}%`, `%${registro}%`);
        }
        if (paciente) {
            sql += " AND p.Nombre LIKE ?";
            params.push(`%${paciente}%`);
        }
        if (propietario) {
            sql += " AND (pr.Nombre LIKE ? OR pr.Apellido LIKE ?)";
            params.push(`%${propietario}%`, `%${propietario}%`);
        }

        const [results] = await db.query(sql, params);

        // Convertir fotos si existen
        const formattedResults = results.map(historia => {
            if (historia.Foto && Buffer.isBuffer(historia.Foto)) {
                const base64String = historia.Foto.toString('base64');
                historia.Foto = `data:image/jpeg;base64,${base64String}`;
            }
            return historia;
        });

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar historias clínicas' });
    }
});

route.get('/api/historia_clinica/:idHistoria_clinica', authenticateToken, async (req, res) => {
    const { idHistoria_clinica } = req.params;
    try {
        const values = await getClinicalHistoryById(idHistoria_clinica);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Historia Clinica no encontrada' });
        }
        res.status(200).json(values[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la Historia Clinica' });
    }
});

route.post('/api/historia_clinica', authenticateToken, async (req, res) => {
    const { Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha } = req.body;
    try {
        const values = await createClinicalHistory(Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha);
        res.status(201).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la Historia Clinica' });
    }
});

route.put('/api/historia_clinica/:idHistoria_clinica', authenticateToken, async (req, res) => {
    const { idHistoria_clinica } = req.params;
    const { Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha } = req.body;
    try {
        const values = await updateClinicalHistory(idHistoria_clinica, Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Historia Clinica no encontrada' });
        }
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la Historia Clinica' });
    }
});

route.delete('/api/historia_clinica/:idHistoria_clinica', authenticateToken, async (req, res) => {
    const { idHistoria_clinica } = req.params;
    const idVeterinario = req.user.id;
    try {
        // Verificar si la historia clínica pertenece al veterinario logueado
        const [history] = await db.query('SELECT * FROM historia_clinica WHERE idHistoria_clinica = ? AND Veterinario = ?', [idHistoria_clinica, idVeterinario]);

        if (!history.length) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar esta Historia Clínica' });
        }

        const values = await deleteClinicalHistory(idHistoria_clinica);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la Historia Clinica' });
    }
});

route.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    const veterinarioId = req.user.id;
    try {
        const stats = await getDashboardStats(veterinarioId);
        res.status(200).json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener estadísticas del dashboard', message: error.message });
    }
});



// PACIENTES

route.get('/api/pacientes', authenticateToken, async (req, res) => {
    const veterinarioId = req.user.id;
    try {
        const values = await getPatients(veterinarioId);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Pacientes' });
    }
});

route.get('/api/pacientes/:idPaciente', authenticateToken, async (req, res) => {
    const { idPaciente } = req.params;
    try {
        const values = await getPatientById(idPaciente);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        res.status(200).json(values[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Paciente' });
    }
});

route.post('/api/pacientes', authenticateToken, async (req, res) => {
    const { Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario } = req.body;
    const idVeterinario = req.user.id;
    try {
        const values = await createPatient(Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario, idVeterinario);
        res.status(201).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el Paciente' });
    }
});

route.put('/api/pacientes/:idPaciente', authenticateToken, async (req, res) => {
    const { idPaciente } = req.params;
    const { Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario } = req.body;
    const idVeterinario = req.user.id;
    try {
        // Verificar propiedad
        const [patient] = await db.query('SELECT * FROM paciente WHERE idPaciente = ? AND idVeterinario = ?', [idPaciente, idVeterinario]);
        if (!patient.length) {
            return res.status(403).json({ error: 'No tienes permiso para editar este paciente' });
        }

        const values = await updatePatient(idPaciente, Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el Paciente' });
    }
});

route.delete('/api/pacientes/:idPaciente', authenticateToken, async (req, res) => {
    const { idPaciente } = req.params;
    const idVeterinario = req.user.id;
    try {
        // Verificar propiedad
        const [patient] = await db.query('SELECT * FROM paciente WHERE idPaciente = ? AND idVeterinario = ?', [idPaciente, idVeterinario]);
        if (!patient.length) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este paciente' });
        }

        const values = await deletePatient(idPaciente);
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el Paciente' });
    }
});




// Verificar conexión con Gmail - NUEVO
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error configurando Gmail:', error);
    } else {
        console.log('✅ Gmail configurado correctamente');
    }
});

// Almacenar tokens temporalmente - NUEVO (en producción usar BD)
const resetTokens = new Map();


// NUEVA RUTA para recuperar contraseña
route.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // 1. Verificar si el usuario existe en la base de datos
        const [user] = await db.query('SELECT * FROM veterinario WHERE Correo = ?', [email]);
        if (!user.length) {
            // No reveles si el correo existe por motivos de seguridad
            return res.json({ success: true, message: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
        }

        const idVeterinario = user[0].idVeterinario;

        // 2. Generar el token y la fecha de expiración
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 hora de validez

        // 3. Almacenar el token y su expiración en la base de datos
        await db.query('UPDATE veterinario SET resetToken = ?, resetTokenExpiry = ? WHERE idVeterinario = ?', [resetToken, tokenExpiry, idVeterinario]);

        // 4. Crear el enlace para el email
        const resetLink = `https://soporte-equino.onrender.com/reset-password/${resetToken}`; // Asegúrate de que esta URL sea la de tu frontend

        // Configurar email
        const mailOptions = {
            from: `"Soporte Equino" <${process.env.MAIL}>`,
            to: email,
            subject: '🔐 Restablecer contraseña - Soporte Equino',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0d3b66; margin: 0; font-size: 28px;">🔐 Restablecer Contraseña</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola,<br><br>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #0d3b66; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 25px; font-weight: bold; 
                        font-size: 16px; display: inline-block;">
                ✨ Restablecer mi contraseña
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              O copia este enlace: ${resetLink}
            </p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                ⚠️ <strong>Importante:</strong> Este enlace expira en 1 hora.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si no solicitaste esto, ignora este correo.
            </p>
            
          </div>
        </div>
      `
        };

        // Enviar email
        await transporter.sendMail(mailOptions);

        console.log('✅ Email enviado a:', email);

        res.json({
            success: true,
            message: 'Correo de recuperación enviado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error enviando email:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el correo'
        });
    }
});

// El frontend maneja la visualización de la página de reset a través de React Router.

// NUEVA RUTA para procesar la nueva contraseña
route.post('/api/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // 1. Validar las contraseñas
    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden' });
    }

    try {
        // 2. Buscar el token en la base de datos y verificar su validez y expiración
        const [user] = await db.query('SELECT * FROM veterinario WHERE resetToken = ? AND resetTokenExpiry > ?', [token, new Date()]);

        if (!user.length) {
            return res.status(400).json({ success: false, message: 'El enlace es inválido o ha expirado.' });
        }

        const idVeterinario = user[0].idVeterinario;

        // 3. Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Actualizar la contraseña del usuario y eliminar el token de la base de datos
        const [updateResult] = await db.query(
            'UPDATE veterinario SET Contraseña = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE idVeterinario = ?',
            [hashedPassword, idVeterinario]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        // 5. Responder con un mensaje de éxito en formato JSON
        res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente.' });

    } catch (error) {
        console.error("Error al actualizar la contraseña:", error);
        res.status(500).json({ success: false, message: 'Error interno al actualizar la contraseña.' });
    }
});

module.exports = route
