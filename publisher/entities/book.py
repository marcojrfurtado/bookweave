from entities.entity import Entity
from entities.collection import Collection
from graphql.query import get_tag_value_from_query
import requests

TAG_BELONGS = "belongs"
TAG_BLOCK = "block"
TAG_CONTENT_TYPE = "Content-Type"
EPUB_CONTENT_TYPE = "application/epub+zip"

class Book(Entity):

    def __init__(self, epub_uri: str, collection: Collection = None, block_number: int = 0, **kwargs):
        self._belongs_to = collection
        self._metadata = {}
        self._block_number = block_number
        super().__init__(transaction_data=self._fetch_epub_data(epub_uri), **kwargs)
        if not self.is_signed:
            if self._transaction is None or collection is None:
                raise Exception("Book must be instantiated with either a valid Wallet, and Collection,"
                                " or an existing transaction id.")
            self._transaction.add_tag(TAG_BLOCK, str(self._block_number))
            self._transaction.add_tag(TAG_BELONGS, str(collection.id))
            self._transaction.add_tag(TAG_CONTENT_TYPE, EPUB_CONTENT_TYPE)
            if self._belongs_to is not None:
                for metatada_tag in self._belongs_to.metadata_tags:
                    self._metadata[metatada_tag] = None

    @property
    def type(self) -> str:
        return "Book"

    @property
    def metadata(self) -> dict:
        return self._metadata

    @property
    def block_number(self) -> int:
        return self._block_number

    def add_metadata_tag(self, tag_name: str, tag_value):
        if tag_name not in self._metadata.keys():
            raise Exception('Unrecognized tag %s' % tag_name)

        if isinstance(tag_value, str):
            self._metadata[tag_name] = tag_value
        else:
            try:
                self._metadata[tag_name] = self._tag_separator.join(tag_value)
            except TypeError:
                self._metadata[tag_name] = tag_value

    def load_from_existing_transaction(self, transaction_id: str) -> dict:
        result = super().load_from_existing_transaction(transaction_id)
        self._block_number = get_tag_value_from_query(result, TAG_BLOCK)
        belongs_to_tx = get_tag_value_from_query(result, TAG_BELONGS)
        if belongs_to_tx is not None:
            if self._belongs_to is None or self._belongs_to.id != belongs_to_tx:
                self._belongs_to = Collection(transaction_id=belongs_to_tx)
        for metadata_tag in self._belongs_to.metadata_tags:
            self._metadata[metadata_tag] = get_tag_value_from_query(result, metadata_tag)
        return result

    def sign(self):
        for k, v in self._metadata.items():
            if v is None:
                raise Exception("Cannot sign Book transaction before filling all metadata tags. Missing '%s'" % k)
            self._transaction.add_tag(k, str(v))
        super().sign()

    def _fetch_epub_data(self, epub_uri: str) -> str:
        response = requests.get(epub_uri)
        if response.status_code != 200:
            raise Exception("Failed to fetch epub from '%s'. Status: '%d'" % (epub_uri, response.status_code))
        return response.content


