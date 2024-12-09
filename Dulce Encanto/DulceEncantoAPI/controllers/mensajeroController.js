const db = require('../db'); // Asegúrate de que la conexión a la BD funciona correctamente

const obtenerMensajerosDisponibles = async (req, res) => {
    try {
        console.log("Solicitud recibida de:", req.headers['user-agent']);
        console.log("Encabezados de la solicitud:", req.headers);

        const [rows] = await db.query('SELECT * FROM Mensajeros WHERE disponible = 1');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener mensajeros disponibles:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


module.exports = {
    obtenerMensajerosDisponibles,
};
