const express = require('express');
const router = express.Router();
const charlasController = require('../controllers/charlasController');

// Ruta para obtener las charlas
router.get('/obtener', charlasController.obtenerCharlas);

module.exports = router;
