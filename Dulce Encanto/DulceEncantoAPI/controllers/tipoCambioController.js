const xml2js = require("xml2js");
const axios = require("axios");

const obtenerTipoCambio = async (req, res) => {
    const url = "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx";

    const body = `    
    <soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    <soap12:Body>
      <ObtenerIndicadoresEconomicos xmlns="http://ws.sdde.bccr.fi.cr">
        <Indicador>317</Indicador>  <!-- 317 = Compra -->
        <FechaInicio>20/11/2024</FechaInicio>
        <FechaFinal>21/11/2024</FechaFinal>
        <Nombre>Anyell Martinez Monge</Nombre>
        <SubNiveles>N</SubNiveles> <!-- Subniveles: N = No -->
        <CorreoElectronico>anyellm1209@gmail.com</CorreoElectronico>
        <Token>M2IGMM1ML2</Token> <!-- Tu token de suscripción -->
      </ObtenerIndicadoresEconomicos>
    </soap12:Body>
  </soap12:Envelope>`;


    try {
        const response = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/soap+xml; charset=utf-8",
            },
        });

        const xml = response.data;

        const parser = new xml2js.Parser();
        parser.parseString(xml, (err, result) => {
            if (err) {
                console.error("Error al parsear el XML:", err);
                return res.status(500).json({ success: false, message: "Error al parsear la respuesta del servicio." });
            }

            try {
                const tipoCambioXML = result["soap:Envelope"]["soap:Body"][0]["ObtenerIndicadoresEconomicosResponse"][0]["ObtenerIndicadoresEconomicosResult"][0];
            
                // Asegúrate de que tipoCambioXML sea una cadena antes de usar .match()
                const tipoCambioTexto = typeof tipoCambioXML === "string" ? tipoCambioXML : JSON.stringify(tipoCambioXML);
            
                // Usa regex para buscar el valor de NUM_VALOR
                const regex = /<NUM_VALOR>(.*?)<\/NUM_VALOR>/;
                const match = tipoCambioTexto.match(regex);
            
                if (match) {
                    const tipoCambio = parseFloat(match[1]);
                    return res.status(200).json({ success: true, tipoCambio });
                } else {
                    return res.status(500).json({ success: false, message: "No se encontró el tipo de cambio en la respuesta." });
                }
            } catch (parseError) {
                console.error("Error al procesar la respuesta XML:", parseError);
                return res.status(500).json({ success: false, message: "Error al procesar la respuesta XML." });
            }
            
        });
    } catch (error) {
        console.error("Error al obtener el tipo de cambio:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { obtenerTipoCambio };
