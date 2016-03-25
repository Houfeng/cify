var slice = [].slice;

function createInstance(Fn, args) {
  var args_str = slice.call(args).map(function(arg, i) {
    return 'args[' + i + ']';
  });
  var instance = eval('new Fn(' + args_str.join(',') + ')');
  return instance;
};

function createSuper(_self, proto) {
  var _super = function() {
    if (proto.constructor) {
      return createInstance(proto.constructor, arguments);
    }
    return proto;
  };
  for (var name in _self) {
    if (name == "_super" ||
      name == "_extends" ||
      name == "_static" ||
      name == "constructor" ||
      proto[name] == null) {
      continue;
    }
    if (typeof proto[name] === 'function') {
      _super[name] = proto[name].bind(_self);
    } else {
      _super[name] = proto[name];
    }
  }
  return _super;
};

function defineClass(def) {
  var classProto = ((typeof def === 'function') ? def() : def) || {};
  var constructor = classProto.constructor;
  var classExtends = classProto._extends;
  var clsssStatic = classProto._static || {};
  if (typeof classExtends === 'function') {
    classProto.__proto__ = classExtends.prototype;
    clsssStatic.__proto__ = classExtends;
  } else if (classExtends) {
    classProto.__proto__ = classExtends;
  } else {
    classProto.__proto__ = {};
  }
  classProto.__defineGetter__('_super', function() {
    this.__super__ = this.__super__ || createSuper(this, classProto.__proto__);
    return this.__super__;
  });
  Class.prototype = classProto;
  Class.__proto__ = clsssStatic;
  function Class() {
    var instance = this;
    if (constructor != null &&
      constructor != Object) {
      instance = constructor.apply(instance, arguments) || instance;
    } else if (typeof classExtends === 'function') {
      instance = createInstance(classExtends, arguments) || instance;
    }
    instance.constructor = Class;
    instance.__proto__ = Class.prototype;
    instance._extends = null;
    instance._static = Class;
    return instance;
  }
  return Class;
};

defineClass.prototype.__proto__ = Function.prototype;
defineClass.Class = defineClass;

module.exports = defineClass;