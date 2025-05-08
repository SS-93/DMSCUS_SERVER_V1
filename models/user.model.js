const mongoose = require("mongoose");

const bcrypt = require("bcrypt");

 
const userSchema = new mongoose.Schema({
    firstName: {type: String, required:true, trim:true},
    lastName: {type: String, required:true, trim:true},
    email: {type: String, required:true, unique:true, lowercase:true, trim:true},
    password: {type: String, required:true, minlength:8},
    phoneNumber: {type: String, trim:true, required:true}
}, { timestamps: true });

userSchema.pre("save", async function(next){
    console.log('🔒 Pre-save middleware triggered');
    if(!this.isModified("password")){
        console.log('ℹ️ Password not modified, skipping hashing');
        next();
        return;
    }
    console.log('🔐 Hashing password...');
    this.password = await bcrypt.hash(this.password, 10);
    console.log('✅ Password hashed successfully');
    next();
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.toJSON = function(){
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;