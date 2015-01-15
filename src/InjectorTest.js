describe('Injector', function(){
	
	/**
	 * @todo...
	 * 
	 * Pass in one dependency and inject others
	 * Pass in nested dependency
	 * Check singleton is also used for dependencies
	 * Ensure singleton cannot be replaced
	 * Allow interface implementation to be registered and used when interface is resolved
	 * Ensure interface implementation is used as dependency
	 * Ensure interface implementation is actually of that interface
	 * Allow object method to be called through injector and its dependencies be resolved
	 * Ensures object method downstream dependencies are injected
	 * All the same again with object method...
	 * Ensure injector uses itself as a singleton
	 */
	
	var injector;
	
	beforeEach(function(){
		delete window.ToolsTest;
		injector = new Injector();
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
	});
	
	it('can be instanciated', function(){
		var injector = new Injector();
		expect(injector instanceof Injector).toBe(true);
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
	
});
