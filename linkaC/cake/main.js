// 主程序
$config = {
	// 启动时的相对时间
	startTime: performance.now(),
	// LinkaC.json 配置文件
	LinkaC: 'LinkaC.json',

	// 强制下载新版本的模块
	forceUpdate: true,
};


// 启动开始, 等待页面加载完成
new Promise(function(resolve, reject){
	// 页面加载完成
	$e.system.on('window.onload', () => {
		resolve();
	});
})

// 等待用户填充信息
.then(function(){return new Promise(function(resolve, reject){
	if(true){
		resolve();
	}
})})

// 下载配置文件并运行启动器
.then(function(){return new Promise(function(resolve, reject){
	console.log('[主程序] 初始化开始...');
	$e.system.emit('start_main_starter');
	mainLib.starter($config.LinkaC, ($s, $num) => {
		if($s === false){
			console.log('[初始化] [模块] '+ $num +' 个模块加载失败 !');
			alert($num +' 个模块加载失败, 您可以选择继续运行\n  - 若影响使用, 请尝试 Ctrl+F5 或清理此网页的缓存后刷新重试. \n  - 若错误依旧, 请尝试更换网络环境');
		}
		console.log('[主程序] 初始化结束, 耗时 '+ (performance.now() - $config.startTime) +'ms');
		$e.system.emit('end_main_starter');
		resolve();
	});
})})

// 启动worker模块
.then(function(){return new Promise(function(resolve, reject){
	$w.run();
	$e.system.on('worker_on', () => {
		resolve();
	});
})})

// 启动完成
.then(function(){
	
});
