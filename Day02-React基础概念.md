# React基础
## React简介和缘起
[React官方中文文档网](https://react.docschina.org/)  

[React官网(英文版)](https://reactjs.org/)

React的特点：  
+ 声明式写法
+ 组件化
+ 一次学习, 随处编写

为什么要学习React？
+ 大厂加持
+ 简单易懂
+ 最流行 使用人数最多

![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5m5xzg8nj21ay0k6766.jpg)

![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5m7rhxhaj21c40j4dhq.jpg)

## 配置React开发环境
1. 使用 [create-react-app脚手架](https://github.com/facebook/create-react-app) 创建React项目，执行指令：  
 
```shell script
npx create-react-app react-hooks
【注意】这里的react-hooks是自定义的项目名
```

2. [npx和npm的区别](https://baijiahao.baidu.com/s?id=1654960283811569273&wfr=spider&for=pc)  

> 【比如】想调用之前安装的nodemon查看版本号, 有两种方式：  
+ 在项目目录下执行：node_modules/.bin/nodemon --version  
+ 使用npx直接执行：npx nodemon --version 
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn35kw41mfj30xm08c75k.jpg)

3. 当react-hooks项目创建好之后，需要先进入到该目录：

```shell script
cd react-hooks
```
4. 观察package.json文件的内容：  

```json
{
  "name": "react-hooks",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "axios": "^0.19.0",
    "react": "^16.8.6",
    "react-dom": "^16.8.6",
    "react-scripts": "3.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

```
5. 启动react项目指令：

```shell script
npm start
```
6. 在浏览器的地址栏输入：localhost:3000 + 回车  

> 当出现如下图所示的图片，就表示React项目运行成功了。  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn361c1jqbj31jx0u0jub.jpg)
***
7. 简单分析React项目的目录结构
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn36lt7tqqj30x20ia74v.jpg)

# React Hook
## Hook简介
Hook是一个特殊的函数，它可以让你构入React特性，比如useState，这个State  Hook就是允许在React的函数组件中添加State的Hook。那么什么时候我们需要这个State Hook呢？其实，当我们在编写函数组件的时候，意识到我们需要添加一些State，以前的做法是把它添加成Class，那么现在呢我们就是使用函数组件中的这个Hook即可。  
## useState Hook中传入对象参数
【案例】使用useState完成一个计数器和一个开关。  
【步骤】  

 1. 在之前创建好的react-hooks项目中src/components目录下新建LikeButton.js文件，编辑代码如下：
 
```javascript
import React, { useState } from 'react'

// 函数型组件
const LikeButton = () => {
  const [ obj, setObj ] = useState({ like: 0, on: true })
  
  return (
    <>
      <button onClick={() => {setObj({ like: obj.like + 1) }}>
        {obj.like} 👍
      </button>
      <button onClick={() => {setObj({on: !obj.on})}}>
        { obj.on ? 'On' : 'Off'}
      </button>
    </>
  )
}

export default LikeButton
```
2. 在App.js文件中导入文件，如下：

```javascript
import LikeButton from './components/LikeButton'
```
3. 在App()中添加LikeButton按钮，如下：

```javascript
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <LikeButton />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
```
4. 但是发现存在互相干扰的问题，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn38o9f4ghj31720qu0v0.jpg)

5. 修改代码，处理Bug：
```javascript
import React, { useState } from 'react'

// 函数型组件
const LikeButton = () => {
  const [ obj, setObj ] = useState({ like: 0, on: true })
  
  return (
    <>
      <button onClick={() => {setObj({ like: obj.like + 1), on: obj.on }}>
        {obj.like} 👍
      </button>
      <button onClick={() => { setObj({ on: !obj.on, like: obj.like } )} }>
        { obj.on ? 'On' : 'Off'}
      </button>
    </>
  )
}

export default LikeButton
```

## 拆分使用useState Hook
【案例】使用useState完成一个计数器和一个开关。  
【步骤】  

 1. 其他步骤同上。在LikeButton.js文件中代码如下：

```javascript
import React, { useState } from 'react'

// 函数型组件
const LikeButton = () => {
  const [ like, setLike ] = useState(0)
  const [ on, setOn ] = useState(true)
  useEffect(() => {
    document.title = `点击了${like}次`
  })
  return (
    <>
      <button onClick={() => {setLike( like + 1)}}>
        {like} 👍
      </button>
      <button onClick={() => {setOn( !on )}}>
        { on ? 'On' : 'Off'}
      </button>
    </>
  )
}

export default LikeButton
```

2. 运行效果，点击LikeButton按钮，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn37gq0savj317g0nmmze.jpg)

## useEffect ---不需要清除的Effect
Effect是副作用、影响的意思。在React中分为2种，一种是需要清除的Effect，另一种是不需要清除的Effect。比如说，我们想在React更新DOM以后，只想运行一些额外的代码，比如发送网络请求、手动变更的DOM、记录日志等等, 这些都是无需清除的操作，我们在操作完之后就可以完全忽略它们了。    

**案例一**：使用useEffect使用DOM完成标题的更新。  

如果是在Class中，写法如下：  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5n20ba7gj21a80hodhj.jpg)

如果使用useEffect，方法如下：
首先在LikeButton.js文件中引入Effect，如下：  

```javascript
import React, { useState, useEffect } from 'react'
```
然后在LikeButton函数体内使用useEffect，如下：

```javascript
// 在DOM渲染完毕之后会调用
useEffect(() => {
    document.title = `点击了${like}次`
})
```
运行项目，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn3aaeeuqrj30xe0u0did.jpg)
***
## useEffect ---需要清除的Effect
  还有一些副作用是需要清除的，例如我们添加DOM事件，这种情况下清除工作是非常重要的，它可以防止引起内存的泄漏。  
  
**案例二**：使用useEffect完成一个鼠标跟踪器。  

原理：在document上添加一个click的监听函数，点击以后更新当前的State到最新的值就可以了。  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5o8u9d3cj21a20giwgk.jpg)

如果使用useEffect，方法如下：首先在components文件夹中创建MouseTracker.js文件，编辑代码如下：  

```javascript
import React, { useState, useEffect } from 'react'

const MouseTracker = () => {
  const [ positions, setPositions ] = useState({x: 0, y: 0})
  return (
    <p>X: {positions.x}, Y: {positions.y}</p>
  )
}

export default MouseTracker
```
然后在App.js文件中导入，如下：  

```javascript
import MouseTracker from './components/MouseTracker'
```
运行项目。效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn3eo3gi1gj310m0k6t94.jpg)

继续在MouseTracker.js文件中编辑useEffect的代码，如下：  

```javascript
useEffect(() => {
    const updateMouse = (event) => {
      console.log('inner')
      setPositions({ x: event.clientX, y: event.clientY })
    }
    console.log('add listener')
    document.addEventListener('mousemove', updateMouse)
    return () => {
      console.log('remove listener')
      document.removeEventListener('mousemove', updateMouse)
    }
  })
```
运行并观察现象，由此，就可以实现副作用的清除了。

## useEffect     -可控Effect(控制useEffect的执行)
我们已经学习了需要清除的Effect和不需要清除的Effect, 但是每次渲染都要执行相应的Effect，那么这样呢就会导致相关的性能问题。如果我们想控制Effect的执行次数，那么我们可以通过一个案例来进行学习。  

**案例三**：使用Effect实现一个狗狗图片展示器
[狗狗图片API地址](https://dog.ceo/dog-api/) ：https://dog.ceo/dog-api/

如果有某些特定值在两次渲染之间没有发生变化，那么就可以通知React，我们要跳过这次Effect的调用。
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go5oflhqnoj21880gqgnj.jpg)

【步骤】  
1. 首先安装axios插件，执行指令：

```shell script
npm install axios --save
```
2. 在components文件夹中创建DogShow.js文件，并编辑代码：  

```javascript
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DogShow = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 设置图片的宽度
  const style = {
    width: 200
  }
  
  useEffect(() => {
    // 将loading的值修改为true
    setLoading(true)
    // 请求数据
    axios.get('https://dog.ceo/api/breeds/image/random').then(result => {
      console.log(result)
      // 将url的值设置为result.data.message
      setUrl(result.data.message)
      // 将loading的值修改为false
      setLoading(false)
    })
  })
  
  return (
    <>
      {loading ? <p>🐶读取中</p>
       : <img src={url} alt="dog" style={style} />
      }
    </>
  )
}

export default DogShow

```
3. 在App.js文件中导入DogShow.js文件，如下：  

```javascript
import DogShow from './components/DogShow'
在App函数中使用：
function App() {
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <DogShow />
      </header>
    </div>
  );
}
```

4. 运行npm start启动，看效果。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn3jg03m5tj31hu0u0wmo.jpg)

> 发现问题很严重，程序一直在发送请求数据的请求，同时一直在读取中。那么为什么会出现这样的问题呢？
其实当axios请求到数据以后，我们执行了  

```javascript
      // 将url的值设置为result.data.message
      setUrl(result.data.message)
      // 将loading的值修改为false
      setLoading(false)
```
> 这两行代码说明我们的组件在更新，更新以后自然又调用了useEffect，这样，就陷入了一个无限循环的怪圈当中。

5. 解决方法  

> 其实Effect还可以传第二个参数，这个第二个参数是一个可选的参数，它是一个数组，这个数组里面可以包含任意多的项。当这个数组中任意一项发生变化的时候，那么就可以重新跑Effect。如果想让Effect只执行一次，那么就可以传一个空数组作为第二参数。这样就告诉React，这个Effect不依赖任何Props或者State中的任何值，所以它永远都不需要重复执行。在DogShow.js文件中，代码如下：  

```javascript
useEffect(() => {
    // 将loading的值修改为true
    setLoading(true)
    // 请求数据
    axios.get('https://dog.ceo/api/breeds/image/random').then(result => {
      console.log(result)
      // 将url的值设置为result.data.message
      setUrl(result.data.message)
      // 将loading的值修改为false
      setLoading(false)
    })
  }, [ ])
```
> 再次运行，观察效果。如下： 

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn3k4sqidhj31kd0u0450.jpg)

> 发现Effect只运行了一次，也比较极端，没法进行灵活的控制。如果想灵活控制的话，我们可以在第二参数的数组中引入一个元素。如下：  

```javascript
const [fetch, setFetch] = useState(false)

useEffect(() => {
    // 将loading的值修改为true
    setLoading(true)
    // 请求数据
    axios.get('https://dog.ceo/api/breeds/image/random').then(result => {
      console.log(result)
      // 将url的值设置为result.data.message
      setUrl(result.data.message)
      // 将loading的值修改为false
      setLoading(false)
    })
  }, [fetch])
```
最后全部代码如下：  

```javascript
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const DogShow = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetch, setFetch] = useState(false)
  
  // 设置图片的宽度
  const style = {
    width: 200
  }
  
  useEffect(() => {
    // 将loading的值修改为true
    setLoading(true)
    // 请求数据
    axios.get('https://dog.ceo/api/breeds/image/random').then(result => {
      console.log(result)
      // 将url的值设置为result.data.message
      setUrl(result.data.message)
      // 将loading的值修改为false
      setLoading(false)
    })
  }, [fetch])
  
  return (
    <>
      {loading ? <p>🐶读取中</p>
       : <img src={url} alt="dog" style={style} />
      }
      <button onClick={() => {setFetch(!fetch)}}>再看一张图片</button>
    </>
  )
}

export default DogShow

```
6. 看最终效果：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn3kqn5ldyj31du0u0jxl.jpg)

> 可以通过点击【再看一张图片】按钮实现图片的刷新效果。这样，我们就手动控制了useEffect的运行次数了。  

## 自定义Hook
我们可以使用Hook从组件中提取状态逻辑，使得这些逻辑可以单独测试并且复用。使用Hook我们可以无需修改组件结构的情况下可以复用状态逻辑。这使得组件间或者我们在社区内共享Hook变得非常便捷。这是Hook非常吸引人的特质。那么接下来我们将学习自定义Hook。通过自定义Hook可以将组件逻辑提取到可重用的函数中。  
  在React Hook出现之前，有两种流行的方式来共享组件之间的状态逻辑。一个是Renderer Props, 另一个是高阶组件。首先我们将之前的鼠标跟踪器抽象到自定义Hook中。  
**案例四**：使用自定义Hook抽象鼠标跟踪器。  

【步骤】  
1. 在src目录下创建hooks文件夹，在hooks文件夹中创建useMousePosition.js文件。编辑代码(可以从MouseTracker.js文件中拷贝部分代码)：  

```javascript
import React, { useState, useEffect } from 'react'

const useMousePosition = () => {
  const [ positions, setPositions ] = useState({x: 0, y: 0})
  useEffect(() => {
    const updateMouse = (event) => {
      setPositions({ x: event.clientX, y: event.clientY })
    }
    document.addEventListener('mousemove', updateMouse)
    return () => {
      document.removeEventListener('mousemove', updateMouse)
    }
  })
  return positions
}

export default useMousePosition
```
2. 在App.js中，编辑代码：  

```javascript
import useMousePosition from './hooks/useMousePosition'

在App.js中编辑代码：
function App() {
  const position = useMousePosition()
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{ position.x } ---  { position.y }</h1>
```
3. 在LikeButton.js文件中使用，如下：  

```javascript
import useMousePosition from '../hooks/useMousePosition'

// 函数型组件
const LikeButton = () => {
  const position = useMousePosition()
  
return (
    <>
      <p>{ position.y }</p>
```

## HOC的概念和缺点
HOC-Higher order component  即高阶组件
高阶组件就是一个函数，接受一个组件作为参数，返回一个新的组件。组件将Props属性转换成一个UI，那么高阶组件就是将一个组件转换成另外一个组件。在Hook出现之前，HOC承担着类似于Hook的功能。但是HOC写起来会多一些属性，代码比较臃肿。    

【案例】创建withLoader.js文件, 代码如下:  

```javascript
// high order component
import React from 'react'
import axios from 'axios'

const withLoader = (WrappedComponent, url) => {
  return class LoaderComponent extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        data: null,
        isLoading: false
      }
    }
    componentDidMount() {
      this.setState({
        isLoading: true,
      })
      axios.get(url).then(result => {
        this.setState({
          data: result.data,
          isLoading: false
        })
      })
    }
    render() {
      const { data, isLoading } = this.state
      return (
        <>
          { (isLoading || !data) ? <p>data is loading</p> :
            <WrappedComponent {...this.props} data={data} isLoading={isLoading} />
          }
        </>
      )
    }
  }
}

export default withLoader

```

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn4mwq22i9j31d10u0tf6.jpg)

> 然后在App.js文件中引入，如下：

```javascript
import withLoader from './components/withLoader'

function App() {
  const position = useMousePosition()
  
  const DogShowWithLoader = withLoader(DogShow, 
    'https://dog.ceo/api/breeds/image/random')
```
## 使用自定义Hook完成【狗狗图片展示器】
在hooks文件夹中创建useURLLoader.js文件, 编辑代码：  
```javascript
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const useURLLoader = (url) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // 设置loading的值为true
    setLoading(true)
    axios.get(url).then(result => {
      console.log(result)
      setData(result.data)
      // 设置loading的值为false
      setLoading(false)
    })
  }, [url])
  return [data, loading]
}

export default useURLLoader
```

> 然后在App.js文件中导入文件，如下：  

```javascript
import useURLLoader from './hooks/useURLLoader'
// 然后新建一个函数型组件：  
const DogShowWithHook = () => {
  const [ data, loading ] = useURLLoader('https://dog.ceo/api/breeds/image/random')
  return (
    <>
      {loading ? <p>🐶读取中</p>
       : <img src={data && data.message} alt="dog" style={style} />
      }
    </>
  )
}
```
> 最后在return里面进行使用：  

```html
<DogShowWithHook />
```
> 运行，观察现象:    

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn4pc2zuk9j314i0gggpa.jpg)

## 使用自定义Hook完成分类猫的展示

```javascript
const CatShowWithHook = () => {
  const [ category, setCategory ] = useState('1')
  const [ data, loading ] = useURLLoader(`https://api.thecatapi.com/v1/images/search?limit=1&category_ids=${category}`)
  return (
    <>
      {loading ? <p>🐱读取中</p>
       : <img src={data && data[0].url} alt="cat" style={style} />
      }
      <button onClick={() => { setCategory('1') }}>帽子猫</button>
      <button onClick={() => { setCategory('5') }}>盒子猫</button>
    </>
  )
}

// 同时在return里面声明式使用
<CatShowWithHook />
```
演示效果：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn4qa7ew4fj30y20pyqbd.jpg)


## Hook的规则
1. [Hook的规则](https://react.docschina.org/docs/hooks-rules.html)
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn4qapdrb3j31d20qewgj.jpg)

2. [常见的Hook](https://react.docschina.org/docs/hooks-overview.html) 
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn4qcmoeqoj31780p00t4.jpg)

