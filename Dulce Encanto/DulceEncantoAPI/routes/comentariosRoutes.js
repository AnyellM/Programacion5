const express = require('express');
const router = express.Router();
const comentariosController = require('../controllers/comentariosController');

// Ruta para obtener comentarios
router.get('/', comentariosController.obtenerComentarios);

// Ruta para guardar un nuevo comentario

router.post('/guardar', comentariosController.guardarComentario);

module.exports = router;
