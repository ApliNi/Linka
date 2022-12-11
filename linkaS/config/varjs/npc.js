
db.add([
	{
		id: 'npc1',
		type: 'npc',
		name: '碰撞触发: 显示随机文本. 攻击触发: 显示过场动画',
		place_x: 200,
		place_y: 200,
		place: [200, 200, 0 , 32, 0],
		program: [ // program_id[0]
			{
				type: 'program',
				trigger_y: ['overlap'],
				// mode: ['all'],
				// __already: false,
				// loop: true,
				program: [ // program_id[1]
					{
						type: 'text',
						mode: '随机',
						//place: 'npc_top',
						text: [
							"We are here Forever, Ipacamod-server",
							"山川异域, 风月同天",
							"[ ≥▽≤]//[=^_^=]",
							"我们还在尝试改进, 在这一个孤独的服务器",
							"\"当你拥有了一切, 你也将失去尝试新东西的动力, 并体会到一种前所未有的孤独\"",
							"这个指令出乎意料的掉进了水中",
							"我们至今都不知道狐狸说了什么",
							"高性能的服务器. 日复一日的高性能",
							"Ipacamod支持IPv6网络!!",
							"能在繁忙的系统里抢到优先级不是容易的",
							"今天也是高性能的一天",
							"你找到了我! Ipacamod服务器",
							"结束时, 另一个重复将会开始",
							"\"望着星空的我们\"",
							"欢迎加入Ipacamod服务器",
						],
					},
				],
			},
			{
				type: 'program',
				trigger_y: ['attack'],
				mode: ['pointer'],
				// __pointer: 0,
				// loop: true,
				program: [
					[ // 0
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
						{type: 'text', text: '你看见了几条消息?'},
					],
					{type: 'text', text: '错, 是三条'},
					[// 2
						{type: 'text', sudo_trigger_x: false},
						{
							type: 'animationLib',
							data: [
								{id: '主体放大', mode: false},
								{id: '上下黑边', mode: false},
							],
						},
						{
							type: 'js', // 恢复按键
							code: `$t.WASD.disable = false;`,
						},
					],
				]
			},
		],
	},
	{
		id: 'npc2',
		type: 'npc',
		name: '符 号 看 象 限 🙏',
		place_x: 500,
		place_y: 200,
		place: [500, 200, 0 , 32, 0],
		program: [
			{
				type: 'program',
				trigger_y: ['overlap'],
				program: [
					{type: 'text', text: 'welcome ~'},
				]
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
						{type: 'text', text: '人在学校，没法带参观了'},
					],
					{type: 'text', text: '昨天刚复课'},
					{type: 'text', text: '（悲'},
					{type: 'text', text: '服务器内聊天信息前加#会被bot同步到群内'},
					{type: 'text', text: '例如 #123'},
					{type: 'text', text: '/warp展示地标菜单'},
					{type: 'text', text: '/fly 飞行'},
					{type: 'text', text: '官网上有很详细的介绍'},
					[
						{type: 'text', text: '总之玩得开心🙏'},
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
				]
			}
		]
	},
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
								let $i = geb($tp.id).getElementsByClassName('---img_nodejs')[0];
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
								let $i = geb($tp.id).getElementsByClassName('---img_java')[0];
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
								let $i = geb($tp.id).getElementsByClassName('---img_nodejs')[0];
								$i.style.transform = 'rotate(98deg)';
							`,
						},
						{
							// 还原样式
							sudo_npc_id: 'npc4',
							type: 'js',
							code: `
								let $i = geb($tp.id).getElementsByClassName('---img_java')[0];
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
	{
		id: 'npc5',
		type: 'npc',
		name: 'rotate3d test',
		place_x: 1137,
		place_y: -217,
		place: [1137, -217, 0 , 294, 0],
		program: [
			{
				type: 'program',
				trigger_y: ['attack'],
				mode: ['pointer'],
				program: [
					{
						type: 'js',
						code: `
							geb('logo-en').style.transform = 'rotate3d(-3, -2, 2, 306deg)';
							geb('logo-en').style.width = '692px';

							geb('logo-zh').style.transform = 'rotate3d(-3, 3, 1, 319deg)';
							geb('logo-zh').style.position = 'absolute';
							geb('logo-zh').style.width = '640px';
							geb('logo-zh').style.top = '-113px';
							geb('logo-zh').style.left = '358px';
						`,
					},
					{
						type: 'js',
						code: `
							geb('logo-en').style.transform = '';
							geb('logo-en').style.width = '';

							geb('logo-zh').style.transform = '';
							geb('logo-zh').style.position = 'absolute';
							geb('logo-zh').style.width = '';
							geb('logo-zh').style.top = '0';
							geb('logo-zh').style.left = '1100px';
						`,
					},
				],
			},
		],
	},
	{
		id: 'npc6',
		type: 'npc',
		name: '#二仙桥大爷',
		place_x: -2292,
		place_y: 53,
		place: [-2292, 53, 0 , 0, 0],
		program: [
			{
				type: 'program',
				trigger_y: ['attack'],
				mode: ['pointer'],
				program: [
					[
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
						{type: 'text', mode: 'default_addp', addp: 'clear_pre'},
						{type: 'text', text: '...'},
					],
					{type: 'text', text: '我问你, 你该走哪?', sudo_npc_id: 'npc7'},
					{type: 'text', text: '到二仙桥'},
					{type: 'text', text: '我是说你该走哪根道?', sudo_npc_id: 'npc7'},
					{type: 'text', text: '走成华大道'},
					{type: 'text', text: '...', sudo_npc_id: 'npc7'},
					{type: 'text', text: '你这车子, 你这车子能拉吗?', sudo_npc_id: 'npc7'},
					{type: 'text', text: '只能拉一点点儿'},
					{type: 'text', text: '拉一点点儿'},
					{type: 'text', text: '我是问你能不能拉?', sudo_npc_id: 'npc7'},
					{type: 'text', text: '能, 只能拉一点点儿, 不能拉多了'},
					{type: 'text', text: '你看你.. 我都被你搞糊涂了, 师傅', sudo_npc_id: 'npc7'},
					[
						{type: 'text', sudo_trigger_x: false, sudo_npc_id: 'npc7'},
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
	},
	{
		id: 'npc7',
		type: 'npc',
		name: '#谭警光',
		place_x: -2157,
		place_y: 53,
		place: [-2157, 53, 0 , 0, 0],
		program: [],
	},
	{
		id: 'npc8',
		type: 'npc',
		name: '未命名路人',
		place_x: -814,
		place_y: 0,
		place: [-814, 0, 0 , 0, 0],
		program: [
			{
				type: 'program',
				trigger_y: [['overlap', true], ['attack']],
				mode: ['pointer'],
				program: [
					[
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
						{type: 'text', text: '嘿! 你撞到我了!'},
					],

					{type: 'text', text: '...'},
					{type: 'text', text: '...'},
					{type: 'text', text: '你怎么不说话'},
					[
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
			{
				type: 'program',
				trigger_y: ['overlap', false],
				mode: ['all'],
				program: [
					{type: 'text', sudo_trigger_x: false},
				],
			},
		],
	},
	{
		id: 'npc9',
		type: 'npc',
		name: '药水商人',
		place_x: -34,
		place_y: -179,
		place: [-34, -179, 0 , 0, 0],
		program: [
			{
				type: 'program',
				trigger_y: ['overlap'],
				program: [
					{
						type: 'text',
						mode: '随机',
						//place: 'npc_top',
						text: [
							'早上好, 中午好, 以及晚上好',
							'看看有什么需要的吧',
							'您好, 买?',
							'别担心, 消费能促进这个世界的进步',
							'嗯哼',
							'有备无患, 有备无患啊朋友',
						],
					},
				],
			},
			{
				type: 'program',
				trigger_y: ['attack'],
				mode: ['pointer'],
				program: [
					[
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
						{
							type: 'js', // 初始化商人计数器
							code: `if($d.npc?.npc9 === undefined) $d.npc.npc9 = {sellOut: false}`,
						},
						{
							type: 'program',
							program: [
								{type: 'text', text: '想体验一下我们的新产品吗?'},
							],
						},
					],
					[
						{type: 'text', text: '放心, 是免费的'},
						{
							type: 'decision',
							mode: true,
							data: [
								{id: 1, text: '收下'},
								{id: 2, text: '拒绝'},
								{id: 3, text: '钝角'},
							],
						},
					],
					[
						{type: 'decision', mode: false},
						{
							type: 'program',
							trigger_x: `$t.npc_func.decision.id == 1`,
							program: [
								{
									type: 'js', // 修改移动速度, 更新商品计数器
									code: `
										$t.WASD.stepSize = 32;
										$d.npc.npc9 = true;
									`,
								},
								{type: 'text', text: '感觉如何(╹ڡ╹ )'},
							],
						},
						{
							type: 'program',
							trigger_x: `$t.npc_func.decision.id == 2`,
							program: [
								{
									type: 'js', // 恢复移动速度
									code: `$t.WASD.stepSize = 13`,
								},
								{type: 'text', text: '欢迎下次光临~'},
							],
						},
						{
							type: 'program',
							trigger_x: `$t.npc_func.decision.id == 3`,
							program: [
								{type: 'text', text: '哎呀'},
							],
						},
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
					],
				],
			},
		],
	}
]);
