# 蛋母鸡

### Author

Sothis

### Description

一个bilibili直播的弹幕姬

### Installation

使用danmuji installer进行快速安装

### Dependency

使用了 bilibili-live-ws 进行与服务器的交互

使用了react与electron生成web端和desktop端的app

### Run locally

```
npm install
npm run dev
```



Serveral problem I met when building this project

* It runs in dev mode but won't after electron build

  electron.js must be put in public folder and in package.json, set main path, set homepage, and set build configuration.

* Build command doesn't work

  Windows has a different command line from most tutorials.

* Icon can't be set

  Put icon in public folder, after react build, set icon path to build/icon.ico in json file



8说了，告辞
