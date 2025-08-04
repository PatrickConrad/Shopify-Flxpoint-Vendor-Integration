import { cancelOrders } from './../orders';
import { graphQuery, sendRestReq } from "../shopify-req";

export const getShopifyOrder = async (orderNumber: string) => {
    const curDate = new Date();
    const fullDay = new Date(curDate.getTime()-(60000*60*24)).toISOString();
    const orders = await graphQuery({
        "query": `query {
            orders(first: 10, query:"name:1010") {
                edges {
                    node {
                        id
                    }
                }
            }
        }`
    })
    return {...orders?.data}
}
    

export const getShopifyOrdersByName = async (orderName: string) => {
    const orders = await graphQuery({
        query: `query {
            orders(first: 10, query:"name:${orderName}") {
                edges {
                    node {
                        id
                        name
                        note
                    }
                }
            }
        }`
    })
    return {...orders?.data}
}



export const updateShopifyOrderNote = async (orderId: string, note: string)=>{
    const updateNote = await graphQuery({
        "query": `mutation updateOrderMetafields($input: OrderInput!) {
            orderUpdate(input: $input) {
                order {
                    id
                    note
                }
                userErrors {
                    message
                    field
                }
            }
        }`, 
        "variables": {
            "input": {
                "id": orderId,
                "note": note
            }
        },
    })
    // const dataName = orders!=null&&orders.data['order']!=null&&orders.data['order']['name']!=null?orders.data['name']:''
    // console.log({dataName})
    const hasErrors = updateNote['errors']
    if(hasErrors!=null&&hasErrors.length>0){
        hasErrors.forEach((err: any)=>{
            console.log({err})
        })
    }
    console.log({updateNote}) 

    return updateNote
}

export const cancelShopifyOrder = async (orderId: string, shopifyReason: 'CUSTOMER'|'DECLINED'|'FRAUD'|'INVENTORY'|'OTHER'|'STAFF', reason?: string)=>{
    const cancelOrders = await graphQuery({
        "query": `mutation orderCancel($orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!) {
  orderCancel(orderId: $orderId, reason: $reason, refund: $refund, restock: $restock) {
    job {
        id
    }
    orderCancelUserErrors {
        message
    }
   
  }
}`, 
        "variables": {
            "notifyCustomer": true,
            "orderId": orderId,
            "reason": shopifyReason,
            "refund": true,
            "restock": true,
            "staffNote": reason??''
        },
    })
    // const dataName = orders!=null&&orders.data['order']!=null&&orders.data['order']['name']!=null?orders.data['name']:''
    // console.log({dataName})
    const hasErrors = cancelOrders['errors']
    if(hasErrors!=null&&hasErrors.length>0){
        hasErrors.forEach((err: any)=>{
            console.log({err})
        })
    }
    console.log({cancelOrders})

    return cancelOrders
}
