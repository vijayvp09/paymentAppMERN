const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config");

const signupSchema = zod.object({
    username: zod.string(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string(),
})

router.post("/signup", async (req, res) => {
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    
    if (!success) {
        res.status(411).json({
            message: "incorrect input"
        });
    }

    const existingUser = await User.findOne({username: body.userName})
    
    if (existingUser) {
        res.status(411).json({
            message: "Email already taken",
        });
    }

    const newUser = await User.create({
        username: body.username,
        password: body.password,
        last_name: body.lastName,
        first_name: body.firstName,
    });

    const userId = newUser._id;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.status(200).json({
        message: "successfully created",
        token: token
    })
});

module.exports = router;