"use strict";
exports.__esModule = true;
var express = require("express");
// import express from 'express' > * as 의 유무 차이는 node_modules에서 @types에서 해당 lib에 대한 export default가 없을때 써주는 것 (있을 떄는 선택 가능)
// 종종 설정(tsconfig.json)에서 "esModuleInterop": true 로 하면 * as 없이도 export default 없는 것을 사용할 수도 있다
// import express = require('express') > require('') 로 선언/참조 도 가능 
var app = express();
var prod = process.env.NODE_ENV === 'production';
app.set('port', prod ? process.env.PORT : 3065); // express에 변수를 설정하는 방법
app.get('/', function (req, res) {
    res.send('node 백엔드 정상 동작!');
});
app.listen(app.get('port'), function () {
    console.log("server is running on ".concat(app.get('port')));
});
