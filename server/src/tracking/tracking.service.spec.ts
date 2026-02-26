import { Tracking, TrackingParams } from './tracking.interface';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { ConfigService } from '@nestjs/config';

describe('TrackingService', () => {
  let dependencyService: ConfigService;
  let service: TrackingService;
  let controller: TrackingController;

  beforeEach(() => {
    dependencyService = new ConfigService();
    service = new TrackingService(dependencyService);
    controller = new TrackingController(service);
  });

  it('controller correctly calls a service method: findAll', async () => {
    const payload: TrackingParams = {
      trackingDocs: [
        {
          trackingId: '1',
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
});
