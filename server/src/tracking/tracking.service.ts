import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NovaPoshtaPayload, Tracking, TrackingParams } from './tracking.interface';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) { }

  async findAll({ trackingDocs }: TrackingParams): Promise<Tracking> {
    try {
      const payload: NovaPoshtaPayload = {
        apiKey: this.configService.get<string>('NP_APP_KEY') || '',
        modelName: 'TrackingDocument',
        calledMethod: 'getStatusDocuments',
        methodProperties: {
          Documents: trackingDocs.map((doc) => ({
            DocumentNumber: doc.trackingId,
            Phone:
              doc.phone ||
              this.configService.get<string>('DEFAULT_TRACK_PHONE') ||
              '',
          })),
        },
      };

      const { data } = await firstValueFrom(
        this.httpService.post<Tracking>(
          this.configService.get<string>('NP_API_URL') || '',
          payload,
        ),
      );

      return data;
    } catch (err) {
      this.logger.error(`Failed retrieving parcels data: ${JSON.stringify(err.message || err)}`);

      if (err.response) {
        const { status, data } = err.response;
        const message =
          data?.message || data || 'An unexpected error occurred';
        throw new HttpException(message, status);
      }

      throw new HttpException(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
