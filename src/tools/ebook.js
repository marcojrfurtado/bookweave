import { arweaveInstance } from './arweave';
import { ArAppName, ArAppMode, ArAppVersion } from '../constants'
import { createSearchPattern } from './stringUtils'
import Epub from "epubjs/lib/index";

const supportedExtensions=".epub"
const isbnPattern = /(^|[^0-9]{1,})[0-9]{13}$/

const guessISBNInIdentifier = (identifier)  => {
    // TODO: ISBN usually not in metadata, find another source, user input?
    var matches = identifier.match(isbnPattern);
    var result = (matches && matches.length > 0) 
                    ? matches[0].substring(matches[0].length-13, matches[0].length) 
                    : ""
    return result
}

const findFingerprint  = async(fingerprint) => {

    const txids = await arweaveInstance.arql({
        op: "and",
        expr1: {
            op: "equals",
            expr1: "fingerprint",
            expr2: fingerprint
        },
        expr2: queryWithinApp()
    })
    return txids.length > 0
}

const addAppTagsToTransaction = async(transaction) => {

    await transaction.addTag('ArAppName', ArAppName)
    await transaction.addTag('ArAppVersion', ArAppVersion)
    await transaction.addTag('ArAppMode', ArAppMode)

    return transaction
}

const loadMetadata = async(eBookName, rawEBookData) => {   

    var doc = undefined
    var inputMetadata = undefined
    var fingerprint = undefined

    if (eBookName.endsWith(".epub")) {
        doc = new Epub(rawEBookData, {});
        inputMetadata = await doc.loaded.metadata
        fingerprint = inputMetadata.identifier
    } else {
        throw Error("Unkown eBook format.")
    }

    var outputMetadata = {}

    outputMetadata['fingerprint'] = fingerprint
    outputMetadata['author'] = inputMetadata.info ? inputMetadata.info.Author : inputMetadata.creator
    outputMetadata['fileType'] = "epub"
    outputMetadata['Content-Type'] = "application/epub+zip"
    outputMetadata['title'] = inputMetadata.info ? inputMetadata.info.Title : inputMetadata.title
    outputMetadata['searchTitle'] = createSearchPattern(outputMetadata.title)
    outputMetadata['searchAuthor'] = createSearchPattern(outputMetadata.author)
    outputMetadata['isbn'] = guessISBNInIdentifier(outputMetadata.fingerprint)

    return outputMetadata
}


const createTransationFromEBookData = async(eBookName, rawEBookData, arweaveWallet) => {
    const data = Buffer.from(rawEBookData)
    let transaction = await arweaveInstance.createTransaction({ data }, arweaveWallet)

    await addAppTagsToTransaction(transaction)

    // NOTE: Future use
    const totalParts = 1
    await transaction.addTag('part', 0)
    await transaction.addTag('totalParts', totalParts)

    await transaction.addTag('sizeBytes', rawEBookData.byteLength)

    const metadata = await loadMetadata(eBookName, rawEBookData)

    const foundFingerprint = await findFingerprint(metadata.fingerprint)
    if (foundFingerprint) {
        throw Error("A copy of this file has already been uploaded to the network.")
    }

    for (var key in metadata){
        await transaction.addTag(key, metadata[key])
    }

    const fee = await arweaveInstance.ar.winstonToAr(transaction.reward)
    return {transaction, fee, metadata}
}

const queryWithinApp = () => {
    return {
        op: "and",
        expr1: {
            op: "and",
            expr1: {
                op: "equals",
                expr1: "ArAppName",
                expr2: ArAppName
            },
            expr2: {
                op: "equals",
                expr1: "ArAppVersion",
                expr2: ArAppVersion
            }
        },
        expr2: {
            op: "equals",
            expr1: "ArAppMode",
            expr2: ArAppMode
        }
    }
}

const getAllTransactionsIds = async() => {
    const txids = await arweaveInstance.arql(queryWithinApp())
    return txids
}

const queryTransactionIds = async(searchField, searchValue) => {
    const txids = await arweaveInstance.arql({
        op: "and",
        expr1: {
            op: "equals",
            expr1: searchField,
            expr2: searchValue
        },
        expr2: queryWithinApp()})
    return txids
}

const fetchTransactions = async(transactionIds) => {
    var docInfoArray = []
    for (var i = 0; i < transactionIds.length; i++) {
        const txid = transactionIds[i]

        const transaction = await arweaveInstance.transactions.get(txid)
        var docInfo = {}
        const tags = transaction.get('tags')
        for (var j = 0; j < tags.length; j++) {
            const tag = tags[j]
            let key = tag.get('name', {decode: true, string: true});
            let value = tag.get('value', {decode: true, string: true});
            docInfo[key] = value
        }
        docInfo['transaction_id'] = txid
        docInfo['data'] = transaction.get('data', {decode: true, string: false})
        docInfoArray.push(docInfo)
    }
    return docInfoArray
}

const shuffle = (array) => {
    array.sort(() => Math.random() - 0.5);
    return array
}

const getNDocs = async(n) => {
    const txids = await getAllTransactionsIds()
    const randomSubsetTxids = shuffle(txids).slice(0, n)
    const docInfo = await fetchTransactions(randomSubsetTxids)
    return docInfo
}

const queryDocs = async(searchField, searchValue) => {
    const txids = await queryTransactionIds(searchField, searchValue)
    const docInfo = await fetchTransactions(txids)
    return docInfo
}

export{
    supportedExtensions,
    createTransationFromEBookData,
    getNDocs,
    queryDocs
}
