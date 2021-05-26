const fs = window.require('fs').promises
const path = window.require('path')

// 对象---方法和属性
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