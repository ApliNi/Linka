
log.out('INFO', '[循环] 开始运行计时器...');

// tps循环
setInterval(function(){
	let $funcStartTime = Date.now();

	// 循环开始
	$e.loop.emit('loopStart', $funcStartTime);

	// 循环结束
	$e.loop.emit('loopEnd', $funcStartTime);

	$c.system.mspt = Date.now() - $funcStartTime;
}, $config.mspt_main);
