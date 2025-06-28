const {db} = require('../database')


const getPatients = async () => {
    const result = await db.query(`
        SELECT * FROM paciente

    `)
    return result;
}

const getPatientById = async(idPaciente) => {
    const result = await db.query(`
        SELECT * FROM paciente WHERE idPaciente = ?
    `,
    [idPaciente]
    )
    return result;
};

const createPatient = async(nombre, raza, edad, sexo, propietario) => {
    const result = await db.query(`
        INSERT INTO veterinarios (nombre, raza, edad, sexo, propietario) VALUES (?, ?, ?, ?, ?)
    `,
    [nombre, raza, edad, sexo, propietario]
    );
    return result;
}

const updatePatient = async(idPaciente, nombre, raza, edad, sexo, propietario) => {
    const result = await db.query(`
        UPDATE paciente SET nombre = ?, raza = ?, edad = ?, sexo = ?, propietario = ? WHERE idPaciente = ?
    `,
    [nombre, raza, edad, sexo, propietario, idPaciente]
    );
    return result;
}


const deletePatient = async(idPaciente) => {
    const result = await db.query(`
        DELETE FROM paciente WHERE idPaciente = ?
    `,
    [idPaciente]
    );
    return result;
}

module.exports = {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    deletePatient
}