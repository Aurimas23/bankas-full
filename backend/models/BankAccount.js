import mongooseBankAccount from 'mongoose';

const BankAccountSchema = new mongooseBankAccount.Schema({
    vardas: {
        type: String,
        required: [true, 'Vardas yra privalomas'],
        trim: true
    },
    pavarde: {
        type: String,
        required: [true, 'Pavardė yra privaloma'],
        trim: true
    },
    saskaitosNumeris: { 
        type: String,
        required: true,
        unique: true,
    },
    asmensKodas: {
        type: String,
        required: [true, 'Asmens kodas yra privalomas'],
        unique: true,
    },
    pasoKopijosNuotrauka: {
        type: String,
        required: false
    },
    balansas: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Balansas negali būti neigiamas']
    },
 
}, { timestamps: true });

BankAccountSchema.index({ pavarde: 1 });

module.exports = mongooseBankAccount.model('BankAccount', BankAccountSchema);
