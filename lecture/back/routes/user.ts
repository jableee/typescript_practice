import * as express from 'express'
import * as bcrypt from 'bcrypt'
import * as passport from 'passport'
import { isLoggedIn, isNotLoggedIn } from './middleware'
import User from '../models/user'
import Post from '../models/post'

const router = express.Router()

// 새로운 타입을 만들어서 해결하는 방법 
type UserWithoutPassword = Omit<User, 'password'>

router.get('/', isLoggedIn, (req, res) => {
    const user = req.user

    return res.json({...user, password: null})
})

router.post('/', async (req, res, next) => {
    try {
        const exUser = await User.findOne({
            where: {
                userId: req.body.userId
            },
        })
        if (exUser){
            return res.status(403).send('이미 사용중인 아이디 입니다.')
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12) // 12관련 암호화 수준 > 높을 수록 해킹당할 위험이 줄어들지마 연산 시간에는 오래걸림 
        const newUser = await User.create({
            nickname: req.body.nickname,
            userId: req.body.userId,
            password: hashedPassword
        })
        return res.status(200).json(newUser)
    } catch (error){
        console.log(error)
        next(error)
    }
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err: Error, user: User, info: { message: String })=> {
        if(err){
            console.log(err)
            return next(err)
        }
        if(info) {
            return res.status(401).send(info.message)
        }
        return req.login(user, async (loginErr: Error) => {
            try {
                if(loginErr){
                    return next(loginErr)
                }
                const fullUser = await User.findOne({
                    where: {id: user.id},
                    include: [{
                        model: Post,
                        as: 'Posts',
                        attributes: ['id'],
                    }, {
                        model: User,
                        as: 'Followings',
                        attributes: ['id'],
                    }, {
                        model: User,
                        as: 'Followers',
                        attributes: ['id']
                    }],
                    // attributes: ['id', 'nickname', 'userId']
                    attributes: {
                        exclude: ['password']
                    }
                })
                return res.json(fullUser)
            }catch (err){
                console.error(err)
                return next(err)
            }
        })
    })(req, res, next)
})

router.post('/logout', isLoggedIn, (req, res) => {
    req.logout((err) => {
        if(err){
            res.redirect('/')
        } else {
            req.session.destroy(() => {
                res.status(200).send('logout 성공') 
            })
        }
    })
    // req.session.destroy(() => {
    //     res.send('logout 성공')
    // })
})