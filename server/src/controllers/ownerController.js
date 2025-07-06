const {db} = require('../database.js');

const getOwners = async() => {
  const results = await db.query(`
    SELECT * FROM Propietario  
  `)
  return results.length > 0 ? results[0] : null;
}

const getOwnerById = async(idPropietario) => {
    const result = await db.query(`
        SELECT * FROM Propietario WHERE idPropietario = ?
    `,
    [idPropietario]
    );
    return result;
}

const createOwner = async(Cedula, Nombre, Apellido, Telefono) => {
    const result = await db.query(`
        INSERT INTO Propietario (Cedula, Nombre, Apellido, Telefono) VALUES  (?, ?, ?, ?)
    `,
    [Cedula, Nombre, Apellido, Telefono]
    );
    return result;
}

const updateOwner = async(idPropietario, Cedula, Nombre, Apellido, Telefono) => {
    const result = await db.query(`
        UPDATE Propietario SET  Cedula = ?, Nombre = ?, Apellido = ?, Telefono = ? WHERE idPropietario = ?
    `,
    [Cedula, Nombre, Apellido, Telefono, idPropietario]
    );
    return result;
}

const deleteOwner = async(idPropietario) => {
    const result = await db.query(`
        DELETE FROM Propietario WHERE idPropietario = ?
    `,
    [idPropietario]
    );
    return result;
}


module.exports = {
  getOwners,
  getOwnerById,
  createOwner,
  updateOwner,
  deleteOwner
}
