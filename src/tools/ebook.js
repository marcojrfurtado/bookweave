import { arweaveInstance, queryAppTransactions, addAppTagsToTransaction } from './arweaveUtils';
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

    const result = await queryAppTransactions([{ fingerprint: fingerprint}])
    return result.data.transactions > 0
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

const getAllDocs = async() => {
    const docInfo = await queryAppTransactions()
    return docInfo
}

const queryDocs = async(searchField, searchValue) => {
    return await queryAppTransactions([{
        name: searchField,
        value: searchValue
    }])
}

export{
    supportedExtensions,
    createTransationFromEBookData,
    getAllDocs,
    queryDocs
}
