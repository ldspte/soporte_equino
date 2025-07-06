const {db} = require('../database')


const getPatients = async () => {
    const results = await db.query(`
        SELECT * FROM paciente

    `)
    return results.length > 0 ? results[0] : null;
}

const getPatientById = async(idPaciente) => {
    const result = await db.query(`
        SELECT * FROM paciente WHERE idPaciente = ?
    `,
    [idPaciente]
    )
    return result;
};

const createPatient = async(Nombre, Raza, Edad, Sexo, Propietario) => {
    const result = await db.query(`
        INSERT INTO Paciente (Nombre, Raza, Edad, Sexo, Propietario) VALUES (?, ?, ?, ?, ?)
    `,
    [Nombre, Raza, Edad, Sexo, Propietario]
    );
    return result;
}

const updatePatient = async(idPaciente, Nombre, Raza, Edad, Sexo, Propietario) => {
    const result = await db.query(`
        UPDATE Paciente SET Nombre = ?, Raza = ?, Edad = ?, Sexo = ?, Propietario = ? WHERE idPaciente = ?
    `,
    [Nombre, Raza, Edad, Sexo, Propietario, idPaciente]
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