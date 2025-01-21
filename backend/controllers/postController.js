import cloudinary from 'cloudinary';
import Notification from '../models/notificationModel.js';
import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const createPost = async (req, res) => {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = await User.findOne({ _id: userId });
        if (!user) {
            res.status(404).json({ error: 'User not found' })
        }
        if (!text && !img) {
            res.status(404).json({ error: 'Post must have image or text' })
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new Post({
            user: userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost)
    } catch (error) {
        console.log(`Error in create post controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findOne({ _id: id });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: 'Your not authorized delete this post' });
        }
        if (post.img) {
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete({ _id: id });
        res.status(200).json({ message: "Post delete successfully" });
    } catch (error) {
        console.log(`Error in delete post controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}


export const commentPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if (!text) {
            return res.status(404).json({ error: 'Comment text required' })
        }
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }
        const comment = {
            user: userId,
            text
        }
        post.comments.push(comment);
        await post.save()
        const notfication = new Notification({
            from: userId,
            to: post.user,
            type: 'comment'
        })
        await notfication.save();
        const updatedComments = post.comments
        res.status(200).json(updatedComments);
    } catch (error) {
        console.log(`Error in comment post controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}


export const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params;
        const userId = req.user.id;
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }
        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            // Unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString())
            res.status(200).json(updatedLikes);
        }
        else {
            post.likes.push(userId);
            await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } })
            await post.save();

            const notfication = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            })
            await notfication.save();
            const updatedLikes = post.likes
            res.status(200).json(updatedLikes)
        }

    } catch (error) {
        console.log(`Error in comment like and unlike controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: 'user',
            select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
        }).populate({
            path: 'comments.user',
            select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
        })
        if (posts.length === 0) {
            return res.status(200).json([])
        }
        res.status(200).json(posts)
    } catch (error) {
        console.log(`Error in get all posts controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ _id: userId })
        if (!user) {
            return res.status(200).json({ message: "User not found" })
        }
        const likedPost = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: 'user',
            select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
        }).populate({
            path: 'comments.user',
            select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
        })
        res.status(200).json(likedPost)
    } catch (error) {
        console.log(`Error in get all liked posts controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}

export const getFollowingPost = async (req, res) => {
    try {
        const userId = req.user_.id;
        const user = await User.findById({ _id: userId })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const following = user.following;
        const feedPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: 'user',
            select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
        }).populate({
            path: 'comments.user',
            select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
        })
        res.status(200).json(feedPosts)
    } catch (error) {
        console.log(`Error in get following posts controller ${error.message}`);
        res.status(404).json({ error: 'Internal Serverb error' })
    }
}

export const getUserPost = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'user',
                select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
            })
            .populate({
                path: 'comments.user',
                select: ['-password', '-email', '-following', '-followers', '-bio', '-link']
            });

        if (!posts.length) {
            return res.status(404).json({ message: 'No posts found for this user' });
        }

        res.status(200).json(posts);
    } catch (error) {
        console.log(`Error in get user posts controller: ${error.message}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
