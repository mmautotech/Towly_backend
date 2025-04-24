const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-request/cancel:
 *   patch:
 *     summary: Cancel a ride request
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
 *         description: Ride request cancelled
 */
/**
 * @desc Change ride request status to 'cancelled'
 * @route PATCH /api/ride-request/cancel
 */
const cancelRideRequest = async (req, res, next) => {
  const { user_id, request_id } = req.body;
  if (!user_id || !request_id) {
    return res
      .status(400)
      .json({ message: "user_id and request_id are required" });
  }

  try {
    await RideRequest.findOneAndUpdate(
      { _id: request_id, user_id },
      { status: "cancelled" }
    );

    return res.json({
      success: true,
      message: "Ride request cancelled successfully.",
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = cancelRideRequest;
