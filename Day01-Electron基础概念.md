# Electron + React开发仿Markdown云笔记本
## 项目概览

[Electron官网](https://www.electronjs.org/)

[React官方中文网](https://react.docschina.org/)：

**Electron**
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5cjhuod2j21es0megn8.jpg)

**React**
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5clv69yyj215y0iqabc.jpg)

**HOOKS**
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5coapyoej215q0gy76n.jpg)

**七牛云**
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5cpqqprtj214w0e8gmk.jpg)

**目标效果**
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5cy4d4v4j219a0u0dgs.jpg)
## 项目架构简介
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5ejlkstxj218a0u075u.jpg)

## 技术提升目标
1. Electron方面的收获  
+ Electron的基础知识以及各个内置模块的熟练应用
+ 深入了解浏览器工作原理
+ 理解进程概念和跨进程通信原理

2. React方面的收获  
+ 精通React内置的基本HOOK
+ 精通自定义HOOK的理念和写法
+ 融汇贯通React哲学

3. Node.js方面的收获
+ Node.js原生模块的学习
+ 加深Promise的理解和使用
+ 使用Axios和七牛云SDK完成HTTP请求
+ 原生JavaScript操作DOM的基础知识


## 知识点梳理
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5e3bqd5dj21f00u0mz8.jpg)

## 技术储备要求
- 掌握前端基本知识(ES6，CSS，HTML)
- 掌握React基础知识
- 使用过node.js和npm或者cnpm

## 项目演示


# 项目基础知识储备
## 什么是[Electron](https://www.electronjs.org/)？
![](https://tva1.sinaimg.cn/large/008eGmZEly1gn18pogg70j31fr0u0gnp.jpg)

## 配置Electron开发环境
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn12tramigj31he0io74s.jpg)

【准备工作】  
1. Windows系统下安装GitBash软件;Mac系统下自带终端;  
2. 安装Node.js环境(新版Node自带npm);  
3. 检查Node是否安装成功：

```shell script
node -v
```
4. 检查是否内置安装了npm：

```shell script
npm -v
```
5. 安装cnpm，指令： 

```shell script
npm install cnpm -g --registry=https://registry.npm.taobao.org
```
6. 检查是否安装了Git：

```shell script
git --version
```
7. 在桌面创建文件夹。比如：myproject  
8. 先进入到“myproject”文件中，再执行下面的指令克隆  
[electron-quick-start](https://www.electronjs.org/)模板代码：  

```shell script
git clone https://github.com/electron/electron-quick-start 
```
9. 进入该仓库：

```shell script
cd electron-quick-start
```
10. 安装依赖并运行：

```shell script
npm install && npm start
```
## 安装HBuilder软件  
将项目导入到HBuilder软件中，尝试编辑，如果存在权限问题，则可以修改整个项目文件夹的权限。指令：
```shell script
chmod -R 777 electron-quick-start
```

## Electron项目目录结构简介
<pre>
myproject  
   |_ /node_modules  
   |_ index.html
   |_ LICENSE.md
   |_ main.js
   |_ package.json
   |_ package-lock.json
   |_ preload.js
   |_ README.md
   |_ renderer.js
</pre>

## 进程和线程  
**什么是进程(Process)？**  
维基百科上的解释是：  
An instance of a computer program that is being executed

> Windows系统下可以打开“任务管理器”；Mac系统下可以输入关键词activity monitor进行搜索(command + F)，弹出“活动监视器”。如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn14or563mj317a0hy0u2.jpg)

> **什么是线程(Thread)？**  
线程是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。  

![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5h1l2jikj213m0iqwf9.jpg)

**进程和线程之间的区别**  
+ 内存使用方面的区别 
+ 通信机制方面的区别  
+ 量级方面的区别  

## 主进程和渲染进程  

> **主进程和渲染进程的理念**  

![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5hex5pe8j21300u0403.jpg)

通过“任务管理器”和“活动监视器”观察Google和Electron的主进程和渲染进程。如下：  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5hilae50j216o09074t.jpg)

**主进程(Main Process)的特点**
+ 可以使用和系统对接的Electron API - 创建菜单，上传文件等等  
+ 创建渲染进程 - Renderer Process
+ 全面支持Node.js
+ 只有一个，作为整个程序的入口点

**渲染进程(Renderer Process)的特点**
+ 可以有多个，每个对应一个窗口  
+ 每个都是一个单独的进程  
+ 全面支持Node.js和DOM API  
+ 可以使用一部分 Electron 提供的API

**主进程和渲染进程的异同**
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5hqazm56j21330u0n0u.jpg)

## 创建BrowserWindow对象  

在electron-quick-start项目中，每次修改main.js代码之后都需要重启一遍，比较麻烦，所以需要下载辅助工具，让开发者更轻松一些。推荐使用nodemon，地址：https://github.com/remy/nodemon  
nodemon可以监控文件的变化，然后自动地运行命令，这样可以省去很多关闭和重启的操作，安装指令：   

```javascript
npm install nodemon --save-dev
```

安装成功之后，在package.json文件中修改代码如下：  

```json
"scripts": {
    "start": "nodemon --watch main.js --exec \"electron .\""
  },
```
然后清空main.js文件，创建BrowserWindow对象，代码如下：  
```javascript
const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
  let mainWindow = new BrowserWindow({
    width: 1600,
    height: 1200,
    webPreferences: {
      // 让renderer Process中支持Node
      nodeIntegration: true
    }
  })
  // 让mainWindow加载index.html文件
  mainWindow.loadFile('index.html')
})
```
在终端运行指令：

```shell script
npm start
```
这样，我们的主窗口就被创建出来了。然后继续创建子窗口并加载出来，如下：  

```javascript
  // let secondWindow = new BrowserWindow({
  //   width: 400,
  //   height: 300,
  //   webPreferences: {
  //     nodeIntegration: true
  //   },
  //   parent: mainWindow
  // })
  // secondWindow.loadFile('second.html')
```
同时需要新建second.html文件，内容如下：  

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hello 2nd window!</title>
  </head>
  <body>
    <h1>Hello 2nd window!</h1>
  </body>
</html>

```
保存之后，无需重启，就可以出来效果了。

继续在index.html文件中添加如下代码：  

```javascript
<script src="./renderer.js"></script>
```
根据之前的知识，我们知道renderer.js中不仅可以使用Node.js的API，也可以使用DOM的事件。在renderer.js文件中，编写代码如下：  

```javascript
window.addEventListener('DOMContentLoaded', () => {
  // 同时使用了DOM和Node.js的API，是一种混合的写法
  document.getElementById('node-version').innerHTML = process.versions.node
})
```

## 进程间的通信概念

进程之间的通讯方式：  
Electron使用IPC(interprocess communication)在进程之间进行通讯
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5je7qfq6j213u0o2my4.jpg)

为了让流程和开发看起来更清晰，我们可以安装一个 Electron官方的插件 [Devtron](https://www.electronjs.org/devtron)。如图：  

![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5jkougrfj21by0ns0wp.jpg)

首先进入到项目目录下，安装Devtron 插件的指令：

```shell script
npm install devtron --save-dev
```
安装成功之后，如果想自动打开，可以在main.js中添加代码，如下：  

```javascript
require('devtron').install()
mainWindow.webContents.openDevTools()
```
保存之后，在终端运行，指令：  

```shell script
npm start
```
观察Devtron工具。 如图：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn29vftyxmj318m0g60v3.jpg)

## 使用IPC进行进程间的通信
【需求】在页面上添加一个按钮，点击按钮将事件发送到主进程，然后主进程进行回话，渲染进程再将主进程回话的消息输出到Web界面上。

在index.html文件中添加按钮，如下：  

```html
<button id="send">Send to main</button>
```
启动项目：

```shell script
npm start
```
然后在renderer.js中添加事件，如下：  

```javascript
const { ipcRenderer } = require('electron')

// 在事件监听的回调函数中添加代码：  
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('send').addEventListener('click', () => {
    ipcRenderer.send('message', 'hello from renderer')
  })
  ipcRenderer.on('reply', (event, arg) => {
    document.getElementById('message').innerHTML = arg
  })
})
```
同时在main.js文件中添加ipcMain，如下：  

```javascript
const { app, BrowserWindow, ipcMain } = require('electron')
```
并在ready监听中添加message监听，如下：  

```javascript
app.on('ready', () => {
ipcMain.on('message', (event, arg) => {
    console.log(event)
    console.log(arg)
    // 主进程回复renderer进程
    event.reply('reply', 'hello from main process')
  })
})
```
接下来我们打开Devtron工具，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn2algqiiej31oo0fcacu.jpg)
***
点击Send to main按钮，观察现象。
当主进程回复renderer进程之后，renderer进程要监听来自主进程的回复，并将主进程回复的信息渲染出来。在index.html文件中添加span标签，如下：

```html
<span id="message"></span>
```
最后，我们可以在Devtron工具中监测到IPC进行进程间通信的详细过程，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn2b34pmk9j31oo0g0tb6.jpg)

## 使用remote实现跨进程访问
假如我们希望在点击send按钮的时候弹出一个窗口，那么我们知道创建窗口是通过BrowserWindow完成的，而且BrowserWindow模块只有主进程才能调用，但是现在点击send按钮的操作是在renderer进程中完成的，那么如何在renderer进程中使用主进程中的模块呢？  
【答】通过renderer进程中的remote模块。

现在在renderer.js文件中添加代码，如下：  

```javascript
const { BrowserWindow } = require('electron').remote
```
然后就可以在renderer进程中使用主进程的BrowserWindow模块了，如下：  

```javascript
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('send').addEventListener('click', () => {
    let win = new BrowserWindow({ width: 800, height: 600 })
    win.loadURL('https://baidu.com')
  })
})
```
点击Send to main,发现【百度】窗口被打开了。这样，就使用最简单的方法，在Renderer process中调用了Main process的模块。

至此，Electron开源库的最核心的两大概念我们都有所了解了。





