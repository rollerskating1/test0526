# 代码重构  
## Flatten State介绍 
目前我们的State结构数据操作方法基本是如下的形式：  

```javascript
  // 查找一个数据
  const activeFile = files.find(file => file.id === activeFileID)
  // 修改一个数据
  const fileChange = (id, value) => {
    // loop through file array to update to new value
    const newFiles = files.map(file => {
      if(file.id === id){
        file.body = value
      }
      return file
    })
    setFiles(newFiles)
    // update unsavedIDs
    if(!unsavedFileIDs.includes(id)){
      setUnsavedFileIDs([ ...unsavedFileIDs, id ])
    }
  }
  
  // 删除一个数据
  const deleteFile = (id) => {
    // filter out the current file id
    const newFiles = files.filter(file => file.id !== id)
    setFiles(newFiles)
    // close the tab if opened
    tabClose(id)
  }
```
那么这种结构有什么可以优化的地方呢？  
其实在数据结构中有一种结构叫做HashMap，在JavaScript中体现如下：  

```javascript
const files = {
  '1': { ...file },
  '2': { ...file2 }
}
// 查找一个数据
const activeFile = files[activeFileID]
// 修改一个数据
const modifiedFile = { ...files[id], title, isNew: false }
// 删除一个数据
delete files[deletedID]
```

这种处理方法叫做Flatten State，它的好处是：  
+ 解决数组冗余  
+ 数据处理更加方便  

## 修改State为Flatten State结构编码
首先在utils文件夹下新建一个helper.js的文件，编辑代码如下：  

```javascript
// 传入数组，返回Map类型的数据结构
export const flattenArr = (arr) => {
  // 归并
  return arr.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})
}

// 将Map重新转化为数组
export const objToArr = (obj) => {
  return Object.keys(obj).map(key => obj[key])
}
```
在App.js文件中导入，如下：  

```javascript
import { flattenArr, objToArr } from './utils/hepler'
```
然后修改和新增相关的代码， 如下：  
在App函数中新增代码：  
```javascript
// 新增的代码
const filesArr = objToArr(files)
console.log(filesArr)
```
修改前的代码：  

```javascript
const [ files, setFiles] = useState(defaultFiles)
// 查找一个数据
const activeFile = files.find(file => file.id === activeFileID)
const openedFiles = openedFileIDs.map(openID => {
  return files.find(file => file.id === openID)
})
const fileListArr = (searchFiles.length > 0) ? searchFiles : files
// 删除一个数据
const deleteFile = (id) => {
  // filter out the current file id
  const newFiles = files.filter(file =>   file.id !== id)
  setFiles(newFiles)
  // close the tab if opened
  tabClose(id)
}
// 修改一个数据
const fileChange = (id, value) => {
  // loop through file array to update to new value
  const newFiles = files.map(file => {
    if(file.id === id){
      file.body = value
    }
    return file
  })
  setFiles(newFiles)
  // update unsavedIDs
  if(!unsavedFileIDs.includes(id)){
    setUnsavedFileIDs([ ...unsavedFileIDs, id ])
  }
}
const updateFileName = (id, title) => {
  // loop throught files, and update the title
  const newFiles = files.map(file => {
    if(file.id === id){
      file.title = title
     // 文件保存之后，isNew属性需要重置成false
        file.isNew = false
      }
      return file
    })
  setFiles(newFiles)
}
// 创建新文件
const createNewFile = () => {
  const newID = uuidv4()
  const newFiles = [
      ...files,
      {
        id: newID,
        title: '',
        body: '## 请输入 Markdown',
        createAt: new Date().getTime(),
        // isNew是一个判断是否是新建文件的状态
        isNew: true 
      }
    ]
  setFiles(newFiles)
}
const fileSearch = (keyword) => {
  // filter out the new files based on the keyword
  const newFiles = files.filter(file => file.title.includes(keyword))
    setSearchFiles(newFiles)
}
```
修改后的代码：  

```javascript
const [ files, setFiles] = useState(flattenArr(defaultFiles))
// 查找一个数据
const activeFile = files[activeFileID]
const openedFiles = openedFileIDs.map(openID => {
  return files[openID]
}
const fileListArr = (searchFiles.length > 0) ?  
searchFiles : filesArr
// 删除一个数据
const deleteFile = (id) => {
  // filter out the current file id
  delete files[id]
  setFiles(files)
  // close the tab if opened
  tabClose(id)
}
// 修改一个数据
const fileChange = (id, value) => {
  const newFile = { ...files[id], body: value }
  setFiles({ ...files, [id]: newFile })
  // update unsavedIDs
  if(!unsavedFileIDs.includes(id)){
    setUnsavedFileIDs([ ...unsavedFileIDs, id ])
  }
}
const updateFileName = (id, title) => {
  const modifiedFile = { ...files[id], title, isNew: false }
  setFiles({ ...files, [id]: modifiedFile })
}
// 创建新文件
const createNewFile = () => {
  const newID = uuidv4()
  const newFile = {
    id: newID,
    title: '',
    body: '## 请输入 Markdown',
    createAt: new Date().getTime(),
    // isNew是一个判断是否是新建文件的状态
    isNew: true 
  }
  setFiles({ ...files, [newID]: newFile })
}
const fileSearch = (keyword) => {
  // filter out the new files based on the keyword
  const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchFiles(newFiles)
}
```

# 文件操作和数据持久化
文件的保存是一个很关键的功能，如果创建编辑的文件不能保存，那么应用也就失去了意义。在Node.js诞生之前，JavaScript只能在浏览器中使用；Node.js出现之后，JavaScript的应用场景更广泛了。那么，这里我们就会使用到Node.js提供的和本地文件系统交互的功能模块fs。  
之前我们讲过，在Renderer Process中运行的JS代码十分神奇，它不仅可以获得所有浏览器的API，还能使用Node.js的API，给我们带来一种全新的混合式的写法。但是在使用create-react-app创建出的react项目环境中，我们是否还能使用Node.js呢？  
运行项目，如下：  

```shell script
npm run dev
```
## 在React中使用Node.js
在App.js文件中，编写代码。如下：  

```javascript
const fs = require('fs')
console.dir(fs)
```
在控制台观察打印的结果，发现打印的Object是空的，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrtw75ygdj31l002eq2u.jpg)
也就是说，这个fs模块没有导入成功。但是我们之前单独学习electron的时候，使用这种方式是可以获取到fs模块的。带着这个疑问，我们去到 [electron的issue](https://github.com/electron/electron/issues/7300) 中去寻找答案。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnru2sqnjcj31ew0a8dgh.jpg)

也就是说，我们只需要将代码修改成如下的形式即可：  

```javascript
const fs = window.require('fs')
console.dir(fs)
```
运行项目，观察效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnru5e8bukj31ky0kugmz.jpg)

这样，我们就可以使用Node.js中的fs模块了。  

原因：其实我们的开发环境是localhost:3000，是使用create-react-app创建的，而create-react-app这个脚手架工具的底层使用的是webpack在运作，而webpack支持两种模块来进行打包。一种是ES6中的module的形式，另一种是CommonJS的Require形式。所以，当我们写成const fs = require('fs')形式的时候，我们并没有获取到Node.js提供给我们的fs模块，而是半路上被webpack截胡了。但是webpack根本就找不到fs模块，因为webpack是去node_modules文件夹里面寻找，发现根本找不到这个fs模块。当我们写成const fs = window.require('fs')的形式的时候，webpack会直接忽略掉这个引用，那么这个时候Node.js的运行环境就获取到了这个fs模块。  

## 在App中集成文件操作
在utils文件夹下创建fileHelper.js文件，编辑代码如下：  

```javascript
// 在React中使用的话就需要改成window对象调用的形式
const fs = window.require('fs').promises
const path = window.require('path')

const fileHelper = {
  // 读文件
  readFile: (path) => {
    return fs.readFile(path, { encoding: 'utf8' })
  },
  // 写文件
  writeFile: (path, content) => {
   return fs.writeFile(path, content, { encoding: 'utf8' })
  },
  // 重命名文件
  renameFile: (path, newPath) => {
    return fs.rename(path, newPath)
  },
  // 删除文件
  deleteFile: (path) => {
    return fs.unlink(path)
  }
}

export default fileHelper
```
对于新建文件的储存是在onSaveEdit触发的，在App.js文件中，如下：  

```javascript
<FileList
    files={ fileListArr }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ updateFileName }
/>
```
这个onSaveEdit对应的回调函数是updateFileName，如下：  

```javascript
const updateFileName = (id, title) => {
    const modifiedFile = { ...files[id], title, isNew: false }
    setFiles({ ...files, [id]: modifiedFile })
  }
```
但是更新文件名可能有两种情况，一种可能是新建一个文件后按Enter键，另一种情况是修改一个文件的标题。所以，我们希望添加一个参数来区分到底是新建文件还是对文件进行重命名。在FileList.js文件中修改代码：  
修改前的代码：  

```javascript
useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if(enterPressed && editStatus && value.trim() !== ''){
      onSaveEdit(editItem.id, value)
      // 设置编辑状态为false
      setEditStatus(false)
      // 设置值为空
      setValue('')
    }else if(escPressed && editStatus){
      closeSearch(editItem)
    }
  })
```
修改后的代码：  

```javascript
useEffect(() => {
    const editItem = files.find(file => file.id === editStatus)
    if(enterPressed && editStatus && value.trim() !== ''){
      onSaveEdit(editItem.id, value, editItem.isNew)
      // 设置编辑状态为false
      setEditStatus(false)
      // 设置值为空
      setValue('')
    }else if(escPressed && editStatus){
      closeSearch(editItem)
    }
  })
```

首先在App.js文件中引入fileHelper.js文件，如下：  

```javascript
import fileHelper from './utils/fileHelper'
```
然后我们在保存文件的时候，需要给文件指定一个常用的路径，比如Windows的“我的文档”，Mac系统的Documents文件夹等等。那么我们如何获取到这样的一个路径呢？这个时候我们就需要借助 [Electron](https://www.electronjs.org/docs/all#appgetpathname)来实现了。在Electron的Main Process上有一个app模块，app模块上的getPath方法可以获取到各种路径。   

但是我们现在是在App.js文件中写代码，当前是在Renderer Process上，那么我们可以使用remote模块快速访问Main Process上的模块。先导入模块：  


```javascript
// require node.js modules
const { join } = window.require('path')
const { remote } = window.require('electron')
```
然后在App函数中通过remote模块获取路径，如下：  

```javascript
const savedLocation = remote.app.getPath('documents')
```
接下来就开始调用writeFile方法来写入文件。  

修改前的代码：

```javascript
const updateFileName = (id, title) => {
  const modifiedFile = { ...files[id], title, isNew: false }
  setFiles({ ...files, [id]: modifiedFile })
}
```
修改后的代码：  

```javascript
const updateFileName = (id, title, isNew) => {
    const modifiedFile = { ...files[id], title, isNew: false }
    // 如果是新建文件
    if(isNew){
      // 调用writeFile方法写文件内容
      fileHelper.writeFile(join(savedLocation, `${title}.md`),
        files[id].body).then(() => {
          setFiles({ ...files, [id]: modifiedFile })
        })
    }else{
      // 如果是重命名
      fileHelper.renameFile(join(savedLocation, `${files[id].title}.md`),
        join(savedLocation, `${title}.md`)
    ).then(() => {
      setFiles({ ...files, [id]: modifiedFile })
    })
    }
 }
```
执行指令，运行项目：  

```shell script
npm run dev
```
点击新建文件按钮，输入文件名后按Enter键，然后去Documents文件夹下查看文件是否被创建；同理，也可以测试修改文件名功能。但是值得注意的是，在Mac系统下有两个Documents文件夹，路径分别是：  

```
/var/root/Documents
/Users/mac/Documents
```
我们创建的文件在/var/root/Documents路径下。

## 集成保存文件的功能  
在App.js文件中先导入faSave图标，如下：  

```javascript
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
```
然后在JSX中新增“保存”的按钮，如下：  

```javascript
<div className="row no-gutters button-group">
    <div className="col">
        <BottomBtn
            text="新建"
            colorClass="btn-primary"
            icon={faPlus}
            onBtnClick={createNewFile}
        />
    </div>
    <div className="col">
        <BottomBtn
            text="导入"
            colorClass="btn-success"
            icon={faFileImport}
        />
    </div>
    <div className="col">
        <BottomBtn
            text="保存"
            colorClass="btn-red"
            icon={faSave}
            onBtnClick={saveCurrentFile}
        />
    </div>
</div>
```
在App.css文件中添加样式代码。如下：  

```css
.btn-red{
  background-color: red !important;
  color: white !important;
}
```
效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gns8uc4ncij31ks0oe0t6.jpg)

在App.js文件App函数中新增保存文件的代码：  

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
运行项目，测试保存文件的功能。  

这样，我们就完成了文件的新建、写入和重命名的功能。但是现在存在一个很大的问题，每次创建好的文件，按Command+R刷新一下，文件在界面上就没有了。也就是说，数据没有实现持久化。

# 持久化保存数据
## 数据持久化解决方案  
在之前的课程里面我们已经成功地完成了文件的创建以及其他的操作，但是我们的App数据只能保存在JavaScript运行时的变量里面，当页面刷新的时候，App数据都没有了。那么现在我们要做数据的持久化，即将创建以及修改的文件数据存储在某个位置，即便刷新App之后，下次进入也能直接拿出来使用。  

数据持久化的方案：  
+ 数据库软件的方案  如：MySQL  mongDB等
+ 浏览器相关的解决方案  如：localStorage sessionStorage等
+ 基于文件的储存  如：使用 [Electron-store](https://github.com/sindresorhus/electron-store)  

安装electron-store的指令，如下：  

```shell script
npm install electron-store --save
```
这个electron-store在Electron的Main Process和Renderer Process中都能够使用，所以我们可以在App.js文件中直接使用。编写代码，如下：  

```javascript
const Store = window.require('electron-store')

const store = new Store()
store.set('name', 'Owin')
console.log(store.get('name'))
```
报错信息如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsqnwn38ij31kq0gymxx.jpg)

这是使用最新版的electron-store引起的Bug，我们可以尝试使用4.0.0的版本，安装指定的版本：  

```shell script
npm install electron-store@4.0.0 --save
```
继续将name删除，那么在此访问的时候将打印undefined，如下：  

```javascript
const Store = window.require('electron-store')

const store = new Store()
store.set('name', 'Owin')
console.log(store.get('name'))

store.delete('name')
console.log(store.get('name'))
```
效果如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsqsxkqfej31kw06caac.jpg)
说明这个name值已经被delete了。

## 将Electron-store集成到App中  
现在我们就把这个基于文件的储存方式使用到App中，在App.js文件中，编写如下的代码：  

```javascript
const Store = window.require('electron-store')
const fileStore = new Store({'name': 'ElectronFileData'})
```
现在我们的files已经进行flatten处理了，我们的持久化结构也完全能够做到保持和files中State一样的结构，但是我们并不想这么做。因为有一些状态信息，比如当我们新建文件的时候会有一个isNew状态，这个isNew状态信息我们不需要进行持久化处理。观察defaultFiles.js文件的代码。如下：  

```javascript
const defaultFiles = [
  {
    id: '1',
    title: 'first post',
    body: 'should be aware of this',
    createdAt: 189288312127
  },
  {
    id: '2',
    title: 'second post',
    body: '## this is the title',
    createdAt: 2315786970
  },
  {
    id: '3',
    title: '你好世界',
    body: '## this is the title',
    createdAt: 2315786972
  }
]
```
这里面的文件的内容body我们也不需要进行数据的持久化，因为我们在Documents文件夹中已经存有本地文件了。这样，我们才可以做到数据足够精简。我们需要存储的是id、title、path和createAt。在App.js文件中编写数据持久化的函数，如下：  

```javascript
// 文件持久化
const saveFilesToStore = (files) => {
  // we don't have to store any info in file system, eg: isNew, body, etc
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result
  }, {}) // {}表示初始值
  fileStore.set('files', filesStoreObj)
}
```

那么我们什么时候需要进行数据的持久化呢？  
我们不能在任何情况下都进行数据持久化，我们只需要在新建文件或者重命名文件以及删除文件的时候进行数据的持久化。所以我们需要对下面的代码进行改造：  

```javascript
  // 新建或者重命名文件
  const updateFileName = (id, title, isNew) => {
    const modifiedFile = { ...files[id], title, isNew: false }
    // 如果是新建文件
    if(isNew){
      // 调用writeFile方法写文件内容
      fileHelper.writeFile(join(savedLocation, `${title}.md`),
        files[id].body).then(() => {
          setFiles({ ...files, [id]: modifiedFile })
        })
    }else{
      // 如果是重命名
      fileHelper.renameFile(join(savedLocation, `${files[id].title}.md`),
        join(savedLocation, `${title}.md`)
      ).then(() => {
      setFiles({ ...files, [id]: modifiedFile })
      })
    }
 }
```
修改后的代码：  

```javascript
  // 新建或者重命名文件
  const updateFileName = (id, title, isNew) => {
    const newPath = join(savedLocation, `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    // 如果是新建文件
    if(isNew){
      // 调用writeFile方法写文件内容
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }else{
      const oldPath = join(savedLocation, `${files[id].title}.md`)
      // 如果是重命名
      fileHelper.renameFile(oldPath, newPath).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
   }
 }
```
那么现在，我们已经将数据存储到Electron-store中去了，就不能再从defaultFiles中去拿默认数据了。
修改前的代码：  

```javascript
  const [ files, setFiles] = useState(flattenArr(defaultFiles))
```
修改后的代码：  

```javascript
  const [ files, setFiles] = useState(fileStore.get('files') || {})
```
运行项目，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnssxiug38j31940u0mxn.jpg)

然后我们新建一个文件并命名，观察这个新建的文件是否已经存储在我们的持久化数据库里面。我们知道，之前的本地文件是通过Documents路径存储的，代码如下：  

```javascript
  // 这个documents指的是/var/root/Documents文件夹
  const savedLocation = remote.app.getPath('documents')
```
而这个Electron-store则是存储在：  

```
/var/root/Library/Application Support/myCloudMarkDown
```
其中的myCloudMarkDown是我们的项目的名称：  

```
"name": "myCloudMarkDown"
```
这个myCloudMarkDown文件夹下有一个ElectronFilesData.json的文件，这是我们在下面的代码中指定的：  

```javascript
// 持久化文件将被存储到/var/root/Library/Application Support/
// myCloudMarkDown/ElectronFilesData.json文件中
const fileStore = new Store({'name': 'ElectronFilesData'})
```
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsvun35u2j31kk0hsmxm.jpg)

打开ElectronFilesData.json文件查看如下：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsvvr929zj311w0ji3ze.jpg)

我们已经对新建文件和重命名文件做了数据的持久化，这个时候如果删除文件的话，虽然界面上的文件会被删除掉，但是刷新之后，还是处于未删除的状态，也就是说，这个删除文件的操作并没有被持久化，那么接下来我们要对删除功能做数据的持久化。  
先看一下删除文件的代码，如下：  

```javascript
  // 删除一个数据
  const deleteFile = (id) => {
    // filter out the current file id
    delete files[id]
    setFiles(files)
    // close the tab if opened
    tabClose(id)
  }
```
修改成如下的代码：  

```javascript
// 删除一个数据
  const deleteFile = (id) => {
    fileHelper.deleteFile(files[id].path).then(() => {
      delete files[id]
      setFiles(files)
      // 数据的持久化
      saveFilesToStore(files)
      // close the tab if opened
      tabClose(id)
    })
  }
```
运行项目，测试删除功能的持久化效果，如下:  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnswck14pkj31km0c274i.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnswctfj6xj311q0bkglw.jpg)

可见，删除文件之后，Electron-store提供的JSON文件中的数据和界面显示的数据保持一致，说明删除文件的操作已经实现了数据的持久化效果。

但是我们知道，数据的持久化中并没有做文件内容的持久化，文件的内容是被存储到本地文件中的。当我们点击文件的时候，这个时候我们是无法显示文件的内容的，这是我们接下来要完成的功能。

## 添加加载文件内容功能
我们想在点击左侧文件的时候，右侧能显示文件的内容，那我们就需要在点击的一瞬间使用fs模块来进行文件的读取，这样就可以大大节省数据的空间，精简数据的冗余。
首先我们来看fileClick的代码，如下：  

```javascript
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
    // if openedFiles don't have the current ID
    // then add new fileID to openedFiles
    if(!openedFileIDs.includes(fileID)){
      setOpenedFileIDs([ ...openedFileIDs, fileID ])
    }
  }
```
更新代码如下：  

```javascript
  // 点击文件
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    
    // 读取文件的信息
    if(!currentFile.isLoaded){
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ...files[fileID], body: value, isLoaded: true }
        setFiles({ ...files, [fileID]: newFile })
      })
    }
    
    // if openedFiles don't have the current ID
    // then add new fileID to openedFiles
    if(!openedFileIDs.includes(fileID)){
      setOpenedFileIDs([ ...openedFileIDs, fileID ])
    }
  }
```
运行项目，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsx9ihr4gj31kw0e274s.jpg)

## Bug处理
我们在新建文件的时候，如果直接按下Esc键，将报错，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsy5cem7rj31ks0l43z4.jpg)

报错信息：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnsy6dlr1uj31ku0gmq50.jpg)

我们按下Esc键的目的是为了删除掉这个新建文件，退出新建文件状态，自然是调用了删除文件的函数，如下：  

```javascript
  // 删除一个文件
  const deleteFile = (id) => {
    fileHelper.deleteFile(files[id].path).then(() => {
      delete files[id]
      setFiles(files)
      // 数据的持久化
      saveFilesToStore(files)
      // close the tab if opened
      tabClose(id)
    })
  }
```
在这个函数中，我们通过deleteFile删除硬盘上的某个文件之后，再做了更新状态和持久化数据的工作。但是却忽略了中间态的文件，也就是说还没有创建成功，没有保存到文件系统的isNew文件，这个时候新建的文件还只是显示出一个input框而已，只有在点击了Enter键之后，它才会持久化地保存到文件系统当中。所以，当我们新建文件的时候直接点击Esc键，它会调用deleteFile函数，此时的files[id].path是undefined，所以就报错了。  

要解决这个问题，我们可以判断一下文件是否拥有isNew这个字段，如果有isNew这个字段的话，就直接将文件删除；如果没有isNew这个字段的话，才做数据持久化等更多的操作。编辑代码：  

```javascript
// 删除一个文件
  const deleteFile = (id) => {
    // 如果是新建文件则直接删除
    if(files[id].isNew){
      // 删除文件
      delete files[id]
      // 设置文件状态
      setFiles(files)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        delete files[id]
        setFiles(files)
        // 数据的持久化
        saveFilesToStore(files)
        // close the tab if opened
        tabClose(id)
      })
    }
  }
```
运行项目，新建文件并输入文件名，此时直接按Esc键退出新建文件状态，结果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnszjafhpgj31ko0l00td.jpg)

点击Esc之后，这个新建文件框没有被删除，这是为什么呢？其实我们在之前已经说过，State的操作必须是所依赖的文件有所变化的情况下才会重新渲染。但是这里的files文件根本没有任何变化，所以没有重新渲染。我们可以验证一下。  
在App.js文件中的App函数中打印一下filesArr，如下：  

```javascript
// 将Map重新转化为数组
  const filesArr = objToArr(files)
  console.log('renderer file',filesArr)
```
运行项目，发现第一次有渲染，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnt03yxislj31kq07y3z1.jpg)

然后新建文件，也有渲染，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnt05fkvugj31kw06u74p.jpg)

但是当我们输入文件名并点击Esc键的时候，它根本就没有重新渲染(Render)。所以，删除这个新建条目也就无从谈起了。  

但是为什么之前我们可以实现重新渲染呢？  
这是因为我们之前有tabClose(id)这个代码，如下：  
```javascript
  // 关闭Tab项
  const tabClose = (id) => {
    // remove current id from openedFileIDs
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    // set the active to the first opened tab if still tabs left
    if(tabsWithout.length > 0){
      // 如果长度大于0,就将第0项设置为高亮
      setActiveFileID(tabsWithout[0])
    }else{
      // 如果没有就设置为空
      setActiveFileID('')
    }
  }
```
在这个tabClose(id)方法中也会做一些重新渲染的事情，让下面这两行无效的代码看起来貌似有效：  

```javascript
delete files[id]
setFiles(files)
```
当我们分情况处理的时候，在if分支中没有了tabClose(id)，自然也就无法实现重新渲染的效果了。  

那么我们尝试给一个新的拷贝。代码如下：  

```javascript
  // 删除一个文件
  const deleteFile = (id) => {
    // 如果是新建文件则直接删除
    if(files[id].isNew){
      // 删除文件
      delete files[id]
      // 设置文件状态
      setFiles({ ...files })
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        delete files[id]
        // 设置文件状态
        setFiles({ ...files })
        // 数据的持久化
        saveFilesToStore(files)
        // close the tab if opened
        tabClose(id)
      })
    }
  }
```
运行项目，新建文件的时候按Esc键退出，发现可以重新渲染了。但是，这并不是最完美的解决方案，上面的写法把files本身给修改了。在ES6中有一个展开表达式的写法给我们提供了新的思路，代码如下：  

```javascript
  // 删除一个文件
  const deleteFile = (id) => {
    // 如果是新建文件则直接删除
    if(files[id].isNew){
      // 删除文件
      const { [id]:value, ...afterDelete } = files
      // 设置文件状态
      setFiles(afterDelete)
    } else {
      fileHelper.deleteFile(files[id].path).then(() => {
        // 删除文件
        const { [id]:value, ...afterDelete } = files
        // 设置文件状态
        setFiles(afterDelete)
        // 数据的持久化
        saveFilesToStore(afterDelete)
        // close the tab if opened
        tabClose(id)
      })
    }
  }
```
运行项目，测试新建文件的时候直接按Esc按钮，发现新建条目可以被删除了。

还有一个Bug就是当我们刷新项目或者重新启动项目之后，原来已经保存好的文件在被打开的时候都会出现未保存标志(小红点)。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzwmn0hedj31f80gcjrv.jpg)

我们先看SimpleMDE组件上的onChange属性，代码如下：  

```html
<SimpleMDE
    key={ activeFile && activeFile.id }
    value={ activeFile && activeFile.body }
    onChange={(value) => {
        fileChange(activeFile.id, value)
    }}
    options={{
        minHeight: '515px',
        // 阻止自动下载
        autoDownloadFontAwesome: false
    }}
/>
```
在onChange属性上的回调函数中调用了fileChange方法，代码如下：  

```javascript
  // 修改一个数据
  const fileChange = (id, value) => {
      alert("fileChange被调用了!")
      const newFile = { ...files[id], body: value }
      setFiles({ ...files, [id]: newFile })
      // update unsavedIDs
      if(!unsavedFileIDs.includes(id)){
        setUnsavedFileIDs([ ...unsavedFileIDs, id ])
      }
  }
```
当我们刷新项目以后，点击文件的时候(文件内容没有任何改变)，这个fileChange就被调用了。如图:  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnzxjwj3clj31go0cigm5.jpg)
因为系统认为它监听到了键盘的变化，所以，我们需要对文件的内容是否变化做一个条件判断，如下：  

```javascript
// 修改一个数据
  const fileChange = (id, value) => {
    //如果文件的body有变化，才进行更新
    //(避免文件没修改也出现小红点)
    if(value !== files[id].body){
      alert("fileChange被调用了!")
      const newFile = { ...files[id], body: value }
      setFiles({ ...files, [id]: newFile })
      // update unsavedIDs
      if(!unsavedFileIDs.includes(id)){
        setUnsavedFileIDs([ ...unsavedFileIDs, id ])
      }
    }
  }
```
这样，只有文件的body内容有变化的时候才会将文件设置成未保存状态。

