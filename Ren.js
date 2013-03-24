/**
 *  迷你的javascript类库，小项目开发适用
 *  @name Root.js
 *  @author binnng
 *  @time 2013/03/23
 *  @update 2013/03/23 创建项目
 */
;(function(win, doc, undefined) {

  /***********************************************************
   Root定义
  ***********************************************************/

  /**
   * Root直接调用，相当于jQ中的$(fn)用法，即domready所执行的方法
   */
  var Root = function(callback) {
    if (Function !== callback.constructor) {
    	return;
    }

    Root.ready(callback);
    return this;
  };

  /***********************************************************
   Root的构造函数（即可以被封装的对象）类型
   有dom，string，array类型
  ***********************************************************/

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

  	  /**
       * selector为字符串，处理以下三种情况 
       * Root('#id'), Root('.class'), Root('div') 
       */
  	  if ('string' === typeof selector) {
  	    var type = selector.substring(0, 1),
  	    name = selector.substring(1);

  	    /**
         * Root('#id') 
         */
  	    if ('#' === type) {
  	      if (!node.getElementById(name)) {
  	      	return;
  	      }
  	      result.push(node.getElementById(name));

  	    /**
         * Root('.class') 
         */
  	    } else if ('.' === type) {

  	      /**
           * 如果浏览器本身就有getElmentsByClass方法，使用用原生选择器
           * 否则先选择所有的DOM元素，然后去匹配每个DOM元素的className是否含有制定的className
           */
  	      if (doc.getElmentsByClass) {
  	      	result = node.getElmentsByClass(name);

  	      } else {
  	      	var collect = node.getElementsByTagName('*'),
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

  	    /**
         * Root('div') 
         */
  	    } else {
  	  	  Root.arr(node.getElementsByTagName(selector)).each(function(i) {
  	      	result.push(this[i]);
  	      });
  	      this.size = result.length;
  	    }

  	  /**
       * 如果selector传入的是原生的DOM元素，直接封装它为Root的DOM对象
       */
  	  } else if (selector.nodeType) {
  	  	result.push(selector);

      /**
       * 如果selector是封装后的Root的DOM对象，直接返回
       */
  	  } else if (selector instanceof Root.dom) {
        result = selector.context;
        return selector;
      }

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

  /***********************************************************
   Root方法集合的扩展
   定义一切基于Root的DOM元素的方法

   如果在某个结果集上直接获取某个属性的值，只返回第一个元素的值
   如Root('p').html()，相当于Root('p').eq(0).html()

   如果想要对结果集统一方法处理，请使用each来遍历，没有jQ中的隐式遍历
   如Root('p').html('text')只会处理第一个元素，
   Root('p').each(function(i) {Root(this).html('text')})
   则可以处理所有元素
  ***********************************************************/

  Root.fn.dom.prototype = {

    /**
     * 对封装的dom对象遍历执行方法
     * @param  {Function} fn 执行的方法
     * @return {Object} Root对象
     */
    each: function(fn) {
      var node, that = this;

      Root.arr(this.context).each(function(i) {
        /**
         * 显示定义this指向原生的dom元素
         */
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
  	  return i < 0 ? Root.dom(this.context[this.length - i]) : Root.dom(this.context[i]);
  	},

    /**
     * 获取原生dom对象
     * @param  {Number} i 索引
     * @return {Object} 原生dom对象
     */
  	get: function(i) {
  	  return i < 0 ? this.context[this.length - i] : this.context[i];
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

      /**
       * 单独对css的某个属性设置
       * o.css('height', '300px');
       */
      if ('string' === typeof name) {
        if (undefined === value) {
          return (node.currentStyle? node.currentStyle : window.getComputedStyle(node, null))[name];
        } else {
          node.style[name] = value;

          return this;
        }

      /**
       * 同时对css多个属性设置
       * o.css({width: '300px', height: '200px'})
       */
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

  /***********************************************************
   Root自有方法的定义
   以上的Root.fn也属于此列，但它比较特殊，所以单独提上去了
   包括一系列不基于任何dom元素的方法，如ajax，cookie，等
  ***********************************************************/
  
  /**
   * 封装DOM元素，实例化一个Root的dom对象
   */
  Root.dom = function (selector, node) {
  	return new Root.fn.dom(selector, node);
  };

  /**
   * 封装数组(Array)元素，实例化一个Root的array对象
   */
  Root.arr = function(array) {
  	return new Root.fn.arr(array);
  };

  /**
   * 封装字符串(String)元素，实例化一个Root的string对象
   */
  Root.str = function(str) {
    return new Root.fn.str(str);
  };

  /**
   * 文档加载完成（domready事件）
   */
  Root.ready = function(fn) {
    if (Function !== fn.constructor) {
      return;
    }

    /**
     * W3C下，文档加载完成时，会触发DOMContentLoaded事件，将回调注册到此事件中
     */
    if (doc.addEventListener) {
      doc.addEventListener('DOMContentLoaded', function() {
        doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
        //显示的将回调函数中的this指向window
        fn.call(win);
      });

    /**
     * ie没有DOMContentLoaded事件，但有readystatechange事件
     * readyState状态，有loading,loaded,complete三种
     * readyState等于loaded或者complete，就解绑事件，防止被触发两次
     */
    } else if (doc.attachEvent) {
      doc.attachEvent("onreadystatechange", function() {
        if (doc.readyState === "loaded" || doc.readyState === "complete") {
          doc.detachEvent("onreadystatechange", arguments.callee);
          fn.call(win);
        }
      });
    }

    return this;

  };

  Root.ajax = function() {

  };

  Root.get = function() {

  };





  /***********************************************************
   Root暴露到window中
  ***********************************************************/

  win.Ren = Root;

})(window, document);












//输出到控制台
var log = function(content) {
  return console.log && console.log(content);
};