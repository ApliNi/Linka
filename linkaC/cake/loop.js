// tps循环和用户操作循环


// tps循环
$c.loop.tps_func = function (){
	let $loopStartTime = Date.now();

	$e.system.emit('tps.loopStart', $loopStartTime);

	$c.time.mspt_tps = Date.now() - $loopStartTime;
};


// ui循环
$c.loop.ui_func = function (){
	let $loopStartTime = Date.now();

	$e.ui.emit('ui.loopStart', $loopStartTime);

	$c.time.mspt_ui = Date.now() - $loopStartTime;
};


// 循环管理器
$c.loop.run = function ($name, $mode){
	if($mode === true){
		if($name === 'tps'){
			$c.loop.tps = setInterval($c.loop.tps_func, $c.loop.tps_time);
		}else if($name === 'ui'){
			$c.loop.ui = setInterval($c.loop.ui_func, $c.loop.ui_time);
		}
	}else{
		if($name === 'tps'){
			clearInterval($c.loop.tps);
		}else if($name === 'ui'){
			clearInterval($c.loop.ui);
		}
	}
};
