import { NextFunction, Request, Response } from "express";

type ProductOptionValue = {
  name: string
}
type ProductOption = {
  name: string,
  position: number,
  values: ProductOptionValue[],
}

type VariantOption = {
  optionName: string,
  name: string
}


type Metafield = {
  key: string,
  namespace: string,
  type: string,
  value: string
}

type ProductFile = {
  originalSource: string,
  filename?: string,
  duplicateResolutionMode?: string|'APPEN_UUID'|"RAISE_ERROR"|"REPLACE",
  alt?: string,
  id?: string
}

type ProductVariant = {
  sku: string,
  barcode?: string,
  price: number,
  compareAtPrice: number,
  optionValues: VariantOption[]
  file?: ProductFile,
  metafields?: Metafield[],
  taxCode?: string,
  taxable?: boolean,
  id?: string
}

type ProductSeoDraft = {
  title: string,
  description: string
}

type ProductTaxCategory = {
  id: string
}

type Product = {
  title: string,
  descriptionHtml: string,
  productOptions?: ProductOption[],
  variants?: ProductVariant[],
  vendor: string,
  tags: string|string[],
  category: string, 
  status: 'ACTIVE'|"ARCHIVED"|'DRAFT'|string,
  seo?: ProductSeoDraft
  productType: string
  handle?: string,
  collections?: string[],
  id?: string,
  metafields?: Metafield[],
  redirectNewHandle?: boolean
  files?: ProductFile[]
}

// hasOnlyDefaultVariant: false,
// isGiftCard: false,
// mediaCount:'',
// media:'',
// options: '',
// productType: '',
// publishedAt: '',
// tags: '',
// status: '',
// variants: '',
// variantsCount: '',



export const getProductsCount = () => {
  return `query {
            productsCount{
              count
            }
          }`
}

type MediaRequest = {
  after: string
}

type QueryData = {
  after?: string,
  media?: MediaRequest,
}

export const getProductVariantsQuery = (after?: string) => {
  // if(data!=null&&data.after!=null){
  return `query ProductData($productId: ID!, $amount: Int!) {
      product( id: $productId) {
        id
        variants (first: $amount${after!=null?`, after: "${after}"`:''}) {
          edges {
            node {
              barcode
              compareAtPrice
              id
              media(first: 15) {
                edges {
                  node {
                    id
                    mediaContentType
                    preview {
                        image {
                          url
                        }
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                }
              }
              inventoryQuantity
              price
              selectedOptions {
                name
                value
              }
              sku
            }
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }  
        }
      }
    }` 

}
export const getInventoryVariantsQuery = (after?: string) => {
  // if(data!=null&&data.after!=null){
  return `query ProductData($productId: ID!, $amount: Int!) {
      product( id: $productId) {
        id
        variants (first: $amount${after!=null?`, after: "${after}"`:''}) {
          edges {
            node {
              id
              inventoryQuantity
            }
          }
          pageInfo {
            hasNextPage
            startCursor
            endCursor
          }  
        }
      }
    }` 

}

export const getProductSetVariants = ( variants: {id: string, media?: string}[] ) => {
  const varQueries = variants.map((v, ind)=>{
    return `productVariant${ind+1}:  productVariant(id: "${v.id}") {
              id
              barcode
              compareAtPrice
              inventoryQuantity
              price
              selectedOptions {
                name
                value
              }
              sku
              media (first: 10${v.media!=null?', after: "'+v.media:'"'}) {
                edges {
                  node {
                    id
                    mediaContentType
                    preview {
                        image {
                          url
                        }
                    }
                  }
                }
                pageInfo {
                  startCursor
                  endCursor
                  hasNextPage
                }
              }
            }`
  })
  
  return `query {
    ${varQueries.join('\n')}
  }` 

}

export const getProductsQuery = (info?: {numberOfProducts?: number, after?: string}) =>{
  const numProducts = info==null||info.numberOfProducts==null?50:info.numberOfProducts;
  const afterProduct = info==null||info.after==null?'':`, after: "${info.after}"`;

  return `query {
          products(first: ${numProducts}${afterProduct}) {
            edges {
              node {
                id
                title
                handle
                media (first: 15) {
                  edges {
                    node {
                      id
                      mediaContentType
                      preview {
                        image {
                          url
                        }
                      }
                    }
                  }
                  pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                  }
                }
                category {
                  id
                  fullName
                  name,
                  attributes(first: 20) {
                    edges {
                      node {
                        __typename
                        ... on TaxonomyMeasurementAttribute {
                          id
                          name
                          options {
                            value
                          }
                        }
                      }
                    }
                  }
                },
                descriptionHtml
                isGiftCard
                productType
                status
                tags
                variants(first: 10) {
                  edges {
                    node {
                      barcode
                      compareAtPrice
                      id
                      inventoryQuantity
                      price
                      selectedOptions {
                        name
                        value
                      }
                      sku
                      media (first: 15) {
                        edges {
                          node {
                            id
                            mediaContentType
                            preview {
                              image {
                                url
                              }
                            }
                          }
                        }
                        pageInfo {
                          startCursor
                          endCursor
                          hasNextPage
                        }
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    startCursor
                    endCursor
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              startCursor
              endCursor
            }
          }

        }` 

}

export const getProductsInventoryQuery = (info?: {numberOfProducts?: number, after?: string}) =>{
  const numProducts = info==null||info.numberOfProducts==null?50:info.numberOfProducts;
  const afterProduct = info==null||info.after==null?'':`, after: "${info.after}"`;

  return `query {
          products(first: ${numProducts}${afterProduct}) {
            edges {
              node {
                id
                isGiftCard
              }
            }
            pageInfo {
              hasNextPage
              startCursor
              endCursor
            }
          }

        }` 

}

export const getProductsMediaQuery = (info?: {numberOfProducts?: number, after?: string}) =>{
  const numProducts = info==null||info.numberOfProducts==null?50:info.numberOfProducts;
  const afterProduct = info==null||info.after==null?'':`, after: "${info.after}"`;

  return `query {
          products(first: ${numProducts}${afterProduct}) {
            edges {
              node {
                id
                isGiftCard
                media (first: 15) {
                  edges {
                    node {
                      id
                      mediaContentType
                      preview {
                        image {
                          url
                        }
                      }
                    }
                  }
                  pageInfo {
                    startCursor
                    endCursor
                    hasNextPage
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              startCursor
              endCursor
            }
          }
        }` 

}



export const updateVariants = async (req: Request, res: Response, next: NextFunction) => {
    try{
        if(req.body==null){
            return res.status(403).json({
                success: false,
                message: "Must include body"
            })
        }

        type Media = {
            alt?: string,
            mediaContentType: "EXTERNAL_VIDEO"|"IMAGE"|"MODEL_3D"|"VIDEO"|string,
            originalSource: string
        }
        type Variant = {
            barcode?: string,
            compareAtPrice?: number,
            id: string,
            inventoryItem?:{
                cost: number,
                tracked?: boolean
            },
            inventoryPolicy: "CONTINUE"|"DENY"|string,
            inventoryuantities?: {
                availability: number,
                locationId: string
            },
            mediaId?: string,
            mediaSrc?: string[],
            // metafields?: 
            optionValues?: {
                name: string,
                optionName: string
            }[],
            price?: string,
            taxCode?: string,
            taxable?: boolean
        }
        const variant: Variant[] = [];
    }
    catch(err: any ){
        console.log({err})
        return res.status(500).json({
            message: err,
            success: false
        })
    }
}

// app.get('/', async (req: Request, res: Response, next: NextFunction)=>{
//     const resData = await graphQuery({query: `query {
//       products(first: 10) {
//         edges {
//           node {
//             id
//             handle
//           }
//         }
//         pageInfo {
//           hasNextPage
//         }
//       }
//     }`})


//         return res.status(200).json({resData})

// })


// app.get('/publications', async (req: Request, res: Response, next: NextFunction)=>{
//     const resData = await graphQuery({query: `query {
//         publications(first: 10) {
//         edges {
//             node {
//                 id
//                 name
//                 supportsFuturePublishing
//                 app {
//                     id
//                     title
//                 }
//             }
//         }
//         }
//     }`})
    
    
//     return res.status(200).json({resData})

// })


// app.get('/set-publications', async (req: Request, res: Response, next: NextFunction)=>{
//     const resData = await graphQuery({
//         "query": `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
//             publishablePublish(id: $id, input: $input) {
//               publishable {
//                 availablePublicationsCount {
//                   count
//                 }
//                 resourcePublicationsCount {
//                   count
//                 }
//               }
//               shop {
//                 publicationCount
//               }
//               userErrors {
//                 field
//                 message
//               }
//             }
//           }`,
//           "variables": {
//             "id": "gid://shopify/Product/7036411314245",
//             "input": {
//               "publicationId": "gid://shopify/Publication/92488990789"
//             }
//           },
//     });
    
    
//     return res.status(200).json({resData})

// })


// app.get('/set-options-order', async (req: Request, res: Response, next: NextFunction)=>{
//     const resData = await graphQuery({
//             "query": `mutation reorderOptions($options: [OptionReorderInput!]!, $productId: ID!) {
//               productOptionsReorder(options: $options, productId: $productId) {
//                 userErrors {
//                   field
//                   message
//                   code
//                 }
//                 product {
//                   id
//                   options {
//                     id
//                     name
//                     values
//                     position
//                     optionValues {
//                       id
//                       name
//                       hasVariants
//                     }
//                   }
//                   variants(first: 5) {
//                     nodes {
//                       id
//                       title
//                       selectedOptions {
//                         name
//                         value
//                       }
//                     }
//                   }
//                 }
//               }
//             }`,
//             "variables": {
//               "productId": "gid://shopify/Product/7036411314245",
//               "options": [
//                 {
//                   "name": "Color",
//                   "values": [
//                     {
//                       "name": "Black"
//                     },
//                     {
//                       "name": "Green"
//                     },
//                     {
//                       "name": "Hersey"
//                     },
//                     {
//                       "name": "Neon Blue"
//                     },
//                     {
//                       "name": "White"
//                     }
//                   ]
//                 },
//                 {
//                   "name": "Size",
//                   "values": [
//                     {
//                       "name":"XXS"
//                     }, 
//                     {
//                         "name":"XS"
//                     }, 
//                     { 
//                         "name":"S"
//                     },
//                     {
//                         "name":"M"
//                     },
//                     {
//                         "name":"L"
//                     },
//                     {
//                         "name":"XL"
//                     },
//                     {
//                         "name":"XXL"
//                     }
//                   ]
//                 }
//               ]
//             }
//     });
    
    
//     return res.status(200).json({resData})

// })

// app.get('/update-variant-cost', async (req: Request, res: Response, next: NextFunction)=>{
//     const resData = await graphQuery({
//         "query": `mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
//             inventoryItemUpdate(id: $id, input: $input) {
//                 inventoryItem {
//                 id
//                 unitCost {
//                     amount
//                 }
//                 tracked
//                 countryCodeOfOrigin
//                 provinceCodeOfOrigin
//                 harmonizedSystemCode
//                 countryHarmonizedSystemCodes(first: 1) {
//                     edges {
//                     node {
//                         harmonizedSystemCode
//                         countryCode
//                     }
//                     }
//                 }
//                 }
//                 userErrors {
//                 message
//                 }
//             }
//         }`,
//         "variables": {
//             "id": "gid://shopify/InventoryItem/43729076",
//             "input": {
//               "cost": 145.89,
//               "tracked": false,
//               "countryCodeOfOrigin": "US",
//               "provinceCodeOfOrigin": "OR",
//               "harmonizedSystemCode": "621710",
//               "countryHarmonizedSystemCodes": [
//                 {
//                   "harmonizedSystemCode": "6217109510",
//                   "countryCode": "CA"
//                 }
//               ]
//             }
//           }
//     });
    
    
//     return res.status(200).json({resData})

// })


// app.get('/product-variants', async (req: Request, res: Response, next: NextFunction)=>{
//     const resData = await graphQuery(`query {
//         productVariants(first: 10) {
//         edges {
//             node {
//                 id
//                 name
//                 supportsFuturePublishing
//                 app {
//                     id
//                     title
//                 }
//             }
//         }
//         }
//     }`)
    
    
//     return res.status(200).json({resData})

// })


// app.post('/product-set', async (req: Request, res: Response, next: NextFunction)=>{
//   try{
//     const body = req.body??null;
//     if(body==null){
//       return res.status(403).json({
//         message: 'no body data'
//       })
//     }
//     const curProd = body.product
//     if(curProd==null){
//       return res.status(403).json({
//         message: 'no product data'
//       })
//     }
//     const newProduct: Product = curProd;
//     graphQuery({
//       "query": `mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
//         productSet(synchronous: $synchronous, input: $productSet) {
//           product {
//             id
//           }
//           productSetOperation {
//             id
//             status
//             userErrors {
//               code
//               field
//               message
//             }
//           }
//           userErrors {
//             code
//             field
//             message
//           }
//         }
//       }`,
//       "variables": {
//         "synchronous": newProduct.variants.length>100?true:false,
//         "productSet": {
//           ...newProduct
//         }
//       }
      
//     })

//   }
//   catch(err: any){
//     res.status(500).json({
//       message: 'server error',
//       err
//     })
//   }
// })

// app.get('/product-set', async (req: Request, res: Response, next: NextFunction)=>{
//   try{
//     const newProduct: Product = over100Product;


//     const isSync = newProduct.variants==null||newProduct.variants.length<=100?true:false
//     console.log({isSync})
//     const resp = await graphQuery({
//       "query": `mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
//         productSet(synchronous: $synchronous, input: $productSet) {
//           product {
//             id
//           }
//           productSetOperation {
//             id
//             status
//             userErrors {
//               code
//               field
//               message
//             }
//           }
//           userErrors {
//             code
//             field
//             message
//           }
//         }
//       }`, 
//       "variables": {
//         "synchronous": isSync,
//         "productSet": {
//           ...newProduct
//         }
//       }
      
//     })
//     console.log({resp});
//     return res.status(200).json({
//       ...resp
//     })
//   }
//   catch(err: any){
//     return res.status(500).json({
//       message: 'server error',
//       err
//     })
//   }
// })
// type ImageFile = {
//   url: string,
//   alt?: string,
//   name?: string

// }
// app.post('/add-images', async (req: Request, res: Response, next: NextFunction)=>{
//   try{
//     const body = req.body??null;
//     if(body==null){
//       return res.status(403).json({
//         message: 'no body data'
//       })
//     }
//     const imgFiles: ImageFile[] = body.images??[];
//     const resData = await graphQuery({
//       "query": `mutation fileCreate($files: [FileCreateInput!]!) {
//         fileCreate(files: $files) {
//           files {
//             id
//             fileStatus
//             alt
//             createdAt
//           }
//         }
//       }`,
//       "variables": {
//         "files": [...imgFiles]
//       }
// });


// return res.status(200).json({resData})
    
//   }
//   catch(err: any){
//     res.status(500).json({
//       message: 'server error',
//       err
//     })
//   }
// })
