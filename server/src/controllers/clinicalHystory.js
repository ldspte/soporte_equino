const {db} = require('../database');


const getClinicalHistiry = async() => {
    const result = await db.query(`
        SELECT * FROM historia_clinica
    `)
    return result;
}

const getClinicalHistoryById = async(idHistoria_clinica) => {
    const result = await db.query(`
        SELECT * FROM historia_clinica WHERE idHistoria_clinica = ?
    `,
    [idHistoria_clinica]
    )
    return result;
};

const createClinicalHistory = async(Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones) => {
    const result = await db.query(`
        INSERT INTO historia_clinica (Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones]
    );
    return result;
}

const updateClinicalHistory = async(idHistoria_clinica, Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones ) => {
    const result = await db.query(`
        UPDATE historia_clinica SET Veterinario = ?, Paciente = ?, Vacunas = ?, Enfermedades = ?, Temperatura = ?, Pulso = ?, Frecuencia_cardiaca = ?, Llenado_capilar = ?, Mucosas = ?, Pulso_digital = ?, Aspecto = ?, Locomotor = ?, Respiratorio = ?, Circulatorio = ?, Digestivo = ?, Genitourinario = ?, Sis_nervioso = ?, Oidos = ?, Ojos = ?, Glangios_linfaticos = ?, Piel = ?, Diagnostico_integral = ?, Tratamiento = ?, Prescripcion = ?, Observaciones = ? WHERE idHistoria_clinica = ?
    `,
    [Veterinario, Paciente, Vacunas, Enfermedades, Temperatura, Pulso, Frecuencia_cardiaca, Llenado_capilar, Mucosas, Pulso_digital, Aspecto, Locomotor, Respiratorio, Circulatorio, Digestivo, Genitourinario, Sis_nervioso, Oidos, Ojos, Glangios_linfaticos, Piel, Diagnostico_integral, Tratamiento, Prescripcion, Observaciones, idHistoria_clinica]
    );
    return result;
}

const deleteClinicalHistory = async(idHistoria_clinica) => {
    const result = await db.query(`
        DELETE FROM historia_clinica WHERE idHistoria_clinica = ?
    `,
    [idHistoria_clinica]
    );
    return result;
}

module.exports = {
    getClinicalHistiry,
    getClinicalHistoryById,
    createClinicalHistory,
    updateClinicalHistory,
    deleteClinicalHistory
}