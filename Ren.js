/**
 *  迷你的javascript类库，小项目开发适用
 *  @name Ren.js
 *  @author binnng
 *  @time 2013/03/23
 *  @update 2013/03/23 创建项目
 */
;(function(win, doc, undefined) {

  /***********************************************************
   Ren定义
  ***********************************************************/

  /**
   * Ren直接调用，相当于jQ中的$(fn)用法，即domready所执行的方法
   */
  var Ren = function(callback) {
    if (Function !== callback.constructor) {
    	return;
    }

    Ren.ready(callback);
    return this;
  };

  /***********************************************************
   Ren的构造函数（即可以被封装的对象）类型
   有dom，string，array类型
  ***********************************************************/

  Ren.fn =  {
    /**
     * node 选择器
     * @param  {String} s 匹配字符串，节点
     * @param  {Object} n 父级节点元素
     * @return {Object} Ren对象
     */
    dom: function(selector, node) {

  	  //处理Ren(''),Ren(null),Ren(undefined)
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
       * Ren('#id'), Ren('.class'), Ren('div') 
       */
  	  if ('string' === typeof selector) {
  	    var type = selector.substring(0, 1),
  	    name = selector.substring(1);

  	    /**
         * Ren('#id') 
         */
  	    if ('#' === type) {
  	      if (!node.getElementById(name)) {
  	      	return;
  	      }
  	      result.push(node.getElementById(name));

  	    /**
         * Ren('.class') 
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

  	      	  if (Ren.arr(className.split(' ')).has(name)) {
  	      	  	result.push(collect[i]);
  	      	  }
  	      	}
  	      }

  	    /**
         * Ren('div') 
         */
  	    } else {
  	  	  Ren.arr(node.getElementsByTagName(selector)).each(function(i) {
  	      	result.push(this[i]);
  	      });
  	      this.size = result.length;
  	    }

  	  /**
       * 如果selector传入的是原生的DOM元素，直接封装它为Ren的DOM对象
       */
  	  } else if (selector.nodeType) {
  	  	result.push(selector);

      /**
       * 如果selector是封装后的Ren的DOM对象，直接返回
       */
  	  } else if (selector instanceof Ren.dom) {
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
  	  for (var i = 0, l = array.length; i < l; i++) {
        this.context.push(array[i]);
      }
  	  this.length = this.context.length;

  	  return this;
  	},

    //处理字符串
    str: function(str) {
      if ('string' !== typeof str) return;
      this.context = str;
      this.length = str.length;

      return this;
    }
  };

  /***********************************************************
   Ren方法集合的扩展
   定义一切基于Ren的DOM元素的方法

   如果在某个结果集上直接获取某个属性的值，只返回第一个元素的值
   如Ren('p').html()，相当于Ren('p').eq(0).html()

   如果想要对结果集统一方法处理，请使用each来遍历，没有jQ中的隐式遍历
   如Ren('p').html('text')只会处理第一个元素，
   Ren('p').each(function(i) {Ren(this).html('text')})
   则可以处理所有元素
  ***********************************************************/

  Ren.fn.dom.prototype = {

    /**
     * 对封装的dom对象遍历执行方法
     * @param  {Function} fn 执行的方法
     * @return {Object} Ren对象
     */
    each: function(fn) {
      var node, that = this;

      Ren.arr(this.context).each(function(i) {
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
     * @return {Object} Ren对象
  	 */
  	eq: function(i) {
  	  return i < 0 ? Ren.dom(this.context[this.length - i]) : Ren.dom(this.context[i]);
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
     * @return {Object} Ren对象
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
     * @return {Object} Ren对象
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
     * @return {Object} Ren对象
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
     * @return {Object} Ren对象
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
    },
    
    /**
     * 向DOM元素追加节点
     * @param  {Object} el 传入的元素，可以是原声的DOM元素，也可是Ren的DOM元素
     * @return {Object} Ren的DOM元素
     */
    append: function(el) {
      var node = this.context[0];
      
      //如果传入的是Ren的DOM对象
      if (el.get) {
        el = el.get(0);
      }

      node.appendChild(el);

      return this;
    },
    
    /**
     * 绑定事件
     * @param  {String}   type     事件的类型
     * @param  {Function} callback 绑定的方法
     * @return {Object}    Ren的DOM元素
     */
    on: function(type, callback) {
      var node = this.context[0];

      if (node.addEventListener) {
        node.addEventListener(type, callback, false);
      } else {
        node.attachEvent('on' + type, callback);
      }

      return this;
    }

  };

  Ren.fn.arr.prototype = {
    //获取原生数组
    get: function() {
      return this.context;
    },
    /**
     * 某个元素在数组中的索引值
     * @param  {*}  s 要查找的元素
     * @return {[type]} [description]
     */
    indexOf: function(s) {
      //如果数组有原生的indexOf方法
      if (this.context.indexOf) {
        return this.context.indexOf(s);

      //没有indexOf方法，模拟一个
      } else {
        for (var i = this.context.length - 1; i >= 0; i--) {
          if (s === this.context[i]) {
            return i;
          }
        };

        //不含有，返回-1
        return -1;
      }
    },
  	/**
  	 * 数组是否含有某个元素
  	 * @param  {*}  s 要查找的元素
  	 * @return {Boolean}
  	 */
    has: function(s) {
      return Ren.arr(this.context).indexOf(s) !== -1;
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

  Ren.fn.str.prototype = {
    //获取原生字符串
    get: function() {
      return this.context;
    },

    //去除前后空格
    trim: function() {
      return this.context.replace(/^(\s|\r|\n|\r\n)*|(\s|\r|\n|\r\n)*$/g, '');
    },

    //JSON
    JSON: function(){
      return (new Function("return " + this.trim()))();      
    }
  };

  /***********************************************************
   Ren自有方法的定义
   以上的Ren.fn也属于此列，但它比较特殊，所以单独提上去了
  ***********************************************************/
  
  /**
   * 封装DOM元素，实例化一个Ren的dom对象
   */
  Ren.dom = function (selector, node) {
  	return new Ren.fn.dom(selector, node);
  };

  /**
   * 封装数组(Array)元素，实例化一个Ren的array对象
   */
  Ren.arr = function(array) {
  	return new Ren.fn.arr(array);
  };

  /**
   * 封装字符串(String)元素，实例化一个Ren的string对象
   */
  Ren.str = function(str) {
    return new Ren.fn.str(str);
  };

  /**
   * 文档加载完成（domready事件）
   */
  Ren.ready = function(fn) {
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

  Ren.ajax = function(conf) {
  
    var url   = Ren.str(conf.url).trim(),
      type    = conf.type || 'get',
      data    = conf.data || '',
      isJSON  = conf.isJSON,
      success = conf.success,
      data;
    
    if (typeof url !== "string" || url === "") return;
    type = type.toLowerCase();
    //创建XMLHttpRequest对象
  
    function createXHR() {

      //ie6以上支持XMLHttpRequest的浏览器
      if ("function" === typeof XMLHttpRequest) {
        return new XMLHttpRequest();

      //ie6等支持ActiveXObject
      } else if (typeof ActiveXObject === "function") {
        return new ActiveXObject("Microsoft.XMLHTTP");
      }
    }
  
    //发送http请求
    var xhr = createXHR();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223) {
          data = decodeURIComponent(xhr.responseText);
          if (isJSON) {
            data = Ren.str(data).JSON();
          }
          if (success) {
            success(data);
          }
        }
      }
    }
    xhr.open(type, url, true);
    if (type === "get") {
      xhr.send(null);
    } else if (type === "post") {
      xhr.send(data);
    }
  };
  
  /**
   * 创建DOM元素
   * @param  {String} tag  标签名
   * @param  {Object} attr 属性列表
   * @return {Object} Ren的DOM对象
   */
  Ren.createElement = function(tag, attr) {
    var el = document.createElement(tag);

    for (var name in attr) {
      //如果为内联样式则调用style.cssText;      
      if (name === "style") {
        el.style.cssText = attr[name];
      } else {
        el.setAttribute(name, attr[name]);
      }
    }

    return Ren.dom(el);
  };

  /**
   * 动态获取脚本
   * @param  {String}   url      脚本的url
   * @param  {Function} callback 加载完成执行的回调（可选）
   */
  Ren.getScript = function(url, callback) {
    var el = Ren.createElement("script", {
      "src": url,
      "type": "text/javascript"
    });

    if (el.get(0).readyState) {
      
      //IE不支持onload事件，支持readystatechange
      el.on("readystatechange", function() {
        if (el.get(0).readyState === "loaded" || el.get(0).readyState === "complete") {
          if (callback) {
            callback();
          }
        }
      });

    //支持onload事件
    } else {
      el.on("load", function() {
        if (callback) {
          callback();
        }
      });
    }

    Ren.dom('head').append(el);    
  };

  //加载css
  Ren.getCSS = function(url) {
    var el = Ren.createElement("link", {
      "href": url,
      "rel": "stylesheet",
      "type": "text/css"
    });

    Ren.dom('head').append(el);
  };





  /***********************************************************
   Ren暴露到window中
  ***********************************************************/

  win.Ren = Ren;

})(window, document);