import { Body, Controller, Post } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import type { TrackingParams } from './tracking.interface';

@Controller('api/tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  findAll(@Body() payload: TrackingParams) {
    return this.trackingService.findAll({ trackingDocs: payload.trackingDocs });
  }
}
