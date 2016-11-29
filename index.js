const utils = require('ntils');

const RESERVED = ['$extends', '$name', '$class', '$super'];

function Class(options) {
  //处理 options
  options = options || utils.create(null);
  options.$name = options.$name || 'Class';
  options.$extends = options.$extends || Class;
  options.$static = options.$static || utils.create(null);
  //处理父类 prototype
  var superPrototype = utils.isFunction(options.$extends) ?
    options.$extends.prototype : options.$extends;
  //定义新类
  var NewClass = function () {
    //处理 super
    if (!this.$super) {
      utils.defineFreezeProp(this, '$super', function () {
        if (utils.isFunction(options.$extends)) {
          return this.__proto__.__proto__ = options.$extends.apply(this, arguments);
        } else if (options.$extends.constructor) {
          return this.__proto__.__proto__ = options.$extends.constructor.apply(this, arguments);
        } else {
          return options.$extends;
        }
      });
      utils.each(superPrototype, function (name, value) {
        if (utils.isFunction(value)) {
          this.$super[name] = value.bind(this);
        } else {
          this.$super[name] = value;
        }
      }, this);
    }
    //调用构造
    if (utils.isFunction(options.constructor)) {
      return options.constructor.apply(this, arguments);
    }
  };
  //处理 prototype
  NewClass.prototype.__proto__ = superPrototype;
  utils.copy(options, NewClass.prototype, RESERVED);
  utils.defineFreezeProp(NewClass.prototype, '$class', NewClass);
  //处理静态成员
  utils.copy(options.$static, NewClass);
  if (utils.isFunction(options.$extends)) {
    NewClass.__proto__ = options.$extends;
  }
  if (!options.$extends.$extend) {
    utils.copy(Class, NewClass);
  }
  utils.defineFreezeProp(NewClass, 'name', options.$name);
  //--
  return NewClass;
}

//定义扩展方法
Class.$extend = function (options) {
  options.$extends = this;
  return new Class(options);
};

Class.Class = Class;
module.exports = Class;