import {Schema, model, ObjectId} from 'mongoose';



const scanSchema = new Schema({
    id: {
        type:String,
        required:true
    },
    url: {
        type:String,
        required:true
    },
    status: {
        type:String,
        required:true
    },
    violations:  {
        type:Object,
        required:false
    },
    error:  {
        type:String,
        required:false
    }
});

export const ScanModel = model('scans', scanSchema);