import mongooseUser from 'mongoose';
import bcryptUser from 'bcryptjs';
const User = mongoose.model('User', userSchema);
export default User;


const UserSchema = new mongooseUser.Schema({
    username: {
        type: String,
        required: [true, 'Vartotojo vardas yra privalomas'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Slaptažodis yra privalomas']
    },

}, { timestamps: true });

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcryptUser.genSalt(10);
    this.password = await bcryptUser.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcryptUser.compare(enteredPassword, this.password);
};

module.exports = mongooseUser.model('User', UserSchema);
