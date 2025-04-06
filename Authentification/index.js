require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/authDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected for Auth Service"))
  .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    nom: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', UserSchema);
app.post('/auth/register', async (req, res) => {
    const { nom, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already used" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ nom, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User registered successfully" });
});
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { userId: user._id, email: user.email }, 
        'secretkey',
        { expiresIn: '1h' }
    );
    res.json({ token });
});


const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const verified = jwt.verify(token, 'secretkey');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};


app.get('/auth/protected', authMiddleware, (req, res) => {
    res.json({ message: "Welcome to protected route!", user: req.user });
});

app.listen(3000, () => console.log("Auth Service running on port http://localhost:3000"));
