const {db} = require('../database');
const {fs} = require('fs')

const getItems = async() => {
    const result = await db.query(`
        SELECT * FROM insumos
    `)
    return result.length > 0 ? result[0] : null;
}

const getItemById = async(idInsumos) => {
    const result = await db.query(`
        SELECT * FROM Insumos WHERE idInsumos = ?
    `,
    [idInsumos]
    )
    return result
}

const createItem = async(Nombre, Descripcion, Foto, Precio) => {
    const result = await db.query(`
        INSERT INTO Insumos (Nombre, Descripcion, Foto, Precio) VALUES (?, ?, ?, ?)
    `,
    [Nombre, Descripcion, Foto, Precio]
    );
    return result;
}

const updateItem = async(idInsumos, Nombre, Descripcion, Foto, Precio) => {
    const result = await db.query(`
        UPDATE Insumos SET Nombre = ?, Descripcion = ?, Foto = ?, Precio = ? WHERE idInsumos = ?
    `,
    [Nombre, Descripcion, Foto, Precio, idInsumos]
    );
    return result;
}

const deleteItem = async(idInsumos) => {
    const result = await db.query(`
        DELETE FROM Insumos WHERE idInsumos = ?
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