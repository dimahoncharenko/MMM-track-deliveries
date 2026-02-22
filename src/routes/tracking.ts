import { Router } from "express";

import { trackingValidation } from "../validation/tracking";
import TrackController from "../controllers/tracking";

const router = Router();

router.post("/", async (req, res) => {
  const data = trackingValidation.parse(req.body);

  const trackingRes = await TrackController.trackList(data);
  return res.json(trackingRes);
});

export default router;
