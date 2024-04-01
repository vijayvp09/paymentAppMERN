const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../config");
const  { authMiddleware } = require("../Middleware");

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
});

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

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            first_name: {
                "$regex": filter
            }
        }, {
            last_name: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            _id: user._id
        }))
    })
})

module.exports = router;