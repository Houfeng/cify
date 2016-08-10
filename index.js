; (function () {
  var createInstance = (function () {
    var fnBody = ['switch(args.length){']
    for (var i = 20; i > 0; i--) {
      var fnArgs = []
      for (var j = 0; j < i; j++) fnArgs.push('args[' + j + ']')
      fnBody.push('case ' + i + ':return new Fn(' + fnArgs.join(',') + ');')
    }
    fnBody.push('case 0:default:return new Fn();}')
    return new Function('Fn', 'args', fnBody.join(''))
  })()

  function getPropertyNames(obj) {
    var nameList = Object.getOwnPropertyNames(obj)
    if (obj.__proto__) {
      nameList.push.apply(nameList, getPropertyNames(obj.__proto__))
    }
    return nameList
  }

  function isChildClass(_child, _super) {
    if (_child.__proto__ == _super.prototype) {
      return true
    } else if (_child.prototype) {
      return isChildClass(_child.prototype, _super)
    } else {
      return false
    }
  }

  function createSuper(_self, proto) {
    var _super = function () {
      if (proto.constructor) {
        proto.constructor.apply(_self, arguments)
      }
    }
    delete _super.name
    var nameList = getPropertyNames(proto)
    nameList.forEach(function (name) {
      if (name == '_super' ||
        name == '_extends' ||
        name == '_static' ||
        name == 'constructor') {
        return
      }
      if (typeof proto[name] === 'function') {
        _super[name] = _super[name] || proto[name].bind(_self)
      } else {
        _super[name] = _super[name] || proto[name]
      }
    })
    _super.__proto__ = {}
    return _super
  }

  function defineClass(def) {
    var classProto = ((typeof def === 'function') ? def() : def) || {}
    var classExtends = classProto._extends
    var clsssStatic = classProto._static || {}
    if (typeof classExtends === 'function') {
      classProto.__proto__ = classExtends.prototype
      clsssStatic.__proto__ = classExtends
    } else if (classExtends) {
      classProto.__proto__ = classExtends
    } else {
      classProto.__proto__ = {}
    }
    classProto.__defineGetter__('_super', function () {
      this.__super__ = this.__super__ || createSuper(this, classProto.__proto__)
      return this.__super__
    })
    Class.prototype = classProto
    Class.__proto__ = clsssStatic
    function Class() {
      var instance = this
      if (typeof classExtends === 'function') {
        instance = createInstance(classExtends, arguments)
      }
      instance.constructor = Class
      instance._static = instance.Class = Class
      instance.__proto__ = Class.prototype
      var constructor = instance.__proto__.constructor
      if (constructor != null &&
        constructor != Object) {
        var rs = constructor.apply(instance, arguments)
        instance = rs && classProto.hasOwnProperty('constructor') ? rs : instance
      }
      instance.__proto__ = Class.prototype
      delete instance._extends
      return instance
    }
    Class.extendsOf = function (_super) {
      return isChildClass(this, _super)
    };
    Class.superOf = function (_child) {
      return isChildClass(_child, this)
    };
    return Class
  }

  defineClass.prototype.__proto__ = Function.prototype
  defineClass.Class = defineClass

  if (typeof module != 'undefined') {
    module.exports = defineClass
  }

  if (typeof define == 'function' && define.amd) {
    define('cify', [], function () {
      return defineClass
    })
  }

  if (typeof window != 'undefined') {
    window.cify = window.Class = defineClass
  }
})()
