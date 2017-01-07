const utils = require('ntils');

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
        if (this._super_called_) return this._super_ret_;
        this._super_called_ = true;
        if (utils.isFunction(options.$extends)) {
          this._super_ret_ = this.__proto__.__proto__ = options.$extends.apply(this, arguments);
        } else {
          this._super_ret_ = options.$extends;
        }
        return this._super_ret_;
      });
      for (var name in superPrototype) {
        var value = superPrototype[name];
        if (utils.isFunction(value)) {
          this.$super[name] = value.bind(this);
        } else {
          this.$super[name] = value;
        }
      }
    }
    //调用构造
    if (utils.isFunction(options.constructor) &&
      options.constructor !== Object) {
      return options.constructor.apply(this, arguments);
    } else {
      //如果没有实现 constructor 则调用父类构造
      this.$super.apply(this, arguments);
    }
  };
  //处理 prototype
  NewClass.prototype.__proto__ = superPrototype;
  utils.copy(options, NewClass.prototype);
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
  utils.defineFreezeProp(NewClass, '$super', options.$extends);
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