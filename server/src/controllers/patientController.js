const { db } = require('../database')

const calculateAge = (valor, unidad, fechaRef) => {
    if (!valor || !fechaRef) return 'No especificada';

    const refDate = new Date(fechaRef);
    const today = new Date();

    // Diferencia en meses
    let diffMonths = (today.getFullYear() - refDate.getFullYear()) * 12 + (today.getMonth() - refDate.getMonth());
    if (today.getDate() < refDate.getDate()) diffMonths--;

    const totalMonths = (unidad === 'meses' ? valor : valor * 12) + diffMonths;

    if (totalMonths < 0) return `${valor} ${unidad}`; // Caso base si la fecha de ref es futura (no debería pasar)

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years >= 1) {
        return `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? ` y ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;
    } else {
        return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
}

const getPatients = async (veterinarioId = null) => {
    let query = 'SELECT * FROM paciente';
    const params = [];

    const cleanVetId = parseInt(veterinarioId);
    if (!isNaN(cleanVetId)) {
        query = 'SELECT * FROM paciente WHERE idVeterinario = ?';
        params.push(cleanVetId);
    }

    const [rows] = await db.query(query, params);

    // Convertir fotos LONGBLOB a base64 y calcular edad dinámica
    const processedPatients = rows.map(patient => {
        // Calcular edad dinámica
        const edadCalculada = calculateAge(patient.Edad_valor, patient.Edad_unidad, patient.Fecha_referencia);

        let processedPatient = {
            ...patient,
            Edad: edadCalculada
        };

        if (patient.Foto && Buffer.isBuffer(patient.Foto)) {
            const fotoStr = patient.Foto.toString('utf8');
            if (fotoStr.startsWith('/uploads/') || fotoStr.startsWith('http') || fotoStr.startsWith('data:image/')) {
                patient.Foto = fotoStr;
            } else {
                const base64String = patient.Foto.toString('base64');
                patient.Foto = `data:image/jpeg;base64,${base64String}`;
            }
        }
    }

    return rows;
};

const createPatient = async (Nombre, Numero_registro, Numero_chip, Raza, Edad_valor, Edad_unidad, Sexo, Foto, Propietario, idVeterinario) => {
    try {
        const [result] = await db.query(`
            INSERT INTO paciente (Nombre, Numero_registro, Numero_chip, Raza, Edad_valor, Edad_unidad, Fecha_referencia, Sexo, Foto, Propietario, idVeterinario) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?)
        `,
            [Nombre, Numero_registro, Numero_chip, Raza, Edad_valor, Edad_unidad, Sexo, Foto, Propietario, idVeterinario]
        );
        return result;
    } catch (error) {
        console.error('❌ Error en createPatient:', error);
        throw error;
    }
}

const updatePatient = async (idPaciente, Nombre, Numero_registro, Numero_chip, Raza, Edad_valor, Edad_unidad, Sexo, Foto, Propietario) => {
    try {
        const [result] = await db.query(`
            UPDATE paciente SET Nombre = ?, Numero_registro = ?, Numero_chip = ?, Raza = ?, Edad_valor = ?, Edad_unidad = ?, Fecha_referencia = CURDATE(), Sexo = ?, Foto = ?, Propietario = ? WHERE idPaciente = ?
        `,
            [Nombre, Numero_registro, Numero_chip, Raza, Edad_valor, Edad_unidad, Sexo, Foto, Propietario, idPaciente]
        );
        return result;
    } catch (error) {
        console.error('❌ Error en updatePatient:', error);
        throw error;
    }
}


const deletePatient = async (idPaciente) => {
    const [result] = await db.query(`
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
