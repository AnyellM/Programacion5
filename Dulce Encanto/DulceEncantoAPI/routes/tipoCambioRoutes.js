const express = require("express");
const router = express.Router();
const { obtenerTipoCambio } = require("../controllers/tipoCambioController");

router.get("/tipoCambio", obtenerTipoCambio);

module.exports = router;
