describe('Classy.Injector', function(){
	
	/**
	 * @todo...
	 * 
	 * Pass in one dependency and inject others
	 * Pass in nested dependency
	 * Check singleton is also used for dependencies
	 * Ensure singleton cannot be replaced
	 * Ensure interface implementation is used as dependency
	 * Allow a callback to run before instantiating a certain class
	 */
	
	var injector;
	
	beforeEach(function(){
		delete window.ToolsTest;
		injector = new Classy.Injector();
		define('class ToolsTest.SimpleClass', {});
		define('class ToolsTest.SingleDependency', {
			'public simpleObject (ToolsTest.SimpleClass)': null,
			'public construct (ToolsTest.SimpleClass) -> undefined': function(simpleObject){
				this.simpleObject(simpleObject);
			}
		});
		define('class ToolsTest.MultipleDependencies', {
			'public arguments (array)': [],
			'public construct (ToolsTest.SimpleClass, ToolsTest.SimpleClass) -> undefined': function(){
				for (var i = 0; i < arguments.length; i++) this.arguments('push', arguments[i]);
			}
		});
		define('class ToolsTest.NestedDependencies', {
			'public object (ToolsTest.MultipleDependencies)': null,
			'public construct (ToolsTest.MultipleDependencies) -> undefined': function(object){
				this.object(object);
			}
		});
		define('class ToolsTest.MethodDependency', {
			'public simpleObject (ToolsTest.SimpleClass)': null,
			'public myMethod (ToolsTest.SimpleClass) -> undefined': function(simpleObject){
				this.simpleObject(simpleObject);
			}
		});
		define('class ToolsTest.NestedMethodDependency', {
			'public object (ToolsTest.MultipleDependencies)': null,
			'public myMethod (ToolsTest.MultipleDependencies) -> undefined': function(object){
				this.object(object);
			}
		});
		define('interface ToolsTest.IMyInterface');
		define('class ToolsTest.InterfaceImplementation implements ToolsTest.IMyInterface');
	});
	
	it('can be instanciated', function(){
		var injector = new Classy.Injector();
		expect(injector instanceof Classy.Injector).toBe(true);
	});
	
	it('can resolve object', function(){
		var simpleObject = injector.resolve('ToolsTest.SimpleClass');
		expect(simpleObject instanceof ToolsTest.SimpleClass).toBe(true);
	});
	
	it('provides single dependency to object', function(){
		var myObject = injector.resolve('ToolsTest.SingleDependency');
		expect(myObject instanceof ToolsTest.SingleDependency).toBe(true);
		expect(myObject.simpleObject() instanceof ToolsTest.SimpleClass).toBe(true);
	});
	
	it('provides multiple dependencies to object', function(){
		var myObject = injector.resolve('ToolsTest.MultipleDependencies');
		expect(myObject instanceof ToolsTest.MultipleDependencies).toBe(true);
		expect(myObject.arguments()[0] instanceof ToolsTest.SimpleClass).toBe(true);
		expect(myObject.arguments()[1] instanceof ToolsTest.SimpleClass).toBe(true);
	});
	
	it('provides nested dependecies', function(){
		var myObject = injector.resolve('ToolsTest.NestedDependencies');
		expect(myObject instanceof ToolsTest.NestedDependencies).toBe(true);
		expect(myObject.object() instanceof ToolsTest.MultipleDependencies).toBe(true);
		expect(myObject.object().arguments()[0] instanceof ToolsTest.SimpleClass).toBe(true);
		expect(myObject.object().arguments()[1] instanceof ToolsTest.SimpleClass).toBe(true);
	});
	
	it('can resolve a class method', function(){
		var myObject = new ToolsTest.MethodDependency();
		injector.resolve(myObject, 'myMethod');
		expect(myObject.simpleObject() instanceof ToolsTest.SimpleClass).toBe(true);
	});
	
	it('can resolve a class method with nested dependencies', function(){
		var myObject = new ToolsTest.NestedMethodDependency();
		injector.resolve(myObject, 'myMethod');
		expect(myObject.object() instanceof ToolsTest.MultipleDependencies).toBe(true);
		expect(myObject.object().arguments()[0] instanceof ToolsTest.SimpleClass).toBe(true);
		expect(myObject.object().arguments()[1] instanceof ToolsTest.SimpleClass).toBe(true);
	});
	
	it('allows singleton to be registered and it is used in future resolves', function(){
		var simpleObject = new ToolsTest.SimpleClass();
		injector.registerSingleton(simpleObject);
		expect(injector.resolve('ToolsTest.SimpleClass')).toBe(simpleObject);
	});
	
	it('uses singleton as dependency in resolve', function(){
		var simpleObject = new ToolsTest.SimpleClass();
		injector.registerSingleton(simpleObject);
		var myObject = injector.resolve('ToolsTest.SingleDependency');
		expect(myObject.simpleObject()).toBe(simpleObject);
	});
	
	it('allows singleton class name to be registered and first instantiated is used', function(){
		injector.registerSingleton('ToolsTest.SimpleClass');
		expect(
			injector.resolve('ToolsTest.SimpleClass')
		).toBe(
			injector.resolve('ToolsTest.SimpleClass')
		);
	});
	
	it('uses itself as a singleton', function(){
		expect(injector.resolve('Classy.Injector')).toBe(injector);
	});
	
	it('allows an interface implementation class to be registered and resolved', function(){
		injector.registerInterface('ToolsTest.IMyInterface', 'ToolsTest.InterfaceImplementation');
		expect(injector.resolve('ToolsTest.IMyInterface') instanceof ToolsTest.InterfaceImplementation).toBe(true);
	});
	
	it('allows multiple interface implementations to be resolved', function(){
		injector.registerInterface('ToolsTest.IMyInterface', 'ToolsTest.InterfaceImplementation');
		expect(injector.resolve('ToolsTest.IMyInterface')).not.toBe(injector.resolve('ToolsTest.IMyInterface'));
	});
	
	it('allows an interface implementation to be registered as a singleton', function(){
		injector.registerInterface('ToolsTest.IMyInterface', 'ToolsTest.InterfaceImplementation');
		var instance = injector.resolve('ToolsTest.IMyInterface');
		injector.registerSingleton(instance);
		expect(injector.resolve('ToolsTest.IMyInterface')).toBe(instance);
	});
	
});
