import { queryAppTransactionsWithRetries } from './arweaveUtils';
import { Collection, Book } from "./queryParser/entities"

const getCollection = async(collectionName, collectionAddress = null) => {
    const collectionInfoArray = await queryAppTransactionsWithRetries([
        {
            name: 'entity',
            value: 'Collection'
        },
        {
            name: 'name',
            value: collectionName
        }
    ], collectionAddress)
    return collectionInfoArray.map( function(collectionInfo) { return new Collection(collectionInfo) })[0]
}

const getBooksFromCollection = async(collection, blockNumber = null, maxRetries = 4) => {
    var collectionQuery = [
        {
            name: 'entity',
            value: 'Book'
        },
        {
            name: 'belongs',
            value: collection.transactionId
        }
    ]
    if (blockNumber !== null) {
        collectionQuery.push({
            name: 'block',
            value: blockNumber
        })
    }
    const booksInfoArray = await queryAppTransactionsWithRetries(collectionQuery, collection.trustedSources)
    return booksInfoArray.map( function(bookInfo) { return new Book(bookInfo, collection) })
}

const getBookFromCollectionByBlocks = async(collection, blocksToFetch, fromBlock = 0) => {

    var blockPromises = []
    const toBlock = fromBlock + blocksToFetch
    for (var block = fromBlock; block < toBlock; block++) {
        blockPromises.push(getBooksFromCollection(collection, block))
    }
    return await Promise.all(blockPromises).then( (values) => {
        return [].concat.apply([], values);
    })
}

export{
    getCollection,
    getBooksFromCollection,
    getBookFromCollectionByBlocks,
}
