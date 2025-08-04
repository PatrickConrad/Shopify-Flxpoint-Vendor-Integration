import { NextFunction, Request, Response } from "express";
import { setShopifyGraphQuery } from "../shopify-req";
import { getInventoryVariantsQuery, getProductsCount, getProductSetVariants, getProductsInventoryQuery, getProductsMediaQuery, getProductsQuery, getProductVariantsQuery } from "../shopify/products";
import { wait } from "../../helpers/wait";
import { writeFileSync } from "fs";
import { addRow, rowToCsvRowString } from "../../helpers/csv";

const testShopify = {
    token: process.env.SHOPIFY_TOKEN as string,
    key: process.env.SHOPIFY_KEY as string,
    secret: process.env.SHOPIFY_SECRET as string,
    storeId: process.env.SHOPIFY_STORE_ID as string,
}

const shopOutput = {
    id: '',
    title: '',
    handle: '',
    category: '',
    descriptionHtml: '',
    hasOnlyDefaultVariant: false,
    isGiftCard: false,
    mediaCount:'',
    media:'',
    options: '',
    productType: '',
    publishedAt: '',
    tags: '',
    status: '',
    variants: '',
    variantsCount: '',
    
}
const graphRequester = setShopifyGraphQuery(testShopify);


export async function getVariants(req: Request, res: Response, next: NextFunction) {
   try { 
        const ids = [
            {id: 'gid://shopify/ProductVariant/42025716777029'},
            {id: 'gid://shopify/ProductVariant/42025716940869'},
            {id: 'gid://shopify/ProductVariant/41997762003013'}
        ]
        const qry = getProductSetVariants([...ids]);
        console.log({qry})
        const varsTest = await graphRequester({query: qry});
        return res.status(200).json({
            varsTest  
        })
    }
    catch(err: any){
        console.log({err});
        return res.status(500).send(err)
    }
}


export async function getProducts(req: Request, res: Response, next: NextFunction) {
    try{

        const queryString = getProductsQuery();
        const queryResp = await graphRequester({query: queryString})
        return res.status(200).json(queryResp);
    }
    catch(err: any){
        console.log({err})
        return res.status(500).send(err);

    }
}


const waitForRestor = async (avail: number, rate: number) => {
    if(avail<500){
        await wait(30000);
    }
}


type VariantInfo = {
    variantId: string, 
    sku: string, 
    upc: string|number|null, 
    compareAt: string, 
    price: string, 
    options: {
        name: string, 
        value: string|number
    }[], 
    available: string|null, 
    images: string[]
}
type ParentInfo = {
    productId: string, 
    title: string, 
    category: string|null, 
    attributes: string[], 
    handle: string, 
    description: string, 
    productType: string, 
    status: string, 
    tags: string[], 
    images: string[]
}

type ProductCheck = {
    parent: ParentInfo, 
    variants: VariantInfo[], 
    hasMore: string
}



export const getAllProductImages: (after?: string)=>Promise<void> = async (after?: string) => {
    try{
        const queryString = after==null?getProductsMediaQuery():getProductsMediaQuery({after});
        const queryResp = await graphRequester({query: queryString})
        // console.log({queryResp})
        const pageInfo: {hasNextPage: boolean, startCursor: string, endCursor: string}= queryResp['data']['products']['pageInfo'];
        const foundProducts: any[] = queryResp['data']['products']['edges'];
        if(foundProducts!=null){
            foundProducts.forEach(p=>{
                const productInfo = p['node']
                if(productInfo!=null){
                    const isGiftCard = productInfo['isGiftCard']??false;
                    if(!isGiftCard){
                        const id = productInfo['id'];
                        const pageInfo = {
                            endCursor: '',
                            hasNextPage: false
                        }
                        
                        if(productInfo['variants']!=null&&productInfo['variants']['pageInfo']!=null){
                            const curPageInfo = productInfo['variants']['pageInfo'];
                            pageInfo.endCursor = curPageInfo['endCursor']??'';
                            pageInfo.hasNextPage = curPageInfo['hasNextPage']??false;
                        }
                        const images: string[] = [];
                        const hasMedia: any[] = productInfo['media']!=null?productInfo['media']['edges']:[];
                        for(let hm=0;hm<hasMedia.length;hm++){
                            const curMedia = hasMedia[hm]['node'];
                            // console.log({curMedia});
                            const type = curMedia['mediaContentType'];
                            if(type==='IMAGE'){
                                const prev= curMedia['preview']!=null&&curMedia['preview']['image']!=null&&curMedia['preview']['image']['url']!=null?curMedia['preview']['image']['url']:'';
                                console.log({prev})
                                if(prev!==''&& !images.includes(prev)) images.push(prev);
                            }
                        }


                        addRow('./tmp/product-images.csv', [id, images.join(';')])
                    }
                    // media
                }
            })
        }
        
        // console.log({queryResp})
        if(queryResp['extensions']!=null){
            console.log({ext: queryResp['extensions']})
        }
        const queryCost: number = queryResp['extensions']['cost']['throttleStatus']['currentlyAvailable'];
        const restoreRate: number = queryResp['extensions']['cost']['throttleStatus']['restoreRate'];
        
        console.log('Waiting for restore')
        await waitForRestor(queryCost, restoreRate);

        console.log({pageInfo});
        if(pageInfo.hasNextPage){
            await getAllProductImages(pageInfo.endCursor);
        }

        return
    }
    catch(err: any){
        console.log({err})
        return

    }
}


export const getAllProductsInv: (productIds: string[], after?: string)=>Promise<string[]> = async (productIds: string[], after?: string) => {
    try{
        const queryString = after==null?getProductsInventoryQuery():getProductsInventoryQuery({after});
        const queryResp = await graphRequester({query: queryString})
        const pageInfo: {hasNextPage: boolean, startCursor: string, endCursor: string}= queryResp['data']['products']['pageInfo'];
        const foundProducts: any[] = queryResp['data']['products']['edges'];
        if(foundProducts!=null){
            foundProducts.forEach(p=>{
                const productInfo = p['node']
                if(productInfo!=null){
                    const isGiftCard = productInfo['isGiftCard']??false;
                    if(!isGiftCard){
                        const id = productInfo['id'];
                        const pageInfo = {
                            endCursor: '',
                            hasNextPage: false
                        }
                        
                        if(productInfo['variants']!=null&&productInfo['variants']['pageInfo']!=null){
                            const curPageInfo = productInfo['variants']['pageInfo'];
                            pageInfo.endCursor = curPageInfo['endCursor']??'';
                            pageInfo.hasNextPage = curPageInfo['hasNextPage']??false;
                        }
                        productIds.push(id);
                    }
                }
            })
        }
        
        console.log({queryResp})
        if(queryResp['extensions']!=null){
            console.log({ext: queryResp['extensions']})
        }
        const queryCost: number = queryResp['extensions']['cost']['throttleStatus']['currentlyAvailable'];
        const restoreRate: number = queryResp['extensions']['cost']['throttleStatus']['restoreRate'];
        
        console.log({productIds})
        console.log('Waiting for restore')
        await waitForRestor(queryCost, restoreRate);

        console.log({pageInfo});
        if(pageInfo.hasNextPage){
            return await getAllProductsInv(productIds, pageInfo.endCursor);
        }

        return productIds
    }
    catch(err: any){
        console.log({err})
        return []

    }
}

export const getAllProducts: (products: ProductCheck[], after?: string)=>Promise<ProductCheck[]> = async (products: ProductCheck[], after?: string) => {
    try{

        const queryString = after==null?getProductsQuery():getProductsQuery({after});
        const queryResp = await graphRequester({query: queryString})
        const pageInfo: {hasNextPage: boolean, startCursor: string, endCursor: string}= queryResp['data']['products']['pageInfo'];
        const foundProducts: any[] = queryResp['data']['products']['edges'];
        if(foundProducts!=null){
            foundProducts.forEach(p=>{
                const productInfo = p['node']
                if(productInfo!=null){
                    const isGiftCard = productInfo['isGiftCard']??false;
                    if(!isGiftCard){
                        const description = productInfo['descriptionHtml'];

                        const curParent: ParentInfo = {
                            productId:  productInfo['id'], 
                            title: productInfo['title'], 
                            category: '', 
                            attributes: [], 
                            handle: productInfo['handle'], 
                            description: description.replace(/\n/g,''),
                            productType: productInfo['productType'], 
                            status: productInfo['status'], 
                            tags:  productInfo['tags'] as string[], 
                            images: []
                        }
    
                        const hasParentMedia: any[] = productInfo['media']!=null?productInfo['media']['edges']:[];
                        for(let hm=0;hm<hasParentMedia.length;hm++){
                            const curMedia = hasParentMedia[hm]['node'];
                            // console.log({curMedia});
                            const type = curMedia['mediaContentType'];
                            if(type==='IMAGE'){
                                const prev= curMedia['preview']!=null&&curMedia['preview']['image']!=null&&curMedia['preview']['image']['url']!=null?curMedia['preview']['image']['url']:'';
                                console.log({prev})
                                if(prev!==''&& !curParent.images.includes(prev)) curParent.images.push(prev);
                            }
                        }


                        if(productInfo['category']!=null){
                            const curCat = productInfo['category']
                            if(curCat['fullName']!=null) curParent.category = curCat['fullName'];
                            const hasAttibutes = curCat['attributes'];
                            if(hasAttibutes!=null){
                                const atts: any[] = hasAttibutes['edges'];
                                if(atts!=null){
                                    atts.forEach(a=>{
                                        const node = a['node'];
                                        const type = node['__typename']
                                        if(`${type}`.includes('TaxonomyMeasurementAttribute')){
                                            const name = node['name']??'';
                                            const optionsObj: any[] = node['options']??[];
                                            const options: string[] = [];
                                            for(let o=0;o<optionsObj.length;o++){
                                                if(optionsObj[o]['value']!=null&&optionsObj[o]['value']!==''&&!options.includes(optionsObj[o]['value'])){
                                                    options.push(optionsObj[o]['value']);
                                                }
                                            }
                                            curParent.attributes.push(`${name}:${options.join(';')}`)
                                        }
                                    })
                                }
                            }
                        }
                        const finVariants: VariantInfo[] = [];
                        const pageInfo = {
                            endCursor: '',
                            hasNextPage: false
                        }
                        
                        if(productInfo['variants']!=null&&productInfo['variants']['pageInfo']!=null){
                            const curPageInfo = productInfo['variants']['pageInfo'];
                            pageInfo.endCursor = curPageInfo['endCursor']??'';
                            pageInfo.hasNextPage = curPageInfo['hasNextPage']??false;
                        }

                        const productVariants: any[] = productInfo['variants']!=null&&productInfo['variants']['edges']!=null?productInfo['variants']['edges']:[];
                        for(let pv=0;pv<productVariants.length;pv++){
                            const curNode = productVariants[pv]['node'];

                            const curVariant: VariantInfo = {
                                variantId: curNode['id']??'',
                                upc: curNode['barcode']??'',
                                sku: curNode['sku']??'',
                                compareAt: curNode['compareAtPrice']??'',
                                price: curNode['price']??'',
                                available: curNode['inventoryQuantity']!=null?`${curNode['inventoryQuantity']}`:'',
                                options: curNode['selectedOptions']==null?[]:curNode['selectedOptions'].map((so:any)=>{return{name: so['name'], value: so['value']}}),
                                images: [],
                            }

                            const hasMedia: any[] = curNode['media']!=null?curNode['media']['edges']:[];
                            for(let hm=0;hm<hasMedia.length;hm++){
                                const curMedia = hasMedia[hm]['node'];
                                const type = curMedia['mediaContentType'];
                                if(type==='IMAGE'){
                                    const prev= curMedia['preview']!=null&&curMedia['preview']['image']!=null&&curMedia['preview']['image']['url']!=null?curMedia['preview']['image']['url']:'';
                                    curVariant.images.push(prev);
                                }
                            }

                            finVariants.push(curVariant);


                        }

                        products.push({parent: {...curParent}, variants: [...finVariants], hasMore: pageInfo.hasNextPage?pageInfo.endCursor:''})
                    }

                }
            })
        }

        
        console.log({queryResp})
        if(queryResp['extensions']!=null){
            console.log({ext: queryResp['extensions']})
        }
        const queryCost: number = queryResp['extensions']['cost']['throttleStatus']['currentlyAvailable'];
        const restoreRate: number = queryResp['extensions']['cost']['throttleStatus']['restoreRate'];
        
        console.log({products})
        console.log('Waiting for restore')
        await waitForRestor(queryCost, restoreRate);


        console.log({pageInfo});
        if(pageInfo.hasNextPage){
            return await getAllProducts(products, pageInfo.endCursor);
        }


        return products
    }
    catch(err: any){
        console.log({err})
        return []

    }
}


// export const getAllVariants: (product: string, variants: string[], after?: string)=>Promise<VariantInfo[]> = async (product: string, after?: string) => {
//     try{

//         const setQuery = after!=null?getProductVariantsQuery(after):getProductVariantsQuery();
//         const varsTest = await graphRequester({query: setQuery, variables: {productId: product, amount: 20}});


//         const queryString = after==null?getProductsQuery():getProductsQuery({after});
//         const queryResp = await graphRequester({query: queryString})
//         const pageInfo: {hasNextPage: boolean, startCursor: string, endCursor: string}= queryResp['data']['products']['pageInfo'];
//         const foundProducts: any[] = queryResp['data']['products']['edges'];
//         if(foundProducts!=null){
//             foundProducts.forEach(p=>{
//                 const productInfo = p['node']
//                 if(productInfo!=null){
//                     const isGiftCard = productInfo['isGiftCard']??false;
//                     if(!isGiftCard){
//                         const description = productInfo['descriptionHtml'];

//                         const curParent: ParentInfo = {
//                             productId:  productInfo['id'], 
//                             title: productInfo['title'], 
//                             category: '', 
//                             attributes: [], 
//                             handle: productInfo['handle'], 
//                             description: description.replace(/\n/g,''),
//                             productType: productInfo['productType'], 
//                             status: productInfo['status'], 
//                             tags:  productInfo['tags'] as string[], 
//                         }
    
//                         if(productInfo['category']!=null){
//                             const curCat = productInfo['category']
//                             if(curCat['fullName']!=null) curParent.category = curCat['fullName'];
//                             const hasAttibutes = curCat['attributes'];
//                             if(hasAttibutes!=null){
//                                 const atts: any[] = hasAttibutes['edges'];
//                                 if(atts!=null){
//                                     atts.forEach(a=>{
//                                         const node = a['node'];
//                                         const type = node['__typename']
//                                         if(`${type}`.includes('TaxonomyMeasurementAttribute')){
//                                             const name = node['name']??'';
//                                             const optionsObj: any[] = node['options']??[];
//                                             const options: string[] = [];
//                                             for(let o=0;o<optionsObj.length;o++){
//                                                 if(optionsObj[o]['value']!=null&&optionsObj[o]['value']!==''&&!options.includes(optionsObj[o]['value'])){
//                                                     options.push(optionsObj[o]['value']);
//                                                 }
//                                             }
//                                             curParent.attributes.push(`${name}:${options.join(';')}`)
//                                         }
//                                     })
//                                 }
//                             }
//                         }
//                         const finVariants: VariantInfo[] = [];
//                         const pageInfo = {
//                             endCursor: '',
//                             hasNextPage: false
//                         }
                        
//                         if(productInfo['variants']!=null&&productInfo['variants']['pageInfo']!=null){
//                             const curPageInfo = productInfo['variants']['pageInfo'];
//                             pageInfo.endCursor = curPageInfo['endCursor']??'';
//                             pageInfo.hasNextPage = curPageInfo['hasNextPage']??false;
//                         }

//                         const productVariants: any[] = productInfo['variants']!=null&&productInfo['variants']['edges']!=null?productInfo['variants']['edges']:[];
//                         for(let pv=0;pv<productVariants.length;pv++){
//                             const curNode = productVariants[pv]['node'];

//                             const curVariant: VariantInfo = {
//                                 variantId: curNode['id']??'',
//                                 upc: curNode['barcode']??'',
//                                 sku: curNode['sku']??'',
//                                 compareAt: curNode['compareAtPrice']??'',
//                                 price: curNode['price']??'',
//                                 available: curNode['inventoryQuantity']!=null?`${curNode['inventoryQuantity']}`:'',
//                                 options: curNode['selectedOptions']==null?[]:curNode['selectedOptions'].map((so:any)=>{return{name: so['name'], value: so['value']}}),
//                                 images: [],
//                             }

//                             const hasMedia: any[] = curNode['media']!=null?curNode['media']['edges']:[];
//                             for(let hm=0;hm<hasMedia.length;hm++){
//                                 const curMedia = hasMedia[hm]['node'];
//                                 const type = curMedia['mediaContentType'];
//                                 if(type==='IMAGE'){
//                                     const prev= curMedia['preview']!=null&&curMedia['preview']['image']!=null&&curMedia['preview']['image']['url']!=null?curMedia['preview']['image']['url']:'';
//                                     curVariant.images.push(prev);
//                                 }
//                             }

//                             finVariants.push(curVariant);


//                         }

//                         products.push({parent: {...curParent}, variants: [...finVariants], hasMore: pageInfo.hasNextPage?pageInfo.endCursor:''})
//                     }

//                 }
//             })
//         }

        
//         console.log({queryResp})
//         if(queryResp['extensions']!=null){
//             console.log({ext: queryResp['extensions']})
//         }
//         const queryCost: number = queryResp['extensions']['cost']['throttleStatus']['currentlyAvailable'];
//         const restoreRate: number = queryResp['extensions']['cost']['throttleStatus']['restoreRate'];
        
//         console.log({products})
//         console.log('Waiting for restore')
//         await waitForRestor(queryCost, restoreRate);


//         console.log({pageInfo});
//         if(pageInfo.hasNextPage){
//             return await getAllProducts(products, pageInfo.endCursor);
//         }


//         return products
//     }
//     catch(err: any){
//         console.log({err})
//         return []

//     }
// }

export async function getProductData(req: Request, res: Response, next: NextFunction) {
    try{

        writeFileSync('./tmp/shopify-test.csv', rowToCsvRowString(['sku', 'upc', 'variant id', 'product id', 'handle', 'title', 'category', 'attributes', 'product type', 'status', 'tags', 'compare at', 'price', 'available', 'option name 1', 'option value 1', 'option name 2', 'option value 2', 'option name 3', 'option value 3', 'images', 'description', 'parent images']))

        const allProductInfo = await getAllProducts([]);
        for(let api=0;api<allProductInfo.length;api++){
            const currentVars = allProductInfo[api].variants;
            const parentInfo = allProductInfo[api].parent;
            if(allProductInfo[api].hasMore){
                const getAllVars = async (after?: string) => {
                    const varsTest = await graphRequester({query: after!=null?getProductVariantsQuery(after):getProductVariantsQuery(), variables: {productId: parentInfo.productId, amount: 20} });

                    const pageInfo = {
                        endCursor: '',
                        hasNextPage: false
                    }
                    console.log({varsTest})
                    const erros = varsTest['errors']
                    console.log({erros})
                    const curProduct = varsTest['data']['product']
                    if(curProduct['variants']!=null&&curProduct['variants']['pageInfo']!=null){
                        const curPageInfo = curProduct['variants']['pageInfo'];
                        pageInfo.endCursor = curPageInfo['endCursor']??'';
                        pageInfo.hasNextPage = curPageInfo['hasNextPage']??false;
                    }

                    const allVariants: any[] = curProduct['variants']['edges']??[];
                    allVariants.forEach(av=>{
                        const curNode = av['node'];

                        const curVariantId = curNode['id']??'';
                        const curVariant: VariantInfo = {
                            variantId: curVariantId,
                            upc: curNode['barcode']??'',
                            sku: curNode['sku']??'',
                            compareAt: curNode['compareAtPrice']??'',
                            price: curNode['price']??'',
                            available: curNode['inventoryQuantity']!=null?`${curNode['inventoryQuantity']}`:'',
                            options: curNode['selectedOptions']==null?[]:curNode['selectedOptions'].map((so:any)=>{return{name: so['name'], value: so['value']}}),
                            images: [],
                        }

                        const hasMedia: any[] = curNode['media']!=null?curNode['media']['edges']:[];
                        for(let hm=0;hm<hasMedia.length;hm++){
                            const curMedia = hasMedia[hm]['node'];
                            const type = curMedia['mediaContentType'];
                            if(type==='IMAGE'){
                                const prev= curMedia['preview']!=null&&curMedia['preview']['image']!=null&&curMedia['preview']['image']['url']!=null?curMedia['preview']['image']['url']:'';
                                curVariant.images.push(prev);
                            }
                        }
                        const hasVariant = currentVars.find(cv=>cv.variantId===curVariantId);
                        if(hasVariant==null) currentVars.push(curVariant);
                    })
                    console.log(pageInfo);
                    if(pageInfo.hasNextPage){
                        console.log('next page');
                        await wait(15000);
                        await getAllVars(pageInfo.endCursor);
                    }
                }
                await getAllVars();
            }
            const pImgs = parentInfo.images.join(';');

            for(let cv=0;cv<currentVars.length;cv++){
               
                const curVar = currentVars[cv];
                const atts = parentInfo.attributes.join(';');
                const allTags = parentInfo.tags.join(',');
                const vImgs = curVar.images.join(';');
                const vOpts = curVar.options;
                const optName1 = vOpts[0]==null?'':vOpts[0].name;
                const optValue1 = vOpts[0]==null?'':vOpts[0].value;
                const optName2 = vOpts[1]==null?'':vOpts[1].name;
                const optValue2 = vOpts[1]==null?'':vOpts[1].value;
                const optName3 = vOpts[2]==null?'':vOpts[2].name;
                const optValue3 = vOpts[2]==null?'':vOpts[2].value;


                const row = [curVar.sku, curVar.upc, curVar.variantId, parentInfo.productId, parentInfo.handle, parentInfo.title, parentInfo.category, atts, parentInfo.productType, parentInfo.status, allTags, curVar.compareAt, curVar.price, curVar.available,optName1, optValue1, optName2, optValue2, optName3, optValue3, vImgs, parentInfo.description, pImgs ].map(r=>`${r}`)
                addRow('./tmp/shopify-test.csv', row);
            }
        }



        return res.status(200).json({
            message: 'done'
        })


    }
    catch(err: any){
        console.log({err});
        return res.status(500).send(err)
    }
}




export async function getInventoryData(req: Request, res: Response, next: NextFunction) {
    try{

        writeFileSync('./tmp/shopify-test-inventory.csv', rowToCsvRowString(['id', 'available']))

        const allProductInfo = await getAllProductsInv([]);
        for(let api=0;api<allProductInfo.length;api++){
            const currentVars: {sku: string, qty: string}[] = [];
            const parentId = allProductInfo[api];
                const getAllInvVars = async (after?: string) => {
                    const varsTest = await graphRequester({query: after!=null?getInventoryVariantsQuery(after):getInventoryVariantsQuery(), variables: {productId: parentId, amount: 20} });

                    const pageInfo = {
                        endCursor: '',
                        hasNextPage: false
                    }
                    console.log({varsTest})
                    const erros = varsTest['errors']
                    console.log({erros})
                    const curProduct = varsTest['data']['product']
                    if(curProduct['variants']!=null&&curProduct['variants']['pageInfo']!=null){
                        const curPageInfo = curProduct['variants']['pageInfo'];
                        pageInfo.endCursor = curPageInfo['endCursor']??'';
                        pageInfo.hasNextPage = curPageInfo['hasNextPage']??false;
                    }

                    const allVariants: any[] = curProduct['variants']['edges']??[];
                    allVariants.forEach(av=>{
                        const curNode = av['node'];
                        const id = curNode['id'];
                        const qty = curNode['inventoryQuantity']!=null?`${curNode['inventoryQuantity']}`:''
                        addRow('./tmp/shopify-test-inventory.csv', [id, qty]);
                        

                    })
                    console.log(pageInfo);
                    if(pageInfo.hasNextPage){
                        console.log('next page');
                        await wait(2000);
                        await getAllInvVars(pageInfo.endCursor);
                    }
                }
                await getAllInvVars();

        }



        return res.status(200).json({
            message: 'done'
        })


    }
    catch(err: any){
        console.log({err});
        return res.status(500).send(err)
    }
}


export async function getParentImageData(req: Request, res: Response, next: NextFunction) {
    try{
        writeFileSync('./tmp/product-images.csv', rowToCsvRowString(['id', 'urls']));

       await getAllProductImages();

        return res.status(200).json({
            message: 'done'
        })


    }
    catch(err: any){
        console.log({err});
        return res.status(500).send(err)
    }
}
