"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const dbconnect_1 = require("../dbconnect");
const express_1 = __importDefault(require("express"));
const bcrypt = require("bcryptjs");
exports.router = express_1.default.Router();
// // Firebase configuration
// const firebaseConfig = {
//   apiKey: 'AIzaSyAiVnY-8Ajak4xVeQNLzynr8skqCgNFulg',
//   appId: '1:259988227090:android:db894289cac749ff6c04cb',
//   messagingSenderId: '259988227090',
//   projectId: 'project-rider-1b5ac',
//   storageBucket: 'project-rider-1b5ac.appspot.com',
// };
// // Initialize Firebase
// initializeApp(firebaseConfig);
// const storage = getStorage();
// // Multer setup for file uploads
// class FileMiddleware {
//   filename = "";
//   public readonly diskLoader = multer({
//     storage: multer.memoryStorage(),
//     limits: { fileSize: 67108864 }, // 64MB limit
//   });
// }
// const fileUpload = new FileMiddleware();
// Get specific user by userID
exports.router.get('/rider', (req, res) => {
    const riderID = req.query.riderID;
    const query = 'SELECT * FROM riders WHERE riderID = ?';
    dbconnect_1.conn.query(query, [riderID], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length > 0) {
            res.json(results);
        }
        else {
            res.status(404).json({ error: 'No users found' });
        }
    });
});
exports.router.get('/order', (req, res) => {
    const query = `
      SELECT 
          o.orderID,
          u.userID,   
          u.name, 
          u.phone, 
          u.photo AS userPhoto, 
          u.address, 
          p.productID, 
          p.photo AS productPhoto, 
          p.detail,
          o.photo AS orderPhoto 
      FROM 
          users u 
      JOIN 
          products p ON u.userID = p.userID 
      JOIN 
          \`order\` o ON p.orderID = o.orderID
      WHERE
          o.photo IS NOT NULL AND o.photo != '0' AND o.photo != ''  AND o.Status = '1'
    `;
    dbconnect_1.conn.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            const orders = {};
            results.forEach(item => {
                const orderID = item.orderID;
                if (!orders[orderID]) {
                    orders[orderID] = {
                        orderID: orderID,
                        userID: item.userID,
                        name: item.name,
                        orderPhoto: item.orderPhoto,
                        phone: item.phone,
                        userPhoto: item.userPhoto,
                        address: item.address,
                        products: []
                    };
                }
                orders[orderID].products.push({
                    productID: item.productID,
                    productPhoto: item.productPhoto,
                    detail: item.detail
                });
            });
            const resultArray = Object.values(orders);
            res.status(200).json(resultArray);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    });
});
