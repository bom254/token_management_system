const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, require: true},
    amount: {type: Number, required: true},
    timestamp: {type: Date, default: Date.now},
});

module.exports = mongoose.model('Transaction', TransactionSchema);