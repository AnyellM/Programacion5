const db = require('../db'); // Conexión a la base de datos
const bcrypt = require('bcrypt'); // Para validar contraseñas encriptadas
const nodemailer = require('nodemailer'); // Para enviar correos electrónicos

// Sesión temporal (simulada para almacenar datos entre solicitudes)
const session = {};

// Tiempo de bloqueo y número máximo de intentos
const maxIntentos = 3;
const tiempoBloqueo = 15; // en minutos

// Método para inicio de sesión
const inicioSesion = async (req, res) => {
    console.log("Datos recibidos del frontend:", req.body);
    const { usuario, contrasena } = req.body;

    try {
        // Desbloquear usuarios si el tiempo de bloqueo ha pasado
        await db.query(
            "UPDATE usuarios SET intentosFallidos = 0, bloqueoHasta = NULL WHERE bloqueoHasta IS NOT NULL AND bloqueoHasta <= NOW()"
        );

        // Verificar datos del usuario
        const [rows] = await db.query(
            "SELECT idusuario, intentosFallidos, bloqueoHasta, password, direccion FROM usuarios WHERE nombreUsuario = ?",
            [usuario]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Usuario o contraseña incorrectos.",
            });
        }

        const usuarioData = rows[0];
        const { idusuario, intentosFallidos, bloqueoHasta, password, direccion } = usuarioData;

        // Verificar si el usuario está bloqueado
        if (bloqueoHasta && new Date() < bloqueoHasta) {
            return res.status(403).json({
                success: false,
                message: `Cuenta bloqueada. Inténtelo de nuevo después de ${bloqueoHasta.toLocaleTimeString()}`,
            });
        }

        // Validar contraseña
        const passwordValida = await bcrypt.compare(contrasena, password);
        if (!passwordValida) {
            const nuevosIntentos = intentosFallidos + 1;
            let bloqueo = null;

            // Bloquear cuenta si supera los intentos
            if (nuevosIntentos >= maxIntentos) {
                bloqueo = new Date(Date.now() + tiempoBloqueo * 60 * 1000);
            }

            await db.query(
                "UPDATE usuarios SET intentosFallidos = ?, bloqueoHasta = ? WHERE nombreUsuario = ?",
                [nuevosIntentos, bloqueo, usuario]
            );

            const mensaje = bloqueo
                ? `Cuenta bloqueada. Inténtelo de nuevo después de ${bloqueo.toLocaleTimeString()}`
                : `Usuario o contraseña incorrectos. Intento ${nuevosIntentos} de ${maxIntentos}.`;

            registrarAuditoria(usuario, false, req.ip, mensaje);
            return res.status(403).json({ success: false, message: mensaje });
        }

        // Restablecer intentos fallidos y desbloquear cuenta
        await db.query(
            "UPDATE usuarios SET intentosFallidos = 0, bloqueoHasta = NULL WHERE nombreUsuario = ?",
            [usuario]
        );

        // Generar y enviar código de 2FA
        const codigo2FA = Math.floor(100000 + Math.random() * 900000);
        session[usuario] = { codigo2FA, idUsuario: idusuario };
        await enviarCodigoPorEmail(codigo2FA, direccion);

        // Registrar auditoría de acceso exitoso
        registrarAuditoria(usuario, true, req.ip, "Acceso exitoso");

        res.json({
            success: true,
            message: "Código de verificación enviado a su correo.",
        });
    } catch (error) {
        console.error("Error en el inicio de sesión:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};



const verificarCodigo2FA = async (req, res) => {
    try {
        const { usuario, codigoIngresado } = req.body;

        if (!session[usuario] || !session[usuario].codigo2FA) {
            return res.status(400).json({
                success: false,
                message: "Sesión expirada o código no generado.",
            });
        }

        if (parseInt(codigoIngresado) === session[usuario].codigo2FA) {
            delete session[usuario].codigo2FA;
            return res.status(200).json({
                success: true,
                message: "Código verificado con éxito.",
            });
        }

        return res.status(400).json({
            success: false,
            message: "Código incorrecto. Intente nuevamente.",
        });
    } catch (error) {
        console.error("Error en verificarCodigo:", error); // Agregar este log
        res.status(500).json({
            success: false,
            message: "Error interno del servidor.",
        });
    }
};

// Función para enviar un código de verificación por email
const enviarCodigoPorEmail = async (codigo, direccion) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "an.p5.smtp@gmail.com",
                pass: "sxjh ovxc owsw uapn", // Contraseña de aplicación
            },
        });

        const mailOptions = {
            from: "an.p5.smtp@gmail.com",
            to: direccion, // Aquí ya estará actualizado
            subject: "Código de verificación",
            text: `Tu código de verificación es: ${codigo}`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Código enviado a ${direccion}`);
    } catch (error) {
        console.error("Error al enviar el código de verificación:", error);
    }
};


// Función para registrar auditorías de acceso
const registrarAuditoria = async (usuario, exito, ip, mensaje) => {
    try {
        await db.query(
            "INSERT INTO intentosacceso (Usuario, FechaIntento, Exito, IP, MensajeError) VALUES (?, NOW(), ?, ?, ?)",
            [usuario, exito, ip, mensaje || ""]
        );
    } catch (error) {
        console.error("Error al registrar la auditoría:", error);
    }
};



//Cambio de contrasena de usuario
const obtenerPreguntasAleatorias = async (req, res) => {
    const { usuarioId } = req.body;

    try {
        // Obtener preguntas y respuestas del usuario desde la base de datos
        const [rows] = await db.query(
            "CALL ObtenerUsuarioPreguntas(?)", // Procedimiento almacenado
            [usuarioId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        const usuario = rows[0][0]; // Primer resultado del procedimiento
        const preguntasUsuario = [usuario.Pregunta1, usuario.Pregunta2, usuario.Pregunta3];

        // Seleccionar dos preguntas aleatorias
        const preguntasAleatorias = preguntasUsuario
            .sort(() => Math.random() - 0.5) // Mezclar preguntas
            .slice(0, 2); // Seleccionar las dos primeras

        res.json({ success: true, preguntas: preguntasAleatorias });
    } catch (error) {
        console.error("Error al obtener preguntas aleatorias:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};
const verificarRespuestas = async (req, res) => {
    const { usuarioId, respuesta1, respuesta2 } = req.body;

    try {
        // Obtener preguntas y respuestas del usuario desde la base de datos
        const [rows] = await db.query(
            "CALL ObtenerUsuarioPreguntas(?)", // Procedimiento almacenado
            [usuarioId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        const usuario = rows[0][0]; // Primer resultado del procedimiento

        // Verificar las respuestas
        const respuestasCorrectas =
            (respuesta1 === usuario.Respuesta1 && respuesta2 === usuario.Respuesta2) ||
            (respuesta1 === usuario.Respuesta2 && respuesta2 === usuario.Respuesta3) ||
            (respuesta1 === usuario.Respuesta3 && respuesta2 === usuario.Respuesta1);

        res.json({ success: true, verificado: respuestasCorrectas });
    } catch (error) {
        console.error("Error al verificar respuestas:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};
const cambiarContrasena = async (req, res) => {
    const { usuarioId, nuevaContrasena } = req.body;

    try {
        // Encripta la nueva contraseña
        const contrasenaEncriptada = await bcrypt.hash(nuevaContrasena, 10);

        // Actualiza la contraseña en la base de datos
        const [result] = await db.query(
            "CALL ActualizarContrasena(?, ?)", // Procedimiento almacenado
            [usuarioId, contrasenaEncriptada]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ success: false, message: "No se pudo actualizar la contraseña." });
        }

        res.json({ success: true, message: "Contraseña actualizada exitosamente." });
    } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};


//Registro usuarios
// Obtener datos por cédula desde registro_nacional
const obtenerDatosPorCedula = async (req, res) => {
    const { cedula } = req.body;

    if (!cedula || cedula.length !== 8) {
        return res.status(400).json({ error: "Cédula inválida. Debe tener 8 dígitos." });
    }

    try {
        // Consulta a la tabla registro_nacional
        const query = "SELECT nombre, apellidos FROM registro_nacional WHERE cedula = ?";
        const [rows] = await db.execute(query, [cedula]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "No se encontraron datos para la cédula proporcionada." });
        }

        const datos = rows[0];
        res.status(200).json(datos); // Devuelve nombre y apellidos
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los datos de la cédula." });
    }
};

// Registrar usuario en la tabla usuarios
const registrarUsuario = async (req, res) => {
    const {
        cedula,
        nombreUsuario,
        direccion,
        password,
        pregunta1,
        respuesta1,
        pregunta2,
        respuesta2,
        pregunta3,
        respuesta3,
    } = req.body;

    if (!cedula || !nombreUsuario || !password) {
        return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    try {
        // Verificar si el usuario ya existe en la tabla usuarios
        const queryCheck = "SELECT COUNT(*) AS count FROM usuarios WHERE cedula = ? OR nombreUsuario = ?";
        const [rows] = await db.execute(queryCheck, [cedula, nombreUsuario]);

        if (rows[0].count > 0) {
            return res.status(400).json({ error: "Cédula o nombre de usuario ya están registrados." });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en la tabla usuarios
        const queryInsert = `
            INSERT INTO usuarios (
                cedula, nombreUsuario, direccion, password, pregunta1, respuesta1, pregunta2, respuesta2, pregunta3, respuesta3
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.execute(queryInsert, [
            cedula,
            nombreUsuario,
            direccion,
            hashedPassword,
            pregunta1,
            respuesta1,
            pregunta2,
            respuesta2,
            pregunta3,
            respuesta3,
        ]);

        res.status(201).json({ message: "Usuario registrado exitosamente." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar el usuario." });
    }
};

// Iniciar sesión
const iniciarSesion = async (req, res) => {
    const { nombreUsuario, password } = req.body;

    if (!nombreUsuario || !password) {
        return res.status(400).json({ error: "Debe ingresar usuario y contraseña." });
    }

    try {
        const query = "SELECT * FROM usuarios WHERE nombreUsuario = ?";
        const [rows] = await db.execute(query, [nombreUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        const usuario = rows[0];
        const passwordMatch = await bcrypt.compare(password, usuario.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        // Simular inicio de sesión creando un token de sesión
        req.session.usuario = {
            id: usuario.idUsuario,
            nombreUsuario: usuario.nombreUsuario,
        };

        res.status(200).json({ message: "Inicio de sesión exitoso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al iniciar sesión." });
    }
};

// Cerrar sesión
const cerrarSesion = (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: "Sesión cerrada exitosamente." });
};


//Provincias
// Cargar provincias
const cargarProvincias = async (req, res) => {
    try {
        const [provincias] = await db.execute('CALL ObtenerProvincias()'); // Asumiendo un procedimiento almacenado llamado ObtenerProvincias
        res.status(200).json({ success: true, data: provincias });
    } catch (error) {
        console.error('Error al cargar provincias:', error);
        res.status(500).json({ success: false, error: 'Error al cargar provincias.' });
    }
};

// Cargar cantones
const cargarCantones = async (req, res) => {
    const { idProvincia } = req.query; // Obtener parámetro idProvincia
    if (!idProvincia) {
        return res.status(400).json({ success: false, error: 'Debe proporcionar un idProvincia.' });
    }

    try {
        const [cantones] = await db.execute('CALL ObtenerCantones(?)', [idProvincia]); // Asumiendo un procedimiento llamado ObtenerCantones
        res.status(200).json({ success: true, data: cantones });
    } catch (error) {
        console.error('Error al cargar cantones:', error);
        res.status(500).json({ success: false, error: 'Error al cargar cantones.' });
    }
};

// Cargar distritos
const cargarDistritos = async (req, res) => {
    const { idCanton } = req.query; // Obtener parámetro idCanton
    if (!idCanton) {
        return res.status(400).json({ success: false, error: 'Debe proporcionar un idCanton.' });
    }

    try {
        const [distritos] = await db.execute('CALL ObtenerDistritos(?)', [idCanton]); // Asumiendo un procedimiento llamado ObtenerDistritos
        res.status(200).json({ success: true, data: distritos });
    } catch (error) {
        console.error('Error al cargar distritos:', error);
        res.status(500).json({ success: false, error: 'Error al cargar distritos.' });
    }
};


//Clientes
const ingreso = async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        // Llamar al procedimiento almacenado para validar el administrador
        const [rows] = await db.query("CALL ValidarAdministrador(?, ?)", [usuario, contrasena]);

        if (rows[0].length > 0 && rows[0][0].Existe > 0) {
            req.session.usuarioAdmin = usuario; // Guardar el usuario en la sesión
            console.log("Administrador válido, iniciando sesión.");
            return res.status(200).json({
                success: true,
                redirectTo: "/usuario/ver-clientes",
                message: "Inicio de sesión exitoso.",
            });
        } else {
            console.log("Usuario o contraseña incorrectos.");
            return res.status(401).json({
                success: false,
                message: "Usuario o contraseña incorrectos.",
            });
        }
    } catch (error) {
        console.error("Error al validar administrador:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor.",
        });
    }
};


// Ver clientes
const verClientes = async (req, res) => {
    try {
        // Consulta para obtener los clientes
        const [rows] = await db.query("SELECT nombreUsuario, direccion FROM usuarios");

        // Enviar la lista de clientes
        res.json({ success: true, clientes: rows });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};

module.exports = { inicioSesion, verificarCodigo2FA,  obtenerPreguntasAleatorias,verificarRespuestas,cambiarContrasena,
    obtenerDatosPorCedula, registrarUsuario, iniciarSesion, cerrarSesion, cargarProvincias, cargarCantones, cargarDistritos
    ,ingreso, verClientes };
