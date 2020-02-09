import stringifyObject from "stringify-object"

const arweaveDataHostUrl = "https://arweave.net"

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

const queryAppTransactions = async(searchTags = [], fromAddress = []) => {

    if (typeof fromAddress === "string") {
        fromAddress = [fromAddress]
    } else if (!fromAddress) {
        fromAddress = []
    }

    
    const stringifyOptions = {singleQuotes: false}
    var fromCondition = ""
    if (fromAddress.length > 0) {
        fromCondition = `, from: ${stringifyObject(fromAddress, stringifyOptions)}`
    }
    const qlQuery = `query {
        transactions(tags: ${stringifyObject(searchTags, stringifyOptions)} ${fromCondition}) {
          id,
          tags {
            name,
            value
          }
        }
      }`
    const result = await fetch(`${arweaveDataHostUrl}/arql`, { method: 'POST', body: JSON.stringify({ query: qlQuery }) })
                        .then(resp => resp.json());
    if (!result.data) {
        throw Error(JSON.stringify(result.errors))
    }
    return transactionTagsToDict(result.data.transactions)
}

const queryAppTransactionsWithRetries = async(searchTags = [], fromAddress= [], maxRetries = 5) => {
    var retries = 0
    while (retries <= maxRetries) {
        try {
            const transactionInformation = await queryAppTransactions(searchTags, fromAddress)
            return transactionInformation
        } catch (error) {
            console.error(`Error while trying to fetch books from collection ${error}`)
            retries += 1
        }
    }
    throw Error(`Unable to fetch books from collection after ${retries} attemps.`)
}


export{
    arweaveDataHostUrl,
    queryAppTransactions,
    queryAppTransactionsWithRetries
}