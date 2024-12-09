require('dotenv').config(); // Cargar las variables de entorno desde .env
const app = require('./app'); // Importa la configuración principal de la aplicación
const PORT = process.env.PORT || 5000; // Usa el puerto definido en .env o el 5000 por defecto

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor de DulceEncantoAPI corriendo en http://localhost:${PORT}`);
});
