const express = require('express');
const route = express.Router();
const { body, validationResult } = require('express-validator');
const {db} = require('../database'); // Asegúrate de tener tu pool de conexiones configurado
const SECRET_KEY = process.env.SECRET_KEY || 'lossimpsom';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const upload = multer({ dest: 'uploads/' }); // Configura multer para manejar archivos subidos
const {getItems, getItemById, createItem, updateItem, deleteItem} = require('../controllers/itemsController');
const {getVeterinarys, getVeterinaryById, createVeterinary, updateVeterinary, deleteVeterinary} = require('../controllers/veterinaryController')
const {getOwners, getOwnerById, createOwner, updateOwner, deleteOwner} = require('../controllers/ownerController');
const {getClinicalHistory, getClinicalHistoryById, createClinicalHistory, updateClinicalHistory, deleteClinicalHistory} = require('../controllers/clinicalHystory');
const {getPatients, getPatientById, createPatient, updatePatient, deletePatient} = require('../controllers/patientController')

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
    const [user] = await db.query('SELECT * FROM veterinario WHERE Correo = ?', [Correo]);
    if (!user.length || !(await bcrypt.compare(Contraseña, user[0].Contraseña))) {
      return res.status(401).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user[0].idVeterinario }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token , user});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

//CONTRASEÑA POR DEFECTO

// Configurar Gmail con tu App Password - NUEVO
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 465, 
  secure: true, 
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


// INSUMOS

route.get('/api/insumos', async (req, res) => {
    try{
        const values = await getItems();
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los insumos' });
    }
});

route.get('/api/insumos/:idInsumos', async (req, res) => {
    const { idInsumos } = req.params;
    try{
        const values = await getItemById(idInsumos);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values[0]);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el insumo' });
    }
});

route.post('/api/insumos', upload.single('Foto'), async (req, res) => {
    const { Nombre, Descripcion, Precio } = req.body;
    const Foto = req.file ? req.file.filename : null; // Guarda solo el nombre del archivo
    // fs.renameSync(req.file.path, Foto);
    try {
        const values = await createItem(Nombre, Descripcion, Foto, Precio);
        res.status(201).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el insumo' });
    }
});

route.put('/api/insumos/:idInsumos', upload.single('Foto'), async (req, res) => {
    const { idInsumos } = req.params;
    const { Nombre, Descripcion, Precio } = req.body;
    const Foto = req.file ? req.originalname : null; // Guarda solo el nombre del archivo
    try {
        const values = await updateItem(idInsumos, Nombre, Descripcion, Foto, Precio);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el insumo' });
    }
});


route.delete('/api/insumos/:idInsumos', async (req, res) => {
    const { idInsumos } = req.params;
    try{
        const values = await deleteItem(idInsumos);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el insumo' });
    }
});


// VETERINARIOS

route.get('/api/veterinarios', async(req, res) => {
    try{
        const values = await getVeterinarys();
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Veterinarios' });
    }
});

route.get('/api/veterinarios/:idVeterinario', async (req, res) => {
    const { idVeterinario } = req.params;
    try{
        const values = await getVeterinaryById(idVeterinario);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values[0]);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Veterinario' });
    }
});


route.post('/api/veterinarios', async (req, res) => {
    const { Cedula, Nombre, Apellido, Correo } = req.body;
    try{
        const values = await createVeterinary(Cedula, Nombre, Apellido, Correo);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el Veterinario' });
    }
});

route.put('/api/veterinarios/:idVeterinario', async (req, res) => {
    const { idVeterinario } = req.params;
    const {Cedula, Nombre, Apellido, Correo} = req.body;
    try{
        const values = await updateVeterinary(idVeterinario, Cedula, Nombre, Apellido, Correo);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el Veterinario' });
    }
});

route.delete('/api/veterinarios/:idVeterinario', async (req, res) => {
    const { idVeterinario } = req.params;
    try{
        const values = await deleteVeterinary(idVeterinario);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el Veterinario'});
    }
});

//PROPIETARIOS

route.get('/api/propietarios', async(req, res) => {
    try{
        const values = await getOwners();
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Propietarios' });
    }
});

route.get('/api/propietarios/:idPropietario', async (req, res) => {
    const { idPropietario } = req.params;
    try{
        const values = await getOwnerById(idPropietario);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Veterinario no encontrado' });
        }
        res.status(200).json(values[0]);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Propietario' });
    }
});

route.post('/api/propietarios', async (req, res) => {
    const {Cedula, Nombre, Apellido, Telefono} = req.body;
    try{
        const values = await createOwner(Cedula, Nombre, Apellido, Telefono);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el propietario' });
    }
});

route.put('/api/propietarios/:idPropietario', async (req, res) => {
    const { idPropietario } = req.params;
    const {Cedula, Nombre, Apellido, Telefono} = req.body;
    try{
        const values = await updateOwner(idPropietario, Cedula, Nombre, Apellido, Telefono);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Propietario no encontrado' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el Propietario' });
    }
});

route.delete('/api/propietarios/:idPropietario', async (req, res) => {
    const { idPropietario } = req.params;
    try{
        const values = await deleteOwner(idPropietario);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Propietario no encontrado' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el Propietario'});
    }
});

//HISTORIA CLINICA

route.get('/api/historia_clinica', async(req, res) => {
    try{
        const values = await getClinicalHistory();
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las Historias Clinicas' });
    }
});

route.get('/api/historia_clinica/:idHistoria_clinica', async (req, res) => {
    const { idHistoria_clinica } = req.params;
    try{
        const values = await getClinicalHistoryById(idHistoria_clinica);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Historia Clinica no encontrada' });
        }
        res.status(200).json(values[0]);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la Historia Clinica' });
    }
});

route.post('/api/historia_clinica', async (req, res) => {
    const {Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliege_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas} = req.body;
    try{
        const values = await createClinicalHistory(Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliege_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la Historia Clinica' });
    }
});

route.put('/api/historia_clinica/:idHistoria_clinica', async (req, res) => {
    const { idHistoria_clinica } = req.params;
    const {Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliege_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas} = req.body;
    try{
        const values = await updateClinicalHistory(idHistoria_clinica, Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliege_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Historia Clinica no encontrada' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la Historia Clinica' });
    }
});

route.delete('/api/historia_clinica/:idHistoria_clinica', async (req, res) => {
    const { idHistoria_clinica } = req.params;
    try{
        const values = await deleteClinicalHistory(idHistoria_clinica);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Historia Clinica no encontrada' });
        }
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la Historia Clinica'});
    }
});



// PACIENTES

route.get('/api/pacientes', async(req, res) => {
    try{
        const values = await getPatients();
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los Pacientes' });
    }
});

route.get('/api/pacientes/:idPaciente', async (req, res) => {
    const { idPaciente } = req.params;
    try{
        const values = await getPatientById(idPaciente);
        if (values.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }
        res.status(200).json(values[0]);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el Paciente' });
    }
});

route.post('/api/pacientes', async (req, res) => {
    const {Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario} = req.body;
    try{
        const values = await createPatient(Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el Paciente' });
    }
});

route.put('/api/pacientes/:idPaciente', async (req, res) => {
    const { idPaciente } = req.params;
    const {Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario} = req.body;
    try{
        const values = await updatePatient(idPaciente, Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado'});
        };
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el Paciente'});
    }
});

route.delete('/api/paciente/:idPaciente', async (req, res) => {
    const { idPaciente } = req.params;
    try{
        const values = await deletePatient(idPaciente);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado'});
        };
        res.status(200).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el Paciente'});
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
route.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  console.log('📧 Solicitud de recuperación para:', email);
  
  try {
    // Aquí deberías verificar si el usuario existe en tu BD
    // Por ahora simulamos que existe
    const usuarioExiste = true; // Reemplaza con tu lógica de BD
    
    if (!usuarioExiste) {
      return res.status(404).json({ 
        success: false, 
        message: 'No encontramos una cuenta con ese correo electrónico' 
      });
    }
    
    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = Date.now() + 3600000; // 1 hora
    
    // Guardar token
    resetTokens.set(resetToken, {
      email: email.toLowerCase(),
      expires: tokenExpiry,
      used: false
    });
    
    // URL para restablecer
    const resetLink = `http://localhost:3001/reset-password/${resetToken}`;
    
    // Configurar email
    const mailOptions = {
      from: '"Mi App Móvil" <michelleandrea217@gmail.com>',
      to: email,
      subject: '🔐 Restablecer contraseña - Beefleet',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FB8500; margin: 0; font-size: 28px;">🔐 Restablecer Contraseña</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola,<br><br>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #FB8500; color: white; padding: 15px 30px; 
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

// NUEVA RUTA para manejar el enlace (cuando hacen click)
route.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const tokenData = resetTokens.get(token);
  
  if (!tokenData || Date.now() > tokenData.expires || tokenData.used) {
    return res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: #e74c3c;">❌ Enlace inválido o expirado</h2>
          <p>Este enlace no es válido, ya fue usado o expiró.</p>
        </body>
      </html>
    `);
  }
  console.log(tokenData);
  
  // Mostrar formulario para nueva contraseña
  res.send(`
    <html>
      <head>
        <title>Restablecer Contraseña</title>
        <style>
          body { font-family: Arial; max-width: 400px; margin: 50px auto; padding: 20px; }
          input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 5px; }
          button { background-color: #FB8500; color: white; padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
        </style>
      </head>
      <body>
        <h2 style="color: #FB8500; text-align: center;">🔐 Nueva Contraseña</h2>
        <form action="/reset-password/${token}" method="POST">
          <input type="password" name="password" placeholder="Nueva contraseña" required minlength="6">
          <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" required minlength="6">
          <button type="submit">Actualizar contraseña</button>
        </form>
      </body>
    </html>
  `);
});

// NUEVA RUTA para procesar la nueva contraseña
route.post('/reset-password/:token', async (req, res) => {
 
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  
  const tokenData = resetTokens.get(token);
  
  if (!tokenData || Date.now() > tokenData.expires || tokenData.used) {
    return res.send('<h2>❌ Error: Enlace inválido o expirado</h2>');
  }
  
  if (password !== confirmPassword) {
    return res.send('<h2>❌ Error: Las contraseñas no coinciden</h2>');
  }
  
  // Marcar token como usado
  tokenData.used = true;
  resetTokens.set(token, tokenData);
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const correo_conductor = tokenData.correo_conductor;
  
    const result = await newpasswordDriver(correo_conductor, hashedPassword);
  
    console.log(`🔑 Nueva contraseña para ${tokenData.correo_conductor}:`, hashedPassword);
    if (result.affectedRows === 0) {
      return res.status(404).send('<h2>❌ Error: Usuario no encontrado</h2>');
    }
  
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h2 style="color: #27ae60;">✅ ¡Contraseña actualizada!</h2>
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          <p>Ya puedes iniciar sesión en la app.</p>
        </body>
      </html>
    `);
    
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    return res.status(500).send('<h2>❌ Error interno al actualizar la contraseña</h2>');
  }
});

module.exports = route
