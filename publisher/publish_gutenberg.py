import argparse
from gutenberg.acquire import get_metadata_cache
from gutenberg.query import list_supported_metadatas, get_metadata
from entities import Book, Collection
from entities.book import TAG_BLOCK
from arweave_extensions import WalletWithTxAnchor
from graphql.query import find_collection_ids, find_books_from_collection
from typing import List, Tuple
import warnings, logging
from unidecode import unidecode

logger = logging.getLogger("arweave.arweave_lib").setLevel(logging.WARNING)

METADATA_ARGS=list_supported_metadatas()
TAG_TEXTNO="textno"


def populate_cache():
    """
    Loads Gutenberg metadata information into your machine. Mandatory step before publishing.
    """
    cache = get_metadata_cache()
    cache.populate()


def _is_public_domain(id: str) -> bool:
    rights = ",".join(get_metadata('rights', id))
    if rights.find('Public domain') < 0:
        warnings.warn("Textno '%d' has rights '%s'" % (id, rights))
        return False
    return True


def _get_textno_set(preexisting_books: dict) -> frozenset:
    textno_entries = []
    for preexisting_book in preexisting_books:
        for tag_dict in preexisting_book['tags']:
            if tag_dict['name'] == TAG_TEXTNO:
                textno_entries.append(int(tag_dict['value']))
    return frozenset(textno_entries)


def _get_block_information(preexisting_books: dict) -> Tuple[int, int]:
    books_per_block = {}
    top_block = 0
    for preexisting_book in preexisting_books:
        for tag_dict in preexisting_book['tags']:
            if tag_dict['name'] == TAG_BLOCK:
                block_number = int(tag_dict['value'])
                books_per_block[block_number] = 0 \
                    if block_number not in books_per_block \
                    else (books_per_block[block_number]+1)
                top_block = max(block_number, top_block)
    top_block_books = 0 if top_block not in books_per_block else books_per_block[top_block]
    return top_block, top_block_books

def publish_ebooks(wallet: WalletWithTxAnchor, collection: Collection, publish_n_books: int =1,
                   max_books_per_block: int = 150, skip_to_textno: int = 1):
    """
    Publishes Gutenberg books for a certain Collection
    :param wallet: Arweave wallet, used for signing and sending transactions
    :param collection: Collection already existing in the permaweb. Books will be linked to it.
    :param publish_n_books: Number of Gutenberg books to be published. Will skip those that have already been persisted.
    :param max_books_per_block: Maximum number of books per block. Please check the README for further reference on what
                                a block represents.
    :param skip_to_textno: Starts publishing Gutenberg books from a specific id
    :raises Exception: If collection had not been signed, or sent
    """
    if not collection.is_signed or not collection.is_sent:
        raise Exception('Collection must already exist in the permaweb before you can publish')

    preexisting_books = find_books_from_collection(collection.trusted_sources, collection.id)
    preexisting_textnos = _get_textno_set(preexisting_books)
    top_block, books_top_block = _get_block_information(preexisting_books)

    published_amount=0
    cur_id = skip_to_textno - 1
    while published_amount < publish_n_books:
        cur_id += 1
        if cur_id in preexisting_textnos:
            warnings.warn("Book '%d' already published for this collection. Skipping" % cur_id)
            continue
        if not _is_public_domain(cur_id):
            continue

        if books_top_block > max_books_per_block:
            top_block += 1
            books_top_block = 0

        try:
            epub_uri = next(uri for uri in get_metadata('formaturi', cur_id) if uri.endswith("epub.noimages"))
        except StopIteration:
            warnings.warn("Could not find epub for textno '%d'" % cur_id)
            continue

        ebook = Book(epub_uri=epub_uri, wallet=wallet, collection=collection, block_number=top_block)
        ebook.add_extra_tag(TAG_TEXTNO, str(cur_id))
        for label in METADATA_ARGS:
            metadata = get_metadata(label, cur_id)
            decoded_metadata = frozenset([unidecode(metadata_field) for metadata_field in metadata])
            ebook.add_metadata_tag(label, decoded_metadata)
        print("... ready to publish textno '%d' (in block '%d')" % (cur_id, top_block))

        try:
            ebook.sign()
            ebook.send()
        except UnicodeEncodeError as e:
            warnings.warn("Encoding exception while trying to send texto '%d', skipping. Details: '%s'" % (cur_id, str(e)))
            warnings.warn(" Book metadata details: '%s'" % str(ebook.metadata))
            continue

        published_amount += 1
        books_top_block += 1
    print('Done publishing %d books' % published_amount)


def register_collection(wallet: WalletWithTxAnchor, collection_name: str, additional_trusted_sources: List[str] = []):
    """
    Signs and sends a brand new Collection representing a Gutenberg book collection
    :param wallet: Arweave wallet, for signing and sending the collection. Costs will incur.
    :param collection_name: Name of the new collection
    :param additional_trusted_sources: You may optionally provide the addresses of any other wallet that can publish
                                        books into this collection
    """

    collection = Collection(wallet=wallet, name=collection_name, metadata_tags=METADATA_ARGS)
    for trusted_source in additional_trusted_sources:
        collection.add_trusted_source(trusted_source)
    collection.sign()
    collection.send()
    print('Collection has been published')


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-P", "--populate", help="Populate metadata cache", action="store_true")
    parser.add_argument("-R", "--register_collection", help="Register a new collection", action="store_true")
    parser.add_argument("-W", "--wallet_path", help="Path to wallet to be used for publishing", type=str, default=None)
    parser.add_argument("-C", "--collection_name", help="Name of the collection these books will belong to", type=str,
                        default=None)
    parser.add_argument("-T", "--trustedSources", help="Comma-separated list of additional addresses to be "
                                                       "trusted sources", type=str, default="")
    parser.add_argument("-N", "--n_books", help="Number of books to be published", type=int, default=1)
    parser.add_argument("-B", "--books_per_block", help="Number of books inside each block", type=int, default=150)
    parser.add_argument("-S", "--skip_to_textno", help="Starts publishing Gutenberg books from a certain id",
                        type=int, default=1)

    args = parser.parse_args()

    if args.populate:
        print('Populating Gutenberg metadata cache...')
        populate_cache()
    else:
        if args.wallet_path is None:
            raise Exception("A valid wallet is need for publishing ebooks or registering collections. "
                            "Provide it with -W.")
        if args.collection_name is None:
            raise Exception("A collection must be provided for publishing ebooks or registering collections. "
                            "Provide it with -C")

        wallet = WalletWithTxAnchor(args.wallet_path)
        collection_ids = find_collection_ids(wallet.address, args.collection_name)
        if args.register_collection:
            if len(collection_ids) > 0:
                raise Exception(" A collection with owner '%s' and name '%s' already exists" %
                                (wallet.address, args.collection_name))
            print('Registering collection...')
            register_collection(wallet, args.collection_name,
                                additional_trusted_sources=args.trustedSources.split(","))
        else:
            if len(collection_ids) == 0:
                raise Exception("No collection has been found with owner '%s' and name '%s'" %
                                (wallet.address, args.collection))
            if len(collection_ids) > 1:
                raise Exception("More than 1 collection found with the same name. Need to be able to specify a single "
                                "one.")
            publish_collection = Collection(transaction_id=collection_ids[0]['id'])
            print('Publishing ebooks...')
            publish_ebooks(wallet, publish_collection, publish_n_books=args.n_books,
                           max_books_per_block=args.books_per_block, skip_to_textno=args.skip_to_textno)

