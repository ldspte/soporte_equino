const {db} = require('../database');



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
        SELECT * FROM veterinarios
    `)
    return result;
}

const getVeterinaryById = async(idVeterinario) => {
    const result = await db.query(`
        SELECT * FROM veterinarios WHERE idVeterinario = ?
    `,
    [idVeterinario]
    )
    return result;
};

const createVeterinary = async(Cedula, Nombre, Correo, Telefono, Tarjeta_profesional, Especialidad) => {
    const password = generatePassword();
    const Contraseña = await bcrypt.hash(password, 10);
    const result = await db.query(`
        INSERT INTO veterinarios (Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad]
    );
    return result;
}

const updateVeterinary = async(idVeterinario, Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad) => {
    const result = await db.query(`
        UPDATE veterinarios SET Cedula = ?, Nombre = ?, Correo = ?, Contraseña = ?, Telefono = ?, Tarjeta_profesional = ?, Especialidad = ? WHERE idVeterinario = ?
    `,
    [Cedula, Nombre, Correo, Contraseña, Telefono, Tarjeta_profesional, Especialidad, idVeterinario]
    );
    return result;
}

const deleteVeterinary = async(idVeterinario) => {
    const result = await db.query(`
        DELETE FROM veterinarios WHERE idVeterinario = ?
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