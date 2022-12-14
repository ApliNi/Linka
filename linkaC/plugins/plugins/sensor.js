// 传感器控制

function _sensor($mode, $this){
	// 初始化
	if(!$c.plugins?.sensor){
		$c.plugins.sensor = {
			enable: false,
			gyro: { // 陀螺仪传感器
				reset_ing: false,	// 校准模式, 启动后始终进行校准
				reset_ok: false,	// 启动时校准一次, 关闭时撤销
				origin: [0, 0, 0],	// 自定义原点
				screen_orientation: 0,	// 屏幕方向, 0=正常横屏, 1=往另一个方向横屏
			},
		};
	}
	// 权限申请
	let $p = false;
	function sensorPermissionApplication(back){
		// IOS 传感器
		if(typeof DeviceOrientationEvent.requestPermission === 'function'){
			DeviceOrientationEvent.requestPermission().then((p) => {
				if(p === 'granted'){
					$p = true;
					back();
				}
			});
		}else
		// 其他
		{
			$p = true;
			back();
		}
	};

	// Main
	sensorPermissionApplication(() => {
		if($mode === true){ // 按钮按下
			if($p === true){
				console.log('传感器权限申请成功');
				$c.plugins.sensor.enable = true;
				$this.classList.add('-pok'); // 橙色按钮
			}else{
				console.log('传感器权限申请失败');
				// 恢复按钮状态, 关闭使能
				$c.plugins.sensor.enable = false;
				$c.plugins.sensor.gyro.reset_ok = false;
				btnSS($this);
			}
		}else{
			$c.plugins.sensor.enable = false;
			$t.WASD.enable = false;
		}
	});
};

function _sensorFunc($mode, e){
	let $cc = $c.plugins.sensor.gyro;
	// 传感器类型
	if($mode === 1){ // 陀螺仪
		// 根据屏幕方向获取数组
		function getXYZ(){
			// a=, b=-左+右, g=+上-下
			if($cc.screen_orientation === 0){
				return [e.alpha, e.beta, e.gamma];
			}else if($cc.screen_orientation === 1){
				return [e.alpha, e.beta, 0 - e.gamma];
			}else if($cc.screen_orientation === 2){
				return [e.alpha, e.gamma, e.beta];
			}else if($cc.screen_orientation === 3){
				return [e.alpha, e.gamma, 0 - e.beta];
			}
		};

		//console.log(e.alpha, e.beta, e.gamma);
		// 重置原点, 按下按钮时会运行一遍
		if($cc.reset_ing === true || $cc.reset_ok === false){
			// 判断横竖屏
			// 0=普通横屏, 1=反向横屏, 2=普通竖屏, 3=反向竖屏
			if(window.matchMedia('(orientation: portrait)').matches === false){ // 横屏
				$cc.screen_orientation = (e.gamma < 0)? 0 : 1;
			}else{ // 竖屏
				$cc.screen_orientation = (e.beta > 0)? 2 : 3;
			}

			$cc.origin = getXYZ();
			$cc.reset_ok = true;
			return;
		}

		let $e = getXYZ();
		// 应用自定义原点
		$e = [
			$e[0] - $cc.origin[0],
			$e[1] - $cc.origin[1],
			$e[2] - $cc.origin[2],
		];
		// 如果任意一个角度偏转大于抖动范围
		if(Math.abs($e[1]) > 3 || Math.abs($e[2]) > 2){
			// 注册移动计算
			$t.WASD.enable = true;
			// 通过触摸坐标和圆心计算角度
			let $a = 180 / Math.PI * Math.atan2($e[1], ($e[2]));
			//console.log($a);
			// 应用偏航角
			$t.WASD.angle[0] = $a;

			// 通过摆动幅度计算速度倍率 // 设置边界, 转换为0~1
			$a = Math.min(Math.max(Math.abs($e[1]) - 3, Math.abs($e[2]) - 2), 10) / 10;
			// 应用速度倍率
			$t.WASD.angle[2] = $a;
		}else{
			// 注销移动计算
			$t.WASD.enable = false;
		}
	}else

	if($mode === 2){ // 加速度计

	}

};

// 重置当前位置为原点
function _sensorOrigin($mode){
	if($c.plugins?.sensor?.enable === true){
		$c.plugins.sensor.gyro.reset_ing = $mode;
	}
};
