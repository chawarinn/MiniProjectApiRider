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
const mysql_1 = __importDefault(require("mysql"));
const multer_1 = __importDefault(require("multer"));
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const bcrypt = require("bcryptjs");
exports.router = express_1.default.Router();
// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyAiVnY-8Ajak4xVeQNLzynr8skqCgNFulg',
    appId: '1:259988227090:android:db894289cac749ff6c04cb',
    messagingSenderId: '259988227090',
    projectId: 'project-rider-1b5ac',
    storageBucket: 'project-rider-1b5ac.appspot.com',
};
// Initialize Firebase
(0, app_1.initializeApp)(firebaseConfig);
const storage = (0, storage_1.getStorage)();
// Multer setup for file uploads
class FileMiddleware {
    constructor() {
        this.filename = "";
        this.diskLoader = (0, multer_1.default)({
            storage: multer_1.default.memoryStorage(),
            limits: { fileSize: 67108864 }, // 64MB limit
        });
    }
}
const fileUpload = new FileMiddleware();
// Register Rider route
exports.router.post("/registerR", fileUpload.diskLoader.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const riders = req.body;
    // Validate passwords
    if (riders.password !== riders.confirmPassword) {
        res.status(400).json({ error: "Passwords do not match." });
        return;
    }
    // Check for duplicate phone number
    let checkphoneSql = `SELECT phone FROM riders WHERE phone = ?`;
    checkphoneSql = mysql_1.default.format(checkphoneSql, [riders.phone]);
    dbconnect_1.conn.query(checkphoneSql, (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(500).json({ error: "Internal server error." });
        }
        if (results.length > 0) {
            return res.status(409).json({ error: "Phone number already registered." });
        }
        // Upload image to Firebase
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
                return res.status(500).json({ error: "Error uploading image." });
            }
        }
        try {
            const hashedPassword = yield bcrypt.hash(riders.password, 10);
            let sql = "INSERT INTO `riders`(`phone`, `name`, `password`, `car`, `photo`) VALUES (?,?,?,?,?)";
            sql = mysql_1.default.format(sql, [riders.phone, riders.name, hashedPassword, riders.car, imageUrl]);
            dbconnect_1.conn.query(sql, (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(501).json({ error: "Error registering user." });
                }
                return res.status(201).json({
                    message: "User registered successfully.",
                    imageUrl: imageUrl,
                });
            });
        }
        catch (hashError) {
            console.error("Error hashing password:", hashError);
            return res.status(500).json({ error: "Error registering user." });
        }
    }));
}));
exports.router.post("/registerU", fileUpload.diskLoader.single("file"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = req.body;
    // ตรวจสอบรหัสผ่าน
    if (users.password !== users.confirmPassword) {
        res.status(400).json({ error: "Passwords do not match." });
        return;
    }
    let checkphoneSql = `
  SELECT phone FROM users WHERE phone = ?
`;
    checkphoneSql = mysql_1.default.format(checkphoneSql, [users.phone]);
    dbconnect_1.conn.query(checkphoneSql, (err, results) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.error("Error checking phone number:", err);
            return res.status(600).json({ error: "Internal server error." });
        }
        if (results.length > 0) {
            return res
                .status(409)
                .json({ error: "Phone number already registered." });
        }
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
                return res.status(509).json({ error: "Error uploading image." });
            }
        }
        try {
            console.log("User data:", users);
            console.log("Hashing password...");
            const hashedPassword = yield bcrypt.hash(users.password, 10);
            console.log("Hashed password:", hashedPassword);
            console.log("Image URL:", imageUrl);
            let sql = "INSERT INTO `users`(`phone`, `name`, `password`, `address`, `lat`, `long`, `photo`) VALUES (?,?,?,?,?,?,?)";
            sql = mysql_1.default.format(sql, [
                users.phone,
                users.name,
                hashedPassword,
                users.address,
                users.lat,
                users.long,
                imageUrl,
            ]);
            dbconnect_1.conn.query(sql, (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(501).json({ error: "Error registering user." });
                }
                const userID = result.insertId;
                return res.status(201).json({
                    message: "User registered successfully.",
                    imageUrl: imageUrl,
                    userID: userID,
                });
            });
        }
        catch (hashError) {
            console.error("Error hashing password:", hashError);
            return res.status(500).json({ error: "Error registering user 1." });
        }
    }));
}));
