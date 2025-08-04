import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const augustaGetShippingCost = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const augustaUrl = 'https://stg8.augustasportswear.com/wcs/resources/store/10251/asgShippingCost'
        // const augustaUrl = 'https://service.augustasportswear.com/wcs/resources/store/10251/asgShippingCost'

        const user = { 
            username: process.env.AUGUSTA_USERNAME as string,
            password : process.env.AUGUSTA_PASSWORD as string,
        }
        console.log({user}) 
        const body = {
            logonId : user.username,
            password : user.password,
            shipTo: "League Outfitters" ,
            shipMode: "901",
            shipAddress1: "8220 Stayton Drive",
            shipAddress2: "Suite 3",
            shipCity: "Jessup",
            shipState: "MD",
            shipZip: "20794",
            shipCountry: "US",
            telePhone: "3015759400",
            residence: "N",
            attention: "Patrick Connrad",
            asgOrderSubmitProducts : [{sku: "221335.408.XS", quantity: "1"}]
        }

        const resp = await axios.post(augustaUrl, {...body});
        console.log(resp)
        return res.status(200).send(resp.data);
    }
    catch(err: any){
        console.log({err})
        if(err['response']!=null){
            const errResp = err['response']??err;
            const errData = errResp['data']??errResp;
            console.log({resp: errData})
            return res.status(500).send(errData)
        }
        if(err['cause']!=null){
            const errResp = err['cause'];
            console.log({errResp});
            // const errData = errResp['data']??errResp;
            // console.log({resp: errData})
            return res.status(500).send(errResp)
        }
        return res.status(500).send("Internal Server Error")
    }

}