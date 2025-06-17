const { User } = require('../../models');

const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalTruckers = await User.countDocuments({ role: 'truck' });

    res.status(200).json({
      totalUsers,
      totalClients,
      totalTruckers
    });
  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = getUserStats;