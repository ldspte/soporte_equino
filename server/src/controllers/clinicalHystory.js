const { db } = require('../database');


const getClinicalHistory = async () => {
    const result = await db.query(`
        SELECT * FROM historia_clinica
    `)
    return result.length > 0 ? result[0] : null;
}

const getClinicalHistoryById = async (idHistoria_clinica) => {
    const result = await db.query(`
        SELECT * FROM historia_clinica WHERE idHistoria_clinica = ?
    `,
        [idHistoria_clinica]
    )
    return result;
};

const createClinicalHistory = async (Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha) => {
    const result = await db.query(`
        INSERT INTO historia_clinica (Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha]
    );
    return result;
}

const updateClinicalHistory = async (idHistoria_clinica, Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha) => {
    const result = await db.query(`
        UPDATE historia_clinica SET Veterinario = ?, Paciente = ?, Vacunas = ?, Anamnesis = ?, Evaluacion_distancia = ?, Desparasitacion = ?, Pliegue_cutaneo = ?, Frecuencia_respiratoria = ?, Motilidad_gastrointestinal = ? , Enfermedades = ?, Temperatura = ?, Pulso = ?, Frecuencia_cardiaca = ?, Llenado_capilar = ?, Mucosas = ?, Aspecto = ?, Locomotor = ?, Respiratorio = ?, Circulatorio = ?, Digestivo = ?, Genitourinario = ?, Sis_nervioso = ?, Oidos = ?, Ojos = ?, Glangios_linfaticos = ?, Piel = ?, Diagnostico_integral = ?, Tratamiento = ?, Observaciones = ?, Ayudas_diagnosticas = ?, Foto = ?, Fecha = ? WHERE idHistoria_clinica = ?
    `,
        [Veterinario, Paciente, Vacunas, Enfermedades, Anamnesis, Evaluacion_distancia, Desparasitacion, Pliegue_cutaneo, Frecuencia_respiratoria, Motilidad_gastrointestinal, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Observaciones, Ayudas_diagnosticas, Foto, Fecha, idHistoria_clinica]
    );
    return result;
}

const deleteClinicalHistory = async (idHistoria_clinica) => {
    const result = await db.query(`
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