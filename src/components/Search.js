import React, { Fragment } from 'react'
import {
    Grid,
    Paper,
    Typography, 
    Table, 
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TablePagination } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
import styles from '../styles'
import { getAllDocs, queryDocs } from '../tools/ebook'
import { arweaveDataHostUrl, viewTransactionBaseUrl } from '../tools/arweaveUtils'
import { createSearchPattern } from '../tools/stringUtils'
import LoadingSpinner from './LoadingSpinner'
import SearchBar from './SearchBar'


class Search extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            page: 0,
            rowsPerPage: 5,
            data: null,
            isLoading: false
        };
    }

    randomizeDocs = async() => {
      this.setState({
        isLoading: true
      })
      try {
        const data = await getAllDocs()
        this.setState({
          data :  data,
          isLoading : false
        })
      } catch(error) {
        console.error(error)
        this.setState({
          data :  null,
          isLoading : false
        })
      }
    }

    handleChangePage = (event, page) => {
      this.setState({ page });
    }

    handleChangeRowsPerPage = (event) => {
      this.setState({ rowsPerPage: event.target.value });
    };

    runSearch = async(searchType, searchValue) => {
      this.setState({
        isLoading : true
      })
      try {
        const data = await queryDocs(searchType, createSearchPattern(searchValue))
        this.setState({
          data :  data,
          isLoading : false
        })
      } catch(error) {
        console.error(error)
        this.setState({
          data :  null,
          isLoading : false
        }) 
      }
    }

    render(){
        const { data, rowsPerPage, page, isLoading } = this.state
        const { classes } = this.props
        return(
          <Grid className={classes.searchRoot}>
            <LoadingSpinner enabled={isLoading}></LoadingSpinner>
            <SearchBar randomizeDocs={this.randomizeDocs} runSearch={this.runSearch}></SearchBar>
            <Paper className={classes.enclosingTablePaper}>
              <Table className={classes.table} aria-labelledby="tableTitle">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>ISBN</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Download</TableCell>
                    <TableCell>Transaction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data && data
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((n, index) => (
                        <TableRow
                          hover
                          role="checkbox"
                          key={n.transaction_id}
                          tabIndex={-1}
                          classes={{
                            root: classes.tableRow
                          }}
                        >
                          <Fragment>
                            <TableCell datatitle="Title" className={classes.tableDataCell}>
                              <Typography>{n.title}</Typography>
                            </TableCell>
                            <TableCell datatitle="Author" className={classes.tableDataCell}>
                              <Typography>{n.author}</Typography>
                            </TableCell>
                            <TableCell datatitle="ISBN" className={classes.tableDataCell}>
                              <Typography>{n.isbn}</Typography>
                            </TableCell>
                            <TableCell datatitle="Size" className={classes.tableDataCell}>
                              <Typography>{((n.sizeBytes)/(1024*1024)).toFixed(2)} MB</Typography>
                            </TableCell>
                            <TableCell datatitle="Download" className={classes.downloadLink}>
                              <a href={arweaveDataHostUrl+n.transaction_id+"."+n.fileType}>Link</a>
                            </TableCell>
                            <TableCell datatitle="Transaction" className={classes.tableDataCell}>
                              <a href={viewTransactionBaseUrl+n.transaction_id}>
                                  <Typography>ViewBlock</Typography>
                              </a>
                            </TableCell>
                          </Fragment>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>

              <TablePagination
              className={classes.actions}
              component="div"
              count={(data) ? data.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              rowsPerPageOptions={[]}
              labelRowsPerPage=""
              backIconButtonProps={{}}
              nextIconButtonProps={{
                'aria-label': 'Next Page'
              }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      )
    }
}

export default withStyles(styles)(Search);