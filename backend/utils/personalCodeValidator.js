const validatePersonalCode_LT_Ctrl_Func = (pk) => { 
    if (!pk || typeof pk !== 'string' || !/^\d{11}$/.test(pk)) {
        return false;
    }

    const s = pk.split('').map(Number);
    const firstDigit = s[0];

    if (firstDigit < 1 || firstDigit > 6) {
        return false;
    }

    let yearSuffix = parseInt(pk.substring(1, 3), 10);
    let month = parseInt(pk.substring(3, 5), 10);
    let day = parseInt(pk.substring(5, 7), 10);

    let year;
    if (firstDigit === 1 || firstDigit === 2) year = 1800 + yearSuffix;
    else if (firstDigit === 3 || firstDigit === 4) year = 1900 + yearSuffix;
    else if (firstDigit === 5 || firstDigit === 6) year = 2000 + yearSuffix;
    
   
    if (month < 1 || month > 12) {
    
        return false;
    }
    if (day < 1 || day > 31) { 

        return false;
    }
    const dateObj = new Date(year, month - 1, day);
    if (!(dateObj.getFullYear() === year && dateObj.getMonth() === month - 1 && dateObj.getDate() === day)) {
        return false;
    }


    let sum = 0;
    const weights1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1];
    for (let i = 0; i < 10; i++) {
        sum += s[i] * weights1[i];
    }

    let controlDigit = sum % 11;

    if (controlDigit === 10) {
        sum = 0;
        const weights2 = [3, 4, 5, 6, 7, 8, 9, 1, 2, 3];
        for (let i = 0; i < 10; i++) {
            sum += s[i] * weights2[i];
        }
        controlDigit = sum % 11;
        if (controlDigit === 10) {
            controlDigit = 0;
        }
    }
    
    const isValid = controlDigit === s[10];
    return isValid;
};

export const validatePersonalCode_LT_Ctrl = validatePersonalCode_LT_Ctrl_Func; 
