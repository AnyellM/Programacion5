const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rutas para inicio de sesión y verificación de código 2FA
http://localhost:5000/api/usuario/inicio-sesion
router.post('/inicio-sesion', usuarioController.inicioSesion);
http://localhost:5000/api/usuario/verificar-codigo
router.post('/verificar-codigo', usuarioController.verificarCodigo2FA);
http://localhost:5000/api/usuario/obtener-preguntas
router.post("/obtener-preguntas",  usuarioController.obtenerPreguntasAleatorias);
http://localhost:5000/api/usuario/verificar-respuestas
router.post("/verificar-respuestas", usuarioController. verificarRespuestas);
http://localhost:5000/api/usuario/cambiar-contrasena
router.post("/cambiar-contrasena",  usuarioController.cambiarContrasena);
http://localhost:5000/api/usuario/obtener-datos
router.post("/obtener-datos", usuarioController.obtenerDatosPorCedula);
http://localhost:5000/api/usuario/registrar
router.post("/registrar", usuarioController.registrarUsuario);
http://localhost:5000/api/usuario/login
router.post("/login", usuarioController.iniciarSesion);
http://localhost:5000/api/usuario/logout
router.post("/logout", usuarioController.cerrarSesion);
http://localhost:5000/api/usuario/provincias
router.get('/provincias', usuarioController.cargarProvincias);
http://localhost:5000/api/usuario/cantones
router.get('/cantones', usuarioController.cargarCantones);
http://localhost:5000/api/usuario/distritos
router.get('/distritos', usuarioController.cargarDistritos);
http://localhost:5000/api/usuario/ingreso
router.post("/ingreso", usuarioController.ingreso); // Validación del administrador
http://localhost:5000/api/usuario/ver-clientes
router.get("/ver-clientes", usuarioController.verClientes); // Mostrar clientes

module.exports = router;
