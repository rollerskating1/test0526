# 图标选择与类型检查
## 为项目选择图标库
之前我们有一些图标都是直接使用汉字代替的，现在呢我们需要使用真实的图标替换掉文字。此次我们选用 [react-fontawesome](https://fontawesome.com/how-to-use/on-the-web/using-with/react)作为我们的字体库。首先进入到项目目录，然后执行指令：  

```shell script
npm i --save @fortawesome/fontawesome-svg-core
npm install --save @fortawesome/free-solid-svg-icons
npm install --save @fortawesome/react-fontawesome
```
图标库安装好之后，开始去使用它。在FileSearch.js文件中，先进行导入：  

```javascript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'  
import { faSearch } from '@fortawesome/free-solid-svg-icons'
```
然后使用它，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn994urf5gj311a0hkwez.jpg)

运行，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn98tevrnij315e07a748.jpg)

可以看到有一个button的效果，因为我们设置的button的属性为btn btn-primary。现在我们将btn btn-primarry删掉，修改成自定义的icon-button，再为icon-button设置样式。在App.css文件中，首先将原来的样式全部删除，然后编辑我们的样式代码：  

```css
.icon-button{
  background: none;
  border: none;
  color: inherit;
}
```
运行，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9979jzxij30z804ymx3.jpg)

同理，写关闭按钮，如下：

```javascript
import { faSearch, faTimes } from  
'@fortawesome/free-solid-svg-icons'  
```
使用图标，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn99ffz6bej30xa0hkjru.jpg)

但是我们发现使用bootstrap的grid(栅格系统)的布局在这里的效果不是很好, 宽度比例有些失调。  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn99vo6wa3j30za07cwed.jpg)

我们直接把col-8和col-4去掉，改用Flex布局。效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn99w5riyfj30zc0740sm.jpg)

## 使用PropTypes检查属性类型
大家都知道javascript是一种弱类型的语言，太灵活了从某种程度上说是一件好事，我们不用考虑太多类型上的问题，但是弱类型也有它天生的缺点。当你的一个应用程序做得越来越复杂的时候，使用类型检查就有可能帮助我们发现一些潜在的Bug。其实React也内置了
[PropTypes](https://zh-hans.reactjs.org/docs/typechecking-with-proptypes.html)
来完成检查属性类型的任务。

然后在FileSearch.js文件中引入依赖并编辑代码，如下：  

```javascript
import PropTypes from 'prop-types'
// 添加属性检查
FileSearch.propTypes = {
  // 要求必须是字符串
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired
}
```
**测试**
在App.js文件中，进行如下的临时修改：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9bbyn7rrj31120883yo.jpg)

运行观察效果，报Bug如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9bd3p8w2j30v805gjrl.jpg)

也就是说，如果要求是字符串，但是实际给的是个数字的话，就会报错。反之亦然。


## React组件的默认属性  
我们可以直接在react组件上添加默认属性，如下：  

```javascript
// 添加默认属性
FileSearch.defaultProps = {
  //如果同时添加了title属性，那么默认属性会被覆盖
  title: 'My Document'
}
```
**测试**
在App.js文件中，进行如下的临时修改：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9blx6mlnj311u088mxd.jpg)

观察效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9ble53a0j30x4064a9z.jpg)

也就是说，如果只设置了默认属性的情况下，那么默认属性生效。如果同时设置了该title属性，那么默认属性会被覆盖掉。

# FileList组件开发
1. 分析文件列表组件的状态
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9bxaae5oj30rm0padge.jpg)

2. 分析文件列表组件的属性

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9c1qxhrlj310u0iydi3.jpg)

3. 待传入的文件结构

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gn9c550kjqj30w60rydiv.jpg)

4. 编辑代码  
在components文件夹下创建FileList.js文件，因为 [Markdown的图标](https://fontawesome.com/icons?d=gallery&q=markdown) 在brands库下面，所以还需要再安装@fortawesome/free-brands-svg-icons字体库，在项目目录下执行指令：  

```shell script
npm install --save @fortawesome/free-brands-svg-icons
```

编辑代码如下：  

```javascript
import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'

const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete } ) => {
  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="list-group-item bg-light d-flex align-items-center file-item"
            key={ file.id }
          >
            <span>{ file.title }</span>
          </li>
        ))
      }
    </ul>
  )
}

export default FileList

```
使用到的样式可以参考  [bootstrap](https://getbootstrap.com/docs/4.3/components/list-group/)。

5. 创建模板文件  
在src/utils目录下创建defaultFile.js文件, 编辑模板如下：  

```javascript
const defaultFiles = [
  {
    id: '1',
    title: 'first post',
    body: 'should be aware of this',
    createdAt: 436787483
  },
  {
    id: '2',
    title: 'second post',
    body: '## this is the title',
    createdAt: 5796472637
  }
]

export default defaultFiles

```
6. 在App.js文件中使用FileList组件  
在App.js文件中，先导入文件，然后使用，如下：  

```javascript
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'

function App() {
  return (
    <div className="App container-fluid">
      <div className="row">
        <div className="col bg-light left-panel">
          <FileSearch 
            title="我的云文档"
            onFileSearch={(value) => {console.log(value)}}
          />
          <FileList
            files={ defaultFiles }
          />
        </div>
        <div className="col bg-primary right-panel">
          <h1>this is the right</h1>
        </div>
      </div>
    </div>
  );
}
```
7. 添加类型检查  
在FileList.js文件中，添加类型检查代码：  

```javascript
import PropTypes from 'prop-types'

// 添加属性检查
FileList.propTypes = {
  // 要求必须是数组
  files: PropTypes.array,
  // 要求必须是函数
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func,
}
```
8. 添加Markdown图标和编辑、删除按钮
在FileList.js文件中, 将Markdown图标补充完整，完整代码如下:  

```javascript
const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete } ) => {
  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="list-group-item bg-light row d-flex align-items-center file-item"
            key={ file.id }
          >
            <span className="col-2">
              <FontAwesomeIcon 
                size="lg"
                icon={ faMarkdown }
              />
            </span>
            <span className="col-8">{ file.title }</span>
            <button type="button"
              className="icon-button col-1"
              onClick={ () => {} }>
                <FontAwesomeIcon
                  title="编辑"
                  size="lg"
                  icon={ faEdit }
                />
            </button>
            <button type="button"
              className="icon-button col-1"
              onClick={ () => {} }>
                <FontAwesomeIcon
                  title="删除"
                  size="lg"
                  icon={ faTrash }
                />
            </button>
          </li>
        ))
      }
    </ul>
  )
}
```

9. 添加事件  

在FileList.js文件中，编辑代码如下：  

```javascript
<span
  className="col-8 c-link"
  onClick={ () => { onFileClick(file.id) } }
>
    { file.title }
</span>

<button type="button"
    className="icon-button col-1"
    onClick={ () => { onFileDelete(file.id) } }
>
    <FontAwesomeIcon
        title="删除"
        size="lg"
        icon={ faTrash }
    />
</button>
```
10. 功能测试  
在App.js文件中，在FileList组件上添加事件如下:  

```javacript
<FileList
    files={ defaultFiles }
    onFileClick={ (id) => { console.log(id) } }
    onFileDelete={ (id) => { console.log('deleting', id) } }
/>
```
执行npm run dev运行，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnbkn7ndskj31270u0t9s.jpg)

11. 显示状态和编辑状态切换  
之前是使用了一个叫做inputActive的布尔类型变量来进行状态的判断，用它来指示是否是编辑状态。但是现在我们在FileList组件中会有多个Item项，那么我们需要一个值来保存正在编辑的Item的id值。我们需要建一个新的State,在FileList.js文件中代码如下：  

```javascript
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
```

```javascript
<button type="button"
    className="icon-button col-1"
    onClick={ () => { setEditStatus(file.id); setValue(file.title); } }>
    <FontAwesomeIcon
        title="编辑"
        size="lg"
        icon={ faEdit }
    />
</button>
```
在FileList.js文件中，编辑JSX代码如下：  

```javascript
const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete } ) => {
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li
            className="list-group-item bg-light row d-flex align-items-center file-item"
            key={ file.id }
          >
            { (file.id !== editStatus) &&
              <>
                <span className="col-2">
                  <FontAwesomeIcon 
                    size="lg"
                    icon={ faMarkdown }
                  />
                </span>
                <span
                  className="col-8 c-link"
                  onClick={ () => { onFileClick(file.id) } }
                >
                  { file.title }
                </span>
                <button type="button"
                  className="icon-button col-1"
                  onClick={ () => { setEditStatus(file.id); setValue(file.title); } }>
                    <FontAwesomeIcon
                      title="编辑"
                      size="lg"
                      icon={ faEdit }
                    />
                </button>
                <button type="button"
                  className="icon-button col-1"
                  onClick={ () => { onFileDelete(file.id) } }
                >
                    <FontAwesomeIcon
                      title="删除"
                      size="lg"
                      icon={ faTrash }
                    />
                </button>
              </>
            }
            { (file.id === editStatus) &&
              <>
                <input className="form-control" 
                  value={value}
                  ref={node}
                  onChange={ (e) => { setValue(e.target.value) } } />
                <button type="button"
                  className="icon-button"
                  onClick={ closeSearch }>
                  <FontAwesomeIcon 
                    title="关闭"
                    size="lg"
                    icon={ faTimes }
                  />
                </button>
              </>
            }
          </li>
        ))
      }
    </ul>
  )
}
```
注意修改的细节，如下：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnbnycqotaj31420kmjs8.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnbqrivvy3j31540f83yt.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnbo3eba6bj31180is74q.jpg)

这里的图标使用了faTimes，那么我们需要导入进来，如下：  

```javascript
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
```
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnbpsoocvyj318e0u0my8.jpg)

12. 给input框添加键盘事件
首先编写关闭搜索的函数，如下：  

```javascript
const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete } ) => {
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
  
  const closeSearch = (editItem) => {
    // 设置默认编辑状态
    setEditStatus(false)
    // 设置默认值
    setValue('')
  }
```

将FileSearch.js文件中的Effect拷贝到FileList.js文件中，如下：  

```javascript
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
```
做简单的变动和微调，变成如下的代码：  

```javascript
useEffect(() => {
    const handleInputEvent = (event) => {
      const { keyCode } = event
      const editItem = files.find(file => file.id === editStatus)
      if(keyCode === 13 && editStatus){
        
        onSaveEdit(editItem.id, value)
        // 设置编辑状态为false
        setEditStatus(false)
        // 设置值为空
        setValue('')
      }else if(keyCode === 27 && editStatus){
        closeSearch(event)
      }
    }
    document.addEventListener('keyup', handleInputEvent)
    return () => {
      document.removeEventListener('keyup', handleInputEvent)
    }
  })
```
13. 测试Edit功能  

在App.js文件中，编辑代码如下：  

```javascript
<FileList
    files={ defaultFiles }
    onFileClick={ (id) => { console.log(id) } }
    onFileDelete={ (id) => { console.log('deleting', id) } }
    onSaveEdit={ (id, newValue) => { console.log(id); 
    console.log(newValue) } }
/>
```
测试编辑功能效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnbquuwpjtj30wo0u03zp.jpg)

14. 疑问  

既然已经修改了文件名，为什么文件名没有改变呢？
其实我们重命名之后，回调传到了App.js进行处理，处理完了之后还需要把files整个数组传到FileList组件，这样在FileList组件上才会有修改。这里我们暂时不做这个效果。

# 代码重构
## 自定义Hook --- useKeyPress
**步骤**  
1. 我们希望把键盘点击事件提取到一个自定义Hook当中，使得它不仅仅可以响应Enter和Esc按键，还可以响应任何键盘的点击事件。在src目录下创建hooks文件夹，然后在hooks文件夹中创建useKeyPress.js文件, 编辑代码如下：  

```javascript
import { useState, useEffect, useRef } from 'react'

const useKeyPress = (targetKeyCode) => {
  const [ keyPressed, setKeyPressed ] = useState(false)
  
  const keyDownHandler = ({ keyCode }) => {
    if(keyCode === targetKeyCode){
      setKeyPressed(true)
    }
  }
  const keyUpHandler = ({ keyCode }) => {
    if(keyCode === targetKeyCode){
      setKeyPressed(false)
    }
  }
  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)
    
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
      document.removeEventListener('keyup', keyUpHandler)
    }
  }, [])
  
  return keyPressed
}

export default useKeyPress

```
2. 在FileSearch.js文件中先导入useKeyPress文件：  
```javascript
import useKeyPress from '../hooks/useKeyPress'
```
3. 然后编辑代码如下：  

```javascript
const enterPressed = useKeyPress(13)
const escPressed = useKeyPress(27)
```
4. 书写的位置如图所示:  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gncf90mrpcj318a0c6wf3.jpg)

5. 接着将下面代码进行修改：  
在FileSearch.js文件中
```javascript
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
```
> 修改成如下的代码：  

```javascript
useEffect(() => {
    if(enterPressed && inputActive){
      onFileSearch(value)
    }
    if(escPressed && inputActive){
      closeSearch()
    }
  })
```
> 同理，在FileList.js文件中，也进行类似的修改：  

```javascript
useEffect(() => {
    const handleInputEvent = (event) => {
      const editItem = files.find(file => file.id === editStatus)
      const { keyCode } = event
      if(keyCode === 13 && editStatus){
        onSaveEdit(editItem.id, value)
        // 设置编辑状态为false
        setEditStatus(false)
        // 设置值为空
        setValue('')
      }else if(keyCode === 27 && editStatus){
        closeSearch(event)
      }
    }
    document.addEventListener('keyup', handleInputEvent)
    return () => {
      document.removeEventListener('keyup', handleInputEvent)
    }
  })
```
> 修改成如下的代码：  

```javascript
useEffect(() => {
      const editItem = files.find(file => file.id === editStatus)
      if(enterPressed && editStatus){
        onSaveEdit(editItem.id, value)
        // 设置编辑状态为false
        setEditStatus(false)
        // 设置值为空
        setValue('')
      }else if(escPressed && editStatus){
        closeSearch()
      }
  })
```
> 在FileList.js中进行文件导入，如下：  

```javascript
import useKeyPress from '../hooks/useKeyPress'
```

> 同时，在FileList.js文件中的FileList函数组件中也需要添加如下的代码：  

```javascript
const enterPressed = useKeyPress(13)
const escPressed = useKeyPress(27)
```


6. 效果演示  

> 点击编辑按钮，在input输入框中输入信息，按Enter键，然后依次类推，按Esc键，观察效果。

# 新建和导入按钮
**步骤**
1. 在components文件夹下创建BottomBtn.js文件，编辑代码如下：  

```javascript
import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => (
  <button
    type="button"
    className={`btn btn-block no-border ${colorClass}`}
    onClick={ onBtnClick }
  >
    <FontAwesomeIcon
      className="mr-2"
      size="lg"
      icon={ icon }
    />
    { text }
  </button>
)

BottomBtn.propTypes = {
  text: PropTypes.string,
  colorClass: PropTypes.string,
  icon: PropTypes.element.isRequired,
  onBtnClick: PropTypes.func
}

BottomBtn.defaultProps = {
  text: '新建'
}

export default BottomBtn

```
2. 在App.js文件中，导入相关文件  

```javascript
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
```
> 在JSX代码中，编辑如下：  

```javascript
function App() {
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col bg-light left-panel">
          <FileSearch
            title="我的云文档"
            onFileSearch={(value) => {console.log(value)}}
          />
          <FileList
            files={ defaultFiles }
            onFileClick={ (id) => { console.log(id) } }
            onFileDelete={ (id) => { console.log('deleting', id) } }
            onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
          />
          <div className="row no-gutters">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
              />
            </div>
          </div>
        </div>
        <div className="col bg-primary right-panel">
          <h1>this is the right</h1>
        </div>
      </div>
    </div>
  );
}
```
3. 运行，观察演示效果
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gncirevcngj31kq0fsjrn.jpg)

> 发现最上面的Item项的空隙太多，所以需要把FileSearch组件的margin-bottom的值设置为0. 如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnciyz07zuj317q0ciaaj.jpg)

> 修改后的最终效果如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gncj11c9tkj31km0esaab.jpg)


