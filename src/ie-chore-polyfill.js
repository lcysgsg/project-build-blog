/**
 * polyfill 主要以 `core-js`为主，这里辅助一些其它情况，如：帮助在 webpack 构建下运行
 * - insureConsole: 兼容找不到 console 对象的情况。未打开 devtools 的时候会因为 console 报错。 因为 console 不是 ES 的标准， 要保证 console 的运行某些环境要检验以保证安全的使用 // https://www.jianshu.com/p/85a4319e3bf4
 * - ie9ConsoleDeconstructionAssignment: 兼容 console 没有继承 Function 方法的情况，e.g. console.log.apply()， 常见于 babel 转换后的代码。
 * - ie8ImperfectObjectDefineProperty: ie8 下简易的模拟 Object.defineProperty，可满足 __webpack_require__.r
 * - ie8DocumentHead: ie8 不支持 document.head
 * - ie9FunctionBind: ie9-、node < 0.6 不支持 Function.prototype.bind。 core-js 有， 但是懒得把 core-js 单独提前引用。。。
 *
 */
;(function(global) {
    'use strict'
    ;(function insureConsole() {
        if (!global.console) {
            // https://github.com/paulmillr/console-polyfill
            // Make it safe to do console.log() always.
            global.console = {}
            var con = global.console
            var prop, method
            var dummy = function() {}
            var properties = ['memory']
            var methods = (
                'assert,clear,count,debug,dir,dirxml,error,exception,group,' +
                'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
                'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn'
            ).split(',')
            while ((prop = properties.pop())) if (!con[prop]) con[prop] = {}
            while ((method = methods.pop())) if (!con[method]) con[method] = dummy
        }
    })
    ;(function ie9ConsoleDeconstructionAssignment() {
        /**
         * console.log.apply not working in IE9-
         * https://stackoverflow.com/questions/5538972/console-log-apply-not-working-in-ie9
         * > 摘要：
         * >   console 对象其实不是 ES 的标准， 它实际上是文档对象模型的扩展（像其它 DOM 对象一样）。
         * > 所以，它就不像 ES 的普通对象、函数一样继承 Object，也不会继承 Function 的方法。
         * > IE 9 已经对大部分的 DOM 对象改进成会继承原生 ES 类型了， 但是console控制台被认为是 ie 的扩展， 所以没有进行同样的修改。
         */
        if (Function.prototype.bind && global.console && typeof console.log == 'object') {
            var consoleMethods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd']
            consoleMethods.forEach(function(method) {
                console[method] = this.bind(console[method], console)
            }, Function.prototype.call)
        }
    })
    ;(function ie8ImperfectObjectDefineProperty() {
        // ie8 下简易的模拟 Object.defineProperty，可满足 __webpack_require__.r
        // https://github.com/RubyLouvre/object-defineproperty-ie8/blob/master/index.js
        var origDefineProperty = Object.defineProperty

        var arePropertyDescriptorsSupported = function() {
            var obj = {}
            try {
                origDefineProperty(obj, 'x', { enumerable: false, value: obj })
                for (var _ in obj) {
                    return false
                }
                return obj.x === obj
            } catch (e) {
                /* this is IE 8. */
                return false
            }
        }
        var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported()

        if (!supportsDescriptors) {
            Object.defineProperty = function(a, b, c) {
                //IE8支持修改元素节点的属性
                if (origDefineProperty && a.nodeType == 1) {
                    return origDefineProperty(a, b, c)
                } else {
                    a[b] = c.value || (c.get && c.get())
                }
            }
        }
    })
    ;(function ie8DocumentHead() {
        // ie8 不支持 document.head
        if (document.head === undefined) {
            document.head = document.getElementsByTagName('head')[0]
        }
    })
    ;(function ie9FunctionBind() {
        // ie9-、node < 0.6 不支持 Function.prototype.bind
        // https://github.com/Raynos/function-bind/
        // core-js 有， 但是懒得把 core-js 单独提前引用。。。
        var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible '
        var slice = Array.prototype.slice
        var toStr = Object.prototype.toString
        var funcType = '[object Function]'

        function bind(that) {
            var target = this
            if (typeof target !== 'function' || toStr.call(target) !== funcType) {
                throw new TypeError(ERROR_MESSAGE + target)
            }
            var args = slice.call(arguments, 1)

            var bound
            var binder = function() {
                if (this instanceof bound) {
                    var result = target.apply(this, args.concat(slice.call(arguments)))
                    if (Object(result) === result) {
                        return result
                    }
                    return this
                } else {
                    return target.apply(that, args.concat(slice.call(arguments)))
                }
            }

            var boundLength = Math.max(0, target.length - args.length)
            var boundArgs = []
            for (var i = 0; i < boundLength; i++) {
                boundArgs.push('$' + i)
            }

            bound = Function(
                'binder',
                'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }'
            )(binder)

            if (target.prototype) {
                var Empty = function Empty() {}
                Empty.prototype = target.prototype
                bound.prototype = new Empty()
                Empty.prototype = null
            }

            return bound
        }

        console.log(Function.prototype.bind)
        if (Function.prototype.bind === undefined) {
            Function.prototype.bind = bind
        }
    })
})(typeof window === 'undefined' ? this : window) // Using `this` for web workers & supports Browserify / Webpack.
