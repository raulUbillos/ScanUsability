import { NextFunction, Request, Response } from "express";
import { PostScanDTO } from "../dto/PostScanDTO";
import { AxeCoreSingleton } from "../utils/AxeCoreSingleton";
import {v7} from 'uuid'
import { ScanModel } from "../models/Scan";
import { Status } from "../enums/Status.enum";
import { PutScanBodyDTO, PutScanUriParamsDTO } from "../dto/PutScanDTO";
import { AxeCoreService } from "../service/AxeCoreService";

export const scan = async (req: Request<{}, {}, PostScanDTO>, res: Response, next: NextFunction  ) => {
    console.log("Scanning...");
    console.log(req.body);
    try{
        const { urls } = req.body;
        console.log(`Urls to retrieve: ${urls.join(',')}`);
        const scanService = await AxeCoreSingleton.getInstance();
        const results= [];
        for (const url of urls) {
           results.push(await scanNewPage(url, scanService));
        }
        scanService.closeBrowser();
        ScanModel.insertMany(results);
        res.status(200).json(results);
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
};


export const updateScan = async(req:Request<PutScanUriParamsDTO,any,PutScanBodyDTO>, res:Response, next:NextFunction) => {
    const {id} = req.params
    console.log(`Updating Scan ${id}`);

    const {url} = req.body;

    try{
        const scanToUpdate = await ScanModel.findById(id as String);

        if(!scanToUpdate){
            throw new Error("Scan not found");
        }

        if(url){
            scanToUpdate.url = url;
        }

        const scanService = await AxeCoreSingleton.getInstance();
        const scan = await scanNewPage(scanToUpdate.url as string,scanService, scanToUpdate);

        await scan.save();
        res.status(200).json({});
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}



async function scanNewPage(url: string, scanService: AxeCoreService, existingScan?: any) {
    try {
        console.log(`Url working on: ${url}`);
        const scan = await scanService.scan(url);
        const updatedStatus = scan.violations.length ? Status.VIOLATIONS_PENDING : Status.FULL_COMPLAINING;
        if(existingScan){
            existingScan.status = updatedStatus;
            existingScan.violations = scan.violations;
            return existingScan;
        }
        const scanResult = new ScanModel({
            _id: v7(),
            url: url,
            status: updatedStatus,
            violations: scan.violations
        });
        return scanResult;
    } catch (error:any) {
        const updatedStatus =Status.FAILED;
        if(existingScan){
            existingScan.status = updatedStatus;
            existingScan.error = error.message
            return existingScan;
        }
        const scanResult = new ScanModel({
            _id: v7(),
            url: url,
            status: Status.FAILED,
            error: error.message
        });
        return scanResult;
    }

}