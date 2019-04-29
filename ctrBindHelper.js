/**
 * @module CtrlBind
 * @description 提供数据控件绑定的统一方法 
 * @author Seven Chen
 * @version 2.0.0
 */

(function (global,factory) {
    if(typeof define === 'function' && define.amd){
        define('$ctrBindHelper',['jquery'],factory);
    }else if(typeof exports === 'object'){
        module.exports = factory(require('jquery'));
    }else{
        global.$ctrBindHelper = factory(global.jQuery);
    }

})(window,function($){
    'use strict';

    if (!$) throw 'Jquery is required!';
    //if (!global.$commonHelper) throw 'CommonHelper is required!'; // depreted

    /**
     * @module $CtrlBind
     * @description CtrlBind 代理方法
     * @method $ctrBindHelper
     * @param {object} option = {el:your_elem_id,bindType: your_bind_type, dataSourc:dataSource{value,text}}
     */
    return function $ctrBindHelper(option) {
            /**
             * @module CtrlBind
             * @constructor
             * @param {object} option 对象
             */
            var CtrlBind = function CtrlBind(option) {
                this.option = option;
            };

            /**
             * @module CtrlBind
             * @description 提供数据绑定类型 默认提供（selectBind, gridBind, inputBind）
             * @property bindType
             * @type {Object}
             * @private
             */
            CtrlBind.bindType = {
                selectBind: 'selectBind',
                gridBind: 'gridBind',
                inputBind: 'inputBind',
                immuteCheckBind: 'immuteCheckBind',
                ajaxAutoComplete: 'ajaxAutoComplete',
                listBind: 'listBind',
                clickBind: 'clickBind'
               
            };

            /**
             * @module CtrlBind
             * @description 命名空间类，提供绑定类型对应的具体绑定方法
             * @property binder
             * @private 
             */
            CtrlBind.binder = {};

            /**
             * @module CtrlBind
             * @description 提供select控件绑定 Option 格式必须是 {el：selector, text:[fieldName]?, value:[fieldName]?, dataSource: {text:..?, value:..?, other_prop:...}}
             * @param {None} N/A
             * @private
             */
            CtrlBind.binder.selectBind = function selectBind(opt) {
                var optList,
                    dt = opt.dataSource;

                if (!$(opt.el).is('select')) throw 'Control Error: The control must be select!';
                if (!$.isArray(dt)) throw 'el: '+opt.el+' DataType Error: The datasource must be type of array!';
                
                optList = dt.map(function (o) {
                    // var item = !$commonHelper.isObj(o) ? {
                    //     text: o,
                    //     value: o
                    // } : {text:o[opt.text],value:o[opt.value]};
                    var item = {};
                    if ($.isPlainObject(o)) {
                        //设置 text
                        if (opt.text) {
                            item.text = o[opt.text];
                        } else if (o.text) {
                            item.text = o.text;
                        } else {
                            throw 'Bind Error: please set the select text either in the option or datasource!';
                        }

                        //设置value
                        if (opt.value) {
                            item.value = o[opt.value];
                        } else if (o.value) {
                            item.value = o.value;
                        } else {
                            throw 'Bind Error: please set the select value either in the option or datasource!';
                        }
                    } else {
                        item.text = o;
                        item.value = o;
                    }

                    return '<option value="' + item.value + '">' + item.text + "</option>";
                });
                
                //设置首选项
                if (opt.fstText !== undefined && opt.fstVal !== undefined) {
                    if (optList[0] !== '<option value="">""</option>') {
                        optList.unshift('<option value="' + opt.fstVal + '">' + opt.fstText + "</option>");
                    }
                }
                $(opt.el).empty().append($(optList.toString().replace(/>,</g, '><')));
                if (opt.changeCb && $.isFunction(opt.changeCb)) {
                    $(opt.el).bind('change', opt.changeCb);     //绑定change事件
                }
            };

            /**
             * @module CtrlBind
             * @description 提供grid控件数据绑定
             * @param {None} N/A
             * @private
             */
            CtrlBind.binder.gridBind = function () {

            };

            CtrlBind.binder.inputBind = function inputBind(opt) {
                var el = $(opt.el);
                el.val(opt.dataSource);
            };

            /**
             * @module CtrlBind
             * @description 提供 autoComplete 控件绑定 Option 格式必须是 {el：selector, url: URL, param: ajaxParam, selectCb:funciton(e,ui)}
             * @param {object} 
             * @private
             */
            CtrlBind.binder.ajaxAutoComplete = function ajaxAutoComplete(opt) {
                var target = $(opt.el),
                    hidElem = $(opt.hidField),
                    pattern = opt.pattern,  //数据显示模式
                    regxKey = /k/g,
                    regxVal = /v/g;

                target.attr('placeholder',opt.placeHolder);
                target.keydown(function () {
                    var _temp = target.attr("_value");
                    if ($(this).val() !== _temp) {
                        hidElem.val("");
                    }
                });

                /**
                * 默认callback 函数
                */
                var changeCb = function () {
                    target.val() || hidElem.val('')
                };

                var selectCb = function (e, ui) {
                    target.val(ui.item.label);
                    hidElem.val(ui.item.value);
                    return false;
                };

                var focusCb = function (e, ui) {
                    target.val(ui.item.label);
                };

                /**
                * 设置 autocomplete
                */
                target.autocomplete({
                    source: function (request, response) {
                        target.append($('<i class="uk-icon-spinner uk-icon-spin"></i>'));
                        var param = $.extend({},opt.param,{ filterArg:request.term.split('-')[0]});
                        $.ajax({
                            type: "GET",
                            cache: false,
                            dataType: "json",
                            url: opt.url,
                            data:param,
                            success: function (data) {
                                if (data.length === 0) {
                                    hidElem.val('');
                                }
                                response($.map(data, function (item) {
                                    return {
                                        label: opt.pattern ? pattern.replace(regxVal,item[opt.bindValue]).replace(regxKey,item[opt.bindKey]):item[opt.bindValue],
                                        value: item[opt.bindKey],
                                        data: item
                                    }
                                }));
                            },
                            error: function () {
                                hidElem.val('');
                            }
                        });
                    },
                    change: opt.changeCb ||changeCb,
                    focus: opt.focusCb || focusCb,
                    select: opt.selectCb || selectCb
                });
            };

            CtrlBind.binder.listBind = function listBind(opt) {
                var el = $(opt.el),
                    func = opt.selFunc,
                    dt = opt.dataSource;

                if (!$(opt.el).is('ul')) throw 'Control Error: The control '+opt.el+' must be ul html element!';
                if (!$.isArray(dt)) throw 'Data Type Error: The datasource must be type of array!';

                var optList = dt.map(function (o) {
                    var item = {};
                    if ($.isPlainObject(o)) {
                        //设置 text
                        if (opt.text) {
                            item.text = o[opt.text];
                        } else if (o.text) {
                            item.text = o.text;
                        } else {
                            throw 'Bind Error: please set the li text either in the option or datasource!';
                        }

                        //设置value
                        if (opt.value) {
                            item.value = o[opt.value];
                        } else if (o.value) {
                            item.value = o.value;
                        } else {
                            throw 'Bind Error: please set the li value either in the option or datasource!';
                        }
                    } else {
                        item.text = o;
                        item.value = o;
                    }

                    return '<li data-value="' + item.value + '">' + item.text + "</li>";
                });
                
                el.empty().append($(optList.toString().replace(/>,</g, '><')));

                if ($.isFunction(func)) {
                    el.find('li').bind('click', func);
                }
            };

            CtrlBind.binder.immuteCheckBind = function immuteCheckBind(opt) {
                var el = $(opt.el),
                    refEl = $(opt.refEl);
                //初始化控件
                el.attr('checked', 'checked');
                refEl.removeAttr('checked');

                //为控件绑定事件
                el.bind('change', function () {
                    if (el.attr('checked') === 'checked') {
                        $.fn.attr.call(refEl, 'checked', 'checked');
                        $.fn.removeAttr.call(el, 'checked');
                    } else {
                        $.fn.attr.call(el, 'checked', 'checked');
                        $.fn.removeAttr.call(refEl, 'checked');
                    }
                });
                refEl.bind('change', function () {
                    if (refEl.attr('checked') === 'checked') {
                        $.fn.attr.call(el, 'checked', 'checked');
                        $.fn.removeAttr.call(refEl, 'checked');
                    } else {
                        $.fn.attr.call(refEl, 'checked', 'checked');
                        $.fn.removeAttr.call(el, 'checked');
                    }
                });
            };

            CtrlBind.binder.clickBind = function clickBind(opt) {
                var el = $(opt.el),
                    fn = opt.func;
                el.bind('click', fn);
            };
            /**
             * @module CtrlBind
             * @description 执行数据绑定
             * @method bindData
             * @param {None} N/A
             */
            CtrlBind.prototype.bindData = function bindData() {
                var opt = this.option,
                    bindType = opt.bindType;
                if (bindType) {
                    var fnName = CtrlBind.bindType[bindType];
                    CtrlBind.binder[fnName].call(this, opt);
                }
            };

            /**
             * @module CtrlBind
             * @description 执行批量数据绑定
             * @method bindAll
             * @param {None} N/A
             */
            CtrlBind.prototype.bindAll = function bindAll() {
                var opt = this.option;
                var self = this;
                if (Array.isArray(opt)) {
                    opt.map(function (o) {
                        var bindType = o.bindType;
                        var fnName = CtrlBind.bindType[bindType];
                        CtrlBind.binder[fnName].call(self, o);
                    });
                } else {
                    throw 'The parameter should be an option array!';
                }
            };

            /**
             * 
             * @description 新增绑定类型
             * @method addBindType
             * @param {String} 绑定类型名称
             * @param {Function} 绑定类型对应的绑定方法
             */
            CtrlBind.prototype.addBindType = function addBindType(fnName, fn) {
                if (CtrlBind.bindType[fnName]) {
                    throw 'This bind type have been used by another function';
                }
                CtrlBind.bindType[fnName] = fnName;
                CtrlBind.binder[fnName] = fn;

                return this;
            };

            /**
             * @module CtrlBind
             * @description 获取当前使用的Option对象
             * @method getOption
             * @param {None} N/A
             * @return {Object} option 对象
             */
            CtrlBind.prototype.getOption = function getOption() {
                return this.option;
            };

            if (!(this instanceof CtrlBind)) {
                return new CtrlBind(option);
            }
            return this;
        }

});

/**
 * @description test
 */
//var option = {
//    el: '#sel',
//    bindType: 'selectBind',
//    dataSource: ['please select', '1', '2', '3', '4', '5']
//};
//var bind1 = $ctrBindHelper(option).bindData();

// var optionStaff = {
//     el: '#sel',
//     bindType: 'selectBind',
//     // text:'StaffName',
//     // value:'StaffCode',
//     dataSource: [{
//         StaffName: 'Michle',
//         StaffCode: 1234,
//         text:'M',
//         value:'234'
//     }, {
//         StaffName: 'Seven Chen',
//         StaffCode: 23456,
//         text:'S',
//         //value:124
//     }]
// };
// $ctrBindHelper(optionStaff).bindData();
//动态添加绑定类型
// var option2 = {
//     el: '#sel',
//     bindType: 'helloworld'
// };

// var bind = $ctrBindHelper(option2).addBindType('helloworld', function () {
//     console.log('hello world' + this.option.bindType);
// }).bindData();

// var y = '2';
// var option3 = {
//     el: y === '1' ? '#chk2' : '#chk1',
//     refEl: '#chk2',
//     bindType: 'immuteCheckBind'
// };
//debugger;
//$ctrBindHelper([option, option3]).bindAll();