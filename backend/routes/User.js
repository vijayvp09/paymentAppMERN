const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config");

const signupSchema = zod.object({
    username: zod.string().email(),
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

const signInSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

router.post("/signin", async(req, res) => {
    const {success} = signInSchema.safeParse(req.body);
    
    if(!success) {
        res.status(411).json({
            message: "incorrect input"
        });
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password,
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        });
        return;
    }

});

module.exports = router;