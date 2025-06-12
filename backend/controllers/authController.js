import UserCtrl from '../models/User.js'; 
import bcryptCtrl from 'bcryptjs';
import jwtCtrl from 'jsonwebtoken'; 
import loginUser from '../controllers/authController.js';




const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Prašome įvesti vartotojo vardą ir slaptažodį' });
    }

    try {
        const user = await UserCtrl.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Neteisingas vartotojo vardas arba slaptažodis' });
        }
    } catch (error) {
        console.error('Prisijungimo klaida:', error);
        res.status(500).json({ message: 'Serverio klaida prisijungiant' });
    }
};
const registerUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const userExists = await UserCtrl.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Vartotojas tokiu vardu jau egzistuoja' });
        }
        const user = await UserCtrl.create({ username, password  });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                token: generateToken(user._id), 
            });
        } else {
            res.status(400).json({ message: 'Neteisingi vartotojo duomenys' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Serverio klaida registruojant vartotoją', error: error.message });
    }
};



const generateToken = (id) => {
    return jwtCtrl.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', 
    });
};


