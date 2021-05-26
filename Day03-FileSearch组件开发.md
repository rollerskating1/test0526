# 项目原型图和需求分析
## 项目原型设计图 

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn824dkj16j312s0pq0u2.jpg)  

## 模块划分

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn82746psyj312y0q00u5.jpg)  

## 全局需求分析
+ 原生菜单，通过菜单和快捷键可以新建，保存，搜索文件  
+ 持久化数据，保存文件在本地文件系统

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn7sj0j4waj317g0gok0v.jpg)  

## 需求分类

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn82drh8czj314a0mudio.jpg)

# 将UI拆分成组件
## React哲学
React哲学是React官方推荐的React开发的思考方式。 [React哲学](https://react.docschina.org/docs/thinking-in-react.html)  
第一步：将设计好的UI划分为组件层级  
第二步：创建应用的静态版本  
第三步：...  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn82go99hnj31380q2dht.jpg)

## 配置开发环境
我们之前用create-react-app创建了react的开发环境，用Electron的官方Demo案例单独配置了开发环境，那么现在需要将React项目和Electron项目结合在一起。该怎么做呢？我们知道，React在本地启动的是localhost:3000的网址，Electron在创建BrowserWindow的时候是可以读取本地的文件或者URL的。那么我们让Electron创建Main Process的时候，读取本地的localhost:3000的网址即可。但是注意：在开发环境下是加载这个localhost:3000的网址，如果是在生产环境下，我们需要加载打包成型以后的本地文件。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn82jy2ooij314e0ekmxw.jpg)

## 配置步骤
1. 创建react项目  
   在GitBash(或者终端)命令行环境中进入到Desktop(桌面)或者进入到某个桌面文件夹中，执行指令：npx create-react-app + 工程名称  如下：  


```shell  script
# 进入到桌面
cd Desktop
# 查看Node版本号
node -v
# 创建react项目
npx create-react-app myproject
```
> 项目创建成功以后，先进入到项目中，执行：  

```shell script
# 进入工程目录
cd myproject
```

2. 安装electron

```shell script
# 安装electron，如果无法安装，
# 还可以尝试在CMD环境下安装。
npm install electron --save-dev  或者
cnpm install electron --save-dev 或者
sudo cnpm install electron --save-dev
```
3. 将创建好的myproject项目拖入编辑器中  
如果项目无法拖入到编辑器中或者拖入以后无法编辑，那么这可能是因为创建好的项目是只读权限。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn7u3mktaaj30zo0cadgc.jpg)

> 我们可以先回到父级目录，修改myproject文件夹的权限为777(可读可写可执行)。指令如下：  

```shell script
# 回到上一级目录：
cd ..
# 修改文件夹权限：
chmod -R 777 myproject
```
4. 创建main.js文件并编辑

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn7ug21yj8j312u0l6755.jpg)

> 如果想判断是生产环境还是开发环境，那么可以安装一个叫做electron-is-dev的插件，执行指令：  

```shell script
cnpm install electron-is-dev --save
```
> 编辑代码如下：  

```javascript
const { app, BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 680,
    webPreferences: {
      // 设置node可用
      nodeIntegration: true,
      // 如果不设置的话，则后面remote不能获取到
      enableRemoteModule: true
    }
  })
  const urlLoaction = isDev ? 'http://localhost:3000' : 'dummyurl'
  mainWindow.loadURL(urlLoaction)
})

```
> 在package.json文件中，添加如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn7vanixixj313s0mwgmv.jpg)

> 在scripts中，添加一个命令如下：   

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn83ekzg94j30vy0awaae.jpg)

5. 如果想运行项目，那么需要开启两个命令行窗口。在第一个窗口中执行：

```shell script
npm start
```
> 在第二个窗口中执行:  

```shell script
npm run dev
```
> 如果项目运行成功，则会出现如下的图片：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn83krc7skj30vk0nqtaa.jpg)

## 存在的问题与改进
1. 改进

 > 项目虽然运行成功了，但是还存在一些问题比较麻烦。比如程序退出的时候到底是哪个程序退出了并不明确，显示比较混乱。同时我们需要开启两个terminal窗口，一个执行启动react的任务，另一个执行启动electron的任务，同时还必须要求localhost:3000启动起来以后才能启动electron，非常麻烦。那么我们需要把两个指令集成到一个指令中完成，如下：  
 
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn84cp3u49j30z00ckt96.jpg)

> 再次运行指令，如下：   
```shell script
npm run dev
```

> 终端的运行信息如下：    
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn84sptr12j316i0gqwf6.jpg)

> 此时，项目运行成功，一般会出现白屏，那么我们需要刷新一下才可以出现react的Logo。刷新的快捷键，在windows下可以使用F5,在Mac下可以使用command+R。  

2. 新的问题

> 当前虽然运行成功，但是当前的命令不是跨平台的，windows下面存在问题，可能出现Bug。而且如果直接关闭窗口，那么3000的端口会被占用掉。如图：    

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn85uaxd5oj316w0h80tf.jpg)

> 我们还需要手动清除掉这些被占用的端口。如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn8607jxugj31700dcdgj.jpg)

> 杀死进程的指令如下：  

```shell script
kill -9 7641
```
3. 尝试解决  

> 为了解决上述存在的缺点，我们推荐一款叫做[concurrently](https://www.npmjs.com/package/concurrently) 的工具。concurrently是同时、同步的意思。它唯一的目的就是一次可以完美地运行多个命令(跨平台)。我们在工程目录下安装，安装指令：  

```shell script
npm install concurrently --save-dev
```
> 安装完毕之后，修改scripts脚本，如下:  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn86l6549zj31560as3yx.jpg)

> 再次运行项目，指令：  

```shell script
npm run dev
```
4. 成功运行以后，再次退出项目的时候，这个时候哪条指令退出是有明确的提示的，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn8xz5pqusj31660daaan.jpg)

> 但是我们发现，虽然浏览器成功出现了Logo，但是原生BrowserWindow窗口却是白屏，需要刷新以后才可以出现Logo。原因就在于此时的electron先执行了启动指令，此时localhost:3000还没启动起来，之后electron一直在等待localhost:3000先启动起来(却没有发出第二次查询)，所以需要刷新一次才可以出现(相当于发出第二次查询)。为了解决这个问题，我们再引入一个叫做[wait-on](https://www.npmjs.com/package/wait-on)的小工具。安装指令：  

```shell script
npm install wait-on --save-dev
```
> 然后我们再次改进scripts脚本，如下：  

```json
"dev": "concurrently \"wait-on http://calhost:3000   
&& electron .\" \"npm start\""
```
> 重新运行项目，指令如下：  

```shell script
npm run dev
```
> s这个时候，不用刷新，浏览器和原生窗口效果都能成功地运行出来效果了，如下：  

**浏览器效果**

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn8ysqvkqlj315i0u03zi.jpg)

**原生窗口效果**

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn8ytakbujj31590u0q3i.jpg)

5. 继续强迫症  

> 我们发现浏览器窗口和原生窗口显示的内容是一样的，我们现在的目的是做原生跨平台程序，那么浏览器上的显示我们就不需要了啊。每次手动关闭很麻烦。其实create-react-app这个脚手架工具为我们提供了一个特殊的环境变量，它可以给系统或者应用程序设置了一些参数来执行特定的操作，比如有一个环境变量叫做BROWSER。如果将这个环境变量设置为none，那么在启动的时候就可以不打开浏览器。 

> 但是在Windows和Mac/Linux平台下，环境变量的体制是不同的，所以又涉及到跨平台的问题。我们再次推荐一个叫做[cross-env](https://www.npmjs.com/package/cross-env)的小工具。这个cross-env就是专门解决环境变量跨平台的问题的。首先安装：  

```shell script
npm install cross-env --save-dev
```
> 然后打开package.json文件继续修改scripts脚本，如下：  

```json
"dev": "concurrently \"wait-on http://localhost:3000   
&& electron .\" \"cross-env BROWSER=none npm start\""
```
> 再次运行，执行指令：  

```shell script
npm run dev
```
> 这次就能够不打开浏览器，只启动原生窗口了。
效果如下：    

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn8zg9jzioj30sm0xwjrx.jpg)

## 代码结构分析
<pre>
myproject
    |_ /node_modules
    |_ public
        |_ favicon.ico
        |_ index.html
        |_ logo192.png
        |_ logo512.png
        |— manifest.json
        |_ robots.txt
    |_ src
        |_ App.css
        |_ App.js
        |_ App.test.js
        |_ index.css
        |_ index.js
        |_ logo.svg
        |_ reportWebVitals.js
        |_ setupTests.js
    |_ main.js
    |_ package.json
    |_ package-lock.json
    |_ README.md
</pre>

那么是否有一种推荐的方式来组织React的项目文件结构呢？  
[项目文件结构](https://zh-hans.reactjs.org/docs/faq-structure.html)
现在我们在src目录下新建一个components文件夹，在该文件夹下，我们可以放置JS文件和CSS文件，比如： 
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn911hlzgbj30xq044jra.jpg)

再在src目录下创建hooks文件夹，然后在hooks文件夹下创建相应的Hook文件。比如：useHook.js

## 代码规范检查
在create-react-app中自带了Eslint的代码规范检查，它自带了一系列的规则来检查大家写的react代码。参考：  [eslint-config-app](https://www.npmjs.com/package/eslint-config-react-app)
这个就是React使用的Eslint的规则。

# 为项目选择样式库
## 安装bootstrap
我们使用大名鼎鼎的[Bootstrap](https://getbootstrap.com/docs/4.3/layout/overview/)来作为我们项目的样式库，使用样式库可以大大减少开发的时间。首先安装，执行指令：    

```shell script
npm install bootstrap --save
```
然后在App.js文件中引入，如下：  

```javascript
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
```
启动项目，执行指令：  

```shell script
npm run dev
```
观察现象，可以看到原生窗口的两侧出现了白色的空白部分，说明Bootstrp生效了。

## 使用bootstrap
在App.js文件中，可以将header标签全部删除，然后给div添加一个叫做container-fluid的class，可以参考之前的项目原型图编辑代码:  


```javascript
function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
      <div className="col-3 bg-danger left-panel">
        <h1>this is the left</h1>
      </div>
      <div className="col-9 bg-primary right-panel">
        <h1>this is the right</h1>
      </div>
      </div>
    </div>
  );
}
```
保存后运行，观察效果。

# 左侧面板开发
## FileSearch组件
1. 分析文件搜索组件的属性  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn92woaiqrj313w0c4q47.jpg)

2. 分析文件搜索组件的状态  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn92xnnh1qj30jo0jm0sz.jpg)

3. 编辑代码  
在components下将ComponentName.js文件修改成具体的FileSearch.js文件。先引入依赖，然后编码：  

```javascript
  import React, { useState } from 'react'
  
  const FileSearch = ({ title, onFileSearch }) => {
    const [ inputActive, setInputActive ] = useState(false)
    const [ value, setValue ] = useState('')
  
  return (
    <div className="alert alert-primary">
      { !inputActive &&
        <>
          <span>{ title }</span>
          <button type="button"
            className="btn-primary"
          >
            搜索
          </button>
        </>
      }
    </div>
  )
}

export default FileSearch

```
> 在App.js中引入，如下：  

```javascript
import FileSearch from './components/FileSearch'
function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col-3 bg-light left-panel">
          <FileSearch 
            title="我的云文档"
            onFileSearch={() => {}}
          />
        </div>
        <div className="col-9 bg-primary right-panel">
          <h1>this is the right</h1>
        </div>
      </div>
    </div>
  );
}
```
4. Flex布局  
运行项目后我们发现，样式被挤到一起了。如图：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn94721xsyj31l006cwei.jpg)

> 那么我们需要对元素进行布局，传统的布局基于盒模型，但是有缺陷，W3C提供了一种新的解决方案，叫做 [Flex](https://getbootstrap.com/docs/4.3/utilities/flex/)布局。它可以简便、完整实现响应式的各种布局。Flex布局是未来的首选方案。编辑代码：  

```javascript
  import React, { useState } from 'react'
  
  const FileSearch = ({ title, onFileSearch }) => {
  const [ inputActive, setInputActive ] = useState(false)
  const [ value, setValue ] = useState('')
  
  return (
    <div className="alert alert-primary d-flex   
    justify-content-between align-items-center">
      { !inputActive &&
        <>
          <span>{ title }</span>
          <button type="button"
            className="btn-primary"
          >
          搜索
          </button>
        </>
      }
    </div>
  )
}

export default FileSearch

```
> 观察效果，如下：    

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn94jeb3jkj319o0760sq.jpg)

5. 点击搜索按钮  
当我们点击搜索按钮的时候，我们需要将inputActive的值变成true，此时代码编辑成如下：  

```javascript
  import React, { useState } from 'react'
  
  const FileSearch = ({ title, onFileSearch }) => {
    const [ inputActive, setInputActive ] = useState(false)
    const [ value, setValue ] = useState('')
  
  return (
    <div className="alert alert-primary d-flex justify-content-between align-items-center">
      { !inputActive &&
        <>
          <span>{ title }</span>
          <button type="button"
            className="btn btn-primary"
            onClick={() => { setInputActive(true) }}>
            搜索
          </button>
        </>
      }
      { inputActive && 
        <>
          <input className="form-control col-8" 
            value={value}
            onChange={ (e) => { setValue(e.target.value) } } />
          <button type="button"
            className="btn btn-primary col-4"
            onClick={ () => setInputActive(true) }>
            关闭
          </button>
        </>
      }
    </div>
  )
}

export default FileSearch

```
> 点击搜索按钮，出现搜索框，如下：   

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn95fwoqftj31aq064749.jpg)
但是为了左右宽度相同，便于我们观察，我们首先将左右的宽度调整成相同。在App.js文件中编辑如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn95pbiibcj30zc0u0wft.jpg)
效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn95r8rqncj31ky06kq2x.jpg)

6. 添加键盘响应事件  

**需求一**：当我们按Enter键的时候开始搜索，按Esc键的时候退出搜索模式。从基础知识的Hook中我们知道，这需要添加Effect，我们在鼠标跟踪器里面已经做过类似的需求。

在FileSearch.js文件中，编辑代码如下：

```javascript
import React, { useState, useEffect } from 'react'
  
const FileSearch = ({ title, onFileSearch }) => {
  const [ inputActive, setInputActive ] = useState(false)
  const [ value, setValue ] = useState('')

  // 定义方法closeSearch
  const closeSearch = () => {
    setInputActive(false)
    // 清空
    setValue('')
    // 搜索一次空字符串,使得原来的文件恢复
    onFileSearch('')
  }
  
  useEffect(() => {
    const handleInputEvent = (event) => {
      const { keyCode } = event
      if(keyCode === 13 && inputActive){
        onFileSearch(value)
      }else if(keyCode === 27 && inputActive){
        closeSearch(event)
      }
    }
    document.addEventListener('keyup', handleInputEvent)
    return () => {
      document.removeEventListener('keyup', handleInputEvent)
    }
  })
  
  return (
    <div className="alert alert-primary d-flex  
    justify-content-between align-items-center">
      { !inputActive &&
        <>
          <span>{ title }</span>
          <button type="button"
            className="btn btn-primary"
            onClick={() => { setInputActive(true) }}>
            搜索
          </button>
        </>
      }
      { inputActive && 
        <>
          <input className="form-control col-8" 
            value={value}
            onChange={ (e) => { setValue(e.target.value) } } />
          <button type="button"
            className="btn btn-primary col-4"
            onClick={ closeSearch }>
            关闭
          </button>
        </>
      }
    </div>
  )
}

export default FileSearch

```
在App.js文件中，代码修改成：  

```html
<FileSearch 
    title="我的云文档"
    onFileSearch={(value) => {console.log(value)}}
/>
```
运行项目，点击搜索按钮之后再按Esc按键看是否可以关闭。在输入框中输入一些信息之后，按Enter键看是否能够输出到控制台。查看原生窗口控制台的方法和浏览器下是一样的，Windows下按F12或者右键审查元素，Mac系统下option+command+I快捷键。

**需求二**：当input出现的时候，自动focus。我们使用useRef完成这个功能。
当我们点击“搜索”按钮的时候，弹出了input输入框，但是没有为我们自动获取焦点，需要人为手动地获取焦点，比较麻烦。那么我们需要先认识一个新的叫做 [useRef](https://zh-hans.reactjs.org/docs/hooks-reference.html#useref)的Hook。  
useRef 返回一个可变的 ref 对象，其 .current 属性被初始化为传入的参数（initialValue）。返回的 ref 对象在组件的整个生命周期内保持不变。
这个怎么理解呢？  
其实在Components函数当中，每次组件重新渲染创造新的变量。新的变量和之前的变量之间没有任何关系。但是呢，useRef给我们一种神奇的魔力。让我们在不同的渲染之间记住渲染的值。
在FileSearch.js文件中编辑代码，如下：  

```javascript
let node = useRef(null)
```
同时进行如下的属性设置：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn972gfmddj31b20buaad.jpg)

当我们以这种属性的形式传入组件的时候，不论我们的节点怎么改变，react都会将useRef对象的current属性设置为响应的DOM节点，那么就可以在current属性上取得DOM节点了。其实这个时候要设置一个focus也是一个Effect副作用。所以我们可以再添加一个useEffect。在FileSearch.js文件中编辑代码如下：  

```javascript
useEffect(() => {
    // 当点击"搜索"的时候才调用focus
    if(inputActive){
      // 自动获取焦点
      node.current.focus()
    }
    // 只有当inputActive改变的时候才重新执行useEffect
  }, [inputActive])
```
运行项目，我们点击搜索按钮，发现input自动获取了焦点。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn97dlsu05j315g072q2u.jpg)

但是，其实useRef还可以胜任很多情况下不同的case场景。不仅仅能够完成这里使用到的记住DOM节点的功能。
7. 小结

我们本小节完成了两个功能，一个是完成了响应键盘的事件，另一个是完成了input自动获取焦点的功能。同时附带学习了一个新的Hook，即useRef。






