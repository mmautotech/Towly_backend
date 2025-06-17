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



if (user.role === 'truck') {
      const truck = user.truck_profile || {};
      const vehicle = truck.vehicle_profile || {};
      const driver = truck.driver_profile || {};
      const settings = user.settings?.truck_settings || {};

      return {
        ...baseInfo,
        profile_photo_truck: formatPhoto(vehicle.vehicle_photo), // Top-level trucker profile photo
        truck_profile: {
          rating: vehicle.rating || 0,
          ratings_count: vehicle.ratings_count || 0,
          geo_location: truck.geo_location || null,
          vehicle_profile: {
            registration_number: vehicle.registration_number || '',
            make: vehicle.make || '',
            model: vehicle.model || '',
            color: vehicle.color || '',
            vehicle_photo: formatPhoto(vehicle.vehicle_photo),
          },
        },
        driver_profile: {
          first_name: driver.first_name || '',
          last_name: driver.last_name || '',
          date_of_birth: driver.date_of_birth || null,
          license_number: driver.license_number || '',
          license_expiry: driver.license_expiry || null,
          license_front: formatPhoto(driver.license_front),
          license_back: formatPhoto(driver.license_back),
          license_selfie: formatPhoto(driver.license_selfie),
        },
        truck_settings: {
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

const projection = {
  user_name: 1,
  email: 1,
  phone: 1,
  role: 1,
  status: 1,
  createdAt: 1,
  updatedAt: 1,


  
  // Truck profile
  'truck_profile.geo_location': 1,
  'truck_profile.vehicle_profile.registration_number': 1,
  'truck_profile.vehicle_profile.make': 1,
  'truck_profile.vehicle_profile.model': 1,
  'truck_profile.vehicle_profile.color': 1,
  'truck_profile.vehicle_profile.rating': 1,
  'truck_profile.vehicle_profile.ratings_count': 1,
  'truck_profile.vehicle_profile.vehicle_photo.original.data': 1,

  'truck_profile.driver_profile.first_name': 1,
  'truck_profile.driver_profile.last_name': 1,
  'truck_profile.driver_profile.date_of_birth': 1,
  'truck_profile.driver_profile.license_number': 1,
  'truck_profile.driver_profile.license_expiry': 1,
  'truck_profile.driver_profile.license_front.original.data': 1,
  'truck_profile.driver_profile.license_back.original.data': 1,
  'truck_profile.driver_profile.license_selfie.original.data': 1,

  'settings.truck_settings': 1,
};





const getAllTrucker = async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ['truck'] } },
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
  getAllTrucker
 
};