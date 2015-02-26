/*!
 * iBen JavaScript Library v1.1.0
 * Copyright 2012 zangzhan
 * Date: 2015-2-22 12:18:16
 * license: zangzhan/license
 * contact: 905951024@qq.com
 */
var _arraryProto = Array.prototype,
	_slice = _arraryProto.slice,
	
	iBen = function(){
		return iBen.use.apply(this, ['*'].concat(_slice.call(arguments)));
	};

//turn it off when you publish your project. it's false in the version of the min-iBen
iBen.config = {
	debug: true
};


var _fnProto = Function.prototype,
	_apply = _fnProto.apply,
	_call  = _fnProto.call,
	_objectProto = Object.prototype,
	EXTEND_TYPES = ["String","Number","Array","Date"],
	CLASS_TYPE = ["Boolean","Function","RegExp","Object","Error"].concat(EXTEND_TYPES),
	TYPES = CLASS_TYPE.concat(["Undefined","Null"]);

//Object moudle
(function(){
	var _toString = Object.prototype.toString,
		class2type = [];
	function each(array, fn){
		for(var i=0, len=array.length; i<len; i++)
			fn(i, array[i]);
	}
	//borrow from jQuery
	each(CLASS_TYPE,function(i, item){
		class2type["[object "+item+"]"] = item.toLowerCase();
	});
	function extend(destination, source, hasOwnProperty, type){
		if(hasOwnProperty&&type){
			for(var key in source)
				if(source.hasOwnProperty(key)&&Object.type(source[key])===type)
					destination[key] = source[key];
			return destination;
		}
		if(hasOwnProperty){
			for(var key in source)
				if(source.hasOwnProperty(key))
					destination[key] = source[key];
			return destination;
		}
		for(var key in source)
			destination[key] = source[key];
		return destination;
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
	function keys(object){
		var results=[];
		for(var key in object)
			results.push(key);
		return results;
	}
	
	extend(Object,{
		extend: extend,
		type: type,
		isUndefined: isUndefined,
		clone: clone
	});
})();

//basic of iBen
Object.extend(iBen, {
	Version: "1.1.0",
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
	})(),
	use: function(){
		var args = _slice.call(arguments, 0),
			callback = iBen.isFunction(args[args.length - 1]) ? args.pop() : null,
			modules = (args[0] && iBen.isString(args[0]))? args: args[0],
			i;
		if(!(this instanceof iBen.use)){
			return new iBen.use(modules, callback);
		}
		if(!modules || modules[0]==="*"){
			modules = [];
			for(i in iBen.modules){
				if(iBen.modules.hasOwnProperty(i)&&iBen.isFunction(iBen.modules[i]))
					modules.push(i);
			}
		}
		for(i=0, len=modules.length; i<len; i++){
			iBen.modules[modules[i]](this);
		}
		iBen.isFunction(callback)&&callback.apply(this, [this].concat(modules));
		return (len-1) ? this : this[modules[0]] || this;
	},
	//borrow from jQuery
	each: function( obj, callback, args ) {
		var name,
			i = 0,
			length = obj.length,
			isObj = length === undefined || Object.type(obj)==='function';
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
	emptyFunction: function emptyFunction(){}
});

iBen.each(TYPES, function(item, idx){
	iBen["is"+item] = function(o){
		return Object.type(o)===item.toLowerCase();
	};
});
iBen.isNumber = function(o){ return Object.type(o)==='number'&&!isNaN(o)};

Object.extend(Array, {
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
	Object.extend(iBen, {
		pluck: pluck,
		keys: keys,
		values: values
	});
	Object.extend(Object, {
		keys: iBen.isFunction(Object.keys) ? Object.keys : keys,
		values: iBen.isFunction(Object.values) ? Object.values : values,
	});
})();

(function(){
var PERIOD = ".",
	reg_sChar = /\s*/g,
	reg_sValidate=/^(?:{|\[).*(?:\]|})$/g,
	win = window,
	$break = {},
	mColon = ":",
	mComma = ",",
	mQuot = "\"",
	//RegExps for format json string
	reg_hash=/(?:"|')*\S+(?:"|')*:(?:"|')*\S+(?:"|')*/g,
	reg_array=/^ *\[.*\] *$/,
	reg_empty_array=/^\[\s*]$/g,
	reg_multipart_array=/^ *\[.*\],(\[.*\],)*\[.*\] *$/,
	//multi-line text is not supported
	reg_object=/^ *{.*} *$/,
	reg_empty_object=/^{\s*(} *)+$/g,
	reg_strip_array=/^(?: *\[ *)*(.*?)(?: *\] *)+$/g,
	//RE eval string
	reg_array_quot=/^.*?("|').*?$/,
	reg_strip_start=/^(?: *{ *)*/g,
	reg_key=/^("|')*(.*?)\1\s*:(?:.*)$/,
	reg_key_string=/^("|')*(.*?)\1\s*:/,
	reg_type=/^ *(?:"|')+\s*/,
	reg_value=/^ *("|')*\s*(.*?)\1\s*(?:(}){2,}|(?=}|,))(?=}|,)(?:.*)$/,
	reg_value_hash=/^ *("|')*(.*?)\1 *$/g,
	reg_value_string=/^("|')*\s*(.*?)\1\s*(?=}|,)/,
	reg_strip_tail=/(^.*?,)|(}+$)/,
	reg_function=/^ *function *\( *\)/;
Object.extend(iBen, {
	configure: function(config){
		Object.extend(iBen.config, config, true);
		return iBen;
	},
	//borrow from YUI
	namespace: function() {
        var a = arguments, o = this, i = 0, j, d, arg, l;
        for (; i < a.length; i++) {
            arg = a[i];
            if (arg.indexOf(PERIOD)) {
                d = arg.split(PERIOD);
                for (j = (d[0] == 'iBen') ? 1 : 0, l = d.length; j < l; j++) {
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

iBen.modules = {
	base : function(box){
		Object.extend(box, {
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
			},
			log: iBen.log,
			write: iBen.write,
			time: iBen.time
		});
	},
	constant : function(box){
		box.constant = (function(){
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
		})();
	},
	observer : function(box){
		box.observer=function(o){
			return makePublisher(o || {});
		};
		//keys for compatibility
		var Publisher={
			subscribe: function(fn, context, type){
				type = type || 'any';
				fn = iBen.isFunction(fn) ? fn: context[fn];
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
				type = iBen.isString(type)? type : 'any';
				args = _arraryProto.slice.call(arguments, 0);
				this.subscribers[type]&&iBen.each(this.subscribers[type], function(object){
					object[0].apply(object[1], args);
				});
			}
		};
		
		function makePublisher(o){
			for(var key in Publisher){
				if(Publisher.hasOwnProperty(key)&&iBen.isFunction(Publisher[key]))
					o[key]=Publisher[key];
			}
			o.subscribers={any:[]};
			return o;
		}
	},
	json: function(box){
		box.json = (function(){
			var result, temp, convert, obj;
			function evalJson(str, result){
				while(str.length){
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
						var cursor = $S(str).findArray();
						value = str.slice(str.indexOf("["), cursor+1);
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
						throw new SyntaxError('Badly formed JSON string: ' + str);
					}
					str=str.replace(reg_value_string,"").replace(reg_strip_tail,"");
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
				throw new SyntaxError('Badly formed JSON string: ' + str);
			}
			
			return {
				toJson: function(o){
					if(reg_array.test(o)){
						return $S(o).eval();
					}
					result = validate(o);
					return evalJson(o, result);
				},
				toString: function(o){
					
				}
			}
		})();
		
	}
};

var Constant = iBen.use("constant");
Constant.add("CONTINUE", "__IBEN_CONTINUE_FLAG__")
	.add("RESULT_SUCCESS", "__IBEN_SUCCESS_FLAG__")
	.add("RESULT_FAIL", "__IBEN_FAIL_FLAG__")
	.add("JSON", "__IBEN_JSON_FLAG__")
	.add("ARRAY", "__IBEN_ARRAY_FLAG__");
	
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
			this._ = o?new win[item](o):new win[item];
		}
		return this;
	};
	//rewrite toString and add size, raw for raw object
	Object.extend(iBen[item].prototype, {
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

iBen.each(extend_protos, function(proto){
	iBen.each(proto, function(type, array){
		var _prototype = win[type].prototype;
		iBen.each(array, function(key){
			var CLASS = iBen[type],
				fn = _prototype[key];
			if(!iBen.isFunction(fn)) return;
			CLASS.prototype[key] = function(){
				return CLASS(fn.apply(this.raw(), arguments));
			}
		});
	});
});
var brace = ['{', '}'],
	bracket = ['[', ']'];
Object.extend($S.prototype, (function(){
	function find(cha, callback){
		var reg_char=new RegExp(cha, 'g'),
			count = 0,
			that = this;
		this._.replace(reg_char, function(a, b, s){
			callback.call(that, a, b, ++count, s);
		});
		return this;
	}
	//borrow from prototype
	function strip() {
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	}
	function empty() {
		return this._ == '';
	}
	function blank() {
		return /^\s*$/.test(this._);
	}
	function toArray(){
		return this.split('');
	}
	function couple(marks, cha){
		return this.findChar(marks, function(count ,c, idx, s){
			return c===cha && s[idx-1]!='\\'&&++count;
		});
	}
	function findArray(){
		var r1=0, r2=0;
		return this.findChar(bracket, function(count, c, idx, s){
			if(c==='"' && s[idx-1]!='\\' && r2%2==0)
				r1++;
			else if(c==="'" && s[idx-1]!='\\' && r1%2==0)
				r2++;
			return (r1%2 == 0 && r2%2 == 0) ? 2 : 1;
		});
	}
	function findChar(marks, increase){
		var a=0, b=0, c=0, i=0, str=this._, flag=false, len=str.length;
		for(; i<len; i++){
			c = increase(c, str[i], i, str) || c;
			if(c%2 === 0){
				if(str[i]===marks[0]){
					a++;
				}else if(str[i]===marks[1]){
					b++;
				}
			}
			if(a>0&&a===b){
				flag = true;
				break;
			}
		}
		if(!flag){
			throw new Error(marks+" are not couple in "+str+"!");
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
		if(str[0] === brace[0]){
			temp = this.substr(idx, this.substr(idx).couple(brace, cha)+1)._;
			return {
				result: Constant.get("JSON"),
				value: temp,
				cursor: idx+temp.length
			}
		}else if(str[0] === bracket[0]){
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
		this._ = this.strip()._;
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
				cursor = _push_result(result, results) || cursor;
				idx=b;
			});
			if(cursor >= str.size())return results;
			result=str.gsub(reg_array_quot, idx>=0 ? idx+1 : 0);
			_push_result(result, results, function(){
				throw new SyntaxError('Badly formed String: ' + str);
			});
			return results;
		}else if(reg_object.test(this._)){
			return iBen.use('json').toJson(this._);
		}
		throw new SyntaxError('Badly formed String: ' + this._);
	}
	
	function _push_result(result, results, fn){
		switch(result.result){
			case Constant.get('RESULT_SUCCESS'):
				//skip functions
				if(result.value === Constant.get("CONTINUE"))
					break;
				results.push(result.value);
				break;
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
		empty: empty,
		blank: blank,
		peel: peel,
		sub: sub,
		gsub: gsub,
		br: br,
		toArray: toArray,
		findChar: findChar,
		findArray: findArray,
		eval: eval,
		couple: couple
	}
})());

Object.extend($A.prototype, (function(){
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
			if(iterator(this._[i++], i) === false && stopOnFalse){
				break;
			}
		}
		return this;
	}
	return {
		_slice: _slice,
		inside: inside,
		each: each
	}
})());

(function(){
	function stringify(){
		
	}
	Object.extend(iBen, {
		
		JSON: {
			parse: function(arg){
				return $S(arg).eval();
			},
			stringify: stringify,
			toString: stringify
		}
	});
})();
Object.extend(iBen.namespace('util'), (function(){
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
	return {
		convert: convert
	}
})());

Object.extend(iBen, (function(){
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

win.iBen = win._iBen = win.iben = win.$B = iBen;
})();
