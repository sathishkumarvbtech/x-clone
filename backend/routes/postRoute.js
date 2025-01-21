import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, deletePost, commentPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPost, getUserPost } from '../controllers/postController.js';

const router = express.Router();

router.get('/all', protectRoute, getAllPosts);
router.get('/following', protectRoute, getFollowingPost);
router.get('/user/:username', protectRoute, getUserPost);
router.get('/likes/:id', protectRoute, getLikedPosts)
router.post('/create', protectRoute, createPost);
router.post('/like/:id', protectRoute, likeUnlikePost);
router.post('/comment/:id', protectRoute, commentPost);
router.delete('/:id', protectRoute, deletePost);

export default router;