import Notification from "../models/notificationModel.js";

export const getNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const notification = await Notification.find({ to: userId })
            .populate({
                path: 'from',
                select: ['username', 'profileImg']
            })
        await Notification.updateMany({ to: userId }, { read: true });
        res.status(200).json(notification);
    } catch (error) {
        console.log(`Error get notification controller ${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}

export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: 'Notification deleted successfully' })

    } catch (error) {
        console.log(`Error delete notification controller ${error.message}`);
        res.status(500).json({ error: 'Internal server error' })
    }
}