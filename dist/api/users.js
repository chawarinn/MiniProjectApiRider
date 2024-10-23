"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const dbconnect_1 = require("../dbconnect");
const express_1 = __importDefault(require("express"));
const bcrypt = require("bcryptjs");
const multer_1 = __importDefault(require("multer"));
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
exports.router = express_1.default.Router();
const firebaseConfig = {
    apiKey: 'AIzaSyAiVnY-8Ajak4xVeQNLzynr8skqCgNFulg',
    appId: '1:259988227090:android:db894289cac749ff6c04cb',
    messagingSenderId: '259988227090',
    projectId: 'project-rider-1b5ac',
    storageBucket: 'project-rider-1b5ac.appspot.com',
};
(0, app_1.initializeApp)(firebaseConfig);
const storage = (0, storage_1.getStorage)();
class FileMiddleware {
    constructor() {
        this.filename = "";
        this.diskLoader = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            limits: { fileSize: 67108864 },
        });
    }
}
const fileUpload = new FileMiddleware();
exports.router.get('/userPhone', (req, res) => {
    const userID = req.query.userID;
    const query = 'SELECT * FROM users WHERE userID != ?';
    dbconnect_1.conn.query(query, [userID], (error, results) => {
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
exports.router.get('/user', (req, res) => {
    const userID = req.query.userID;
    const query = 'SELECT * FROM users WHERE userID = ?';
    dbconnect_1.conn.query(query, [userID], (error, results) => {
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
// Search for user by phone number
exports.router.get('/searchPhone', (req, res) => {
    const phone = req.query.phone;
    const query = 'SELECT * FROM users WHERE phone = ?';
    dbconnect_1.conn.query(query, [phone], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length > 0) {
            res.json(results);
        }
        else {
            res.status(404).json({ error: 'No user found' });
        }
    });
});
exports.router.get('/ordersent/:userIDSender', (req, res) => {
    const userIDSender = req.params.userIDSender;
    const query = `
    SELECT 
        p.orderID,
        u.userID,   
        u.name, 
        u.phone, 
        u.photo AS userPhoto, 
        u.address, 
        p.productID, 
        p.photo AS productPhoto, 
        p.detail,
        o.photo AS orderPhoto,
        o.Status
    FROM 
        users u 
    JOIN 
        products p ON u.userID = p.userID 
        JOIN 
        \`order\` o ON p.orderID = o.orderID
    WHERE 
        p.userIDSender = ?
    AND 
        o.photo IS NOT NULL AND o.photo != '0' AND o.photo != '' AND o.Status != '0'
  `;
    dbconnect_1.conn.query(query, [userIDSender], (error, results) => {
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
                        Status: item.Status,
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
exports.router.get('/orderreceiver/:userID', (req, res) => {
    const userID = parseInt(req.params.userID);
    const query = `
    SELECT 
        p.orderID,
        p.userIDSender,   
        uSender.name AS senderName, 
        uSender.phone AS senderPhone, 
        uSender.photo AS senderPhoto, 
        uSender.address AS senderAddress, 
        p.productID, 
        p.photo AS productPhoto, 
        p.detail ,
        o.photo AS orderPhoto,
        o.Status
    FROM 
        users uSender  
    JOIN 
        products p ON uSender.userID = p.userIDSender 
    JOIN 
        \`order\` o ON p.orderID = o.orderID
    WHERE 
        p.userID = ? 
    AND 
       o.photo IS NOT NULL AND o.photo != '0' AND o.photo != '' AND o.Status != '0'
  `;
    dbconnect_1.conn.query(query, [userID], (error, results) => {
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
                        userIDSender: item.userIDSender,
                        name: item.senderName,
                        orderPhoto: item.orderPhoto,
                        phone: item.senderPhone,
                        userPhoto: item.senderPhoto,
                        address: item.senderAddress,
                        Status: item.Status,
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
            res.status(404).json({ message: 'No orders found for this user.' });
        }
    });
});
