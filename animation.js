/**
 * Created by Administrator on 2017/3/5.
 */
var animation={
    options:{},//存储当前动画所需要的所有参数
    state:false,//存储当前动画运动状态
    animationQueue:[],//存储动画队列
    timing:function(m){
        "use strict";
        if(m){//根据传入参数判断，选择速率函数
            var fn;
            switch (m){
                case "liner"://如果为线性函数
                    fn=function(time,start,finsh,duration){
                        return (finsh-start)/duration*time;//返回线性算法的函数
                    }
                    break;
                default :
                    break;
            }
            return fn;
        }
    },
    analyze:function(css,value,item){
        "use strict";
        var vw=document.body.clientWidth;//获取当前屏幕宽度
        var vh=document.body.clientHeight||window.screen.height;//获取当前屏幕高度，如果没有指定bodyheight，那么获取屏幕分辨率高度
        if(value.indexOf('+')===-1&&value.indexOf('-')===-1){//判断该change属性是否为相对运动
            item.absolute[css]=true;//将该次css的名字存在绝对运动数组中
        }
        if(value.indexOf('vh')!==-1){
            value=parseFloat(value.replace('vh',''))*vh/100;//将vh单位转化为px单位
            if(isNaN(value)){//如果转换后的值不能转换为数字，那么传入参数有错误
                throw "eer+vh";
            }
            return value;//返回处理后的属性值
        }
        if(value.indexOf('vw')!==-1){
            value=parseFloat(value.replace('vw',''))*vw/100;//将vw单位转化为px单位
            if(isNaN(value)){
                throw "eer+vw";
            }
            return value;
        }
        if(value.indexOf('px')!==-1){
            value=parseFloat(value.replace('px',''));//如果为px单位，去掉px后必须能转换为数字，否则传入参数有错
            if(isNaN(value)){
                throw "eer+px";
            }
            return value;
        }
        if(!isNaN(parseFloat(value))){
            return parseFloat(value);//如果传入参数本身就是数字 ，那么无需处理直接返回
        }
        throw 'noeer';//如果上述都没处理属性值，那么参数错误
        return ;
    },
    copyNode:function(obj){//深复制，使用json复制，会将htmlcollection转为object
        "use strict";
        var names=Object.getOwnPropertyNames(obj);//根据传入的对象，获取对象属性名的集合（包括不可枚举的）组成的数组
        var i,newObj={};//创建一个新的对象，存储复制的对象
        for(i=0;i<names.length;i++){
            var des=Object.getOwnPropertyDescriptor(obj,names[i]);//遍历获取传入对象的属性值
            Object.defineProperty(newObj,names[i],des);//将该属性创建在新对象上
        }
        return newObj;//返回新对象
    },
    paused:function(playState){//用于暂停动画
        "use strict";
        if(playState){//根据参数用于暂停还是继续
            //如果暂停
            this.state=false;//将当前动画改为停止状态
            this.options.playState=true;//同时添加该次停止不是完成，而是暂停
        }
        else {
            //如果是继续
            if(this.options.playState){//判断当前次动画是否暂停
                //如果暂停
                this.state=true;//将当前动画改为运行状态
                this.options.playState=false;//将暂停状态改为没有
                this.options.start=Date.now()-this.options.del;//获取再次开始时间，并减去动画上次已经执行时间，
                this.goRun();//动画开始
            }
        }
    },
    copyStyle:function(dom){//获取该节点的初始Style
        "use strict";
        var style=getComputedStyle(dom,null);//获取传入节点的初始Style
        var prop,newStyle=[],res;
        for(prop in style){
            if(style.hasOwnProperty(prop)) {//遍历可枚举的属性，style中保存的状态为只读状态，可枚举的属性，保存着css属性名，方便遍历，原生js考虑的真的周全
                res=style[prop];//获得当前属性名
                newStyle[res]=style[res];//将属性值保存并返回
            }
        }
        return newStyle;
    },
    run:function(del){//一桢需要做的变换
        "use strict";
        var des,opt=this.options;//保存动画参数
        if(!opt.dom||!this.state){//判断动画是否执行完
            //执行完了就结束
            return;
        }
        for(var j=0;j<opt.dom.length;j++) {//遍历每个参与动画的节点，即传入的nodeList
            for (var i = 0; i < this.options.changeStyle.length; i++) {//遍历这个节点的所有需要变化的cssStyle
                des = this.options.changeStyle[i];//获取变化Style名称
                if(parseFloat(opt.dom[j].style[des].replace('px',''))>=parseFloat(opt.changeStyle[des])+parseFloat(opt.orginalStyle[j][des].replace('px', ""))||del>this.options.duration){//判断当前style是否完成动画，或是否已经达到动画执行时间
                    //如果完成动画
                    this.state=false;//将动画状态改为没有动画执行
                    return;//并返回
                }
                if(opt.absolute[des]){//查看该Style变化是否为绝对变化
                    //如果是
                    if(opt.orginalStyle[j][des].indexOf('px')!==-1){//判断该Style值是否需要添加单位px
                        opt.dom[j].style[des]=parseFloat(opt.orginalStyle[j][des].replace('px', ""))+opt.timing(del,parseFloat(opt.orginalStyle[j][des]),opt.changeStyle[des],opt.duration)+'px';//根据执行时间改变状态
                    }
                    else {
                        opt.dom[j].style[des]=parseFloat(opt.orginalStyle[j][des])+opt.timing(del,parseFloat(opt.orginalStyle[j][des]),opt.changeStyle[des],opt.duration);//根据执行时间改变此时Style
                    }
                    break;
                }
                else {
                    //如果是相对运动
                    opt.dom[j].style[des] = parseFloat(opt.orginalStyle[j][des].replace('px', "")) + opt.timing(del, 0, opt.changeStyle[des], opt.duration) + 'px';//根据执行时间改变此时Style
                }
            }
        }
    },
    goRun:function(){
        "use strict";
        var j,i,now=Date.now(),des;//now表示当前时间
        var del=now-this.options.start;//获取动画已经执行时间
        this.options.del=del;//将已执行时间保存
        if(this.state) {//判断本次动画是否完成，和前面的那个当前是否有动画在执行，前者包括后者
            requestAnimationFrame(this.goRun.bind(this));//没完成将继续执行动画
            this.run(del);
        }
        else if(!this.options.playState) {//判断动画是否被暂停了
            //如果动画没有被暂停
            //意味着动画已经结束，将动画最后一桢的状态改为，用户传入的参数
            if(this.options.fillMode==='forwards'){//查看最后一桢保持状态
                //如果为保持最后状态
                for(i=0;i<this.options.dom.length;i++){//遍历所有参与动画的节点
                    for(j=0;j<this.options.changeStyle.length;j++){//遍历每个节点要改变的Style
                        des=this.options.changeStyle[j];//获取该style的名称，如‘width’
                        if(this.options.absolute[des]){//判断这个cssStyle为相对运动还是绝对运动
                            //如果是绝对运动
                            if(this.options.orginalStyle[i][des].indexOf('px')!==-1){//判断cssStyle的值是否需要添加px，如width需要，opacity不需要
                                //如果需要
                                this.options.dom[i].style[des]=parseFloat(this.options.changeStyle[des])+'px';//添加px
                            }
                            else {
                                //如果不需要
                                this.options.dom[i].style[des]=parseFloat(this.options.changeStyle[des]);//一般为opacity
                            }
                            break;
                        }
                        else {
                            //如果是相对运动
                            this.options.dom[i].style[des] = parseFloat(this.options.orginalStyle[i][des].replace('px', '')) + parseFloat(this.options.changeStyle[des]) + 'px';//那么运动最后一桢状态为传入的参数加上节点初始状态
                        }
                    }
                };
            }else{
                //如果是回到初始状态
                for(i=0;i<this.options.dom.length;i++){//遍历所有参与动画的节点
                    for(j=0;j<this.options.changeStyle.length;j++){//遍历节点所有需要改变的Style
                        des=this.options.changeStyle[j];//获取Style名称
                        this.options.dom[i].style[des]=this.options.orginalStyle[i][des];//将该节点Style还原为初始状态
                    }
                };
            }
            var names=Object.getOwnPropertyNames(this.options);//获取这次动画参数的属性名集合，返回一个数组
            names.forEach(function(name){
                delete this.options[name];//根据传入的属性名，删除这一属性，从而清空这次option为下次动画准备
            }.bind(animation));//绑定this
            if(this.animationQueue.length>0){//判断动画队列是否还有动画需要执行
                //如果有动画需要执行
                this.state=true;//将动画状态改为有动画执行
                this.next(animation);//开始下次动画
            }
        }
    },
    next:function(){
        "use strict";
        var i;
        if(this.animationQueue.length>0){//查看当前动画队列是否还有需要执行的动画
           this.options=this.animationQueue.shift();//将这次要执行的动画参数弹出，并保存在option中
        }
        else {
            return;//没有就返回
        }
        for(i=0;i<this.options.dom.length;i++){
            this.options.orginalStyle[i]=this.copyStyle(this.options.dom[i]);//将要执行动画节点的当前状态保存到options
        }
        if(this.options.delay){//如果有延迟参数
            setTimeout(function(){//延迟动画执行
                this.options.start=Date.now();//保存动画开始时间
                this.goRun();//执行动画
            }.bind(this),this.options.delay);
        }else {
            this.options.start=Date.now();//保存动画开始时间
            this.goRun();//动画执行
        }

    },
    animation:function(dom,cssQueue,options){//解析传入的参数，并将该次传入的参数当做一次动画压入栈
        "use strict";
        if(dom&&cssQueue&&options&&options.duration) {//dom，cssQueue，duration为必填项
            var i, j = 0, item = {}, changeStyle = [];//item是存储该次动画的对象，传入的参数被解析后将当做它的属性被存储，changeStyle代表传入要改变的cssStyle的集合
            item.dom = dom;//dom为该次动画要改变的dom对象他是nodeList
            item.orginalStyle = [];//存储传入节点的初始style
            item.absolute={};//表示该次动画时相对运动，还是觉得运动，如+300px代表相对当前状态运动300px，
            for (i in cssQueue) {
                if (cssQueue.hasOwnProperty(i)) {//遍历cssQueue，选择cssQueue自己的属性
                    changeStyle[j] = i;//将属性名保存起来
                    changeStyle[i] = this.analyze(i,cssQueue[i],item);//将解析后的属性值保存起来
                    j++;
                }//将会得到一个类似css2Properties的数组，如["width"]同时有一个width的属性保存着它值
            }
            item.count=parseInt(options.count)||1;//获取重复次数，默认为1
            item.fillMode=options.fillMode||'forwards';//获取最后一桢状态，forwards代表保持最后一桢，afterwards代表保持初始状态，默认为forward
            item.duration = options.duration;//获取动画持续时间
            item.delay = options.delay;//获取动画延迟时间，默认没有
            item.timing = this.timing(options.timing || 'liner');//获取动画运行速率，默认为线性
            item.changeStyle = changeStyle;//保存要改变的css集合，包含属性名和属性值
            for(i=0;i<item.count;i++){
                item=this.copyNode(item);//深复制这次动画参数，并根据传入的重复参数，push到动画队列
                this.animationQueue.push(item);//将这次动画参数入栈
            }
            if (!this.state) {//判断当前是否有动画在运行
                this.state = true;//将当前动画状态改为正在运动
                this.next();//执行下一个动画
            }
            return this.animation.bind(this);//返回当前方法的对象，链式调用
        }
    }
}
module .exports={
    animation:animation.animation,
    paused:animation.paused
}