import { appendFile, appendFileSync, createReadStream, readFileSync, writeFileSync } from "fs";
// import xlsx from 'node-xlsx';
// import XLSX from 'xlsx';
import { wait } from "./wait";
// const gc = require('expose-gc/function')


const setFinder = (currentSheet: string[][])=>{
    const findCol = (headerName: string) => {
        // console.log(currentSheet[0])
        const headerPosition = currentSheet[0].map(heads=>{ 

            return heads.trim().toLowerCase()
        }).indexOf(headerName.toLowerCase());
    //    console.log({headerPosition});
        return headerPosition
    }
    return findCol
}
const setGetter = (currentSheet: string[][], finder: (headerName: string)=>number)=>{
    const getValue = (row: number, col: string) => {
        const colNum = finder(col);
        if(colNum==null){
            // console.log('NO COLUMN FOUND')
            return ''
        }
        // console.log(col, colNum, currentSheet[row][colNum])
        const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
        return val;
    }
    return getValue
}

// export const xlsxFileToArray = async (path: string, sheet: number|string, headerRow?: number)=> {
//     try{
//         const data = readFileSync(path);
//         const file = await xlsx.parse(data);
//         let currentSheet: string[][] = []
//         if(typeof(sheet)==='string'){
//             const sheetFinder = file.find(f=>`${f.name}`.toLowerCase().includes(sheet.toLowerCase()));
//             if(sheetFinder!=null){
//                 currentSheet = sheetFinder.data
//             }
//         }
//         else{
//             currentSheet= file[sheet].data;

//         }
//         const headers = currentSheet[headerRow!=null?headerRow:0];
//         console.log({headers})

//         const setFinder = (headerName: string)=>{
//             // console.log(currentSheet[0])
//             const headerPosition = currentSheet[headerRow!=null?headerRow:0].map(heads=>{
//                 return heads.trim().toLowerCase()
//             }).indexOf(headerName.toLowerCase());
//             // console.log({headerPosition});
//             return headerPosition
            
//         }
//         const getVal = (row: number, col: string) => {
//             const colNum = setFinder(col);
//             if(colNum==null||colNum===-1){
//                 // console.log('NO COLUMN FOUND')
//                 return ''
//             }
//             // console.log(col, colNum, currentSheet[row][colNum])
//             const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
//             return val;
//         }
        
//         const changeColVal = (row: string[], col: string, newVal: string)=>{
//                 const colNum = setFinder(col);
//                 if(colNum==null||colNum===-1){
//                     console.log('NO COLUMN FOUND')
//                     return row
//                 }
//                 else{
//                     const beforeVal = [...row].splice(0, colNum);
//                     const afterVal = [...row].splice(colNum+1);
//                     const newRow = [...beforeVal, newVal,...afterVal]
//                     return newRow;
//                 }
                
//         }
//         // console.log('CURRENT Sheet', currentSheet)
//         return {currentSheet, getVal, changeColVal}
//     }
//     catch(err: any){
//         console.log({err})

//     }
// }

export const stringToArray = (text: string)=> {
    // console.log("text: ", text)
    const currentSheet: string[][] = [];

  
    const rows = text.split('\r\n')
    // console.log({rows})
    let last = false;
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        // console.log('noDBLQs', noDbleQuotes)
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        // console.log("new ROWWWW", newRow);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        // const id = r ===0?'id':`${r}`;
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        // currentSheet.push(fixUndefined);
        currentSheet.push(fixUndefined)
        // console.log(fixedRow)
    } 


    const setFinder = (headerName: string)=>{
        // console.log(currentSheet[0])
        const headerPosition = currentSheet[0].map(heads=>{
            return heads.trim().toLowerCase()
        }).indexOf(headerName.toLowerCase());
        // console.log({headerPosition});
        return headerPosition
       
    }
    const getVal = (row: number, col: string) => {
        const colNum = setFinder(col);
        if(colNum==null||colNum===-1){
            // console.log('NO COLUMN FOUND')
            return ''
        }
        // console.log(col, colNum, currentSheet[row][colNum])
        const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
        return val;
    }
    
    const changeColVal = (row: string[], col: string, newVal: string)=>{
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                console.log('NO COLUMN FOUND')
                return row
            }
            else{
                const beforeVal = [...row].splice(0, colNum);
                const afterVal = [...row].splice(colNum+1);
                const newRow = [...beforeVal, newVal,...afterVal]
                return newRow;
            }
          
    }
    // console.log('CURRENT Sheet', currentSheet)
    return {currentSheet, getVal, changeColVal}
}

export const csvFileToArray = (path: string, headerRow?: number)=> {
    const text = readFileSync(path, 'utf-8');
    const currentSheet: string[][] = [];
    const rows = text.split('\r\n')
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        // console.log('noDBLQs', noDbleQuotes)
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        // console.log("new ROWWWW", newRow);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        // const id = r ===0?'id':`${r}`;
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        // currentSheet.push(fixUndefined);
        currentSheet.push(fixUndefined)
        // console.log(fixedRow)
    } 
    const setFinder = (headerName: string)=>{
        // console.log(currentSheet[0])
        const headerPosition = currentSheet[headerRow!=null?headerRow:0].map(heads=>{
            return heads.trim().toLowerCase()
        }).indexOf(headerName.toLowerCase());
        // console.log({headerPosition});
        return headerPosition
        
    }
    const getVal = (row: number, col: string) => {
        const colNum = setFinder(col);
        if(colNum==null||colNum===-1){
            // console.log('NO COLUMN FOUND')
            return ''
        }
        // console.log(col, colNum, currentSheet[row][colNum])
        const val = currentSheet[row][colNum]==null?'':currentSheet[row][colNum]
        return val;
    }
    
    const changeColVal = (row: string[], col: string, newVal: string)=>{
            const colNum = setFinder(col);
            if(colNum==null||colNum===-1){
                console.log('NO COLUMN FOUND')
                return row
            }
            else{
                const beforeVal = [...row].splice(0, colNum);
                const afterVal = [...row].splice(colNum+1);
                const newRow = [...beforeVal, newVal,...afterVal]
                return newRow;
            }
            
    }
    // console.log('CURRENT Sheet', currentSheet)
    return {currentSheet, getVal, changeColVal}
}

export const arrayToCsv = (data: string[][], path?: string) => {
    const fileString = data.map(row =>{
        // console.log({row})
        return row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    }).join('\r\n');

    if(path!=null){
        writeFileSync(path, fileString, 'utf-8');
        return 'saved'
    }

    return fileString

}

const csvFileAsArray = (path: string) =>{
    const text = readFileSync(path, 'utf-8');
    const currentSheet: string[][] = [];
    const rows = text.split('\r\n')
    for(let r = 0; r<rows.length; r++){
        const noDbleQuotes = rows[r].replace(/""/g, '-|-');
        // console.log('noDBLQs', noDbleQuotes)
        const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
        const newRow = noDbleQuotes.split(regX);
        // console.log("new ROWWWW", newRow);
        const fixedRow = newRow.map(rl=>{
            if(rl==null){
                return ""
            }
            return rl.replace(/\-\|\-/g, '"')
        });
        // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
        const fixedRow3 = fixedRow.map(rl=>{
            let string = rl;
            if(string.startsWith('"')){
                string = string.substring(1)
            }
            let endString = string;
            if(endString.endsWith('"')){
                endString = endString.substring(0, endString.length-1);
            }
            return endString
        })
        // const id = r ===0?'id':`${r}`;
        const dataRow = [...fixedRow3]
        if(dataRow[0]===""){
            dataRow.shift();
        }
        if(dataRow[dataRow.length-1]===""){
            dataRow.pop();
        }
        const noCommaCells = dataRow.filter(dr=>{
            return dr.trim()!==','
        })
        const fixUndefined = noCommaCells.map(dr=>{
            if(dr!=null) return dr
            return ""
        })
        // currentSheet.push(fixUndefined);
        currentSheet.push(fixUndefined)
        // console.log(fixedRow)
    } 
    return currentSheet
}

export const rowToCsvRowString = (row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    return `${dataString}`
}

export const addCsvData = (path: string, dataString: string) => {
    appendFileSync(path, dataString);
}

export const addHeaderRow = (path: string, row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    const rowString =  `${dataString}`;
    writeFileSync(path, rowString, 'utf-8');
}

export const addRow = (path: string, row: string[]) => {
    const dataString = row
        .map(v=>`${v}`)
        .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
        .map(v=>`"${v}"`)
        .join(',')
    const rowString =  `\r\n${dataString}`;
    appendFileSync(path, rowString);
}


export const addChunk = (path: string, rows: string[][]) => {
    const chunkString = rows.map(row=>{
        const dataString = row
            .map(v=>`${v}`)
            .map(v=> v.replace(/\|\-\|/g, ',').replace(/\"/g, '""'))
            .map(v=>`"${v}"`)
            .join(',')
        return `\r\n${dataString}`;
    }).join('')
    appendFileSync(path, chunkString);
}

export const downloadFile = (content: string, filename: string, contentType: string) => {
    let blob = new Blob([content], {type: contentType});
    let url = URL.createObjectURL(blob);
    // let pom = document.createElement('a');
    // pom.href = url;
    // pom.setAttribute('download', filename);
    // pom.click()
}

export const genoratorTest = async(filePath: string, checkRow: (rowData: string[], headers: string[])=>Promise<void>|void) => {
    async function* loopCsv(rowFunction: (rowData: string[], headers: string[])=>Promise<void>|void): AsyncGenerator<any, void, number> {
        const fileData = csvFileAsArray(filePath);
        const headers = fileData[0];
        while(true){
            const curRow = yield;
            if(curRow!=null) await rowFunction(fileData[curRow], headers)
        }
    }

    const looperFunc = await loopCsv(checkRow)

 
    return looperFunc
  
}


export const genoratorTest2 = async(checkRow?: (rowData: string[], headers: string[])=>Promise<void>|void) => {
    if(gc) gc();
    const startMem = process.memoryUsage()
    console.log('start run', {curMemTot: startMem.heapTotal-startMem.heapUsed});
    const fileData = csvFileAsArray('./tmp/new-data.csv')
    const afterReadMem = process.memoryUsage()
    console.log('after read', {curMemTot: afterReadMem.heapTotal-afterReadMem.heapUsed});
    const headers = fileData[0];
    for(let row=1;row<fileData.length;row++){
        if(checkRow!=null) await checkRow(fileData[row], headers);
        if(gc) gc();
        const loopMem = process.memoryUsage()
        console.log('loop run', {curMemTot: loopMem.heapTotal-loopMem.heapUsed});
    }
}

//Generators

export const generatorLoop = async(filePath: string, checkRow: (rowData: string[], headers: string[])=>Promise<void>|void) => {
    async function* loopCsv(rowFunction: (rowData: string[], headers: string[])=>Promise<void>|void): AsyncGenerator<any, void, number> {
        const fileData = csvFileAsArray(filePath);
        const headers = fileData[0];
        const setRow = async (rowNum?: number) => {
            if(rowNum!=null) {
                await rowFunction(fileData[rowNum], headers)
            }
            else{
                console.log('null row')
            }
        }
        while(true){
            await setRow(yield)
        }
    }

    const looperFunc = await loopCsv(checkRow)
    await looperFunc.next();
 
    return looperFunc
}

export const generatorReturnLoop = async(filePath: string) => {
    let curRow: string[] = [];
    const getCurRow = () => curRow;
    async function* loopCsv(): AsyncGenerator<any, void, number> {
        const fileData = csvFileAsArray(filePath);
        const headers = fileData[0];
        const setRow = async (rowNum?: number) => {
            if(rowNum!=null) {
                curRow = fileData[rowNum];
            }
            else{
                console.log('null row')
            }
        }
        while(true){
            await setRow(yield)
        }
    }

    const looperFunc = await loopCsv()
    await looperFunc.next();
 
    return {getCurRow, looperFunc}
}

export type GenSearchSetup<T> = {curVal: ()=>T|undefined|null, generator: AsyncGenerator<T, void, {key: string, value: string|RegExp}>}

export const arrayMapAndFindGenerator: (filePath: string)=>Promise<GenSearchSetup<any>> = async (filePath: string)=> {
     const csvFileData = csvFileAsArray(filePath);
     const headers = csvFileData[0].map(header=>`${header}`.toLowerCase().trim());

    let returnValue: string[]|undefined = [];
    const checkCurrentValue = ()=>returnValue;
    const runSearch = (info: {key: string, value: string|RegExp}|undefined) => {
        if(info!=null){
            const curVal = info?.value;
            if(typeof(curVal)==='string'){
                returnValue = csvFileData.find(cfaa=>cfaa[headers.indexOf(info.key.toLowerCase().trim())]===curVal)
            }
            else{
                returnValue = csvFileData.find(cfaa=>curVal.test(cfaa[headers.indexOf(info.key.toLowerCase().trim())]))
            }
        }
        else{
            console.log('null')
        }
    }

    async function* findCsvData(): AsyncGenerator<any, void, {key: string, value: string|RegExp}> {
        while(true){
            runSearch(yield)
        }
    }


    const generator = findCsvData();
    generator.next();

    return {curVal: checkCurrentValue, generator};


}

type GenIncludesSetup = {curVal: ()=>boolean|null, generator: AsyncGenerator<any, void, string>}

export const arrayIncludesStringFindGenerator: (dataArray: string[], standardized?: boolean)=>Promise<GenIncludesSetup> = async (dataArray: string[], standardized?: boolean)=> {
    let returnValue: boolean | null = null;
    const checkCurrentValue = ()=>returnValue;
    const runSearch = (matchStr?: string) => {
        if(matchStr!=null){
            if(standardized) returnValue = dataArray.find(da=>da.toLowerCase().trim()===matchStr.toLowerCase().trim())!=null?true:false
            else{
                returnValue = dataArray.includes(matchStr)
            }
        }
        else{
            console.log('null')
        }
    }
   
    async function* findCsvData(): AsyncGenerator<any, void, string> {
        while(true){
            runSearch(yield);
        }
    }

    const generator = findCsvData();
    generator.next();

    return {curVal: checkCurrentValue, generator};

}

type GenIncludesNumberSetup<T> = {curVal: ()=>T|null|'done', generator: AsyncGenerator<T, void, number>}

// export const getNextRowGenerator: <T>(dataArray: string[], rowFunc: (info: {dataRow: string[], headers: string[]})=>Promise<void>|void)=>Promise<GenIncludesNumberSetup<T>> = async <T>(dataArray: T[], rowFunc: (info: {dataRow: string[], headers: string[]})=>Promise<void>|void)=> {
//     const headers = [...dataArray[0]]    
//     const runSearch = (rowNum?: number) => {
//         if(rowNum!=null) {
//             if(rowNum>=dataArray.length) returnValue = 'done'
//             else{
//                 returnValue = dataArray[rowNum]
//             }
//         }
//     }
   
//     async function* findCsvData(): AsyncGenerator<any, void, number> {
//         while(true){
//             runSearch(yield);
//         }
//     }

//     const generator = findCsvData();
//     generator.next();

//     return {curVal: checkCurrentValue, generator};

// }

export const objectMapAndFindGenerator: <T>(dataArray: T[], standardized?: boolean)=>Promise<GenSearchSetup<T>> = async <T>(dataArray: T[], standardized?: boolean)=> {
    let returnValue: T|undefined|null = null;


    const checkCurrentValue = ()=>returnValue;
    const runSearch = (info: {key: string, value: string|RegExp}|undefined) => {
        if(info!=null){
            const curVal = info?.value;
            if(typeof(curVal)==='string'){
                if(standardized){
                    returnValue = dataArray.find((da: T)=>`${da[info.key as keyof T]}`.toLowerCase().trim()===`${curVal}`.toLowerCase().trim())
                }
                else{
                    returnValue = dataArray.find((da: T)=>da[info.key as keyof T]===curVal)
                }
            }
            else{
                if(standardized){
                    returnValue = dataArray.find((da: T)=> curVal.test(`${da[info.key as keyof T]}`.toLowerCase().trim()))
                }
                else{
                    returnValue = dataArray.find((da: T)=>curVal.test(da[info.key as keyof T] as string))
                }
            }
        }
        else{
            console.log('null')
        }
    }
   
    async function* findCsvData(): AsyncGenerator<any, void, {key: string, value: string|RegExp}> {
        while(true){
            runSearch(yield);
        }
    }

    const generator = findCsvData();
    generator.next();

    return {curVal: checkCurrentValue, generator};

}

// export const testingFunc = async () => {
//     const testFile = csvFileToArray('./tmp/adidas-click/combine-final.csv');
//     const dataArray: {cost2: string, image1: string, setColor: string, colorSku: string, title: string, description: string, color: string, msrp: string, cost: string, sku: string, upc: string, size: string, msrp2: string, category: string, secondaryCats: string}[] = [];
//     for(let ivi=0;ivi<testFile.currentSheet.length;ivi++){
//         dataArray.push({
//             cost2: testFile.getVal(ivi, 'Cost2'),
//             image1: testFile.getVal(ivi, 'Image 1'),
//             setColor: testFile.getVal(ivi,'Set Color'),
//             colorSku: testFile.getVal(ivi, 'Color SKU'),
//             title: testFile.getVal(ivi, 'Title'),
//             description: testFile.getVal(ivi, 'Description'),
//             color: testFile.getVal(ivi, 'Color'),
//             msrp: testFile.getVal(ivi, 'MSRP'),
//             cost: testFile.getVal(ivi, 'Cost'),
//             sku: testFile.getVal(ivi, 'SKU'),
//             upc: testFile.getVal(ivi, 'UPC'),
//             size: testFile.getVal(ivi, 'Size'),
//             msrp2: testFile.getVal(ivi, 'MSRP2'),
//             category: testFile.getVal(ivi, 'Category'),
//             secondaryCats: testFile.getVal(ivi,'Secondary Cats')
//         })
//     }




//     const callMemCheck = (str: string)=> {
//         const beforeMem = process.memoryUsage()
//         console.log(str, {curMemTot: beforeMem.heapTotal-beforeMem.heapUsed})
//     }
   


//     //call mem check func
//     const finder = await testFullGen([...dataArray]);




//     if(gc)gc();


//     for(let ivi=0;ivi<testFile.currentSheet.length;ivi++){
//             const curUpc = testFile.getVal(ivi, 'UPC');


//         //testing generator
//         await finder.generator.next({key: 'upc', value: curUpc})


//         console.log(curUpc, finder.curVal())


//         callMemCheck('gen tester before clear')












//         // //testing regular


//         // const hasUpc = dataArray.find(da=>da.upc===curUpc);
//         // callMemCheck('array tester before clear')


//         // if(gc)gc();


//         // callMemCheck('array tester after clear')


//     }




// }

// type CheckType = 'standard'|'exact'
// type CheckData = {key: string, value: string|RegExp}
// type GeneratorCsvWorker<T> = {assignment: 'add-row'|'get-array'|'get-row', setData?: T,  checkData?: CheckData, checkType?: CheckType}
// export type GenMemArraySetup<T> = {curVal: ()=>T[]|T|undefined, generator: AsyncGenerator<T, void, GeneratorCsvWorker<T>>}
// export const memoryArrayGenerator:<T>(curDataArray: T[])=>Promise<GenMemArraySetup<T>> = async <T>(curDataArray: T[])=>{
//     let returnValue: T[]|T|undefined;
//     const checkCurrentValue = ()=> returnValue;

//     const dataArray = [...curDataArray];
//     const runFinder = (checkData: CheckData, checkType?: CheckType)=>{
//         const curVal = checkData.value;
//         if(curVal!=null){
//             if(typeof(curVal)==='string'){
//                 if(checkType!=null&&checkType==='standard'){
//                     // console.log('get -type', dataArray.find((da: T)=>`${da[checkData.key as keyof T]}`.toLowerCase().trim()===`${curVal}`.toLowerCase().trim()))
//                     return dataArray.find((da: T)=>`${da[checkData.key as keyof T]}`.toLowerCase().trim()===`${curVal}`.toLowerCase().trim())
//                 }
//                 else{
//                     // console.log('get -type', dataArray.find((da: T)=>da[checkData.key as keyof T]===curVal))
//                     return dataArray.find((da: T)=>da[checkData.key as keyof T]===curVal)
//                 }
//             }
//             else{
//                 if(checkType!=null&&checkType==='standard'){
//                     // console.log('get -type', dataArray.find((da: T)=> curVal.test(`${da[checkData.key as keyof T]}`.toLowerCase().trim())))
    
//                     return dataArray.find((da: T)=> curVal.test(`${da[checkData.key as keyof T]}`.toLowerCase().trim()))
//                 }
//                 else{
//                     // console.log('get -type', dataArray.find((da: T)=>curVal.test(da[checkData.key as keyof T] as string)))
//                     return dataArray.find((da: T)=>curVal.test(da[checkData.key as keyof T] as string))
//                 }
//             }
//         }
//         else{
//             return undefined
//         }
//     }
  


//     const multiPurposeGen = (info?: GeneratorCsvWorker<T> ) => {
//         if(info!=null){
//             const infoAssign = info.assignment;
//             const checkData = info.checkData;
//             const setData = info.setData;
//             const checkType = info.checkType;

//             if(infoAssign==='get-array'){
//                 returnValue = [...dataArray];
//             }
//             else if(infoAssign==='get-row'&&checkData!=null){
//                 returnValue = runFinder(checkData, checkType)
//             }
//             else if(infoAssign==='add-row'&&setData!=null){
//                 if(checkData!=null){
//                     const hasCheck = runFinder(checkData, checkType)
//                     // console.log({hasCheck})
//                     if(hasCheck==null){
//                         dataArray.push(setData)
//                         // console.log({dataArray})
//                     }
//                 }
//                 else{
//                     dataArray.push(setData)
//                 }
//             }
//             else{
//                 console.log('missing info', {info})
//             }
//         }
//         else{
//             console.log('null')
//         }
//     }
   
//     async function* createCsvData(): AsyncGenerator<any, void, GeneratorCsvWorker<T>> {
//         while(true){
//             multiPurposeGen(yield);
//         }
//     }

//     const generator = await createCsvData();
//     await generator.next();

//     return {curVal: checkCurrentValue, generator};

// }

// type GeneratorCsvSetterWorker = {assignment: 'add-row'|'get-array'|'get-row', setData?: string[][],  checkData?: CheckData, checkType?: CheckType}

// type GenReferenceArray = {curVal: ()=>string|number|undefined, generator: AsyncGenerator<string|number, void, number|string>}
// export const referenceArray: (dataArray: string[]|number[], standardize?: boolean)=>Promise<GenReferenceArray> = async (dataArray: string[]|number[], standardize?: boolean)=>{
//     let returnValue: string|number|undefined;
//     const curVal = () => returnValue;
//     const findRef = (refer?: string|number)=>{
//         if(refer!=null){
//             if(typeof(refer)==='string'&&standardize){
//                 returnValue = dataArray.find(da=>`${da}`.toLowerCase().trim()===`${refer}`.toLowerCase().trim())
//             }
//             else if(typeof(refer)==='string'&&(standardize==null||!standardize)){
//                 returnValue = dataArray.find(da=>da===refer)
//             }
//             else{
//                 returnValue = dataArray.find(da=>da===refer)
//             }
//         }
//         else{
//             console.log('null')
//         }
//     }
//     async function* findReference(): AsyncGenerator<any, void, number|string> {
//         while(true){
//             findRef(yield);
//         }
//     }

//     const generator = await findReference();
//     await generator.next();

//     return {curVal, generator};
// }

// type RefSetAssigner = {assignment: 'add-ref'|'get-ref', value: number|string, checkType?: 'standard'|'exact'}
// type GenReferenceSetArray = {curVal: ()=>string|undefined, generator: AsyncGenerator<string|number, void, RefSetAssigner>}

// export const referenceSetArray: (dataArray: string[]|number[])=>Promise<GenReferenceSetArray> = async (dataArray: string[]|number[])=>{
//     const setArray: string[] = [...dataArray.map(da=>`${da}`)]
//     let returnValue: string|undefined;
//     const curVal = () => returnValue;
//     const findRef = (refer?: RefSetAssigner)=>{
//         if(refer!=null){
//             const shouldCheck = refer.checkType;
//             const newVal = refer.value
//             if(refer.assignment==='add-ref'){
//                 if(shouldCheck!=null){
//                         if(shouldCheck==='standard'){
//                             const hasData = setArray.find(da=>`${da}`.toLowerCase().trim()===`${refer.value}`.toLowerCase().trim())
//                             if(hasData==null) {
//                                 // console.log({setArrayLength: setArray.length+1})
//                                 setArray.push(`${newVal}`)
//                             }
//                         }
//                         else{
//                             const hasData = setArray.find(da=>`${da}`===`${refer.value}`)
//                             if(hasData==null) {
//                                 // console.log({setArrayLength: setArray.length+1})
//                                 setArray.push(`${newVal}`)
//                             }
//                         }
//                 }
//                 else{
//                     // console.log({setArrayLength: setArray.length+1})
//                     setArray.push(`${newVal}`)
//                 }
//             }
//             else{
//                     if(shouldCheck==='standard'){
//                         returnValue = setArray.find(da=>`${da}`.toLowerCase().trim()===`${refer.value}`.toLowerCase().trim())
//                     }
//                     else{
//                         returnValue = setArray.find(da=>`${da}`===`${refer.value}`)

//                     }
//             }
//         }
//         else{
//             console.log('null')
//         }
//     }
//     async function* findReference(): AsyncGenerator<any, void, RefSetAssigner> {
//         while(true){
//             findRef(yield);
//         }
//     }

//     const generator = await findReference();
//     await generator.next();

//     return {curVal, generator};
// }

// type GenMemCsvSetup = {curVal: ()=>string[]|string[][]|undefined, generator: Generator<string[][], void, {assignment: 'get-array'|'get-row', value?: number}>}
// export const memoryCsvGenerator:(dataArray: string[][])=>GenMemCsvSetup = (dataArray: string[][])=>{
//     let returnValue: string[]|string[][]|undefined;
//     const checkCurrentValue = ()=>returnValue;



  
//     const multiPurposeGen = (info?: {assignment: 'get-array'|'get-row', value?: number} ) => {
//         if(info!=null){
//             if(info.assignment ==='get-array') returnValue = dataArray;
//             else{
//                 if(info.value==null) console.log('need row value');
//                 else{ returnValue = dataArray[info.value]}
//             }
//         }
//         else{
//             console.log('null')
//         }
//     }
//     function* createCsvData(): Generator<any, void,  {assignment: 'get-array'|'get-row', value?: number}> {
//         while(true){
//             multiPurposeGen(yield);
//         }
//     }

//     const generator = createCsvData();
//     generator.next();

//     return {curVal: checkCurrentValue, generator};

// }

// const splitCsvStrings = (row: string) => {
//     const noDbleQuotes = row.replace(/""/g, '-|-');
//     // console.log('noDBLQs', noDbleQuotes)
//     const regX = new RegExp('("[^"]+"|[^,]+)*', 'g');
//     const newRow = noDbleQuotes.split(regX);
//     // console.log("new ROWWWW", newRow);
//     const fixedRow = newRow.map(rl=>{
//         if(rl==null){
//             return ""
//         }
//         return rl.replace(/\-\|\-/g, '"')
//     });
//     // const fixedRow2 = fixedRow.map(rl=>rl.replace(/""/g, '"'));
//     const fixedRow3 = fixedRow.map(rl=>{
//         let string = rl;
//         if(string.startsWith('"')){
//             string = string.substring(1)
//         }
//         let endString = string;
//         if(endString.endsWith('"')){
//             endString = endString.substring(0, endString.length-1);
//         }
//         return endString
//     })
//     // const id = r ===0?'id':`${r}`;
//     const dataRow = [...fixedRow3]
//     if(dataRow[0]===""){
//         dataRow.shift();
//     }
//     if(dataRow[dataRow.length-1]===""){
//         dataRow.pop();
//     }
//     const noCommaCells = dataRow.filter(dr=>{
//         return dr.trim()!==','
//     })
//     const fixUndefined = noCommaCells.map(dr=>{
//         if(dr!=null) return dr
//         return ""
//     })
//     // currentSheet.push(fixUndefined);
//     return fixUndefined;
// }

// export const csvFileToArraySplit = async (path: string, headerRow?: number)=> {
//     let doneReading = false;
//     let headers: string[] = [];
//     const allSheets: GenMemCsvSetup[] = [];
//     let currentSheet: string[][] = [];
//     console.log({path})
//     // const curSheetCheck= () => {
//     //     console.log({headers})
//     //     allSheets.push(memoryCsvGenerator([[...headers], ...currentSheet]))
//     //     currentSheet = []
//     //     gc()
//     // }
//     let lastRow = '';
//     let chunkNum = 0;
//     createReadStream(path, 'utf-8')
//         .on('data', (chunk: string | Buffer<ArrayBufferLike>)=>{
//             const rows = typeof(chunk)==='string'?chunk.split('\r\n'):new TextDecoder('utf-8').decode(chunk).split('\r\n');
//             const finRow = rows[rows.length-1];
//             if(chunkNum>0){
//                 const nextRow = `${lastRow}${rows[0]}`
//                 if(nextRow.replace(/,/g,'').replace(/\s/g,'')!==''){
//                     const nextRowFixed = splitCsvStrings(nextRow)
//                     currentSheet.push(nextRowFixed)
//                     if(currentSheet.length===20000){
//                         console.log('over2000')
//                         allSheets.push(memoryCsvGenerator([[...headers], ...currentSheet]))
//                         currentSheet = []
//                         gc()
//                     }
                   
//                 }
//             }
//             let startRow = chunkNum>0?1:headerRow!=null?headerRow:0 
//             for(let r = startRow; r<rows.length-1; r++){               
//                 const finRowSplit = splitCsvStrings(rows[r]);
//                 if(r===startRow&&chunkNum===0) headers=finRowSplit;
//                 currentSheet.push(finRowSplit)
//                 if(currentSheet.length===20000){
//                     console.log('over2000')
//                     allSheets.push(memoryCsvGenerator([[...headers], ...currentSheet]))
//                     currentSheet = []
//                     gc()
//                 }
//                 // console.log(fixedRow)
//             } 
//             lastRow = finRow;
//             chunkNum = chunkNum+1
             
//         })
//         .on('end', ()=>{ 
//             console.log('File Parsing Complete')
//             if(lastRow.replace(/,/g,'').replace(/\s/g,'')!==''){
//                 const nextRowFixed = splitCsvStrings(lastRow);
//                 currentSheet.push(nextRowFixed);
//                 lastRow = ''
//             }
//             if(currentSheet.length>0){
//                 allSheets.push(memoryCsvGenerator([[...headers], ...currentSheet]))
//                 currentSheet = []
//                 gc()
//             }
//             doneReading = true

//         })

//     const checkDone = async () => {
//         if(!doneReading) {
//             await wait(10)
//             await checkDone()
//         }
//     }
//     await checkDone();
//     gc()
//     // console.log('CURRENT Sheet', currentSheet)
//     return {headers, allSheets}
// }

// export const arrayToXLSX = (data: any[][], name: string, path: string) => {

//     const worksheet = [{
//         name,
//         data,
//         options: {}
//     }]


//     const buffer = xlsx.build(worksheet);

//     writeFileSync(path, buffer);
// }
