import { ArAppName, ArAppMode, ArAppVersion } from '../constants'
import Arweave from 'arweave/web'
import stringifyObject from "stringify-object"


const viewTransactionBaseUrl = "https://viewblock.io/arweave/tx/";
const arweaveDataHostUrl = "https://arweave.net/"

const arweaveInstance = Arweave.init({
    host: 'arweave.net',
    port: 80,           
    protocol: 'https',
    timeout: 90000,
    logging: false,
})

function readArweaveWallet(wallet){
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => {
        reader.abort()
        reject()
        }
        reader.onload = () => {
            resolve(reader.result)
        }
        reader.readAsText(wallet)
    })
}

const queryWithinAppTags = [
    {
        name: "ArAppName",
        value: ArAppName
    },
    {
        name: "ArAppVersion",
        value: ArAppVersion
    },
    {
        name: "ArAppMode",
        value: ArAppMode
    }
]

const transactionTagsToDict = (transactions) => {
    return transactions.map(transaction => {
        var docInfo = {}
        docInfo['transaction_id'] = transaction.id
        transaction.tags.forEach( (tag) => {
            docInfo[tag.name] = tag.value
        })
        return docInfo
    })
}

const queryAppTransactions = async(searchTags = []) => {
    const qlQuery = `query {
        transactions(tags: ${stringifyObject(queryWithinAppTags.concat(searchTags), {singleQuotes: false})}) {
          id,
          tags {
            name,
            value
          }
        }
      }`
    const result = await fetch(`https://arweave.net/arql`, { method: 'POST', body: JSON.stringify({ query: qlQuery }) })
                        .then(resp => resp.json());
    if (!result.data) {
        throw Error(JSON.stringify(result.errors))
    }
    return transactionTagsToDict(result.data.transactions)
}

const addAppTagsToTransaction = async(transaction) => {

    await transaction.addTag('ArAppName', ArAppName)
    await transaction.addTag('ArAppVersion', ArAppVersion)
    await transaction.addTag('ArAppMode', ArAppMode)

    return transaction
}


export{
    arweaveInstance,
    arweaveDataHostUrl,
    readArweaveWallet,
    viewTransactionBaseUrl,
    queryAppTransactions,
    addAppTagsToTransaction
}