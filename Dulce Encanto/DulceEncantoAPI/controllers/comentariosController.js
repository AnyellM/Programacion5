const db = require('../db'); // Asegúrate de tener configurado tu archivo db.js para manejar la conexión a la base de datos

// Controlador para obtener comentarios
//http://localhost:5000/api/comentarios
exports.obtenerComentarios = async (req, res) => {
    try {
        const [rows] = await db.query("CALL ObtenerComentarios()");
        const comentarios = rows[0].map(row => ({
            IdComentario: row.idcomentario,
            Titulo: row.titulo,
            ComentarioTexto: row.comentario
        }));
        res.status(200).json(comentarios);
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ message: 'Error al obtener comentarios' });
    }
};

// Controlador para guardar un nuevo comentario
///http://localhost:5000/api/comentarios/guardar
exports.guardarComentario = async (req, res) => {
    const { Titulo, ComentarioTexto } = req.body;
    try {
        await db.query("CALL InsertarComentario(?, ?)", [Titulo, ComentarioTexto]);
        res.status(200).json({ message: 'Comentario guardado exitosamente' });
    } catch (error) {
        console.error("Error al guardar el comentario:", error);
        res.status(500).json({ message: 'Error al guardar el comentario' });
    }
};
