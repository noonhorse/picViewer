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