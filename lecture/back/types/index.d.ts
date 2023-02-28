import User from "../models/user";

// declare global {
//     namespace Express {
//         export interface User extends IUser {}
//     }
// }

declare module "express-serve-static-core" {
    interface Request { 
        user?: User
    }
}
// declare module "passprot" {
//     interface Request { 
//         user?: User
//     }
// }