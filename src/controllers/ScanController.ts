import { NextFunction, Request, Response } from "express";
import { PostScanDTO } from "../dto/PostScanDTO";
import { AxeCoreSingleton } from "../utils/AxeCoreSingleton";
import {v7} from 'uuid'
import { ScanModel } from "../models/Scan";
import { Status } from "../enums/Status.enum";
import { PutScanBodyDTO, PutScanUriParamsDTO } from "../dto/PutScanDTO";
import { AxeCoreService } from "../service/AxeCoreService";
import { GetScanByIdResponseDTO, GetScanByIdUriParamsDTO } from "../dto/GetScanByIdDTO";
import { config } from "../config/config";
import { DeleteScanUriParamsDTO } from "../dto/DeleteScanDTO";
import { ExportCsvCSVFormatDTO, ExportCsvUriParamsDTO } from "../dto/ExportCsvDTO";
import {stringify} from 'csv-stringify'

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


    try{
        const scanToUpdate = await ScanModel.findOne({id});

        if(!scanToUpdate){
            res.status(404).json({message:"Scan not found"});
            return;
        }

        if(req.body){
            const {url} = req.body;
            scanToUpdate.url = url || scanToUpdate.url;
        }

        const scanService = await AxeCoreSingleton.getInstance();
        const scan = await scanNewPage(scanToUpdate.url as string,scanService, scanToUpdate);
        
        await scan.save();
        res.status(200).json(scan);
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}

export const getScanById = async (req:Request<GetScanByIdUriParamsDTO,any,any>, res:Response, next:NextFunction) => {
    const {id} = req.params
    console.log(`Getting Scan ${id}`);

    try{
        const scanToGet = await ScanModel.findOne({id});
        if(!scanToGet){
            res.status(404).json({message:"Scan not found"});
            return;
        }
        res.status(200).json(mapScan(scanToGet));
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}


export const exportCSV = async (req:Request<ExportCsvUriParamsDTO,any,any>, res:Response<any>, next:NextFunction) => {
    console.log(`Getting Csv import`);
    const id = req.params?.id
    try{

        const allScans = await ScanModel.find(id?{id}:{});
        let toCsv = []
        for (const scan of allScans) {
            toCsv.push(...mapToCSVFormat(scan));
        }
        stringify(toCsv,{header:true,}, (err, output) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error converting to CSV');
            }
            res.header('Content-Type', 'text/csv');
            res.attachment(`completeScan${id?`-${id}`:''}.csv`);
            return res.send(output);
        });
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}

export const getScanList = async (req:Request, res:Response<GetScanByIdResponseDTO[]>, next:NextFunction) => {
    console.log(`Getting all Scans`);
    try{
        const scans = await ScanModel.find({});
        console.log(`Scans to show ${scans}`)
        const scansMapped = scans.map(mapScan);

        res.status(200).json(scansMapped);
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}

export const deleteScan = async (req:Request<DeleteScanUriParamsDTO,any,any>, res:Response, next:NextFunction) => {
    const {id} = req.params
    console.log(`Deleting Scan ${id}`);
    try{
        const scanToDelete = await ScanModel.findOne({id});

        if(!scanToDelete){
            res.status(404).json({});
            return;
        }

        await scanToDelete.deleteOne();
        res.status(200).json(scan);
    }catch(err){
        console.log(`Error: ${err}`);
        next(err);
    }
}


function mapScan(scanToMap:any): GetScanByIdResponseDTO{
    return scanToMap ? {
        id: scanToMap?.id || '',
        csvLink:`${config.baseURL}:${config.port}/csvExport/${scanToMap?.id}`,
        error: scanToMap?.error || '',
        status: scanToMap?.status || '',
        url: scanToMap?.url || '',
        violations: scanToMap?.violations
    } : {}
}

function mapToCSVFormat(scanToMap:any): ExportCsvCSVFormatDTO[]{
    if(!scanToMap) return [];
    switch (scanToMap.status) {
        case Status.FAILED:
            return [{
                url: scanToMap?.url || '',
                error: scanToMap?.error || '',
                status: scanToMap?.status || '',
                violation: '',
                help: ''
            }]
        case Status.FULL_COMPLAINING:
            return [{
                url: scanToMap?.url || '',
                error: '',
                status: scanToMap?.status || '',
                violation: '',
                help: ''
            }]
        case Status.VIOLATIONS_PENDING:
            return scanToMap.violations.map((violation: { description: any; help: any; }) => {
                return {
                    url: scanToMap?.url || '',
                    error: '',
                    status: scanToMap?.status || '',
                    violation: violation.description,
                    help: violation.help
                }
            })
        default:
            return [];
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
            existingScan.error = undefined;
            return existingScan;
        }
        const scanResult = new ScanModel({
            id: v7(),
            url: url,
            status: updatedStatus,
            violations: scan.violations
        });
        return scanResult;
    } catch (error:any) {
        const updatedStatus =Status.FAILED;
        if(existingScan){
            existingScan.status = updatedStatus;
            existingScan.error = error.message;
            existingScan.violations = undefined;
            return existingScan;
        }
        const scanResult = new ScanModel({
            id: v7(),
            url: url,
            status: Status.FAILED,
            error: error.message
        });
        return scanResult;
    }

}