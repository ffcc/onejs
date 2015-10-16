/** 
 * ONE Javascript Library v1.0.0
 * Created by Fernando Caballero
 */
(function() {
	var global = this,
	objProt = Object.prototype,
	toString = objProt.toString;
	
	if (!global.ONE) {
		global.ONE = {};
	}
	
	ONE.apply = function(obj, configs, withException) {
		if(obj && configs && toString.call(configs) === '[object Object]') {
			for(var c in configs) {
				if(configs.hasOwnProperty(c)) {
					if(!withException) { // Overrides the property without exception
						obj[c] = configs[c];
					} else if(!obj[c]) { // Copy the property if the object has not yet
						obj[c] = configs[c];
					}
				}
			}
		}
		return obj;
	}
	
	ONE.apply(ONE, {
		global: global,
		
		docHead: document.head || document.getElementsByTagName('head')[0],
		
		docBody: document.body,
		
		emptyFn: function() {},
		
		log: function(msg) {
			if(ONE.isEmpty(this.log.n)) {
				this.log.n = 0;
			}
			this.log.n++;
			console.log("[" + this.log.n + "] " + msg);
		},
		
		ownProperties: function(obj) {
			var objProperties = ONE.isObject(obj)? {} : [];
			
			for(var p in obj) {
				if(obj.hasOwnProperty(p)) {
					objProperties[p] = obj[p];
				}
			}
			
			return objProperties;
		},
		
		typeOf: function(valor) {
			if(valor === null) {
				return 'null';
			}
			var tipo = typeof valor,
			tiposBasico = {
				'undefined': 1,
				'string': 1,
				'number': 1,
				'boolean': 1,
				'function': 1
			};
			if(tipo in tiposBasico) {
				return tipo;
			}
			
			var toStringValor = toString.call(valor);
			switch(toStringValor) {
				case '[object Array]':
					return 'array';
				case '[object Date]':
					return 'date';
				case '[object Boolean]':
					return 'boolean';
				case '[object Number]':
					return 'number';
				case '[object RegExp]':
					return 'regexp';
				case '[object String]':
					return 'string';
				case '[object Function]':
					return 'function';
				case '[object Object]':
					return 'object';
			}
			
			return 'unknown';
		},
		
		isEmpty: function(valor, valoresNulos) {
			/* Si valor es nulo se retorna true */
			if(valor === null) {
				return true;
			}
			var tipo = ONE.typeOf(valor);
			/* Si valor no esta definido o es desconocido se retorna true */
			if(tipo === 'undefined' || tipo === 'unknown') {
				return true;
			}
			var tipoVN = ONE.typeOf(valoresNulos),
			tiposNoPermitidos = {
				'null': 1,
				'undefined': 1,
				'unknown': 1,
				'function': 1,
				'regexp': 1
			};
			/* Restricciones personalizadas */
			if(!(tipoVN in tiposNoPermitidos)) {
				if(tipo === 'number' || tipo === 'string') {
					if(tipoVN === 'array' || tipoVN === 'object') {
						for(var v in ONE.ownProperties(valoresNulos)) {
							if(tipoVN === 'array' && valor == valoresNulos[v]) {
								return true;
							} else if(tipoVN === 'object' && valor == v) {
								return true;
							}
						}
					}
					if(tipo === tipoVN && valor == valoresNulos) {
						return true;
					}
				} else if(tipo === 'array' && valor.length == valoresNulos) {
					return true;
				}
			}
			/* Restricciones por defecto */
			if(tipo === 'array' && valor.length === 0) {
				return true;
			} else if(tipo === 'function' && valor === ONE.emptyFn) {
				return true;
			}
			
			return false;
		},
		
		isFn: function(obj) {
			return ONE.typeOf(obj) === 'function';
		},
		
		isString: function(obj) {
			return ONE.typeOf(obj) === 'string';
		},

		isBoolean: function(obj) {
			return ONE.typeOf(obj) === 'boolean';
		},
		
		isArray: function(obj) {
			return ONE.typeOf(obj) === 'array';
		},
		
		isObject: function(obj) {
			return ONE.typeOf(obj) === 'object';
		},

		notEmptyProperties: function(obj, strict) {
			if (!ONE.isObject(obj) && !ONE.isArray(obj)) {
				return undefined;
			}
			var isObject = ONE.isObject(obj),
			notEmptyProperties = isObject? {} : [],
			ownProperties = ONE.ownProperties(obj),
			strict = ONE.isBoolean(strict)? strict : false,
			nullValues = strict? ['', {}] : undefined,
			index = 0;
			for (var prop in ownProperties) {
				if (!ONE.isEmpty(ownProperties[prop], nullValues)) {
					var key = isObject? prop : index++;
					notEmptyProperties[key] = ownProperties[prop];
				}
			}
			return notEmptyProperties;
		},
		
		beget: function (o, overrides) {
			if(ONE.isEmpty(o)) {
				return o;
			}
			var F = function () {};
			F.prototype = o.prototype;
			var clase = new F();
			ONE.apply(clase, overrides);
			return clase;
		}
	});
})();

/**
 * AbstractClass
 */
(function() {
	ONE.AbstractClass = function() {};
	ONE.AbstractClass.prototype = {
		_classname: 'ONE.AbstractClass',
		
		_superclass: Object.prototype,
		
		self: ONE.AbstractClass,
		
		main: function(config) {
			ONE.apply(this, config);
			return this;
		},
		
		super: function() {
			var metodo = this.super.caller,
			padre,
			nombreMetodo;
			
			if(ONE.isEmpty(metodo) || !metodo._owner) {
				return;
			}
			
			padre = metodo._owner._superclass;
			nombreMetodo = metodo._name;
			
			if(!(nombreMetodo in padre)) {
				return clasePadre;
			}
			
			return padre[nombreMetodo].apply(this, arguments || []);
		}
	};
	
	ONE.apply(ONE.AbstractClass, {
		addPropertie: function(propiedad, valor) {
			if(ONE.isEmpty(propiedad, '') || !ONE.isString(propiedad)) {
				return;
			}
			if(ONE.isFn(valor)) {
				this.addMethod(propiedad, valor);
			} else {
				this.prototype[propiedad] = valor;
			}
		},
		
		addMethod: function(nombre, cuerpo) {
			cuerpo._owner = this;
			cuerpo._name = nombre;
			
			this.prototype[nombre] = cuerpo;
		},
		
		implement: function(datos) {
			var clase = this,
			clasePrototype = clase.prototype;
			
			for(dato in ONE.ownProperties(datos)) {
				clase.addPropertie(dato, datos[dato]);
			}
		}
	});
})();

/**
 * Class
 */
(function() {
	ONE.Class = function(datos) {
		var clase = function() {
			if(ONE.isFn(this.main)) {
				this.main.apply(this, arguments);
			}
		}
		
		/* Propiedades propios de clase */
		for(var attr in ONE.ownProperties(ONE.AbstractClass)) {
			clase[attr] = ONE.AbstractClass[attr];
		}
		
		/* Extension */
		ONE.Class.extends(clase, datos);
		
		/* Implementacion de las propiedades en clase */
		clase.implement(datos);
		
		/* Se registra la clase */
		ONE.ClassManager.setClass(datos._classname, clase);
		
		return clase;
	}
	
	ONE.apply(ONE.Class, {
		extends: function(clase, datos) {
			var extend = datos.extends,
			abstractClass = ONE.AbstractClass,
			abstractClassProperty = ONE.AbstractClass.prototype,
			padre = (extend && extend !== Object)? extend : abstractClass;
			
			if(ONE.isString(padre)) {
				padre = ONE.ClassManager.getClass(padre);
			}
			if(!ONE.isFn(padre)) {
				return;
			}
			var padrePrototype = padre.prototype,
			clasePrototype = clase.prototype = ONE.beget(padre);
			
			if(padre !== ONE.AbstractClass) {
				for(p in abstractClassProperty) {
					if(!padrePrototype.hasOwnProperty(p)) {
						padrePrototype[p] = abstractClassProperty[p];
					}
				}
			}
			
			clasePrototype.self = clase;
			clase._superclass = clasePrototype._superclass = padrePrototype;
			
			delete datos.extends;
		}
	});
})();

/**
 * ClassManager
 */
(function() {
	ONE.ClassManager = {
		clases: {},
		nsCache: {},
		fnCache: {},
		
		setClass: function(nombre, clase) {
			this.clases[nombre] = this.setNamespace(nombre, clase);
		},
		
		setNamespace: function(nombre, clase) {
			var nombres = this.parsear(nombre),
			nodo = nombres[0],
			l = nombres.length-1,
			hoja = nombres[l],
			n;
			for(var i = 1; i < l; i++) {
				n = nombres[i];
				if(!nodo.hasOwnProperty(n)) {
					nodo[n] = {};
				}
				nodo = nodo[n];
			}
			nodo[hoja] = clase;
			return clase;
		},
		
		parsear: function(ns) {
			if(ONE.typeOf(ns) !== 'string' || ns.length === 0){
				return null;
			}
			if(this.nsCache.hasOwnProperty(ns)) {
				return this.nsCache[ns];
			}
			
			var namespace = ns.split('.'),
			nombres = [];
			
			nombres[0] = ONE.global;
			if(namespace[0] === 'ONE') {
				nombres[0] = ONE;
				namespace = ns.substring(4).split('.');
			}
			
			for(var i = 0; i < namespace.length; i++) {
				nombres[i+1] = namespace[i];
			}
			
			this.nsCache[ns] = nombres;
			return nombres;
		},
		
		getClass: function(nombre) {
			return this.clases[nombre];
		},
		
		define: function(classname, datos) {
			datos = datos || {};
			if(!ONE.isString(classname) || !ONE.isObject(datos)) {
				return;
			}
			
			datos._classname = classname;
			
			return new ONE.Class(datos);
		},
		
		new: function(classname) {
			if (ONE.isEmpty(classname)) {
				return null;
			}
			if (!ONE.isString(classname) && ONE.isEmpty(classname.prototype._classname)) {
				return null;
			}
			var clase = ONE.isString(classname)? this.getClass(classname) : classname,
			args;
			if (ONE.isEmpty(clase)) {
				return null;
			}
			args = Array.prototype.slice.call(arguments, 1);
			return this.getInstance(clase, args);
		},
		
		getInstance: function(clase, args) {
			if(!this.fnCache.hasOwnProperty(args.length)) {
				var argsJoin = '';
				for(var i = 0; i < args.length; i++) {
					argsJoin += 'args[' + i + ']' + ((i+1) !== args.length? ',' : '');
				}
				this.fnCache[args.length] = new Function('clase', 'args', 'return new clase(' + argsJoin + ');');
			}
			return this.fnCache[args.length](clase, args);
		}
	};
})();

/**
 * Atajos
 */
(function() {
	ONE.define = function() {
		return ONE.ClassManager.define.apply(ONE.ClassManager, arguments || []);
	};
	ONE.new = function() {
		return ONE.ClassManager.new.apply(ONE.ClassManager, arguments || []);
	};
})();