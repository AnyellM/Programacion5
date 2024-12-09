const db = require('../db'); // Importar la conexión a la base de datos

// Método para obtener el catálogo de productos
const obtenerCatalogo = async (req, res) => {
    try {
        // Usar la conexión desde el archivo db
        const [rows] = await db.query('SELECT * FROM productos');

        // Formatear los datos en un arreglo de productos
        const productos = rows.map(producto => ({
            idProducto: producto.idProducto,
            nombreProducto: producto.nombreProducto,
            precioProducto: producto.precioProducto,
            precioCompleto: producto.precioCompleto,
            descripcionProducto: producto.descripcionProducto,
            cantidadStock: producto.cantidadStock,
            imagenProducto: producto.imagenProducto
        }));

        // Responder con el JSON de productos
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener el catálogo de productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { obtenerCatalogo };
