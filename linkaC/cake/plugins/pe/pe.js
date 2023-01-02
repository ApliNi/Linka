
// 移动端操作支持
// js判断 和 url配置
if((lib.isPE() === true || lib.fromUrl('lib.isPE') === 'true') && lib.fromUrl('lib.isPE') !== 'false'){
	//阻止safari浏览器双击放大功能
	let lastTouchEnd = 0  //更新手指弹起的时间
	document.documentElement.addEventListener('touchstart', function (event){
		//多根手指同时按下屏幕，禁止默认行为
		if(event.touches.length > 1){
			event.preventDefault();
		}
	});
	document.documentElement.addEventListener('touchend', function (event){
		let now = (new Date()).getTime();
		if(now - lastTouchEnd <= 300){
			//当两次手指弹起的时间小于300毫秒，认为双击屏幕行为
			event.preventDefault();
		}else{ // 否则重新手指弹起的时间
			lastTouchEnd = now;
		}
	}, false);
	//阻止双指放大页面
	document.documentElement.addEventListener('gesturestart', function (event){
		event.preventDefault();
	});
	// 禁止页面滚动, 什么垃圾SAFARI
	// scrollTo(0, 0); // 防止页面在每次刷新中自动跑偏
	// document.addEventListener('touchmove', function(e){
	// 	// console.log(e.composedPath()[0].localName);
	// 	// 防止误伤非body元素
	// 	if(e.composedPath()[0].localName !== 'div') e.preventDefault();
	// window.scrollTo(0, 0);
	// }, {passive: false});
	window.addEventListener('scroll', function(e){
		e.preventDefault();
		window.scrollTo(0, 0);
	});

	// 禁用键盘, 改为摇杆
	$t.plugins.WASD.isKeyboard = false;

	// 加载其他代码
	mainLib.loadCode({url: 'cake/plugins/pe/pe.css?v=0.1.2', type: 'css', info: '移动端操作键的css'});
	mainLib.loadCode({url: 'cake/plugins/pe/sensor.js?v=0.1.2', type: 'js', info: '移动端传感器支持'});

	// 创建按键dom
	lib.geb('_plugins').innerHTML += `
		<!-- 方向键 -->
		<div id="plugins_WASD_box" class="WASD btn"></div>
		<!-- 其他按键 -->
		<div id="plugins_key_box">
			<!-- 聊天,实体列表,ESC,F3 -->
			<div class="bottom_box">
				<div>
					<div class="btn" data-code="Escape">ESC</div>
				</div>
				<div></div>
				<div>
					<!-- <div class="btn" data-code="F3">F3</div> -->
					<div class="btn" data-code="Tab">Tab</div>
					<div class="btn" data-code="KeyT">T</div>
				</div>
			</div>
			<!-- 确认键 -->
			<div class="enter_box">
				<div>
					<div class="btn" data-code="Enter"></div>
				</div>
			</div>
			<div class="right_box">
				<div>
					<button class="btn" onclick="if(lib.btnSS(this)){_sensor(true, this)}else{_sensor(false, this)}">陀螺仪</button>
					<div class="btn side" title="设置陀螺仪原点" data-onfunc="_sensorOrigin(true)" data-offfunc="_sensorOrigin(false)">R</div>
					<span class="text">[设置陀螺仪原点]<br />调整到合适的角度后松开按键</span>
				</div>
				<div>
					<!-- <button class="btn" onclick="lib.btnSS(this)">加速度</button> -->
				</div>
			</div>
		</div>
	`;

	// 获取摇杆中心坐标
	function rockerCoreSite(){
		let $0 = lib.geb('plugins_WASD_box');
		return [
			$0.offsetLeft + $0.scrollWidth / 2,
			0 - ($0.offsetTop + $0.scrollHeight / 2),
		];
	};

	// 处理移动和点击
	function _on(e){
		// 获取摇杆中心坐标
		let $o = rockerCoreSite();
		// 获取按下坐标
		let $xy = [
			e.changedTouches[e.changedTouches.length - 1].clientX,
			0 - e.changedTouches[e.changedTouches.length - 1].clientY,
		];

		// 通过触摸坐标和圆心计算角度
		let $a = 180 / Math.PI * Math.atan2($xy[0] - $o[0], ($xy[1] - $o[1]));
		//console.log($xy, $o, $a);
		// 应用偏航角
		$t.plugins.WASD.angle[0] = $a;

		// 计算按下坐标到摇杆中心的直线距离
		$a = Math.sqrt(Math.pow(Math.abs($xy[0]- $o[0]), 2) + Math.pow(Math.abs($xy[1]- $o[1]), 2));
		// 设置边界, 转换为0~1
		$a = Math.min($a, 64) / 64;
		// console.log($a);
		// 应用速度倍率
		$t.plugins.WASD.angle[2] = $a;
	};

	// 按键事件
	lib.geb('plugins_WASD_box').ontouchstart = function(e){
		//console.log('按下', e);
		_on(e);
		// 注册移动计算
		$t.plugins.WASD.enable = true;
	};
	lib.geb('plugins_WASD_box').ontouchmove = function(e){
		// console.log('移动', e);
		_on(e);
	};
	lib.geb('plugins_WASD_box').ontouchend = function(e){
		//console.log('松开', e);
		// 注销移动计算
		$t.plugins.WASD.enable = false;
	};

	// 其他按键
	lib.geb('plugins_key_box').ontouchstart = function(e){
		let $date = e.composedPath()[0].dataset;
		if($date?.code){
			$e.system.emit('onkeydown', $date);
			$e.system.emit('onkeydown.'+ $date.code);
		}else

		if($date?.onfunc){
			new Function($date.onfunc)();
		}
	};
	lib.geb('plugins_key_box').ontouchend = function(e){
		let $date = e.composedPath()[0].dataset;
		if($date?.code){
			$e.system.emit('onkeyup', $date);
			$e.system.emit('onkeyup.'+ $date.code);
		}else

		if($date?.offfunc){
			new Function($date.offfunc)();
		}
	};
}

