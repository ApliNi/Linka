
db.add([
	{
		id: 'npc3',
		type: 'npc',
		name: 'ApliNi',
		place_x: 465,
		place_y: -450,
		place: [465, -450, 0 , 52, 0],
		program: [
			{
				type: 'program',
				trigger_y: ['overlap'],
				mode: ['all'],
				program: [
					{type: 'text', text: ' [ ≥▽≤]// All, ALL!'},
				],
			},
			{
				type: 'program',
				trigger_y: ['attack'],
				mode: ['pointer'],
				program: [
					[// 0
						{
							type: 'js', // 禁用按键
							code: `$t.WASD.disable = true;`,
						},
						{
							type: 'animationLib',
							data: [
								{id: '主体放大', mode: true},
								{id: '上下黑边', mode: true},
							],
						},
						{type: 'text', text: '我有一整套完整的可扩展的设计, 不过没时间实现'},
						{
							// 修改样式
							type: 'js',
							code: `
								let $i = lib.geb($tp.id).getElementsByClassName('---img_nodejs')[0];
								$i.style.transition = 'transform 700ms 600ms';
								$i.style.transform = 'rotate(258deg)';
							`,
						},
					],
					[// 1
						{type: 'text', sudo_trigger_x: false},
						{type: 'text', sudo_npc_id: 'npc4', text: '你需要一个团队来实现(划掉)'},
					],
					[// 2
						{sudo_trigger_x: false, sudo_npc_id: 'npc4', type: 'text'},
						{type: 'text', text: '希望这个软件能撑到它需要美术的时候'},
					],
					[// 3
						{type: 'text', sudo_trigger_x: false},
						{type: 'text', sudo_npc_id: 'npc4', text: '希望这个软件能撑到它需要美术, 音效, 营销, 宣发的时候'},
						{
							// 修改样式
							sudo_npc_id: 'npc4',
							type: 'js',
							code: `
								let $i = lib.geb($tp.id).getElementsByClassName('---img_java')[0];
								$i.style.transition = 'transform 700ms 200ms, right 300ms';
								$i.style.transform = 'rotate(20deg)';
								$i.style.right = '30px';
								$i.style.animation = '700ms 500ms _all_上下抖动 forwards';
							`,
						},
					],
					[// 4
						{type: 'text', sudo_npc_id: 'npc4', sudo_trigger_x: false},
						{
							type: 'js', // 恢复按键
							code: `$t.WASD.disable = false;`,
						},
						{
							type: 'animationLib',
							data: [
								{id: '主体放大', mode: false},
								{id: '上下黑边', mode: false},
							],
						},
						{
							// 还原样式
							type: 'js',
							code: `
								let $i = lib.geb($tp.id).getElementsByClassName('---img_nodejs')[0];
								$i.style.transform = 'rotate(98deg)';
							`,
						},
						{
							// 还原样式
							sudo_npc_id: 'npc4',
							type: 'js',
							code: `
								let $i = lib.geb($tp.id).getElementsByClassName('---img_java')[0];
								$i.style.transform = 'rotate(0deg)';
								$i.style.right = '43px';
								$i.style.animation = 'none';
							`,
						},
					]
				],
			}
		],
		style: [
			{
				type: 'addDom',
				dom: `<img class="---img_nodejs" style="width: 47px;height: 47px;position: relative;top: -5px;right: -25px;transform: rotate(98deg);" src="https://cdn.ipacamod.cc/api/v3/file/get/8133/nodejs.png?sign=7uLV8TcBBjgH-JVjCDul7FnOm4REIhZ4W5Rtf9-ykj4%3D%3A0">`,
			}
		],
	},
	{
		id: 'npc4',
		type: 'npc',
		name: 'villager',
		place_x: 640,
		place_y: -450,
		place: [640, -450, 0 , 294, 0],
		program: [
			{
				type: 'program',
				trigger_y: ['overlap'],
				mode: ['all'],
				program: [
					{type: 'text', text: '=^_^= 提供算法和方案上的帮助'},
				],
			},
			{
				type: 'program',
				trigger_y: ['attack'],
				mode: ['pointer'],
				program: [
					[// 0
						{
							type: 'js', // 禁用按键
							code: `$t.WASD.disable = true;`,
						},
						{
							type: 'animationLib',
							data: [
								{id: '主体放大', mode: true},
								{id: '上下黑边', mode: true},
							],
						},
						{type: 'text', text: '计算的话, 非用开方不可'},
					],
					[
						{type: 'text', sudo_trigger_x: false},
						{
							type: 'js', // 恢复按键
							code: `$t.WASD.disable = false;`,
						},
						{
							type: 'animationLib',
							data: [
								{id: '主体放大', mode: false},
								{id: '上下黑边', mode: false},
							],
						},
					]
				],
			},
		],
		style: [
			{
				type: 'addDom',
				dom: `<img class="---img_java" style="width: 47px;height: 47px;position: relative;top: -8px;right: 43px;" src="https://cdn.ipacamod.cc/api/v3/file/get/8132/java.png?sign=rKQucdvhr3FDVxrc_uDsb37698_0KllTJHF4ggt5rgY%3D%3A0">`,
			}
		],
	},
]);
