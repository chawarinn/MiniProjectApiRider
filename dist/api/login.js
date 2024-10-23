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
//
exports.router = express_1.default.Router();
const bcrypt = require('bcryptjs');
exports.router.post("/loginU", (req, res) => {
    const { phone, password } = req.body;
    const sqlUser = "SELECT * FROM users WHERE phone = ?";
    dbconnect_1.conn.query(sqlUser, [phone], (err, userResult) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
            return;
        }
        if (userResult.length > 0) {
            const user = userResult[0];
            const match = yield bcrypt.compare(password, user.password);
            if (match) {
                res.json({
                    message: "User login successful",
                    user: user
                });
                return;
            }
            else {
                res.status(401).json({ message: "Invalid phone or password" });
                return;
            }
        }
    }));
});
exports.router.post("/loginR", (req, res) => {
    const { phone, password } = req.body;
    const sqlRider = "SELECT * FROM riders WHERE phone = ?";
    dbconnect_1.conn.query(sqlRider, [phone], (err, riderResult) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(500).json({ message: "An error occurred" });
            return;
        }
        if (riderResult.length > 0) {
            const rider = riderResult[0];
            const match = yield bcrypt.compare(password, rider.password);
            if (match) {
                res.json({
                    message: "Rider login successful",
                    rider: rider
                });
            }
            else {
                res.status(401).json({ message: "Invalid phone or password" });
            }
        }
        else {
            res.status(404).json({ message: "No user found with that phone number" });
        }
    }));
});
