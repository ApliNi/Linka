// 日志库, 用于格式化日志后输出

function out($type, $log){

	if($type === 'INFO'){ // 普通消息
		console.log('\x1B[0m[' + _time() + ' INFO]: '+ $log +'\x1B[0m');
	}else

	if($type === 'PLAYER'){ // 由玩家发起的普通消息
		console.log('\x1B[92m[' + _time() + ' INFO]: '+ $log +'\x1B[0m');
	}else

	if($type === 'WARN'){ // 警告
		console.log('\x1B[93m[' + _time() + ' WARN]: '+ $log +'\x1B[0m');
	}else

	if($type === 'ERROR'){ // 错误
		console.log('\x1B[91m[' + _time() + ' ERROR]: '+ $log +'\x1B[0m');
	}
};


// 获取时间 时:分:秒
function _time(){
	let $t = new Date();
	return $t.getHours().toString().padStart(2, '0')
		+':'+
		$t.getMinutes().toString().padStart(2, '0')
		+':'+
		$t.getSeconds().toString().padStart(2, '0')
	;
};


module.exports = {
	out,
};
