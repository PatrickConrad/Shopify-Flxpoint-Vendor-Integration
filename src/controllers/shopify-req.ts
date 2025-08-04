import axios, { AxiosResponse } from "axios";
import dotenv from 'dotenv';
dotenv.config();

export const setShopifyGraphQuery = (shopifyInfo: {token: string, key: string, secret: string, storeId:string}) => {
    const graphQuery = async (q: {query: string, variables?: any}) =>{
        if(q.query.includes('after')){
            console.log({q})
        }
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': `${shopifyInfo.token}`
            }
        }    
        const resp = await axios.post(`https://${shopifyInfo.key}:${shopifyInfo.secret}@${shopifyInfo.storeId}.myshopify.com/admin/api/${process.env.SHOPIFY_GRAPH_API_VERSION}/graphql.json`, {...q}, {...config});
        return resp.data
    }
    return graphQuery
}

export const graphQuery = async (q: {query: string, variables?: any}) =>{
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': `${process.env.SHOPIFY_TOKEN}`
        }

    }    
    const resp = await axios.post(`https://${process.env.SHOPIFY_KEY}:${process.env.SHOPIFY_SECRET}@${process.env.SHOPIFY_STORE_ID}.myshopify.com/admin/api/${process.env.SHOPIFY_GRAPH_API_VERSION}/graphql.json`, {...q}, {...config});
    // console.log({resp: resp.data})
    return resp.data
} 



export const sendRestReq = async (path: string, reqInfo?: {type?: 'get'|'put'|'delete'|'post', body?: any}) =>{
    const shopifyRestUrl = `https://${process.env.SHOPIFY_KEY}:${process.env.SHOPIFY_SECRET}@${process.env.SHOPIFY_STORE_ID}.myshopify.com/admin/api/${process.env.SHOPIFY_REST_API_VERSION}/`
    const reqPath = path.startsWith('/')?path.substring(1):path;
    const finPath = `${shopifyRestUrl}${reqPath}`
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': `${process.env.SHOPIFY_TOKEN}`
        }
    }
    
    let finalResp: AxiosResponse<any,any>| null  = null;
    if(reqInfo!=null&&reqInfo.type!=null&&reqInfo.type==='post') finalResp = await axios.post(finPath, reqInfo!=null&&reqInfo.body!=null?{...reqInfo.body}:{}, config);
    else if(reqInfo!=null&&reqInfo.type!=null&&reqInfo.type==='put') finalResp = await axios.put(finPath,  reqInfo!=null&&reqInfo.body!=null?{...reqInfo.body}:{}, config);
    else if(reqInfo!=null&&reqInfo.type!=null&&reqInfo.type==='delete') finalResp = await axios.delete(finPath, config);
    else{
        finalResp = await axios.get(finPath, config);
    }
    return finalResp;
} 





export const markwortGraphQuery = async (q: {query: string, variables?: any}) =>{
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': `${process.env.MARKWART_SHOPIFY_TOKEN}`
        }

    }    
    const resp = await axios.post(`https://${process.env.MARKWART_SHOPIFY_KEY}:${process.env.MARKWART_SHOPIFY_SECRET}@${process.env.MARKWART_SHOPIFY_STORE_ID}.myshopify.com/admin/api/${process.env.SHOPIFY_GRAPH_API_VERSION}/graphql.json`, {...q}, {...config});
    // console.log({resp: resp.data})
    return resp.data
} 