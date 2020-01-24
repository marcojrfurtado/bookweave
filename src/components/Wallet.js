import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Typography, Fab } from '@material-ui/core'
import { AccountBalanceWallet } from "@material-ui/icons"
import styles from '../styles'
import { arweaveInstance, readArweaveWallet } from '../tools/arweaveUtils'

class Wallet extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            userArweaveWallet: null,
            userArweaveBalance: null,
            userArweaveWinston: null,
            userArweaveAddress: null
        }
    }

    loadInitialData = async (e) => {
        try{
            const walletString = await readArweaveWallet(e.target.files[0])
            const walletObject = await JSON.parse(walletString)
            const address = await arweaveInstance.wallets.jwkToAddress(walletObject)
            const winston =  await arweaveInstance.wallets.getBalance(address)
            const balance = await arweaveInstance.ar.winstonToAr(winston)
            this.setState({
                userArweaveWallet: walletObject,
                userArweaveBalance: balance,
                userArweaveWinston: winston,
                userArweaveAddress: address,
            })
            this.props.updateAddress(walletObject);
        }catch(error){
            console.error(error)
            this.setState({
                userArweaveWallet: null,
                userArweaveBalance: null,
                userArweaveWinston: null,
                userArweaveAddress: null,
            })
            this.props.updateAddress(null)
            alert('Invalid Wallet File')            
        }
    }

    render() {
        const { classes } = this.props
        const { userArweaveAddress, userArweaveBalance } = this.state
        return(
            <Grid container direction="column"  alignContent="center" >
                <input  ref="walletUploader" type="file" accept=".json" onChange={ e => this.loadInitialData(e)} className={classes.hidden} />
                <Fab className={classes.buttonLoad} onClick={() => this.refs.walletUploader.click()} variant="extended">
                    {!(userArweaveAddress && userArweaveBalance) ? (
                        <Typography>Load Wallet</Typography>
                    ) : (
                        <Grid container direction="column" alignContent="center" justify="center">
                            <Typography noWrap className={classes.walletInfo}>Address: {userArweaveAddress}</Typography>
                            <Typography noWrap className={classes.walletInfo}>Balance: {userArweaveBalance}</Typography>
                        </Grid>
                    )}
                    <AccountBalanceWallet style={{ marginLeft: 3 }} />
                </Fab>
            </Grid>
        )
    }
}

Wallet.propTypes = {
    updateAddress: PropTypes.func.isRequired
};

export default withStyles(styles)(Wallet);