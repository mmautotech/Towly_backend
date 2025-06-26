/**
 * This controller checks if the current user's profile is complete.
 * Returns: { success: true, profile_complete: Boolean, missing_fields: [Array of field names], role: String, status: String }
 */

function isClientProfileComplete(profile) {
  const missing = [];
  if (!profile) return { complete: false, missing: ['client_profile'] };
  if (!profile.first_name) missing.push('first_name');
  if (!profile.last_name) missing.push('last_name');
  if (!profile.address) missing.push('address');
  if (!profile.profile_photo || !profile.profile_photo.original) missing.push('profile_photo');
  return { complete: missing.length === 0, missing };
}

function isTruckProfileComplete(profile) {
  const missing = [];
  if (!profile) return { complete: false, missing: ['truck_profile'] };
  // Driver Profile
  const d = profile.driver_profile;
  if (!d) missing.push('driver_profile');
  else {
    if (!d.first_name) missing.push('driver_first_name');
    if (!d.last_name) missing.push('driver_last_name');
    if (!d.date_of_birth) missing.push('date_of_birth');
    if (!d.license_number) missing.push('license_number');
    if (!d.license_expiry) missing.push('license_expiry');
    if (!d.license_front || !d.license_front.original) missing.push('license_front');
    if (!d.license_back || !d.license_back.original) missing.push('license_back');
    if (!d.license_selfie || !d.license_selfie.original) missing.push('license_selfie');
  }
  // Vehicle Profile
  const v = profile.vehicle_profile;
  if (!v) missing.push('vehicle_profile');
  else {
    if (!v.registration_number) missing.push('registration_number');
    if (!v.make) missing.push('make');
    if (!v.model) missing.push('model');
    if (!v.color) missing.push('color');
    if (!v.vehicle_photo || !v.vehicle_photo.original) missing.push('vehicle_photo');
  }
  return { complete: missing.length === 0, missing };
}

const getProfileStatus = async (req, res, next) => {
  try {
    const user = req.user; // Populated by auth middleware

    let complete = false, missing = [];

    if (user.role === 'client') {
      const result = isClientProfileComplete(user.client_profile);
      complete = result.complete;
      missing = result.missing;
    } else if (user.role === 'truck') {
      const result = isTruckProfileComplete(user.truck_profile);
      complete = result.complete;
      missing = result.missing;
    } else {
      complete = true;
      missing = [];
    }

    return res.json({
      success: true,
      profile_complete: complete,
      missing_fields: missing,
      role: user.role,
      status: user.status, // <-- Always include status
      terms_agreed: Boolean(user.terms_agreed),
    });
  } catch (e) {
    next(e);
  }
};

module.exports = getProfileStatus;
