import {Schema, model} from 'mongoose';

const scanSchema = new Schema({
    id: String,
    url: String,
    violations: Object
});

export const ScanModel = model('Scan', scanSchema);