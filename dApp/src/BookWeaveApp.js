import React from 'react'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import GitHubIcon from '@material-ui/icons/GitHub'


import styles from './styles'
import CollectionTable from './components/CollectionTable'
import { ArAppName, ArAppVersion } from './constants'

class BookWeaveApp extends React.Component {

  render() {
    const { classes } = this.props
    return(
      <div className={classes.mainDiv}>
        <CollectionTable/>
        <div className={classes.logoHolder}>
          <Typography className={`${classes.logo} ${classes.logoName}`}>{ArAppName}</Typography>
          <Typography className={`${classes.logo} ${classes.logoVersion}`}>v{ArAppVersion}</Typography>
          <div className={classes.logo}>
            <a href="//github.com/marcojrfurtado/bookweave"><GitHubIcon></GitHubIcon></a>
          </div>
        </div>
      </div>
    )
  }
}

export default withStyles(styles, { withTheme: true })(BookWeaveApp)