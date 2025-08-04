
import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import appRouter from './router'
import {corsSetup} from './config/cors';
import router from './router';
import { fixPhenomNoParentImages, phenomAddCostMsrp } from './controllers/phenom';
// import { graphQuery, sendRestReq } from './controllers/shopify-req';
// import { over100, over100Product } from './data';
// import { cancelFulfillmentRequest, processFulfillmentRequest } from "./controllers/flxpoint/fulfillments";
// import { cancelFlxOrder, getFlxOrder } from "./controllers/flxpoint/order";
// import { cancelOrders } from "./controllers/orders";
// import { cancelShopifyOrder, getShopifyOrdersByName, updateShopifyOrderNote } from "./controllers/shopify/orders";


dotenv.config();

const app: Express = express();

if(process.env.NODE_ENV === 'development') app.enable('trust proxy');

app.use((req: Request, res: Response, next: NextFunction) =>{
    corsSetup(req, res, next);
}); 

app.use((req: Request, res: Response, next: NextFunction)=>{
    console.log("IP",  req.ip, req.socket.remoteAddress)
    next()
})
phenomAddCostMsrp()

app.use(express.json()); 

app.use(express.urlencoded({extended: true}));


app.use('/api/v1/', router)

const port = process.env.PORT||8052;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



