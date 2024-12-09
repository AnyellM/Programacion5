using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using static DulceEncanto.Controllers.HomeController;

namespace DulceEncanto.Models
{
    public class Usuario
    {
        // Agregar propiedades para provincia, cantón y distrito
        public int IdProvincia { get; set; }
        public int IdCanton { get; set; }
        public int IdDistrito { get; set; }
        public string Pregunta1 { get; set; }
        public string Respuesta1 { get; set; }
        public string Pregunta2 { get; set; }
        public string Respuesta2 { get; set; }
        public string Pregunta3 { get; set; }
        public string Respuesta3 { get; set; }
        public int IdUsuario { get; set; }

        [Required]
        public string NombreUsuario { get; set; }

        public string Direccion { get; set; }

        [Required]

        public string Password { get; set; }
    }

}
