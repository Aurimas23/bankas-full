import BankAccountCtrl from '../models/BankAccount.js';
import { generateIBAN_LT_Ctrl } from '../utils/ibanGenerator.js'; 
import { validatePersonalCode_LT_Ctrl } from '../utils/personalCodeValidator.js'; 

const createBankAccount = async (req, res) => {
    const { vardas, pavarde, asmensKodas } = req.body;


    if (!vardas || !pavarde || !asmensKodas) {
        return res.status(400).json({ message: 'Trūksta privalomų laukų: vardas, pavardė, asmens kodas' });
    }

    if (!validatePersonalCode_LT_Ctrl(asmensKodas)) {
        return res.status(400).json({ message: 'Neteisingas asmens kodo formatas arba kontrolinis skaitmuo.' });
    }

    try {
        const existingAccountByPK = await BankAccountCtrl.findOne({ asmensKodas });
        if (existingAccountByPK) {
            return res.status(400).json({ message: 'Sąskaita su tokiu asmens kodu jau egzistuoja.' });
        }

        const saskaitosNumeris = await generateIBAN_LT_Ctrl(); 
        const existingIBAN = await BankAccountCtrl.findOne({ saskaitosNumeris });
        if (existingIBAN) {

            return res.status(500).json({ message: 'Klaida generuojant unikalų IBAN. Bandykite dar kartą.' });
        }
        
        let pasoKopijosNuotraukaPath = null;
        if (req.file) {
            pasoKopijosNuotraukaPath = req.file.path; 

        }


        const newAccount = new BankAccountCtrl({
            vardas,
            pavarde,
            saskaitosNumeris,
            asmensKodas,
            balansas: 0,
            pasoKopijosNuotrauka: pasoKopijosNuotraukaPath
        });

        const savedAccount = await newAccount.save();
        res.status(201).json(savedAccount);

    } catch (error) {
        console.error('Klaida kuriant sąskaitą:', error);
        if (error.code === 11000) { 
             if (error.keyPattern && error.keyPattern.saskaitosNumeris) {
                return res.status(400).json({ message: 'Sugeneruotas sąskaitos numeris jau egzistuoja. Bandykite dar kartą.' });
            }
            if (error.keyPattern && error.keyPattern.asmensKodas) {
                return res.status(400).json({ message: 'Sąskaita su tokiu asmens kodu jau egzistuoja.' });
            }
        }
        res.status(500).json({ message: 'Serverio klaida kuriant sąskaitą', error: error.message });
    }
};

const getAllBankAccounts = async (req, res) => {
    try {
        const accounts = await BankAccountCtrl.find().sort({ pavarde: 1 });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: 'Serverio klaida gaunant sąskaitas', error: error.message });
    }
};

const getBankAccountById = async (req, res) => {
    try {
        const account = await BankAccountCtrl.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Sąskaita nerasta' });
        }
        res.json(account);
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Sąskaita nerasta (neteisingas ID formatas)' });
        }
        res.status(500).json({ message: 'Serverio klaida gaunant sąskaitą', error: error.message });
    }
};

const deleteBankAccount = async (req, res) => {
    try {
        const account = await BankAccountCtrl.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Sąskaita nerasta' });
        }

        if (account.balansas > 0) {
            return res.status(400).json({ message: 'Negalima trinti sąskaitos su teigiamu balansu.' });
        }
 
        
        await BankAccountCtrl.deleteOne({ _id: req.params.id }); 

        res.json({ message: 'Sąskaita sėkmingai ištrinta' });

    } catch (error) {
         if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Sąskaita nerasta (neteisingas ID formatas)' });
        }
        res.status(500).json({ message: 'Serverio klaida trinant sąskaitą', error: error.message });
    }
};


const addFunds = async (req, res) => {
    const { suma } = req.body;
    const amount = parseFloat(suma);

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Suma turi būti teigiamas skaičius.' });
    }

    try {
        const account = await BankAccountCtrl.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Sąskaita nerasta' });
        }

        account.balansas += amount;
        const updatedAccount = await account.save();
        res.json(updatedAccount);

    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Sąskaita nerasta (neteisingas ID formatas)' });
        }
        res.status(500).json({ message: 'Serverio klaida pridedant lėšas', error: error.message });
    }
};


const withdrawFunds = async (req, res) => {
    const { suma } = req.body;
    const amount = parseFloat(suma);

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Suma turi būti teigiamas skaičius.' });
    }

    try {
        const account = await BankAccountCtrl.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: 'Sąskaita nerasta' });
        }

        if (account.balansas < amount) {
            return res.status(400).json({ message: 'Nepakankamas sąskaitos likutis.' });
        }

        account.balansas -= amount;
        const updatedAccount = await account.save();
        res.json(updatedAccount);

    } catch (error)
 {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Sąskaita nerasta (neteisingas ID formatas)' });
        }
        res.status(500).json({ message: 'Serverio klaida nuskaičiuojant lėšas', error: error.message });
    }
};


