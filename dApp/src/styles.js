const styles = theme => ({
    mainDiv: {
      backgroundColor: '#dedede',
      width: '100%',
      height: '100%',
      margin: 0
    },
    tableRoot: {
      'margin-top': 10,
      'margin-bottom': 10,
      'margin-left': 10,
      'max-width': '96%'
    },
    logoHolder: {
      position: "fixed",
      width: 30,
      bottom: theme.spacing(1.5),
      right: theme.spacing(0.5)
    },
    logo: {
      left: '50%',
      top: '50%',
      margin: '0 auto',
      fontSize: 24,
      width: '30px',
      fontFamily: "Impact"
    },
    logoName: {
      fontSize: 24,
      'writing-mode': 'vertical-rl',
      'text-orientation': 'upright'
    },
    logoVersion: {
      fontSize: 16
    }
  })
  
  export default styles