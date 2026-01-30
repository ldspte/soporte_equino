const { db } = require('../database')


const getPatients = async (veterinarioId = null) => {
    let query = 'SELECT * FROM paciente';
    const params = [];

    const cleanVetId = parseInt(veterinarioId);
    if (!isNaN(cleanVetId)) {
        query = `
            SELECT DISTINCT p.* 
            FROM paciente p
            JOIN historia_clinica h ON p.idPaciente = h.Paciente
            WHERE h.Veterinario = ?
        `;
        params.push(cleanVetId);
    }

    const [rows] = await db.query(query, params);

    // Convertir fotos LONGBLOB a base64 (igual que en insumos)
    const patientsWithPhoto = rows.map(patient => {
        if (patient.Foto && Buffer.isBuffer(patient.Foto)) {
            const base64String = patient.Foto.toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64String}`;
            return {
                ...patient,
                Foto: dataUrl
            };
        }
        return patient;
    });

    return patientsWithPhoto;
}

const getPatientById = async (idPaciente) => {
    const [rows] = await db.query(`
        SELECT * FROM paciente WHERE idPaciente = ?
    `,
        [idPaciente]
    )

    // Convertir foto a base64 si existe
    if (rows.length > 0 && rows[0].Foto && Buffer.isBuffer(rows[0].Foto)) {
        const base64String = rows[0].Foto.toString('base64');
        rows[0].Foto = `data:image/jpeg;base64,${base64String}`;
    }

    return rows;
};

const createPatient = async (Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) => {
    try {
        console.log('📝 Creando paciente:', { Nombre, Numero_registro, tieneFoto: !!Foto });

        // Convertir base64 a buffer si es necesario
        let fotoBuffer = null;
        if (Foto && typeof Foto === 'string' && Foto.startsWith('data:image')) {
            console.log('🖼️ Procesando imagen para nuevo paciente...');
            const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
            fotoBuffer = Buffer.from(base64Data, 'base64');
            console.log('✅ Buffer de imagen creado:', fotoBuffer.length, 'bytes');
        }

        const [result] = await db.query(`
            INSERT INTO paciente (Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
            [Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, fotoBuffer, Propietario]
        );
        console.log('✅ Paciente creado exitosamente, id:', result.insertId);
        return result;
    } catch (error) {
        console.error('❌ Error en createPatient:', error);
        throw error;
    }
}

const updatePatient = async (idPaciente, Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, Foto, Propietario) => {
    try {
        console.log('🔄 Actualizando paciente ID:', idPaciente, { Nombre, tieneFoto: !!Foto });

        // Convertir base64 a buffer si se proporciona una nueva foto o se mantiene la actual
        let fotoBuffer = null;
        if (Foto && typeof Foto === 'string' && Foto.startsWith('data:image')) {
            console.log('🖼️ Procesando imagen para actualización...');
            const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
            fotoBuffer = Buffer.from(base64Data, 'base64');
            console.log('✅ Buffer de imagen creado:', fotoBuffer.length, 'bytes');
        } else {
            // Si Foto es null o no es un data URL, mantenemos lo que venga (podría ser null)
            fotoBuffer = Foto;
        }

        const [result] = await db.query(`
            UPDATE paciente SET Nombre = ?, Numero_registro = ?, Numero_chip = ?, Raza = ?, Edad = ?, Sexo = ?, Foto = ?, Propietario = ? WHERE idPaciente = ?
        `,
            [Nombre, Numero_registro, Numero_chip, Raza, Edad, Sexo, fotoBuffer, Propietario, idPaciente]
        );
        console.log('✅ Paciente actualizado exitosamente, affectedRows:', result.affectedRows);
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