# taAnimation

js实现css3动画的所有功能

##描述
   他与jQuery动画是不同的，它使用的requestanimationframe，同时它又实现jQuery的队列动画模式，支持链式调用，最重要CSS3动画参数真的非常好用，他也有css3提供了所有参数设定，每次动画完成都会css3动画完成的回调。
   提供相对运动绝对运动两种方式，300px代表运动到300px位置，+（-）300px相对当前位置运动300px距离。
###额外
文件内有非常详细的注释。
###例子
```
var node=document.queryselectorAll('div');
animation(node,{left:300px，opacity：0.5}，{duration：4000，delay：2000，timing：'liner',count:3,fillmode:'forwards'},callback};
animation.playState(false)//暂停动画，true重新开始动画
```
