const { db } = require('../database');
const { fs } = require('fs')

const getItems = async () => {
    const [result] = await db.query(`
        SELECT * FROM insumos
    `)
    const insumosConFoto = result.map(insumo => {
        if (insumo.Foto && Buffer.isBuffer(insumo.Foto)) {
            // Convierte el buffer binario a una cadena Base64
            const base64String = insumo.Foto.toString('base64');
            // Crea una "URL de datos"
            const dataUrl = `data:image/jpeg;base64,${base64String}`;
            return {
                ...insumo,
                Foto: dataUrl
            };
        }
        return insumo;
    });

    return insumosConFoto;
}

const getItemById = async (idInsumos) => {
    const result = await db.query(`
        SELECT * FROM insumos WHERE idInsumos = ?
    `,
        [idInsumos]
    )
    return result
}

const createItem = async (Nombre, Descripcion, Foto, Precio) => {
    const result = await db.query(`
        INSERT INTO insumos (Nombre, Descripcion, Foto, Precio) VALUES (?, ?, ?, ?)
    `,
        [Nombre, Descripcion, Foto, Precio]
    );
    return result;
}

const updateItem = async (idInsumos, Nombre, Descripcion, Foto, Precio) => {
    const result = await db.query(`
        UPDATE insumos SET Nombre = ?, Descripcion = ?, Foto = ?, Precio = ? WHERE idInsumos = ?
    `,
        [Nombre, Descripcion, Foto, Precio, idInsumos]
    );
    return result;
}

const deleteItem = async (idInsumos) => {
    const result = await db.query(`
        DELETE FROM insumos WHERE idInsumos = ?
    `,
        [idInsumos]
    );
    return result;
}




module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
}