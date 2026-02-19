import axios, { AxiosError } from "axios";
import logger from "../providers/logger";

type TrackParams = {
  track_id: string;
  phone: string;
};

interface NovaPoshtaTrackingDocument {
  PossibilityCreateReturn: boolean;
  PossibilityCreateRefusal: boolean;
  PossibilityChangeEW: boolean;
  PossibilityCreateRedirecting: boolean;
  Number: string;
  Redelivery: string;
  RedeliverySum: string;
  RedeliveryNum: string;
  RedeliveryPayer: string;
  OwnerDocumentType: string;
  LastCreatedOnTheBasisDocumentType: string;
  LastCreatedOnTheBasisPayerType: string;
  LastCreatedOnTheBasisDateTime: string;
  LastTransactionStatusGM: string;
  LastTransactionDateTimeGM: string;
  LastAmountTransferGM: string;
  DateCreated: string;
  DocumentWeight: string;
  FactualWeight: string;
  VolumeWeight: string;
  CheckWeight: string;
  CheckWeightMethod: string;
  DocumentCost: string;
  CalculatedWeight: string;
  SumBeforeCheckWeight: string;
  PayerType: string;
  RecipientFullName: string;
  RecipientDateTime: string;
  ScheduledDeliveryDate: string;
  PaymentMethod: string;
  CargoDescriptionString: string;
  CargoType: string;
  CitySender: string;
  CityRecipient: string;
  WarehouseRecipient: string;
  CounterpartyType: string;
  AfterpaymentOnGoodsCost: string;
  ServiceType: string;
  UndeliveryReasonsSubtypeDescription: string;
  WarehouseRecipientNumber: string;
  LastCreatedOnTheBasisNumber: string;
  PhoneRecipient: string;
  RecipientFullNameEW: string;
  WarehouseRecipientInternetAddressRef: string;
  MarketplacePartnerToken: string;
  ClientBarcode: string;
  RecipientAddress: string;
  CounterpartyRecipientDescription: string;
  CounterpartySenderType: string;
  DateScan: string;
  PaymentStatus: string;
  PaymentStatusDate: string;
  AmountToPay: string;
  AmountPaid: string;
  Status: string;
  StatusCode: string;
  RefEW: string;
  BackwardDeliverySubTypesActions: string;
  BackwardDeliverySubTypesServices: string;
  UndeliveryReasons: string;
  DatePayedKeeping: string;
  InternationalDeliveryType: string;
  SeatsAmount: string;
  CardMaskedNumber: string;
  ExpressWaybillPaymentStatus: string;
  ExpressWaybillAmountToPay: string;
  PhoneSender: string;
  TrackingUpdateDate: string;
  WarehouseSender: string;
  DateReturnCargo: string;
  DateMoving: string;
  DateFirstDayStorage: string;
  RefCityRecipient: string;
  RefCitySender: string;
  RefSettlementRecipient: string;
  RefSettlementSender: string;
  SenderAddress: string;
  SenderFullNameEW: string;
  AnnouncedPrice: string;
  AdditionalInformationEW: string;
  ActualDeliveryDate: string;
  PostomatV3CellReservationNumber: string;
  OwnerDocumentNumber: string;
  LastAmountReceivedCommissionGM: string;
  DeliveryTimeframe: string;
  CreatedOnTheBasis: string;
  UndeliveryReasonsDate: string;
  RecipientWarehouseTypeRef: string;
  WarehouseRecipientRef: string;
  CategoryOfWarehouse: string;
  WarehouseRecipientAddress: string;
  WarehouseSenderInternetAddressRef: string;
  WarehouseSenderAddress: string;
  AviaDelivery: string;
  BarcodeRedBox: string;
  CargoReturnRefusal: string;
  DaysStorageCargo: string;
  Packaging: string[] | null;
  PartialReturnGoods: any[] | null;
  SecurePayment: string;
  PossibilityChangeCash2Card: boolean;
  PossibilityChangeDeliveryIntervals: boolean;
  PossibilityTermExtensio: boolean;
  StorageAmount: string;
  StoragePrice: string;
  FreeShipping: string;
  LoyaltyCardRecipient: string;
}

type TrackResponse = {
  success: boolean;
  data: NovaPoshtaTrackingDocument[];
  errors: string[];
  warnings: any[];
  info: any[];
  messageCodes: string[];
  errorCodes: string[];
  warningCodes: string[];
  infoCodes: string[];
};

class TrackController {
  async track({ track_id, phone }: TrackParams) {
    try {
      const payload = {
        ...template_payload,
        methodProperties: {
          Documents: [
            {
              DocumentNumber: track_id,
              Phone: phone,
            },
          ],
        },
      };

      logger.info(
        `Is about to track the parcel ${payload.methodProperties.Documents[0].DocumentNumber}`
      );

      const response = await axios.post<TrackResponse>(
        `${process.env.NP_API_URL}`,
        payload
      );

      const data = response.data;

      if (data.data[0].StatusCode === "3") {
        logger.info(`Номер накладної не знайдено: ${track_id}`);
        return {
          success: false,
          messageCodes: ["Номер накладної не знайдено"],
        };
      }

      logger.info(
        `Received an info about the parcel: ${JSON.stringify(response.data)}`
      );

      return response.data;
    } catch (err) {
      logger.error(`Failed retrieving parcel data: ${JSON.stringify(err)}`);

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

const template_payload = {
  apiKey: process.env.NP_APP_KEY,
  modelName: "TrackingDocument",
  calledMethod: "getStatusDocuments",
  methodProperties: {
    Documents: [
      {
        DocumentNumber: "",
        Phone: "",
      },
    ],
  },
};

export default new TrackController();
