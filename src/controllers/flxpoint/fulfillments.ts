import axios from "axios";
import { sendFlxRequest } from "./requester";

export const cancelFulfillmentRequest = async (fulfillmentId: string) => {
    try{
        const flxUrlSpecific = `fulfillment-requests/${fulfillmentId}/cancel`
        console.log({flxUrlSpecific})
        const flxResp = await sendFlxRequest(flxUrlSpecific, 'PATCH');  
        if(flxResp.status===200) return true
        console.log('did not work')
        return false;
    }
    catch(err: any){
        console.log({err})
        return false
    }
}


export const processFulfillmentRequest = async (fulfillmentId: number) => {
    try{
        const flxUrlSpecific = `fulfillment-requests/${fulfillmentId}/processed`

        const flxData = await sendFlxRequest(flxUrlSpecific, 'PATCH');  
        if(flxData.status===200) {
            console.log({data: flxData.data})
            return true
        }
        return false;
    }
    catch(err: any){
        console.log({err})
        return false
    }
}


// 4585594  

// export const runFullProcess = async () => {
//     const options = {
//         method: 'PATCH',
//         url: 'https://api.flxpoint.com/fulfillment-requests/4585594/processed',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-API-TOKEN': 'CQFDuHUEqH42NnYIba2WKpYaMAlcguYJyUYnaz4ATA8eEVJgdqK62xAAN0xLNWazZUd4Yhd3VNMp2JLA8lSPOZ28hjDiOXuWYGiU'
//         }
//       };
      
//       try {
//         const { data } = await axios.request(options);
//         console.log({data});
//       } 
//       catch (error: any) {
//         console.error(error);
//       }
// }
