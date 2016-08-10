var Class = require('../')

var A = new Class({
  _extends: Date,
  getName: function () {
    return 'a'
  }
})

var B = new Class({
  _extends: A,
  getName: function () {
    return 'b' + B.test()
  },
  _static: {
    test: function () {
      return 'B'
    }
  }
})

var a = new A('2016-9-20')
var b = new B('2016-9-21')

console.log(b.getName())

console.log(0)
