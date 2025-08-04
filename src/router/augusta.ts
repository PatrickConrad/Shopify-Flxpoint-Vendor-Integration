import express from 'express';
import { augustaGetShippingCost } from '../controllers/augusta';
const router = express.Router();

router.get('/shipping-cost', augustaGetShippingCost); 

export default router;