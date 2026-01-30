const { db } = require('../database');


const getClinicalHistory = async (veterinarioId = null) => {
    let query = `
        SELECT 
            h.*, 
            p.Nombre as NombrePaciente, 
            p.idPaciente as PacienteID,
            pr.Nombre as NombrePropietario, 
            pr.Apellido as ApellidoPropietario
        FROM historia_clinica h
        LEFT JOIN paciente p ON h.Paciente = p.idPaciente
        LEFT JOIN propietario pr ON p.Propietario = pr.idPropietario
    `;
    const params = [];

    // Validar que veterinarioId sea un número válido y no el string "undefined" o similar
    const cleanVetId = parseInt(veterinarioId);
    if (!isNaN(cleanVetId)) {
        query += ` WHERE h.Veterinario = ?`;
        params.push(cleanVetId);
    }

    const [result] = await db.query(query, params);
    const historiasConFoto = result.map(historia => {
        if (historia.Foto && Buffer.isBuffer(historia.Foto)) {
            const base64String = historia.Foto.toString('base64');
            historia.Foto = `data:image/jpeg;base64,${base64String}`;
        }
        return historia;
    });
    return historiasConFoto;
}

const getClinicalHistoryById = async (idHistoria_clinica) => {
    const [result] = await db.query(`
        SELECT h.*, p.Nombre as NombrePaciente, pr.Nombre as NombrePropietario, pr.Apellido as ApellidoPropietario 
        FROM historia_clinica h
        LEFT JOIN paciente p ON h.Paciente = p.idPaciente
        LEFT JOIN propietario pr ON p.Propietario = pr.idPropietario
        WHERE h.idHistoria_clinica = ?
    `,
        [idHistoria_clinica]
    )
    if (result.length > 0 && result[0].Foto && Buffer.isBuffer(result[0].Foto)) {
        const base64String = result[0].Foto.toString('base64');
        result[0].Foto = `data:image/jpeg;base64,${base64String}`;
    }
    return result;
};

const createClinicalHistory = async (Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha) => {
    // Convertir base64 a buffer si es necesario
    let fotoBuffer = Foto;
    if (typeof Foto === 'string' && Foto.startsWith('data:image')) {
        const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
        fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    const [result] = await db.query(`
        INSERT INTO historia_clinica (Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, fotoBuffer, Fecha]
    );
    return result;
}

const updateClinicalHistory = async (idHistoria_clinica, Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha) => {
    // Convertir base64 a buffer si es necesario
    let fotoBuffer = Foto;
    if (typeof Foto === 'string' && Foto.startsWith('data:image')) {
        const base64Data = Foto.replace(/^data:image\/\w+;base64,/, '');
        fotoBuffer = Buffer.from(base64Data, 'base64');
    }

    const [result] = await db.query(`
        UPDATE historia_clinica SET 
            Veterinario = ?, 
            Paciente = ?, 
            Vacunas = ?, 
            Enfermedades = ?, 
            Anamnesis = ?, 
            Evaluacion_distancia = ?, 
            Desparasitacion = ?, 
            Pliegue_cutaneo = ?, 
            Frecuencia_respiratoria = ?, 
            Motilidad_gastrointestinal = ?, 
            Temperatura = ?, 
            Pulso = ?, 
            Frecuencia_cardiaca = ?, 
            Llenado_capilar = ?, 
            Mucosas = ?, 
            Pulso_digital = ?, 
            Aspecto = ?, 
            Locomotor = ?, 
            Respiratorio = ?, 
            Circulatorio = ?, 
            Digestivo = ?, 
            Genitourinario = ?, 
            Sis_nervioso = ?, 
            Oidos = ?, 
            Ojos = ?, 
            Glangios_linfaticos = ?, 
            Piel = ?, 
            Diagnostico_integral = ?, 
            Tratamiento = ?, 
            Observaciones = ?, 
            Ayudas_diagnosticas = ?, 
            Foto = ?, 
            Fecha = ? 
        WHERE idHistoria_clinica = ?
    `,
        [Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, fotoBuffer, Fecha, idHistoria_clinica]
    );
    return result;
}

const deleteClinicalHistory = async (idHistoria_clinica) => {
    const [result] = await db.query(`
        DELETE FROM historia_clinica WHERE idHistoria_clinica = ?
    `,
        [idHistoria_clinica]
    );
    return result;
}

module.exports = {
    getClinicalHistory,
    getClinicalHistoryById,
    createClinicalHistory,
    updateClinicalHistory,
    deleteClinicalHistory
}