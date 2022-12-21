
## 循环模块
用于处理循环, 可异步运行(但需要自行处理滞后). 通过监听循环启动/停止或lib中的事件来启动自己的程序.
```js
// 循环启动
$e.loop.on('loopStart', ($funcStartTime) => {
	// 程序
});
```


### 格式
模块说明.
- `事件名`: 事件说明
	- `事件附加参数`: 参数说明


### 基础循环事件
系统循环事件.
- `loopStart`: 循环启动
	- `$funcStartTime`: 循环启动时间
- `loopEnd`: 循环结束 (不包括异步任务)
	- `$funcStartTime`: 循环启动时间


### Lib.遍历玩家
每次循环启动时运行, 同步运行.
- `ergodic_player`: 开始遍历一位玩家
	- `$funcStartTime`: 循环启动时间
	- `$player`: 当前玩家的数据
