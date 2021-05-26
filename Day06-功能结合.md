# 功能结合  
## 分析设计State结构  
1. **State设计原则** 
+ 最小化State原则  
+ DRY - Don't Repeat Yourself  
+ 有些数据可以根据已有State计算得出
+ 使用多个State变量

2. **App State分析**
+ 文件列表
+ 搜索后的文件列表
+ 未保存的文件列表
+ 已经打开的文件列表
+ 当前被选中的文件  

初步分析State的结果如下：  

```javascript
files: [{id: '1', id: '2'}]
searchedFiles: [{id: '1'}, ...]
unsavedFiles: [{id: '2'}, ...]
openedFiles: [{id: '2'}, ...]
activeFile: [{id: '1'}, ...]
```
优化后的State数据结构如下：  

```javascript
files: [{id: '1'}, {id: '2'}, ...]
searchedFiles: ['1', '2', ...]
unsavedFileIDs: ['1', '2', ...]
openedFileIDs: ['2']
activeFileID: '1'
```
3. State传输数据流  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpju8qq6sj31660smwfs.jpg)

4. 分析已有组件回调数据流  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpjyyhzo6j31980scjsx.jpg)

5. App组件方法分析  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpk5e04mjj31580qsgpw.jpg)

## 给App组件添加状态  
1. 步骤  
在App.js文件中，首先将useState添加上，如下：  

```javascript
import React, { useState } from 'react'

function App() {
  const [ files, setFiles] = useState(defaultFiles)
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const openedFiles = openedFileIDs.map(openID => {
    return files.find(file => file.id === openID)
  })
  const activeFile = files.find(file => file.id === activeFileID)
```
然后修改代码，如下：  
修改前的代码：  
```javascript
<FileList
    files={ defaultFiles }
    onFileClick={ (id) => { console.log(id) } }
    onFileDelete={ (id) => { console.log('deleting', id) } }
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```
修改后的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={ (id) => { console.log(id) } }
    onFileDelete={ (id) => { console.log('deleting', id) } }
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```
修改前的代码：  

```javascript
<div className="col-8 right-panel">
    <TabList
        files={defaultFiles}
        activeId="1"
        unsaveIds={["1", "2"]}
        onTabClick={(id) => {console.log(id)}}
        onCloseTab={(id) => {console.log('closing', id)}}
    />
    <SimpleMDE
        value={defaultFiles[1].body}
        onChange={(value) => {console.log(value)}}
        options={{
          minHeight: '515px',
          // 阻止自动下载
          autoDownloadFontAwesome: false
        }}
    />
</div>
```
修改后的代码：  

```javascript
<div className="col-8 right-panel">
    {  !activeFile &&
        <div className="start-page">
            选择或者创建新的 Markdown 文档
        </div>
    }
    { activeFile &&
        <>
          <TabList
            files={openedFiles}
            activeId={activeFileID}
            unsaveIds={unsavedFileIDs}
            onTabClick={(id) => {console.log(id)}}
            onCloseTab={(id) => {console.log('closing', id)}}
          />
          <SimpleMDE
            key={ activeFile && activeFile.id }
            value={ activeFile && activeFile.body }
            onChange={(value) => {console.log(value)}}
            options={{
                minHeight: '515px',
                // 阻止自动下载
                autoDownloadFontAwesome: false
            }}
          />
        </>
    }
</div>
```
在App.css文件中添加样式，如下：  

```css
.start-page{
  font-size: 30px;
  height: 300px;
  line-height: 300px;
  color: #ccc;
  text-align: center;
}
.left-panel{
  min-height: 100vh;
  position: relative;
}
.button-group{
  position: fixed;
  width: 33.3%;
  bottom: 0;
}
.no-border{
  border-radius: 0 !important;
}
```
同时给父节点添加上相应的button-group类，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnplnagtgej313c0fgmxl.jpg)

运行，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnplrs6phwj31920u0mxn.jpg)

## 添加数据处理行为  
1. 添加文件点击功能  
在App.js文件中，在App函数中编辑代码，如下：  

```javascript
const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
    // add new fileID to openedFiles
    setOpenedFileIDs([ ...openedFileIDs, fileID ])
  }
```
在FileList组件上将简单的打印行为修改为fileClick，如下。  
修改前的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={ (id) => { console.log(id) } }
    onFileDelete={ (id) => { console.log('deleting', id) } }
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```
修改后的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={fileClick}
    onFileDelete={ (id) => { console.log('deleting', id) } }
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```
运行，点击左侧的文件，观察效果。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnponaw2foj31ku0l8gm2.jpg)

我们发现它可以重复被点击，所以我们需要添加一个条件进行控制，代码修改如下：  

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
然后再重复点击加以验证。

2. 添加Tab点击功能  
在App.js文件的App函数中添加如下的代码:  

```javascript
const tabClick = (fileID) => {
  // set current active file
  setActiveFileID(fileID)
}
```
在TabList组件上将简单的打印行为修改为tabClick，如下。  
修改前的代码：  

```javascript
<TabList
    files={ openedFiles }
    activeId={activeFileID}
    unsaveIds={unsavedFileIDs}
    onTabClick={(id) => {console.log(id)}}
    onCloseTab={(id) => {console.log('closing', id)}}
/>
```
修改后的代码：  

```javascript
<TabList
    files={ openedFiles }
    activeId={activeFileID}
    unsaveIds={unsavedFileIDs}
    onTabClick={tabClick}
    onCloseTab={(id) => {console.log('closing', id)}}
/>
```
运行，点击右边的Tab选项卡，我们发现当点击哪一个Tab选项卡的时候，高亮就到哪个选项卡上去。

3. 添加关闭Tab选项卡功能  
在App.js文件的App函数中添加如下的代码：  

```javascript
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
在TabList组件上将简单的打印行为修改为tabClose，如下。  
修改前的代码：  

```javascript
<TabList
    files={ openedFiles }
    activeId={activeFileID}
    unsaveIds={unsavedFileIDs}
    onTabClick={tabClick}
    onCloseTab={(id) => {console.log('closing', id)}}
/>
```

修改后的代码：  

```javascript
<TabList
    files={ openedFiles }
    activeId={activeFileID}
    unsaveIds={unsavedFileIDs}
    onTabClick={tabClick}
    onCloseTab={tabClose}
/>
```
运行，测试其功能。

4. 添加修改文件时的标记和更新文件的body 
在App.js文件的App函数中添加如下的代码：  

```javascript
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
```
在TabList组件上将简单的打印行为修改为fileChange，如下。  
修改前的代码：  

```javascript
<SimpleMDE
    key={ activeFile && activeFile.id }
    value={ activeFile && activeFile.body }
    onChange={(value) => {console.log(value)}}
    options={{
        minHeight: '515px',
        // 阻止自动下载
        autoDownloadFontAwesome: false
    }}
/>
```

修改后的代码：  

```javascript
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
运行，打开文件编辑新内容，观察效果。如下:  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpq9x3q3kj31kq0l0jrt.jpg)

5. 添加删除文件功能
在App.js文件的App函数中添加如下的代码：  

```javascript
const deleteFile = (id) => {
    // filter out the current file id
    const newFiles = files.filter(file => file.id !== id)
    setFiles(newFiles)
    // close the tab if opened
    tabClose(id)
  }
```
在FileList组件上将简单的打印行为修改为deleteFile，如下。

修改前的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={fileClick}
    onFileDelete={ (id) => { console.log('deleting', id) } }
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```
修改后的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```

6. 添加更新文件名功能  
在App.js文件的App函数中添加如下的代码：  

```javascript
const updateFileName = (id, title) => {
    // loop throught files, and update the title
    const newFiles = files.map(file => {
      if(file.id === id){
        file.title = title
      }
      return file
    })
    setFiles(newFiles)
  }
```
在FileList组件上将简单的打印行为修改为updateFileName。如下：  
修改前的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ (id, newValue) => { console.log(id); console.log(newValue) } }
/>
```

修改后的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ updateFileName }
/>
```
运行，测试并观察效果。  

7. 添加搜索文件功能  
在App.js文件的App函数中添加如下的代码：  

```javascript
const fileSearch = (keyword) => {
    // filter out the new files based on the keyword
    const newFiles = files.filter(file => file.title.includes(keyword))
    setFiles(newFiles)
}
```
在FileSearch组件上将简单的打印行为修改为fileSearch。如下。  
修改前的代码：  

```javascript
<FileSearch
    title="我的云文档"
    onFileSearch={(value) => {console.log(value)}}
/>
```
修改后的代码:  

```javascript
<FileSearch
    title="我的云文档"
    onFileSearch={fileSearch}
/>
```
运行代码，如下：  

```shell script
npm run dev
```
点击搜索按钮，输入某些关键字样，观察效果，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnprper452j31kw0e43yr.jpg)

乍一看好像没什么问题啊，但是如果我们先将文件打开，在TabList组件上有显示的情况下再搜索，就会发现出现Bug，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnprsl3jlaj31kq0e40t4.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnprvgayfwj31kw0euaao.jpg)

这是因为我们更新的是files，而在其他地方也都使用了这个files数组去显示和计算，这样就导致了TabList组件中使用files的地方出现了问题。所以，其实我们需要一个新的数组专门用于记录我们的搜索状态。这样就可以避免各个地方相互影响。  
所以，我们在App.js文件的App函数中添加一个新的状态，如下：  

```javascript
const [ searchFiles, setSearchFiles ] = useState([])
```
继续更新上面的fileSearch函数为：  

```javascript
const fileSearch = (keyword) => {
    // filter out the new files based on the keyword
    const newFiles = files.filter(file => file.title.includes(keyword))
    setSearchFiles(newFiles)
}
// 如果搜索的文件数组中有元素，则使用searchFiles，否则就使用files
  const fileListArr = (searchFiles.length > 0) ? searchFiles : files
```
在App.js文件的FileList组件上修改代码，如下：  
修改前的代码：  

```javascript
<FileList
    files={ files }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ updateFileName }
/>
```
修改后的代码：  

```javascript
<FileList
    files={ fileListArr }
    onFileClick={fileClick}
    onFileDelete={deleteFile}
    onSaveEdit={ updateFileName }
/>
```
运行，测试并观察效果，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpsczmo7dj31ks0bsaa9.jpg)

8. 添加新建文件功能  
我们首先安装一个 [uuid](https://www.npmjs.com/package/uuid) 通用唯一识别码。执行指令：  

```shell script
npm install --save uuid
```
然后在App.js文件中引入uuid，如下：  

```shell script
import { v4 as uuidv4 } from 'uuid'
```
在App函数中编写代码，如下：  

```javascript
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
```
运行项目，点击**新建**按钮并观察效果：  

```shell script
npm run dev
```
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrng4sssxj31960u0gm5.jpg)

发现并没有进入到编辑状态，所以我们继续优化。在FileList.js文件中修改代码，如下：  
修改前的代码：  

```javascript
<li
    className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
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
                className="col-6 c-link"
                onClick={ () => { onFileClick(file.id) } }
            >
                { file.title }
            </span>
            <button type="button"
              className="icon-button col-2"
              onClick={ () => { setEditStatus(file.id); setValue(file.title); } }>
            <FontAwesomeIcon
                title="编辑"
                size="lg"
                icon={ faEdit }
            />
            </button>
            <button type="button"
                className="icon-button col-2"
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
           <input className="form-control col-10" 
            value={value}
            onChange={ (e) => { setValue(e.target.value) } } />
            <button type="button"
                className="icon-button col-2"
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
```
修改后的代码：  

```javascript
<li
    className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
    key={ file.id }
>
    { ((file.id !== editStatus) && !file.isNew) &&
        <>
           <span className="col-2">
              <FontAwesomeIcon 
                size="lg"
                icon={ faMarkdown }
              />
            </span>
            <span
                className="col-6 c-link"
                onClick={ () => { onFileClick(file.id) } }
            >
                { file.title }
            </span>
            <button type="button"
                className="icon-button col-2"
                onClick={ () => { setEditStatus(file.id); setValue(file.title); } }>
                <FontAwesomeIcon
                    title="编辑"
                    size="lg"
                    icon={ faEdit }
                />
            </button>
            <button type="button"
                className="icon-button col-2"
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
    { ((file.id === editStatus) || file.isNew) &&
        <>
            <input className="form-control col-10" 
              value={value}
              placeholder="请输入文件名称"
              onChange={ (e) => { setValue(e.target.value) } } />
              <button type="button"
                className="icon-button col-2"
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
```
此时运行的效果，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnro0j152fj31900u0wf0.jpg)

这是一个sideEffect，我们需要添加一个Effect来解决这个问题。在FileList.js文件中，添加如下的代码：  

```javascript
useEffect(() => {
    const newFile = files.find(file => file.isNew)
    console.log(newFile)
    if(newFile){
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])
```
运行效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnro49d8pzj31990u00t8.jpg)

如果想让它在文件打开的时候就自动获取焦点并拥有提示信息，那么可以在FileList.js文件中添加如下的代码：  

```javascript
import React, { useState, useEffect, useRef } from 'react'
```
在FileList函数组件中，添加：  

```javascript
let node = useRef(null)

useEffect(() => {
    if(editStatus){
      node.current.focus()
    }
  }, [editStatus])
```
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnroilht74j318u0fm0tb.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrok502a6j319a0u0mxx.jpg)

当退出新建模式的时候，我们需要将这一条给删除掉。所以需要将closeSearch函数组件修改：  

```javascript
const closeSearch = (editItem) => {
    // 设置默认编辑状态
    setEditStatus(false)
    // 设置默认值
    setValue('')
    // if we are editing a newly created file,
    // we should delete this file when pressing esc
    if(editItem.isNew){
      onFileDelete(editItem.id)
    }
  }
```
同时将下面的代码进行修改：  
修改前的代码：  

```javascript
<button type="button"
    className="icon-button col-2"
    onClick={ closeSearch }>
    <FontAwesomeIcon 
        title="关闭"
        size="lg"
        icon={ faTimes }
    />
</button>
```
修改后的代码：  

```javascript
<button type="button"
    className="icon-button col-2"
    onClick={() => {closeSearch(file)}}>
    <FontAwesomeIcon 
        title="关闭"
        size="lg"
        icon={ faTimes }
    />
</button>
```
因为closeSearch有参数，所以我们在调用closeSearch的时候需要传入参数，如下：  

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
      // 【注意】这里需要传入参数editItem
      closeSearch(editItem)
    }
  })
```
运行项目，点击"新建按钮"，然后按Esc键退出，此时新建的Item项被删除。同理，按"×"同样删除新建的Item项。  

接下来是按Enter进行保存的功能，保存之后isNew的值需要设置成false。因为保存之后，该Item项就已经建好了，就不再是新建的Item项了。如果不重置这个isNew属性的话，它会一直影响我们的这个组件。在App.js文件中，修改updateFileName的代码，如下：  
修改前的代码：  

```javascript
const updateFileName = (id, title) => {
    // loop throught files, and update the title
    const newFiles = files.map(file => {
      if(file.id === id){
        file.title = title
      }
      return file
    })
    setFiles(newFiles)
  }
```
修改后的代码:  

```javascript
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
```
运行项目，点击"新建文件"按钮，输入文件名之后按Enter键，可见新建的文件可以被保存了。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrqla9f1bj31kw0l43yz.jpg)

但是如果我们不输入新的文件名，直接空文件名就Enter的话，那么文件也会被创建出来，所以我们需要再优化一下代码，在FileList.js文件中，如下：  
优化前的代码：  

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
      closeSearch(editItem)
    }
  })
```
优化后的代码：  

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
运行项目，测试空文件名，发现已经不可创建空文件了。

