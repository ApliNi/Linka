// 主程序的功能库
mainLib = {};


// ajax
mainLib.ajax = function ($url, back, $_errNum = 0){
	// 如果失败次数过多
	if($_errNum >= 4){
		if(back) back(false, undefined);
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
mainLib.loadCode = function ($url, back){
	// 判断是css还是js
	let $type = /[^\/\\\&\?\#]+\.([js|css]+)/g.exec($url);
	if($type !== null && $type[1] !== undefined){
		$type = $type[1].toLowerCase();
		// js
		if($type === 'js'){
			// 创建script标签
			let $dom = document.createElement('script');
				$dom.type = 'text/javascript';
				$dom.src = $url;
				$dom.onload = function(){
					console.log('[初始化] [模块] [JS ] 加载成功: '+ $url);
					$e.system.emit('mainLib_loadCode_ok.'+ $url);
					if(back) back(true, $url);
				};
				$dom.onerror = function(){
					console.log('[初始化] [模块] [JS ] 加载失败: '+ $url);
					$e.system.emit('mainLib_loadCode_err.'+ $url);
					if(back) back(false, $url);
				};
			document.documentElement.firstChild.appendChild($dom);
		}else
		// css
		if($type === 'css'){
			let $dom = document.createElement('link');
				$dom.rel = 'stylesheet';
				$dom.href = $url;
				$dom.onload = function(){
					console.log('[初始化] [模块] [CSS] 加载成功: '+ $url);
					$e.system.emit('mainLib_loadCode_ok.'+ $url);
					if(back) back(true, $url);
				};
				$dom.onerror = function(){
					console.log('[初始化] [模块] [CSS] 加载失败: '+ $url);
					$e.system.emit('mainLib_loadCode_err.'+ $url);
					if(back) back(false, $url);
				};
			document.getElementsByTagName('head')[0].appendChild($dom);
		}else{
			console.log('[初始化] [模块] ['+ $type +'] 不支持的格式: '+ $url);
			$e.system.emit('mainLib_loadCode_err.'+ $url);
			if(back) back(false, $url);
		}
	}else{
		console.log('[初始化] [模块] [???] 正则匹配失败: '+ $url);
		$e.system.emit('mainLib_loadCode_err.'+ $url);
		if(back) back(false, $url);
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
			alert('配置加载失败\n请尝试使用 Ctrl+F5 或清理此网页的缓存后刷新重试. ');
		}
	});

	// 加载模块文件
	function load_code_array(){
		let $num = 0;
		// 遍历资源文件
		$config.LinkaC.file.forEach((e) => {
			console.log('[初始化] [模块] 正在加载: '+ e);
			// 加载资源文件
			mainLib.loadCode(e, ($s) => {
				if($s === true){
					$num ++;
					if($num >= $config.LinkaC.file.length){
						$e.system.emit('start_main_starter');
						if(back) back(true);
					}
				}else{
					$e.system.emit('end_main_starter');
					if(back) back(false);
				}
			});
		});
	}
};

