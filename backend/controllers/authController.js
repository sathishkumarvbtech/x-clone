import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import generateToken from '../until/generateToken.js';
import { json } from 'express';

export const signup = async (req, res) => {

    try {
        const { fullname, username, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(404).json({ error: 'Invaild email format' })
        }
        const exitingEmail = await User.findOne({ email })
        const exitingUserName = await User.findOne({ username })

        if (exitingEmail || exitingUserName) {
            return res.status(404).json({ error: "Already Existing Username or Email id" })
        }
        
        if (password.length < 6) {
            return res.status(404).json({ error: "Password must have atleast 6 char length" })
        }

        const salt = await bcrypt.genSalt(10); // Await salt generation
        const hashedPassword = await bcrypt.hash(password, salt); // Await password hashing
        
        const newUser = new User({
            fullname,
            username,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(200).json({
                _id: newUser._id,
                username: newUser.username,
                fullname: newUser.fullname,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })
        }
        else {
            res.status(404).json({ error: 'Invaild User Data' })
        }

    } catch (error) {
        console.log(`Error in sinup controller ${error.message}`);
        res.status(500).json({ error: 'Internal server error' })

    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const exitingPassword = await bcrypt.compare(password, user?.password || "");
        if (!user || !exitingPassword) {
            return res.status(404).json({ error: 'Invaild username and password' })
        }
        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg
        })

    } catch (error) {
        console.log(`Login controller error ${error.message}`);
        res.status(500).json({ error: 'Internal Server error' })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', "", { maxAge: 0 });
        res.status(200).json({ message: 'Logut successfully!' });
    } catch (error) {
        console.log(`Logout controller Error ${error.message}`);
        res.status(500).json({ error: 'Internal Server error' })
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log(`Get me controller error ${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}