from __future__ import annotations
from entities.entity import Entity
from arweave.arweave_lib import Wallet
from graphql.query import get_tag_value_from_query
from typing import List

TAG_EXTENDS = "extends"
TAG_TRUSTED_SOURCES = "trustedSources"
TAG_NAME = "name"
TAG_METADATA_TAGS = "metadataTags"


class Collection(Entity):

    def __init__(self, wallet: Wallet = None, name: str = None, metadata_tags: List[str] = [], **kwargs):
        """
        Either creates a new Collection, or loads one from the permaweb.
        :param wallet: Arweave wallet. Used not only for signing and sending the transaction, but its address
                       is also automatically used as a trusted source for this collection.
        :param name: Name of this collection
        :param metadata_tags: Metadata tags to be included in Books of this collection.
        :param kwargs: Entity arguments
        """
        self._trusted_sources = []
        self._metadata_tags = metadata_tags
        self._name = name
        super().__init__(wallet=wallet, **kwargs)
        if not self.is_signed:
            if wallet is not None:
                self.add_trusted_source(wallet.address)
            self._transaction.add_tag(TAG_NAME, self._name)

    def extend(self, extended_collection: Collection):
        """
        Indicate that this collection is extending another one. Future use only, currently not supported by the dApp.
        :param extended_collection: Already existing original collection
        """
        self._transaction.add_tag(TAG_EXTENDS, extended_collection.id)

    @property
    def type(self) -> str:
        return "Collection"

    @property
    def name(self) -> str:
        return self._name

    @property
    def trusted_sources(self) -> List[str]:
        return self._trusted_sources

    @property
    def metadata_tags(self) -> List[str]:
        return self._metadata_tags

    def add_trusted_source(self, trusted_address: str):
        """
        Add another wallet address to the list of trusted sources for this collection. Address is not validated.
        :param trusted_address: String containing the address of another wallet.
        """
        self._trusted_sources.append(trusted_address)

    def sign(self):
        self._transaction.add_tag(TAG_TRUSTED_SOURCES, self._tag_separator.join(self._trusted_sources))
        self._transaction.add_tag(TAG_METADATA_TAGS, self._tag_separator.join(self._metadata_tags))
        super().sign()

    def load_from_existing_transaction(self, transaction_id: str) -> dict:
        result = super().load_from_existing_transaction(transaction_id)
        self._name = get_tag_value_from_query(result, TAG_NAME)
        transaction_trusted_sources = get_tag_value_from_query(result, TAG_TRUSTED_SOURCES)
        if transaction_trusted_sources is not None:
            self._trusted_sources = transaction_trusted_sources.split(self._tag_separator)
        transaction_metadata_tags = get_tag_value_from_query(result, TAG_METADATA_TAGS)
        if transaction_metadata_tags is not None:
            self._metadata_tags = transaction_metadata_tags.split(self._tag_separator)
        return result
