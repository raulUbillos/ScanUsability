import puppeteer from "puppeteer";
import { AxeCoreService } from "../service/AxeCoreService";

export class AxeCoreSingleton{
    static async getInstance(){
        const browser = await puppeteer.launch();
        return new AxeCoreService(browser);
    }
}