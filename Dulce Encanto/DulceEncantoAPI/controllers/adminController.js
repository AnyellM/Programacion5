const db = require('../db');

// Función para autenticar al administrador
exports.loginAdmin = async (req, res) => {
    const { Usuario, Contrasena } = req.body;
    try {
        const [rows] = await db.query("CALL ValidarAdministrador(?, ?)", [Usuario, Contrasena]);
        const isValid = rows[0].length > 0;
        res.status(200).json({ success: isValid });
    } catch (error) {
        console.error("Error al validar administrador:", error);
        res.status(500).json({ message: "Error al validar administrador" });
    }
};

// Función para obtener todos los productos
// http://localhost:5000/api/admin/productos
exports.obtenerProductos = async (req, res) => {
    try {
        const [rows] = await db.query("CALL ObtenerProductos()");
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ message: "Error al obtener productos" });
    }
};

// Función para obtener un producto por ID
//http://localhost:5000/api/admin/productos/{id}
exports.obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("CALL ObtenerProductoPorId(?)", [id]);
        res.status(200).json(rows[0][0]);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ message: "Error al obtener producto" });
    }
};

// Función para guardar un nuevo producto
//PUT http://localhost:5000/api/admin/productos
exports.guardarProducto = async (req, res) => {
    const { NombreProducto, PrecioProducto, PrecioCompleto, DescripcionProducto, CantidadStock, ImagenProducto } = req.body;
    try {
        await db.query("CALL CrearProducto(?, ?, ?, ?, ?, ?)", [
            NombreProducto, PrecioProducto, PrecioCompleto, DescripcionProducto, CantidadStock, ImagenProducto
        ]);
        res.status(200).json({ message: "Producto guardado exitosamente" });
    } catch (error) {
        console.error("Error al guardar producto:", error);
        res.status(500).json({ message: "Error al guardar producto" });
    }
};

// Función para actualizar un producto existente
//http://localhost:5000/api/admin/productos/{id}
exports.actualizarProducto = async (req, res) => {
    const id = parseInt(req.params.id, 10); 
    const { NombreProducto, PrecioProducto, PrecioCompleto, DescripcionProducto, CantidadStock, ImagenProducto } = req.body;
    try {
        await db.query("CALL ActualizarProducto(?, ?, ?, ?, ?, ?, ?)", [
            id, NombreProducto, PrecioProducto, PrecioCompleto, DescripcionProducto, CantidadStock, ImagenProducto
        ]);
        res.status(200).json({ message: "Producto actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ message: "Error al actualizar producto" });
    }
};

// Función para eliminar un producto
//http://localhost:5000/api/admin/productos/{id}
exports.eliminarProducto = async (req, res) => {
    const id = parseInt(req.params.id, 10); 
    try {
        await db.query("CALL EliminarProducto(?)", [id]);
        res.status(200).json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ message: "Error al eliminar producto" });
    }
};