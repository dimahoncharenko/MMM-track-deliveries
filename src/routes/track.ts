import { Router } from "express";

import { trackValidation } from "../validation/track";
import TrackController from "../controllers/track";

const router = Router();

router.post("/", async (req, res) => {
  const data = trackValidation.parse(req.body);

  const response = await TrackController.track(data);

  return res.json(response);
});

export default router;
