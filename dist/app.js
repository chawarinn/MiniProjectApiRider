"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const login_1 = require("./api/login");
const register_1 = require("./api/register");
const users_1 = require("./api/users");
const delete_1 = require("./api/delete");
const order_1 = require("./api/order");
const rider_1 = require("./api/rider");
const body_parser_1 = __importDefault(require("body-parser"));
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use(body_parser_1.default.text());
exports.app.use(body_parser_1.default.json());
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });
exports.app.use((0, cors_1.default)({
    origin: "*",
    // origin: "http://localhost:4200"
    // origin: 'http://172.20.10.4',
}));
exports.app.use("", login_1.router);
exports.app.use("", register_1.router);
exports.app.use("/users", users_1.router);
exports.app.use("/de", delete_1.router);
exports.app.use("/order", order_1.router);
exports.app.use("/riders", rider_1.router);
