###H5 viewer H5图片查看器
> dependon alloyteam's  alloyfinger and transformjs

##how to use
```html
<!-- 加载样式和js -->
<link type="text/css" rel="sheelt" src="index.css">
<script src="./dist/viewer.js"></script>
<script>
        var imgzoom = new ImageView();
        var con2 = document.body.querySelector('.imgContent2');
        var pic = con2.querySelector('.pic')
        // var imgzoom2 = new ImageView();
        pic.addEventListener('click',function(e){
             var src = e.target.getAttribute("src");
            imgzoom.showImgs(src,0);
        },false);
</script>
```

```css
/*img viewer css*/
    html,body,div,ul,li,a{padding:0;margin:0;}
    #imgview_h5.hide{opacity:0;transition:opacity 0.2s;-webkit-transition:opacity 0.2s;display:none;}
    #imgview_h5{position:fixed;top:0;bottom:0;left:0;right:0;width:100%;height:100%;z-index:900;background-color:#000;overflow:hidden;animation:easeshow 0.25s;}
    #imgview_h5 .page{font-family:-apple-system-font,'Helvetica Neue',Helvetica,STHeiTi,sans-serif;position:fixed;font-size:14px;color:#fff;padding:2px 5px;bottom:10px;left:50%;-webkit-transform:translatex(-50%);transform:translatex(-50%);-webkit-touch-callout:none;-webkit-user-select:none;}
    #imgview_h5 .pagelist{display:-webkit-box;-webkit-box-pack:center;-webkit-box-align:center;position:absolute;top:auto;right:0;bottom:0;left:0;margin:0 0 10px 0;width:100%;overflow: hidden;}
    #imgview_h5 .pagelist li{width:6px;height:6px;border-radius:3px; background:rgba(255,255,255,0.6);margin-left:10.66667px}
    #imgview_h5 .pagelist li:first-child{margin-left:0;}
    #imgview_h5 .pagelist .on{background:#fff;}
    #imgview_h5 .spinner{width:40px;height:40px;position:absolute;top:45%;left:50%;transform:translate(-50%,-50%);}
    #imgview_h5 .double-bounce1,#imgview_h5 .double-bounce2{width:100%;height:100%;border-radius:50%;background-color:#333;opacity:0.6;position:absolute;top:0;left:0;-webkit-animation:sk-bounce 2s infinite ease-in-out;animation:sk-bounce 2s infinite ease-in-out;}
    #imgview_h5 .double-bounce2{-webkit-animation-delay:-1s;animation-delay:-1s;}
    #imgview_h5 .errorpage{position:absolute;font-size:16px;text-align:center;color:#aaaaaa;top:28%;left:50%;margin-left:-70px;}
    #imgview_h5 .errorpage:before{content:'';display:block;width:150px;height:140px;margin:0 auto;padding-bottom:20px;background:url("data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20id='Page-1'%20stroke='none'%20stroke-width='1'%20fill='none'%20fill-rule='evenodd'%3E%3Cg%20id='Group-2'%20transform='translate(30.000000,%2030.000000)'%20fill='#BEBEBE'%3E%3Cpath%20d='M120,224%20C62.5631111,224%2016,177.436889%2016,120%20C16,62.5631111%2062.5631111,16%20120,16%20C177.436889,16%20224,62.5631111%20224,120%20C224,177.436889%20177.436889,224%20120,224%20L120,224%20Z%20M120,0%20C53.725,0%200,53.725%200,120%20C0,186.275%2053.725,240%20120,240%20C186.275,240%20240,186.275%20240,120%20C240,53.725%20186.275,0%20120,0%20L120,0%20Z'%20id='Fill-1'/%3E%3Cpath%20d='M112,56%20L112,140%20C112,144.418278%20115.581722,148%20120,148%20C124.418278,148%20128,144.418278%20128,140%20L128,56%20C128,51.581722%20124.418278,48%20120,48%20C115.581722,48%20112,51.581722%20112,56%20Z'%20id='Line'/%3E%3Ccircle%20id='Oval'%20cx='120'%20cy='171'%20r='9'/%3E%3C/g%3E%3C/svg%3E") no-repeat;background-size:100%;opacity:.4;}
    @keyframes easeshow{ from{opacity:0;}to{opacity:1;}}
    @-webkit-keyframes easeshow{ from{opacity:0;}to{opacity:1;}}
    #imgview_h5 .imagelist{display:-webkit-box;display:box;height:100%;list-style-type:none;-webkit-touch-callout:none;-webkit-user-select:none;}
    #imgview_h5 .imagelist .imagelist-item{display:-webkit-box;-webkit-box-pack:center;-webkit-box-align:center;width:100%;height:100%;text-align:center;position:relative;background-color:#000;overflow-y:scroll;}
    #imgview_h5 .imagelist .imagelist-item .imagelist-item-img{position:absolute;top:0;left:0;max-width:100%;-webkit-touch-callout:none;-webkit-user-select:none;}
    @-webkit-keyframes sk-bounce{ 0%,100%{-webkit-transform:scale(0);} 50%{-webkit-transform:scale(1);} }
    @keyframes sk-bounce{ 0%,100%{transform:scale(0);-webkit-transform:scale(0);} 50%{transform:scale(1);-webkit-transform:scale(1);} }

```