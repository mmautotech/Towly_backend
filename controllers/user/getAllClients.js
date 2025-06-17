const User = require('../../models/user');

// -------------------------------
// Convert binary to Base64 string
// -------------------------------
const formatBase64Image = (data) => {
  if (!data) return '';
  return `base64,${data.toString('base64')}`;
};

// -------------------------------
// Handle compressed or original photo
// -------------------------------
const formatPhoto = (photoObj) => {
  if (!photoObj) return '';

  // Prefer compressed > original
  if (photoObj.original?.data) {
    return formatBase64Image(photoObj.original.data);
  }



  return '';
};

// -------------------------------
// Main formatter for user profiles
// -------------------------------
const formatUsersWithProfiles = (users) => {
  return users.map((user) => {
    const baseInfo = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.role === 'client') {
      const profile = user.client_profile || {};
      const settings = user.settings?.client_settings || {};

      return {
        ...baseInfo,
        profile_photo: formatPhoto(profile.profile_photo),
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        rating: profile.rating || 0,
        ratings_count: profile.ratings_count || 0,
        address: profile.address || '',
        client_settings: {
          language: settings.language || '',
          currency: settings.currency || '',
          distance_unit: settings.distance_unit || '',
          time_format: settings.time_format || '',
          radius: settings.radius || '',
        },
      };
    }

    return baseInfo;
  });
};

// -------------------------------
// MongoDB projection
// -------------------------------
const projection = {
  user_name: 1,
  email: 1,
  phone: 1,
  role: 1,
  status: 1,
  createdAt: 1,
  updatedAt: 1,

  // Client profile
  'client_profile.first_name': 1,
  'client_profile.last_name': 1,
  'client_profile.rating': 1,
  'client_profile.ratings_count': 1,
  'client_profile.address': 1,

  'client_profile.profile_photo.original.data': 1,

  'settings.client_settings': 1,


};

// -------------------------------
// GET /api/users
// -------------------------------
const getAllClients = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ['client'] } },
      projection
    ).lean();

    res.status(200).json(formatUsersWithProfiles(users));
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// -------------------------------
// GET /api/users/search?q=...
// -------------------------------


module.exports = {
  getAllClients
 
};