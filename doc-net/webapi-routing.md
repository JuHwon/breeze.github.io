---
layout: doc-net
---
# Web API Routing


# Web API routes



	protected void Application_Start()
	{
		...

		WebApiConfig.Register(GlobalConfiguration.Configuration);
		...
	}



	public static void Register(HttpConfiguration config)
	{
	 config.Routes.MapHttpRoute(
	 name: "DefaultApi",
	 routeTemplate: "api/{controller}/{id}",
	 defaults: new { id = RouteParameter.Optional }
	 );
	}


	GET http://my.site.com/api/cats
	GET http://my.site.com/api/dogs/42
	DELETE http://my.site.com/api/goats/3


###	Breeze Web API route



	GET http://my.site.com/breeze/Pets/Cats
	GET http://my.site.com/breeze/Pets/Dogs/$filter=id eq 42
	POST http://my.site.com/breeze/Pets/SaveChanges



###	Make Breeze controller routes distinct


	routeTemplate: "api/{controller}/{id}"     // Web API default template
	routeTemplate: "api/{controller}/{action}" // Breeze template


	~api/someController/xxx




		GlobalConfiguration.Configuration.Routes.MapHttpRoute(
			  name: "BreezeApi",
			  routeTemplate: "breeze/{controller}/{action}"
		);

>Note: some earlier examples and documentation still use the 'api' prefix which can conflict with other Web API routes. We encourage you to update your code to use a distinct prefix word such as 'breeze' or a word of your own choosing. Remember also to update the "serviceName" that you use to initialize your *EntityManager*.

## Registering the Breeze route


1.  Registering the Breeze controller route
1.  Ensuring that a Breeze Web API route doesn't conflict with default Web API routes
1.  Solving #1 and #2 with an safe, automated solution.





	[assembly: WebActivator.PreApplicationStartMethod(
		typeof(BreezeWebApiConfig), "RegisterBreezePreStart")]
	namespace Todo.App_Start {

	  public static class BreezeWebApiConfig {

		public static void RegisterBreezePreStart() {

		  GlobalConfiguration.Configuration.Routes.MapHttpRoute(
			  name: "BreezeApi",
			  routeTemplate: "breeze/{controller}/{action}" 
		  );
		}
	  }
	}
