const express = require("express");
const router = express.Router();
const { registrarIntento, obtenerIntentos,registrarAdministrador, obtenerAdministradores,registrarPersona, obtenerRegistros } = require("../controllers/exponerController");

router.post("/intentosacceso", registrarIntento);
http://localhost:5000/api/exponer/intentosacceso
router.get("/intentosacceso", obtenerIntentos);
http://localhost:5000/api/exponer/administrador
router.post("/administrador", registrarAdministrador);
http://localhost:5000/api/exponer/administradores
router.get("/administradores", obtenerAdministradores);
http://localhost:5000/api/exponer/registro
router.post("/registro", registrarPersona);
http://localhost:5000/api/exponer/registros
router.get("/registros", obtenerRegistros);
module.exports = router;
