/** 
 * ONE Javascript Library v0.0.1
 * Created by Fernando Caballero
 */
(function () {
	var global = this,
	objProt = Object.prototype,
	toString = objProt.toString;
	
	if (!global.ONE) {
		global.ONE = {};
	}
	
	ONE.apply = function (obj, configs, withException) {
		if (obj && configs && toString.call(configs) === '[object Object]') {
			for (var c in configs) {
				if (configs.hasOwnProperty(c)) {
					if (!withException) { // Overrides the property without exception
						obj[c] = configs[c];
					} else if (!obj[c]) { // Copy the property if the object has not yet
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
		
		emptyFn: function () {},
		
		log: function (msg) {
			if(ONE.isEmpty(ONE.log.n)) {
				ONE.log.n = 0;
			}
			ONE.log.n++;
			console.log("[" + ONE.log.n + "] " + msg);
		},
		
		ownProperties: function (obj) {
			var objProperties = ONE.isObject(obj)? {} : [];
			
			for (var p in obj) {
				if (obj.hasOwnProperty(p)) {
					objProperties[p] = obj[p];
				}
			}
			
			return objProperties;
		},
		
		typeOf: function (valor) {
			if (valor === null) {
				return 'null';
			}
			var tipo = typeof valor,
			tiposPrimitivos = {
				'undefined': 1,
				'string': 1,
				'number': 1,
				'boolean': 1,
				'function': 1
			};
			if (tipo in tiposPrimitivos) {
				return tipo;
			}
			
			var toStringValor = toString.call(valor);
			switch (toStringValor) {
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
		
		isEmpty: function (valor, valoresNulos) {
			/* Si valor es nulo se retorna true */
			if (valor === null) {
				return true;
			}
			var tipo = ONE.typeOf(valor);
			/* Si valor no esta definido o es desconocido se retorna true */
			if (tipo === 'undefined' || tipo === 'unknown') {
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
			if (!(tipoVN in tiposNoPermitidos)) {
				if (tipo === 'number' || tipo === 'string') {
					if (tipoVN === 'array' || tipoVN === 'object') {
						for (var v in ONE.ownProperties(valoresNulos)) {
							if (tipoVN === 'array' && valor == valoresNulos[v]) {
								return true;
							} else if (valor == v) {
								return true;
							}
						}
					}
					if (tipo === tipoVN && valor == valoresNulos) {
						return true;
					}
				} else if (tipo === 'array' && valor.length == valoresNulos) {
					return true;
				}
			}
			/* Restricciones por defecto */
			if (tipo === 'array' && valor.length === 0) {
				return true;
			} else if (tipo === 'function' && valor === ONE.emptyFn) {
				return true;
			}
			
			return false;
		},
		
		isFn: function (obj) {
			return ONE.typeOf(obj) === 'function';
		},
		
		isString: function (obj) {
			return ONE.typeOf(obj) === 'string';
		},

		isBoolean: function (obj) {
			return ONE.typeOf(obj) === 'boolean';
		},
		
		isArray: function (obj) {
			return ONE.typeOf(obj) === 'array';
		},
		
		isObject: function (obj) {
			return ONE.typeOf(obj) === 'object';
		},

		notEmptyProperties: function (obj, strict) {
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
			if (ONE.isEmpty(o)) {
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
(function () {
	ONE.AbstractClass = function () {};
	ONE.AbstractClass.prototype = {
		main: ONE.emptyFn,
		
		getClass: function () {
			return ONE.AbstractClass;
		},
		
		super: function () {
			var metodo = this.super.caller,
			padre,
			nombreMetodo;
			
			if (ONE.isEmpty(metodo) || !metodo._owner) {
				return;
			}
			
			padrePrototype = metodo._owner._superclass.prototype;
			nombreMetodo = metodo._name;
			
			if (!(nombreMetodo in padrePrototype)) {
				return padre;
			}
			
			return padrePrototype[nombreMetodo].apply(this, arguments || []);
		}
	};
	
	ONE.apply(ONE.AbstractClass, {
		_class: ONE.AbstractClass,
		_classname: 'ONE.AbstractClass',
		_superclass: Object.prototype,

		addPropertie: function (propiedad, valor) {
			if (ONE.isEmpty(propiedad, '') || !ONE.isString(propiedad)) {
				return;
			}
			if (ONE.isFn(valor)) {
				this.addMethod(propiedad, valor);
			} else {
				this.prototype[propiedad] = valor;
			}
		},
		
		addMethod: function (nombre, cuerpo) {
			cuerpo._owner = this;
			cuerpo._name = nombre;
			this.prototype[nombre] = cuerpo;
		},
		
		implement: function (datos) {
			var clase = this;
			for (dato in ONE.ownProperties(datos)) {
				clase.addPropertie(dato, datos[dato]);
			}
		}
	});
})();

/**
 * Class
 */
(function () {
	ONE.Class = function (config) {
		var clase = function (config) {
			ONE.apply(this, config);
			if (ONE.isFn(this.main)) {
				this.main.apply(this, arguments || []);
			}
		}
		
		/* Propiedades propios de clase */
		for (var attr in ONE.ownProperties(ONE.AbstractClass)) {
			clase[attr] = ONE.AbstractClass[attr];
		}
		
		/* Se agrega el nombre de la clase */
		clase._classname = config._classname;
		clase._class = clase;
		delete config._classname;
		
		/* Extension */
		ONE.Class.extends(clase, config);

		/* Se agrega el metodo main al config */
		if (!ONE.isFn(config.main)) {
			config.main = new Function('this.super.apply(this, arguments || [])');
		}

		/* Implementacion de los miembros de la clase */
		clase.implement(config);
		
		/* Se agrega el metodo getClass al prototype de la clase */
		clase.prototype.getClass = function () {return clase;};

		/* Se registra la clase */
		ONE.ClassManager.setClass(clase._classname, clase);
		
		return clase;
	}
	
	ONE.apply(ONE.Class, {
		extends: function (clase, datos) {
			var extend = datos.extends,
			abstractClass = ONE.AbstractClass,
			abstractClassProperty = ONE.AbstractClass.prototype,
			padre = (extend && extend !== Object)? extend : abstractClass;
			
			if (ONE.isString(padre)) {
				padre = ONE.ClassManager.getClass(padre);
			}
			if (!(padre && padre._class)) {
				return;
			}
			clase._superclass = padre;

			var padrePrototype = padre.prototype,
			clasePrototype = clase.prototype = ONE.beget(padre);
			if (padre !== ONE.AbstractClass) {
				for (p in abstractClassProperty) {
					if (!padrePrototype.hasOwnProperty(p)) {
						padrePrototype[p] = abstractClassProperty[p];
					}
				}
			}
			
			delete datos.extends;
		},

		isA: function (obj, clase) {
			if (!(obj && ONE.isFn(obj.getClass) && clase && (ONE.isString(clase) || clase._class))) {
				return false;
			}
			var className = ONE.isString(clase)? clase : clase._classname,
			objClass = obj.getClass();
			function searchClassName(c) {
				if (!(c && c._classname)) {
					return false;
				} else if (c._classname === className) {
					return true;
				} else {
					return searchClassName(c._superclass);
				}
			}
			return searchClassName(objClass);
		}
	});
})();

/**
 * ClassManager
 */
(function () {
	ONE.ClassManager = {
		clases: {},
		nsCache: {},
		fnCache: {},
		
		setClass: function (nombre, clase) {
			this.clases[nombre] = this.setNamespace(nombre, clase);
		},
		
		setNamespace: function (nombre, clase) {
			var nombres = this.parsear(nombre),
			nodo = nombres[0],
			l = nombres.length-1,
			hoja = nombres[l],
			n;
			for (var i = 1; i < l; i++) {
				n = nombres[i];
				if (!nodo.hasOwnProperty(n)) {
					nodo[n] = {};
				}
				nodo = nodo[n];
			}
			nodo[hoja] = clase;
			return clase;
		},
		
		parsear: function (ns) {
			if (!ONE.isString(ns) || ns.length === 0){
				return null;
			}
			if (this.nsCache.hasOwnProperty(ns)) {
				return this.nsCache[ns];
			}
			
			var namespace = ns.split('.'),
			nombres = [];
			
			nombres[0] = ONE.global;
			if (namespace[0] === 'ONE') {
				nombres[0] = ONE;
				namespace = ns.substring(4).split('.');
			}
			
			for (var i = 0; i < namespace.length; i++) {
				nombres[i+1] = namespace[i];
			}
			
			this.nsCache[ns] = nombres;
			return nombres;
		},
		
		getClass: function (nombre) {
			return this.clases[nombre];
		},
		
		define: function (className, datos) {
			datos = datos || {};
			if (!(ONE.isString(className) && ONE.isObject(datos))) {
				return;
			}
			
			datos._classname = className;
			
			return new ONE.Class(datos);
		},
		
		new: function (clase) {
			if (ONE.isEmpty(clase) || (!ONE.isString(clase) && ONE.isEmpty(clase._classname))) {
				return null;
			}
			clase = ONE.isString(clase)? this.getClass(clase) : clase;
			if (ONE.isEmpty(clase)) {
				return null;
			}
			var args = Array.prototype.slice.call(arguments, 1);
			return this.getInstance(clase, args);
		},
		
		getInstance: function (clase, args) {
			if (!this.fnCache.hasOwnProperty(args.length)) {
				var argsJoin = '';
				for (var i = 0; i < args.length; i++) {
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
(function () {
	ONE.define = function () {
		return ONE.ClassManager.define.apply(ONE.ClassManager, arguments || []);
	};
	ONE.new = function () {
		return ONE.ClassManager.new.apply(ONE.ClassManager, arguments || []);
	};
	ONE.isA = function () {
		return ONE.Class.isA.apply(ONE.ClassManager, arguments || []);
	};
})();