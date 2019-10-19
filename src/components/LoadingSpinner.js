import React from 'react'
import {
    CircularProgress,
    Dialog
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const styles = theme => ({
    root: {
        backgroundColor: "rgba(166, 166, 166, 0.5)"
    },
    paper: {
        backgroundColor: "transparent",
        boxShadow: "none",
        overflow: "hidden"
    },
})

class LoadingSpinner extends React.Component {

    render() {
        const { enabled, classes } = this.props
        return (
            <Dialog 
              open={!!enabled}  
              BackdropProps={{
                classes: {
                  root: classes.root
                }
              }}
              PaperProps ={{
                classes: {
                 root: classes.paper
                }
              }}>
                <CircularProgress size={100}/>
            </Dialog>
        )
    }
}

LoadingSpinner.propTypes = {
    enabled: PropTypes.bool
};

export default withStyles(styles)(LoadingSpinner);