import pdfjsLib from 'pdfjs-dist/webpack';
import { arweaveInstance } from './arweave';
import { ArAppName, ArAppMode, ArAppVersion } from '../constants'
import { createSearchPattern } from './stringUtils'
import Epub from "epubjs/lib/index";

// NOTE: Needed because we are unable to easily pack an extra worker for arweave
const workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js'
pdfjsLib.PDFJS.workerSrc = workerSrc;
const mozillaWorker = new pdfjsLib.PDFWorker(workerSrc)

const supportedExtensions=".pdf,.epub"
const isbnPattern = /(^|[^0-9]{1,})[0-9]{13}$/

const guessISBNInIdentifier = (identifier)  => {
    // TODO: ISBN usually not in metadata, find another source, user input?
    var matches = identifier.match(isbnPattern);
    var result = (matches && matches.length > 0) 
                    ? matches[0].substring(matches[0].length-13, matches[0].length) 
                    : ""
    return result
}

const findFingerprint  = async(fingerprint) => new Promise(async(resolve, reject) => {
    try {
        const txids = await arweaveInstance.arql({
            op: "and",
            expr1: {
                op: "equals",
                expr1: "fingerprint",
                expr2: fingerprint
            },
            expr2: queryWithinApp()
        })
        resolve(txids.length > 0)
    } catch (error) {
        reject(error)
    }
});

const addAppTagsToTransaction = async(transaction) => new Promise(async (resolve) => {

    await transaction.addTag('ArAppName', ArAppName)
    await transaction.addTag('ArAppVersion', ArAppVersion)
    await transaction.addTag('ArAppMode', ArAppMode)

    resolve(transaction)
});

const loadMetadata = async(eBookName, rawEBookData) => new Promise(async (resolve, reject) => {
    
    try {
        var doc = undefined
        var inputMetadata = undefined
        var fingerprint = undefined

        const isPDF = eBookName.endsWith(".pdf")
        if (isPDF) {
            var loadingTask = pdfjsLib.getDocument({data: rawEBookData, worker: mozillaWorker})
            doc = await loadingTask.promise
            inputMetadata = await doc.getMetadata()
            fingerprint = doc.fingerprint
        } else if (eBookName.endsWith(".epub")) {
            doc = new Epub(rawEBookData, {});
            inputMetadata = await doc.loaded.metadata
            fingerprint = inputMetadata.identifier
        } else {
            reject("Unkown eBook format.")
        }

        var outputMetadata = {}

        outputMetadata['fingerprint'] = fingerprint
        outputMetadata['author'] = inputMetadata.info ? inputMetadata.info.Author : inputMetadata.creator
        outputMetadata['fileType'] = isPDF ? "pdf" : "epub"
        outputMetadata['Content-Type'] = isPDF ? "application/pdf" : "application/epub+zip"
        outputMetadata['title'] = inputMetadata.info ? inputMetadata.info.Title : inputMetadata.title
        outputMetadata['searchTitle'] = createSearchPattern(outputMetadata.title)
        outputMetadata['searchAuthor'] = createSearchPattern(outputMetadata.author)
        outputMetadata['isbn'] = guessISBNInIdentifier(outputMetadata.fingerprint)

        resolve(outputMetadata)
    } catch(error) {
        reject(error)
    }
});


const createTransationFromEBookData = async(eBookName, rawEBookData, arweaveWallet) => new Promise(async (resolve, reject) => {
    try {
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
            reject("A copy of this file has already been uploaded to the network.")
        }

        for (var key in metadata){
            await transaction.addTag(key, metadata[key])
        }

        const fee = await arweaveInstance.ar.winstonToAr(transaction.reward)
        resolve({transaction, fee, metadata})
    } catch (error) {
        reject(error)
    }
});

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

const getAllTransactionsIds = async() => new Promise(async(resolve, reject) => {
    try {
        const txids = await arweaveInstance.arql(queryWithinApp())
        resolve(txids)
    } catch(error) {
        reject(error)
    }
});

const queryTransactionIds = async(searchField, searchValue) => new Promise(async(resolve, reject) => {
    try {
        const txids = await arweaveInstance.arql({
            op: "and",
            expr1: {
                op: "equals",
                expr1: searchField,
                expr2: searchValue
            },
            expr2: queryWithinApp()})
        resolve(txids)
    } catch(error) {
        reject(error)
    }
});

const fetchTransactions = async(transactionIds) => new Promise(async(resolve, reject) => {
    try {
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
        resolve(docInfoArray)
    } catch (error) {
        console.error(error)
        reject(error)
    }
});

const shuffle = (array) => {
    array.sort(() => Math.random() - 0.5);
    return array
}

const getNDocs = async(n) => new Promise(async(resolve, reject) => {
    try {
        const txids = await getAllTransactionsIds()
        const randomSubsetTxids = shuffle(txids).slice(0, n)
        const docInfo = await fetchTransactions(randomSubsetTxids)
        resolve(docInfo)
    } catch(error) {
        reject(error)
    }
});

const queryDocs = async(searchField, searchValue) => new Promise(async(resolve, reject) => {
    try {
        const txids = await queryTransactionIds(searchField, searchValue)
        const docInfo = await fetchTransactions(txids)
        resolve(docInfo)
    } catch(error) {
        reject(error)
    }
});

export{
    supportedExtensions,
    createTransationFromEBookData,
    getNDocs,
    queryDocs
}
