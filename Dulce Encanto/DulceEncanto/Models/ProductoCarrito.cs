using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DulceEncanto.Models
{
    public class ProductoCarrito
    {
     
            public string NombreProducto { get; set; }
            public int Cantidad { get; set; }
            public decimal Precio { get; set; }
            public decimal Subtotal { get; set; }
        

    }
}