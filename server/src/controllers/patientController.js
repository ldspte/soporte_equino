const { db } = require('../database')


const getPatients = async () => {
    const results = await db.query(`
        SELECT * FROM paciente
    `)

    // Convertir fotos LONGBLOB a base64 (igual que en insumos)
    const patientsWithPhoto = results[0].map(patient => {
        if (patient.Foto) {
            const base64String = patient.Foto.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64String}`;
            return {
                ...patient,
                Foto: dataUrl
            };
        }
        return patient;
    });

    return patientsWithPhoto.length > 0 ? patientsWithPhoto : null;
}

const getPatientById = async (idPaciente) => {
    const result = await db.query(`
        SELECT * FROM paciente WHERE idPaciente = ?
    `,
        [idPaciente]
    )

    // Convertir foto a base64 si existe
    if (result[0] && result[0].Foto) {
        const base64String = result[0].Foto.toString('base64');
        result[0].Foto = `data:image/jpeg;base64,${base64String}`;
    }

    return result;
};

const createPatient = async (Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) => {
    // Convertir base64 a buffer si es necesario
    let fotoBuffer = null;
    if (Foto && Foto.startsWith('data:image')) {
        const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
        fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    const result = await db.query(`
        INSERT INTO paciente (Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, fotoBuffer, Propietario]
    );
    return result;
}

const updatePatient = async (idPaciente, Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) => {
    // Convertir base64 a buffer si se proporciona una nueva foto
    let fotoBuffer = Foto;
    if (Foto && Foto.startsWith('data:image')) {
        const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
        fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    const result = await db.query(`
        UPDATE paciente SET Nombre = ?, Numero_registro = ?, Numero_chip = ?, Raza = ?, Edad = ?, Sexo = ?, Foto = ?, Propietario = ? WHERE idPaciente = ?
    `,
        [Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, fotoBuffer, Propietario, idPaciente]
    );
    return result;
}


const deletePatient = async (idPaciente) => {
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