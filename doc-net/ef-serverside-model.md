---
layout: doc-net
---
#The server-side model

In the sample code we implement the persistence service as an ASP.NET Web API that queries and saves entities with the help of the Entity Framework. You can write the service a different way but this is a convenient approach for .NET developers and the one we'll discuss on this page and the ones that follow.

##Entity Framework

<a href="http://msdn.microsoft.com/en-us/data/ef.aspx">Entity Framework</a> (EF) is a .NET data access technology with an Object Relational Mapper (ORM). The ORM maps a domain-specific object model to the schema of a relational database. It uses that map to move data between entity model objects (instances of .NET classes) and the tables and columns of a relational database.

A Breeze client model maps easily to (almost) every structure supported by Entity Framework 4.x, including:

	- All simple data types
	- Complex types
	- Inheritance (TPH, TPT, TPC)
	- Associations: 1-1, 1-M

The Breeze.js client does not support "many to many" relationships at this time. You will have to expose the junction/mapping table as an entity.

The Breeze.net server components support EF 4.x and 5.x but not EF 6 (which has not been released) nor versions prior to v.4.2 .

##Build your model

You can build your EF model in two ways:


	- Start from an existing database, derive a conceptual model from the database schema, and generate entity classes from that conceptual model.
	- Write your .NET entity classes first, then tell EF to derive the conceptual model and database mapping from your classes.


The first approach is called "**database first**". You point EF's model design tool at a database and it produces an XML description of the mapping called an EDMX file. You'll see this artifact in the .NET model project.

The second approach is called "**code first**". You write your entity classes to suit your application needs with comparatively little regard for the database, the EF, or its mapping. There is no EDMX file.

The "code first" approach rarely works in the pristine way I described. You usually have to take EF by the hand and walk it in the right direction, perhaps by decorating your classes with helpful attributes or perhaps more explicitly through EF's "fluent" mapping API.

Both approaches have merit. We can use either to build the model for our Breeze application.

> See the [Web Api Configuration](/doc-net/webapi-routing) topic to resolve Entity Framework version issues.

##A simplistic code first model

This isn't a lesson in Entity Framework so we'll just pick one &hellip; and we'll pick "code first".

Here's the one entity class in model for the "Breeze Todo" sample application:

		
		public class TodoItem    {
			public int Id { get; set; }                     // 42

			[Required, StringLength(maximumLength: 30)]     // Validation rules
			public string Description { get; set; }         // "Get milk"

			public System.DateTime CreatedAt { get; set; }  // 25 August 2012, 9am PST
			public bool IsDone { get; set; }                // false
			public bool IsArchived { get; set; }            // false
		}


All properties are data properties whose values belong in the database. There are no navigation properties to related entities (because this is the only entity in the model). The class is public and all properties are fully public so it will serialize to a wire format cleanly on its own. The property names match the table and column names we'd like to see in our database. The primary key can be inferred from the property named "Id" and, being integer, EF will assume that the database is responsible for generating new Ids when inserting new TodoItem rows.



##A more realistic code first model

Let's try something more ambitious. We'll look at excerpts from three related entity classes in the Northwind model, starting with the Customer class.

	public class Customer {

	  public Guid CustomerID { get; internal set; }

	  [Required, MaxLength(40)]
	  public string CompanyName { get; set; }

	  [MaxLength(30)]
	  public string ContactName { get; set;}

	  // ... more properties ...

	  public ICollection<Order> Orders { get; set; }
	}


Some of the properties are decorated with validation attributes (*Required*, *MaxLength*). Entity Framework can use this information to validate changed entities before saving them. [So can Breeze](/doc-net/ef-serverside-validation).







##The Order entity

The Order entity is on the other end of the *Customer.Orders property. Let's look at it.


	public class Order {
	
	  public int OrderID {get; set;}
	  public Guid? CustomerID {get; set;}
	  public DateTime? OrderDate {get; set;}
	  public decimal? Freight {get; set;}
	
	  // ... more properties ...
	
	  [ForeignKey("CustomerID")]
	  [InverseProperty("Orders")]
	  public Customer Customer {get; set;}
	
	  [InverseProperty("Order")]
	  public ICollection<OrderDetail> OrderDetails {get; set;}
	}

Near the bottom is the *Customer* navigation property. This is the inverse of the customer's *Orders* property and gives us a way to navigate back to the parent Customer.









##The OrderDetails entity

Here it is:

	public class OrderDetail {
	
	  public int OrderID {get; set;}
	  public int ProductID {get; set;}
	  public decimal UnitPrice {get; set;}
	
	  // ... more properties ...
	
	  [ForeignKey("OrderID")]
	  [InverseProperty("OrderDetails")]
	  public Order Order {get; set;}
	
	  [ForeignKey("ProductID")]
	  public Product Product {get;set;}
	}








##Model Metadata

We could continue by tracing the path from OrderDetail to Product to Supplier, then work our way around to the rest of the model. But you get the idea and you can study the model in the sample code at your leisure.

I'd like for you to pause for a moment and reflect on what we've discovered in these three classes along. Although each is simple in its own right, there's rather a lot to know about the entities in a model. For each entity property we have questions that go beyond "*what's the property name?*"...questions such as:


	- What's its datatype?
	- Is it nullable?
	- Is it a navigation property? If so, how does it relate to another entity?
	- Is it a primary key or a foreign key?
	- Is it part of a compound key? If so which part?
	- Is the client or the server responsible for assigning keys to new entities?
	- Is a value required? Is there a minimum or maximum length?




A customer on the JavaScript client will have orders and those orders will have order details and they'll all be wired together in the same manner as their server-side companions.

Imagine a model with 30, 50, 100, or 200 entities, each with an average of 10 properties. No one wants to re-code this kind of metadata in JavaScript for all of those entities and properties.

You don't have to with Breeze. There's a .NET Breeze component that scoops up this information and packages it as a metadata document. Your persistence service can send this document to the Breeze client. The Breeze client interprets the metadata and builds a conforming JavaScript model with the same structure and constraints as the server-side model.

We'll see how this works when we get to the client. Our next stop is the [Entity Framework *DbContext*](/doc-net/ef-dbcontext) which is the gateway to the database.