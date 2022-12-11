// 测试代码


function cc_遍历可视范围内的所有元素(){
	let $t = performance.now();
	// dom渲染范围 = 窗口范围 + 200
	let $renderRange = [
		0 - 200,
		0 - 200,
		getClientWidthHeight()[0] + 200,
		getClientWidthHeight()[1] + 200,
	];
	geb('background').childNodes.forEach(($0) => {
		if($0.localName === 'div'){
			// 获取元素绝对位置和宽高
			let $dom = $0.getClientRects()[0];
			// 如果元素宽或高为0
			if($dom.width === 0 || $dom.height === 0){
				let $wh = [
					$dom.width,
					$dom.height,
				];
				// 遍历它的子元素, 找出宽或高最大的一个
				$0.querySelectorAll('*').forEach((e) => {
					if(e.getClientRects()[0].width > $wh[0]){
						$wh[0] = e.getClientRects()[0].width;
					}
					if(e.getClientRects()[0].height > $wh[1]){
						$wh[1] = e.getClientRects()[0].height;
					}
				});
				// 应用元素尺寸
				$0.style.width = $wh[0] + 'px';
				$0.style.height = $wh[1] + 'px';
				console.log($wh);
			}

			// 元素尺寸
			let $place = [
				$dom.x,
				$dom.y,
				$dom.x + $dom.width,
				$dom.y + $dom.height,
			];

			// 元素是否与渲染范围重叠
			if(Math.min($place[2], $renderRange[2]) > Math.max($place[0], $renderRange[0])
			&& Math.min($place[3], $renderRange[3]) > Math.max($place[1], $renderRange[1])
			){
				// 添加边框
				$0.classList.add('---within');
			}else{
				$0.classList.remove('---within');
			}
		}

	});

	console.log('遍历所有元素, 耗时:', performance.now() - $t);
};

// cc_遍历所有元素_为其初始化宽高();
function cc_遍历所有元素_为其初始化宽高(){
	let $t = performance.now();

	geb('background').childNodes.forEach(($0) => {
		if($0.localName === 'div'){
			// 获取元素绝对位置和宽高
			let $dom = $0.getClientRects()[0];
			// 如果元素宽或高为0
			if($dom.width === 0 || $dom.height === 0){
				let $wh = [
					$dom.width,
					$dom.height,
				];
				// 遍历它的子元素, 找出宽或高最大的一个
				$0.querySelectorAll('*').forEach((e) => {
					if(e.getClientRects()[0].width > $wh[0]){
						$wh[0] = e.getClientRects()[0].width;
					}
					if(e.getClientRects()[0].height > $wh[1]){
						$wh[1] = e.getClientRects()[0].height;
					}
				});
				// 应用元素尺寸
				$0.style.width = $wh[0] + 'px';
				$0.style.height = $wh[1] + 'px';
				console.log($wh);
			}
		}

	});

};


// var demo3 = document.querySelector('#background');
// var observer = new IntersectionObserver((mutaions)=>{
// 	console.log(mutaions[0].isIntersecting);
// });
// observer.observe(demo3);
