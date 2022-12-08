// 传感器控制

function _sensor($mode, $this){
	// 初始化
	if(!$c.plugins?.sensor){
		$c.plugins.sensor = {
			enable: false,
			gyro: {
				reset_ing: false,
				origin: [0, 0, 0],
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
				btnSS($this);
			}
		}else{
			$c.plugins.sensor.enable = false;
			$t.WASD.enable = false;
		}
	});
};

function _sensorFunc($mode, e){
	// 传感器类型
	if($mode === 1){ // 陀螺仪
		//console.log(e.alpha, e.beta, e.gamma);
		// 原点重置模式
		if($c.plugins.sensor.gyro.reset_ing === true){
			$c.plugins.sensor.gyro.origin = [e.alpha, e.beta, e.gamma];
		}
		// 应用自定义原点
		let $e = [
			e.alpha - $c.plugins.sensor.gyro.origin[0],
			e.beta - $c.plugins.sensor.gyro.origin[1],
			e.gamma - $c.plugins.sensor.gyro.origin[2],
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
