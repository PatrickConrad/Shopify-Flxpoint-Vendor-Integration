import axios from "axios";
import { sendFlxRequest } from "./requester";

export const getFlxOrder = async (orderId: string) => {
    try{
        const flxUrlSpecific = `orders/${orderId}`

        const flxResp = await sendFlxRequest(flxUrlSpecific);  
   		 const flxData: any = flxResp.data as unknown[];
         if(flxData==null){
            return null
         }
         const fullFills = flxData['fulfillmentRequests'].map((fullReq: any)=> { return {fulNum: fullReq['fulfillmentRequestNumber'], fulId: fullReq['id']}})
         return fullFills
    }
    catch(err: any){
        console.log({err})
        return null
    }
}


export const cancelFlxOrder = async (orderId: string, reason?: string) => {
    try{
        const urlSafeNote = encodeURIComponent('Canceled Via API')
        const setExtraNote = (note: string) => {
            return encodeURIComponent(`--- ${note}`)
        }
        const flxUrlSpecific = `orders/${orderId}/status?status=Canceled&updateNote=${urlSafeNote}${reason!=null?setExtraNote(reason):''}`
        const flxResp = await sendFlxRequest(flxUrlSpecific, "PATCH");  
        const flxRespData = flxResp.data;
        if(flxRespData==null||flxResp.status!==200){
            return null
        }
        console.log({flxRespData})
    }
    catch(err: any){
        console.log({err})
        return null
    }
}