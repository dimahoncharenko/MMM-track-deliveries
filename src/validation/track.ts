import z from "zod";

export const trackValidation = z.object({
  phone: z.string().default(`${process.env.DEFAULT_TRACK_PHONE}`),
  track_id: z.string(),
});

export type TrackValidationType = z.infer<typeof trackValidation>;
