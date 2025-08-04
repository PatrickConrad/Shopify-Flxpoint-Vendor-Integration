import dotenv from 'dotenv';
import { addRow, addSheet, deleteRow, deleteSheet, getSpreadsheetData } from "../helpers/google";
import { wait } from "../helpers/wait";
import { getFlxOrder } from './flxpoint/order';
import { cancelFulfillmentRequest } from './flxpoint/fulfillments';
dotenv.config();

const orderSpreadsheetId = process.env.GOOGLE_ORDER_CANCEL_ID as string;

export const cancelOrders = async () =>{
    try{
        const allInfo = await getSpreadsheetData(orderSpreadsheetId);
        const cancelSheetInfo = allInfo.find(ai=>ai.name==='Cancels');
        const cancelData = cancelSheetInfo?.sheetData??[]
        const allCancels:string[][] = []

        const loopCancels = async (rowNum: number) => {
            if(rowNum<cancelData.length){
                const curInfo = await getSpreadsheetData(orderSpreadsheetId);
                const curCancelSheetInfo = curInfo.find(ai=>ai.name==='Cancels');
                const curCancelData = curCancelSheetInfo?.sheetData??[]
                for(let fs=1;fs<curCancelData.length;fs++){
                    const orderId = curCancelData[fs][2];
                    console.log({orderId})
                    const curCancelDate = curCancelData[fs][4]
                    if(curCancelSheetInfo!=null&&orderId!=null&&orderId!==''){
                        allCancels.push([curCancelData[fs][0], curCancelData[fs][1], curCancelData[fs][2], curCancelData[fs][3]]);
                        await deleteRow(orderSpreadsheetId, curCancelSheetInfo.id, fs) 
                        break;
                    }
                }
                await loopCancels(rowNum+1)
            }
        }
        await loopCancels(0);
        
        const afterDeleteInfo = await getSpreadsheetData(orderSpreadsheetId);
        const afterCancelSheetInfo = afterDeleteInfo.find(ai=>ai.name==='Done');  
        const afterCancelData = afterCancelSheetInfo?.sheetData??[] 
        console.log({allCancels})
        for(let fs=0;fs<allCancels.length;fs++){ 
            const curOrder = allCancels[fs][2];
            console.log({curOrder});
            const orderFullNumbers = await getFlxOrder(curOrder);
            console.log({orderFullNumbers});
            if(orderFullNumbers!=null){
                for(let ofn=0;ofn<orderFullNumbers.length;ofn++){
                    //
                    const cancelStatus = await cancelFulfillmentRequest(orderFullNumbers[ofn]);
                    console.log({cancelStatus});
                }
            }
            await addRow(orderSpreadsheetId, 'Done', [allCancels[fs]], afterCancelData.length+(fs+1))
        }
    } 
    catch(err: any){
      console.log({err})
      return
  
    }
} 