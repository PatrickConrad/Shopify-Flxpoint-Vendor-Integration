import express from 'express';
import augustaRouter from './augusta';
import phenomRouter from './phenom';
import testRouter from './test';


const router = express.Router();

router.use('/augusta', augustaRouter); 
router.use('/phenom', phenomRouter);
router.use('/test', testRouter);


export default router    