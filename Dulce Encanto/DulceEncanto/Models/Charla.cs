using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DulceEncanto.Models
{
    public class Charla
    { 
            public int Id { get; set; }
            public string Titulo { get; set; }
            public string Descripcion { get; set; }
            public DateTime Fecha { get; set; }
            public string Hora { get; set; }
            public string Lugar { get; set; }
            public string Enlace { get; set; }
        
    }
}