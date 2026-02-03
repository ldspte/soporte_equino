const { db } = require('../database');
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
        from: `"SOPORTE EQUINO" <${process.env.MAIL}>`,
        to: correo,
        subject: 'Bienvenido a Soporte Equino',
        text: `Hola, tu contraseña por defecto es: ${password}`,
        html: `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
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
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado exitosamente:', info.messageId);
    } catch (error) {
        console.error('❌ Error detallado al enviar correo:', {
            code: error.code,
            command: error.command,
            response: error.response,
            message: error.message
        });
    }
};

function generatePassword(longitud = 10) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < longitud; i++) {
        const indice = Math.floor(Math.random() * caracteres.length);
        password += caracteres[indice];
    }
    return password;
}

const getVeterinarys = async () => {
    const [result] = await db.query(`
        SELECT * FROM veterinario
    `)
    const veterinariosConFoto = result.map(veterinario => {
        if (veterinario.Foto && Buffer.isBuffer(veterinario.Foto)) {
            const base64String = veterinario.Foto.toString('base64');
            veterinario.Foto = `data:image/jpeg;base64,${base64String}`;
        }
        return veterinario;
    });
    return veterinariosConFoto;
}

const getVeterinarystatus = async () => {
    const [result] = await db.query(`
        SELECT * FROM veterinario WHERE estado = 'Activo'
    `)
    const veterinariosConFoto = result.map(veterinario => {
        if (veterinario.Foto && Buffer.isBuffer(veterinario.Foto)) {
            const base64String = veterinario.Foto.toString('base64');
            veterinario.Foto = `data:image/jpeg;base64,${base64String}`;
        }
        return veterinario;
    });
    return veterinariosConFoto;
}

const getVeterinaryById = async (idVeterinario) => {
    const [result] = await db.query(`
        SELECT * FROM veterinario WHERE idVeterinario = ?
    `,
        [idVeterinario]
    )
    if (result.length > 0 && result[0].Foto && Buffer.isBuffer(result[0].Foto)) {
        const base64String = result[0].Foto.toString('base64');
        result[0].Foto = `data:image/jpeg;base64,${base64String}`;
    }
    return result;
};

const createVeterinary = async (Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, Foto, Redes) => {
    const password = generatePassword();
    const Contraseña = await bcrypt.hash(password, 10);

    // Asegurar que Foto sea Buffer si viene como base64 o similar
    let fotoBuffer = Foto;
    if (typeof Foto === 'string' && Foto.startsWith('data:image')) {
        const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
        fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    const result = await db.query(`
        INSERT INTO veterinario (Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, Contraseña, Foto, Redes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, Contraseña, fotoBuffer, Redes]
    );
    await sendPasswordEmail(Correo, password); // Enviar correo con la contraseña
    return result;
}

const updateVeterinary = async (idVeterinario, Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, Foto, Estado, Redes, Contraseña) => {
    // Asegurar que Foto sea Buffer si viene como base64
    let fotoBuffer = Foto;
    if (typeof Foto === 'string' && Foto.startsWith('data:image')) {
        const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
        fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    // Usar nombres de columnas consistentes con la base de datos
    // Si Estado es undefined, intentamos usar el valor de la base de datos o lo omitimos para no sobreescribir con NULL
    let sql = `UPDATE veterinario SET Cedula = ?, Nombre = ?, Apellido = ?, Correo = ?, Descripcion = ?, Especialidad = ?, Foto = ?, Redes = ?`;
    const params = [Cedula, Nombre, Apellido, Correo, Descripcion, Especialidad, fotoBuffer, Redes];

    // Manejar Estado de forma segura (MySQL suele ser case-insensitive, pero por si acaso)
    if (Estado !== undefined) {
        sql += `, Estado = ?`;
        params.push(Estado);
    }

    if (Contraseña) {
        const hashedPassword = await bcrypt.hash(Contraseña, 10);
        sql += `, Contraseña = ?`;
        params.push(hashedPassword);
    }

    sql += ` WHERE idVeterinario = ?`;
    params.push(idVeterinario);

    const [result] = await db.query(sql, params);
    return result;
}

const deleteVeterinary = async (idVeterinario) => {
    const result = await db.query(`
        DELETE FROM veterinario WHERE idVeterinario = ?
    `,
        [idVeterinario]
    );
    return result;
}

module.exports = {
    getVeterinarys,
    getVeterinarystatus,
    getVeterinaryById,
    createVeterinary,
    updateVeterinary,
    deleteVeterinary
}