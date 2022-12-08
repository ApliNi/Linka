// 所有事件都在这里!

// 窗口尺寸变化事件
window.addEventListener('resize', function(){
	// 重新渲染位置
	$t.window.reRenderForWindowSize = true;
});

// 按键按下事件
document.onkeydown = function(event){
	_document_onkeydown(event);
};

// 按键松开事件
document.onkeyup = function(event){
	_document_onkeyup(event);
};

// 窗口失去焦点
window.onblur = function(){
	_window_onblur();
};

// 陀螺仪
window.addEventListener('deviceorientation', function(e){
	if($c.plugins?.sensor?.enable === true){
		_sensorFunc(1, e);
	}
}, false);

// 加速度
let $ccc = [27, 464];
window.ondevicemotion = (e) => {
	geb('ccc').innerHTML = e.acceleration.x +'<br>'+ e.acceleration.y +'<br>'+ e.acceleration.z;
	$ccc[0] += e.acceleration.y * 2;
	$ccc[1] += 0 - e.acceleration.x * 2;
	geb('cccc').style.left = $ccc[0] + 'px';
	geb('cccc').style.top = $ccc[1] + 'px';
};


