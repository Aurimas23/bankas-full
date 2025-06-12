import BankAccountIBAN from '../models/BankAccount.js';

const generateIBAN_LT_Ctrl_Func = async () => { 
    const countryCode = "LT";
    const bankCode = "99000"; 
    
    let accountNumber;
    let fullIban;
    let isUnique = false;

    while(!isUnique) {
        accountNumber = "";
        for (let i = 0; i < 11; i++) {
            accountNumber += Math.floor(Math.random() * 10);
        }

        const bban = bankCode + accountNumber;
        const forCheckDigits = bban + "212900";
        
        let numericForCheckDigits = "";
        for (let char of forCheckDigits) {
            if (char >= '0' && char <= '9') {
                numericForCheckDigits += char;
            } else {
                numericForCheckDigits += (char.charCodeAt(0) - 'A'.charCodeAt(0) + 10).toString();
            }
        }

        const remainder = BigInt(numericForCheckDigits) % 97n;
        let checkDigits = (98n - remainder).toString();
        if (checkDigits.length === 1) {
            checkDigits = "0" + checkDigits;
        }
        if (checkDigits === "98") { 
        }


        fullIban = `${countryCode}${checkDigits}${bban}`;

        const existing = await BankAccountIBAN.findOne({ saskaitosNumeris: fullIban });
        if (!existing) {
            isUnique = true;
        }
    }
    return fullIban;
};

export const generateIBAN_LT_Ctrl = generateIBAN_LT_Ctrl_Func; 
