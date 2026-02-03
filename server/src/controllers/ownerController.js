const { db } = require('../database.js');

const getOwners = async (veterinarioId = null) => {
    let sql = `
    SELECT *, 
           COALESCE(CalificacionPromedio, 0) as CalificacionPromedio, 
           COALESCE(TotalCalificaciones, 0) as TotalCalificaciones 
    FROM propietario
    `;
    const params = [];
    if (veterinarioId) {
        sql += ' WHERE idVeterinario = ?';
        params.push(veterinarioId);
    }
    const [results] = await db.query(sql, params);
    return results;
}

const getOwnerById = async (idPropietario) => {
    const [result] = await db.query(`
        SELECT *, 
               COALESCE(CalificacionPromedio, 0) as CalificacionPromedio, 
               COALESCE(TotalCalificaciones, 0) as TotalCalificaciones 
        FROM propietario WHERE idPropietario = ?
    `,
        [idPropietario]
    );
    return result;
}

const createOwner = async (Cedula, Nombre, Apellido, Telefono, idVeterinario) => {
    const [result] = await db.query(`
        INSERT INTO propietario (Cedula, Nombre, Apellido, Telefono, CalificacionPromedio, TotalCalificaciones, idVeterinario) 
        VALUES (?, ?, ?, ?, 0, 0, ?)
    `,
        [Cedula, Nombre, Apellido, Telefono, idVeterinario]
    );
    return result;
}

const updateOwner = async (idPropietario, Cedula, Nombre, Apellido, Telefono) => {
    const [result] = await db.query(`
        UPDATE propietario SET  Cedula = ?, Nombre = ?, Apellido = ?, Telefono = ? WHERE idPropietario = ?
    `,
        [Cedula, Nombre, Apellido, Telefono, idPropietario]
    );
    return result;
}

const deleteOwner = async (idPropietario) => {
    const [result] = await db.query(`
        DELETE FROM propietario WHERE idPropietario = ?
    `,
        [idPropietario]
    );
    return result;
}

const rateOwner = async (idPropietario, rating) => {
    // 1. Obtener datos actuales
    const [owners] = await db.query('SELECT CalificacionPromedio, TotalCalificaciones FROM propietario WHERE idPropietario = ?', [idPropietario]);
    if (owners.length === 0) throw new Error('Propietario no encontrado');

    const currentRating = owners[0].CalificacionPromedio || 0;
    const totalRatings = owners[0].TotalCalificaciones || 0;

    // 2. Calcular nuevo promedio: (Actual * Total + Nuevo) / (Total + 1)
    const newTotal = totalRatings + 1;
    const newAverage = ((currentRating * totalRatings) + rating) / newTotal;

    // 3. Actualizar base de datos
    await db.query(`
        UPDATE propietario 
        SET CalificacionPromedio = ?, TotalCalificaciones = ? 
        WHERE idPropietario = ?
    `, [newAverage, newTotal, idPropietario]);

    return { newAverageRating: newAverage, totalRatings: newTotal };
}


module.exports = {
    getOwners,
    getOwnerById,
    createOwner,
    updateOwner,
    deleteOwner,
    rateOwner
}
