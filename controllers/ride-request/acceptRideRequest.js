const mongoose = require("mongoose");
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/accept:
 *   patch:
 *     summary: Accept a ride request
 *     tags: [RideRequest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, request_id]
 *             properties:
 *               user_id:
 *                 type: string
 *               request_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ride request accepted
 */
/**
 * @desc Change ride request status to 'Accepted' and mark it with the trucker's user_id
 * @route PATCH /api/ride-request/accept
 */
const acceptRideRequest = async (req, res, next) => {
  const { user_id, request_id } = req.body;

  if (!user_id || !request_id) {
    return res.status(400).json({ message: "user_id and request_id are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(user_id) || !mongoose.Types.ObjectId.isValid(request_id)) {
    return res.status(400).json({ message: "Invalid user_id or request_id" });
  }

  try {
    const request = await RideRequest.findById(request_id);

    if (!request) {
      return res.status(404).json({ message: "Ride request not found" });
    }

    if (request.status === "Accepted") {
      return res.status(400).json({ message: "Ride request is already accepted" });
    }

    request.status = "Accepted";
    request.accepted_by = user_id;
    await request.save();

    return sendSuccessResponse(res, request, "Ride request accepted successfully.");
  } catch (err) {
    return next(err);
  }
};

module.exports = acceptRideRequest;
