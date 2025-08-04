import express from 'express';
import { augustaGetShippingCost } from '../controllers/augusta';
import { checkBody } from '../middleware/validation';
import { getInventoryData, getParentImageData, getPhenomProductData } from '../controllers/phenom';
const router = express.Router();

router.get('/get-product-data', checkBody, getPhenomProductData); 

router.get('/parent-images', checkBody, getParentImageData);

router.get('/inventory', checkBody, getInventoryData);


export default router    