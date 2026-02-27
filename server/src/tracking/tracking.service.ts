import axios, { AxiosError } from 'axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Tracking, TrackingParams } from './tracking.interface';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(private readonly configService: ConfigService) {}

  async findAll({ trackingDocs }: TrackingParams): Promise<Tracking> {
    try {
      const payload = {
        apiKey: this.configService.get('NP_APP_KEY'),
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: trackingDocs.map((doc) => ({
            DocumentNumber: doc.trackingId,
            Phone: doc.phone || this.configService.get('DEFAULT_TRACK_PHONE'),
          })),
        },
      };

      const response = await axios.post<Tracking>(
        `${this.configService.get('NP_API_URL')}`,
        payload,
      );

      const data = response.data;
      return data;
    } catch (err) {
      this.logger.error(`Failed retrieving parcels data: ${err}`);

      if (err instanceof AxiosError) {
        const status =
          err.response?.status ||
          err.status ||
          HttpStatus.INTERNAL_SERVER_ERROR;
        const data = err.response?.data;

        const message =
          data?.message ||
          data ||
          err.response?.statusText ||
          err.message ||
          'An unexpected error occurred';

        throw new HttpException(message, status);
      }
      throw err;
    }
  }
}
