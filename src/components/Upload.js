import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogTitle, Grid, Typography, Fab, Button } from "@material-ui/core"
import { Publish } from "@material-ui/icons"
import { withStyles } from '@material-ui/core/styles';
import styles from '../styles'
import readFile from '../tools/readFile';
import { createTransationFromEBookData, supportedExtensions } from '../tools/ebook';
import { arweaveInstance, viewTransactionBaseUrl } from '../tools/arweaveUtils'
import LoadingSpinner from './LoadingSpinner'


class Upload extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            needsConfirmation: false,
            transaction: null,
            fee: null,
            docInfo: null,
            successfulTransaction: false
        }
    }

    
    loadeBook = async(event) => {
        const { userArweaveWallet } = this.props
        if (!userArweaveWallet) {
            alert('Wallet must have been loaded')
            return
        }
        
        this.setState({
            isLoading: true
        })
        const { file, name } = await readFile(event.target.files[0])
        createTransationFromEBookData(name, file, userArweaveWallet).then(({transaction, fee, metadata}) => {
            this.setState({
                needsConfirmation: true,
                transaction: transaction,
                fee: fee,
                docInfo: metadata,
                isLoading: false
            })
        }, (errorReason) => {
            this.setState({
                isLoading: false
            })
            alert(`Error while trying to upload file: ${errorReason}`)
            console.error(`Error while creating transaction from ebook: ${errorReason}`)
        });
    }

    resetState = () => {
        this.setState({
            needsConfirmation: false,
            transaction: null,
            fee: null,
            docInfo: null,
            isLoading: false,
            successfulTransaction: false
        })
    }

    confirmTransaction = async() => {
        const { transaction } = this.state
        const { userArweaveWallet } = this.props

        this.setState({
            needsConfirmation: false
        })

        if (!userArweaveWallet) {
            alert("Wallet is not available. Unable to sign transaction.")
            return
        }
        try {
            await arweaveInstance.transactions.sign(transaction, userArweaveWallet)
            const response = await arweaveInstance.transactions.post(transaction)

            if (response.status === 200) {
                this.setState({
                    successfulTransaction: true
                })
            } else {
                alert(`Transaction '${transaction.get('id')}' has failed with status ${response.status}.`)
            }
        } catch (reasonError) {
            alert(`Error while posting transaction. Details: ${reasonError}`)
            console.error(reasonError)
        }
    }


    render() {
        const { needsConfirmation, docInfo, transaction, fee, successfulTransaction, isLoading } = this.state
        const { userArweaveWallet, classes } = this.props
        const transactionId = (transaction) ? transaction.get('id') : null
        return(
            <Grid container direction="column"  alignContent="center" >
                <LoadingSpinner enabled={isLoading}></LoadingSpinner>
                {successfulTransaction && transactionId &&
                    <Dialog open={successfulTransaction} onClose={ () => { this.setState({successfulTransaction: false})}}>
                    <DialogTitle id="simple-dialog-title">Successful transaction</DialogTitle>
                    <DialogContent>
                        <Typography>Your upload may take several minutes to become available.</Typography>
                        <Typography>Status available on <a href={viewTransactionBaseUrl+transactionId}>{transactionId}</a></Typography>
                    </DialogContent>
                    </Dialog>
                }
                {docInfo &&
                    <Dialog open={needsConfirmation}>
                    <DialogContent>
                    <Grid container className={classes.main} justify="center" direction="column" alignContent="center">
                        <Typography variant="h6" align="center">Please Verify Transaction</Typography>
                        <Typography align="left">AR Fee: {fee}</Typography>
                            <Typography align="left">Title: {docInfo.title}</Typography>
                            <Typography align="left">Author: {docInfo.author}</Typography>
                            <Typography align="left">ISBN: {docInfo.isbn}</Typography>
                            <Button style={{ margin: 10 }} onClick={this.confirmTransaction} variant="contained" color="primary">Confirm</Button>
                            <Button style={{ margin: 10 }} onClick={this.resetState} variant="contained" color="secondary">Cancel</Button>
                    </Grid>
                    </DialogContent>
                    </Dialog>
                }
                <input  ref="ebookUploader" type="file" onChange={ e => this.loadeBook(e)} accept={supportedExtensions} className={classes.hidden} />
                <Fab className={classes.buttonLoad} onClick={() => this.refs.ebookUploader.click()} variant="extended" disabled={!userArweaveWallet}>
                    <Typography>Upload EPUB</Typography>
                    <Publish style={{ marginLeft: 3 }} />
                </Fab>
            </Grid>
        )
    }
}

Upload.propTypes = {
    userArweaveWallet: PropTypes.object
};

export default withStyles(styles)(Upload);