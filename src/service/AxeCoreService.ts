
import { AxePuppeteer } from "@axe-core/puppeteer";
import puppeteer, { Browser, Page } from "puppeteer";

export class AxeCoreService {
    private browser: Browser;

    constructor(browser: Browser) {
        this.browser = browser;
    }

    async scan(url: string) {
        const page = await this.browser.newPage();
        await page.goto(url);
        const axe = new AxePuppeteer(page);
        const results = await axe.analyze();
        return results;
    }
    async closeBrowser(){
        await this.browser.close();
    }
}