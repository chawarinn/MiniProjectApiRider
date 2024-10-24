import { conn } from "../dbconnect";
import express from "express";
import { Users } from "../model/users_get_res";
import mysql from "mysql";
import bcrypt from 'bcryptjs';

export const router = express.Router();

// Login for Users
router.post("/loginU", (req, res) => {
    const { phone, password } = req.body;

    const sqlUser = "SELECT * FROM users WHERE phone = ?";
    conn.query(sqlUser, [phone], (err, userResult) => {
        if (err) {
            return res.status(500).json({ message: "An error occurred" });
        }

        if (userResult.length > 0) {
            const user = userResult[0];
            bcrypt.compare(password, user.password, (err, match) => {
                if (err) {
                    return res.status(500).json({ message: "An error occurred" });
                }
                if (match) {
                    return res.json({
                        message: "User login successful",
                        user: user
                    });
                } else {
                    return res.status(401).json({ message: "Invalid phone or password" });
                }
            });
        } else {
            return res.status(404).json({ message: "No user found with that phone number" });
        }
    });
});

// Login for Riders
router.post("/loginR", (req, res) => {
    const { phone, password } = req.body;

    const sqlRider = "SELECT * FROM riders WHERE phone = ?";
    conn.query(sqlRider, [phone], (err, riderResult) => {
        if (err) {
            return res.status(500).json({ message: "An error occurred" });
        }

        if (riderResult.length > 0) {
            const rider = riderResult[0];
            bcrypt.compare(password, rider.password, (err, match) => {
                if (err) {
                    return res.status(500).json({ message: "An error occurred" });
                }
                if (match) {
                    return res.json({
                        message: "Rider login successful",
                        rider: rider
                    });
                } else {
                    return res.status(401).json({ message: "Invalid phone or password" });
                }
            });
        } else {
            return res.status(404).json({ message: "No user found with that phone number" });
        }
    });
});