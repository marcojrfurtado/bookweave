const styles = theme => ({
    mainDiv: {
      backgroundColor: '#dedede',
      minHeight: '100vh',
      width: '100%',
      paddingLeft: 10,
      paddingRight: 10,
    },
    box: {
      backgroundColor: 'transparent',
      margin: 'auto',
      maxWidth: '800px',
      borderRadius: '20px',
    },
    logo: {
      maxWidth: 400,
      "margin-bottom": 20,
      fontSize: 48,
      fontFamily: "Impact",
    },
    hidden: {
      display: 'none'
    },
    enclosingSearchPaper: {
      'margin-left': 'auto',
      'margin-right': 'auto',
      'margin-top': 20,
      'margin-bottom': 10,
      padding: 15,
      width: '50%'
    },
    enclosingTablePaper: {
      margin:15,
      width: '90%'
    },
    tableRow: {
      display: 'table-row',
      height: 'auto',
      marginTop: 5,
      border: 0,
    },
    tableDataCell: {
      color: 'grey'
    },
    downloadLink: {
      cursor: 'pointer'
    },
    walletInfo: {
      maxWidth: 250
    },
    repoInformation: {
      margin: theme.spacing(1),
      position: "fixed",
      bottom: theme.spacing(2),
      right: theme.spacing(3),
      display: "flex",
      "align-items": "center",
    }
  })
  
  export default styles