/**
 * @swagger
 * components:
 *   schemas:
 *     RideRequest:
 *       type: object
 *       required:
 *         - user_id
 *         - origin_location
 *         - dest_location
 *         - pickup_date
 *         - vehicle_details
 *       properties:
 *         user_id:
 *           type: string
 *           example: "6632c1f1f1b1d1d1d1d1d1d1"
 *         origin_location:
 *           $ref: '#/components/schemas/GeoPoint'
 *         dest_location:
 *           $ref: '#/components/schemas/GeoPoint'
 *         pickup_date:
 *           type: string
 *           format: date-time
 *           example: "2025-04-24T10:30:00.000Z"
 *         vehicle_details:
 *           $ref: '#/components/schemas/VehicleDetails'
 *         status:
 *           type: string
 *           enum:
 *             - created
 *             - posted
 *             - accepted
 *             - to_origin
 *             - to_destination
 *             - cleared
 *             - cancelled
 *           example: "created"
 *
 *     OfferInput:
 *       type: object
 *       required:
 *         - request_id
 *         - truck_id
 *         - offered_price
 *       properties:
 *         request_id:
 *           type: string
 *         truck_id:
 *           type: string
 *         offered_price:
 *           type: number
 *         days:
 *           type: integer
 *           example: 0
 *         hours:
 *           type: integer
 *           example: 2
 *         minutes:
 *           type: integer
 *           example: 30
 *
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_name:
 *           type: string
 *           example: "Bryan"
 *         phone:
 *           type: string
 *           example: "+441234567890"
 *         role:
 *           type: string
 *           enum: [admin, truck, client]
 *           example: "truck"
 *         rating:
 *           type: number
 *           example: 4.8
 *         geolocation:
 *           $ref: '#/components/schemas/GeoPoint'
 *
 *     GeoPoint:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: "Point"
 *         coordinates:
 *           type: array
 *           items:
 *             type: number
 *           example: [74.348, 31.512]
 *
 *     VehicleDetails:
 *       type: object
 *       properties:
 *         Registration:
 *           type: string
 *           example: "ABC-123"
 *         make:
 *           type: string
 *           example: "Toyota"
 *         Model:
 *           type: string
 *           example: "Hiace"
 *         Yearofmanufacture:
 *           type: number
 *           example: 2020
 *         Wheels_category:
 *           type: string
 *           enum: [rolling, stationary]
 *           example: "rolling"
 *         vehicle_category:
 *           type: string
 *           enum: [donot-apply, swb, mwb, lwb]
 *           example: "lwb"
 *         loaded:
 *           type: string
 *           enum: [donot-apply, loaded]
 *           example: "loaded"
 */
