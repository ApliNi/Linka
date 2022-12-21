
## 功能库


### log.js
用于按照统一的格式输出日志.
```js
// log = require($config.rootPath +'/lib/log.js'); // 无需引用

// INFO		// 普通消息. 白色
// PLAYER	// 由玩家引起的消息. 绿色
// WARN		// 警告. 黄色
// ERROR	// 错误, 抛出错误时请勿使用 log.js. 红色
log.out('INFO', '[主线程] 服务器正在启动...');
```


## db.js
对 Loki.js 操作的封装, 更简单的实现删查改写.

查询时默认选择"玩家表", 可修改.
```js
// db = require($config.rootPath +'/lib/db.js'); // 无需引用
```
查询数据
```js
// 查询语句, 此处表示查询 id = $tp.id 的玩家
const $where = {id: $tp.id};

// 返回玩家数据JSON
let $player = db.get($where);

// 返回多个数据, 使用数组
let $arr = db.get($where, true);

// 查询 $c.Event 表中的数据
let $event = db.get({type: 'player', name: e.type}, false, $c.Event);
```
判断数据是否存在
```js
let $if = db.getif({type: 'player', name: e.type}, $c.Event);
// $if = true | false
```
添加到数据库
```js
// 往实体表中添加一条数据
db.add({
	id: '玩家id',
	type: 'player',
	// ...
});

// 往实体表中添加多条数据
db.add([
	{id: '玩家id'},
	{id: '玩家id'},
	// ...
]);

// 往 $c.Event 表中添加数据
db.add({type: 'player', name: 'sendMessage'}, $c.Event);
```
更新数据
```js
// 查询一位玩家的数据
let $player = db.get({id: $tp.id});

// 修改坐标
$player.place = [0, 0, 0, 0, 0];

// 更新到数据库
db.up($player);
```
删除表中的数据
```js
// 删除实体表中的指定实体
db.del({id: $tp.id});
```


### lib.js
各种功能的整合.


### comm.js
用于运行指令.
```js
const comm = require($config.rootPath +'/lib/comm.js');

// 将指令消息转换为指令数组
let $messagee = '/tp name';
let $commMessage = $messagee.replace(/^\s*([\S\s]*?)\s*$/, '$1'); // 移除首尾空格
$commMessage = $commMessage.split(' ');

let $s = comm.run($commMessage, $执行指令的实体数据, $实体权限);

$s[0] // true | false // 指令运行是否成功
$s[1] // '将<玩家>传送到<玩家>' // 指令返回消息
```
