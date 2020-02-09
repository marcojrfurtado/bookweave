import React from 'react'

class ICollectionFormatter {
    constructor() {
        if (this.constructor === ICollectionFormatter) {
            throw new TypeError('Interface "ICollectionFormatter" cannot be instantiated directly.')
        }
    }    

    /**
     * Place tags in the order they should be presented in a table
     */
    reorderMetadataTags = (originalMetadataTags) => {
        throw new TypeError('Classes must implement reorderMetadataTags')
    }

    /**
     * Should return dictionary containing material-table column properties 
     * for a given metadata tag (e.g. render, title, etc)
     * @see https://material-table.com/#/docs/all-props
     */
    metadataInformation = (targetTag) => {
        throw new TypeError('Classes must implement metadataInformation') 
    }
}

class GenericCollectionFormatter extends ICollectionFormatter {

    reorderMetadataTags = (originalMetadataTags) => {
        return originalMetadataTags
    }

    metadataInformation = (targetTag) => {
        return {
            'title' : targetTag,
            'field' : targetTag
        }
    }
}

class GutenbergCollectionFormatter extends ICollectionFormatter {

    expectedMetadataTags = () => {
        return ["title", "author", "subject", "language", "formaturi"]
    }

    reorderMetadataTags = (originalMetadataTags) => {
        const originalMetadataTagsSet = new Set(originalMetadataTags)
        const expectedMetadataTagsArr = this.expectedMetadataTags()
        expectedMetadataTagsArr.forEach((expectedMetadataTag) => {
            if (!originalMetadataTagsSet.has(expectedMetadataTag)) {
                throw new Error(`Unable to find ${expectedMetadataTag} in  ${originalMetadataTags}`)
            }
        })
        return expectedMetadataTagsArr
    }

    metadataInformation = (targetMetadataTag) => {
        var metadataInfoDict = { 'field': targetMetadataTag }

        if (targetMetadataTag === "formaturi") {
            metadataInfoDict['title'] = "Alternative Links"
            metadataInfoDict['searchable'] = false
            metadataInfoDict['render'] = (rowData) => <div style={{display: 'flex', 'flexWrap': 'wrap'}}>{rowData.formaturi.map( 
                (uri, index) => (<div key={index} style={{padding: '5px'}}><a href={uri}>{uri.split('/').reverse()[0]}</a></div>)
            )}</div>
        } else {
            if (targetMetadataTag === "subject") {
                metadataInfoDict['render'] = (rowData) => rowData.subject.join(" // ")
            }
            metadataInfoDict['title'] = targetMetadataTag.charAt(0).toUpperCase() + targetMetadataTag.slice(1)
        }

        return metadataInfoDict
    }
}

const collectionFormatterFactory = (collectionName) => {

    if (collectionName === "gutenberg") {
        return new GutenbergCollectionFormatter()
    }

    return new GenericCollectionFormatter()
}

export default collectionFormatterFactory