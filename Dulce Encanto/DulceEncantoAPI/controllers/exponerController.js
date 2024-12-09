const db = require('../db'); 

//IntentosAcceso
const registrarIntento = async (req, res) => {
    const { usuario, fechaIntento, exito, ip, mensajeError } = req.body;
    try {
     
        const [resultado] = await db.query(
            "INSERT INTO intentosacceso (Usuario, FechaIntento, Exito, IP, MensajeError) VALUES (?, ?, ?, ?, ?)",
            [usuario, fechaIntento, exito, ip, mensajeError]
        );
        res.status(201).json({ mensaje: "Intento registrado con éxito", id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar el intento", error: error.message });
    }
};

const obtenerIntentos = async (req, res) => {
    try {
        const [resultados] = await db.query("SELECT * FROM intentosacceso");
        res.status(200).json(resultados);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los intentos", error: error.message });
    }
};

//Ver admins
const registrarAdministrador = async (req, res) => {
    const { usuario, contrasena } = req.body;
    try {
        const [resultado] = await db.query(
            "INSERT INTO administrador (Usuario, Contrasena) VALUES (?, ?)",
            [usuario, contrasena]
        );
        res.status(201).json({ mensaje: "Administrador registrado con éxito", id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar el administrador", error: error.message });
    }
};
const obtenerAdministradores = async (req, res) => {
    try {
        const [resultados] = await db.query("SELECT * FROM administrador");
        res.status(200).json(resultados);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener administradores", error: error.message });
    }
};

//Registro Nacional
const registrarPersona = async (req, res) => {
    const { cedula, nombre, apellidos } = req.body;
    try {
        const [resultado] = await db.query(
            "INSERT INTO registro_nacional (cedula, nombre, apellidos) VALUES (?, ?, ?)",
            [cedula, nombre, apellidos]
        );
        res.status(201).json({ mensaje: "Persona registrada con éxito", id: resultado.insertId });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar la persona", error: error.message });
    }
};
const obtenerRegistros = async (req, res) => {
    try {
        const [resultados] = await db.query("SELECT * FROM registro_nacional");
        res.status(200).json(resultados);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener los registros", error: error.message });
    }
};

module.exports = { registrarIntento, obtenerIntentos, registrarAdministrador, obtenerAdministradores,
    registrarPersona,obtenerRegistros};
