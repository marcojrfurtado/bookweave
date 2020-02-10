# bookweave

Share and search eBook collections on the Permaweb.

## Live

Latest version will always be redirected by https://marcojrfurtado.github.io/bookweave/latest.html

### History

~~v1.0: https://arweave.net/8y1OFPvwFFdcEvjmigDyePNiIsDEDj-0nqDAwK_i53M~~

v1.1: https://3d7uax4e6cu3.arweave.net/ZgPa5skBl12mmaOFMDDTTakgI3D_tj29cSmZClpLjWU

Note: v1.1 points to an "unofficial mirror" of the Gutenberg collection, containing a subset of their books.

## Subprojects

* `publisher`: Python package allowing users to publish their own book collections into the permaweb;

* `dApp`: React app containing a basic eBook Collection view;

## Publishing your own eBook collection?

Please refer to [publisher/README.md](publisher/README.md) for more details.

## Running dApp locally?

Please refer to [dApp/README.md](dApp/README.md) for more details.

## Schema

Bookweave relies on a special transaction schema. We call each transaction used by bookweave an Entity, which has two subtypes: Collection and Book. A Collection is comprised of multiple Books, and Books themselves point to a single Collection. Following is a more detailed description of their properties:


* Entity (abstract)
    * Properties (represented by transaction tags)
        * `sep`: Represents a tag value delimiter.
        Every tag value is represented as a string.
        We use this delimiter expression to encode/decode arrays as transaction values;
        * `entity`: Entity type, either "book" or "collection";

* Collection (concrete, extends Entity)
    * Properties (represented by transaction tags):
        * `metadataTags` : A `sep`-separated array containing the metadata tags to be used by this collection (e.g. title, author, subject, etc.);
        * `name`: Name for this collection;
        * `trustedSources`: A `sep`-separated array containing address of wallets trusted to publish books for this collection. In general, it will contain the address of the wallet that published the collection itself, but it is not mandatory;
        * `extends`: (future-use) Points to a transaction of another collection. It indicates that this collection is extending a previous one. Not currently supported by the dApp;
    * Data: None required
* Book (concrete, extends Entity)
    * Properties (represented by transaction tags):
        * `belongs`: Contains the transaction id of the parent collection. Important: This means that the Collection must be persisted before any associated Book;
        * `block`: Contains an integer ranging from `0..N`, `N` being arbitraly defined.
        Used for optimizing the query of large collections. By separating large collections into smaller chunks, we can display a partial collection to the user, while loading the rest asynchronously;
        * `Content-Type`: Media type. At the moment, it is always set to be `application/epub+zip`, because it assumes all eBooks to be ePub;
        * All tags mentioned by property `metadataTags` from the parent collection;
    * Data: ePub binary

The properties listed here are the minimum set of tags expected. You may obviously add any arbitrary set of tags deemed necessary. Please refer to [publisher/publish_gutenberg.py](publisher/publish_gutenberg.py) for an example.
