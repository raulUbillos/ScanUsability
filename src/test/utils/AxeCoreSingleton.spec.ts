import {describe,it, expect} from '@jest/globals';
import { AxeCoreSingleton } from '../../utils/AxeCoreSingleton';
import { AxeCoreService } from '../../service/AxeCoreService';

describe("AxeCoreSingleton", () => {
    describe("When we call the getInstance method", () => {
        it("should return an instance of the AxeCoreService", async () => {
            const instance = await AxeCoreSingleton.getInstance();

            expect(instance).not.toBeFalsy();
            expect(instance.browser).not.toBeFalsy();
            expect(instance instanceof AxeCoreService).toBe(true)
        })
    })
})