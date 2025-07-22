import {Schema, model} from 'mongoose';



const scanSchema = new Schema({
    _id: String,
    url: String,
    status: String,
    violations: Object,
    error: String
});

export const ScanModel = model('Scan', scanSchema);