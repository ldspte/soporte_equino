const { db } = require('../database');

const getAttachmentsByEntity = async (tipo_entidad, id_entidad) => {
    const [rows] = await db.query(
        'SELECT * FROM archivo_adjunto WHERE tipo_entidad = ? AND id_entidad = ? ORDER BY fecha_subida DESC',
        [tipo_entidad, id_entidad]
    );
    return rows;
};

const createAttachments = async (tipo_entidad, id_entidad, files) => {
    if (!files || files.length === 0) return [];

    const values = files.map(file => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const tipo_archivo = ext === 'pdf' ? 'pdf' : 'imagen';
        return [tipo_entidad, id_entidad, file.originalname, `/uploads/${file.filename}`, tipo_archivo];
    });

    const placeholders = values.map(() => '(?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    const [result] = await db.query(
        `INSERT INTO archivo_adjunto (tipo_entidad, id_entidad, nombre_original, ruta_archivo, tipo_archivo) VALUES ${placeholders}`,
        flatValues
    );

    // Return the newly created attachments
    return getAttachmentsByEntity(tipo_entidad, id_entidad);
};

const deleteAttachment = async (idArchivo) => {
    // Get file info before deleting
    const [rows] = await db.query('SELECT * FROM archivo_adjunto WHERE idArchivo = ?', [idArchivo]);
    if (rows.length === 0) return null;

    const [result] = await db.query('DELETE FROM archivo_adjunto WHERE idArchivo = ?', [idArchivo]);
    return rows[0]; // Return deleted file info for filesystem cleanup
};

const getAttachmentsByMultipleEntities = async (tipo_entidad, ids) => {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(', ');
    const [rows] = await db.query(
        `SELECT * FROM archivo_adjunto WHERE tipo_entidad = ? AND id_entidad IN (${placeholders}) ORDER BY fecha_subida DESC`,
        [tipo_entidad, ...ids]
    );
    return rows;
};

module.exports = {
    getAttachmentsByEntity,
    createAttachments,
    deleteAttachment,
    getAttachmentsByMultipleEntities
};
