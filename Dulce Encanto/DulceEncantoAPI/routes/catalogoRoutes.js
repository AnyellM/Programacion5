const express = require('express');
const router = express.Router();
const productosController = require('../controllers/catalogoController');

// Ruta para obtener el catálogo de productos
router.get('/catalogo', productosController.obtenerCatalogo);

module.exports = router;
