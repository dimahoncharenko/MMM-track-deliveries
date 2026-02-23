import z from "zod";

export const trackingValidation = z.object({
  trackingDocs: z.array(
    z.object({
      phone: z.string().default(`${process.env.DEFAULT_TRACKING_PHONE}`),
      trackingId: z.string(),
    })
  ),
});

export type TrackingValidationType = z.infer<typeof trackingValidation>;
