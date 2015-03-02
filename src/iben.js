/*!
 * iBen JavaScript Library v1.1.0
 * Copyright 2015 zangzhan
 * Date: 2015-2-22 12:18:16
 * license: zangzhan/license
 * contact: 905951024@qq.com
 */
(function(win){
var _arrayProto = Array.prototype,
	_slice =  _arrayProto.slice,
	_concat = _arrayProto.concat,
	
	iBen = function(){
		return iBen.use.apply(this, arguments);
	},
	
	_fnProto = Function.prototype,
	_apply = _fnProto.apply,
	_call  = _fnProto.call,
	_objectProto = Object.prototype,
	_toString = _objectProto.toString,
	_GLOBAL_NAME = "iBen",
	EXTEND_TYPES = ["String","Number","Array","Date"],
	CLASS_TYPE = ["Boolean","Function","RegExp","Object","Error"].concat(EXTEND_TYPES),
	TYPES = CLASS_TYPE.concat(["Undefined","Null"]);

//turn debug off when you publish your project. it's false in the version of the min-iBen
iBen.config = {
	debug: true,
	cacheUse : true,
	throwFail: true
};

//Object moudle
(function(){
	var class2type = {},
		_hasOwn  = class2type.hasOwnProperty,
		_toString= class2type.toString;
	function each(array, fn){
		for(var i=0, len=array.length; i<len; i++)
			fn(i, array[i]);
		return array;
	}
	//borrow from jQuery
	each(CLASS_TYPE, function(i, item){
		class2type["[object "+item+"]"] = item.toLowerCase();
	});
	function extend(destination, source, hasOwnProperty, type){
		if(hasOwnProperty&&type){
			for(var key in source)
				if(_hasOwn.call(source, key)&&iBen.type(source[key])===type)
					destination[key] = source[key];
			return destination;
		}
		if(hasOwnProperty){
			for(var key in source)
				if(_hasOwn.call(source, key))
					destination[key] = source[key];
			return destination;
		}
		for(var key in source)
			destination[key] = source[key];
		return destination;
	}
	function successive(array, source, hasOwnProperty, type){
		return each(array, function(idx, obj){
			extend(obj, source, hasOwnProperty, type);
		});
	}
	//borrow from jQuery
	function type(object){
		return isUndefined(object)? 'undefined': object==null? 'null': class2type[_toString.call(object)] || 'object';
	}
	function isUndefined(object){
		return typeof object==='undefined';
	}
	function clone(object){
		return extend({}, object);
	}
	
	successive([iBen, Object],{
		extend: extend,
		type: type,
		successive: successive,
		clone: clone
	});
})();

//basic of iBen
iBen.extend(iBen, {
	Version: "1.1.0",
	Browser: (function(){
		var ua = navigator.userAgent;
		var isOpera = _toString.call(window.opera) == '[object Opera]';
		return {
		  IE:             !!window.attachEvent && !isOpera,
		  Opera:          isOpera,
		  WebKit:         ua.indexOf('AppleWebKit/') > -1,
		  Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
		  MobileSafari:   /Apple.*Mobile/.test(ua)
		}
	})(),
	cache: {
		Modules: {},
		Plugins: {},
		UI: {}
	},
	instanceOf: function(o, type) {
		return !!(o && o.hasOwnProperty && (o instanceof type));
	},
	/**
	 * iBen contains three parts:
	 * Modules for core part
	 * Plugins for plugins part
	 * UI for ui part
	 */
	Modules: {},
	Plugins: {},
	UI: {},
	add: function(){
		return iBen.extend(iBen.Modules, this._add.apply(this, _slice.call(arguments, 0).concat('Modules')));
	},
	plugin: function(){
		return iBen.extend(iBen.Plugins, this._add.apply(this, _slice.call(arguments, 0).concat('Plugins')));
		
	},
	ui: function(){
		return iBen.extend(iBen.UI, this._add.apply(this, _slice.call(arguments, 0).concat('UI')));
	},
	/**
	 * args: name of the module, part of the module, belong to which Module
	 */
	_add: function(modules){
		var name, init, args = arguments, len = args.length, last = args[len-1];
		if(len >= 3){
			name = args[0];
			modules = iBen.namespace([last, name].join("."));
			modules[name] = args[1];
		}
		iBen.each(modules, function(name, obj){
			init = obj.initialize;
			//refresh the cache
			iBen.cache[last][name] = null;
			if(!iBen.isUndefined(init)){
				if(iBen.isFunction(init)){
					return false;
				}else{
					//if obj has initialize, but it's not a function, save it as _initialize property.
					obj._initialize = obj.initialize;
				}
			}
			obj.initialize = function(ben){
				ben[name] = obj;
			};
		});
		return modules;
	},
	use: function(){
		var args = _slice.call(arguments, 0),
			last = args[args.length-1];
		args = iBen.inArray(["Modules","Plugins","UI"], last)>=0 ? args : args.concat('Modules');
		return iBen._use.apply(this, args);
	},
	_use: function(){
		var args = _slice.call(arguments, 0),
			last = args.pop(),
			part = iBen[last],
			callback = iBen.isFunction(args[args.length - 1]) ? args.pop() : null,
			modules = iBen.isArray(args[0]) ? args[0]: args,
			i, Ben = this;
		if(!iBen.instanceOf(Ben, iBen)){
			return new iBen(modules, callback, last);
		}
		if(iBen.config.cacheUse && iBen.instanceOf(iBen.cache[last][modules], iBen)){
			Ben = iBen.cache[last][modules];
		}else{
			if(!modules.length || modules[0]==="*"){
				modules = [];
				for(i in part){
					if(part.hasOwnProperty(i) && i!=='use')
						modules.push(i);
				}
			}
			iBen.cache[last][modules] = Ben;
			for(i=0, len=modules.length; i<len; i++){
				part[modules[i]].initialize(Ben);
			}
		}
		iBen.isFunction(callback)&&callback.apply(Ben, [Ben].concat(modules));
		return (len-1) ? Ben : Ben[modules[0]] || Ben;
	},
	//borrow from jQuery
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || iBen.type(obj)==='function';
		if(args){
			if(isObj){
				for(name in obj){
					if (callback.apply(obj[name], args) === false){
						break;
					}
				}
			}else{
				for(; i < length;){
					if (callback.apply(obj[i++], args) === false){
						break;
					}
				}
			}
		// A special, fast, case for the most common use of each
		}else{
			if(isObj){
				for(name in obj){
					if(callback.call(obj[name], name, obj[name]) === false){
						break;
					}
				}
			}else{
				for(; i < length;) {
					if(callback.call(obj[i], obj[i++], i) === false){
						break;
					}
				}
			}
		}
		return obj;
	},
	//borrow from jQuery
	inArray: function(array, elem){
		for (var i=0, len=array.length ; i < len; i++) {
			// Skip accessing in sparse arrays
			if ( i in array && array[ i ] === elem ) {
				return i;
			}
		}
		return -1;
	},
	emptyFunction: function emptyFunction(){}
});

(function(){
	function _extend(module){
		iBen.extend(iBen[module], {
			use: function(){
				return iBen._use.apply(this, _slice.call(arguments, 0).concat(module));
			}
		});
	}
	_extend("Modules");
	_extend("Plugins");
	_extend("UI");
})();

iBen.each(TYPES, function(item, idx){
	iBen["is"+item] = function(o){
		return iBen.type(o)===item.toLowerCase();
	};
});
iBen.isNumber = function(o){ return iBen.type(o)==='number'&&!isNaN(o)};

iBen.extend(Array, {
	isArray:  Array.isArray || iBen.isArray
});

//borrow from prototype
(function(){
	function _each(object, iterator){
		for (var key in object) {
		  var value = object[key], pair = [key, value];
		  pair.key = key;
		  pair.value = value;
		  iterator(pair);
		}
	}
	function pluck(object, property) {
		var results = [];
		_each(object, function(value) {
			results.push(value[property]);
		});
		return results;
	}
	function keys(object){
		return pluck(object, 'key');
	}
	function values(object){
		return pluck(object, 'value');
	}
	iBen.extend(iBen, {
		pluck: pluck,
		keys: keys,
		values: values
	});
	iBen.extend(Object, {
		keys: iBen.isFunction(Object.keys) ? Object.keys : keys,
		values: iBen.isFunction(Object.values) ? Object.values : values
	});
})();

var period = ".",
	//store of json module vars
	json = {},
	//RegExps for format json string
	reg_array=/^ *\[.*\] *$/,
	reg_empty_array=/^\[\s*]$/g,
	//multi-line text is supportive
	reg_object=/^ *{.*} *$/,
	reg_array_quot=/^.*?("|').*?$/,
	reg_function=/^ *function *\( *\)/;

iBen.extend(json, {
	error: function(str){
		if(iBen.config.throwFail){
			throw new SyntaxError('Badly formed JSON string: ' + str);
		}
	}
});
	
iBen.extend(iBen, {
	configure: function(config){
		iBen.extend(iBen.config, config, true);
		return iBen;
	},
	//borrow from YUI
	namespace: function() {
        var a = arguments, o = this, i = 0, j, d, arg, l;
        for (; i < a.length; i++) {
            arg = a[i];
            if (arg.indexOf(period)) {
                d = arg.split(period);
                for (j = (d[0] == _GLOBAL_NAME) ? 1 : 0, l = d.length; j < l; j++) {
                    o[d[j]] = o[d[j]] || {};
                    o = o[d[j]];
                }
            } else {
                o[arg] = o[arg] || {};
            }
        }
        return o;
    },
	log: function(){
		iBen.config.debug&&console&&_apply.call(console.log, console, arguments);
	},
	write: function(str){
		iBen.config.debug&&document.body.appendChild(document.createTextNode(str))&&document.body.appendChild(document.createElement('br'));
	},
	time: function(fn, name){
		name = name || "IBEN_TIMER_"+iBen.Version;
		if(!iBen.isObject(console) || !iBen.isFunction(console.time)){
			var t=new Date().getTime();
			fn();
			iBen.log([name, ":", new Date().getTime()-t, "ms"].join(""));
			return;
		}
		console.time(name);
		fn();
		console.timeEnd(name);
	}
});

//base modules
iBen.extend(iBen.prototype, {
	instanceOf: iBen.instanceOf,
	log: iBen.log,
	write: iBen.write,
	time: iBen.time
});

iBen.add({
	base: {
		inherit: function(subclass, superclass){
			function F(){}
			F.prototype = superclass.prototype;
			subclass.prototype = new F;
			subclass.prototype.constructor = subclass;
			subclass.superclass = superclass;
			return subclass;
		},
		object: function(o){
			function F(){}
			F.prototype = o;
			return new F;
		}
	},
	constant : (function(){
		var constants = {},
			ownProp = Object.prototype.hasOwnProperty,
			prefix = (Math.random()+"_").slice(2);
		return {
			isDefined: function(name){
				return ownProp.call(constants, prefix+name);
			},
			add: function(name, value){
				if(this.isDefined(name))
					return false;
				constants[prefix+name] = value;
				return this;
			},
			get: function(name){
				return constants[prefix+name] || null;
			}
		}
	})(),
	observer : (function(box){
		//keys for compatibility
		var Publisher={
			subscribe: function(fn, context, type){
				type = type || 'any';
				fn = iBen.isFunction(fn) ? fn: context[fn];
				if (iBen.isUndefined(this.subscribers[type]))
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
				type = iBen.isString(type)? type : 'any';
				args = _slice.call(arguments, 0);
				this.subscribers[type]&&iBen.each(this.subscribers[type], function(object){
					object[0].apply(object[1], args);
				});
			}
		};
		return function(o){
			o = o || {};
			iBen.extend(o, Publisher, true, 'function');
			o.subscribers={any : []};
			return o;
		};
	})(),
	json: (function(){
		var result, temp, convert, obj, last, raw,
			reg_strip_start=/^(?: *{ *)*/g,
			reg_key=/^ *("|')*(.*?)\1\s*:(?:.*)$/,
			reg_key_string=/^ *("|')*(.*?)\1\s*:/,
			reg_type=/^ *(?:"|')+\s*/,
			reg_value=/^ *("|')*\s*(.*?)\1\s*(?:(}){2,}|(?=}|,))(?=}|,)(?:.*)$/,
			reg_value_hash=/^ *("|')*(.*?)\1 *$/g,
			reg_strip_tail=/(^.*?,)|(}+$)/,
			reg_empty_object=/^{\s*(} *)+$/g,
			reg_strip_array=/^(?: *\[ *)*(.*?)(?: *\] *)+$/g,
			reg_hash=/(?:"|')*\S+(?:"|')*:(?:"|')*\S+(?:"|')*/g;
		function evalJson(str, result){
			raw = str;
			while(str.length&&!$S(str).blank()){
				//prevent endless loop
				if(last === str){
					json.error(raw);
					return raw;
				}
				last = str;
				str=str.replace(reg_strip_array, "$1");
				obj = reg_object.test(str)? {} : iBen.isArray(result) ? result.pop() : {};
				str=str.replace(reg_strip_start, "");
				var key = str.replace(reg_key, "$2"),
					value;
				str = str.replace(reg_key_string, "");
				convert = !reg_type.test(str);
				// empty {}, return obj
				if(reg_empty_object.test(str)){
					str = "";
					obj = {};
					obj[key] = {};
					return obj;
				//{.+}
				}else if(reg_object.test(str)){
					temp = $S(str).gsub(reg_array_quot, 0);
					str = str.slice(temp.cursor);
					value = temp.value;
				//[.*]
				}else if(/^ *\[/g.test(str)){
					convert = true;
					var cursor = $S(str).findArray()+1;
					value = str.slice(str.indexOf("["), cursor);
					str = str.slice(cursor);
				//regular formed
				}else if(reg_value.test(str)){
					value = str.replace(reg_value, '$2$3');
				//a:'b'
				}else if(reg_value_hash.test(str)){
					value = str.replace(reg_value_hash, '$2');
					str = "";
				//uncaught error
				}else{
					json.error(str);
				}
				if(convert&&reg_function.test(value)){
					str = str.slice($S(str).findObject());
				}
				str=str.replace(value, "").replace(/("|')\1/,"").replace(reg_strip_tail,"");
				if(convert){
					temp = value;
					value= iBen.util.convert(temp);
				}
				if(value===Constant.get("CONTINUE"))
					continue;
				if(iBen.isObject(value)){
					value = arguments.callee(temp, value);
				}else if(iBen.isArray(value)){
					value = $S(temp).eval();
				}
				value = iBen.isString(value) ? $S(value).recoverLine() : value;
				if(iBen.isArray(result)){
					obj[key] = value;
					result.push(obj);
				}else if(iBen.isObject(result)){
					result[key] = value;
				}
			}
			return result;
		}
		//reg_hash: a:'b'
		function validate(str){
			if(reg_hash.test(str) || reg_object.test(str)){
				return {};
			}
			json.error(str);
		}
		
		return {
			toJson: function(o){
				o = $S(o).coverLine();
				if(reg_array.test(o)){
					return $S(o).eval();
				}
				result = validate(o);
				return evalJson(o, result);
			},
			toString: function(o){
				return "not finished yet";
			}
		}
	})()
});
var Constant = iBen.use("constant");
Constant.add("CONTINUE", "__IBEN_CONTINUE_FLAG__")
	.add("RESULT_SUCCESS", "__IBEN_SUCCESS_FLAG__")
	.add("RESULT_FAIL", "__IBEN_FAIL_FLAG__")
	.add("JSON", "__IBEN_JSON_FLAG__")
	.add("ARRAY", "__IBEN_ARRAY_FLAG__")
	.add("IDENTITY", "__IBEN_IDENTITY_FLAG__");
	
var object_keys = ["toSource","valueOf"],
	proto_string = {"String" : ["quote","substring","toLowerCase","toUpperCase","charAt","charCodeAt","codePointAt","contains","indexOf","lastIndexOf","startsWith","endsWith","trim","trimLeft","trimRight","toLocaleLowerCase","toLocaleUpperCase","localeCompare","repeat","normalize","match","search","replace","split","substr","concat","slice","bold","italics","fixed","strike","small","big","blink","sup","sub","anchor","link","fontcolor","fontsize"].concat(object_keys)},
	proto_array = {"Array" : ["toLocaleString","join","reverse","sort","push","pop","shift","unshift","splice","concat","slice","lastIndexOf","indexOf","forEach","map","reduce","reduceRight","filter","some","every","find","findIndex","copyWithin","fill","entries","keys"]},
	proto_number = {"Number" : ["toLocaleString","toFixed","toExponential","toPrecision"].concat(object_keys)},
	proto_date = {"Date" : ["getTime","getTimezoneOffset","getYear","getFullYear","getUTCFullYear","getMonth","getUTCMonth","getDate","getUTCDate","getDay","getUTCDay","getHours","getUTCHours","getMinutes","getUTCMinutes","getSeconds","getUTCSeconds","getMilliseconds","getUTCMilliseconds","setTime","setYear","setFullYear","setUTCFullYear","setMonth","setUTCMonth","setDate","setUTCDate","setHours","setUTCHours","setMinutes","setUTCMinutes","setSeconds","setUTCSeconds","setMilliseconds","setUTCMilliseconds","toUTCString","toLocaleFormat","toLocaleString","toLocaleDateString","toLocaleTimeString","toDateString","toTimeString","toISOString","toJSON","toGMTString"].concat(object_keys)},
	extend_protos = [proto_string, proto_array, proto_number, proto_date];

iBen.each(EXTEND_TYPES, function(item, idx){
	win["$"+(item.substr(0,1))] = iBen[item] = function(o){
		if(!(this instanceof iBen[item])){
			return new iBen[item](o);
		}
		if(item === 'Array'){
			this._ = o || [];
		}else{
			this._ = iBen.isUndefined(o) ? new win[item]():new win[item](o);
		}
		return this;
	};
	//rewrite toString and add size, raw for raw object
	iBen.extend(iBen[item].prototype, {
		toString : function(){
			return win[item].prototype.toString.apply(this.raw(), arguments);
		},
		size: function(){
			return this.length || this.raw().length || 0;
		},
		raw: function(){
			return this._;
		}
	});
});

/**
 * inherit the prototype of native Object
 * It will convert to iBen[type] when the type that function returned equals the type that in the EXTEND_TYPES
 */
iBen.each(extend_protos, function(proto){
	iBen.each(proto, function(type, array){
		var TYPE = win[type],
			_prototype = TYPE.prototype,
			result;
		iBen.each(array, function(key){
			var CLASS = iBen[type],
				fn = _prototype[key];
			if(!iBen.isFunction(fn)) return;
			CLASS.prototype[key] = function(){
				result = fn.apply(this.raw(), arguments);
				return (iBen.type(result)===type.toLowerCase()) ? CLASS(result) : result;
			}
		});
	});
});


iBen.extend($S, {
	specialChar: {
		'\n': '_n_',
		'\r': '_r_'
	},
	reverseChar: {
		'_n_': '\n',
		'_r_': '\r'
	}
});

//iBen.String
iBen.extend($S.prototype, (function(){
	var brace = ['{', '}'],
		bracket = ['[', ']'];
	function find(cha, callback){
		var reg_char=new RegExp(cha, 'g'),
			count = 0,
			that = this;
		return String(this.replace(reg_char, function(a, b, s){
			return callback.call(that, a, b, ++count, s);
		}).raw());
	}
	//borrow from prototype
	function strip() {
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	function coverLine(){
		return this.find("(\r|\n)",function(a){
			return ["-@@", $S.specialChar[a], "@@-"].join("");
		});
	}
	function recoverLine(){
		return this.find(["-@@", "(_n_|_r_)", "@@-"].join(""),function(a, b){
			return $S.reverseChar[b];
		});
	}
	function empty() {
		return this._ == '';
	}
	function blank() {
		return /^\s*$/.test(this._);
	}
	function toArray(){
		return this._.split('');
	}
	function couple(marks, cha){
		return this.findChar(marks, function(count ,c, idx, s){
			return c===cha && s[idx-1]!='\\'&&++count;
		});
	}
	function findArray(){
		return this.findPair(bracket);
	}
	function findObject(){
		return this.findPair(brace);
	}
	function findPair(pair){
		var r1=0, r2=0;
		return this.findChar(pair, function(count, c, idx, s){
			if(c==='"' && s[idx-1]!='\\' && r2%2==0)
				r1++;
			else if(c==="'" && s[idx-1]!='\\' && r1%2==0)
				r2++;
			return (r1%2 == 0 && r2%2 == 0) ? 2 : 1;
		});
	}
	function findChar(marks, increase){
		var a=0, b=0, c=0, i=0, str=this.toArray(), flag=false, len=str.length;
		for(; i<len; i++){
			c = increase(c, str[i], i, str) || c;
			if(c%2 === 0){
				if(str[i]==marks[0]){
					a++;
				}else if(str[i]==marks[1]){
					b++;
				}
			}
			if(a>0&&a===b){
				flag = true;
				break;
			}
		}
		if(!flag){
			throw new Error(marks+" are not couple in "+this._+"!");
		}
		return i;
	}
	function peel(){
		return this.slice(1, -1);
	}
	function gsub(reg, idx){
		var args= _slice.call(arguments),
			reg = args.shift(),
			str = this.substring.apply(this, args).strip()._,
			count, start, end, temp;
		cha = reg.test(str) ? str.replace(reg,'$1') : "";
		if(/^{/.test(str)){
			temp = this.substr(idx, this.substr(idx).couple(brace, cha)+1)._;
			return {
				result: Constant.get("JSON"),
				value: temp,
				cursor: idx+temp.length
			}
		}else if(/^\[/.test(str)){
			temp = this.substr(idx, this.substr(idx).findArray(bracket, cha)+1)._;
			return {
				result: Constant.get("ARRAY"),
				value: temp,
				cursor: idx+temp.length
			}
		}
		start = str.indexOf(cha);
		$S(str).find(cha, function(a, b, c, s){
			count=c;
			if(c>=2){
				end = b;
				$S(s).find("\\\\"+cha, function(){
					count--;
				});
			}
		});
		if(count<2)
			return {
				result: Constant.get("RESULT_FAIL"),
				value: false
			};
		temp = start || cha ? str.substring(start+1, end) : iBen.util.convert($S(str).strip()._);
		return {
			result: Constant.get("RESULT_SUCCESS"),
			value : temp
		};
	}
	
	function eval(){
		this._ = this.strip().coverLine();
		if(reg_empty_array.test(this._)){
			return [];
		}else if(reg_array.test(this._)){
			var idx=-1, results=[], result,
				array_start = this.findArray(),
				cursor = -1, str;
			//// !== for multipart arrays
			if(array_start !== this.size()-1){
				var left = this.slice(array_start+1),
					str = this.slice(0,array_start+1),
					left = $S(left.slice(left.indexOf(bracket[0]))).eval();
					results.push($S(str).eval());
					results.push(left);
					return results;
			}else{
				str = this.peel();
			}
			str.find(',', function(a, b, c, s){
				if(b <= cursor){ idx = b; return;}
				result = $S(s).gsub(reg_array_quot, idx+1, b);
				result = _push_result(result, results);
				if(result === false)return false;
				cursor = result || cursor;
				idx=b;
			});
			if(cursor >= str.size())return results;
			result=str.gsub(reg_array_quot, idx>=0 ? idx+1 : 0);
			_push_result(result, results, function(){
				json.error(str);
			});
			return results;
		}else if(reg_object.test(this._)){
			return iBen.use('json').toJson(this._);
		}
		json.error(this);
	}
	
	function _push_result(result, results, fn){
		switch(result.result){
			case Constant.get('RESULT_SUCCESS'):
				//skip functions
				if(result.value === Constant.get("CONTINUE"))
					break;
				results.push(iBen.isString(result.value) ? $S(result.value).recoverLine() : result.value);
				return true;;
			case Constant.get("RESULT_FAIL"):
				iBen.isFunction(fn)&&fn();
				return false;
			case Constant.get('JSON'):
			case Constant.get('ARRAY'):
				results.push($S(result.value).eval());
				return result.cursor;
		}
		return false;
	}
	
	function sub(count, replacement, force){
		var t = this.substr(0, count)._;
		if(force)
			return t+replacement;
		else if(this._.length>count)
			return t+replacement;
		else
			return t;
	}
	function br(){
		return /[\r\n]$/.test(this._)?this._:this._+"\r\n";
	}
	return {
		find: find,
		strip: strip,
		coverLine: coverLine,
		recoverLine: recoverLine,
		empty: empty,
		blank: blank,
		peel: peel,
		sub: sub,
		gsub: gsub,
		br: br,
		toArray: toArray,
		findChar: findChar,
		findPair: findPair,
		findArray : findArray,
		findObject: findObject,
		eval: eval,
		couple: couple
	}
})());

//iBen.Array
iBen.extend($A.prototype, (function(){
	function _slice(str){
		if(reg_array.test(str)){
			this.inside().push([]);
		}else{
			return this._;
		}
		return this._slice(str.slice(1, -1));
	}
	function inside(i){
		i = i || this._;
		var shift = i[0];
		if(iBen.isArray(shift)){
			return this.inside(shift);
		}
		return i;
	}
	function each(iterator, stopOnFalse){
		for(var i=0, length = this._.length; i < length;) {
			if(iterator(this._[i], i++) === false && stopOnFalse){
				break;
			}
		}
		return this;
	}
	//borrow from prototype
	function findAll(iterator, context) {
		var results = [];
		this.each(function(value, index) {
		  if (iterator.call(context, value, index))
			results.push(value);
		});
		return results;
	}
	
	return {
		_slice: _slice,
		inside: inside,
		each: each,
		findAll: findAll,
		filter: findAll,
		inArray: iBen.inArray,
		indexOf: iBen.inArray
	}
})());

//iBen.Number
iBen.successive([$N, $N.prototype], (function(){
	function random(){
		return (Math.random()+"").slice(2);
	}
	
	return {
		random: random
	}
})());

//iBen.Date
iBen.successive([$D, $D.prototype], {
	now: function(){
		return $D().getTime();
	}
});
iBen.extend($D.prototype, (function(){
	//add functions here
	
	return {
		
	}
})());

(function(){
	function stringify(){
		
	}
	iBen.extend(iBen, {
		
		JSON: {
			parse: function(arg){
				return $S(arg).eval();
			},
			stringify: stringify,
			toString: stringify
		}
	});
})();

iBen.extend(iBen.namespace('util'), (function(){
	function convert(o){
		if($S(o).blank())return o;
		var convert_value = Number(o);
		if(iBen.isNumber(convert_value)){
			return convert_value;
		}else if(reg_function.test(o)){
			return Constant.get("CONTINUE");
		}else if(reg_object.test(o)){
			return {};
		}else if(reg_array.test(o)){
			return [];
		}
		switch(o){
			case "null":
				return null;
			case "undefined":
				return undefined;
			case "true":
				return true;
			case "false":
				return false;
			default:
				return o;
		}
	}
	
	function identity(o, value){
		var id = Constant.get("IDENTITY"), obj;
		//for array or object
		if(typeof o!== 'object'){
			return iBen.cache[o];
		}else{
			obj = {},
			obj[id] = iBen.isUndefined(value) ? [_GLOBAL_NAME, "_", $N().random()].join("") : value;
			iBen.extend(o, obj);
			iBen.cache[obj[id]] = o;
			return o[id];
		}
	}
	return {
		convert: convert,
		identity: identity
	}
})());

iBen.extend(iBen, (function(){
	//not finished the function yet
	function stringify(){
		return "";
	}
	return {
		JSON: {
			parse: function(arg){
				return $S(arg).eval();
			},
			stringify: stringify,
			toString: stringify
		}
	}
})());

win.JSON = win.JSON || iBen.JSON;

//for CommonJS. not exactly did it, just save as an API here.
if (typeof exports==='object') {
	exports.iBen = iBen;
}

win.iBen = win.$$ = win.iben = win.$B = iBen;
})(typeof window!== 'undefined' ? window : this);
