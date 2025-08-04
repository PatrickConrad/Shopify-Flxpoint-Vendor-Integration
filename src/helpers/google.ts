

import {google} from 'googleapis';
import { wait } from './wait';


type RowType = {
    values: {
        userEnteredValue: {
            stringValue: string
        }
    }[]
}

export const convertColumnToA1: (ind: number, finStr?: string) => string = (ind: number, finStr?: string) => {
    const alp = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H','I','J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    if(ind<alp.length){
        return `${alp[ind]}${finStr??''}`
    }
    else{
        const rounds = Math.floor(ind/alp.length);
        const leftOver = ind-(rounds*alp.length);
        return convertColumnToA1(rounds-1, `${alp[leftOver]}${finStr??''}`);
    }
}


const auth = new google.auth.GoogleAuth({
    keyFilename: "./src/config/google-key.json",
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/documents']
})

export const googleSheets = async() =>{
    const sheets = google.sheets({version: 'v4', auth})
    return sheets
}

export const getSpreadsheetData = async (spreadsheetId: string) => {
    const gs = await googleSheets();
    const infoObjectFromSheet = await gs.spreadsheets.get({spreadsheetId, includeGridData: true})
    const sheetInfo: {name: string, id: number, sheetData: string[][]}[] = [];
    if(infoObjectFromSheet.data.sheets!=null){
        infoObjectFromSheet.data.sheets.forEach(el => {


            const sheetData: string[][] = [];
            const rowData = el.data!=null&&el.data[0].rowData!=null?el.data[0].rowData:[];
            let maxCols = 0;
            let headerLength = -1;

            for(let rd=0;rd<rowData?.length;rd++){
                const finRow: string[] = []
                const values = rowData[rd]['values'];
                if(values!=null){
                    if(values.length>maxCols){
                        maxCols  = values.length;
                    }
                    const tempValData = values.map(v=>v['formattedValue'])
                    // console.log({tempValData})
                    headerLength = tempValData.length
                }
            }

            for(let rd=0;rd<rowData?.length;rd++){
                const finRow: string[] = []
                const values = rowData[rd]['values'];
                if(values!=null){
                    if(values.length>maxCols){
                        maxCols  = values.length;
                    }
                    const tempValData = values.map(v=>v['formattedValue'])
                    const setRowMin: (row: any[], min: number) => any[] = (row: any[], min: number) => {
                        if(row.length<min){
                            return setRowMin([...row, ''], min)
                        }
                        return row
                    }


                    const valData = setRowMin([...tempValData], headerLength)
                    for(let vd=0;vd<valData.length;vd++){
                        const curData = valData[vd]
                        if(curData!=null){
                            const enterData = curData??'';
                            finRow.push(enterData);
                        }
                        else{
                            finRow.push('')
                        }
                        
                    }
                   
                }
                // console.log({finRow})
                sheetData.push(finRow);
            }
            // console.log({sheetData})
            if(el.properties!=null&&el.properties.title!=null&&el.properties.sheetId!=null){
                sheetInfo.push({name: el.properties.title, id: el.properties.sheetId, sheetData})
            }
        });
    }
    return sheetInfo;
}

export const addSheet = async (spreadsheetId: string, values: string[][], optInfo?: {title?: string, sheetId?: number}) => {
    const gs = await googleSheets();
    console.log({spreadsheetId})
    const formattedValues: RowType[] = [];
    for(let val=0;val<values.length;val++){
        const row = values[val]
        const newVals = row.map(r=>{
            return {
                    userEnteredValue: {
                        stringValue: `${r}`
                    }
            }
        })
        formattedValues.push({values: [...newVals]})
    }
    const infoObjectFromSheet = await gs.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title: optInfo==null||optInfo.title==null?'default':optInfo.title,
                            sheetId: optInfo==null||optInfo.sheetId==null?111111:optInfo.sheetId
                        }
                    }
                },
                {
                    appendCells: {
                      rows: [
                        ...formattedValues
                      ],
                      fields: "userEnteredValue",
                      sheetId: optInfo==null||optInfo?.sheetId==null?111111:optInfo.sheetId
                    }
                  }
            ]
        }
    })
    console.log({infoObjectFromSheet})
    return;
}

export const deleteSheet = async (spreadsheetId: string, sheetId: number) => {
    const gs = await googleSheets();
   
    const infoObjectFromSheet = await gs.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteSheet: {
                        sheetId
                    }
                }
            ]
        }
    })
    console.log({infoObjectFromSheet})
    return;
}


export const addRow = async (spreadsheetId: string, sheetName: string, values: string[][], row: number) => {
    const gs = await googleSheets();
    const startRange = convertColumnToA1(0, `${row}`);
    const endRange = convertColumnToA1(values.length+1, `${row}`);
    const range = `${sheetName}!${startRange}:${endRange}`
    console.log({range})
    await gs.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { 'values': values}
    })
    return;
}

export const deleteRow = async (spreadsheetId: string, sheetId: number, row: number) => {
    const gs = await googleSheets();
    await gs.spreadsheets.batchUpdate({
        spreadsheetId, 
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId,
                            dimension: "ROWS",
                            startIndex: row,
                            endIndex: row+1
                        }
                    }
                }
            ]
        }
    })
    return;
}
