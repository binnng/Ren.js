/**
 *  迷你的javascript类库，小项目开发适用
 *  @name Root.js
 *  @author binnng
 *  @time 2013/03/23
 *  @update 2013/03/23 创建项目
 */
;(function(win, doc, undefined) {

  /**********************
   Root定义
  **********************/

  //Root直接用，domReady的回调
  var Root = function(callback) {
    if (Function !== callback.constructor) {
    	return;
    }

    Root.ready(callback);
    return this;
  };

  /**********************
   Root的构造函数类型
  **********************/

  Root.fn =  {
    /**
     * node 选择器
     * @param  {String} s 匹配字符串，节点
     * @param  {Object} n 父级节点元素
     * @return {Object} Root对象
     */
  	dom: function(selector, node) {

  	  //处理Root(''),Root(null),Root(undefined)
  	  if (!selector) {
  		return this;
  	  }

  	  this.selector = selector;
  	  this.size = 0;
  	  this.context = null;

  	  var result = [] // 结果集
  	  node = node || doc; //参照节点

  	  //selector是字符串
  	  if ('string' === typeof selector) {
  	    var type = selector.substring(0, 1),
  	    name = selector.substring(1);

  	    //用id匹配
  	    if ('#' === type) {
  	      if (!node.getElementById(name)) {
  	      	return;
  	      }
  	      result.push(node.getElementById(name));

  	    //用className匹配
  	    } else if ('.' === type) {

  	      //用原生选择器
  	      if (doc.getElmentsByClass) {
  	      	result = node.getElmentsByClass(name);
  	      } else {
  	      	var collect = node.getElementsByTagName('*'), // 获取所有节点
  	      	l = collect.length,
  	      	i = 0,

  	      	className;

  	      	for (; i<l; i++) {
  	      	  className = collect[i].className;

  	      	  if (Root.arr(className.split(' ')).has(name)) {
  	      	  	result.push(collect[i]);
  	      	  }
  	      	}
  	      }

  	    //用tagName匹配
  	    } else {
  	  	  Root.arr(node.getElementsByTagName(selector)).each(function(i) {
  	      	result.push(this[i]);
  	      });
  	      this.size = result.length;
  	    }
  	  	
  	  } else if (selector.nodeType) { //封装节点
  	  	result.push(selector);
  	  };

  	  this.context = result;
  	  this.size = result.length;

      return this;
  	},

  	//处理数组
  	arr: function(array) {
  	  this.context = [];
  	  //普通数组
      if (Array === array.constructor) {
  	    this.context = array;

  	  //dom节点集合
  	  } else if (NodeList === array.constructor) {
  	    for (var i = 0, l = array.length; i < l; i++) {
  	      this.context.push(array[i]);
  	    }
  	  }
  	  this.length = this.context.length;

  	  return this;
  	},

    //处理字符串
    str: function(str) {
      this.context = str;
      this.length = str.length;

      return this;
    }
  };

  /*************************
   Root方法集合的扩展
  *************************/

  Root.fn.dom.prototype = {

    /**
     * 对封装的dom对象遍历执行方法
     * @param  {Function} fn 执行的方法
     * @return {Object} Root对象
     */
    each: function(fn) {
      var node, that = this;

      Root.arr(this.context).each(function(i) {
        //使用时，this指向的时原生的dom元素
        node = that.context[i];
        fn.call(node, i);
      });

      return this;
    },

  	/**
  	 * 类似jQ，获取封装后的dom元素
  	 * @param  {Number} i 索引
     * @return {Object} Root对象
  	 */
  	eq: function(i) {
  	  return Root.dom(this.context[i]);
  	},

    /**
     * 获取原生dom对象
     * @param  {Number} i 索引
     * @return {Object} 原生dom对象
     */
  	single: function(i) {
  	  return this.context[i];
  	},

    /**
     * 获取属性或者设置属性
     * @param  {String} attr  属性名
     * @param  {String} value 属性值
     * @return {Object} Root对象
     */
  	attr: function(attr, value) {
      if ('string' !== typeof attr) {
        return;
      }

      var node = this.context[0];

  	  if (undefined === value) {
        //只返回第一个元素的属性值
  	  	return node.getAttribute(attr);

  	  } else if ('string' === typeof attr) {
        node.setAttribute(attr, value);
        
        return this;
  	  }

  	},

    /**
     * 获取或设置innerHTML
     * @param  {String} html 要设置的innerHTML的值
     * @return {Object} Root对象
     */
    html: function(html) {
      var node = this.context[0];

      if (undefined === html) {
        //只返回第一个元素的innerHTML
        return node.innerHTML;

      } else if ('string' === typeof html) {
        node.innerHTML = html;
        
        return this;
      }

    },

    /**
     * 获取或设置元素的className
     * @param  {String} name 类名
     * @return {Object} Root对象
     */
    className: function(name) {
      var node = this.context[0];

      if (undefined === name) {
        //只返回第一个元素的className
        return node.className;

      } else if ('string' === typeof name) {
        node.className = name;
        
        return this;
      }

    },

    /**
     * 获取或设置元素的css值
     * @param  {String|Object} name  css属性
     * @param  {String} value css值
     * @return {Object} Root对象
     */
    css: function(name, value) {
      var node = this.context[0];

      //单独设置
      if ('string' === typeof name) {
        if (undefined === value) {
          return (node.currentStyle? node.currentStyle : window.getComputedStyle(node, null))[name];
        } else {
          node.style[name] = value;

          return this;
        }

      //统一设置
      } else if (Object === name.constructor) {
        for (var i in name) {
          this.css(i, name[i]);
        }

        return this;
      }
    }

  };

  Root.fn.arr.prototype = {
  	/**
  	 * 数组是否含有某个元素
  	 * @param  {Number|String|Object}  s 要查找的元素
  	 * @return {Boolean}
  	 */
    has: function(s) {
      return this.context.indexOf(s) !== -1;
    },

    /**
     * 对数组遍历处理
     * @param  {String}   array    目标数组
     * @param  {Function} callback 处理的方法
     */
    each: function(callback) {
  	  if (Function !== callback.constructor) {
  	    return;
  	  }

      for (var i = 0, l = this.length; i < l; i++) {
      	//调用回调函数，设置this指向this.context，即原生数组，i表示索引
  	    callback.call(this.context, i);
  	  }
  	  return this;
    }
  };

  Root.fn.str.prototype = {
    trim: function() {
      return this.context.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
    }
  };

  /**********************
   Root的方法集合
  **********************/
  
  //封装dom元素
  Root.dom = function (selector, node) {
  	return new Root.fn.dom(selector, node);
  };

  //数组处理方法
  Root.arr = function(array) {
  	return new Root.fn.arr(array);
  };

  //数组字符串方法
  Root.str = function(str) {
    return new Root.fn.str(str);
  };

  //domReady
  Root.ready = function(fn) {
    if (Function !== fn.constructor) {
      return;
    }

    //W3C
    if (doc.addEventListener) {
      doc.addEventListener('DOMContentLoaded', function() {
        doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
        fn.call(win);
      });

    //ie
    } else if (doc.attachEvent) {
      doc.attachEvent("onreadystatechange", function() {
      if (doc.readyState === "loaded" || doc.readyState === "complete") {
        doc.detachEvent("onreadystatechange", arguments.callee);
       fn.call(win);
      }
    });
    }

  };

  Root.ajax = function() {

  };

  Root.get = function() {

  };





  /*************************
   Root暴露
  *************************/

  win.Ren = Root;

})(window, document);












//输出到控制台
var log = function(content) {
  return console.log && console.log(content);
};