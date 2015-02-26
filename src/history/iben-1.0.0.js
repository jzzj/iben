(function(){
	var _toString = Object.prototype.toString,
		class2type = [];
	function each(array, fn){
		for(var i=0, len=array.length; i<len; i++)
			fn(i, array[i]);
	}
	each("Boolean Number String Function Array Date RegExp Object".split(" "),function(i, item){
		class2type["[object "+item+"]"] = item.toLowerCase();
	});
	function extend(destination, source){
		for(var key in source)
			destination[key] = source[key];
	}
	function type(object){
		return isUndefined(object)? 'undefined': object==null? 'null': class2type[_toString.call(object)] || 'object';
	}
	function isUndefined(object){
		return typeof object==='undefined';
	}
	function clone(object){
		return extend({}, object);
	}
	function emptyFunction(){}
	extend(Object,{
		extend: extend,
		type: type,
		isUndefined: isUndefined,
		clone: clone,
		emptyFunction: emptyFunction
	});
})();
var _arraryProto = Array.prototype,
	_slice = _arraryProto.slice;
Object.extend(_arraryProto, (function(){
	function each(iterator, stopOnFalse){
		for(var i=0, len=this.length; i<len; i++){
			if(iterator(this[i], i)&&stopOnFalse===true)
				break;
		}
	}
	function inject(memo, iterator){
		this.each(function(item, idx){
			memo = iterator(memo, item, idx);
		})
		return memo;
	}
	function clone(){
		return _slice.call(this, 0);
	}
	var isArray = Object.type(Array.isArray) === 'function' ? Array.isArray : function(o){return Object.type(o) === 'array';},
		filter = Object.type(_arraryProto.filter) === 'function' ? _arraryProto.filter :
			function(iterator, context){ 
				return this.inject([], function(array, item, idx){
						if(iterator.call(context, item, idx))
							array.push(item);
						return array;
					}); 
			};
	return {
		inject: inject,
		each: each,
		isArray: isArray,
		filter: filter,
		clone: clone
	}
})())
var Publisher = function(){
	this.subscribers = {any:[]};
}
Object.extend(Publisher.prototype, {
	subscribe: function(fn, context, type){
		type = type || 'any';
        if (Object.isUndefined(this.subscribers[type]))
            this.subscribers[type] = [];
		
        this.subscribers[type].push([fn, context]);
	},
	unsubscribe: function(fn, type){
		type = type || 'any';
		var that = this;
		this.subscribers[type] = this.subscribers[type].filter(function(item){
			return item[0] != fn;
		});
	},
	shutdown: function(type){
		type = type || 'any';
		this.subscribers[type] = [];
	},
	publish: function(){
		var args, type = arguments[arguments.length-1];
		type = Object.type(type)==='string'? type : 'any';
		args = _arraryProto.clone.call(arguments);
		this.subscribers[type]&&this.subscribers[type].each(function(object){
			object[0].apply(object[1], args);
		});
	}
});
var iBen = {
	Version: "1.0.0",
	Browser: (function(){
		var ua = navigator.userAgent;
		var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
		return {
		  IE:             !!window.attachEvent && !isOpera,
		  Opera:          isOpera,
		  WebKit:         ua.indexOf('AppleWebKit/') > -1,
		  Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
		  MobileSafari:   /Apple.*Mobile/.test(ua)
		}
	})()
};

iBen.inherit = function(subclass, superclass){
	function F(){}
	F.prototype = superclass.prototype;
	subclass.prototype = new F;
	subclass.prototype.constructor = subclass;
	subclass.superclass = superclass;
};