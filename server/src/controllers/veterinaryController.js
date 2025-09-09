const {db} = require('../database');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendPasswordEmail = async (correo, password) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587, 
    secure: false, 
    auth: {
      user: process.env.MAIL, 
      pass: process.env.PASSWORD 
    }
  });

  
  const mailOptions = {
    from: 'SOPORTE EQUINO', 
    to: correo, 
    subject: 'Bienvenido a Soporte Equino', 
    text: `Hola, tu contraseña por defecto es: ${password}`, 
    html: `
        <html>
            <head>
                <style>
                    body {
                        font-family Arial, sans-serif;
                    }
                    .header {
                        background-color: #f1f1f1;
                        padding: 10px;
                        text-align: center;
                    }
                    .content {
                        margin: 20px;
                    }
                    .footer {
                        font-size: 12px;
                        color: #888;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Bienvenido a Soporte Equino</h1>
                </div>
                <div class="content">
                    <p>Hola,</p>
                    <p>Gracias por registrarte en nuestro servicio. Estamos encantados de tenerte con nosotros.</p>
                </div>
                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas.</p>
                    <p>Tu contraseña por defecto es: <strong>${password}</strong></p>
                </div>
            </body>
        </html> 
    `
  };

  // Envía el correo
  try {
    await transporter.sendMail(mailOptions);
    console.log('Correo enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
};

function generatePassword(longitud=10) {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < longitud; i++) {
      const indice = Math.floor(Math.random() * caracteres.length);
      password += caracteres[indice];
  }
  return password;
}

const getVeterinarys = async() => {
    const result = await db.query(`
        SELECT * FROM veterinario
    `)
    return result.length > 0 ? result[0] : null;
}

const getVeterinaryById = async(idVeterinario) => {
    const result = await db.query(`
        SELECT * FROM veterinario WHERE idVeterinario = ?
    `,
    [idVeterinario]
    )
    return result;
};

const createVeterinary = async(Cedula, Nombre, Apellido, Correo) => {
    const password = generatePassword();
    const Contraseña = await bcrypt.hash(password, 10);
    const result = await db.query(`
        INSERT INTO veterinario (Cedula, Nombre, Apellido, Correo, Contraseña) VALUES (?, ?, ?, ?, ?)
    `,
    [Cedula, Nombre, Apellido, Correo, Contraseña]
    );
    await sendPasswordEmail(Correo, password); // Enviar correo con la contraseña
    return result;
}

const updateVeterinary = async(idVeterinario, Cedula, Nombre, Apellido, Correo) => {
    const result = await db.query(`
        UPDATE veterinario SET Cedula = ?, Nombre = ?, Apellido = ?, Correo = ? WHERE idVeterinario = ?
    `,
    [Cedula, Nombre, Apellido, Correo, idVeterinario]
    );
    return result;
}

const deleteVeterinary = async(idVeterinario) => {
    const result = await db.query(`
        DELETE FROM veterinario WHERE idVeterinario = ?
    `,
    [idVeterinario]
    );
    return result;
}

module.exports = {
    getVeterinarys, 
    getVeterinaryById,
    createVeterinary,
    updateVeterinary,
    deleteVeterinary
}