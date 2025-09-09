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

const createPatient = async(Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) => {
    const result = await db.query(`
        INSERT INTO Paciente (Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario]
    );
    return result;
}

const updatePatient = async(idPaciente, Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) => {
    const result = await db.query(`
        UPDATE Paciente SET Nombre = ?, Numero_registro = ?, Numero_chip = ?, Raza = ?, Edad = ?, Sexo = ?, Foto = ?, Propietario = ? WHERE idPaciente = ?
    `,
    [Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario, idPaciente]
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