const express = require('express');
const router = express.Router();
const { agregarAlCarrito, obtenerCarrito, procesarPago } = require('../controllers/carritoController');

// Ruta para agregar producto al carrito
router.post('/agregar', agregarAlCarrito);

// Ruta para obtener productos del carrito
router.get('/:idUsuario', obtenerCarrito);

// Ruta para procesar el pago
router.post('/pagar', procesarPago);

module.exports = router;
