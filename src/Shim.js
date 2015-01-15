if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis){
		if (typeof this !== 'function') {
			throw new TypeError(
				'Function.prototype.bind - what is trying to be bound is not callable'
			);
		}
		var aArgs = Array.prototype.slice,
			f = aArgs.call(arguments,1),
			fToBind = this,
			fNOP = function(){},
			fBound = function(){
				return fToBind.apply(this instanceof fNOP
					? this
					: oThis || window,
					f.concat(aArgs.call(arguments))
				);
			};
		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	};
}
