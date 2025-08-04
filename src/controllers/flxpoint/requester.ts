import axios, { AxiosResponse } from "axios";
import { existsSync, writeFileSync } from "fs";
import dotenv from 'dotenv';
dotenv.config();

let poolReqUsed = 0;

export const flexTime = 60000*60*4;


export const getFlexDateStr = (checkDate: number)=>{
	const year = new Date(checkDate).getFullYear();
	const month = new Date(checkDate).getMonth()+1<10?`0${new Date(checkDate).getMonth()+1}`:`${new Date(checkDate).getMonth()+1}`;
	const day = new Date(checkDate).getDate()<10?`0${new Date(checkDate).getDate()}`:`${new Date(checkDate).getDate()}`;
	const setHours = new Date(checkDate).getHours()>=24?new Date(checkDate).getHours()-24:new Date(checkDate).getHours()
	const hours = setHours<10?`0${setHours}`:`${setHours}`;
	const mins = new Date(checkDate).getMinutes()<10?`0${new Date(checkDate).getMinutes()}`:`${new Date(checkDate).getMinutes()}`;
	const secs = new Date(checkDate).getSeconds()<10?`0${new Date(checkDate).getSeconds()}`:`${new Date(checkDate).getSeconds()}`;
	return `${year}-${month}-${day}T${hours}:${mins}:${secs}Z`
}


const sendReq = async (flxResp: () => Promise<AxiosResponse<any, any>>) => {
    const resp = await flxResp();
    poolReqUsed = poolReqUsed - 1;
    return resp
}
export const sendFlxRequest2 = () => {
    const logFileExists = existsSync('./tmp/update-logger.csv')
    if(!logFileExists){
        writeFileSync('./tmp/update-logger.csv', '', 'utf-8')
    }
    const flxUrl = process.env.FLXPOINT_API_URL;
    
    const config = {
        headers: {
            'X-API-TOKEN': process.env.FLXPOINT_API_TOKEN,
            // 'X-Auth-Pool-Size': 40,
            // 'X-Auth-Pool-Used': poolReqUsed,
            // 'X-Auth-Replenished-Per-Second': 2,
            // "Authorization": `Bearer ${process.env.FLXPOINT_API_TOKEN}`,
            // 'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }

    return {flxUrl, config, sendReq}
}


type ReqMethods = "GET"|"POST"|"PATCH"|"DELETE"
type ReqOpts<T> = {
    url: string, 
    headers: {
         'Content-Type': 'application/json',
        'X-API-TOKEN': string
    },
    method: ReqMethods,
    body?: T
}
export async function sendFlxRequest<T>(urlEndPoint: string, method?:ReqMethods, body?: T){
    const reqOpts: ReqOpts<T> = {
        url: `${process.env.FLXPOINT_API_URL}${urlEndPoint}`,
        headers: {
            'Content-Type': 'application/json',
            'X-API-TOKEN': process.env.FLXPOINT_API_TOKEN as string
        },
        method: method??'GET'
    }
    if(method!=null&&(method==='PATCH'||method==="POST")&&body!=null){
        reqOpts.body = body;
    }
    
    const reqResp = await axios.request(reqOpts);

    return reqResp
}