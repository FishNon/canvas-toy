项目一：音乐可视化
===============

## 零、配置运行
* 配置安装所需要的库/框架
```
npm install
bower install fs
```
* 实施监控（运行）：
 ```
   supervisor bin/www
 ```

## 一、技术栈：
* 服务端：Node + Express + ejs
* 前　端：HTML + CSS(CSS3) + JS
* 音频操作：webAudio
* 音频数据可视化：Canvas
* 文件操作：fs

## 二、项目实现：
### 1 音频获取及播放
* 安装配置：
 * 在全局环境下安装`express-generator`:
 ```
   npm install -g express-generator
 ```
 * 构建项目目录(`-e`意为选择ejs模板引擎)：
 ```
   express -e
 ```
 * 下载安装`package.json`中的库/框架
 ```
   npm install
 ```
 * 下载安装`supervisor`，实时监控项目：
 ```
   npm install -g supervisor
 ```
* AudioContext
  * 描述：Audio上下文的一个全局对象，包含各个音频节点，以及它们之间的联系；
  * 创建：
  ```
    var ac = new window.AudioContext();
  ```
  * 属性destination：AudioDestinationNode对象，所有的音频输出聚集地，相当于音频的硬件，   所有的AudioNode都直接或间接连接到这里；
  * 属性currentTime：AudioContext从创建开始到当前的时间（秒）；
  * 方法decodeAudioData(arrayBuffer, succ(buffer),err)：异步解码包含在arrayBuffer中的音频数据；
  * 方法createBufferSource()：创建audioBufferSourceNode对象；
  * 方法createAnalyser()：创建AnalyserNode对象；
  * 方法createGain()/createGainNode()：创建GainNode对象；
* AudioBufferSourceNode
  * 描述：表示内存中的一段音频资源，其音频数据存在于AudioBuffer中（其buffer属性）；
  * 创建：
    ```
      var bufferSource = ac.createBufferSource();
    ```
  * 属性buffer：AudioBuffer对象，表示要播放的音频资源数据；
    ——子属性duration：该音频资源的时长（秒）；
  * 属性loop：是否循环播放，默认false；
  * 属性onended：可绑定音频播放完毕时调用的事件处理程序；
  * 方法start/noteOn(when=ac.currentTime, offset = 0, duration = buffer.duration-offset)：开始播放音频；`when`:何时播放；`offset`:从音频的第几秒开始播放；`duration`:播放几秒；
  * 方法stop/noteOff(when=ac.currentTime)：结束播放音频；
* GainNode 对象：
  * 描述：改变音频音量的对象，会改变通过它的音频数据所有的sample frame的信号强度；
  * 创建：
    ```
      var gainNode = ac.createGain()/ac.createGainNode();
    ```
  * 属性gain：AudioParam对象，通过改变其`value`值可以改变音频信号的强弱，默认的`value`属性值为1，通常最小值是0，最大值时1，当然其value值可以大于y1，也可以小于0；

### 2 音乐数据可视化
* AnalyserNode对象：
  * 描述： 音频分析对象，它能实时的分析音频资源的频域和时域信息，但不会对音频流做任何处理；
  * 创建：
    ```
      var analyser = ac.createAnalyser();
    ```
  * 属性fftSize：设置FFT值的大小，用于分析得到频域，为32-2048之间2的整数次倍，默认为2048。实时得到的音频频域的数据个数为fftSize的一半；
    FFT是离散傅里叶变换的快速算法，用于将一个信号变换到频域；
  * 属性frequencyBinCount：FFT值的一半，即实时得到的音频频域的数据个数；
  * 方法getByteFrequencyData(Uint8Array)：复制音频当前的频域数据（数量是frequencyBinCount）到Uint8Array（8位无符号整型类型化数组）中；

### 3 应用优化