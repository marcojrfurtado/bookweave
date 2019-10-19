import React from 'react'
import {
    Button,
    Grid,
    Paper,
    IconButton,
    Input,
    InputAdornment} from '@material-ui/core'
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab'
import { SearchSharp , Shuffle} from "@material-ui/icons"
import styles from '../styles'
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

class SearchBar extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            searchType: "searchAuthor",
            searchValue: ""
        };
    }

    onSearchTypeChange = (event, type) => {
        this.setState({
          searchType: type
        })
    }
  
    onSearchValueChange = (event) => {
        this.setState({
          searchValue: event.target.value
        })
    }

    render() {
        const { searchType, searchValue } = this.state
        const { classes, runSearch, randomizeDocs } = this.props
        return (
            <Paper className={classes.enclosingSearchPaper}>
              <Grid container direction="column" spacing={3} alignItems="center">
                <Grid item>
                  <ToggleButtonGroup exclusive onChange={this.onSearchTypeChange} value={this.state.searchType}>
                    <ToggleButton value="searchAuthor">Author</ToggleButton>
                    <ToggleButton value="searchTitle">Title</ToggleButton>
                    <ToggleButton value="isbn">ISBN</ToggleButton>
                  </ToggleButtonGroup>
                  <Button onClick={randomizeDocs}>
                    <Shuffle></Shuffle>
                  </Button>
                </Grid>
                <Grid item>
                  <Input
                    type='text'
                    onChange={this.onSearchValueChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={ () => { runSearch(searchType, searchValue)}}
                        >
                          <SearchSharp />
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
        )
    }
}

SearchBar.propTypes = {
    runSearch: PropTypes.func.isRequired,
    randomizeDocs: PropTypes.func.isRequired
};

export default withStyles(styles)(SearchBar);