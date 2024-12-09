const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Ruta para autenticar al administrador
router.post('/login', adminController.loginAdmin);

// Rutas para la gestión de productos
router.get('/productos', adminController.obtenerProductos);
router.get('/productos/:id', adminController.obtenerProductoPorId);
router.post('/productos', adminController.guardarProducto);
router.put('/productos/:id', adminController.actualizarProducto);
router.delete('/productos/:id', adminController.eliminarProducto);

module.exports = router;



