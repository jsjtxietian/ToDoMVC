# ToDO MVC
![](./md/view.jpg)

## 功能介绍

* 完成全部基本功能，包含新增、删除、展现列表、全部完成/取消、删除已完成，保存页面状态，刷新页面后可恢复

* 单击单个todo可以弹出模态框进行编辑

* 可采用语音输入，但是浏览器必须支持webkitSpeechRecognition并且能正常访问谷歌 

* 性能调优，大部分事件会派发action给Udpate()函数来决定如何渲染页面，而不是每次都全部页面重构

* 封装swipe事件，包括：

  * 对单个todo左划来完成他，如果已完成，则删除

  * 对未完成区域下划全部完成

  * 对完成区域下滑全部删除，上划全部取消完成

  * 整体左划/右划打开侧边栏 

    ![](./md/slide.jpg)

  ## 文件结构

  - index.html ，主页面
  - style.css ，全部样式

  * todo.js ，主要的功能逻辑代码，遵循模块化的思想进行了适度封装

    其中：

    * window.onload负责一些初始化的操作，以及事件绑定
    * Update()是对原版update()函数的封装，优先处理调用方派发了action的情况，包括增删改单个todo等等情况
    * addSwipeEvent 是对swipe的封装，调用此函数并且传入设置项就可以为特定元素加入对swipe事件的响应
    * init开头的系列函数为初始化所用

  * img文件夹，用到的svg矢量图
  * md文件夹，README.md用到的图片
  * normalize.css，外部代码，用来保证各浏览器样式一致性
  * provider.js , model.js 基本与老师示例相同，model.js做了些改变来适应新的功能
  * ping.js，用javascript模拟ping，用处是判断用户是否能访问外网，不能则不开启语音输入功能

  ##用到的资料

  * 老师上课的示例代码，主要参考examples/data/中关于localstorage的部分
  * normalize.css 
  * 模拟ping功能，参考此处 https://stackoverflow.com/questions/4282151/is-it-possible-to-ping-a-server-from-javascript