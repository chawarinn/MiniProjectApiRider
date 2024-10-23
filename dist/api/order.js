"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const dbconnect_1 = require("../dbconnect");
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const mysql_1 = __importDefault(require("mysql"));
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
        this.diskLoader = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            limits: { fileSize: 67108864 },
        });
    }
}
const fileUpload = new FileMiddleware();
exports.router.post("/product", fileUpload.diskLoader.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderID, detail, userID, userIDSender } = req.body;
        let imageUrl = null;
        if (req.file) {
            const filename = `${Date.now()}-${Math.round(Math.random() * 10000)}.png`;
            const storageRef = (0, storage_1.ref)(storage, `/images/${filename}`);
            const metadata = { contentType: req.file.mimetype };
            yield (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
            imageUrl = yield (0, storage_1.getDownloadURL)(storageRef);
        }
        const sql = "INSERT INTO `products`(`photo`, `detail`, `orderID`, `userID`, `userIDSender`) VALUES (?, ?, ?, ?, ?)";
        const formattedSql = mysql_1.default.format(sql, [imageUrl, detail, orderID, userID, userIDSender]);
        dbconnect_1.conn.query(formattedSql, (err) => {
            if (err) {
                console.error("Error inserting product:", err);
                return res.status(500).json({ error: "Error inserting product." });
            }
            res.status(201).json({
                message: "Insert Product successfully.",
                imageUrl: imageUrl || null,
            });
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred." });
    }
}));
exports.router.get('/products', (req, res) => {
    const userID = req.query.userID;
    const userIDSender = req.query.userIDSender;
    const query = 'SELECT * FROM products WHERE userID = ? AND userIDSender = ? AND orderID = 0';
    dbconnect_1.conn.query(query, [userID, userIDSender], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database query error' });
        }
        if (results.length > 0) {
            res.json(results);
        }
        else {
            res.status(404).json({ error: 'No products found' });
        }
    });
});
exports.router.post('/addorder', (req, res) => {
    const order = req.body;
    const { userID, userIDSender, Status, photo, products, riderID } = order;
    const insertOrderQuery = 'INSERT INTO `order` (`userID`, `userIDSender`, `Status`, `photo`,`riderID`) VALUES (?, ?, ?, ?,?)';
    dbconnect_1.conn.query(insertOrderQuery, [userID, userIDSender, Status, photo, riderID], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).json({ error: 'Database query error' });
        }
        const orderId = results.insertId;
        const findProductsQuery = 'SELECT * FROM products WHERE userID = ? AND userIDSender = ? AND orderID = 0';
        dbconnect_1.conn.query(findProductsQuery, [userID, userIDSender], (error, productsResults) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).json({ error: 'Database query error' });
            }
            if (productsResults.length === 0) {
                return res.status(404).json({ error: 'No products found' });
            }
            const updateQueries = productsResults.map((product) => {
                return new Promise((resolve, reject) => {
                    const updateQuery = 'UPDATE `products` SET `orderID` = ? WHERE `productID` = ?';
                    dbconnect_1.conn.query(updateQuery, [orderId, product.productID], (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            });
            Promise.all(updateQueries)
                .then(() => {
                res.status(201).json({ message: 'Order added successfully', orderId });
            })
                .catch(err => {
                console.error('Update products error:', err);
                res.status(500).json({ error: 'Error updating products' });
            });
        });
    });
});
exports.router.get('/addressorder/:orderID', (req, res) => {
    const orderID = req.params.orderID;
    const query = `
        SELECT 
            u.userID, 
            u.name, 
            u.phone, 
            u.photo AS userPhoto, 
            u.address, 
            p.productID, 
            p.photo AS productPhoto, 
            p.detail
        FROM 
            users u 
        JOIN 
            products p ON u.userID = p.userID 
        WHERE 
            p.orderID = ?
    `;
    dbconnect_1.conn.query(query, [orderID], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            res.json({
                orderID: orderID,
                userID: results[0].userID,
                name: results[0].name,
                phone: results[0].phone,
                userPhoto: results[0].userPhoto,
                address: results[0].address,
                products: results.map((row) => ({
                    productID: row.productID,
                    productPhoto: row.productPhoto,
                    detail: row.detail
                }))
            });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    });
});
exports.router.get('/addressorderSent/:orderID', (req, res) => {
    const orderID = req.params.orderID;
    const query = `
      SELECT 
          u.userID, 
          u.name, 
          u.phone, 
          u.photo AS userPhoto, 
          u.address, 
          p.productID, 
          p.photo AS productPhoto, 
          p.detail
      FROM 
          users u 
      JOIN 
          products p ON u.userID = p.userIDSender
      WHERE 
          p.orderID = ?
  `;
    dbconnect_1.conn.query(query, [orderID], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            res.json({
                orderID: orderID,
                userID: results[0].userID,
                name: results[0].name,
                phone: results[0].phone,
                userPhoto: results[0].userPhoto,
                address: results[0].address,
                products: results.map((row) => ({
                    productID: row.productID,
                    productPhoto: row.productPhoto,
                    detail: row.detail
                }))
            });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    });
});
exports.router.get('/addressRider/:orderID', (req, res) => {
    const orderID = req.params.orderID;
    const query = `
      SELECT 
          r.riderID, 
          r.name AS riderName, 
          r.phone AS riderPhone, 
          r.photo AS riderPhoto, 
          r.car AS riderCar 
      FROM 
          riders r 
      JOIN 
          \`order\` o ON r.riderID = o.riderID 
      WHERE 
          o.orderID = ?
  `;
    dbconnect_1.conn.query(query, [orderID], (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        if (results.length > 0) {
            res.json({
                orderID: orderID,
                riderID: results[0].riderID,
                riderName: results[0].riderName,
                riderPhone: results[0].riderPhone,
                riderPhoto: results[0].riderPhoto,
                riderCar: results[0].riderCar,
            });
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    });
});
exports.router.put("/updatestatus/:orderID", fileUpload.diskLoader.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orderID = req.params.orderID;
        let sqlUpdate = "UPDATE `order` SET status = ? WHERE orderID = ?";
        const status = req.body.Status;
        sqlUpdate = mysql_1.default.format(sqlUpdate, [status, orderID]);
        dbconnect_1.conn.query(sqlUpdate, (updateErr) => {
            if (updateErr) {
                console.error("Error updating:", updateErr);
                res.status(501).json({ error: "Error updating order" });
                return;
            }
            res.status(200).json({
                message: "Order status updated successfully.",
            });
        });
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.router.put("/updatephotostatus/:orderID", fileUpload.diskLoader.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = null;
    if (req.file) {
        try {
            const filename = Date.now() + "-" + Math.round(Math.random() * 10000) + ".png";
            const storageRef = (0, storage_1.ref)(storage, "/images/" + filename);
            const metadata = { contentType: req.file.mimetype };
            const snapshot = yield (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
            imageUrl = yield (0, storage_1.getDownloadURL)(snapshot.ref);
        }
        catch (error) {
            console.error("Error uploading to Firebase:", error);
            res.status(509).json({ error: "Error uploading image." });
            return;
        }
    }
    try {
        console.log("Image URL:", imageUrl);
        const orderID = req.params.orderID;
        let sqlUpdate = "UPDATE `order` SET photo = ?, status = 1 WHERE orderID = ?";
        sqlUpdate = mysql_1.default.format(sqlUpdate, [imageUrl, orderID]);
        dbconnect_1.conn.query(sqlUpdate, (updateErr) => {
            if (updateErr) {
                console.error("Error updating order photo:", updateErr);
                res.status(501).json({ error: "Error updating order photo." });
                return;
            }
            res.status(200).json({
                message: "Photo updated successfully.",
                imageUrl: imageUrl,
            });
        });
    }
    catch (error) {
        console.error("Error updating photo:", error);
        res.status(500).json({ error: "Error updating photo." });
    }
}));
exports.router.put("/updaterider/:riderID/:orderID", (req, res) => {
    try {
        const riderID = req.params.riderID;
        const orderID = req.params.orderID;
        // อัปเดตคำสั่ง SQL เพื่อรวมเงื่อนไข
        let sqlUpdate = "UPDATE `order` SET riderID = ?, status = 2 WHERE orderID = ?";
        sqlUpdate = mysql_1.default.format(sqlUpdate, [riderID, orderID]);
        dbconnect_1.conn.query(sqlUpdate, (updateErr) => {
            if (updateErr) {
                console.error("Error updating order:", updateErr);
                res.status(501).json({ error: "Error updating order." });
                return;
            }
            res.status(200).json({
                message: "Order updated successfully.",
            });
        });
    }
    catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: "Error updating order." });
    }
});
exports.router.post("/_uploadImage", fileUpload.diskLoader.single("file"), // Middleware to handle single file uploads
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = null; // Variable to hold the image URL
    // Check if a file was uploaded
    if (req.file) {
        try {
            // Generate a unique filename
            const filename = `${Date.now()}-${Math.round(Math.random() * 10000)}.png`;
            const storageRef = (0, storage_1.ref)(storage, `/images/${filename}`); // Firebase Storage reference
            // Metadata for the uploaded file
            const metadata = {
                contentType: req.file.mimetype,
            };
            // Upload file to Firebase Storage
            const snapshot = yield (0, storage_1.uploadBytesResumable)(storageRef, req.file.buffer, metadata);
            // Get the download URL
            imageUrl = yield (0, storage_1.getDownloadURL)(snapshot.ref);
            // Send success response with the image URL
            res.status(201).json({ message: "Image uploaded successfully", imageUrl });
            return; // Ensure we return after sending the response
        }
        catch (error) {
            console.error("Error uploading to Firebase:", error);
            res.status(500).json({ error: "Error uploading image." });
            return; // Ensure we return after sending the response
        }
    }
    else {
        res.status(400).json({ error: "No file uploaded." }); // Handle case where no file is uploaded
        return;
    }
}));
