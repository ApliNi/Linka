# Linka.JS

![LinkaPEUI](https://cdn.ipacamod.cc/api/v3/file/get/8204/LinkaC%E7%A7%BB%E5%8A%A8%E7%AB%AF%E6%8C%89%E9%94%AE.png?sign=I2YsF73tlbZQkkQXJ6Ch9bHqHVqTT_cv9-oY_kVIskM%3D%3A0)

**在线预览: [https://ipacel.cc/array/_1/](https://ipacel.cc/Array/_1/)**  

尝试使用浏览器和Node.JS制作游戏. 正在进行中...  
- [x] 前端使用 HTML, CSS 渲染
- [x] 多平台支持
  - [x] PC端及操作方式
  - [x] 移动端及操作方式
    - [x] 摇杆和按钮
    - [x] 陀螺仪
    - [ ] 加速度计?
  - [ ] 字符界面终端及命令
- [x] 使用 Loki.JS 内存数据库进行实体索引
- [x] 使用 WebSocket 通讯
  - [x] 在网络循环中合并数据包并统一发送
  - [ ] JSON数据压缩或轻量化, 再或者一种更好的数据格式
- [ ] 实体剔除, 只渲染/计算可视范围内的元素
- [ ] 注册/登录系统, 以及服务端用户数据存储
  - [ ] 更详细的权限系统
  - [ ] 支持第三方登录, 如果必要
- [ ] 后端可自动扩展的多线程游戏循环, 和任务分配器
- [ ] 类似"频道"的虚拟服务器, 用于玩家之间联机
- [ ] 更好的通讯功能, 包含好友/聊天群等
  - [ ] 文件/图片/表情服务器, 通过CDN分发数据
  - [ ] 支持使用第三方消息推送服务
- [ ] 后端跨服务器同步内存数据, 支持NGINX负载均衡
  - [ ] 为此项目定制的网络防火墙以及用户行为异常检查
- [ ] IPv6下的客户端点对点传输数据?
- [ ] 实现上述计划 (= =;)


---


2022年12月15日的后端
```
[00:57:15 INFO]: [主线程] 服务器正在启动...
[00:57:15 INFO]: [信息] Node.js v18.12.1
[00:57:15 INFO]: [信息] LinkaS  v0.0.1
[00:57:15 INFO]: [信息] 服务器根目录: D:\IpacEL\Node.js\LinkaS
[00:57:15 INFO]: [信息] 服务器运行在生产环境中
[00:57:15 INFO]: [初始化] 初始化进程开始!
[00:57:15 INFO]: [初始化] [变量] 正在初始化全局变量...
[00:57:15 INFO]: [初始化] [内存数据库] 正在初始化内存数据库...
[00:57:15 INFO]: [初始化] [内存数据库] 正在创建基础数据和索引...
[00:57:15 INFO]: [初始化] [模块] 正在运行模块加载器...
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\npc\dev.js
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\npc\npc.js
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\npc\player.js
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\plugins\message.js
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\plugins\ping.js
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\plugins\playerMove.js
[00:57:15 INFO]: [初始化] [模块] [JS] 正在运行: config\plugins\reg.js
[00:57:15 INFO]: [初始化] 初始化进程结束! 耗时 14.781699999999546ms
[00:57:15 INFO]: [循环] 开始运行计时器...
[00:57:15 INFO]: [网络] 正在启动 WebSocket...
[00:57:15 INFO]: [网络] WebSocket 启动完成, 正在监听 2027端口
[00:57:15 INFO]: [主线程] 服务器启动完成! 耗时 64.47969999999623ms
[08:26:33 INFO]: [注册] 未命名玩家 正在注册...
[08:26:33 INFO]: [注册] 未命名玩家 分配基础数据: ID=lbocctkgotdy0r9ej, KEY=rekrdotwz0bhycglc
[08:26:33 INFO]: [注册] 未命名玩家 已加入服务器
```
