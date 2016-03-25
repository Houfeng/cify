var Class = require("../");

var A = new Class({
  _extends: Date,
  getName: function() {
    return "a";
  }
});

var B = new Class({
  _extends: A,
  getName: function() {
    return "b" + B.test();
  },
  _static: {
    test: function() {
      return "B";
    }
  }
});

var a = new A();
var b = new B();

console.log(a._super.name);

console.log(0);