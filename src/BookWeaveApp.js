import React from 'react'
import { Grid, Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import GitHubIcon from '@material-ui/icons/GitHub'


import styles from './styles'
import Wallet from './components/Wallet'
import Upload from './components/Upload'
import Search from './components/Search'
import { ArAppName, ArAppVersion } from './constants'

class BookWeaveApp extends React.Component {

  constructor(props){
    super(props)
    this.state = {
        userArweaveWallet: null
    }
  }

  handleUpdateWalletAddress = (newUserArweaveWallet) => {
    this.setState({
      userArweaveWallet: newUserArweaveWallet
    });
  };

  render() {
    const { classes } = this.props
    const { userArweaveWallet } = this.state
    return(
      <Grid container className={classes.mainDiv}>
        <Grid container className={classes.box} justify="center" alignContent="center" direction="column">
          <Grid container alignItems="center" justify="center">
            <Typography className={classes.logo}>{ArAppName} v{ArAppVersion}</Typography>
          </Grid>
          <Grid container spacing={4} justify="center" direction="row">
            <Grid item>
              <Wallet updateAddress={this.handleUpdateWalletAddress}></Wallet>
            </Grid>
            <Grid item>
              <Upload userArweaveWallet={userArweaveWallet}></Upload>
            </Grid>
          </Grid>
          <Search></Search>
          <Grid container alignItems="center" justify="center">
            <Typography variant="caption" display="block">
              Note: Please ensure you have legal rights to upload any file to the permaweb before proceeding.
            </Typography>
          </Grid>
        </Grid>
        <Grid item className={classes.repoInformation}>
          <GitHubIcon></GitHubIcon> 
          <a href="//github.com/marcojrfurtado/bookweave">marcojrfurtado/bookweave</a>
        </Grid>
      </Grid>
    )
  }
}

export default withStyles(styles, { withTheme: true })(BookWeaveApp)