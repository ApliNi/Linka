// 主程序的功能库
mainLib = {};


// ajax
mainLib.ajax = function ($url, back, $_errNum = 0){
	// 如果失败次数过多
	if($_errNum >= 4){
		if(back) back(false, undefined);
	}
	// 始终加载新版本
	if($config.forceUpdate === true){
		$url += '?&time='+ Date.now();
	}
	// AJAX
	let $xhr = new XMLHttpRequest();
		$xhr.open('get', $url);
		$xhr.send(null);
	$xhr.onload = function(){
		console.log('[AJAX] 文件加载成功: '+ $url);
		if(back) back(true, $xhr.responseText);
	}
	// 加载失败时重试
	$xhr.onerror = function(){
		console.log('[AJAX] 文件加载出错: '+ $url);
		// if(back) back(false, undefined);
		mainLib.ajax($url, back, $_errNum ++);
	}
	$xhr.onabort = function(){
		console.log('[AJAX] 文件加载终止: '+ $url);
		// if(back) back(false, undefined);
		mainLib.ajax($url, back, $_errNum ++);
	}
};


// 加载程序文件
mainLib.loadCode = function ($tp, back){
	// 始终加载新版本
	if($config.forceUpdate === true){
		$tp.url += '?&time='+ Date.now();
	}
	// 判断是css还是js
	// let $type = /[^\/\\\&\?\#]+\.([js|css]+)/g.exec($tp.url);
	// js
	if($tp.type === 'js'){
		// 创建script标签
		let $dom = document.createElement('script');
			$dom.type = 'text/javascript';
			$dom.src = $tp.url;
			$dom.onload = function(){
				console.log('[初始化] [模块] [JS ] 加载成功: ', $tp);
				// $e.system.emit('mainLib_loadCode_ok.', $tp);
				if(back) back(true, $tp);
			};
			$dom.onerror = function(){
				console.log('[初始化] [模块] [JS ] 加载失败: ', $tp);
				// $e.system.emit('mainLib_loadCode_err.', $tp);
				if(back) back(false, $tp);
			};
		document.documentElement.firstChild.appendChild($dom);
	}else
	// css
	if($tp.type === 'css'){
		let $dom = document.createElement('link');
			$dom.rel = 'stylesheet';
			$dom.href = $tp.url;
			$dom.onload = function(){
				console.log('[初始化] [模块] [CSS] 加载成功: ', $tp);
				// $e.system.emit('mainLib_loadCode_ok.', $tp);
				if(back) back(true, $tp);
			};
			$dom.onerror = function(){
				console.log('[初始化] [模块] [CSS] 加载失败: ', $tp);
				// $e.system.emit('mainLib_loadCode_err.', $tp);
				if(back) back(false, $tp);
			};
		document.getElementsByTagName('head')[0].appendChild($dom);
	}else{
		console.log('[初始化] [模块] ['+ $tp.type +'] 未知格式: ', $tp);
		// $e.system.emit('mainLib_loadCode_err.', $tp);
		if(back) back(false, $tp.url);
	}
};


// 启动器
mainLib.starter = function ($url, back){
	// 下载配置文件
	mainLib.ajax($url, ($s, $tp) => {
		if($s === true){
			$config.LinkaC = JSON.parse($tp);
			console.log('[初始化] [配置] 配置文件加载成功', $config.LinkaC);
			load_code_array();
		}else{
			console.log('[初始化] [配置] 配置文件加载失败 !');
			alert('配置加载失败\n  - 请尝试使用 Ctrl+F5 或清理此网页的缓存后刷新重试. ');
			back(false, '-1');
		}
	});

	// 加载模块文件
	function load_code_array(){
		console.log('[初始化] [模块] 开始加载模块...');
		let $num = 0;
		let $ok_num = 0;
		let $err = 0;
		// 遍历资源文件
		$config.LinkaC.plugins.forEach((e) => {
			// console.log('[初始化] [模块] 正在加载: '+ e);
			// 判断格式
			if(e?.url && e?.type && e?.info){
				$num ++;
				// 加载资源文件
				mainLib.loadCode(e, ($s) => {
					$ok_num ++;
					if($s === false) $err ++;
					// 全部加载完成
					if($ok_num === $num){
						// 如果有加载失败就返回 false 和数量
						if(back) back(($err === 0)? true : false, $err);
					}
				});
			}
		});
	}
};

