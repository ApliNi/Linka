
db.add([
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
							code: `$t.plugins.WASD.disable = true;`,
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
							code: `$t.plugins.WASD.disable = false;`,
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
]);
