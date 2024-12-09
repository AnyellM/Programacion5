using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace DulceEncanto.Models
{
   
        public class Producto
        {
        public int IdProducto { get; set; } // Debe coincidir con la clave "idProducto" del JSON.
        public string NombreProducto { get; set; } // "nombreProducto"
        public double? PrecioProducto { get; set; } // "precioProducto"
        public double PrecioCompleto { get; set; } // "precioCompleto"
        public string DescripcionProducto { get; set; } // "descripcionProducto"
        public int CantidadStock { get; set; } // "cantidadStock"
        public string ImagenProducto { get; set; } // "imagenProducto"

        public int? Cantidad { get; set; } // Esta propiedad es importante para el cálculo del subtotal
                                           // Propiedad para almacenar el subtotal
        public double Subtotal { get; set; }
      
    }
    public class CarritoResponse
    {
        public List<Producto> Productos { get; set; }
        public double Total { get; set; }
    }

}