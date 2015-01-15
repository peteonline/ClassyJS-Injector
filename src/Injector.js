define(

'class Injector',
{
	
	/**
	 * @var {[object]}
	 * 
	 * Objects registered as singletons
	 * 
	 * Contains all objects which represent
	 * the single instance that should be
	 * returned for their respective classes
	 */
	'private singletons ([object])': [],
	
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
		
		// If there is a singleton class
		// registered for the provided
		// class name, return that instance
		if (this.hasSingleton(className)) return this.getSingleton(className);
		
		// Get the class constructor function
		// for the given class name
		var classConstructor = this.getClassFromClassName(className);
		
		// Get a list of dependencies
		// for this class as strings
		var dependencyTypes = this.getDependencyTypesFromClass(className);
		
		// Get the actual dependency objects
		var dependencies = this.getDependenciesFromDependencyTypes(dependencyTypes);
		
		// Throw in an 'undefined' at the
		// start of the array. This is so
		// that the bind method below
		// passes undefined as 'this' to
		// the class constructor.
		dependencies.unshift(undefined);
		
		// Finally, create a new object with
		// its dependencies and return it
		return new (classConstructor.bind.apply(classConstructor, dependencies))();
		
	},
	
	'public registerSingleton (object) -> undefined': function(object)
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
		this.singletons('push', {
			className: match[1],
			object: object
		});
		
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
	
	'private getDependencyTypesFromClass (string) -> array': function(className)
	{
		
		// Get a list of the methods of the
		// given class via reflection
		var reflectionMethods = (new Reflection.Class(className)).getMethods();
		
		// Loop through all the methods saving
		// the ones which are constructors
		var constructorMethods = [];
		for (var i in reflectionMethods) {
			if (reflectionMethods[i].getName() == 'construct') {
				constructorMethods.push(reflectionMethods[i]);
			}
		}
		
		// Loop through the constructor methods
		// and get a list of argument types,
		// as strings, for the method with
		// the lowest number of arguments
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
		// constructor exists
		return argumentTypes || [];
		
	},
	
	'private getDependenciesFromDependencyTypes ([string]) -> array': function(dependencyTypes)
	{
		
		// Loop through each of the dependency
		// strings and build the relevant
		// object via our own resolve method
		var dependencies = [];
		for (var i in dependencyTypes) {
			if (!dependencyTypes.hasOwnProperty(i)) continue;
			dependencies.push(this.resolve(dependencyTypes[i]));
		}
		return dependencies;
		
	},
	
	'private hasSingleton (string) -> boolean': function(className)
	{
		
		// Loop through our array of
		// singletons, returning true if we
		// find a match or false if we do not
		var singletons = this.singletons();
		for (var i in singletons) {
			if (singletons[i].className == className) return true;
			
		}
		return false;
		
	},
	
	'private getSingleton (string) -> object': function(className)
	{
		
		// Loop through the array of
		// singletons, returning the object
		// which matches the given class name
		var singletons = this.singletons();
		for (var i in singletons) {
			if (singletons[i].className == className) return singletons[i].object;
		}
		
	}
	
});
