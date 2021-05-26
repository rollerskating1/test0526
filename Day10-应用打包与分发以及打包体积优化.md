# 应用打包与分发  
## 安装Electron builder  
在之前的课程中我们使用electron完成了仿Markdown云文档的所有的功能，但是现在的问题是：我们的项目是在本地开发环境完成的，每次都需要执行一条命令来启动整个应用。如下：  

```shell script
npm run dev
```
这显然不是最好的解决方案。在不同的平台上使用某个应用程序的时候一般都会有一个安装包来完成整个软件安装的过程。比如在Mac系统下有dmg格式后缀名的安装包，Windows系统下有exe后缀名的安装包，Linux系统下有deb后缀名的安装包等等。那么，把源代码转换成安装包的过程我们就称之为“打包”或者"[应用部署](https://www.electronjs.org/docs/tutorial/application-distribution)"。
这里我们将使用[electron-builder](https://github.com/electron-userland/electron-builder)来完成打包的任务。安装：  

```shell script
npm install electron-builder --save-dev
```

## 为生产环境build代码  
我们在main.js文件中曾经写过如下的代码：  

```javascript
const urlLoaction = isDev ? 'http://localhost:3000' : 'dummyurl'
```
意思就是说在开发环境下我们使用localhost:3000的服务，而这个服务是create-react-app创建的一个基于webpack-devServer的支持热更新的服务器，这个服务器只是为开发环境而使用。但是我们现在要打包部署，那就不再是开发环境，而是生产环境了。我们不可能再为一个打包的应用启动Node服务器，所以在生产环境下，我们需要一个本地的文件地址。我们之前写的dummyurl是一个假的地址。那么我们怎么生成这个本地文件地址呢？

其实要得到这个地址，我们可以先执行指令进行build，如下：  

```shell script
npm run build
```
这个build的过程实际上是使用 [webpack](https://webpack.js.org/) 生成生产环境的代码，最终可以得到一个build的文件夹和里面的相关静态文件。比如:index.html   

既然已经有了静态文件，那么我们现在就可以将dummyurl替换成build/index.html了。如下：  
替换前的代码：  

```javascript
const urlLoaction = isDev ? 'http://localhost:3000' : 'dummyurl'
```
替换后的代码：  

```javascript
const urlLoaction = isDev ? 'http://localhost:3000' :
    `file://${path.join(__dirname, './build/index.html')}`
```

## 添加配置文件  
我们可以借助 [electron-builder](https://www.electron.build/configuration/configuration) 的文档来完成配置文件package.json。如下：  

```json
{
  "name": "cloudMarkdown",
  "version": "0.1.0",
  "main": "main.js",
  "description": "Online Markdown Editor using Qiniu cloud service",
  "author": {
    "name": "Owin",
    "email": "xxx"
  },
  "repository": "",
  "private": true,
  "dependencies": {
    "@fortawesome/fontawesome-svg-core": "^1.2.34",
    "@fortawesome/free-brands-svg-icons": "^5.15.2",
    "@fortawesome/free-solid-svg-icons": "^5.15.2",
    "@fortawesome/react-fontawesome": "^0.1.4",
    "@testing-library/jest-dom": "^5.11.9",
    "@testing-library/react": "^11.2.3",
    "@testing-library/user-event": "^12.6.0",
    "bootstrap": "^4.5.3",
    "electron-is-dev": "^1.2.0",
    "electron-store": "^4.0.0",
    "qiniu": "^7.3.2",
    "react": "^17.0.1",
    "react-dom": "^17.0.1",
    "react-simplemde-editor": "^4.1.3",
    "uuid": "^8.3.2",
    "web-vitals": "^0.2.4",
    "classnames": "^2.2.6",
    "node-sass": "^4.12.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "concurrently \"wait-on http://localhost:3000 && electron .\" \"cross-env BROWSER=none npm start\"",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "prepack": "npm run build",
    "predist": "npm run build"
  },
  "homepage": "./",
  "build": {
    "appId": "cloudDoc",
    "productName": "七牛云文档",
    "copyright": "Copyright © 2021 ${author}",
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "settings/**/*",
      "package.json",
      "main.js",
      "./src/menuTemplate.js",
      "./src/AppWindow.js",
      "./src/utils/QiniuManager.js"
    ],
    "directories": {
      "buildResources": "assets"
    },
    "publish": null,
    "extends": null,
    "mac": {
      "category": "public.app-category.productivity",
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "dmg": {
      "background": "assets/appdmg.png",
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
    "win": {
      "target": [
        "msi",
        "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-Web-Setup-${version}.${ext}",
      "publisherName": "Owin"
    },
    "nsis": {
      "allowToChangeInstallationDirectory": true,
      "oneClick": false,
      "perMachine": false
    }
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ],
    "rules": {
      "no-undef": "off",
      "no-restricted-globals": "off",
      "no-unused-vars": "off"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "concurrently": "^5.3.0",
    "cross-env": "^7.0.3",
    "electron": "^11.2.0",
    "electron-builder": "^21.2.0",
    "wait-on": "^5.2.1",
    "webpack-cli": "^4.5.0",
    "react-scripts": "^4.0.1"
  }
}

```

**package.json文件详解**  

1. 在Electron的 [Introduction](https://www.electron.build/) 中有个Quick Setup Guide的步骤，需要添加如下的代码：  

```json
"scripts": {
  "pack": "electron-builder --dir",
  "dist": "electron-builder"
}
```
这个dist就是运行electron-builder，它是真正生成一个安装包。比如：Mac下的dmg，Windows下的exe，Linux下的deb文件等等。pack是运行electron-builder --dir，它的作用是直接生成一个安装完毕后的文件。  

我们一般执行打包的步骤是：  

```
npm run build
npm run dist 或者 npm run pack
```
也就是说，在执行dist或者pack之前，需要先执行build的步骤。为了节省这一个步骤，我们可以添加配置如下：  

```json
"prepack": "npm run build",
"predist": "npm run build"
```
prepack的意思是：当我们执行pack指令之前，会预先执行build的步骤。同理，predist的意思也是一样，当我们执行dist指令之前，会预先执行build的步骤。这样，我们就不用每次都执行两个步骤了。  

2. "extends": null  
如果在package.json文件中将"extends": null删除的话，执行：  

```shell script
npm run dist
```
将发生如下的报错：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnqy5zcwsyj31je0agwf6.jpg)

其实在 [electron文档](https://www.electron.build/configuration/configuration) 中，有详细的说明，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnqy8mjb87j313i07074o.jpg)
所以，我们需要设置"extends": null

3. 设置files属性  
这个files属性后面的数组中的内容表示使用手动的方式对需要打包的文件进行罗列，如下：  

```json
"files": [
    "build/**/*",
    "node_modules/**/*",
    "settings/**/*",
    "package.json",
    "main.js",
    "./src/menuTemplate.js",
    "./src/AppWindow.js",
    "./src/utils/QiniuManager.js"
]
```
其实这个是手动指定的方式，如果将这部分内容删除之后，运行打包没有任何问题的话，也是可以不需要进行手动指定的，此时，可以将这部分代码完全删除即可。

4. 设置"homepage": "./"  

如果在package.json文件中将"homepage": "./"删除的话，执行：  

```shell script
npm run dist
```
运行成功之后打开App应用程序的console控制台, 将发现如下的报错：
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnqzbmahlrj30z00dmdgn.jpg)

## 探究打包过程和生成文件内容  
我们已经使用electron-builder进行了打包，那么electron-builder的打包过程究竟是怎么样的呢？其实探究electron-builder的打包过程对于了解整个应用程序的运行和以后对于文件大小的优化是非常有帮助的。  

因为要达到跨平台的目的，每个electron应用都包含了整个V8引擎和Chromium内核，以至于一个空的electron项目使用electron-builder --dir(即pack命令) 打包后，大小都已经达到了100M+。而如果使用electron-builder(即dist命令)打包，那么整个安装包的大小是30M。那么我们目前的项目有多大呢？  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr072y43ij30vw0l2758.jpg)

我们可以进去看一下它的目录结构，如图，Mac系统下可以右键选择“显示包内容”，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr09deioej313a0dk0td.jpg)

在打开的Contents文件夹下有如下的内容：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr0bbijk7j30vw0hggma.jpg)

其中的Frameworks文件夹中就是我们所说的V8引擎和Chromium内核。MacOS中就是一个可执行程序。而在Resource文件夹下，有很多跟语言相关的文件夹和app.asar文件。如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr0hqmqb4j30vm0eqmxr.jpg)

如果是在Windows系统下，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr0qsa6vfj316c0gg40x.jpg)

那么这个app.asar文件有多大呢？  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr0u3meygj30vk0i4dgz.jpg)

那么这个 [asar文件](https://fileinfo.com/extension/asar) 到底是什么呢？它其实就是electron特有的一个压缩包，它没有经过任何的压缩，它的作用是用来保护源代码不被人看到。我们可以通过官方的asar工具来查看它。安装指令如下：  

```shell script
cnpm install -g asar
```

然后通过终端，先进入到Resources文件夹中。然后执行指令：  
```shell script
asar extract app.asar ./app
```
解压完毕之后，进入到app文件夹中查看，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnr18z8ixtj31ja09kt92.jpg)

发现这就是我们打包之前的源代码。

## 生成安装包  
我们继续参照 [electron-builder](https://www.electron.build/cli#targetconfiguration) 添加和安装包相关的一些配置。如果你不进行设置，它也会有一些默认的行为，如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrli9wr40j314m0mg75k.jpg)

1. 静态资源的存放位置  

```json
"directories": {
   "buildResources": "assets"
},
```
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrlmf9qlqj30vs0aaglt.jpg)

2. App安装的分类  

```json
"mac": {
  "category": "public.app-category.productivity",
  "artifactName": "${productName}-${version}-${arch}.${ext}"
},
```
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrlq5j85ej31bo0ku75i.jpg)

3. dmg文件类型的规范   

```json
"dmg": {
      "background": "assets/appdmg.png",
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
```
4. windows下生成安装包  

配置windows环境的代码：  

```json
"win": {
  "target": [
     "msi",
     "nsis"
  ],
  "icon": "assets/icon.ico",
  "artifactName": "${productName}-Web-Setup-${version}.${ext}",
  "publisherName": "Owin"
},
"nsis": {
  "allowToChangeInstallationDirectory": true,
  "oneClick": false,
  "perMachine": false
}
```
打包过程：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrm7q8nt7j31i20gsqcb.jpg)

打包的结果：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrm9zzghrj30w00ca75v.jpg)

点击nsis后的安装过程：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrmb73bu3j30xo0nmjur.jpg)

安装完毕的结果：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrmcgl05lj30q20bm0u4.jpg)

win10下程序运行的效果：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gnrmdou6a0j31bu0p20ts.jpg)

<br/>

# Electron打包体积优化

## Electron打包-前端优化-质的飞跃
之前的课程我们已经完成了软件安装包的生成，那么现在我们来进行项目的打包优化。打包优化是一个非常有必要的内容，因为我们之前通过pack或者dist出来的应用程序实在是太大了。这样的一个小小的应用程序居然有300多兆。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gochcf3e7nj30vq0h6dgq.jpg)

这么大体积的软件，我们肯定是不满意的。现在，我们一起来看看我们的这个软件的优化极限是多大。  
通过之前的学习，我们知道我们打包出来的最重要的文件是App.asar，如图：   
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gochdeiizqj313a0luq46.jpg)

这个App.asar是我们所有写的代码的结合体，这个里面也包含Electron原生模块和其他的一些源代码。我们有能力改变的就是这个App.asar文件的大小，目前App.asar是将我们的项目源代码整个打包，我们打包出来的文件特别大的原因是因为node_modules文件夹的体积特别大，占了100多兆。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocho9mh4mj30vq0podhg.jpg)  

我们的思路是如何做到不打包这个node_modules文件夹，或者让它需要打包的东西尽量少。其实，我们在执行npm run pack或者npm run dist之前，首先要执行npm run build这条指令build出一个build文件夹。这个build文件夹中已经包含了node_modules文件夹中的依赖。也就是说，我们执行npm run dist的时候，对node_modules文件夹和build文件夹各自进行打包，相当于对所需要的依赖进行了两次打包。  

所以我们需要做一些处理，我们希望在执行build指令的时候，直接把所需要的依赖build进build文件夹中的最终的文件里面，这样，就不需要将node_modules文件夹打包到应用程序里面了。这个build的过程有两个好处：一个是可以减小代码的体积，另一个是可以对代码进行混淆，避免暴露源代码。这个build所做的事情就是使用webpack把源代码打包成几个mini化的文件，项目所需要的依赖其实都已经以最小化的方式打包进这几个文件中了。如下：  

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocikj8xbtj30im0nqmxo.jpg)

我们不需要知道这个build的过程是怎么运作的，但是我们知道这些项目依赖和源代码都已经以最小化的方式放到这些js文件中去了。所以，我们完全没有必要把node_modules文件夹的整个文件夹都拷贝到应用中去，这完全是多此一举。  

我们要做的事情就是把dependencies中的依赖转移到devDependencies中去，因为electron-builder是不会打包devDependencies中的内容的。在修改之前，我们首先来看一下package.json文件中的依赖的情况。  

**package.json**文件  

```json
{
  "name": "cloudMarkdown",
  "version": "0.1.0",
  "main": "main.js",
  "description": "Online Markdown Editor using Qiniu cloud service",
  "author": {
    "name": "Owin",
    "email": "lichaozheng.g@163.com"
  },
  "repository": "",
  "private": true,
  "dependencies": {
    "@fortawesome/fontawesome-svg-core": "^1.2.34",
    "@fortawesome/free-brands-svg-icons": "^5.15.2",
    "@fortawesome/free-solid-svg-icons": "^5.15.2",
    "@fortawesome/react-fontawesome": "^0.1.4",
    "@testing-library/jest-dom": "^5.11.9",
    "@testing-library/react": "^11.2.3",
    "@testing-library/user-event": "^12.6.0",
    "axios": "^0.21.1",
    "bootstrap": "^4.5.3",
    "classnames": "^2.2.6",
    "electron-is-dev": "^1.2.0",
    "electron-store": "^4.0.0",
    "node-sass": "^4.12.0",
    "qiniu": "^7.3.2",
    "react": "^17.0.1",
    "react-dom": "^17.0.1",
    "react-simplemde-editor": "^4.1.3",
    "uuid": "^8.3.2",
    "web-vitals": "^0.2.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "concurrently \"wait-on http://localhost:3000 && electron .\" \"cross-env BROWSER=none npm start\"",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "prepack": "npm run build",
    "predist": "npm run build"
  },
  "homepage": "./",
  "build": {
    "appId": "cloudDoc",
    "productName": "七牛云文档",
    "copyright": "Copyright © 2021 ${author}",
    "directories": {
      "buildResources": "assets"
    },
    "publish": null,
    "extends": null,
    "mac": {
      "category": "public.app-category.productivity",
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "dmg": {
      "background": "assets/appdmg.png",
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
    "win": {
      "target": [
        "msi",
        "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-Web-Setup-${version}.${ext}",
      "publisherName": "Owin"
    },
    "nsis": {
      "allowToChangeInstallationDirectory": true,
      "oneClick": false,
      "perMachine": false
    }
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ],
    "rules": {
      "no-undef": "off",
      "no-restricted-globals": "off",
      "no-unused-vars": "off"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "concurrently": "^5.3.0",
    "cross-env": "^7.0.3",
    "electron": "^11.2.0",
    "electron-builder": "^21.2.0",
    "react-scripts": "^4.0.1",
    "wait-on": "^5.2.1",
    "webpack-cli": "^4.5.0"
  }
}

```
修改后的package.json文件：  

```json
{
  "name": "cloudMarkdown",
  "version": "0.1.0",
  "main": "main.js",
  "description": "Online Markdown Editor using Qiniu cloud service",
  "author": {
    "name": "Owin",
    "email": "lichaozheng.g@163.com"
  },
  "repository": "",
  "private": true,
  "dependencies": {
    "axios": "^0.21.1",
    "bootstrap": "^4.5.3",
    "electron-is-dev": "^1.2.0",
    "electron-store": "^4.0.0",
    "qiniu": "^7.3.2"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "concurrently \"wait-on http://localhost:3000 && electron .\" \"cross-env BROWSER=none npm start\"",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "prepack": "npm run build",
    "predist": "npm run build"
  },
  "homepage": "./",
  "build": {
    "appId": "cloudDoc",
    "productName": "七牛云文档",
    "copyright": "Copyright © 2021 ${author}",
    "directories": {
      "buildResources": "assets"
    },
    "publish": null,
    "extends": null,
    "mac": {
      "category": "public.app-category.productivity",
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "dmg": {
      "background": "assets/appdmg.png",
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
    "win": {
      "target": [
        "msi",
        "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-Web-Setup-${version}.${ext}",
      "publisherName": "Owin"
    },
    "nsis": {
      "allowToChangeInstallationDirectory": true,
      "oneClick": false,
      "perMachine": false
    }
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ],
    "rules": {
      "no-undef": "off",
      "no-restricted-globals": "off",
      "no-unused-vars": "off"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@fortawesome/fontawesome-svg-core": "^1.2.34",
    "@fortawesome/free-brands-svg-icons": "^5.15.2",
    "@fortawesome/free-solid-svg-icons": "^5.15.2",
    "@fortawesome/react-fontawesome": "^0.1.4",
    "@testing-library/jest-dom": "^5.11.9",
    "@testing-library/react": "^11.2.3",
    "@testing-library/user-event": "^12.6.0",
    "concurrently": "^5.3.0",
    "cross-env": "^7.0.3",
    "electron": "^11.2.0",
    "electron-builder": "^21.2.0",
    "react-scripts": "^4.0.1",
    "wait-on": "^5.2.1",
    "webpack-cli": "^4.5.0",
    "classnames": "^2.2.6",
    "node-sass": "^4.12.0",
    "react": "^17.0.1",
    "react-dom": "^17.0.1",
    "react-simplemde-editor": "^4.1.3",
    "uuid": "^8.3.2",
    "web-vitals": "^0.2.4"
  }
}

```

对比修改前后的package.json文件，比较dependencies和devDependencies部分，可以发现，我们已经将大部分的依赖放到了devDependencies中，而保留在dependencies中的几个依赖是我们在Main Process中要使用到的，所以需要保留在dependencies中。接下来，我们进行一次新的打包。执行指令：  

```shell script
npm run pack
```
打包结束之后，再次查看App的大小，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocjzvx4alj30vk0iwt9n.jpg)

相较于之前应用程序的体积，发现优化了将近180M。这是一次质的飞跃。此时，我们再次进入到Resources文件夹中，比如路径：  
/Users/mac/Desktop/Electron/cloudEditor/dist/mac/七牛云文档.app/Contents/Resources  

通过指令进行解压缩：  

```shell script
asar extract app.asar ./app
```
解压缩出来的app文件夹，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gockd093voj30vc0hy3z6.jpg)

继续进入到app文件夹中，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gockf8s4vxj30w20omgmx.jpg)

观察node_modules文件夹中的内容，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gockh9sktdj313g0awjro.jpg)

查看node_modules文件夹的大小，发现只剩下18M。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gockpoq1q6j30vs0okwg2.jpg)

我们只是做了小小的改动就优化了这么多的体积，体积优化得非常成功。那么这个项目还有没有继续优化的空间呢？  
其实到现在为止，我们还只是仅仅优化了前端的代码，即把React的代码进行了优化，但是Electron的Main Process主进程代码我们还没有进行任何的处理，所以，我们还有进行极限优化的空间。  

## Electron打包-Main Process优化-进阶优化  
前面我们完成了应用程序前端的优化，通过移动node_modules中依赖的方法，大大缩减了应用程序的大小。但是程序还没有达到最小，我们还有一个优化点就是Main.js这个代码。我们先来看一下Main.js文件的全部代码：  

```javascript
const  { app, BrowserWindow, Menu, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
let mainWindow, settingsWindow

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1160,
    height: 680
  }
  // const urlLoaction = isDev ? 'http://localhost:3000' : 'dummyurl'
  const urlLoaction = isDev ? 'http://localhost:3000' :
    `file://${path.join(__dirname, './build/index.html')}`
  mainWindow = new AppWindow(mainWindowConfig, urlLoaction)
  // 当关闭的时候，变量需要被回收掉
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    // 当关闭的时候，变量需要被回收掉
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  // set the menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})

```
在这个文件中可见，在Main.js文件中，也是有一些本地文件的依赖的，也有少量node_modules中的依赖。所以，我们也可以对这个Main.js文件先进行build，这样也可以为我们压缩一些空间。这个时候，我们可以使用和React打包一样的工具，即 [webpack](https://webpack.js.org/) 进行打包。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocojg3qgyj31fy0o6gp1.jpg)  

但是，和React打包不一样的是我们需要手动编写webpack的打包代码，对于webpack的内容这里不过多讲解，但是从上图可以看出一个非常朴素的思想：即给一个入口文件(entry)，webpack就可以把它打包成一个目标产出文件(output)。我们也不需要在本地安装webpack依赖了，因为create-react-app的内部已经使用了它，里面其实已经有webpack模块了。  

现在我们来写配置文件，首先在项目目录根目录下新建webpack.config.js文件(和main.js文件平行位置)，编辑代码如下：  

```javascript
const path = require('path')

module.exports = {
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'main.js'
  },
  node: {
    __dirname: false
  }
}
```
其中的 [target](https://webpack.js.org/configuration/target/) 属性和entry属性以及output属性都可以参考webpack的官方文档。然后在package.json文件中，添加运行脚本，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocp62f4u9j31440okdgy.jpg)

到终端项目目录下执行指令：  

```shell script
npm run buildMain
```
如果你是第一次运行，在这个运行的过程中有可能让你安装webpack-cli的工具，点击yes安装即可。执行完之后，我们进入到build文件夹下查看:  

```shell script
cd build
```
应该会出现一个main.js文件，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocpb8st69j31640g2t9b.jpg)

打包成功之后，我们就可以在package.json文件中做一些替换了。因为之前我们的入口文件是main.js，如图： 

![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocph23i7vj30x20h0dgc.jpg)  

但是现在经过打包之后变成了build/main.js了，所以需要对之前的main.js做一个替换。替换方法是在build属性中添加属性：  

```json
"extraMetadata": {
    "main": "./build/main.js"
},
```
添加的位置如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gocplv77qvj313g0os755.jpg)

在scripts脚本中也需要做一些修改。我们之前在prepack和predist中只需要build前端的react就可以了，但是现在还需要增加Electron Main Process的build，修改如下。

修改前：  

```json
"prepack": "npm run build",
"predist": "npm run build"
```

修改后：  

```json
"prepack": "npm run build && npm run buildMain",
"predist": "npm run build && npm run buildMain"
```

在main.js文件中，我们需要对index.html文件的路径做一些修改，之前index.html是在build路径下，所以路径如下：  

```javascript
const urlLoaction = isDev ? 'http://localhost:3000' :
    `file://${path.join(__dirname, './build/index.html')}`
```
但是现在经过builg之后，build出来的main.js和index.html在同一个文件夹下了，所以这个路径需要修改。如下：  

```javascript
const urlLoaction = isDev ? 'http://localhost:3000' :
    `file://${path.join(__dirname, './index.html')}`
```

然后我们还需要进行最后一步，在package.json文件中移走一些依赖。现在dependencies中还有一些依赖，如下:  

```json
"dependencies": {
  "axios": "^0.21.1",
  "bootstrap": "^4.5.3",
  "electron-is-dev": "^1.2.0",
  "electron-store": "^4.0.0",
  "qiniu": "^7.3.2"
}
```
现在的问题是: 哪些依赖能够移动，哪些依赖不能移动呢？
目前有两个不能移动的，一个是electron-store，因为它在Main Process和React中两边都用到了，我们在main.js中虽然已经进行了build的操作，可以删除，但是在react那边没有进行打包操作。我们之前在react中调用模块的时候都是使用window.require，这样webpack就会忽略这个包。所以这个electron-store需要留在dependencies中。  另一个是bootstrap，我们的settings页面在使用它，使用了bootstrap中的一个css样式，所以暂时这个bootstrap还不能移走，但是这个又是一个很好的优化方向。因为settings中仅仅只是使用了一个样式文件而已，后续我们可以试图把这个样式文件拷贝到build当中去，这个后面再探讨。  

此时开始移动依赖到devDependencies中去，结果如下：  

```json
"dependencies": {
   "bootstrap": "^4.5.3",
   "electron-store": "^4.0.0"
 },
```
整体package.json文件代码。如下：  

```json
{
  "name": "cloudMarkdown",
  "version": "0.1.0",
  "main": "main.js",
  "description": "Online Markdown Editor using Qiniu cloud service",
  "author": {
    "name": "Owin",
    "email": "lichaozheng.g@163.com"
  },
  "repository": "",
  "private": true,
  "dependencies": {
    "bootstrap": "^4.5.3",
    "electron-store": "^4.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "buildMain": "webpack",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "buildMain": "webpack",
    "dev": "concurrently \"wait-on http://localhost:3000 && electron .\" \"cross-env BROWSER=none npm start\"",
    "pack": "electron-builder --dir",
    "dist": "electron-builder",
    "prepack": "npm run build && npm run buildMain",
    "predist": "npm run build && npm run buildMain"
  },
  "homepage": "./",
  "build": {
    "appId": "cloudDoc",
    "productName": "七牛云文档",
    "copyright": "Copyright © 2021 ${author}",
    "directories": {
      "buildResources": "assets"
    },
    "extraMetadata": {
      "main": "./build/main.js"
    },
    "publish": null,
    "extends": null,
    "mac": {
      "category": "public.app-category.productivity",
      "artifactName": "${productName}-${version}-${arch}.${ext}"
    },
    "dmg": {
      "background": "assets/appdmg.png",
      "icon": "assets/icon.icns",
      "iconSize": 100,
      "contents": [
        {
          "x": 380,
          "y": 280,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 110,
          "y": 280,
          "type": "file"
        }
      ],
      "window": {
        "width": 500,
        "height": 500
      }
    },
    "win": {
      "target": [
        "msi",
        "nsis"
      ],
      "icon": "assets/icon.ico",
      "artifactName": "${productName}-Web-Setup-${version}.${ext}",
      "publisherName": "Owin"
    },
    "nsis": {
      "allowToChangeInstallationDirectory": true,
      "oneClick": false,
      "perMachine": false
    }
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ],
    "rules": {
      "no-undef": "off",
      "no-restricted-globals": "off",
      "no-unused-vars": "off"
    }
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@fortawesome/fontawesome-svg-core": "^1.2.34",
    "@fortawesome/free-brands-svg-icons": "^5.15.2",
    "@fortawesome/free-solid-svg-icons": "^5.15.2",
    "@fortawesome/react-fontawesome": "^0.1.4",
    "@testing-library/jest-dom": "^5.11.9",
    "@testing-library/react": "^11.2.3",
    "@testing-library/user-event": "^12.6.0",
    "concurrently": "^5.3.0",
    "cross-env": "^7.0.3",
    "electron": "^11.2.0",
    "electron-builder": "^21.2.0",
    "react-scripts": "^4.0.1",
    "wait-on": "^5.2.1",
    "webpack-cli": "^4.5.0",
    "classnames": "^2.2.6",
    "node-sass": "^4.12.0",
    "react": "^17.0.1",
    "react-dom": "^17.0.1",
    "react-simplemde-editor": "^4.1.3",
    "uuid": "^8.3.2",
    "web-vitals": "^0.2.4",
    "axios": "^0.21.1",
    "electron-is-dev": "^1.2.0",
    "qiniu": "^7.3.2"
  }
}

```
接下来到终端项目目录下运行指令：  

```shell script
npm run pack
```
运行完毕之后我们现在就在项目目录下，所以可以通过指令打开当前文件夹的图形界面，执行指令：  

```shell script
open .
```

![](https://tva1.sinaimg.cn/large/008eGmZEgy1godf4jyh7bj30vq0icq3s.jpg)

继续打开dist文件夹下的mac文件夹，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1godfghugkhj30vu0hajrw.jpg)

查看App应用的大小，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1godfkrcniej30vq0jmaaz.jpg)

可见，跟之前的199.3M相比较，现在是191.6M，再次优化了7.7M的体积容量。此次优化的容量比较有限，是因为Electron的逻辑代码和依赖量都比较小。如果项目比较大，代码量和依赖量比较多的时候那就非常可观了。我们本次课最重要的是学习项目优化的思路，从两个方面入手进行优化，一个是视图端，即React；另一个是Electron端，即Main Process主进程。经过对打包体积优化的探讨，大家对Electron-builder的工作原理更加清楚了。

## Electron打包-bootstrap优化-极限优化
经过之前的进阶优化，我们已经实现了Main Process的打包优化，但是却遗漏了一个点没有进行修改。先观察main.js文件的代码，如下：  

```javascript
const  { app, BrowserWindow, Menu, ipcMain } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const menuTemplate = require('./src/menuTemplate')
const AppWindow = require('./src/AppWindow')
let mainWindow, settingsWindow

app.on('ready', () => {
  const mainWindowConfig = {
    width: 1160,
    height: 680
  }
  // const urlLoaction = isDev ? 'http://localhost:3000' : 'dummyurl'
  const urlLoaction = isDev ? 'http://localhost:3000' :
    `file://${path.join(__dirname, './index.html')}`
  mainWindow = new AppWindow(mainWindowConfig, urlLoaction)
  // 当关闭的时候，变量需要被回收掉
  mainWindow.on('closed', () => {
    mainWindow = null
  })
  // hook up main events
  ipcMain.on('open-settings-window', () => {
    const settingsWindowConfig = {
      width: 500,
      height: 400,
      parent: mainWindow
    }
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
    settingsWindow = new AppWindow(settingsWindowConfig, settingsFileLocation)
    // 当关闭的时候，变量需要被回收掉
    settingsWindow.on('closed', () => {
      settingsWindow = null
    })
  })
  // set the menu
  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)
})

```
当我们把main.js经过build处理在build文件夹下生成一个新的main.js文件之后，这个settings.html的路径也应该进行修改。这里我们有两种基本的思路。  

**思路一**  
将main.js中的settings.html文件的路径修改成：  

```javascript
    const settingsFileLocation = `file://${path.join(__dirname, '../settings/settings.html')}`
```
因为当main.js被webpack打包到build文件夹下之后(文件名仍然是main.js)，build文件夹下的main.js文件和settings文件夹的相对路径变化了。所以需要将路径变成  

```shell script
../settings/settings.html
```
这样做虽然可以正常地运行项目功能，但是并没有把bootstrap优化掉。因为此时bootstrap仍然需要留在dependencies中。

**思路二**  
我们之前说过想对bootstrap也进行体积优化，这样就实现了体积极限优化。这个bootstrap在react当中是多处使用了，在settings.html当中仅仅使用了一个bootstrap.min.css样式文件而已。如果把bootstrap也挪到devDependencies中，react当中不会受到任何的影响，因为我们也会对bootstrap进行build处理。但是在settings.html当中就无法使用了。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1godtpne66pj30to0o076g.jpg)

为什么会无法使用呢？  
我们可以仔细揣摩一下这个过程，对React进行build的是React内置的webpack，它是通过内置的脚手架工具进行打包的，能够将devDependencies中的依赖进行打包，所以react中bootstrap在起作用，也就不会受到任何的影响。对Main Process进行build的也是React内置的webpack，但是是依据webpack.config.js这个文件中的内容进行打包的，没有将devDependencies中的依赖进行打包，所以settings.html文件中的样式会受到影响。  

我们为了对项目进行极限优化，需要把bootstrap也放到devDependencies中去，这个时候React是不受影响的，但是settings.html受到了影响，没有了bootstrap提供的bootstrap.min.css样式文件。所以，我们可以把这个样式文件直接放到build文件夹中去，这样，就不需要经过build这个步骤了。  

但是如果直接把样式文件和settings文件夹直接放到build文件夹下的话，也是存在问题的。因为这个build文件夹我们有可能随时删除掉。为了在删除build文件夹的时候settings文件夹和样式文件不受到任何的影响，我们需要在webpack.config.js文件中对settings文件夹和bootstrap.min.css样式文件做一个拷贝的步骤。  

先安装copy-webpack-plugin插件，如下：  

```shell script
npm install copy-webpack-plugin --save-dev
```
然后在webpack.config.js文件中编辑代码：  

```javascript
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'main.js'
  },
  plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, './settings'),
            to: 'settings'
          }
        ]
      })
  ],
  node: {
    __dirname: false
  }
}

```
这段代码是将settings文件夹copy到build文件夹下，这样可以保持main.js同settings文件夹的相对位置不变，也就是说main.js文件中的路径不用修改，可以保持不变。如下：  


```javascript
    const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
```

此时运行指令：  

```shell script
npm run  pack
```
在编辑器中观察，build文件夹中会有拷贝过去的settings文件夹的全部内容，如图：

![](https://tva1.sinaimg.cn/large/008eGmZEgy1godut3jx9xj30bg0vmq3i.jpg)

运行App应用程序并点击“设置”后，虽然会弹出设置的窗口，但是很明显没有css样式，如图： 

![](https://tva1.sinaimg.cn/large/008eGmZEgy1goduoxy732j31120ooq3p.jpg)

所以我们需要将settings.html文件中引入bootstrap.min.css文件的路径进行修改。 

修改前：  

```javascript
<link rel="stylesheet" href="../node_modules/bootstrap/dist/css/bootstrap.min.css">
```
修改后：  

```javascript
<link rel="stylesheet" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css">
```
然后再次运行指令进行测试。如下：  

```shell script
npm run pack
```
这样，点击设置选项后弹出的对话框是正常的。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1goduzwy938j30z60nwdg8.jpg)

但是这样做，bootstrap并没有被优化掉。所以，接下来我们把bootstrap从dependencies中移到devDependencies中。这样一来，因为electron-builder和webpack.config.js都没有对bootstrap进行处理，所以在settings.html文件中肯定访问不到了。我们需要在webpack.config.js文件中将bootstrap.min.css文件拷贝到build/settings文件夹下，所以编写webpack.config.js文件的代码。如下：  

```javascript
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'main.js'
  },
  plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, './settings'),
            to: 'settings'
          },
          {
            from: path.join(__dirname, './node_modules/bootstrap/dist/css/bootstrap.min.css'),
            to: 'settings/bootstrap.min.css'
          }
        ]
      })
  ],
  node: {
    __dirname: false
  }
}

```

然后将settings.html文件中link的路径进行修改。  
修改前：  

```javascript
<link rel="stylesheet" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css">
```

修改后：  

```javascript
    <link rel="stylesheet" href="./bootstrap.min.css">
```

这样，我们再次运行指令进行打包：  

```shell script
npm run pack
```
目标效果如下：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1gofr2ecmnsj30ca0jyweq.jpg)
这个bootstrap.min.css文件被拷贝到settings目录下。

启动应用程序之后，点击设置，观察弹出的窗口是否有样式。如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1godvpaw7enj31bc0nmjrw.jpg)

最后，我们来查看一下App的体积大小，如图：  
![](https://tva1.sinaimg.cn/large/008eGmZEgy1godvpowam4j30vq0jw0tn.jpg)

从之前的191.6M变成了187.3M，又优化了4.3M。这样，在应用程序功能不受到任何影响的前提下，我们经过三次优化，让打包的效果达到了最佳状态。

但是仍然存在一个问题就是虽然打包后的样式和功能完全正常了，但是如果直接执行指令：  

```shell script
npm run dev
```
在终端启动项目，此时因为settings.html中bootstrap.min.css的路径被修改成了：  
```javascript
    <link rel="stylesheet" href="./bootstrap.min.css">
```
这样一来，在外面就访问不到bootstrap.min.css了。但是我们此时又不能再次修改这个路径，否则经过build之后的settings.html中的路径也访问不到bootstrap.min.css。所以，我们最直接的办法就是把bootstrap.min.css文件直接手动拷贝到settings文件夹下即可。  

也就是说，build/settings中的bootstrap.min.css我们是通过copy-webpack-plugin进行拷贝过去的，而外面的settings文件夹下的bootstrap.min.css我们是直接手动拷贝进去的。这样，我们就完美实现了整个体积优化的任务。

