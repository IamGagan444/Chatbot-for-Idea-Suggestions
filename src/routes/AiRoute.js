import { Router } from "express";
import { ideaGenerator, suggestionGenerator } from "../controller/Aicontroller.js";

const router=Router();

router.route("/generate-ideas").post(ideaGenerator)
router.route("/generate-suggestions").post(suggestionGenerator)

export default router