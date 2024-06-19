const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const User = require("../models/user");
const Pin = require("../models/pin");

const jwtpassword = "12345";


router.get("/", (req, res) => {
    res.render("home");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/pin", (req, res) => {
    res.render("pin");
});

router.get('/dashboard',(req,res)=>{
    res.render("dashboard.ejs");
})

router.post("/signup", async (req, res) => {
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        cardNumber += ' '; // Adds a space after every 4 digits
      }
      cardNumber += Math.floor(Math.random() * 10); // Generates a single random digit and adds it to the card number
    }
    const randomBalance = Math.floor(Math.random() * 100000);
    const { name, email, password } = req.body;

    try {
        const uniqueId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ userId: uniqueId, name, email, password: hashedPassword,cardnumber: cardNumber, balance: randomBalance });
        await newUser.save();
        console.log(randomBalance)
        res.redirect("/login");
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Error signing up. Please try again later.");
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ userId: user.userId, email: user.email }, jwtpassword);
            res.render("pin");
        } else {
            res.status(401).send("Invalid credentials");
        }
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).send("Error logging in. Please try again later.");
    }
});

router.post("/pin", async (req, res) => {
    const { email, pin } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const newPin = new Pin({ email, pin });
        await newPin.save();

        res.redirect("/");
    } catch (error) {
        console.error("Error in pin-validation:", error);
        res.status(500).send("Error in pin-validation. Please try again later.");
    }
});
// router.get("/entre")

router.post("/entre", async (req, res) => {
    const { pin } = req.body;
    try {
        const pinvalid = await Pin.findOne({ pin });

        if (!pinvalid) {
            return res.status(404).send("Incorrect Pin");
        } else {
            console.log("Valid");
            res.redirect("/dashboard");
            return res.status(200).send("Pin is valid");
        }
    } catch (error) {
        console.error("Error in pin-validation:", error);
        return res.status(500).send("Error in pin-validation. Please try again later.");
    }
});


module.exports = router;
