import collectionFormatterFactory from './formatting/collection'

class Collection {
    constructor(collectionQueryInfo) {
        if (collectionQueryInfo['entity'] !== 'Collection') {
            throw new Error("Object information does not represent a collection")
        }
        this.formatter = collectionFormatterFactory(collectionQueryInfo['name'])
        this.separatorTag = collectionQueryInfo['sep'] || "\t"
        const allMetadataTags = collectionQueryInfo['metadataTags'].split(this.separatorTag)
        this.metadataTags = this.formatter.reorderMetadataTags(allMetadataTags)
        this.transactionId = collectionQueryInfo['transaction_id']
        this.trustedSources = collectionQueryInfo['trustedSources'].split(this.separatorTag)
    }
}

class Book {
    constructor(bookQueryInfo, collection) {
        if (bookQueryInfo['entity'] !== 'Book') {
            throw new Error("Object information does not represent a book")
        }
        this.separatorTag = bookQueryInfo['sep'] || collection.separatorTag
        this.contentType = bookQueryInfo['Content-Type']
        this.transactionId = bookQueryInfo['transaction_id']
        this.metadata = {}
        collection.metadataTags.forEach( (tag) => {
            this.metadata[tag] = bookQueryInfo[tag].split(collection.separatorTag)
        })
        this.metadata['id'] = this.transactionId
        this.belongsToCollectionId = bookQueryInfo['belongs']
        if (this.belongsToCollectionId !== collection.transactionId) {
            throw new Error("Book does not belong to collection provided")
        }
    }
}


export  { Collection, Book }