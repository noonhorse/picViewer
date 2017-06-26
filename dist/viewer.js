/* AlloyFinger v0.1.7
 * By dntzhang
 * Github: https://github.com/AlloyTeam/AlloyFinger
 */
; (function () {
    function getLen(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    function dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    function getAngle(v1, v2) {
        var mr = getLen(v1) * getLen(v2);
        if (mr === 0) return 0;
        var r = dot(v1, v2) / mr;
        if (r > 1) r = 1;
        return Math.acos(r);
    }

    function cross(v1, v2) {
        return v1.x * v2.y - v2.x * v1.y;
    }

    function getRotateAngle(v1, v2) {
        var angle = getAngle(v1, v2);
        if (cross(v1, v2) > 0) {
            angle *= -1;
        }

        return angle * 180 / Math.PI;
    }

    var HandlerAdmin = function(el) {
        this.handlers = [];
        this.el = el;
    };

    HandlerAdmin.prototype.add = function(handler) {
        this.handlers.push(handler);
    }

    HandlerAdmin.prototype.del = function(handler) {
        if(!handler) this.handlers = [];

        for(var i=this.handlers.length; i>=0; i--) {
            if(this.handlers[i] === handler) {
                this.handlers.splice(i, 1);
            }
        }
    }

    HandlerAdmin.prototype.dispatch = function() {
        for(var i=0,len=this.handlers.length; i<len; i++) {
            var handler = this.handlers[i];
            if(typeof handler === 'function') handler.apply(this.el, arguments);
        }
    }

    function wrapFunc(el, handler) {
        var handlerAdmin = new HandlerAdmin(el);
        handlerAdmin.add(handler);

        return handlerAdmin;
    }

    var AlloyFinger = function (el, option) {

        this.element = typeof el == 'string' ? document.querySelector(el) : el;

        this.start = this.start.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        this.cancel = this.cancel.bind(this);
        this.element.addEventListener("touchstart", this.start, false);
        this.element.addEventListener("touchmove", this.move, false);
        this.element.addEventListener("touchend", this.end, false);
        this.element.addEventListener("touchcancel", this.cancel, false);

        this.preV = { x: null, y: null };
        this.pinchStartLen = null;
        this.zoom = 1;
        this.isDoubleTap = false;

        var noop = function () { };

        this.rotate = wrapFunc(this.element, option.rotate || noop);
        this.touchStart = wrapFunc(this.element, option.touchStart || noop);
        this.multipointStart = wrapFunc(this.element, option.multipointStart || noop);
        this.multipointEnd = wrapFunc(this.element, option.multipointEnd || noop);
        this.pinch = wrapFunc(this.element, option.pinch || noop);
        this.swipe = wrapFunc(this.element, option.swipe || noop);
        this.tap = wrapFunc(this.element, option.tap || noop);
        this.doubleTap = wrapFunc(this.element, option.doubleTap || noop);
        this.longTap = wrapFunc(this.element, option.longTap || noop);
        this.singleTap = wrapFunc(this.element, option.singleTap || noop);
        this.pressMove = wrapFunc(this.element, option.pressMove || noop);
        this.touchMove = wrapFunc(this.element, option.touchMove || noop);
        this.touchEnd = wrapFunc(this.element, option.touchEnd || noop);
        this.touchCancel = wrapFunc(this.element, option.touchCancel || noop);

        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = { x: null, y: null };
    };

    AlloyFinger.prototype = {
        start: function (evt) {
            if (!evt.touches) return;
            this.now = Date.now();
            this.x1 = evt.touches[0].pageX;
            this.y1 = evt.touches[0].pageY;
            this.delta = this.now - (this.last || this.now);
            this.touchStart.dispatch(evt);
            if (this.preTapPosition.x !== null) {
                this.isDoubleTap = (this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30);
            }
            this.preTapPosition.x = this.x1;
            this.preTapPosition.y = this.y1;
            this.last = this.now;
            var preV = this.preV,
                len = evt.touches.length;
            if (len > 1) {
                this._cancelLongTap();
                this._cancelSingleTap();
                var v = { x: evt.touches[1].pageX - this.x1, y: evt.touches[1].pageY - this.y1 };
                preV.x = v.x;
                preV.y = v.y;
                this.pinchStartLen = getLen(preV);
                this.multipointStart.dispatch(evt);
            }
            this.longTapTimeout = setTimeout(function () {
                this.longTap.dispatch(evt);
            }.bind(this), 750);
        },
        move: function (evt) {
            if (!evt.touches) return;
            var preV = this.preV,
                len = evt.touches.length,
                currentX = evt.touches[0].pageX,
                currentY = evt.touches[0].pageY;
            this.isDoubleTap = false;
            if (len > 1) {
                var v = { x: evt.touches[1].pageX - currentX, y: evt.touches[1].pageY - currentY };

                if (preV.x !== null) {
                    if (this.pinchStartLen > 0) {
                        evt.zoom = getLen(v) / this.pinchStartLen;
                        this.pinch.dispatch(evt);
                    }

                    evt.angle = getRotateAngle(v, preV);
                    this.rotate.dispatch(evt);
                }
                preV.x = v.x;
                preV.y = v.y;
            } else {
                if (this.x2 !== null) {
                    evt.deltaX = currentX - this.x2;
                    evt.deltaY = currentY - this.y2;

                } else {
                    evt.deltaX = 0;
                    evt.deltaY = 0;
                }
                this.pressMove.dispatch(evt);
            }

            this.touchMove.dispatch(evt);

            this._cancelLongTap();
            this.x2 = currentX;
            this.y2 = currentY;
            if (len > 1) {
                evt.preventDefault();
            }
        },
        end: function (evt) {
            if (!evt.changedTouches) return;
            this._cancelLongTap();
            var self = this;
            if (evt.touches.length < 2) {
                this.multipointEnd.dispatch(evt);
            }

            //swipe
            if ((this.x2 && Math.abs(this.x1 - this.x2) > 30) ||
                (this.y2 && Math.abs(this.y1 - this.y2) > 30)) {
                evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
                this.swipeTimeout = setTimeout(function () {
                    self.swipe.dispatch(evt);

                }, 0)
            } else {
                this.tapTimeout = setTimeout(function () {
                    self.tap.dispatch(evt);
                    // trigger double tap immediately
                    if (self.isDoubleTap) {
                        self.doubleTap.dispatch(evt);
                        clearTimeout(self.singleTapTimeout);
                        self.isDoubleTap = false;
                    }
                }, 0)

                if (!self.isDoubleTap) {
                    self.singleTapTimeout = setTimeout(function () {
                        self.singleTap.dispatch(evt);
                    }, 250);
                }
            }

            this.touchEnd.dispatch(evt);

            this.preV.x = 0;
            this.preV.y = 0;
            this.zoom = 1;
            this.pinchStartLen = null;
            this.x1 = this.x2 = this.y1 = this.y2 = null;
        },
        cancel: function (evt) {
            clearTimeout(this.singleTapTimeout);
            clearTimeout(this.tapTimeout);
            clearTimeout(this.longTapTimeout);
            clearTimeout(this.swipeTimeout);
            this.touchCancel.dispatch(evt);
        },
        _cancelLongTap: function () {
            clearTimeout(this.longTapTimeout);
        },
        _cancelSingleTap: function () {
            clearTimeout(this.singleTapTimeout);
        },
        _swipeDirection: function (x1, x2, y1, y2) {
            return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down')
        },

        on: function(evt, handler) {
            if(this[evt]) {
                this[evt].add(handler);
            }
        },

        off: function(evt, handler) {
            if(this[evt]) {
                this[evt].del(handler);
            }
        },

        destroy: function() {
            if(this.singleTapTimeout) clearTimeout(this.singleTapTimeout);
            if(this.tapTimeout) clearTimeout(this.tapTimeout);
            if(this.longTapTimeout) clearTimeout(this.longTapTimeout);
            if(this.swipeTimeout) clearTimeout(this.swipeTimeout);

            this.element.removeEventListener("touchstart", this.start);
            this.element.removeEventListener("touchmove", this.move);
            this.element.removeEventListener("touchend", this.end);
            this.element.removeEventListener("touchcancel", this.cancel);

            this.rotate.del();
            this.touchStart.del();
            this.multipointStart.del();
            this.multipointEnd.del();
            this.pinch.del();
            this.swipe.del();
            this.tap.del();
            this.doubleTap.del();
            this.longTap.del();
            this.singleTap.del();
            this.pressMove.del();
            this.touchMove.del();
            this.touchEnd.del();
            this.touchCancel.del();

            this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.rotate = this.touchStart = this.multipointStart = this.multipointEnd = this.pinch = this.swipe = this.tap = this.doubleTap = this.longTap = this.singleTap = this.pressMove = this.touchMove = this.touchEnd = this.touchCancel = null;

            return null;
        }
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = AlloyFinger;
    } else {
        window.AlloyFinger = AlloyFinger;
    }
})();

/* transformjs
 * By dntzhang
 */
;(function () {

    var Matrix3D = function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        this.elements =window.Float32Array ? new Float32Array(16) : [];
        var te = this.elements;
        te[0] = (n11 !== undefined) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
        te[1] = n21 || 0; te[5] = (n22 !== undefined) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
        te[2] = n31 || 0; te[6] = n32 || 0; te[10] = (n33 !== undefined) ? n33 : 1; te[14] = n34 || 0;
        te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = (n44 !== undefined) ? n44 : 1;
    };

    Matrix3D.DEG_TO_RAD = Math.PI / 180;

    Matrix3D.prototype = {
        set: function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
            var te = this.elements;
            te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
            te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
            te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
            te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
            return this;
        },
        identity: function () {
            this.set(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
            return this;
        },
        multiplyMatrices: function (a, be) {

            var ae = a.elements;
            var te = this.elements;
            var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
            var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
            var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
            var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

            var b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
            var b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
            var b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
            var b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

            te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
            te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
            te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
            te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

            te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
            te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
            te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
            te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

            te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
            te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
            te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
            te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

            te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
            te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
            te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
            te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

            return this;

        },
        // 解决角度为90的整数倍导致Math.cos得到极小的数，其实是0。导致不渲染
        _rounded: function(value,i){
            i= Math.pow(10, i || 15);
            // default
            return Math.round(value*i)/i;
        },
        appendTransform: function (x, y, z, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ,skewX,skewY, originX, originY, originZ) {

            var rx = rotateX * Matrix3D.DEG_TO_RAD;
            var cosx =this._rounded( Math.cos(rx));
            var sinx = this._rounded(Math.sin(rx));
            var ry = rotateY * Matrix3D.DEG_TO_RAD;
            var cosy =this._rounded( Math.cos(ry));
            var siny = this._rounded(Math.sin(ry));
            var rz = rotateZ * Matrix3D.DEG_TO_RAD;
            var cosz =this._rounded( Math.cos(rz * -1));
            var sinz =this._rounded( Math.sin(rz * -1));

            this.multiplyMatrices(this, [
                1, 0, 0, x,
                0, cosx, sinx, y,
                0, -sinx, cosx, z,
                0, 0, 0, 1
            ]);

            this.multiplyMatrices(this, [
                cosy, 0, siny, 0,
                0, 1, 0, 0,
                -siny, 0, cosy, 0,
                0, 0, 0, 1
            ]);

            this.multiplyMatrices(this,[
                cosz * scaleX, sinz * scaleY, 0, 0,
                -sinz * scaleX, cosz * scaleY, 0, 0,
                0, 0, 1 * scaleZ, 0,
                0, 0, 0, 1
            ]);

            if(skewX||skewY){
                this.multiplyMatrices(this,[
                    this._rounded(Math.cos(skewX* Matrix3D.DEG_TO_RAD)), this._rounded( Math.sin(skewX* Matrix3D.DEG_TO_RAD)), 0, 0,
                    -1*this._rounded(Math.sin(skewY* Matrix3D.DEG_TO_RAD)), this._rounded( Math.cos(skewY* Matrix3D.DEG_TO_RAD)), 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                ]);
            }

            if (originX || originY || originZ) {
                this.elements[12] -= originX * this.elements[0] + originY * this.elements[4] + originZ * this.elements[8];
                this.elements[13] -= originX * this.elements[1] + originY * this.elements[5] + originZ * this.elements[9];
                this.elements[14] -= originX * this.elements[2] + originY * this.elements[6] + originZ * this.elements[10];
            }
            return this;
        }
    };

    function observe(target, props, callback) {
        for (var i = 0, len = props.length; i < len; i++) {
            var prop = props[i];
            watch(target, prop, callback);
        }
    }

    function watch(target, prop, callback) {
        Object.defineProperty(target, prop, {
            get: function () {
                return this["__" + prop];
            },
            set: function (value) {
                if (value !== this["__" + prop]) {
                    this["__" + prop] = value;
                    callback();
                }

            }
        });
    }

    var Transform = function (element) {

        observe(
            element,
            ["translateX", "translateY", "translateZ", "scaleX", "scaleY", "scaleZ" , "rotateX", "rotateY", "rotateZ","skewX","skewY", "originX", "originY", "originZ"],
            function () {
                var mtx = element.matrix3D.identity().appendTransform( element.translateX, element.translateY, element.translateZ, element.scaleX, element.scaleY, element.scaleZ, element.rotateX, element.rotateY, element.rotateZ,element.skewX,element.skewY, element.originX, element.originY, element.originZ);
                element.style.transform = element.style.msTransform = element.style.OTransform = element.style.MozTransform = element.style.webkitTransform = "perspective("+element.perspective+"px) matrix3d(" + Array.prototype.slice.call(mtx.elements).join(",") + ")";
            });

        observe(
            element,
            [ "perspective"],
            function () {
                element.style.transform = element.style.msTransform = element.style.OTransform = element.style.MozTransform = element.style.webkitTransform = "perspective("+element.perspective+"px) matrix3d(" + Array.prototype.slice.call(element.matrix3D.elements).join(",") + ")";
            });

        element.matrix3D = new Matrix3D();
        element.perspective = 500;
        element.scaleX = element.scaleY = element.scaleZ = 1;
        //由于image自带了x\y\z，所有加上translate前缀
        element.translateX = element.translateY = element.translateZ = element.rotateX = element.rotateY = element.rotateZ =element.skewX=element.skewY= element.originX = element.originY = element.originZ = 0;
    }

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = Transform;
    } else {
        window.Transform  = Transform;
    }
})();
/**
 * h5 viewer 
 * author teenhe
 */

(function(){

    // 比较两个数组是否完全相同  [1, 2, 1, 2].equals([1, 2, 1, 2]) === true;
    if(!Array.prototype.equals){
        Array.prototype.equals = function (array) {
            // if the other array is a falsy value, return
            if (!array)return false;
            // compare lengths - can save a lot of time 
            if (this.length != array.length)  return false;
            for (var i = 0, l=this.length; i < l; i++) {
                // Check if we have nested arrays
                if (this[i] instanceof Array && array[i] instanceof Array) {
                    if (!this[i].equals(array[i])) return false;       
                }           
                else if (this[i] != array[i]) { 
                    return false;   
                }           
            }       
            return true;
        }
    }
    
    var imageView = function(option){
        var defaults = option || {}
        //default setting andvalues
        this.initScale = 1;//初始化缩放比例
        this.Mask = document.getElementById('imgview_h5');//图片显示弹出层
        this.screenWidth = window.innerWidth || window.screen.availWidth;//获取屏幕宽度
        this.screenHeight = window.innerHeight || window.screen.availHeight;//获取屏幕高度
        this.imagelist = defaults.list || [];//image list
        this.currentIndex = defaults.index || 0;//current showPic of index value
        this.list = defaults.imgsNode || '';//列表
        this.ob = null;//当前展开的图片
        this.focused = null;//当前是否在焦点
        this.gap_item = defaults.gap || 30;//突破列表之间的间距
        this.pagetype = defaults.type || 'string';// number 为数字输出，字符串为列表
        this.render();
    }
    
    imageView.prototype = {
        //生成imgview dom
        render:function(){
            var list = this.imagelist;
            var len = list.length;
            if(len<1) return false;
            //创建视图遮罩层
            if(!this.Mask){
                var divMask = document.createElement('div');
                divMask.id="imgview_h5";
                document.body.appendChild(divMask);
                this.Mask = document.getElementById('imgview_h5');
            }
            //生成图片显示dom
            var html = '<ul class="imagelist">';
            for(var i=0;i<len;i++){
                html+='<li class="imagelist-item" style="margin-right:'+this.gap_item+'px;">'
                    +'<img src="'+list[i]+'" class="imagelist-item-img IV_imgview'+(i+1)+'" alt=""/></li>'
            }
            html+='</ul>'
            //当pagesize大于2时显示
            if(len>1){
                //page type
                if(this.pagetype == 'number'){
                    html +='<div className="page">'+(this.currentIndex + 1)+' / '+len+'</div>';
                }else{
                    html +='<ul class="pagelist">';
                    for(var n=0;n<len;n++)
                        html +='<li class="'+(n==this.currentIndex?'on':'')+'"></li>'
                    html +='</ul>'
                }
            }
            this.Mask.innerHTML = html;
           
        },
        showImgs:function(imgsArr,index,cb){
            if(typeof imgsArr =='string') imgsArr = [imgsArr];
            var oldarr = this.imagelist;
            if(!oldarr.equals(imgsArr)){//直接显示对应图片不需要生成dom
                this.imagelist = imgsArr;
                this.arrLength = imgsArr.length;
                this.render();
                this.list = this.Mask.querySelector('.imagelist');
                console.log("Transform(this.list);")
                debugger;
                Transform(this.list);
                console.log("Alloy init")
                var self = this;
                new AlloyFinger(this.Mask, {
                    singleTap:function(){
                        document.getElementById('imgview_h5').style.display="none";
                    },
                    pressMove:function(e){
                        var current = self.currentIndex;
                        self.endAnimation();
                        if( !self.focused ){
                            if((current === 0 && e.deltaX > 0) || (current === self.imagelist.length - 1 && e.deltaX < 0)){
                                self.list.translateX += e.deltaX / 3;
                            }else{
                                self.list.translateX += e.deltaX;
                            }
                        }
                        e.preventDefault();
                    },
                    swipe:function(e){
                        var direction = e.direction;
                        var current = self.currentIndex;
                        if( self.focused ){
                            return false;
                        }
                        switch(direction) {
                            case 'Left':
                                current < self.arrLength-1 && ++current && self.bindStyle(current);
                                break;
                            case 'Right':
                                current > 0 && current-- && self.bindStyle(current);
                                break;
                        }
                        self.changeIndex(current)
                    },
                    touchStart:function(){
                        self.focused = true;
                    },
                   touchEnd:function(e){
                       self.focused = false;
                   } 

                });
            }
            if(typeof index =='string'){
                index = this.imagelist.indexOf(index)
                console.log("pic of index",index);
                // if(index !=0){
                //     if((current === 0 && e.deltaX > 0) || (current === self.imagelist.length - 1 && e.deltaX < 0)){
                //         self.list.translateX += e.deltaX / 3;
                //     }else{
                //         self.list.translateX += e.deltaX;
                //     }
                // }
                
            }
            this.currentIndex = index || 0;
            this.changeIndex(index);
            cb && cb();


        },
        bindStyle:function(current){
            
            this.ob && this.restore();
            //设置样式
            if(this.Mask.style.display=='none') this.Mask.style.display = 'block';
            //设置样式变换
            this.ob = this.list.querySelector('.IV_imgview'+(current+1));
            if(this.ob && !this.ob.scaleX){
                var self = this;
                //绑定变换动画
                Transform(this.ob);
                this.imgloaded(this.ob);
                //绑定图片移动事件
                new AlloyFinger(this.ob,{
                    pressMove:function(evt){
                        var deltaX = evt.deltaX,
                            deltaY = evt.deltaY,
                            scaleX = self.ob.scaleX,
                            width = self.ob.width;
                        // isLongPic = self.ob.getAttribute('long'),
                        if(self.ob.scaleX <= 1 || evt.touches.length > 1){
                            return;
                        }

                        if(self.ob && self.checkBoundary(deltaX, deltaY)){
                            !isLongPic && (self.ob.translateX += deltaX);
                            self.ob.translateY += deltaY;
                            
                            if(isLongPic && scaleX * width === self.screenWidth){
                                self.focused = false;
                            }else{
                                self.focused = true;    
                            }
                        }else {
                            self.focused = false;
                        }
                    }
                })

            }
            // ease hide page number
           var pager = this.Mask.querySelector('.pagelist')
            if(pager){
                var items = this.Mask.querySelectorAll('.pagelist li');

                for (var i = 0,len = items.length; i < len; i++) {
                    if (i === current) {
                        items[i].classList.add("on");

                    } else {
                        items[i].classList.remove("on");
                    }
                }
            //    for(var i=0,len = pager.childNodes.length;i<len;i++){
            //        if(i == current) pager.childNodes[current].className = 'on';
            //        else pager.childNodes[current].className = '';
            //    }
            }
        },//关闭
        close:function(){
            this.divMask.style.display='none';
        },//展示
        show:function(){
            this.Mask.style.display='block';
        },
        //show index of picture
        changeIndex:function(current,ease=true){
            ease && (this.list.style.webkitTransition = '300ms ease');
            this.list.translateX = -current*(this.screenWidth + this.gap_item);
            if(current>=0 && current< this.imagelist.length)
                this.currentIndex = current;
            this.bindStyle(current);
            // this.changeIndex && this.changeIndex(current);        

        },//设置缩放
        setScale:function(size) {
            this.ob.style.webkitTransition = '300ms ease-in-out';
            this.ob.scaleX = this.ob.scaleY = size;
        },//充值变换样式
        restore:function(rotate=true) {
            this.ob.translateX = this.ob.translateY = 0;
            !!rotate && (this.ob.rotateZ = 0);
            this.ob.scaleX = this.ob.scaleY = 1;
            this.ob.originX = this.ob.originY = 0;
        },//动画效果结束
        endAnimation:function() {
            
            this.list.style.webkitTransition = '0';
            this.ob && this.ob.style && (this.ob.style.webkitTransition = '0');
        },
        //img样式loading
        imgloaded:function(el){
            // this.setState({ loaded: true });

            var target = el,
                h = target.naturalHeight,
                w = target.naturalWidth,
                r = h / w,
                height = window.innerHeight || window.screen.availHeight,
                width = window.innerWidth || window.screen.availWidth,
                rate = height / width;

            var imgStyle = {};

            if(r >= 3.5){
                // imgStyle.width = width + "px";
                // imgStyle.height = h * width / w + "px";
                target.setAttribute('long', true);
            }

            if(r > rate){
                imgStyle.height = height + "px";
                imgStyle.width = w * height / h + "px";
                imgStyle.left = width / 2 - (w * height / h) / 2 + "px";
            }else if( r < rate){
                imgStyle.width = width + "px";
                imgStyle.height = h * width / w + "px";
                imgStyle.top = height / 2 - (h * width / w) / 2 + "px"
            } else {
                imgStyle.width = width;
                imgStyle.height = height;
            }

            target.setAttribute('style', `width:${imgStyle.width}; height:${imgStyle.height}; left:${imgStyle.left}; top:${imgStyle.top};`);
            target.setAttribute('rate', 1/r);
        },
        //图片情况
        checkBoundary:function(deltaX = 0, deltaY = 0) {
            // var self = this;
            // console.log(self.ob.width, self.ob.height);
            var { scaleX, translateX, translateY, originX, originY, width, height } = this.ob,
                rate = this.ob.getAttribute('rate');

            if(scaleX !== 1 || scaleX !== rate){
                // include long picture
                var rangeLeft = (scaleX - 1) * (width / 2 + originX) + originX,
                    rangeRight = -(scaleX - 1) * (width / 2 - originX) + originX,
                    rangeUp = (scaleX - 1) * (height / 2 + originY) + originY,
                    rangeDown = -(scaleX - 1) * (height / 2 - originY) + originY;

                // console.log(rangeLeft, rangeRight, rangeUp, rangeDown);

                if(translateX + deltaX <= rangeLeft
                    && translateX + deltaX >= rangeRight
                    && translateY + deltaY <= rangeUp
                    && translateY + deltaY >= rangeDown ) {
                    return true;
                }
            }
            return false;
        }
        
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = imageView;
    } else {
        window.ImageView = imageView;
    }
})();