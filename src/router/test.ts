import express from 'express';
import { checkBody } from '../middleware/validation';
import { getInventoryData, getParentImageData, getProductData, getProducts, getVariants } from '../controllers/test';

const router = express.Router();

router.get('/get-product-data', checkBody, getProductData); 

router.get('/get-set-variants-data', checkBody, getVariants); 

router.get('/get-products', checkBody, getProducts);

router.get('/parent-images', checkBody, getParentImageData);

router.get('/inventory', checkBody, getInventoryData);


export default router    