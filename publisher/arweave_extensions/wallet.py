from arweave.arweave_lib import Wallet
import requests


class WalletWithTxAnchor(Wallet):
    """
    Extension for the arweave_lib.Wallet, which uses a better transaction anchor. The one used in the
    original wallet does not work when trying to send multiple transactions sequentially.
    """

    def get_last_transaction_id(self):
        url = "{}/tx_anchor".format(self.api_url)

        response = requests.get(url)

        if response.status_code == 200:
            self.last_tx = response.text

        return self.last_tx