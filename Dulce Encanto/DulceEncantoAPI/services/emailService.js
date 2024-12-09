const nodemailer = require('nodemailer');

// Configuración del transporte de nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambia esto si usas otro proveedor (Outlook, Yahoo, etc.)
    auth: {
        user: 'an.p5.smtp@gmail.com', // Tu correo electrónico
        pass: 'sxjh ovxc owsw uapn' // Contraseña de aplicación generada en Gmail
    }
});

// Función para enviar correos
const enviarCorreo = async (destinatario, asunto, mensaje) => {
    try {
        const mailOptions = {
            from: 'an.p5.smtp@gmail.com', // Remitente
            to: destinatario, // Destinatario
            subject: asunto, // Asunto del correo
            text: mensaje // Contenido del correo
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo enviado: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return false;
    }
};

module.exports = enviarCorreo;
