// controllers/ride-request/getActiveServiceByTruck.js

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const { RideRequest } = require("../../models");
const sendSuccessResponse = require("../../utils/success-response");

/**
 * @swagger
 * /ride-requests/active/truck:
 *   get:
 *     summary: Get the authenticated truck's single active (accepted) service
 *     tags:
 *       - RideRequest
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: >
 *           Single active service ride request returned (or null),
 *           including client user_name and compressed profile photo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActiveServiceWithClientResponse'
 *       401:
 *         description: Unauthorized (missing or invalid JWT)
 *       500:
 *         description: Internal server error
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *
 *     ActiveServiceWithClientResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Active service ride request (with client info)"
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/RideRequestWithClient'
 *             - type: 'null'
 *       required:
 *         - success
 *         - message
 *         - data
 *
 *     RideRequestWithClient:
 *       type: object
 *       description: >
 *         A single ride request (status="accepted") that this truck is currently servicing,
 *         together with the client’s basic details.
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: RideRequest document ID
 *         status:
 *           type: string
 *           enum:
 *             - created
 *             - posted
 *             - accepted
 *             - completed
 *             - cancelled
 *           example: "accepted"
 *         origin_location:
 *           $ref: '#/components/schemas/GeoPoint'
 *         dest_location:
 *           $ref: '#/components/schemas/GeoPoint'
 *         pickup_date:
 *           type: string
 *           format: date-time
 *           example: "2025-06-10T12:00:00.000Z"
 *         vehicle_details:
 *           $ref: '#/components/schemas/VehicleDetails'
 *         offers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OfferSubdoc'
 *         accepted_offer:
 *           type: string
 *           format: objectId
 *           description: The ObjectId of the offer this truck submitted that was accepted
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *         client:
 *           type: object
 *           description: >
 *             The basic client info (who requested the ride).
 *             Contains only user_id, user_name, and the compressed profile photo.
 *           properties:
 *             user_id:
 *               type: string
 *               format: objectId
 *               description: Client’s user document ID
 *             user_name:
 *               type: string
 *               description: Client’s username
 *               example: "john_doe"
 *             photo:
 *               type: string
 *               format: base64
 *               description: Base64‐encoded compressed client profile photo
 *           required:
 *             - user_id
 *             - user_name
 *             - photo
 *       required:
 *         - _id
 *         - status
 *         - origin_location
 *         - dest_location
 *         - pickup_date
 *         - vehicle_details
 *         - offers
 *         - accepted_offer
 *         - createdAt
 *         - updatedAt
 *         - client
 *
 *     GeoPoint:
 *       type: object
 *       description: GeoJSON‐compatible point
 *       properties:
 *         type:
 *           type: string
 *           enum: [Point]
 *           example: "Point"
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           minItems: 2
 *           maxItems: 2
 *           description: [longitude, latitude]
 *           example: [-0.1278, 51.5074]
 *
 *     VehicleDetails:
 *       type: object
 *       description: Core vehicle structure
 *       properties:
 *         registration:
 *           type: string
 *           description: Vehicle registration number
 *           example: "AB12CDE"
 *         make:
 *           type: string
 *           example: "Ford"
 *         model:
 *           type: string
 *           example: "Transit"
 *         year_of_manufacture:
 *           type: integer
 *           example: 2020
 *         wheels_category:
 *           type: string
 *           enum: [rolling, stationary]
 *           example: "rolling"
 *         vehicle_category:
 *           type: string
 *           enum: [donot-apply, swb, mwb, lwb]
 *           example: "mwb"
 *         loaded:
 *           type: string
 *           enum: [donot-apply, loaded]
 *           example: "loaded"
 *       required:
 *         - registration
 *         - make
 *         - model
 *         - year_of_manufacture
 *         - wheels_category
 *         - vehicle_category
 *         - loaded
 *
 *     OfferSubdoc:
 *       type: object
 *       description: Embedded offer subdocument (as stored under RideRequest.offers)
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         truck_id:
 *           type: string
 *           format: objectId
 *         offered_price:
 *           type: number
 *           description: Price offered by truck
 *           example: 75.00
 *         time_to_reach:
 *           type: string
 *           description: e.g. "1d2h30m"
 *           example: "1d2h30m"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - _id
 *         - truck_id
 *         - offered_price
 *         - time_to_reach
 *         - createdAt
 *         - updatedAt
 */
const getActiveServiceByTruck = async (req, res, next) => {
  try {
    const truckId = req.user && req.user.id;
    if (!truckId || !ObjectId.isValid(truckId)) {
      return next(new Error("Unauthorized or invalid truck token."));
    }
    const truckObjectId = new ObjectId(truckId);

    const results = await RideRequest.aggregate([
      // 1) Only rides in "accepted" status
      { $match: { status: "accepted" } },

      // 2) Unwind the offers array so we can compare each subdocument
      { $unwind: "$offers" },

      // 3) Match where this ride’s accepted_offer = offers._id AND offers.truck_id = our truck
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$offers._id", "$accepted_offer"] },
              { $eq: ["$offers.truck_id", truckObjectId] }
            ]
          }
        }
      },

      // 4) Lookup the client document from "user_profiles"
      {
        $lookup: {
          from: "user_profiles",       // your users collection name
          localField: "user_id",       // RideRequest.user_id
          foreignField: "_id",         // User._id in user_profiles
          as: "client"                 // produces an array [ { … } ]
        }
      },

      // 5) Unwind that client array so "client" becomes a single object
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true
        }
      },

      // 6) Project only the fields we need, nesting user_name + compressed photo under "client"
      {
        $project: {
          // RideRequest fields
          _id:               1,
          status:            1,
          origin_location:   1,
          dest_location:     1,
          pickup_date:       1,
          vehicle_details:   1,
          offers:            1,
          accepted_offer:    1,
          createdAt:         1,
          updatedAt:         1,

          // Nested client object:
          client: {
            user_id:   "$client._id",
            user_name: "$client.user_name",
            photo:     "$client.client_profile.profile_photo.compressed.data"
          }
        }
      },

      // 7) Limit to exactly one "active service" per truck
      { $limit: 1 }
    ]);

    const activeServiceWithClient = results.length ? results[0] : null;
    return sendSuccessResponse(
      res,
      "Active service ride request (with client info)",
      activeServiceWithClient
    );
  } catch (error) {
    return next(error);
  }
};

module.exports = getActiveServiceByTruck;
