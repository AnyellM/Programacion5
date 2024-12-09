const db = require('../db'); // Importar la conexión a la base de datos

// Obtener todos los productos de proveedores
const obtenerProductosProveedor = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM ProductosProveedores');

        const productos = rows.map(producto => ({
            idProducto: producto.idProducto,
            nombreProducto: producto.nombreProducto,
            precioCompra: producto.precioCompra,
            cantidadDisponible: producto.cantidadDisponible,
            nombreProveedor: producto.nombreProveedor,
        }));

        res.json(productos);
    } catch (error) {
        console.error('Error al obtener los productos de proveedores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Agregar un nuevo producto al inventario
const agregarProductoProveedor = async (req, res) => {
    try {
        const { nombreProducto, precioCompra, cantidadDisponible, nombreProveedor } = req.body;

        if (!nombreProducto || !precioCompra || !cantidadDisponible || !nombreProveedor) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        const query = `
            INSERT INTO ProductosProveedores (nombreProducto, precioCompra, cantidadDisponible, nombreProveedor)
            VALUES (?, ?, ?, ?)
        `;
        await db.query(query, [nombreProducto, precioCompra, cantidadDisponible, nombreProveedor]);

        res.status(201).json({ message: 'Producto agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el producto de proveedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};
const registrarCompra = async (req, res) => {
    const { idProducto, cantidad } = req.body;

    if (!idProducto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Datos inválidos. Verifique el producto y la cantidad.' });
    }

    try {
        // Verificar si el producto existe y tiene suficiente inventario
        const [producto] = await db.query('SELECT * FROM ProductosProveedores WHERE idProducto = ?', [idProducto]);
        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const productoActual = producto[0];
        if (productoActual.cantidadDisponible < cantidad) {
            return res.status(400).json({ error: 'Cantidad solicitada excede el inventario disponible.' });
        }

        // Calcular el total
        const total = productoActual.precioCompra * cantidad;

        // Actualizar la cantidad disponible en inventario
        await db.query(
            'UPDATE ProductosProveedores SET cantidadDisponible = cantidadDisponible - ? WHERE idProducto = ?',
            [cantidad, idProducto]
        );

        // Registrar la compra
        await db.query(
            'INSERT INTO Compras (idProducto, nombreProducto, cantidad, total) VALUES (?, ?, ?, ?)',
            [idProducto, productoActual.nombreProducto, cantidad, total]
        );

        res.status(201).json({ message: 'Compra registrada exitosamente.', total });
    } catch (error) {
        console.error('Error al registrar la compra:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};
// Validar tarjeta y procesar el pago
const procesarPago = async (req, res) => {
    const { idUsuario, numeroTarjeta } = req.body;

    try {
        // Validar si la tarjeta existe
        const [tarjeta] = await db.query('SELECT * FROM Tarjetas WHERE numeroTarjeta = ? AND idUsuario = ?', [numeroTarjeta, idUsuario]);
        if (tarjeta.length === 0) {
            return res.status(404).json({ error: 'Tarjeta no encontrada.' });
        }

        const saldoDisponible = tarjeta[0].saldo;

        // Calcular el total del carrito
        const [carrito] = await db.query('SELECT * FROM CarritoTemporal WHERE idUsuario = ?', [idUsuario]);
        if (carrito.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío.' });
        }

        const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);

        // Validar si el saldo es suficiente
        if (saldoDisponible < total) {
            return res.status(400).json({ error: 'Saldo insuficiente en la tarjeta.' });
        }

        // Reducir el saldo de la tarjeta
        await db.query('UPDATE Tarjetas SET saldo = saldo - ? WHERE numeroTarjeta = ?', [total, numeroTarjeta]);

        // Registrar la transacción
        await db.query(
            'INSERT INTO Transacciones (idUsuario, total, numeroTarjeta) VALUES (?, ?, ?)',
            [idUsuario, total, numeroTarjeta]
        );

        // Vaciar el carrito
        await db.query('DELETE FROM CarritoTemporal WHERE idUsuario = ?', [idUsuario]);

        res.status(201).json({ message: 'Pago realizado exitosamente.', total });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};


// Exportar los métodos del controlador
module.exports = {
    obtenerProductosProveedor,
    agregarProductoProveedor, registrarCompra, procesarPago
};
