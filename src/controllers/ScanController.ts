import { NextFunction, Request, Response } from "express";
import { ScanDTO } from "../dto/ScanDTO";
import { AxeCoreSingleton } from "../utils/AxeCoreSingleton";
import {v7} from 'uuid'
import { ScanModel } from "../models/Scan";
import { Status } from "../enums/Status.enum";

export const scan = async (req: Request<{}, {}, ScanDTO>, res: Response, next: NextFunction  ) => {
    console.log("Scanning...");
    console.log(req.body);
    try{
        const { urls } = req.body;
        console.log(`Urls to retrieve: ${urls.join(',')}`);
        const scanService = await AxeCoreSingleton.getInstance();
        const results = [];
        for (const url of urls) {
            console.log(`Url working on: ${url}`);
            const scan = await scanService.scan(url);
            results.push(
                {
                    _id: v7(),
                    url: url,
                    status: scan.violations.length ? Status.VIOLATIONS_PENDING: Status.FULL_COMPLAINING,
                    violations: scan.violations
                }
            );
        }
        scanService.closeBrowser();
        ScanModel.insertMany(results);
        res.status(200).json(results);
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
};


export const updateScan = async(req:Request<{id:String},{},{}>, res:Response, next:NextFunction) => {
    const {id} = req.params
    console.log(`Updating Scan ${id}`);

    try{
        const scanToUpdate = await ScanModel.findById(id as String);

        if(!scanToUpdate){
            throw new Error("Scan not found");
        }

        const scanService = await AxeCoreSingleton.getInstance();
        const scan = await scanService.scan(scanToUpdate.url as string);

        if(scan.violations.length){
            scanToUpdate.status = Status.VIOLATIONS_PENDING;
        }else{
            scanToUpdate.status = scanToUpdate.status == Status.VIOLATIONS_PENDING ? Status.FIXED : scanToUpdate.status;
        }

        await scanToUpdate.save();
        res.status(200).json({});
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}