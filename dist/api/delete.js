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
exports.router = express_1.default.Router();
exports.router.delete("/deleteU/:usersID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersID = req.params.usersID;
    let deleteUserSql = 'DELETE FROM users WHERE userID = ?';
    deleteUserSql = mysql_1.default.format(deleteUserSql, [usersID]);
    dbconnect_1.conn.query(deleteUserSql, (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ error: "Error deleting user." });
        }
        return res.status(200).json({ message: "User and image deleted successfully." });
    });
}));
exports.router.delete("/deleteR/:usersID", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersID = req.params.usersID;
    let deleteUserSql = 'DELETE FROM riders WHERE riderID = ?';
    deleteUserSql = mysql_1.default.format(deleteUserSql, [usersID]);
    dbconnect_1.conn.query(deleteUserSql, (err, result) => {
        if (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ error: "Error deleting user." });
        }
        return res.status(200).json({ message: "User and image deleted successfully." });
    });
}));
