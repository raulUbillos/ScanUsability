import * as ScanController from '../../controllers/ScanController';
import { ScanModel } from '../../models/Scan';
import { Status } from '../../enums/Status.enum';
import { AxeCoreSingleton } from '../../utils/AxeCoreSingleton';
import { config } from '../../config/config';
import { Request, Response, NextFunction } from 'express';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock('../../models/Scan');
jest.mock('../../utils/AxeCoreSingleton');
jest.mock('csv-stringify', () => ({
  stringify: jest.fn((data: any, opts: any, cb: (err: Error | null, result: string) => void) => cb(null, 'csv-content'))
}));

const mockScanInstance = {
  save: jest.fn(),
  deleteOne: jest.fn(),
};

describe('ScanController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
      header: jest.fn() as any,
      attachment: jest.fn() as any,
      send: jest.fn() as any,
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getScanList', () => {
    it('should return a list of scans', async () => {
      (ScanModel.find as any).mockResolvedValue([
        { id: '1', url: 'a', status: Status.FULL_COMPLAINING, violations: [] }
      ]);
      await ScanController.getScanList(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    it('should handle errors', async () => {
      (ScanModel.find as any).mockRejectedValue(new Error('fail'));
      await ScanController.getScanList(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getScanById', () => {
    it('should return a scan by id', async () => {
      req = { params: { id: '1' } };
      (ScanModel.findOne as any).mockResolvedValue({ id: '1', url: 'a', status: Status.FULL_COMPLAINING, violations: [] });
      await ScanController.getScanById(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    });

    it('should return 404 if not found', async () => {
      req = { params: { id: '1' } };
      (ScanModel.findOne as any).mockResolvedValue(null);
      await ScanController.getScanById(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req = { params: { id: '1' } };
      (ScanModel.findOne as any).mockRejectedValue(new Error('fail'));
      await ScanController.getScanById(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('scan', () => {
    it('should scan urls and insert results', async () => {
      req.body = { urls: ['http://a.com'] };
      const mockService = {
        scan: jest.fn<any>().mockResolvedValue({ violations: [] }),
        closeBrowser: jest.fn(),
      };
      (AxeCoreSingleton.getInstance as any).mockResolvedValue(mockService);
      (ScanModel.insertMany as any).mockResolvedValue(undefined);

      await ScanController.scan(req as any, res as any, next);

      expect(mockService.scan).toHaveBeenCalledWith('http://a.com');
      expect(mockService.closeBrowser).toHaveBeenCalled();
      expect(ScanModel.insertMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      req.body = { urls: ['http://a.com'] };
      (AxeCoreSingleton.getInstance as any).mockRejectedValue(new Error('fail'));
      await ScanController.scan(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('updateScan', () => {
    it('should update and rescan', async () => {
      const scanToUpdate = { ...mockScanInstance, id: '1', url: 'http://a.com', status: Status.FULL_COMPLAINING, violations: [] };
      req = { params: { id: '1' }, body: { url: 'http://b.com' } };
      (ScanModel.findOne as any).mockResolvedValue(scanToUpdate);
      const mockService = {
        scan: jest.fn<any>().mockResolvedValue({ violations: [] }),
        closeBrowser: jest.fn(),
      };
      (AxeCoreSingleton.getInstance as any).mockResolvedValue(mockService);

      await ScanController.updateScan(req as any, res as any, next);

      // Validate that the url was updated
      expect(scanToUpdate.url).toBe('http://b.com');
      // Validate that save was called
      expect(scanToUpdate.save).toHaveBeenCalled();
      // Validate response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      req = { params: { id: '1' }, body: { url: 'http://b.com' } };
      (ScanModel.findOne as any).mockResolvedValue(null);
      await ScanController.updateScan(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req = { params: { id: '1' }, body: { url: 'http://b.com' } };
      (ScanModel.findOne as any).mockRejectedValue(new Error('fail'));
      await ScanController.updateScan(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('deleteScan', () => {
    it('should delete a scan', async () => {
      req = { params: { id: '1' } };
      (ScanModel.findOne as any).mockResolvedValue(mockScanInstance);
      await ScanController.deleteScan(req as any, res as any, next);
      expect(mockScanInstance.deleteOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 404 if not found', async () => {
      req = { params: { id: '1' } };
      (ScanModel.findOne as any).mockResolvedValue(null);
      await ScanController.deleteScan(req as any, res as any, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      req = { params: { id: '1' } };
      (ScanModel.findOne as any).mockRejectedValue(new Error('fail'));
      await ScanController.deleteScan(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('exportCSV', () => {
    it('should export CSV for all scans', async () => {
      (ScanModel.find as any).mockResolvedValue([
        { id: '1', url: 'a', status: Status.FULL_COMPLAINING, violations: [] }
      ]);
      req.params = {};
      await ScanController.exportCSV(req as any, res as any, next);
      expect(res.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.attachment).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith('csv-content');
    });

    it('should handle errors', async () => {
      (ScanModel.find as any).mockRejectedValue(new Error('fail'));
      await ScanController.exportCSV(req as any, res as any, next);
      expect(next).toHaveBeenCalled();
    });
  });
});