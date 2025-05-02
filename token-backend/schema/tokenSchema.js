import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
    address: {type: String, required: true},
    balance: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);