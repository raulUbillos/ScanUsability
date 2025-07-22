import {describe,it, expect,jest} from '@jest/globals';
import { AxeCoreService } from '../../service/AxeCoreService';
import puppeteer, { Page } from 'puppeteer';
import AxePuppeteer from '@axe-core/puppeteer';

describe('AxeCoreService', () => {
    describe('When we need to retrieve the results for a page', () => {
        it('Should call the analyze method and th page should go to the given url', async () => {
            const pageSpy = jest.spyOn(Page.prototype, 'goto');
            const analyzeSpy = jest.spyOn(AxePuppeteer.prototype, 'analyze');
            
            const TEST_URL = 'http://www.google.com'

            const browser = await puppeteer.launch();

            const axeCoreService = new AxeCoreService(browser);

            const result = await axeCoreService.scan(TEST_URL);

            expect(result).not.toBeFalsy();
            expect(analyzeSpy).toHaveBeenCalled();
            expect(pageSpy).toHaveBeenCalledWith(TEST_URL);
        })
    })
})