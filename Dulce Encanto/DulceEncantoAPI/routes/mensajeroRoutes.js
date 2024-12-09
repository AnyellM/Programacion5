const express = require('express');
const router = express.Router();
const mensajeroController = require('../controllers/mensajeroController');

// Endpoint para obtener mensajeros disponibles
router.get('/disponibles', mensajeroController.obtenerMensajerosDisponibles);

module.exports = router;
