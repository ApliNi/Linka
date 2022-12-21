
## 数据处理模块
数据处理模块需要先注册自己的事件名, 之后再监听, 否则将被视为无效数据.

```js
// 注册事件监听
db.add({type: 'player', name: 'playerMove'}, $c.Event);
```

```js
// 监听这个事件
$e.player.on('playerMove', ($eData, $tp, $player) => {
	// 程序
});
```
