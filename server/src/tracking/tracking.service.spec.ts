import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { Tracking, TrackingParams } from './tracking.interface';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('TrackingService', () => {
  let service: TrackingService;
  let controller: TrackingController;
  let httpService: HttpService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        TrackingService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => key) },
        },
        {
          provide: HttpService,
          useValue: { post: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(TrackingService);
    controller = moduleRef.get(TrackingController);
    httpService = moduleRef.get(HttpService);
  });

  it('controller correctly calls a service method: findAll', async () => {
    const payload: TrackingParams = {
      trackingDocs: [
        {
          trackingId: '1',
          phone: '380111111111',
        },
      ],
    };

    const findAllSpy = jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve({} as Tracking));

    await controller.findAll(payload);

    expect(findAllSpy).toHaveBeenCalledTimes(1);
    expect(findAllSpy).toHaveBeenCalledWith(payload);
  });

  it('findAll returns data on success', async () => {
    const payload: TrackingParams = {
      trackingDocs: [{ trackingId: '1' }],
    };
    const mockData = { success: true, data: [] } as any;
    const response: AxiosResponse<Tracking> = {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };

    jest.spyOn(httpService, 'post').mockReturnValue(of(response));

    const result = await service.findAll(payload);
    expect(result).toEqual(mockData);
  });

  it('findAll throws HttpException on response error', async () => {
    const payload: TrackingParams = {
      trackingDocs: [{ trackingId: '1' }],
    };
    const errorResponse = {
      response: {
        status: 404,
        data: { message: 'Not Found' },
      },
    };

    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => errorResponse));

    await expect(service.findAll(payload)).rejects.toThrow(
      new HttpException('Not Found', 404),
    );
  });

  it('findAll throws unexpected error if no response is present', async () => {
    const payload: TrackingParams = {
      trackingDocs: [{ trackingId: '1' }],
    };

    jest.spyOn(httpService, 'post').mockReturnValue(throwError(() => new Error('Network Error')));

    await expect(service.findAll(payload)).rejects.toThrow(
      new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR),
    );
  });
});
