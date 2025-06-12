import expressBA from 'express';
const routerBA = expressBA.Router(); 
const {
    createBankAccount,
    getAllBankAccounts,
    getBankAccountById,
    deleteBankAccount,
    addFunds,
    withdrawFunds
} = require('../controllers/bankAccountController');
import authMiddleware from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
routerBA.use(authMiddleware);

routerBA.post('/', upload.single('pasoKopija'), createBankAccount); 
routerBA.get('/', getAllBankAccounts);
routerBA.get('/:id', getBankAccountById);
routerBA.delete('/:id', deleteBankAccount);
routerBA.post('/:id/prideti-lesu', addFunds);
routerBA.post('/:id/nuskaiciuoti-lesas', withdrawFunds);

export default routerBA;
