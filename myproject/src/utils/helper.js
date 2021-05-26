// 传入数组，返回Map类型的数据结构
export const flattenArr = (arr) => {
  return arr.reduce((map, item) => {
    map[item.id] = item
    return map
  }, {})
}

// 将Map重新转化为数组
export const objToArr = (obj) => {
  return Object.keys(obj).map(key => obj[key])
}
