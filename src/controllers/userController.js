import userModel from '../models/user.js';


export const createUserController =  async( req, res )=> {
    console.log(req.body);

    res.send('register user');
    
}