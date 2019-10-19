import Arweave from 'arweave/web'

const viewTransactionBaseUrl = "https://viewblock.io/arweave/tx/";

const arweaveInstance = Arweave.init({
    host: 'arweave.net',
    port: 80,           
    protocol: 'https',
    timeout: 90000,
    logging: false,
})

function readArweaveWallet(wallet){
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => {
        reader.abort()
        reject()
        }
        reader.onload = () => {
            resolve(reader.result)
        }
        reader.readAsText(wallet)
    })
}


export{
    arweaveInstance,
    readArweaveWallet,
    viewTransactionBaseUrl
}