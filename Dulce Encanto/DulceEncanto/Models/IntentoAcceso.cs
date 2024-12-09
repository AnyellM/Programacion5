using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DulceEncanto.Models
{
    public class IntentoAcceso
    {
            public int Id { get; set; }
            public string Usuario { get; set; }
            public DateTime FechaIntento { get; set; }
            public bool Exito { get; set; }
            public string IP { get; set; }
            public string MensajeError { get; set; }
    }
}