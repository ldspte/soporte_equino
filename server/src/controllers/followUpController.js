const { db } = require('../database');

const getFollowUpsByHistory = async (idHistoria_clinica) => {
    const [rows] = await db.query(`
        SELECT s.*, v.Nombre as NombreVeterinario, v.Apellido as ApellidoVeterinario
        FROM seguimiento s
        JOIN veterinario v ON s.idVeterinario = v.idVeterinario
        WHERE s.idHistoria_clinica = ?
        ORDER BY s.Fecha DESC, s.idSeguimiento DESC
    `, [idHistoria_clinica]);
    return rows;
};

const createFollowUp = async (idHistoria_clinica, Fecha, Descripcion, Tratamiento, Observaciones, idVeterinario) => {
    const [result] = await db.query(`
        INSERT INTO seguimiento (idHistoria_clinica, Fecha, Descripcion, Tratamiento, Observaciones, idVeterinario)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [idHistoria_clinica, Fecha, Descripcion, Tratamiento, Observaciones, idVeterinario]);
    return result;
};

const deleteFollowUp = async (idSeguimiento) => {
    const [result] = await db.query(`
        DELETE FROM seguimiento WHERE idSeguimiento = ?
    `, [idSeguimiento]);
    return result;
};

module.exports = {
    getFollowUpsByHistory,
    createFollowUp,
    deleteFollowUp
};
