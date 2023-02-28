import * as passport from 'passport'
import User from '../models/user'
import local from './local'

export default () => {
    // 로그인 할때 실행
    passport.serializeUser<User, any>((user, req, done) => {
        done(null, user.id);
    });

    //모든 router에서 매번 실행 
    passport.deserializeUser( async (id: number, done) => {
        try{
            const user = await User.findOne({
                where: { id }
            })
            return done(null, user) // req.user
        }catch(err){
            console.error(err)
            return done(err)
        }
    })

    local()
}