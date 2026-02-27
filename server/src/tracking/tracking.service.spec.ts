import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios, { InternalAxiosRequestConfig } from 'axios';

import { Tracking, TrackingParams } from './tracking.interface';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';

jest.mock('axios', () => ({
  AxiosError: jest.requireActual('axios').AxiosError,
  post: jest.fn(),
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TrackingService', () => {
  let service: TrackingService;
  let controller: TrackingController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        TrackingService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = moduleRef.get(TrackingService);
    controller = moduleRef.get(TrackingController);

    mockedAxios.post.mockRestore();
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

  it('controller throws an error in case of absent trackingId', async () => {
    const payload: any = {
      trackingDocs: [
        {
          phone: '380111111111',
        },
      ],
    };

    mockedAxios.post.mockResolvedValue({
      data: { success: true, data: [] },
    });

    const controllerSpy = jest.spyOn(controller, 'findAll');
    await controller.findAll(payload);

    expect(controllerSpy).toThrow();
  });

  it(`controller doesn't throws an error in case of absent phone`, async () => {
    const payload: TrackingParams = {
      trackingDocs: [
        {
          trackingId: '1',
        },
      ],
    };

    mockedAxios.post.mockResolvedValue({
      data: { success: true, data: [] },
    });

    const controllerSpy = jest.spyOn(controller, 'findAll');
    await controller.findAll(payload);

    expect(controllerSpy).toThrow();
  });

  it(`findAll throws a correct error in case of request failure`, async () => {
    const payload: TrackingParams = {
      trackingDocs: [
        {
          trackingId: '1',
        },
      ],
    };

    const mockAxiosError = new AxiosError(
      'Request failed with status code 400',
      'ERR_BAD_REQUEST',
      {} as InternalAxiosRequestConfig,
      {},
      {
        status: 400,
        statusText: 'Wrong URL',
        data: { message: 'Wrong URL' },
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      },
    );

    mockedAxios.post.mockRejectedValue(mockAxiosError);

    try {
      await service.findAll(payload);
    } catch (err) {
      expect(err).toEqual(new HttpException('Wrong URL', 400));
    }
  });

  it(`findAll throws a correct error in case of unexpected error`, async () => {
    const payload: TrackingParams = {
      trackingDocs: [
        {
          trackingId: '1',
        },
      ],
    };

    const mockAxiosError = new AxiosError();

    mockedAxios.post.mockRejectedValue(mockAxiosError);

    try {
      await service.findAll(payload);
    } catch (err) {
      expect(err).toEqual(
        new HttpException('An unexpected error occurred', 400),
      );
    }
  });
});
