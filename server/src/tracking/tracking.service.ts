import axios, { AxiosError } from 'axios';
import { Injectable, Logger } from '@nestjs/common';
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
      this.logger.error(
        `Failed retrieving parcel data: ${JSON.stringify(err)}`,
      );

      if (err instanceof AxiosError) {
        throw {
          status: err.response?.status,
          message: err.response?.data || err.response?.statusText,
        };
      }
      throw err;
    }
  }
}
