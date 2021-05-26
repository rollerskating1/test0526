import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'

const FileList = ( { files, onFileClick, onSaveEdit, onFileDelete } ) => {
  const [ editStatus, setEditStatus ] = useState(false)
  const [ value, setValue ] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  let node = useRef(null)
  
  const closeSearch = (editItem) => {
    // 设置默认编辑状态
    setEditStatus(false)
    // 设置默认值
    setValue('')
    // 删除
    if(editItem.isNew){
      onFileDelete(editItem.id)
    }
  }
  
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
  
  // 有条件执行  当files改变的时候才执行useEffect
  useEffect(() => {
    const newFile = files.find(file => file.isNew)
    //console.log(newFile)
    if(newFile){
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])
  
  useEffect(() => {
    if(editStatus){
      //console.log(node.current)
      node.current.focus()
    }
  }, [editStatus])
  
  return (
    <ul className="list-group list-group-flush file-list">
      {
        files.map(file => (
          <li className="list-group-item bg-light row d-flex align-items-center file-item mx-0"
          key={ file.id }
          >
            { ((file.id !== editStatus) && !file.isNew) &&
              <>
                <span className="col-2"
                >
                  <FontAwesomeIcon
                    size="lg"
                    icon={ faMarkdown }
                  />
                </span>
                <span className="col-6"
                  onClick={ () => {onFileClick(file.id) } }
                >
                  { file.title }
                </span>
                <button type="button"
                  className="icon-button col-2"
                  onClick={ () => { setEditStatus(file.id); setValue(file.title); } }
                >
                  <FontAwesomeIcon
                    title="编辑"
                    size="lg"
                    icon={ faEdit }
                  />
                </button>
                <button type="button"
                className="icon-button col-2"
                onClick={ () => {onFileDelete(file.id) } }
                >
                  <FontAwesomeIcon
                    title="删除"
                    size="lg"
                    icon={ faTrash }
                  />
                </button>
              </>
            }
            {((file.id === editStatus) || file.isNew) &&
              <>
                <input className="form-control col-10" 
                  value={value}
                  ref={node}
                  placeholder="请输入文件名称"
                  onChange={ (e) => { setValue(e.target.value) } } />
                <button type="button"
                  className="icon-button"
                  onClick={ () => { closeSearch(file) } }>
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

// 添加属性类型检查
PropTypes.propTypes = {
  files: PropTypes.array,
  onFileClick: PropTypes.func,
  onFileDelete: PropTypes.func,
  onSaveEdit: PropTypes.func
}

export default FileList
