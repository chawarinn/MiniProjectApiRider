import express from "express";
import cors from "cors";
import { router as login } from "./api/login";
import { router as register } from "./api/register";
import { router as users } from "./api/users";
import { router as de } from "./api/delete";

import bodyParser from "body-parser";

export const app = express();
app.use(express.json());
app.use(bodyParser.text());
app.use(bodyParser.json());


// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });

app.use(
    cors({
      // origin: "*",
      origin: "http://localhost:4200"
      // origin: 'http://172.20.10.4',
    })  
  );
  
  app.use("", login);
  app.use("", register);
  app.use("/users", users);
app.use("/de", de);