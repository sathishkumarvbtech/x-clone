import User from "../models/userModel.js";
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(400).json({ error: 'Unauthorized: No token provided' })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ error: 'Unauthorized: By decoded No token provided' })
        }

        const user = await User.findOne({ _id: decoded.userId }).select('-password')
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        req.user = user;
        next();

    } catch (error) {
        console.log(`Error in Protect Route middleware: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}