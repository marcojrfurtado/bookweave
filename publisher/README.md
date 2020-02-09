# Publisher 

Python library that allows you to publish e-book collections into the permaweb.

## Install

### Windows

Download bsddb3 from https://download.lfd.uci.edu, and install it with Pip.
Example, for Python 3.7 on x86_amd64 architecture:

```shell script
curl https://download.lfd.uci.edu/pythonlibs/q4hpdf1k/bsddb3-6.2.6-cp37-cp37m-win_amd64.whl --output bsddb3-6.2.6-cp37-cp37m-win_amd64.whl
pip install bsddb3-6.2.6-cp37-cp37m-win_amd64.whl
```

Then install the rest of requirements
```
vcvarsall.bat x86_amd64
set CL=-FI"%VCINSTALLDIR%\INCLUDE\stdint.h"
pip install -r requirements.txt
```

If `stdint.h` is not found under `%VCINSTALLDIR%\INCLUDE\`, replace it with the proper directory. It is
required to install the package `pycripto` in Windows.

## Publishing

### Your own collection

If you wish to create your own custom Collection, please follow the example for Gutenberg books. 
Every collection may have their own distinct set of metadata tags, which are obtained differently.

In short, a collection is created, signed and sent as follows:
```python
wallet = WalletWithTxAnchor('../wallet.json')
collection = Collection(wallet=wallet, name='my-book-collection', metadata_tags=['title','author','isbn'])
collection.sign()
collection.send()
```

And then books can be published as
```python
book =  Book(epub_uri='http://my-host/book.epub', wallet=wallet, collection=collection, block_number=0)
book.sign()
book.send()
```

### Gutenberg books

This subsection contains the necessary steps to publish Gutenberg books into the permaweb.

(1) Loading the Gutenberg metadata information locally. Mandatory step.

```shell script
python publish_gutenberg.py -P
```

(2) Registering a new collection

```shell script
python publish_gutenberg.py -R -W <path to AR wallet> -C <name of your collection>
```

(3) Publishing books into this new collection. 
Important: Wait for collection to be confirmed before performing this step. It may take a few minutes

```shell script
python publish_gutenberg.py -W <path to AR wallet> -C <name of your collection>
```

Important: If you need to re-run (3), wait a couple of minutes before. 
This should give enough time for previous transactions to be confirmed.

