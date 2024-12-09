const db = require('../db');

// Agregar producto al carrito
const agregarAlCarrito = async (req, res) => {
    const { idProducto, cantidad, idUsuario } = req.body;

    try {
        const [producto] = await db.query('SELECT * FROM ProductosProveedores WHERE idProducto = ?', [idProducto]);
        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const precio = producto[0].precioCompra;
        const subtotal = parseFloat((precio * cantidad).toFixed(2));

        await db.query(
            'INSERT INTO CarritoTemporal (idProducto, nombreProducto, cantidad, precio, subtotal, idUsuario) VALUES (?, ?, ?, ?, ?, ?)',
            [idProducto, producto[0].nombreProducto, cantidad, precio, subtotal, idUsuario]
        );

        res.status(201).json({ message: 'Producto agregado al carrito.' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Obtener productos del carrito
const obtenerCarrito = async (req, res) => {
    const { idUsuario } = req.params;

    try {
        const [productos] = await db.query('SELECT * FROM CarritoTemporal WHERE idUsuario = ?', [idUsuario]);
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// Procesar el pago
const procesarPago = async (req, res) => {
    const { idUsuario, numeroTarjeta } = req.body;

    try {
        // Validar si la tarjeta existe
        const [tarjeta] = await db.query('SELECT * FROM Tarjetas WHERE numeroTarjeta = ? AND idUsuario = ?', [numeroTarjeta, idUsuario]);
        console.log('Tarjeta encontrada:', tarjeta);

        if (tarjeta.length === 0) {
            return res.status(404).json({ error: 'Tarjeta no encontrada.' });
        }

        // Convertir el saldo de la tarjeta a un número
        const saldoDisponible = parseFloat(tarjeta[0].saldo);
        if (isNaN(saldoDisponible)) {
            return res.status(400).json({ error: 'Saldo de la tarjeta no válido.' });
        }

        console.log('Saldo disponible:', saldoDisponible);

        // Calcular el total del carrito
        const [carrito] = await db.query('SELECT * FROM CarritoTemporal WHERE idUsuario = ?', [idUsuario]);
        console.log('Contenido del carrito:', carrito);

        if (carrito.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío.' });
        }

        const total = carrito.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        const totalFormatted = parseFloat(total.toFixed(2));
        console.log('Total calculado:', totalFormatted);

        // Validar si el saldo es suficiente
        if (saldoDisponible < totalFormatted) {
            return res.status(400).json({ error: 'Saldo insuficiente en la tarjeta.' });
        }

        // Reducir el saldo de la tarjeta
        const nuevoSaldo = saldoDisponible - totalFormatted;
        await db.query('UPDATE Tarjetas SET saldo = ? WHERE numeroTarjeta = ?', [nuevoSaldo, numeroTarjeta]);

        console.log('Saldo actualizado:', nuevoSaldo);

        // Registrar la transacción
        await db.query(
            'INSERT INTO Transacciones (idUsuario, total, numeroTarjeta) VALUES (?, ?, ?)',
            [idUsuario, totalFormatted, numeroTarjeta]
        );

        console.log('Transacción registrada.');

        // Vaciar el carrito
        await db.query('DELETE FROM CarritoTemporal WHERE idUsuario = ?', [idUsuario]);

        console.log('Carrito vaciado.');

        res.status(201).json({ message: 'Pago realizado exitosamente.', total: totalFormatted });
    } catch (error) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = { agregarAlCarrito, obtenerCarrito, procesarPago };
