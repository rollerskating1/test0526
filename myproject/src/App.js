import React, { useState } from 'react'
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
//import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import TabList from './components/TabList'
import SimpleMDE from 'react-simplemde-editor'
import "easymde/dist/easymde.min.css"
import { v4 as uuidv4 } from 'uuid'
import { flattenArr, objToArr } from './utils/helper'
import fileHelper from './utils/fileHelper'
const { join } = window.require('path')
const { remote } = window.require('electron')

//【注意】在create-react-app脚手架创建的react和electron项目中
// 必须在require的前面添加window才可以成功地获取到Node.js的各种模块
//const fs = window.require('fs')
//console.dir(fs)

const Store = window.require('electron-store');
// Electron-store对象
const fileStore = new Store({'name': 'jidian-1ban'});

function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {})
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFilesIDs ] = useState([])
  const [ searchFiles, setSearchFiles ] = useState([])
  
  // 获取保存文件的路径
  // 【/var/root/Documents】
  const savedLocation = remote.app.getPath('documents')
  console.log(savedLocation)
  
  // 新增的代码
  const filesArr = objToArr(files)
  console.log("render file",filesArr)
  
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
//const activeFile = files.find(file => file.id === activeFileID)
  const activeFile = files[activeFileID]
  // 点击文件名
  const fileClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
    
    // 读取文件的信息
    const currentFile = files[fileID]
    if(!currentFile.isLoaded){
      fileHelper.readFile(currentFile.path).then(value => {
        const newFile = { ... files[fileID], body: value, isLoaded: true }
        setFiles({ ...files, [fileID]: newFile })
      })
    }
    
    // add new fileID to openedFiles
    if(!openedFileIDs.includes(fileID)){
      setOpenedFileIDs([  ...openedFileIDs, fileID ])
    }
  }
  // 点击Tab选项
  const tabClick = (fileID) => {
    // set current active file
    setActiveFileID(fileID)
  }
  // 点击关闭
  const tabClose = (id) => {
    const tabWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabWithout)
    if(tabWithout.length > 0){
      // 如果长度大于0，就将第0项设置为高亮
      setActiveFileID(tabWithout[0])
    }else{
      // 如果没有就设置为空
      setActiveFileID('')
    }
  }
  // 文件改变
  const fileChange = (id, value) => {
//  const newFiles = files.map(file => {
//    if(file.id === id){
//      file.body = value
//    }
//    return file
//  })
// alert("fileChange被调用了")

//如果文件的body有变化，才进行更新
//（避免文件没修改也出现小红点）
if(value !== files[id].body){
	    const newFile = { ...files[id], body: value }
	//  setFiles(newFiles)
    setFiles({ ...files, [id]: newFile })
    // 更新未保存的文件的id
    if(!unsavedFileIDs.includes(id)){
      setUnsavedFilesIDs([ ...unsavedFileIDs, id ])
    }
}
  }
  // 删除文件
  const deleteFile = (id) => {	  
  
     // 如果是新建文件则直接删除
      if(files[id].isNew){
     	// delete files[id]
		const { [id]: value, ...afterDelete } =files
	  //更新状态
      // setFiles({ ...files })
	  setFiles(afterDelete)
     }else{
	 fileHelper.deleteFile(files[id].path).then(() => {
     // delete files[id]
     		const { [id]: value, ...afterDelete } =files
     //更新状态
     // setFiles({ ...files })
     setFiles(afterDelete)
	  // 数据持久化
      saveFilesToStore(files)
	  // 关闭tab选项卡
      tabClose(id)
    })
	 }
  }
  // 更新文件名
  const updateFileName = (id, title, isNew) => {
//  const newFiles = files.map(file => {
//    if(file.id === id){
//      file.title = title
//      // 文件保存之后，isNew属性需要重置成false
//      file.isNew = false
//    }
//    return file
//  })
    const newPath = join(savedLocation, `${title}.md`)
    const modifiedFile = { ...files[id], title, isNew: false, path: newPath }
    const newFiles = { ...files, [id]: modifiedFile }
    // 如果是新建文件
    if(isNew){
      // 调用writeFile方法写文件内容
      fileHelper.writeFile(newPath, 
      files[id].body).then(() => {
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
      })
    }else{
      const oldPath = join(savedLocation, `${files[id].title}.md`)
      // 如果是重命名
      fileHelper.renameFile(oldPath,newPath).then(() => {
        setFiles(newFiles)
        // 数据持久化
        saveFilesToStore(newFiles)
      })
    }

//  setFiles(newFiles)
//  setFiles({ ...files, [id]: modifiedFile })
  }
  
  // 搜索文件功能
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchFiles(newFiles)
  }
  // 如果搜索的文件数组中有元素，则使用searchFiles，否则就使用files
  const fileListArr = (searchFiles.length > 0) ? searchFiles : filesArr
  // 创建新文件
  const createNewFile = () => {
    const newID = uuidv4()
//  const newFiles = [
//    ...files,
//    {
//      id: newID,
//      title: '',
//      body: '## 请输入 Markdown',
//      createAt: new Date().getTime(),
//      isNew: true
//    }
//  ]
   const newFile = {
    id: newID,
    title: '',
    body: '## 请输入 Markdown',
    createAt: new Date().getTime(),
     // isNew是一个判断是否是新建文件的状态
    isNew: true
   }
    // 更新文件列表
//  setFiles(newFiles)
    setFiles({ ...files, [newID]: newFile })
  }
  
  // 保存当前的文件
  const saveCurrentFile = () => {
    fileHelper.writeFile(join(savedLocation, `${activeFile.title}.md`),
    activeFile.body).then(() => {
      setUnsavedFilesIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
    })
  }
  // 文件持久化
  const saveFilesToStore = (files) => {
    const filesStoreObj = objToArr(files).reduce((result, file) => {
//    console.log(result)
//    console.log(file)

      // 对象的解构
      const { id, path, title, createAt } = file
      result[id] = {
        id, 
        path, 
        title, 
        createAt
      }
      console.log(result[id])
      //console.log(result)
      return result
    }, {}) // {}表示初始值

    // 设置成electron-store的数据
    fileStore.set('files', filesStoreObj)
  }
  
  // JSX    JavaScript XML结构
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch
            title="我的云文档"
            onFileSearch={ fileSearch }
          />
          <FileList
            files={ fileListArr }
            onFileClick={ fileClick }
            onFileDelete={ deleteFile }
            onSaveEdit={ updateFileName }
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn 
                text="新建"
                colorClass="btn-primary no-border"
                icon={ faPlus }
                onBtnClick={ createNewFile }
              />
            </div>
            <div className="col">
              <BottomBtn 
                text="导入"
                colorClass="btn-success no-border"
                icon={ faFileImport }
              />
            </div>
            <div className="col">
              <BottomBtn 
                text="保存"
                colorClass="btn-red no-border"
                icon={ faSave }
                onBtnClick={ saveCurrentFile }
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          { !activeFile &&
            <div className="start-page">
              选择或者创建新的Markdown文档
            </div>
          }
          { activeFile && 
            <>
              <TabList 
                files={ openedFiles }
                activeId={ activeFileID }
                unsaveIds={ unsavedFileIDs }
                onTabClick={ tabClick }
                onCloseTab={ tabClose }
              />
              <SimpleMDE
                key={ activeFile && activeFile.id }
                value={ activeFile && activeFile.body }
                onChange={(value) => {fileChange(activeFile.id, value)}}
                options={{
                  minHeight: '515px',
                  // 阻止自动下载
                  autoDownloadFontAwesome: false
                }}
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
