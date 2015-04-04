define(

'class Classy.Injector',
{
	
	/**
	 * @var {object}
	 * 
	 * Objects registered as singletons
	 * 
	 * Contains all objects which represent
	 * the single instance that should be
	 * returned for their respective classes,
	 * indexed against their class name.
	 * 
	 * If the singleton has been instantiated
	 * the object itself is held, whereas
	 * if the singleton is yet to be created,
	 * null is used in its place.
	 */
	'protected singletons (object)': {},
	
	/**
	 * @var {object}
	 * 
	 * Objects registered as interface implementations
	 * 
	 * Contains all objects which should be
	 * used when an interface is resolved.
	 * 
	 * If the implementation has been
	 * instantiated the object itself
	 * is held, whereas if it is yet to
	 * be created, the related class name
	 * is used in its place.
	 */
	'protected interfaces (object)': {},
	
	/**
	 * Constructor
	 * 
	 * Constructs the class - simply by
	 * ensuring that this instance is used
	 * as a singleton when an injector
	 * is resolved
	 */
	'public construct () -> undefined': function()
	{
		this.registerSingleton(this);
	},
	
	/**
	 * Instantiates a class
	 * 
	 * Given a class name, a new object
	 * will be resolved and any of its
	 * constructor dependencies will be
	 * created and provided. Any dependencies
	 * which in turn have dependencies will
	 * also be resolved in this manner.
	 * 
	 * @param  {string} className The class to instantiate
	 * @return {object}           The built object
	 */
	'public resolve (string) -> object': function(className)
	{
		return this.doResolve(className);
	},
	
	/**
	 * Calls a class method
	 * 
	 * Given a class instance and a method
	 * name, the method is called and any of
	 * its dependencies will be created and
	 * provided. Any dependencies which in
	 * turn have dependencies will also be
	 * resolved in this manner.
	 * 
	 * @param  {object} instance  The class instance to call
	 * @param  {string} className The method to call
	 * @return {object}           The return value of the method
	 */
	'public resolve (object, string) -> mixed': function(object, methodName)
	{
		// @todo Check object has method
		return this.doResolve(methodName, object);
	},
	
	/**
	 * Registers a class instance as a singleton
	 * 
	 * The provided instance will then be
	 * returned whenever its class is resolved
	 * either directly or as a dependency
	 * 
	 * @param  {object} object   The singleton instance
	 * @return {Classy.Injector} Self for chaining
	 */
	'public registerSingleton (object) -> Classy.Injector': function(object)
	{
		
		// Get the class name of the provided
		// object by parsing the output of
		// its 'toString' method.
		// @todo This approach only works if
		// the object has not implemented a
		// custom toString method. The correct
		// approach will be to use the
		// Reflection API when it has been
		// developed.
		var match = object.toString().match(/\[object ([\w.]+)\]/);
		
		// Push the object into the
		// array of singletons
		this.singletons()[match[1]] = object;
		
		// Allow chaining
		return this;
		
	},
	
	/**
	 * Registers a class name as a singleton
	 * 
	 * The provided class name will be stored
	 * and when a class of its type is
	 * instantiated, that instance will be
	 * used as a singleton from then on.
	 * 
	 * @param  {string} className The singleton class name
	 * @return {Classy.Injector}  Self for chaining
	 */
	'public registerSingleton (string) -> Classy.Injector': function(className)
	{
		
		// @todo Check class exists
		// @todo Check singleton object doesn't already exist
		// @todo Check class name isn't already in the list
		
		// Save the class name as the object
		// index and null to indicate we do
		// not yet have an instance
		this.singletons()[className] = null;
		
		// Allow chaining
		return this;
		
	},
	
	/**
	 * Registers a class name as an interface implementation
	 * 
	 * The provided class name will be stored
	 * and when a class of its type is
	 * instantiated, that instance will be
	 * used as an interface implementation.
	 * 
	 * @param  {string} interfaceName The interface name
	 * @param  {string} className     The implementation class name
	 * @return {Classy.Injector}      Self for chaining
	 */
	'public registerInterface (string, string) -> Classy.Injector': function(interfaceName, className)
	{
		
		// @todo Check instance implements interface
		// @todo Don't overwrite previous interface
		
		// Save the class name against the interface
		this.interfaces()[interfaceName] = className;
		
		// Allow chaining
		return this;
		
	},
	
	'protected doResolve (string, object?) -> mixed': function(classInterfaceOrMethodName, object)
	{
		
		// Work out the class name and method name
		// based on whether an object was provided
		if (object === null) {
			var className = classInterfaceOrMethodName;
			var methodName = 'construct';
		} else {
			// @todo When the Reflection API allows,
			// we should use that instead of parsing
			var className = object.toString().match(/\[object ([A-Za-z0-9.]+)\]/)[1];
			var methodName = classInterfaceOrMethodName;
		}
		
		// If there is a singleton class
		// registered for the provided
		// class name, return that instance
		if (object === null && this.hasSingleton(className)) return this.getSingleton(className);
		
		// If there is an interface implementation
		// registered for the given class name, return
		// an instance of that class
		if (object === null && this.interfaces()[className]) {
			return this.doResolve(this.interfaces()[className]);
		}
		
		// Get the method we are going to
		// resolve. This is either the
		// constructor or a specified method
		var method = (object === null)
			? this.getClassFromClassName(className)
			: object[methodName];
		
		// Get a list of dependencies
		// for this method as strings
		var dependencyTypes = this.getDependencyTypesFromClass(className, methodName);
		
		// Get the actual dependency objects
		var dependencies = this.getDependenciesFromDependencyTypes(dependencyTypes);
		
		// If we are calling a method, do
		// it now providing dependencies
		// and return its return value
		if (object !== null) return method.apply(object, dependencies);
		
		// If we are building a new object,
		// throw in an 'undefined' at the
		// start of the array. This is so
		// that the bind method below
		// passes undefined as 'this' to
		// the class constructor.
		dependencies.unshift(undefined);
		
		// Create the new object
		var object = new (method.bind.apply(method, dependencies))();
		
		// If this class should be a
		// singleton in future, save it now
		if (this.singletons()[className] === null) this.registerSingleton(object);
		
		// Return the new object
		return object;
		
	},
	
	'private getClassFromClassName (string) -> function': function(className)
	{
		
		// Split the class name into
		// its namespaced parts
		var classParts = className.split('.');
		
		// Hold the root namespace object
		// as the current constructor. This
		// will change as we move through
		// the class name parts.
		var classConstructor = window;
		
		// For each class name part, get
		// the relevant object from the
		// current namespace and repeat
		for (var i = 0; i < classParts.length; i++) {
			classConstructor = classConstructor[classParts[i]];
		}
		
		// We should finally have the
		// requested object
		return classConstructor;
		
	},
	
	'private getDependencyTypesFromClass (string, string) -> array': function(className, methodName)
	{
		
		// Get a list of the methods of the
		// given class via reflection
		var reflectionMethods = (new Reflection.Class(className)).getMethods();
		
		// Loop through all the methods saving
		// the ones which match the given name
		var constructorMethods = [];
		for (var i in reflectionMethods) {
			if (reflectionMethods[i].getName() == methodName) {
				constructorMethods.push(reflectionMethods[i]);
			}
		}
		
		// Loop through the methods and get
		// a list of argument types, as
		// strings, for the method with the
		// lowest number of arguments
		var argumentTypes;
		for (var i in constructorMethods) {
			var methodArgumentTypes = constructorMethods[i].getArguments();
			if (typeof argumentTypes == 'undefined'
			||	methodArgumentTypes.length < argumentTypes.length) {
				argumentTypes = [];
				for (var j in methodArgumentTypes) {
					argumentTypes.push(methodArgumentTypes[j].getIdentifier());
				}
			}
		}
		
		// Return the list of arguments,
		// or an empty array if no
		// method exists
		return argumentTypes || [];
		
	},
	
	'private getDependenciesFromDependencyTypes ([string]) -> array': function(dependencyTypes)
	{
		
		// Loop through each of the dependency
		// strings and build the relevant
		// object via our own doResolve method
		var dependencies = [];
		for (var i in dependencyTypes) {
			if (!dependencyTypes.hasOwnProperty(i)) continue;
			dependencies.push(this.doResolve(dependencyTypes[i]));
		}
		return dependencies;
		
	},
	
	'private hasSingleton (string) -> boolean': function(className)
	{
		
		
		// Return true if there is an index
		// for the provided class name in our
		// singletons array, false otherwise
		var singletons = this.singletons();
		return typeof singletons[className] != 'undefined' && singletons[className] !== null;
		
	},
	
	'private getSingleton (string) -> object': function(className)
	{
		
		// Return the singleton object
		// indexed by the given class name
		return this.singletons()[className];
		
	}
	
});
