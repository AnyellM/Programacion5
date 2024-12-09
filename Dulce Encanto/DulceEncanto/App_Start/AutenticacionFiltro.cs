using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DulceEncanto.App_Start
{
    public class AutenticacionFiltro : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (HttpContext.Current.Session["Usuario"] == null)
            {
                // Redirige al login si no hay sesión activa
                filterContext.Result = new RedirectToRouteResult(
                    new System.Web.Routing.RouteValueDictionary
                    {
                    { "controller", "Home" },
                    { "action", "InicioSesion" }
                    });
            }

            base.OnActionExecuting(filterContext);
        }
    }

}