import * as express from 'express'
// import express from 'express' > * as 의 유무 차이는 node_modules에서 @types에서 해당 lib에 대한 export default가 없을때 써주는 것 (있을 떄는 선택 가능)
// 종종 설정(tsconfig.json)에서 "esModuleInterop": true 로 하면 * as 없이도 export default 없는 것을 사용할 수도 있다
// import express = require('express') > require('') 로 선언/참조 도 가능 
import * as morgan from 'morgan'
import * as cors from 'cors'
import * as cookieParser from 'cookie-parser'
import * as expressSession from 'express-session'
import * as dotenv from 'dotenv'
import * as passport from 'passport'
import * as hpp from 'hpp'
import helmet from 'helmet'

import { sequelize } from './models'

dotenv.config()
const app = express()
const prod: boolean = process.env.NODE_ENV === 'production'

app.set('port', prod ? process.env.PORT : 3065) // express에 변수를 설정하는 방법
sequelize.sync({force: false}) // true로하면 서버 재시작 마다 테이블을 초기화함 >> 개발할때는 가끔씩 테이블 새로만들거나 컬럼 바꿀때 true로해서 개발 실제 배포후 true켜두면.. 재앙... 사람들이 회원가입 했는데 테이블 초기화 하면 난리남..
    .then(() => {
        console.log('데이터베이스 연결 성공')
    })
    .catch((err: Error) => {
        console.error(err)
    });
if(prod) {
    app.use(hpp())
    app.use(helmet())
    app.use(morgan('combined'))
    app.use(cors({
        origin: /ts-node\.com$/,
        credentials: true,
    }));   
} else {
    app.use(morgan('dev'))
    app.use(cors({
        origin: true,
        credentials: true,
    }))
}

app.use('/', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
        httpOnly: true,
        secure: false, // https -> true
        domain: prod ? 'ts-node.com' : undefined,
    },
    name: 'rnbck',
}))
app.use(passport.initialize());
app.use(passport.session())

app.get('/', (req, res) => {
    res.send('node 백엔드 정상 동작!');
})

app.listen(app.get('port'), () => {
    console.log(`server is running on ${app.get('port')}`)
})