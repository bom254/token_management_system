const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { SuiClient, getFullnodeUrl} = require('@mysten/sui');
const { User, Transaction} = require('./models');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDb
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// JWT Middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({error: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(401).json({error: 'Invalid token'});
        req.user = decoded;
        next();
    });
};

// Login Endpoint (Wallet Signature Verification)
app.post('/api/login', async (req, res) => {
    const { walletAddress, signature, message} = req.body;
    // Placeholder for signature verification (requires wallet integration)
    const isValid = true;
    if(!isValid) return res.status(401).json({error: 'Invalid signature'});

    let user = await User.findOne({walletAddress});
    if(!User) {
        user = new User({
            walletAddress,
            role: walletAddress === process.env.ADMIN_ADDRESS ? 'Admin' : 'user',
        });
        await user.save();
    }

    const token = jwt.sign({walletAddress, role:user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
    res.json({token});
});

// Get Transaction History
app.get('/api/transactions', authenticate, async (req, res) => {
    const { address} = req.query;
    if(req.user.walletAddress !== address) return res.status(403).json({error: 'Unauthorized'});
    const transactions = await Transaction.find({
        $or: [{ from:address}, {to:address}],
    });
    res.json(transactions);
});

// Blockchain Event Listener
async function listenToEvents() {
    const client = new SuiClient({ url:process.env.SUI_TESTNET_URL});
    client.subscribeEvent({
        filter: {MoveEventModule: {package:process.env.PACKAGE_ID, module: 'simple_token_management'}},
        onMessage: async (event) => {
            if(event.type.includes('transfer')) {
                const {from, to, amount} = event.parsedJson;
                const tx = new Transaction({from, to, amount});
                await tx.save();
                console.log(`Logged transfer: ${from} -> ${to}, ${amount} TOK`);
            }
        },
    });
}

listenToEvents().catch(err => console.error('Event listener error:', err));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));