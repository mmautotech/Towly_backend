// controllers/userController.js
const { User } = require("../../models");

const updatePushToken = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: "userId and token are required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { pushToken: token },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Push token updated successfully", data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // ... other exports
  updatePushToken,
};
