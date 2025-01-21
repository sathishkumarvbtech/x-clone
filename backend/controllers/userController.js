import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from 'cloudinary';

export const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(`Errorr in get user profile controller: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById({ _id: id });
        const currentUser = await User.findById({ _id: req.user.id });
        if (id === req.user.id) {
            return res.status(404).json({ error: "You can't unfollow/follow" })
        }
        if (!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }
        const isFollowing = currentUser.following.includes(id);
        if (isFollowing) {
            // unfollow
            await User.findByIdAndUpdate({ _id: id }, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate({ _id: req.user.id }, { $pull: { following: id } })
            res.status(200).json({ message: 'Unfollow successfully' })
        }
        else {
            // follow
            await User.findByIdAndUpdate({ _id: id }, { $push: { followers: req.user._id } })
            await User.findByIdAndUpdate({ _id: req.user.id }, { $push: { following: id } })
            // send notfication
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();
            res.status(200).json({ message: 'Follow successfully' })
        }

    } catch (error) {
        console.log(`Error in follow and unfollow controller${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}


export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const userFollowedByMe = await User.findById(userId).select("-password");
        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ]);

        const filteredUser = users.filter((user) => !userFollowedByMe.following.includes[user.id]);
        const suggestedUsers = filteredUser.slice(0, 4);
        suggestedUsers.forEach(user => (user.password = null));
        res.status(200).json(suggestedUsers)
    }
    catch (error) {
        console.log(`Error in suggested controller${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const updateUserDetails = async (req, res) => {
    const userId = req.user._id;
    const { username, fullname, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    try {
        // Find user by ID
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate passwords
        if ((newPassword && !currentPassword) || (!newPassword && currentPassword)) {
            return res.status(400).json({ error: 'Both current and new passwords are required for a password update' });
        }

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters long' });
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Update profile image
        if (profileImg) {
            if (user.profileImg) {
                //const publicId = user.profileImg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }
            const uploadResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadResponse.secure_url;
        }

        // Update cover image
        if (coverImg) {
            if (user.coverImg) {
                const publicId = user.coverImg.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
            const uploadResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadResponse.secure_url;
        }

        // Update user details
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        // Save and return updated user
        user = await user.save();
        user.password = undefined; // Exclude password from the response
        return res.status(200).json(user);
    } catch (error) {
        console.error(`Error in updateUserDetails: ${error.message}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
