import z from "zod";

export const trackingValidation = z.object({
  tracking_docs: z.array(z.object({
    phone: z.string().default(`${process.env.DEFAULT_TRACKING_PHONE}`),
    tracking_id: z.string(),
  }))
});

export type TrackingValidationType = z.infer<typeof trackingValidation>;
