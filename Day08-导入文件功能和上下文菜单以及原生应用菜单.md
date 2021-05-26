# 导入文件对话框功能
之前我们使用fs模块对文件进行了一系列的操作，现在我们已经可以将文件持久地保存在文件系统中了，并且使用electron-store实现了文件的持久化。那么现在我们要让整个App更像一个原生应用，一个原生应用有别于WebApp或者网页的地方在于它能调动操作系统提供的一些计算机对应的原生模块。那么现在我们就使用electron来为整个的应用锦上添花。  

## 文件导入功能实现  
要实现文件导入的功能我们要借助于electron的一个模块dialog，它可以帮助我们创建操作系统原生的对话框，并且可以和它进行一系列的交互。我们先来分析一下使用dialog模块导入文件的流程。  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnwos1uzjyj311o0rkta1.jpg)

先来看看 [dialog对话框](https://www.electronjs.org/docs/api/dialog) 的文档。在App.js文件中添加onBtnClick方法，如下：  

```javascript
<div className="col">
    <BottomBtn
        text="导入"
        colorClass="btn-success"
        icon={faFileImport}
        onBtnClick={importFiles}
    />
</div>
```
编辑importFiles方法，代码如下：  

```javascript
const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] }
      ]
    }).then(result => {
      console.log(result.filePaths)
    })
  }
```
此时，运行项目，点击"导入"按钮，会弹出dialog对话框，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnwq09va06j313c0rgq3l.jpg)

打开控制台查看，打印出路径，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnwq1jiolnj31b0036jrb.jpg)

现在我们仅仅只是得到一个存有文件路径的数组，那么接下来我们要做的事情就是把导入的文件存到文件系统中去。在App.js文件中，编辑代码如下：  

```javascript
const { join, basename, extname, dirname } = window.require('path')

const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Markdown files', extensions: ['md'] }
      ]
    }).then(result => {
      console.log(result.filePaths)
      var paths = result.filePaths
      // 判断paths是个数组
      if(Array.isArray(paths)){
        // filter out the path we already have in electron store
        // 比如：["/Users/mac/Desktop/8888/1.md", "/Users/mac/Desktop/8888/2.md"]
        // extend the path array to an array contains files info
        const filteredPaths = paths.filter(path => {
          // 将已经存在的文件过滤掉
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path
          })
          // 否则直接返回未添加的文件的数组
          return !alreadyAdded
        })
        // [{ id: '1', path: '', title: '', {} }]
        const importFilesArr = filteredPaths.map(path => {
          // 封装成对象类型
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
          }
        })
        console.log(importFilesArr)
        // get the all new files object in flattenArr
        const newFiles = { ...files, ...flattenArr(importFilesArr) }
        // setState and update electron store
        console.log(newFiles)
        // 更新界面
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
        // 如果导入的文件存在
        if(importFilesArr.length > 0){
          // 弹出消息盒子
          remote.dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFilesArr.length}个文件`,
            message: `成功导入了${importFilesArr.length}个文件`,
          })
        }
      }
    })
  }
```
其中关于文件路径的处理，可以参考Node.js的 [path模块](https://nodejs.org/api/path.html)的相关方法。

运行项目，准备好md后缀的文件，然后点击“导入”按钮，选中要导入的文件，点击“打开”导入文件，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnxcjhxuifj313m0rk0td.jpg)

如果文件是新导入的，和FileList组件中的文件并不重复的话，那么会弹出消息盒子，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnxck9gl7kj30nc08gdfr.jpg)

由于我们在代码里面添加了去重的功能，所以已经被导入的文件不能被重复导入。

## 文件保存功能优化  
虽然现在我们已经可以成功地导入文件，但是却引出了一个Bug。现在我们的文件可能来自不同的地方，除了Documents路径之外，还可以来自其他任何地方。所以，此时我们要保存文件的话，就不能将来自其他地方的文件都保存到Documents路径下。
我们对代码进行优化。在App.js文件中修改saveCurrentFile方法的代码。

修改前的代码：  

```javascript
  // 保存当前的文件
  const saveCurrentFile = () => {
    fileHelper.writeFile(join(savedLocation, `${activeFile.title}.md`),
      activeFile.body
    ).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
    })
  }
```
修改后的代码：  

```javascript
  // 保存当前的文件
  const saveCurrentFile = () => {
    fileHelper.writeFile(activeFile.path,
      activeFile.body
    ).then(() => {
      setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
    })
  }
```
这样，就可以将来自不同地方的文件保存到正确的地方了。同理，修改updateFileName方法，如下。  

修改前的代码：  

```javascript
  // 新建或者重命名文件
  const updateFileName = (id, title, isNew) => {
    // newPath should be different based on isNew
    // if isNew is false, path should be old dirname + new title
    const newPath = join(savedLocation, `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    // 如果是新建文件
    if(isNew){
      // 调用writeFile方法写文件内容
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
      })
    }else{
      const oldPath = join(savedLocation, `${files[id].title}.md`)
      // 如果是重命名
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
      })
    }
  }
```
修改后的代码：  

```javascript
  // 新建或者重命名文件
  const updateFileName = (id, title, isNew) => {
    // newPath should be different based on isNew
    // if isNew is false, path should be old dirname + new title
    const newPath = isNew ? join(savedLocation, `${title}.md`) :
    join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    // 如果是新建文件
    if(isNew){
      // 调用writeFile方法写文件内容
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
      })
    }else{
      const oldPath = files[id].path
      // 如果是重命名
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
      })
    }
  }
```
这样，我们对文件进行重命名的时候，也能够在正确的文件路径下进行操作了。  

## 添加上下文菜单  
现在我们来探讨electron提供的另一个API，即[菜单menu](https://www.electronjs.org/docs/api/menu)。菜单在我们日常使用软件的时候是一个非常重要的内容，在electron的世界里，菜单分为两大类：  
+ 原生应用菜单  
+ 上下文菜单

原生菜单：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnxkrz09dzj30vu0cu0tk.jpg)

上下文菜单：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnxku3j0m4j30we0bowfi.jpg)

因为我们需要在Renderer Process中使用menu，而menu又只能在Main   Process中使用，所以我们需要借助remote来实现。首先在FileList.js文件中导入remote，如下：  

```javascript
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote
```
然后在FileList函数组件中使用useEffect，如下：  

```javascript
useEffect(() => {
    // 创建Menu菜单
    const menu = new Menu()
    // 在Menu菜单上追加MenuItem项
    menu.append(new MenuItem({
      label: '打开',
      click: () => {
        console.log('clicking')
      }
    }))
    menu.append(new MenuItem({
      label: '重命名',
      click: () => {
        console.log('renaming')
      }
    }))
    menu.append(new MenuItem({
      label: '删除',
      click: () => {
        console.log('deleting')
      }
    }))
    const handleContextMenu = (e) => {
      // 指定在哪个window中弹出菜单
      menu.popup({window: remote.getCurrentWindow() })
    }
    // 监听上下文菜单
    window.addEventListener('contextmenu', handleContextMenu)
    // 清除监听
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  })
```

运行项目，在原生窗口点击右键，弹出上下文菜单。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnxlyltyyij31d20g03z8.jpg)

其实这个弹出上下文菜单的功能相对比较独立，我们可以把它独立成一个自定义Hook。在hooks文件夹下创建useContextMenu.js文件，对原来的功能模块进行重构，编辑代码如下：  

```javascript
import { useEffect } from 'react'
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote

const useContextMenu = (itemArr) => {
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e) => {
      // 指定在哪个window中弹出菜单
      menu.popup({window: remote.getCurrentWindow() })
    }
    // 监听上下文菜单
    window.addEventListener('contextmenu', handleContextMenu)
    // 清除监听
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
    // 空数组[]表示挂载的时候把useEffect放上去
    // 卸载的时候消失
  }, [])
}

export default useContextMenu
```
在FileList.js文件中导入useContextMenu.js文件，如下：  

```javascript
import useContextMenu from '../hooks/useContextMenu'
```
并把原来useEffect进行精简，如下：  

```javascript
useContextMenu([
    {
      label: '打开',
      click: () => {
        console.log('clicking')
      }
    },
    {
      label: '重命名',
      click: () => {
        console.log('renaming')
      }
    },
    {
      label: '删除',
      click: () => {
        console.log('deleting')
      }
    }
  ])
```
运行项目，仍然可以实现之前的功能，成功完成了代码的重构。  

## 上下文菜单功能完善  
我们现在可以成功出现上下文菜单了，同时也出现了两个需求：  
+ 获取点击的元素
+ 菜单在规定的范围内出现  

首先我们来获取点击的元素，在handleContextMenu函数中的event事件对象的target属性就是我们想暴露出来的目标元素。这个目标元素我们可以存储到useRef的对象当中，从而实现将其暴露出来的目标。所以，可以在useContextMenu.js文件中使用useRef来实现，编辑代码如下：  

```javascript
import { useEffect, useRef } from 'react'
```

```javascript
// 创建useRef对象
  let clickedElement = useRef(null)
```


```javascript
// 使用current属性保存有用的信息
      clickedElement.current = e.target
```


```javascript
// 返回保存有节点信息的对象
  return clickedElement
```
整体代码，如下：  

```javascript
import { useEffect, useRef } from 'react'
const { remote } = window.require('electron')
const { Menu, MenuItem } = remote

const useContextMenu = (itemArr) => {
  // 创建useRef对象
  let clickedElement = useRef(null)
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e) => {
      // 使用current属性保存有用的信息
      clickedElement.current = e.target
      // 指定在哪个window中弹出菜单
      menu.popup({window: remote.getCurrentWindow() })
    }
    // 监听上下文菜单
    window.addEventListener('contextmenu', handleContextMenu)
    // 清除监听
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
    // 空数组[]表示挂载的时候把useEffect放上去
    // 卸载的时候消失
  }, [])
  // 返回保存有节点信息的对象
  return clickedElement
}

export default useContextMenu
```
这样，我们就可以将点击的目标元素通过useRef对象暴露出来了。接下来在FileList.js文件中，调用useContextMenu的时候获取到包含有目标节点的useRef对象，同时可以在回调函数中对这个useRef对象中的current属性进行打印观察。如下：  

```javascript
const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        console.log('clicking', clickedItem.current)
      }
    },
    {
      label: '重命名',
      click: () => {
        console.log('renaming')
      }
    },
    {
      label: '删除',
      click: () => {
        console.log('deleting')
      }
    }
  ])
```
运行项目，右键弹出上下文菜单，点击“打开”，可以观察到控制台打印出了目标元素，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnyez8ug50j312a0d40t3.jpg)

然后我们要实现第二个需求：让菜单在特定区域内出现。  
我们可以在useContextMenu上传入一个选择器，当选择器选取到的元素包含e.target的时候才弹出上下文菜单的窗口。在useContextMenu.js文件中，编辑代码如下：  

```javascript
const useContextMenu = (itemArr, targetSelector) => {
  // 创建useRef对象
  let clickedElement = useRef(null)
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e) => {
      // only show the context menu on current dom element
      // or targetSelector contains target
      if(document.querySelector(targetSelector).contains(e.target)){
        // 使用current属性保存有用的信息
        clickedElement.current = e.target
        // 指定在哪个window中弹出菜单
        menu.popup({window: remote.getCurrentWindow() })
      }
    }
    // 监听上下文菜单
    window.addEventListener('contextmenu', handleContextMenu)
    // 清除监听
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
    // 空数组[]表示挂载的时候把useEffect放上去
    // 卸载的时候消失
  }, [])
  // 返回保存有节点信息的对象
  return clickedElement
}
```
修改的地方如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnyfoaiip0j315z0u0dhx.jpg)

在FileList.js文件中，调用useContextMenu方法的时候传入targetSelector参数，如下：  

```javascript
const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        console.log('clicking', clickedItem.current)
      }
    },
    {
      label: '重命名',
      click: () => {
        console.log('renaming')
      }
    },
    {
      label: '删除',
      click: () => {
        console.log('deleting')
      }
    }
  ], '.file-list')
```
这个file-list类是ul元素上的class，当ul元素内包含点击目标的时候才弹出上下文菜单。这样，我们就可以把上下文菜单出现的位置给定位到了ul元素范围内的li标签上了。 同时，我们点击“打开”按钮，发现能够打印出一个DOM节点。 如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnym575m2pj31ey0qyt9r.jpg)

## 上下文菜单最终实现  
我们经过上面的处理已经可以获得目标节点的子节点了，但是目标节点和子节点上都没有信息，我们需要在li标签上存储一些需要的信息。在HTML5当中，有一个 [custom data属性](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-data-*) 可以完成这样的功能。

在FileList.js文件中，我们想将信息添加到li元素上，在li元素上添加data-id和data-title属性，如下：  

```javascript
<li
    className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
    key={ file.id }
    data-id={file.id}
    data-title={file.title}
>
```
但是我们点击“打开”按钮的时候，获取到的是li标签下面的子级元素span标签，而不是我们的目标元素li标签。自然，现在也无法获取到目标元素上的自定义信息。所以，我们需要一个方法让DOM事件上浮，等到浮到li标签上的时候停止。然后从li元素上取得使用custom data存储好的值。我们在utils文件夹下的helper.js文件添加一个getParentNode方法，代码如下：  

```javascript
// 获取拥有parentClassName的父节点的方法
export const getParentNode = (node, parentClassName) => {
  let current = node
  while(current !== null){
    // 判断当前节点上是否包含parentClassName
    if(current.classList.contains(parentClassName)){
      // 如果包括，则直接返回
      return current
    }
    // 如果不包括，则继续上浮一层
    current = current.parentNode
  }
  // 如果最后都没有找到
  return false
}
```
其中使用了 [classList](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList) 对象的contains方法进行是否包括某个类名的判断。在FileList.js文件中导入helper.js文件，如下：  

```javascript
import { getParentNode } from '../utils/helper'
```
我们先来做第一个“打开”功能，在useContextMenu中，传入的数组元素如下：  

```javascript
{
    label: '打开',
    click: () => {
    //console.log('clicking', clickedItem.current)
    const parentElement = getParentNode(clickedItem.current, 'file-item')
        if(parentElement){
          console.log(parentElement.dataset.id)
          onFileClick(parentElement.dataset.id)
        }
      }
    }
```
这样，我们点击右键，选择“打开”，那么当前文件就可以在右侧打开了，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnynitsmqpj31ko0l4wet.jpg)

但是这里出现了一个Bug，就是当我们想打开两个或者多个文件的时候，发现每次只能打开一个文件，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnynxkom8bj31ku0l8aab.jpg)

这是因为当我们在App.js文件中FileList组件上使用onFileClick回调函数的时候，会调用fileClick，如下：  

```javascript
<FileList
    files={ fileListArr }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ updateFileName }
/>
```
而这个fileClick函数的代码如下：  

```javascript
const fileClick = (fileID) => {
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    console.log(currentFile)
    // 如果当前文件是第一次被加载(不用每次点击都加载文件)
    // idLoaded这个状态是用于判断是否是第一次加载文件
    if(!currentFile.idLoaded){
      // 从本地文件中读取当前的文件
      fileHelper.readFile(currentFile.path).then(value => {
        // 更改idLoaded状态为true
        // 读取文件的body内容
        const newFile = { ...files[fileID], body: value, idLoaded: true }
        // 更新文件界面(此时不需要进行数据的持久化)
        setFiles({ ...files, [fileID]: newFile })
      }, (err) => {
        console.log(err)
        if(err){
          // 弹出警告框
          alert("你想打开的文件已经被某个调皮的孩子给删除了!")
          // 在持久化数据中删除这个不存在的文件
        }
      })
    }
    // if openedFiles don't have the current ID
    // then add new fileID to openedFiles
    if(!openedFileIDs.includes(fileID)){
      setOpenedFileIDs([ ...openedFileIDs, fileID ])
    }
  }
```
我们第一次点击“打开”按钮，结果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnyocjwyzgj31km01mjre.jpg)

这是一个尚未被加载的文件，只有id、path和title这3个属性。当我们关闭右边打开的文件，重新第二次点击“打开”按钮，发现结果和第一次完全相同。但是如果以点击的方式打开文件，则打印结果中多了isLoaded属性，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEly1gnyoipa3oej31ks020t8s.jpg)

先来看这段代码：  

```javascript
// if openedFiles don't have the current ID
    // then add new fileID to openedFiles
    if(!openedFileIDs.includes(fileID)){
      setOpenedFileIDs([ ...openedFileIDs, fileID ])
    }
```
其实我们出现Bug的原因在于这个openedFileIDs数组一直都是空的，我们调用的setOpenedFileIDs方法一直都只是简单的替换而没有让它添加多个。那么导致这个结果的最根本的原因还是在useContextMenu.js文件中的useEffect的参数2是个空数组导致的。那么要解决这个问题有两种解决办法：  
+ 直接删除参数2

```javascript
const useContextMenu = (itemArr, targetSelector) => {
  // 创建useRef对象
  let clickedElement = useRef(null)
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e) => {
      // only show the context menu on current dom element
      // or targetSelector contains target
      // 只有当选择器targetSelector选择的范围内
      // 包含点击目标的时候才弹出上下文菜单窗口
      if(document.querySelector(targetSelector).contains(e.target)){
        // 使用current属性保存有用的信息
        clickedElement.current = e.target
        // 指定在哪个window中弹出菜单
        menu.popup({window: remote.getCurrentWindow() })
      }
    }
    // 监听上下文菜单
    window.addEventListener('contextmenu', handleContextMenu)
    // 清除监听
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  })
  // 返回保存有节点信息的对象
  return clickedElement
}
```
优化后的代码：  

```javascript
const useContextMenu = (itemArr, targetSelector, deps) => {
  // 创建useRef对象
  let clickedElement = useRef(null)
  useEffect(() => {
    const menu = new Menu()
    itemArr.forEach(item => {
      menu.append(new MenuItem(item))
    })
    const handleContextMenu = (e) => {
      // only show the context menu on current dom element
      // or targetSelector contains target
      // 只有当选择器targetSelector选择的范围内
      // 包含点击目标的时候才弹出上下文菜单窗口
      if(document.querySelector(targetSelector).contains(e.target)){
        // 使用current属性保存有用的信息
        clickedElement.current = e.target
        // 指定在哪个window中弹出菜单
        menu.popup({window: remote.getCurrentWindow() })
      }
    }
    // 监听上下文菜单
    window.addEventListener('contextmenu', handleContextMenu)
    // 清除监听
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, deps)
  // 返回保存有节点信息的对象
  return clickedElement
}
```
那么在FileList.js文件中调用useContextMenu的时候，同样多传入一个[files]数组作为依赖项，如下：  

```javascript
const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        //console.log('clicking', clickedItem.current)
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if(parentElement){
          console.log(parentElement.dataset.id)
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        //console.log('renaming')
      }
    },
    {
      label: '删除',
      click: () => {
        console.log('deleting')
      }
    }
  ], '.file-list', [files])
```
这样也就是说，每当我们的files有所改变的时候，我们的useEffect就会重新运行一次。那么当我们打开某个文件的时候，文件中内置的isLoaded或者body等指发生了变化，所以useEffect也对应地发生了变化，这样就可以在TabList组件上同时打开多个文件了。  
在完成了“打开”功能以后，同理可以完成“重命名”和“删除”功能，在FileList.js文件中编辑代码。如下：  

```javascript
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
          //console.log('clicking', clickedItem.current)
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if(parentElement){
          console.log(parentElement.dataset.id)
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        //console.log('renaming', clickedItem.current)
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if(parentElement){
          //console.log(parentElement.dataset.id)
          setEditStatus(parentElement.dataset.id);
          setValue(parentElement.dataset.title);
        }
      }
    },
    {
      label: '删除',
      click: () => {
        console.log('deleting', clickedItem.current)
        const parentElement = getParentNode(clickedItem.current, 'file-item')
        if(parentElement){
          console.log(parentElement.dataset.id)
          onFileDelete(parentElement.dataset.id)
        }
      }
    }
  ], '.file-list', [files])
```
运行项目，测试相关功能。

# 原生应用菜单
## 原生应用菜单简介  
electron的菜单分为上下文菜单和原生应用菜单两大类，上下文菜单我们已经成功地实现了，现在我们来探讨如何添加原生应用菜单。原生应用菜单是原生应用程序非常重要的组成部分，但是对于不同的操作系统而言，程序的原生应用菜单是不一样的。如图： 

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzjjfh5twj31e60f80tt.jpg)

可见，Mac系统的最左边有一个当前应用程序名称的菜单分类， [Windows系统](https://docs.microsoft.com/en-us/windows/win32/uxguide/cmd-menus) 是没有这个分类选项的。

还有一个重要的考量就是快捷键是否好用，所以给我们的程序添加快捷键也是必不可少的过程。我们都知道Mac和Windows系统下的快捷键是不一样的。Mac系统一般使用Command+组合键，Windows系统一般使用ctrl+组合键。在 [MenuItem](https://www.electronjs.org/docs/api/menu-item#roles) 这个对象上面提供了一个叫做 [accelerator](https://www.electronjs.org/docs/api/accelerator) 的属性，使用这个属性可以设置不同平台的快捷键。  

当我们没有设置任何menu值的时候，electron会为我们提供一个[默认的菜单](https://github.com/carter-thaxton/electron-default-menu/blob/master/index.js)。我们可以对比electron的原生菜单和对应的文件代码来进行学习。如图： 

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzkalnooij317e0eymy2.jpg)

但是我们现在想自定义一个中文版的菜单，原型图如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzkldlhiyj31i40eawgi.jpg)

这个里面大多数的条目选项都可以在默认菜单里面找到对应的实现方法，其中我们重点需要完成的是“文件”类下的几个选项，比如新建、保存、搜索和导入等。

## 添加原生应用菜单编码  
首先我们将 [默认的菜单](https://github.com/carter-thaxton/electron-default-menu/blob/master/index.js) 的内容拷贝过来，然后参考我们的原型图把一些文字换成中文，形成menuTemplate.js文件，将文件放在项目的src目录下，代码如下：  

```javascript
const { app, shell, ipcMain } = require('electron')

let template = [{
  label: '文件',
  submenu: [{
    label: '新建',
    accelerator: 'CmdOrCtrl+N',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('create-new-file')
    }
  },{
    label: '保存',
    accelerator: 'CmdOrCtrl+S',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('save-edit-file')
    }
  },{
    label: '搜索',
    accelerator: 'CmdOrCtrl+F',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('search-file')
    }
  },{
    label: '导入',
    accelerator: 'CmdOrCtrl+O',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('import-file')
    }
  }]
},
{
  label: '编辑',
  submenu: [
    {
      label: '撤销',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo'
    }, {
      label: '重做',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo'
    }, {
      type: 'separator'
    }, {
      label: '剪切',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: '复制',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: '全选',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }
  ]
},
{
  label: '云同步',
  submenu: [{
    label: '设置',
    accelerator: 'CmdOrCtrl+,',
    click: () => {
      ipcMain.emit('open-settings-window')
    }
  }, {
    label: '自动同步',
    type: 'checkbox',
    enabled: qiniuIsConfiged,
    checked: enableAutoSync,
    click: () => {
      settingsStore.set('enableAutoSync', !enableAutoSync)
    }
  }, {
    label: '全部同步至云端',
    enabled: qiniuIsConfiged,
    click: () => {
      ipcMain.emit('upload-all-to-qiniu')
    }
  }, {
    label: '从云端下载到本地',
    enabled: qiniuIsConfiged,
    click: () => {
      
    }
  }]
},
{
  label: '视图',
  submenu: [
    {
      label: '刷新当前页面',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow)
          focusedWindow.reload();
      }
    },
    {
      label: '进入全屏幕',
      accelerator: (() => {
        if (process.platform === 'darwin')
          return 'Ctrl+Command+F';
        else
          return 'F11';
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow)
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
      }
    },
    {
      label: '切换开发者工具',
      accelerator: (function() {
        if (process.platform === 'darwin')
          return 'Alt+Command+I';
        else
          return 'Ctrl+Shift+I';
      })(),
      click: (item, focusedWindow) => {
        if (focusedWindow)
          focusedWindow.toggleDevTools();
      }
    },
  ]
},
{
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
},
{
  label: '帮助',
  role: 'help',
  submenu: [
    {
      label: '学习更多',
      click: () => { shell.openExternal('http://electron.atom.io') }
    },
  ]
},
]

// 如果是在Mac系统下
if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [{
      label: `关于 ${name}`,
      role: 'about'
    }, {
      // 分割线
      type: 'separator'
    }, {
      label: '设置',
      accelerator: 'Command+,',
      click: () => {
        ipcMain.emit('open-settings-window')
      }
    }, {
      label: '服务',
      role: 'services',
      submenu: []
    }, {
      type: 'separator'
    }, {
      label: `隐藏 ${name}`,
      accelerator: 'Command+H',
      role: 'hide'
    }, {
      label: '隐藏其它',
      accelerator: 'Command+Alt+H',
      role: 'hideothers'
    }, {
      label: '显示全部',
      role: 'unhide'
    }, {
      type: 'separator'
    }, {
      label: '退出',
      accelerator: 'Command+Q',
      click: () => {
        app.quit()
      }
    }]
  })
} else { // 如果是其他平台
  template[0].submenu.push({
    label: '设置',
    accelerator: 'Ctrl+,',
    click: () => {
      // ipcMain发送open-settings-window事件
      ipcMain.emit('open-settings-window')
    }
  })
}

module.exports = template

```
可见，我们在代码中使用了一个 [shell模块](https://www.electronjs.org/docs/api/shell)。其中我们需要特别关注的是“文件”这个Tab选项卡下的选项及其代码，如下：  

```javascript
  label: '文件',
  submenu: [{
    label: '新建',
    accelerator: 'CmdOrCtrl+N',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('create-new-file')
    }
  },{
    label: '保存',
    accelerator: 'CmdOrCtrl+S',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('save-edit-file')
    }
  },{
    label: '搜索',
    accelerator: 'CmdOrCtrl+F',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('search-file')
    }
  },{
    label: '导入',
    accelerator: 'CmdOrCtrl+O',
    click: (menuItem, browserWindow, event) => {
      browserWindow.webContents.send('import-file')
    }
  }]
```
这段代码中的menuItem表示点击了哪个选项，browserWindow表示在哪个窗口中，event表示相应的事件。当点击某一选项的时候，我们需要真正控制react应用的行为。但是menu是Main Process中的模块，而react是在Renderer Process中，所以这里又需要进行跨进程处理。之前我们是通过remote实现了跨进程，但是设置原生菜单我们需要在Main Process中使用browserWindow.webContents调用send方法发送给Renderer Process(渲染进程)。然后在Renderer Process中使用ipcRenderer监听消息。 

在Main.js文件中，引入menuTemplate.js文件和Menu模块，如下：  

```javascript
const { app, BrowserWindow, Menu } = require('electron')
const menuTemplate = require('./src/menuTemplate')
```
然后在app监听的ready事件中设置menu，如下：  

```javascript
  // set the menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
```
运行项目：  

```shell script
npm run dev
```
原生菜单效果如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzsutezluj311k0bejrz.jpg)

我们在代码里面设置了role的条目的功能都可以直接使用，还有一些没有设置role属性的条目需要我们进行功能的定制。比如：点击“新建”以后，是使用browserWindow.webContents.send发送了一个create-new-file的事件，如下：  


```javascript
browserWindow.webContents.send('create-new-file')
```
所以我们需要在App.js中监听这个事件。在App.js文件中，首先导入useEffect和ipcRenderer，如下:  

```javascript
import React, { useState, useEffect } from 'react'
const { remote, ipcRenderer } = window.require('electron')
```
然后在App函数中编辑代码:  

```javascript
useEffect(() => {
    const callback = () => {
      console.log('hello from menu')
    }
    ipcRenderer.on('create-new-file', callback)
    return () => {
      ipcRenderer.removeListener('create-new-file', callback)
    }
  })
```
运行项目，在原生菜单的文件选项卡下点击“新建”选项，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnztfywhinj30nw09kaaf.jpg)

在控制台即可输出hello from menu字样，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzthsuraej319m06adfw.jpg)
使用快捷键Command+N或者Ctrl+N也可以得到同样的效果。这说明我们的Renderer Process已经监听到了相应的事件。但是代码写到这里我们发现如果把其他的几个功能项添加进来的话，又得写很多重复的逻辑。所以，我们接下来要做的就是把这些重复的逻辑抽出来独立成一个自定义Hook，同时完成文件的快捷键的一系列的操作。   

在项目src目录下的hooks文件夹中创建useIpcRenderer.js文件，编辑代码如下：  

```javascript
import { useEffect } from 'react'
const { ipcRenderer } = window.require('electron')

/*
 const obj = {
   'create-file': () => {},
   'remove-file': () => {}
 }
*/

const useIpcRenderer = (keyCallbackMap) => {
  useEffect(() => {
    Object.keys(keyCallbackMap).forEach(key => {
      ipcRenderer.on(key, keyCallbackMap[key])
    })
    return () => {
      // 清除副作用
      Object.keys(keyCallbackMap).forEach(key => {
        ipcRenderer.removeListener(key, keyCallbackMap[key])
      })
    }
  })
}

export default useIpcRenderer

```
在App.js文件中，导入useIpcRenderer.js文件，如下：  

```javascript
import useIpcRenderer from './hooks/useIpcRenderer'
```
首先删除useEffect这段代码，如下：  

```javascript
useEffect(() => {
    const callback = () => {
      console.log('hello from menu')
    }
    ipcRenderer.on('create-new-file', callback)
    return () => {
      ipcRenderer.removeListener('create-new-file', callback)
    }
  })
```
然后在App函数中调用useIpcRenderer，如下：  

```javascript
useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile
  })
```
运行项目，测试新建、保存和导入功能。  

还有一个“搜索”功能我们需要到FileSearch.js文件中去实现。首先在FileSearch.js文件中导入useIpcRenderer，如下：  

```javascript
import useIpcRenderer from '../hooks/useIpcRenderer'
```
然后在FileSearch函数中调用useIpcRenderer，如下：  

```javascript
useIpcRenderer({
  'search-file': () => {
     setInputActive(true)
  }
 })
```
然后测试原生菜单中的“搜索”功能。  

# 设置窗口  
## 设置窗口解决方案和流程分析  
我们已经实现了原生应用菜单并且绑定了快捷键和响应事件，但是菜单中还有一项“应用设置”没有实现。应用的设置是一个很关键的内容，在这个选项中往往可以根据用户的需求配置一些个性化的内容。它也是原生应用中一个很重要的功能模块。一般的设置分为两种：一种是页面在当前应用直接以Tab形式打开，比如VSCode的settings，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1go0rabr6d8j31fs0m8wf3.jpg)

还有一种是以单独的窗口存在，比如Mac的系统偏好设置，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1go0rg7o4o2j30xq0u0764.jpg)

那么我们选择哪种方案呢？  
就我们目前的界面来说，不太适合采用在当前窗口添加Tab选项卡的方式，因为还需要引入react-router等工具，增加了项目的复杂度。所以，我们优选直接弹出窗口的解决方案。这样，新建的窗口是一个新的Renderer Process。

![](https://tva1.sinaimg.cn/large/e6c9d24egy1go4bq5z0j1j214e0s6js5.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1go0sr7dn88j31800sk40k.jpg)

这是实现设置窗口和保存的流程，比较繁琐，但是这个跨进程通信的过程我们使用remote模块将没有这么多流程，只是我们需要知道即便是使用remote模块，它的底层的工作原理也是这样运作的，也是通过ipcRenderer、ipcMain、事件发送和监听机制来实现的。

## 添加设置窗口编码  
注意之前的menuTemplate.js文件中关于设置窗口的模板代码和导入ipcMain的代码：  

```javascript
const { app, shell, ipcMain } = require('electron')
```

在Mac系统下，代码如下:

```javascript
{
    label: '设置',
    accelerator: 'Command+,',
    click: () => {
      // ipcMain发送open-settings-window事件
      ipcMain.emit('open-settings-window')
    }
}
```
在Windows系统下，代码如下:  

```javascript
else { // 如果是其他平台
  template[0].submenu.push({
    label: '设置',
    accelerator: 'Ctrl+,',
    click: () => {
      // ipcMain发送open-settings-window事件
      ipcMain.emit('open-settings-window')
    }
  })
}
```
看到这个发送事件的方法，有人可能会问：我们的menuTemplate.js文件不是已经在ipcMain里面调用了吗？我们可以直接在这里写逻辑代码啊，为什么还要发送事件呢？其实我们这里是为了解耦，让事件处理都放到一个代码中统一去完成，在menuTemplate.js文件中不做任何的逻辑处理，这样看起来会更加的清爽。
IPC接收到消息之后就可以开始创建接口，那么怎么在同一个进程里面发送事件呢？其实 [ipcMain](https://www.electronjs.org/docs/api/ipc-main#ipcmainhandleoncechannel-listener)是EventEmitter类的一个实例。这个 [EventEmitter](https://nodejs.org/api/events.html#events_emitter_emit_eventname_args)是Node.js的一个模块，它有一个方法emitter.emit(eventName[, ...args])，如果想直接调用一个已经监听的事件，那么可以直接使用这个emit方法去完成。既然ipcMain是继承自EventEmitter，那么自然也能直接使用emit方法。

然后我们要创建窗口，之前创建窗口是直接使用BrowserWindow类创建，使用复制粘贴代码的方式实现多个窗口的创建，但是现在我们要在BrowserWindow类的基础上进行封装，我们要创建一个继承自BrowserWindow的新类来完成窗口的快速创建。

在src文件夹下创建AppWindow.js文件，同时可以参考 [ready-to-show](https://www.electronjs.org/docs/api/browser-window) 的文档做优雅地显示窗口的处理。
编辑代码如下：  

```javascript
const { BrowserWindow } = require('electron')

class AppWindow extends BrowserWindow {
  constructor(config, urlLocation) {
    // 默认选项
    const basicConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        // 设置node可用
        nodeIntegration: true,
        // 如果不设置的话，则后面remote不能获取到
        enableRemoteModule: true
      },
      show: false,
      backgroundColor: '#efefef',
    }
    // 使用config部分替换掉basicConfig
    const finalConfig = { ...basicConfig, ...config }
    super(finalConfig)
    this.loadURL(urlLocation)
    this.once('ready-to-show', () => {
      this.show()
    })
  }
}

module.exports = AppWindow

```

在main.js文件中，导入AppWindow，如下：  

```javascript
const AppWindow = require('./src/AppWindow')
```
然后修改main.js文件的代码，如下：  

```javascript
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
const isDev = require('electron-is-dev')
const path = require('path')
let mainWindow, settingsWindow

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1024,
    height: 680
  }

  const urlLoaction = isDev ? 'http://localhost:3000' : 'dummyurl'
  mainWindow = new AppWindow(mainWindowConfig, urlLoaction)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  
  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      //设置父窗口为mainWindow
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname,
      './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    // 变量回收
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  // set the menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})

```
注意，代码中使用了settings，所以我们需要在项目目录下和src并排的位置创建settings文件夹，里面创建settings.html文件，代码如下：  

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>设置</title>
    <link rel="stylesheet" href="../node_modules/bootstrap/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="./settings.css">
  </head>
  <body>
    <div class="container mt-4">
      <h5>设置</h5>
      <form id="settings-form">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link active" href="#" data-tab="#config-file-location">文件存储位置</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" data-tab="#qiniu-sync-params">七牛云同步</a>
          </li>
        </ul>
        <div id="config-file-location" class="config-area mt-4">       
          <div class="form-group">
            <label for="exampleInputPassword1">选择文件存储位置</label>
            <div class="input-group mb-2">
              <input type="text" id="savedFileLocation" class="form-control" placeholder="当前存储地址" readonly>
              <div class="input-group-append">
                <button class="btn btn-outline-primary" type="button" id="select-new-location">选择新的位置</button>
              </div>
            </div>
          </div>
        </div>
        <div id="qiniu-sync-params" class="config-area mt-4">
          <div class="form-group row">
            <label for="accessKey" class="col-3 col-form-label">Access Key</label>
            <div class="col-9">
              <input type="text" class="form-control" id="accessKey" placeholder="Access Key">
              <small id="acHelp" class="form-text text-muted">请在七牛云密钥管理下查看</small>
            </div>
          </div>
          <div class="form-group row">
            <label for="secretKey" class="col-3 col-form-label">Secret Key</label>
            <div class="col-9">
              <input type="password" class="form-control" id="secretKey" placeholder="Secret Key">
              <small id="skHelp" class="form-text text-muted">请在七牛云密钥管理下查看</small>
            </div>
          </div>
          <div class="form-group row">
            <label for="bucketName" class="col-3 col-form-label">Bucket名称</label>
            <div class="col-9">
              <input type="text" class="form-control" id="bucketName" placeholder="请输入 Bucket 名称">
            </div>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">保存</button>
      </form>
    </div>
  </body>
</html>
```
运行项目，在Electron选项下点击“设置”，如下：  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go4hv9c7g1j20y009674w.jpg)

弹出“设置窗口”，如图：  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go4hyafwt4j21ki0rmaar.jpg)

这样，设置页面就成功地弹出来了，我们弹出一个单独的窗口来管理应用的配置，同时还创建了一个窗口类，可以方便地创建不同大小的窗口。

接下来当我们点击“选择新的位置”按钮的时候，会弹出一个dialog对话框，通过这个对话框可以选择一个文件要保存到的地址(必须是文件夹)，选择完毕之后，我们需要将路径显示在左侧的输入框中，最后点击“保存”按钮，使用electron-store进行数据持久化，同时关闭设置窗口。  

在settings文件夹下新建settings.js文件，然后我们需要将这个文件在settings.html文件中导入，如下：  

```javascript
<script>
   require('./settings.js')
</script>
```
在settings.js文件中编辑代码，如下：  

```javascript
const { remote } = require('electron')

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  $('#select-new-location').addEventListener('click', () => {
      remote.dialog.showOpenDialog({
        properties: ['openDirectory'],
        message: '选择文件的存储路径'
      }).then(path => {
        console.log(path.filePaths)
      })
  })
})
```
运行项目，在原生菜单的Electron分类中点击“设置”，在弹出的dialog中点击“选择新的位置”，选择你想存储文件的文件夹，点击“打开”之后效果如下：  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go7ptw7k13j20rq0gkt93.jpg)

如果能获取到待存储的路径，那么就可以把该路径存储到输入框中，继续编写代码，如下:  

```javascript
document.addEventListener('DOMContentLoaded', () => {
  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径'
    }).then(path => {
      //console.log(path.filePaths)
      path = path.filePaths
      if(Array.isArray(path)){
        $('#savedFileLocation').value = path[0]
      }
    })
  })
})
```
目标效果如下:  
![](https://tva1.sinaimg.cn/large/e6c9d24egy1go7qk7b88ej20rk0eu74i.jpg)

然后接下来我们需要点击“保存”按钮，把该路径保存到electron-store中。编辑settings.js文件的代码，如下：  

```javascript
const { remote } = require('electron')
const Store = require('electron-store')
const settingsStore = new Store({name: 'Settings'})

const $ = (selector) => {
  const result = document.querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

document.addEventListener('DOMContentLoaded', () => {
  //从settingStore中取出之前存的地址
  let savedLocation = settingsStore.get('savedFileLocation')
  //如果之前的地址存在
  if(savedLocation){
    //将输入框中的地址修改为之前选择的地址(从electron-store中拿出来)
    $('#savedFileLocation').value = savedLocation
  }
  // 监听点击事件
  $('#select-new-location').addEventListener('click', () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径'
    }).then(path => {
      //console.log(path.filePaths)
      path = path.filePaths
      if(Array.isArray(path)){
        // 将输入框中的地址修改为选择的文件夹路径
        $('#savedFileLocation').value = path[0]
        // 修改savedLocation变量的值为新地址
        savedLocation = path[0]
      }
    })
  })
  //监听submit提交事件
  $('#settings-form').addEventListener('submit', () => {
    // 将savedLocation存储到settingStore中
    settingsStore.set('savedFileLocation', savedLocation)
    // 关闭窗口
    remote.getCurrentWindow().close()
  })
})

```
运行项目，测试，看输入框中是否能记住之前选择的地址路径。最后，我们的选择的地址也需要使用到App.js文件当中去，之前我们在App函数中写的savedLocation是设置的默认路径：  

```javascript
  // 这个documents指的是/var/root/Documents文件夹
  const savedLocation = remote.app.getPath('documents')
```
所以我们现在需要对这个路径进行修改。先在App.js文件中创建Store对象，如下：  

```javascript
const settingsStore = new Store({name: 'Settings'})
```
然后在App函数中修改savedLocation，如下：  

```javascript
  // 这个documents指的是/var/root/Documents文件夹
  // 将文件保存到自定义选择的文件路径中,如果不存在，则保存到默认的documents路径中
  const savedLocation = settingsStore.get('savedFileLocation') || 
  remote.app.getPath('documents')
```
这样，就可以将新建的文件保存到指定路径的文件夹下了。

