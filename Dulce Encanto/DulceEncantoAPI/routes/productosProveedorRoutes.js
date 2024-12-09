const express = require('express');
const router = express.Router();
const { obtenerProductosProveedor, agregarProductoProveedor,  registrarCompra , procesarPago } = require('../controllers/productosProveedorController');

// Ruta para obtener todos los productos de proveedores
router.get('/', obtenerProductosProveedor);
router.post('/comprar', registrarCompra);
router.post('/pagar', procesarPago);
// Ruta para agregar un nuevo producto al inventario
router.post('/', agregarProductoProveedor);


module.exports = router;
