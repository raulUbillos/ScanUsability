import { NextFunction, Request, Response } from "express";
import { ScanDTO } from "../dto/ScanDTO";
import { AxeCoreSingleton } from "../utils/AxeCoreSingleton";
import {v7} from 'uuid'
import { ScanModel } from "../models/Scan";

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
                    id: v7(),
                    url: url,
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