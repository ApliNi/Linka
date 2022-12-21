// 所有需要用到的系统事件, 在这里封装


// 网页加载完成
window.onload = function (){
	$e.system.emit('window.onload');
};


// 窗口尺寸变化事件
window.addEventListener('resize', function (){
	$e.system.emit('window.resize');
});


// 按键按下事件
document.onkeydown = function (event){
	$e.system.emit('onkeydown', event);
	$e.system.emit('onkeydown.'+ event.code, event);
};


// 按键松开事件
document.onkeyup = function (event){
	$e.system.emit('onkeyup', event);
	$e.system.emit('onkeyup.'+ event.code, event);
};


// 窗口失去焦点
window.onblur = function (){
	$e.system.emit('window.onblur');
};


// 加速度
// let $ccc = [-42, 456];
// window.ondevicemotion = (e) => {
// 	geb('ccc').innerHTML = e.acceleration.x +'<br>'+ e.acceleration.y +'<br>'+ e.acceleration.z;
// 	$ccc[0] += e.acceleration.y * 2;
// 	$ccc[1] += 0 - e.acceleration.x * 2;
// 	geb('cccc').style.left = $ccc[0] + 'px';
// 	geb('cccc').style.top = $ccc[1] + 'px';
// };
