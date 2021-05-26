import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import useKeyPress from '../hooks/useKeyPress'

const FileSearch = ({ title, onFileSearch }) => {
  const [ inputActive, setInputActive ] = useState(false)
  const [ value, setValue ] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  
  let node = useRef(null)
  // 定义closeSearch
  const closeSearch = () => {
    setInputActive(false)
  }
  
  useEffect(() => {
    if(enterPressed && inputActive){
      onFileSearch(value)
    }
    if(escPressed && inputActive){
      closeSearch()
    }
  })
  
  useEffect(() => {
    // 当点击搜索的时候才调用focus函数
    if(inputActive){
      // 自动获取焦点
      node.current.focus()
    }
    //只有当inputActive改变的时候才重新执行useEffect
  }, [inputActive])
  
  return (
    <div className="alert alert-primary d-flex
    justify-content-between align-items-center mb-0">
      { !inputActive && 
        <>
          <span>{ title }</span>
          <button type="button"
          className="icon-button"
          onClick={() => { setInputActive(true) }}
          >
            <FontAwesomeIcon
              title="搜索"
              size="lg"
              icon={ faSearch }
            />
          </button>
        </>
      }
      { inputActive &&
        <>
          <input className="form-control"
            value={ value }
            ref={node}
            onChange={ (e) => { setValue(e.target.value) } }
          />
          <button type="button"
            className="icon-button"
            onClick={ closeSearch }
          >
            <FontAwesomeIcon 
              title="关闭"
              size="lg"
              icon={ faTimes }
            />
          </button>
        </>
      }
    </div>
  )
}

// 添加属性检查
FileSearch.propTypes = {
  title: PropTypes.string,
  onFileSearch: PropTypes.func.isRequired
}
// 设置默认属性
FileSearch.defaultProps = {
  //如果同时添加了title属性，那么默认属性会被覆盖
  title: 'My Document'
}

export default FileSearch
