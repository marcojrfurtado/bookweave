import React from 'react'
import {
    IconButton,
    TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table'
import styles from '../styles'
import { getCollection, getBookFromCollectionByBlocks } from '../tools/ebook'
import { arweaveDataHostUrl } from '../tools/arweaveUtils'
import GetAppIcon from '@material-ui/icons/GetApp';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { DefaultCollectionName, DefaultCollectionAddress } from '../constants'


const defaultBlockLoadIncrement = 3

class CollectionTable extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            customCollectionName: DefaultCollectionName,
            customCollectionAddress: null,
            collection: null,
            books: [],
        };
        this.resetCollection(DefaultCollectionName, DefaultCollectionAddress)
    }

    resetCollection = async() => {
      const { customCollectionName, customCollectionAddress } = this.state

      const collectionName = customCollectionName || DefaultCollectionName
      var collectionAddress = customCollectionAddress 
      if (!collectionAddress && (collectionName === DefaultCollectionName)) {
        collectionAddress = DefaultCollectionAddress
      }

      const collection = await getCollection(collectionName, collectionAddress)
      if (!collection) {
        const msg = `Collection ${collectionName}@${(collectionAddress || "*")} has not been found.`
        console.warn(msg)
        alert(msg)
        return
      }

      this.setState({
        collection :  collection,
        books : []
      })
      this.fetchBooksFromCollection()
    }

    fetchBooksFromCollection = async() => {
      const { collection } = this.state
      var blockStart = 0
      while (true) {
        const moreBooks = await getBookFromCollectionByBlocks(collection, defaultBlockLoadIncrement, blockStart)
        if (moreBooks.length === 0) {
          break
        }
        blockStart += defaultBlockLoadIncrement
        this.setState({
          books: this.state.books.concat(moreBooks)
        })
      }
    }

    updateCollectionName = (evt) => {
      this.setState({
        customCollectionName: evt.target.value
      })
    }

    updateCollectionAddress = (evt) => {
      this.setState({
        customCollectionAddress: evt.target.value
      })
    }

    render(){
      const { collection, books } = this.state
      const { classes } = this.props
      return(
        <div className={classes.tableRoot}>
          {collection &&
            <MaterialTable
              columns={collection.metadataTags.map((metadata) => collection.formatter.metadataInformation(metadata))}
              data={books.map((book) => book.metadata)}
              actions={[
                {
                  icon: 'download',
                  tooltip: 'Arweave Download',
                  onClick: (event) => {}
                }
              ]}
              components={{
                Action: props => (
                          <a href={`${arweaveDataHostUrl}/${props.data.id}.epub`}>
                                <GetAppIcon/>
                          </a>
                ),
              }}
              title={
                <div>
                  <TextField
                    id="collection-name"
                    label="Collection Name"
                    value={this.state.customCollectionName}
                    onChange={this.updateCollectionName}
                  />
                  <TextField
                    id="collection-address"
                    label="Collection Address"
                    onChange={this.updateCollectionAddress}
                  />
                  <IconButton onClick={this.resetCollection} >
                    <ArrowForward />
                  </IconButton>
                </div>
              }
            />
          }
      </div>
      )
    }
}

export default withStyles(styles)(CollectionTable);