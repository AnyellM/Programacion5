require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();

// Middleware para parsear JSON
app.use(express.json());


// Configuración de CORS (antes de las rutas)
app.use(cors({
    origin: "https://localhost:44356", // Dominio del frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Métodos HTTP permitidos
    credentials: true // Permitir envío de cookies y credenciales
}));

// Manejo de solicitudes preflight
app.options("*", cors());

// Rutas
const carritoRoutes = require('./routes/carritoRoutes');
const comentariosRoutes = require('./routes/comentariosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const exponerRoutes = require('./routes/exponerRoutes');
const productosProveedorRoutes = require('./routes/productosProveedorRoutes');
const mensajeroRoutes = require('./routes/mensajeroRoutes');
const charlasRoutes = require('./routes/charlasRoutes');
const tipoCambioRoutes = require('./routes/tipoCambioRoutes');


app.use('/api', tipoCambioRoutes);
app.use('/api/charlas', charlasRoutes);
app.use('/api/mensajeros', mensajeroRoutes);
app.use('/api/carrito', carritoRoutes);         // Rutas para el carrito
app.use('/api/comentarios', comentariosRoutes);  // Rutas para los comentarios
app.use('/api/admin', adminRoutes);             // Rutas para los administradores
app.use('/usuario', usuarioRoutes);             // Rutas para usuarios
app.use('/api/productos', catalogoRoutes);      // Rutas para productos
app.use('/api/exponer', exponerRoutes);
app.use('/api/productosProveedor', productosProveedorRoutes);


// Middleware para depuración 
app.use((req, res, next) => {
    console.log("Solicitud recibida de:", req.headers.origin);
    console.log("Encabezados de la solicitud:", req.headers);
    next();
});

// Configuración del puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

module.exports = app;
