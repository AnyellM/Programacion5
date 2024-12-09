using DulceEncanto.Models;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Mail;
using System.Net;
using System.Text.RegularExpressions;
using System.Web.Mvc;
using System.Web;
using BCrypt;
using System.Security.Cryptography;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;
using System.Net.Http.Headers;
using Mysqlx;


namespace DulceEncanto.Controllers
{
    public class HomeController : Controller
    {
        private readonly HttpClient _httpClient;
        public HomeController()
        {
            // Inicializa HttpClient
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5000/api/")

            };

        }
        private string connectionString = ConfigurationManager.ConnectionStrings["MySqlConnection"].ConnectionString;
        public ActionResult InformacionTienda()
        {

            return View();
        }
        public ActionResult Registrador()
        {
            return View();
        }
        public ActionResult FormInSe()
        {
            // Si el onboarding no se ha completado, redirige al onboarding
            if (Session["OnboardingCompleted"] == null || (bool)Session["OnboardingCompleted"] == false)
            {
                return RedirectToAction("Onboarding");
            }

            // Si el onboarding ya está completado, muestra el formulari
            return View();
        }

        public ActionResult Onboarding()
        {

            return View();

        }
        [HttpPost]
        public ActionResult CompleteOnboarding()
        {
            // Marca el onboarding como completado
            Session["OnboardingCompleted"] = true;

            // Redirige al formulario
            return RedirectToAction("FormInSe");
        }

        public ActionResult Index()
        {
            return View();
        }

        #region Comentarios
        // Acción para mostrar la vista con los comentarios
        public async Task<ActionResult> Comentario()
        {
            try
            {
                var response = await _httpClient.GetAsync("comentarios"); // Llama a la ruta de la API
                response.EnsureSuccessStatusCode();

                var comentarios = await response.Content.ReadAsAsync<List<Comentario>>();
                return View(comentarios); // Pasa los comentarios a la vista
            }
            catch (Exception ex)
            {
                ViewBag.Error = "Error al obtener los comentarios: " + ex.Message;
                return View(new List<Comentario>()); // Retorna una lista vacía si hay error
            }
        }

        // Acción para guardar un nuevo comentario
        [HttpPost]
        public async Task<ActionResult> GuardarComentario(string Titulo, string ComentarioTexto)
        {
            var nuevoComentario = new
            {
                Titulo = Titulo,
                ComentarioTexto = ComentarioTexto
            };

            try
            {
                var contenido = new StringContent(
                    JsonConvert.SerializeObject(nuevoComentario), // Serializa el objeto a JSON
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync("comentarios/guardar", contenido); // Llama a la API

                if (response.IsSuccessStatusCode)
                {
                    TempData["MensajeExito"] = "Comentario guardado exitosamente.";
                }
                else
                {
                    TempData["MensajeError"] = "Error al guardar el comentario.";
                }
            }
            catch (Exception ex)
            {
                TempData["MensajeError"] = "Error al guardar el comentario: " + ex.Message;
            }

            return RedirectToAction("Comentario");
        }




        #endregion

        #region Charlas
        public async Task<ActionResult> Charlas()
        {
            try
            {
                var response = await _httpClient.GetAsync("charlas/obtener");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var charlas = JsonConvert.DeserializeObject<List<Charla>>(json); // Usa el modelo correcto
                    return View(charlas);
                }
                else
                {
                    ViewBag.Error = "No se pudieron cargar las charlas.";
                    return View(new List<Charla>()); // Asegúrate de devolver una lista vacía si hay un error
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener charlas: {ex.Message}");
                ViewBag.Error = "Error al comunicarse con el servidor.";
                return View(new List<Charla>());
            }
        }

        #endregion

        #region TipoCambio
        public async Task<ActionResult> TipoCambio()
        {
            try
            {
                var response = await _httpClient.GetAsync("api/tipoCambio");
                if (response.IsSuccessStatusCode)
                {
                    var json = await response.Content.ReadAsStringAsync();
                    var tipoCambio = JsonConvert.DeserializeObject<TipoCambioo>(json);

                    if (tipoCambio != null && tipoCambio.Success)
                    {
                        ViewBag.TipoCambio = tipoCambio.TipoCambio;
                    }
                    else
                    {
                        ViewBag.Error = "No se pudo obtener el tipo de cambio.";
                    }
                }
                else
                {
                    ViewBag.Error = "Error al comunicarse con el servicio.";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener el tipo de cambio: {ex.Message}");
                ViewBag.Error = "Error al comunicarse con el servidor.";
            }

            return View();
        }


        #endregion

        #region Mensajeros
        public async Task<ActionResult> Mensajeros()
        {
            try
            {
                // Realiza una solicitud GET a la API
                var response = await _httpClient.GetAsync("mensajeros/disponibles");
                if (response.IsSuccessStatusCode)
                {
                    // Deserializa la respuesta JSON en una lista de mensajeros
                    var json = await response.Content.ReadAsStringAsync();
                    var mensajeros = JsonConvert.DeserializeObject<List<Mensajero>>(json);

                    // Envía los datos a la vista
                    return View(mensajeros);
                }
                else
                {
                    ViewBag.Error = "Error al cargar los mensajeros disponibles desde la API.";
                    return View(new List<Mensajero>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener mensajeros: {ex.Message}");
                ViewBag.Error = "Error al comunicarse con la API.";
                return View(new List<Mensajero>());
            }
        }

        #endregion

        #region Proveedor
        public async Task<ActionResult> ProductosProveedor()
        {
            try
            {
                // Realiza una solicitud GET a la API
                var response = await _httpClient.GetAsync("productosProveedor");
                if (response.IsSuccessStatusCode)
                {
                    // Deserializa la respuesta JSON en una lista de productos
                    var json = await response.Content.ReadAsStringAsync();
                    var productos = JsonConvert.DeserializeObject<List<ProductoProveedor>>(json);

                    // Envía los datos a la vista
                    return View(productos);
                }
                else
                {
                    ViewBag.Error = "No se pudieron cargar los productos.";
                    return View(new List<ProductoProveedor>());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener productos: {ex.Message}");
                ViewBag.Error = "Error al comunicarse con el servidor.";
                return View(new List<ProductoProveedor>());
            }
        }
        /*
        [HttpPost]
        public async Task<ActionResult> ComprarProducto(int idProducto, int cantidad)
        {
            if (cantidad <= 0)
            {
                ViewBag.Error = "La cantidad debe ser mayor a 0.";
                return RedirectToAction("ProductosProveedor");
            }

            try
            {
                // Crear los datos de la solicitud en formato JSON
                var data = new { idProducto, cantidad };
                var json = JsonConvert.SerializeObject(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // Realizar la solicitud POST al endpoint de la API
                var response = await _httpClient.PostAsync("productosProveedor/comprar", content);

                if (response.IsSuccessStatusCode)
                {
                    // Compra realizada exitosamente
                    ViewBag.Message = "¡Compra realizada exitosamente!";
                }
                else
                {
                    // Obtener mensaje de error desde la API
                    var errorMessage = await response.Content.ReadAsStringAsync();
                    ViewBag.Error = $"Error al realizar la compra: {errorMessage}";
                }
            }
            catch (Exception ex)
            {
                // Manejar errores de conexión u otros problemas
                ViewBag.Error = $"Error de conexión: {ex.Message}";
            }

            // Redirigir a la vista de productos
            return RedirectToAction("ProductosProveedor");
        }

        [HttpPost]
        public async Task<ActionResult> AgregarAlCarrito(int idProducto, int cantidad)
        {
            var data = new { idProducto, cantidad, idUsuario = 1 }; // Cambiar idUsuario según sea necesario
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var response = await _httpClient.PostAsync("carrito/agregar", content);
                if (response.IsSuccessStatusCode)
                {
                    ViewBag.Message = "Producto agregado al carrito exitosamente.";
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    ViewBag.Error = $"Error al agregar producto al carrito: {error}";
                }
            }
            catch (Exception ex)
            {
                ViewBag.Error = $"Error de conexión: {ex.Message}";
            }

            return RedirectToAction("Carrito");
        }

        public async Task<ActionResult> Carrito()
        {
          
            int idUsuario = 1;

            // Llamar al backend para obtener los productos
            var response = await _httpClient.GetAsync($"carrito/{idUsuario}");
            if (response.IsSuccessStatusCode)
            {
                var productosCarrito = JsonConvert.DeserializeObject<List<ProductoCarrito>>(await response.Content.ReadAsStringAsync());
                return View(productosCarrito);
            }

            ViewBag.Error = "No se pudieron cargar los productos del carrito.";
            return View(new List<ProductoCarrito>());

        }

        [HttpPost]
        public async Task<ActionResult> Pagar(string numeroTarjeta)
        {
            var data = new { idUsuario = 1, numeroTarjeta }; // Cambiar idUsuario según sea necesario
            var json = JsonConvert.SerializeObject(data);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {

                var response = await _httpClient.PostAsync("carrito/pagar", content);
                if (response.IsSuccessStatusCode)
                {
                    ViewBag.Message = "Pago realizado exitosamente.";
                }
                
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    if (error.Contains("Tarjeta no encontrada"))
                    {
                        ViewBag.Error = "La tarjeta ingresada no existe. Por favor, verifica el número.";
                    }
                    else if (error.Contains("Saldo insuficiente"))
                    {
                        ViewBag.Error = "Saldo insuficiente en la tarjeta.";
                    }
                    else
                    {
                        ViewBag.Error = $"Error al procesar el pago: {error}";
                    }
                }
            }
            catch (Exception ex)
            {
                ViewBag.Error = $"Error de conexión: {ex.Message}";
            }

            return RedirectToAction("Carrito");
        }


        */
        #endregion

        #region Provincias
        // Cargar provincias
        public JsonResult CargarProvincias()
        {
            List<Ubicacion> provincias = new List<Ubicacion>();

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                using (MySqlCommand cmd = new MySqlCommand("ObtenerProvincias", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    conn.Open();

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            provincias.Add(new Ubicacion
                            {
                                id = (int)reader["id"],
                                nombre = reader["nombre"].ToString()
                            });
                        }
                    }
                }
            }
            return Json(provincias, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CargarCantones(int idProvincia)
        {
            List<Ubicacion> cantones = new List<Ubicacion>();

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                using (MySqlCommand cmd = new MySqlCommand("ObtenerCantones", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_id_provincia", idProvincia); // Asegúrate de que el parámetro se llame igual que en el procedimiento
                    conn.Open();

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            cantones.Add(new Ubicacion
                            {
                                id = (int)reader["id"],
                                nombre = reader["nombre"].ToString()
                            });
                        }
                    }
                }
            }
            return Json(cantones, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CargarDistritos(int idCanton)
        {
            List<Ubicacion> distritos = new List<Ubicacion>();

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                using (MySqlCommand cmd = new MySqlCommand("ObtenerDistritos", conn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@p_id_canton", idCanton); // Asegúrate de que el nombre del parámetro coincide con el del procedimiento
                    conn.Open();

                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            distritos.Add(new Ubicacion
                            {
                                id = (int)reader["id"],
                                nombre = reader["nombre"].ToString()
                            });
                        }
                    }
                }
            }
            return Json(distritos, JsonRequestBehavior.AllowGet);
        }

        // Clase para representar las ubicaciones (provincias, cantones, distritos)
        public class Ubicacion
        {
            public int id { get; set; }
            public string nombre { get; set; }
        }
        #endregion

        #region Carrito
        // Acción para mostrar el carrito
        public ActionResult Carrito()
        {
            var productosEnCarrito = ObtenerProductosCarrito(); // Asegúrate de que este método funcione bien
            ViewBag.Subtotal = productosEnCarrito.Sum(p => p.PrecioProducto * p.Cantidad);
            return View(productosEnCarrito); // Pasamos la lista de productos a la vista
        }
        // Confirmamos la compra
        [HttpPost]
        public ActionResult ConfirmarCompra()
        {
            try
            {
                using (var conn = new MySqlConnection(connectionString))
                {
                    conn.Open();

                    // Obtener los productos en el carrito
                    var cmdSelect = new MySqlCommand("SELECT idproducto, cantidad FROM carrito", conn);
                    var productosCarrito = new List<(int idProducto, int cantidad)>();

                    using (var reader = cmdSelect.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            productosCarrito.Add((reader.GetInt32("idproducto"), reader.GetInt32("cantidad")));
                        }
                    }

                    // Reducir el stock de cada producto
                    foreach (var (idProducto, cantidad) in productosCarrito)
                    {
                        var cmdUpdate = new MySqlCommand(
                            "UPDATE productos SET cantidadStock = cantidadStock - @cantidad WHERE idproducto = @idProducto", conn);
                        cmdUpdate.Parameters.AddWithValue("@cantidad", cantidad);
                        cmdUpdate.Parameters.AddWithValue("@idProducto", idProducto);
                        cmdUpdate.ExecuteNonQuery();
                    }

                    // Vaciar el carrito después de la compra
                    var cmdDelete = new MySqlCommand("DELETE FROM carrito", conn);
                    cmdDelete.ExecuteNonQuery();
                }

                TempData["MensajeCom"] = "¡Compra exitosa! Gracias por tu compra.";
                return RedirectToAction("Carrito");
            }
            catch (Exception ex)
            {
                TempData["ErrorEli"] = "Ocurrió un error al confirmar la compra: " + ex.Message;
                return RedirectToAction("Carrito");
            }
        }

        // Acción para agregar productos al carrito
        [HttpPost]
        public ActionResult AgregarAlCarrito(int idProducto, int cantidad)
        {
            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();
                var cmd = new MySqlCommand("AgregarProductoAlCarrito", conn);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@idProducto", idProducto);
                cmd.Parameters.AddWithValue("@cantidad", cantidad);
                cmd.ExecuteNonQuery();
            }

            TempData["MensajeCarrito"] = "Producto agregado al carrito.";
            return RedirectToAction("FormCatalogo"); // Redirige al catálogo después de agregar
        }
        [HttpPost]
        public ActionResult EliminarDelCarrito(int idProducto)
        {
            try
            {
                using (var conn = new MySqlConnection(connectionString))
                {
                    conn.Open();
                    var cmd = new MySqlCommand("DELETE FROM carrito WHERE idproducto = @idProducto", conn);
                    cmd.Parameters.AddWithValue("@idProducto", idProducto);
                    cmd.ExecuteNonQuery();
                }

                TempData["MensajeEli"] = "Producto eliminado del carrito.";
            }
            catch (Exception ex)
            {
                TempData["ErrorEli"] = "Ocurrió un error al eliminar el producto: " + ex.Message;
            }

            return RedirectToAction("Carrito");
        }


        // Método para obtener los productos del carrito
        private List<Producto> ObtenerProductosCarrito()
        {
            var productos = new List<Producto>();

            using (var conn = new MySqlConnection(connectionString))
            {
                conn.Open();
                var cmd = new MySqlCommand(@"SELECT p.idproducto, p.nombreProducto, p.precioProducto, 
                                            p.descripcionProducto, p.imagenProducto, c.cantidad 
                                       FROM productos p 
                                       JOIN carrito c ON p.idproducto = c.idproducto", conn);

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        productos.Add(new Producto
                        {
                            IdProducto = reader.GetInt32("idproducto"),
                            NombreProducto = reader.GetString("nombreProducto"),
                            PrecioProducto = reader.GetDouble("precioProducto"),
                            DescripcionProducto = reader.GetString("descripcionProducto"),
                            ImagenProducto = reader.GetString("imagenProducto"),
                            Cantidad = reader.GetInt32("cantidad")
                        });
                    }
                }
            }

            return productos;
        }

        #endregion

        #region Inicio sesion
        [HttpPost]
        public async Task<JsonResult> InicioSesion(string usuario, string contrasena)
        {
            try
            {
                // Crear el cuerpo de la solicitud
                var payload = new
                {
                    usuario = usuario,
                    contrasena = contrasena
                };

                // Serializar el cuerpo a JSON
                string jsonPayload = JsonConvert.SerializeObject(payload);

                // Enviar la solicitud POST a la API
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _httpClient.PostAsync("usuario/inicio-sesion", content);

                if (response.IsSuccessStatusCode)
                {
                    // Leer y procesar la respuesta
                    string responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<dynamic>(responseContent);

                    if (result.success == true)
                    {

                        TempData["IdUsuarioTemp"] = result.idUsuario; // Guardar temporalmente el ID del usuario para 2FA
                        TempData["Mensaje"] = result.message; // Mensaje del servidor
                        return Json(new { success = true, message = result.message });
                    }
                    else
                    {
                        return Json(new { success = false, message = result.message });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Error al comunicarse con la API." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpPost]
        public async Task<JsonResult> VerificarCodigo2FA(int codigoIngresado)
        {
            try
            {
                // Crear el cuerpo de la solicitud
                var payload = new
                {
                    usuario = TempData["Usuario"].ToString(), // Usuario desde TempData
                    codigoIngresado = codigoIngresado
                };

                // Serializar el cuerpo a JSON
                string jsonPayload = JsonConvert.SerializeObject(payload);

                // Enviar la solicitud POST a la API
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                HttpResponseMessage response = await _httpClient.PostAsync("usuario/verificar-codigo", content);

                if (response.IsSuccessStatusCode)
                {
                    // Leer y procesar la respuesta
                    string responseContent = await response.Content.ReadAsStringAsync();
                    var result = JsonConvert.DeserializeObject<dynamic>(responseContent);

                    if (result.success == true)
                    {
                        Session["Usuario"] = result.idUsuario; // Guardar el ID del usuario en la sesión
                        TempData["Mensaje"] = result.message; // Mensaje del servidor
                        return Json(new { success = true, redirectTo = result.redirectTo });
                    }
                    else
                    {
                        return Json(new { success = false, message = result.message });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Error al comunicarse con la API." });
                }
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        #region Contrasena
        [HttpPost]
        public async Task<JsonResult> ObtenerPreguntasAleatorias(int UsuarioId)
        {
            var response = await _httpClient.PostAsJsonAsync("usuario/obtener-preguntas", new { usuarioId = UsuarioId });

            if (response.IsSuccessStatusCode)
            {
                var resultado = await response.Content.ReadAsAsync<dynamic>();
                return Json(new { success = true, preguntas = resultado.preguntas });
            }
            else
            {
                return Json(new { success = false, message = "Error al obtener preguntas." });
            }
        }
        [HttpPost]
        public async Task<JsonResult> VerificarRespuestas(int UsuarioId, string Respuesta1, string Respuesta2)
        {
            var response = await _httpClient.PostAsJsonAsync("usuario/verificar-respuestas", new
            {
                usuarioId = UsuarioId,
                respuesta1 = Respuesta1,
                respuesta2 = Respuesta2
            });

            if (response.IsSuccessStatusCode)
            {
                var resultado = await response.Content.ReadAsAsync<dynamic>();
                return Json(new { success = true, verificado = resultado.verificado });
            }
            else
            {
                return Json(new { success = false, message = "Error al verificar respuestas." });
            }
        }
        [HttpPost]
        public JsonResult CambiarContrasena(int usuarioId, string nuevaContrasena)
        {
            // Encripta la nueva contraseña antes de enviarla a la base de datos.
            string contrasenaEncriptada = BCrypt.Net.BCrypt.HashPassword(nuevaContrasena);

            // Actualiza la contraseña del usuario en la base de datos.
            bool actualizado = ActualizarContrasenaEnBD(usuarioId, contrasenaEncriptada);

            // Retorna el resultado en formato JSON.
            return Json(new { actualizado = actualizado });
        }

        // Método privado para actualizar la contraseña en la base de datos.
        private bool ActualizarContrasenaEnBD(int usuarioId, string contrasenaEncriptada)
        {
            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                conn.Open();

                // Configura el comando para ejecutar el procedimiento almacenado.
                MySqlCommand cmd = new MySqlCommand("ActualizarContrasena", conn)
                {
                    CommandType = CommandType.StoredProcedure
                };

                // Agrega los parámetros requeridos por el procedimiento.
                cmd.Parameters.AddWithValue("@pIdUsuario", usuarioId);
                cmd.Parameters.AddWithValue("@pNuevaContrasena", contrasenaEncriptada);

                // Ejecuta el comando y obtiene el número de filas afectadas.
                int filasAfectadas = cmd.ExecuteNonQuery();

                // Retorna verdadero si se ha actualizado al menos una fila.
                return filasAfectadas > 0;
            }
        }

        #endregion
        #region Registrar

        [HttpPost]
        public ActionResult RegistrarUsuario(Usuario usuario)
        {
            if (!ModelState.IsValid)
            {
                return View("Reg", usuario);
            }

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                conn.Open();

                // Verificar si el nombre de usuario ya existe
                MySqlCommand checkUsernameCmd = new MySqlCommand("SELECT COUNT(*) FROM usuarios WHERE NombreUsuario = @NombreUsuario", conn);
                checkUsernameCmd.Parameters.AddWithValue("@NombreUsuario", usuario.NombreUsuario);
                int usernameCount = Convert.ToInt32(checkUsernameCmd.ExecuteScalar());

                if (usernameCount > 0)
                {
                    TempData["MUI"] = "El usuario ya existe, escoja un nombre diferente.";
                    return RedirectToAction("Registrador");
                }

                // Verificar si la identificación ya existe
                MySqlCommand checkIdCmd = new MySqlCommand("SELECT COUNT(*) FROM usuarios WHERE IdUsuario = @pIdUsuario", conn);
                checkIdCmd.Parameters.AddWithValue("@pIdUsuario", usuario.IdUsuario);
                int idCount = Convert.ToInt32(checkIdCmd.ExecuteScalar());

                if (idCount > 0)
                {
                    TempData["MII"] = "La identificación ya está registrada, intente de nuevo";
                    return RedirectToAction("Registrador");
                }

                // Si hay algún error de duplicado, retornar la vista con los mensajes de error
                if (usernameCount > 0 || idCount > 0)
                {
                    return View("Registrador", usuario);
                }

                // Encriptar la contraseña antes de guardarla
                string contrasenaEncriptada = BCrypt.Net.BCrypt.HashPassword(usuario.Password);

                MySqlCommand cmd = new MySqlCommand("RegistrarUsuario", conn);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@pIdUsuario", usuario.IdUsuario);
                cmd.Parameters.AddWithValue("@pNombreUsuario", usuario.NombreUsuario);
                cmd.Parameters.AddWithValue("@pDireccion", usuario.Direccion);
                cmd.Parameters.AddWithValue("@pPassword", contrasenaEncriptada); // Guardar contraseña encriptada
                cmd.Parameters.AddWithValue("@pPregunta1", usuario.Pregunta1);
                cmd.Parameters.AddWithValue("@pRespuesta1", usuario.Respuesta1);
                cmd.Parameters.AddWithValue("@pPregunta2", usuario.Pregunta2);
                cmd.Parameters.AddWithValue("@pRespuesta2", usuario.Respuesta2);
                cmd.Parameters.AddWithValue("@pPregunta3", usuario.Pregunta3);
                cmd.Parameters.AddWithValue("@pRespuesta3", usuario.Respuesta3);
                cmd.Parameters.AddWithValue("@pIdProvincia", usuario.IdProvincia);
                cmd.Parameters.AddWithValue("@pIdCanton", usuario.IdCanton);
                cmd.Parameters.AddWithValue("@pIdDistrito", usuario.IdDistrito);

                cmd.ExecuteNonQuery();
            }

            TempData["MensajeUsu"] = "Usuario registrado exitosamente.";
            return RedirectToAction("Registrador");
        }


        public class PasswordPolicyAttribute : ValidationAttribute
        {
            protected override ValidationResult IsValid(object value, ValidationContext validationContext)
            {
                string password = value as string;

                if (password == null || password.Length < 8 || password.Length > 15 ||
                    !Regex.IsMatch(password, @"[A-Z]") ||    // Al menos una mayúscula
                    !Regex.IsMatch(password, @"[a-z]") ||    // Al menos una minúscula
                    !Regex.IsMatch(password, @"\d") ||       // Al menos un número
                    !Regex.IsMatch(password, @"[\W_]"))   // Al menos un carácter especial

                {

                    return new ValidationResult("La contraseña debe tener al menos 8 caracteres y menos de 15, incluyendo mayúsculas, minúsculas, números y caracteres especiales.");
                }

                return ValidationResult.Success;
            }
        }

        #endregion
        #endregion

        #region Administrador
        // GET: Login
        public ActionResult Login()
        {

            return View();
        }

        // POST: Login
        [HttpPost]
        public async Task<ActionResult> Login(string Usuario, string Contrasena)
        {
            var data = new { Usuario, Contrasena };
            var content = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("admin/login", content);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsAsync<dynamic>();
                if ((bool)result.success)
                {
                    Session["UsuarioAdmin"] = Usuario;
                    return RedirectToAction("GestionProductos");
                }
            }

            ViewBag.Error = "Usuario o contraseña incorrectos.";
            return View();
        }


        // GET: GestionProductos
        public async Task<ActionResult> GestionProductos(int? id)
        {
            var response = await _httpClient.GetAsync("admin/productos");
            response.EnsureSuccessStatusCode();

            var productos = await response.Content.ReadAsAsync<List<Producto>>();
            Producto producto = id.HasValue ? await ObtenerProductoPorId(id.Value) : new Producto();
            ViewBag.Productos = productos;
            return View(producto);
        }


        private async Task<Producto> ObtenerProductoPorId(int id)
        {
            var response = await _httpClient.GetAsync($"admin/productos/{id}");
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsAsync<Producto>();
        }

        [HttpPost]
        public async Task<ActionResult> GuardarProducto(Producto producto)
        {
            var content = new StringContent(JsonConvert.SerializeObject(producto), Encoding.UTF8, "application/json");
            HttpResponseMessage response;

            if (producto.IdProducto == 0)
            {
                response = await _httpClient.PostAsync("admin/productos", content);
                TempData["MensajeCrear"] = "Producto agregado.";
            }
            else
            {
                response = await _httpClient.PutAsync($"admin/productos/{producto.IdProducto}", content);
                TempData["MensajeActualizar"] = "Producto actualizado.";
            }

            response.EnsureSuccessStatusCode();
            return RedirectToAction("GestionProductos");
        }

        // Método para Eliminar Producto
        public async Task<ActionResult> EliminarProducto(int id)
        {
            var response = await _httpClient.DeleteAsync($"admin/productos/{id}");
            response.EnsureSuccessStatusCode();

            TempData["MensajeEliminar"] = "Producto eliminado.";
            return RedirectToAction("GestionProductos");
        }

        #endregion

        #region Catalogo


        public ActionResult FormCatalogo()
        {
            List<Producto> productos = new List<Producto>();

            string connectionString = ConfigurationManager.ConnectionStrings["MySqlConnection"].ConnectionString;

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                conn.Open();
                string query = "SELECT * FROM productos";
                MySqlCommand cmd = new MySqlCommand(query, conn);

                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        productos.Add(new Producto
                        {
                            IdProducto = reader.GetInt32("idProducto"),
                            NombreProducto = reader.GetString("nombreProducto"),
                            PrecioProducto = reader.GetDouble("precioProducto"),
                            PrecioCompleto = reader.GetDouble("precioCompleto"),
                            DescripcionProducto = reader.GetString("descripcionProducto"),
                            CantidadStock = reader.GetInt32("cantidadStock"),
                            ImagenProducto = reader.GetString("imagenProducto")

                        });
                    }
                }
            }

            return View(productos);
        }



    }

    #endregion




}
#region Clases
// Clase modelo para productos
public class ProductoProveedor
{
    public int IdProducto { get; set; }
    public string NombreProducto { get; set; }
    public decimal PrecioCompra { get; set; }
    public int CantidadDisponible { get; set; }
    public string NombreProveedor { get; set; }
}
public class ProductoCarrito
{
    public string NombreProducto { get; set; }
    public int Cantidad { get; set; }
    public decimal Precio { get; set; }
    public decimal Subtotal { get; set; }
}

public class Mensajero
{
    public int IdMensajero { get; set; } // Identificador del mensajero
    public string Nombre { get; set; }   // Nombre del mensajero
    public string Telefono { get; set; } // Teléfono del mensajero
    public bool Disponible { get; set; } // Estado de disponibilidad
}

#endregion