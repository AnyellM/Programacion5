const db = require('../db');

const obtenerCharlas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Charlas');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener las charlas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerCharlas,
};
