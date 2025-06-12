import jwtAuth from 'jsonwebtoken';
import UserAuth from '../models/User.js'; 

const authMiddlewareFunc = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwtAuth.verify(token, process.env.JWT_SECRET);
            req.user = await UserAuth.findById(decoded.id).select('-password');
            if (!req.user) {
                 return res.status(401).json({ message: 'Vartotojas nerastas, tokenas neteisingas' });
            }
            next();
        } catch (error) {
            console.error('Tokeno validacijos klaida:', error.message);
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Neteisingas tokenas' });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Tokenas nebegalioja' });
            }
            res.status(401).json({ message: 'Neautorizuota, įvyko klaida su tokenu' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Neautorizuota, nėra tokeno' });
    }
};

export default authMiddlewareFunc;
