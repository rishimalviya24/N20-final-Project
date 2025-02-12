import mongoose, { mongo } from 'mongoose';
import config from '../config/config.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema( {
    username:{
        type:String,
        required:[true, "Username is required"],
        unique:[true, "Username is already exists"],
        trim:true,
        lowercase: true,
        minLength:[3, "username must be at least 3 characters"],
        maxLength:[15, "username must be at most 15 characters"],
    },
    email:{
        type: String,
        required:[true, "Email is required"],
        unique:[true, "Email is already exists"],
        trim:true,
        lowercase: true,
        minLength:[6, "Email must be at least 3 characters"],
        maxLength:[40, "Email must be at most 15 characters"],
    },
    profileImage:{
        type:String,
        default: " ",
    },
    password:{
        type:String
    }
})

userSchema.statics.hashPassword = async function(password){

    if(!password){
        throw new Error("Password is required");
    }

    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
}

userSchema.methods.comparePassword = async function(password){
    if(!password){
        throw new Error("Password is required");
    }

    if(!this.password){
        throw new Error("Password is required");
    }
    return bcrypt.compare(password, this.password);
}

userSchema.methods.generateToken = function(){
    const token =  jwt.sign(
        {
            id:this._id,
            username:this.username,
            email:this.email,
        }
        ,config.JWT_SECRET,
        {
        expiresIn: config.JWT_EXPIRES_IN,
    });

    return token;
}

userSchema.statics.verifyToken = function(token) {

    if(!token){
        throw new Error("Token is required");
    }
}

const userModel = mongoose.model("user",userSchema);

export default userModel;