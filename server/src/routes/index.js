const express = require('express');
const route = express.Router();
const { body, validationResult } = require('express-validator');
const {db} = require('../database'); // Asegúrate de tener tu pool de conexiones configurado
const SECRET_KEY = process.env.SECRET_KEY || 'lossimpsom';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const {getItems, getItemById, createItem, updateItem, deleteItem} = require('../controllers/itemsController');
const {getVeterinarys, getVeterinaryById, createVeterinary, updateVeterinary, deleteVeterinary} = require('../controllers/veterinaryController')
const {getOwners, getOwnerById, createOwner, updateOwner, deleteOwner} = require('../controllers/ownerController');
const {getClinicalHistiry, getClinicalHistoryById, createClinicalHistory, updateClinicalHistory, deleteClinicalHistory} = require('../controllers/clinicalHystory');
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

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
      user: 'ldspte9807@gmail.com',
      pass: 'lossimpsom123'
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

route.post('/api/insumos', async (req, res) => {
    const { Nombre, Descripcion, Foto, Precio } = req.body;
    try{
        const values = await createItem(Nombre, Descripcion, Foto, Precio);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el insumo' });
    }
});

route.put('/api/insumos/:idInsumos', async (req, res) => {
    const { idInsumos } = req.params;
    const { Nombre, Descripcion, Foto, Precio } = req.body;
    try{
        const values = await updateItem(idInsumos, Nombre, Descripcion, Foto, Precio);
        if (values.affectedRows === 0) {
            return res.status(404).json({ error: 'Insumo no encontrado' });
        }
        res.status(200).json(values);
    }catch (error) {
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
    const { Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad } = req.body;
    try{
        const values = await createVeterinary(Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el Veterinario' });
    }
});

route.put('/api/veterinarios/:idVeterinario', async (req, res) => {
    const { idVeterinario } = req.params;
    const {Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad} = req.body;
    try{
        const values = await updateVeterinary(idVeterinario, Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad);
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
        const values = await getClinicalHistiry();
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
    const {Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones} = req.body;
    try{
        const values = await createClinicalHistory(Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la Historia Clinica' });
    }
});

route.put('/api/historia_clinica/:idHistoria_clinica', async (req, res) => {
    const { idHistoria_clinica } = req.params;
    const {Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones} = req.body;
    try{
        const values = await updateClinicalHistory(idHistoria_clinica, Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones);
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
    const {Nombre, Raza, Edad, Sexo, Propietario} = req.body;
    try{
        const values = await createPatient(Nombre, Raza, Edad, Sexo, Propietario);
        res.status(201).json(values);
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el Paciente' });
    }
});

route.put('/api/pacientes/:idPaciente', async (req, res) => {
    const { idPaciente } = req.params;
    const {Nombre, Raza, Edad, Sexo, Propietario} = req.body;
    try{
        const values = await updatePatient(idPaciente, Nombre, Raza, Edad, Sexo, Propietario);
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

module.exports = route
