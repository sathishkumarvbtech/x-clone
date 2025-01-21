import jwt from 'jsonwebtoken';
import 'dotenv/config';

const generateToken = (userId, res) => {
    // Ensure the secret key exists in the environment variables
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    // Generate the JWT token
    const token = jwt.sign({ userId }, secretKey, {
        expiresIn: '2d', // Set token expiration to 2 days
    });

    // Set the cookie with the generated JWT token
    res.cookie('jwt', token, {
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
        httpOnly: true, // Prevent JavaScript access to the cookie
        sameSite: 'strict', // Prevent CSRF attacks
        secure: process.env.NODE_ENV === 'production', // Only set secure cookies in production (when using HTTPS)
    });
};

export default generateToken;
