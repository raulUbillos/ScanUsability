import {Schema, model} from 'mongoose';

const scanSchema = new Schema({
    _id: String,
    url: String,
    status: String,
    violations: Object
});

export const ScanModel = model('Scan', scanSchema);