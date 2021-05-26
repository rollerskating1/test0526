# TabList组件
## 分析TabList组件需求和状态
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gncn983ps4j316e0c674u.jpg)

## 分析TabList组件属性
**思路一**
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gncnjk5zq0j31400o4gpg.jpg)

**思路二**
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gncnt3lg9wj31ri0iejvl.jpg)

## TabList组件开发
**步骤**  
1. 在components文件夹下，创建TabList.js文件  
编辑代码如下：  

```javascript
import React from 'react'
import PropTypes from 'prop-types'

const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
  return ( 
    <ul className="nav nav-pills">
      { files.map(file => {
        return (
          <li className="nav-item" key={file.id}>
            <a
              href="#"
              className="nav-link"
            >
              { file.title }
            </a>
          </li>
         )
       })
      }
    </ul>
  )
}

TabList.propTypes = {
  files: PropTypes.array,
  activeId: PropTypes.string,
  onTabClick: PropTypes.func,
  onCloseTab: PropTypes.func
}
TabList.defaultProps = {
  unsaveIds: []
}

export default TabList

```
2. 在App.js文件中使用  
首先导入文件，如下：  

```javascript
import TabList from './components/TabList'
```
然后先把左右的宽度比例调整成col-3和col-9，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gno6pni909j31ku0j83z0.jpg)
继续将
```html
<h1>this is the right</h1>
```
替换成如下的TabList代码(注意：bg-primary已经删除)：  

```html
<div className="col-9 right-panel">
   <TabList
      files={defaultFiles}
   />
</div>
```
效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gno6x0gx2dj31ks0ewwen.jpg)
但是我们发现 **编辑** 和 **删除** 按钮已经变形了。这说明宽度不够，所以我们可以进到FileList.js文件中修改这两个按钮的col-1为col-2，同时调整整个的col比例，使得整体仍然是12等份即可。修改后效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gno75jve4ej31l00cat8w.jpg)
此时，我们发现右边多出一点宽度，这是因为在FileList.js文件中我们使用了row这个类。它是Bootstrap提供给我们的一个类，它是有一个默认的margin-left和margin-right值的，所以我们可以通过添加mx-0将其去掉，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gno79p64ibj312m03wt8n.jpg)
效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gno7bdkx97j31ky0dgweo.jpg)

3.  添加事件  
在TabList.js文件中，在li标签下的a标签上添加onClick事件，如下：  

```javascript
return (
    <ul className="nav nav-pills">
      { files.map(file => {
        return (
          <li className="nav-item" key={file.id}>
            <a
              href="#"
              className="nav-link"
              onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
            >
              { file.title }
            </a>
          </li>
         )
       })
      }
    </ul>
  )
```
然后在App.js文件中，在TabList组件上添加onTabClick属性，如下：  

```html
<div className="col-9 right-panel">
    <TabList
        files={defaultFiles}
        onTabClick={(id) => {console.log(id)}}
    />
</div>
```
这样，就可以打开控制台进行演示了，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gno7vutscoj31qq0l275x.jpg)

4.  显示active状态  
我们首先安装一个叫做 [classnames](https://github.com/JedWatson/classnames)的小工具。安装指令如下：  

```shell script
npm install classnames --save
```
这个小工具可以帮助我们拼接class，比较方便。首先在TabList.js文件中导入并修改代码，如下：  

```javascript
import classNames from 'classnames'

const TabList = ({ files, activeId, unsaveIds, onTabClick, onCloseTab }) => {
  return (
    <ul className="nav nav-pills">
      { files.map(file => {
        
        const fClassName = classNames({
          'nav-link': true,
          'active': file.id === activeId
        })
        
        return (
          <li className="nav-item" key={file.id}>
            <a
              href="#"
              className={fClassName}
              onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
            >
              { file.title }
            </a>
          </li>
         )
       })
      }
    </ul>
  )
}
```
在App.js文件中，将TabList组件的activeId属性的值设置成1，如下：  

```javascript
<div className="col-9 right-panel">
    <TabList
        files={defaultFiles}
        activeId="1"
        onTabClick={(id) => {console.log(id)}}
    />
</div>
```
观察效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnobjixn50j31kw0d6q38.jpg)

5.  关闭文件的图标  
首先在TabList.js文件中导入图标，并添加图标。如下：  

```javascript
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

return (
    <li className="nav-item" key={file.id}>
        <a
          href="#"
          className={fClassName}
          onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
        >
            { file.title }
          <span className="ml-2">
            <FontAwesomeIcon 
                icon={ faTimes }
            />
          </span>
       </a>
    </li>
)
```
效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnobwkzkwkj31kq0daweo.jpg)

6.  给组件添加样式文件  
如果我们想在项目中使用css预编译器，比如sass。那么我们需要先安装一下 [node-sass](![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnobwkzkwkj31kq0daweo.jpg)) 工具。 安装指令如下：  

```shell script
npm install node-sass --save
```
首先在src/components目录下新建TabList.scss文件，然后在TabList.js文件中导入，如下：  

```javascript
import './TabList.scss'
```
预设一个class类，比如：tablist-component  
在TabList.scss文件中编辑样式代码如下：  

```css
.tablist-component{
  // 普通情况下，小图标隐藏
  .close-icon {
    visibility: hidden;
  }
  // 当光标放上去，小图标出现
  .nav-link:hover .close-icon {
    visibility: visible;
  }
  // 如果是高亮状态，则小图标一直出现
  .nav-link.active .close-icon {
    visibility: visible;
  }
}
```
在TabList.js文件中添加上class，位置如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnocgb5lrbj31eq07y3yr.jpg)

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnocmh278tj30yw0bwdg1.jpg)

运行项目：  

```shell script
npm run dev
```
报错如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnocr6l436j315u0gegmg.jpg)

如果想安装指定的某个版本，比如：4.12.0，可以执行：  

```shell script
npm install node-sass@4.12.0 --save
```
最后运行，效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnodalo9n6j31km0dg0tm.jpg)

7.  添加关闭文件功能  
在TabList.js文件中，为faTimes图标添加onClick事件，如下：  

```javascript
return (
    <li className="nav-item" key={file.id}>
        <a
          href="#"
          className={fClassName}
          onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
        >
         { file.title }
          <span 
            className="ml-2 close-icon"
            onClick={ (e) => {e.preventDefault();onCloseTab(file.id)}}
          >
            <FontAwesomeIcon
              icon={ faTimes }
            />
          </span>
        </a>
    </li>
)
```
在App.js文件中的TabList组件上添加onCloseTab属性，如下：  

```javascript
<div className="col-9 right-panel">
    <TabList
        files={defaultFiles}
        activeId="1"
        onTabClick={(id) => {console.log(id)}}
        onCloseTab={(id) => {console.log('closing', id)}}
    />
</div>
```
测试，先点击onClick，然后再点击onCloseTab，发现onClick也被重复触发了，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnof8qf9g1j317w05ct8s.jpg)
这是因为事件的冒泡机制造成的。为了阻止冒泡，我们修改代码如下：  

```javascript
return (
    <li className="nav-item" key={file.id}>
        <a
            href="#"
            className={fClassName}
            onClick={(e) => { e.preventDefault(); onTabClick(file.id) }}
        >
            { file.title }
            <span 
                className="ml-2 close-icon"
                onClick={ (e) => {e.stopPropagation();onCloseTab(file.id)}}
            >
               <FontAwesomeIcon
                  icon={ faTimes }
               />
            </span>
        </a>
    </li>
)
```
8.  添加文件保存的标志  
在TabList.js文件中，添加代码如下：  

```javascript
const withUnsavedMark = unsaveIds.includes(file.id)
```
并在faTimes图标后面添加如下的代码:  

```javascript
{ withUnsavedMark && 
    <span className="rounded-circle ml-2 unsaved-icon"></span>
}
```
在TabList.scss文件中添加样式，如下：  

```
.unsaved-icon {
    display: inline-block;
    background: #d9534f;
    width: 11px;
    height: 11px;
}
```
在App.js文件中添加unsaveIds属性，如下：  

```javascript
<div className="col-9 right-panel">
    <TabList
        files={defaultFiles}
        activeId="1"
        unsaveIds={["1", "2"]}
        onTabClick={(id) => {console.log(id)}}
        onCloseTab={(id) => {console.log('closing', id)}}
    />
</div>
```
我们默认1和2均为为保存状态，运行观察效果，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnogkzjn3tj31kg0dqjrx.jpg)

我们希望当文件未保存的时候，小红点和小×不共存，只显示小红点。但是当光标放上去的时候，小×会出现。那么我们首先在FileList.js文件中给li标签添加一个withUnsaved的class，如下：  

```javascript
const fClassName = classNames({
    'nav-link': true,
    'active': file.id === activeId,
    'withUnsaved': withUnsavedMark
})
```
在TabList.scss文件中添加样式如下：  

```css
.tablist-component{
  // 普通情况下，小图标隐藏
  .close-icon {
    visibility: hidden;
  }
  // 当光标放上去，小图标出现
  .nav-link:hover .close-icon {
    visibility: visible;
  }
  // 如果是高亮状态，则小图标一直出现
  .nav-link.active .close-icon {
    visibility: visible;
  }
  .unsaved-icon {
      display: inline-block;
      // 红色
      background: #d9534f;
      width: 11px;
      height: 11px;
  }
  // 当文件未保存的时候，小×不显示
  .withUnsaved.nav-link .close-icon {
    display: none;
  }
  // 当光标放上去的时候，小×显示
  .withUnsaved.nav-link:hover .close-icon {
    display: inline-block;
  }
  // 当光标放上去的时候，小红点不显示
  .withUnsaved.nav-link:hover .unsaved-icon {
    display: none;
  }
}
```
运行，测试效果，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnoh3mebomj31kq0dqgm5.jpg)

## 选择MarkDown编辑器  
MarkDown编辑器的功能非常地复杂，一般不会自己开发，常选用第三方开源的富文本编辑器，比如：  [tinyMCE](https://www.tiny.cloud/)  界面如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnohfha2yzj31em0qs759.jpg)

但是我们不需要这么复杂的编辑器，我们只需要一个MarkDown编辑器即可，需要满足如下的几点需求：  
+ 支持预览模式  
+ 支持高亮显示不同内容  
+ 支持自定义工具栏  

我们可以去到 [GitHub](https://github.com/) 搜索关键词markdown editor，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnohsg4yuqj31pu0u0jti.jpg)
发现这个  [simplemde-markdown-editor](https://github.com/sparksuite/simplemde-markdown-editor) 非常适合。官网地址[SimpleMDE](https://simplemde.com/)。  
但是我们又发现它上一次更新已经很久了，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnohzw9vgij31bb0u0tan.jpg)  
那么有没有人在持续维护这个项目呢？我们搜索一下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnoi3g9p0ej319c0ko402.jpg)
我们找到这个  [easyMED](https://gitee.com/chengliang4810/easymde)  更贴近我们的需求。现在的问题是：有没有react版本的easyMED插件呢？其实还真有一个 [react-simplemed-editor](https://github.com/RIP21/react-simplemde-editor) 完美满足了我们的需求。  

1.  安装react-simplemed-editor  
在项目目录下执行指令：  

```shell script
npm install --save react-simplemde-editor
```

2. 引入文件  
在App.js文件中引入插件，如下：  

```javascript
import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"

<TabList
    files={defaultFiles}
    activeId="1"
    unsaveIds={["1", "2"]}
    onTabClick={(id) => {console.log(id)}}
    onCloseTab={(id) => {console.log('closing', id)}}
/>
<SimpleMDE
    key={activeFile && activeFile.id}
    value={activeFile && activeFile.body}
    onChange={(value) => {fileChange(activeFile.id, value)}}
    options={{
        minHeight: '515px',
        // 阻止自动下载
        autoDownloadFontAwesome: false
    }}
/>
```
运行项目，观察效果：  

```shell script
npm run dev
```
效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpi2hn38nj31ks0qat9b.jpg)
此时打开控制台，我们在编辑器中输入一些内容是可以打印出来的。图标不能显示的原因是国内无法访问国外的一个 [CDN](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/js/all.min.js")网址。我们可以把all.min.js文件下载到本地放到public目录下，然后在index.html文件中引入。如下：  

```javascript
<script src="./all.min.js" type="text/javascript"></script>
```
运行，观察效果。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnpii6q1qfj31ko0jqdga.jpg)
