from abc import ABC, abstractmethod
from arweave.arweave_lib import Wallet, Transaction
from graphql.query import query_tx, get_tag_value_from_query

TAG_ENTITY = "entity"
TAG_SEPARATOR = "sep"

DEFAULT_TAG_SEPARATOR = "\t"


class Entity(ABC):
    """Arweave Transaction representing a certain Bookweave object"""

    def __init__(self, wallet: Wallet = None, transaction_id: str = None, transaction_data: str = '',
                 tag_separator: str = DEFAULT_TAG_SEPARATOR):
        """
        Either creates a new non-signed entity, or loads one from the permaweb.
        :param wallet: Arweave wallet, used for signing and sending the transaction
        :param transaction_id: If provided, will try to load the entity from an existing transaction
        :param transaction_data: Data to be stored as a transaction. Its size is constrained by the permaweb.
        :param tag_separator: Tag values are strings. We use this separator to represent arrays as values. Tab is the
                              default.
        """
        self._is_signed = False
        self._is_sent = False
        self._transaction_id = None
        self._transaction = None
        self._tag_separator = tag_separator
        if wallet is not None:
            self._create_non_persisted_entity(wallet, transaction_data)
        elif transaction_id is not None:
            self.load_from_existing_transaction(transaction_id)

    def load_from_existing_transaction(self, transaction_id: str) -> dict:
        """
        Load an entity that already exists in the permaweb
        :param transaction_id: Id of the transaction
        :return: A dictionary containing the original transaction information
        :except Throws if the transaction does not represent this entity type
        """
        result = query_tx(transaction_id)
        self._transaction_id = transaction_id
        self._is_signed = True
        self._is_sent = True
        transaction_type = get_tag_value_from_query(result, TAG_ENTITY)
        if transaction_type != self.type:
            raise Exception("Transaction '%s' does not correspond to '%s' (found '%s')" % (transaction_id, self.type,
                                                                                           transaction_type))
        self._tag_separator = get_tag_value_from_query(result, TAG_SEPARATOR)
        return result

    @property
    @abstractmethod
    def type(self) -> str:
        """A string indicating the type of entity this is."""

    @property
    def id(self):
        # Will fail if transaction is called before being signed
        return self._transaction_id if self._transaction is None else self._transaction.id

    @property
    def is_signed(self):
        return self._is_signed

    @property
    def is_sent(self):
        return self._is_sent

    @property
    def tag_separator(self):
        return self._tag_separator

    def add_extra_tag(self, tag_name: str, tag_value: str):
        """Add an arbitraty tag to this entity"""
        if self._is_signed or self._transaction is None:
            raise Exception("Cannot add tag to signed transaction, or if transaction does not exist anymore.")
        self._transaction.add_tag(tag_name, tag_value)

    def sign(self):
        """Sign a the transaction representing this entity. May be signed at most once."""
        if self._is_signed:
            raise Exception("Transaction for this entity has already been signed.")
        self._transaction.sign()
        self._is_signed = True

    def send(self):
        """
        Tries to persist entity to the permaweb. I will incur into costs.
        """
        if self._is_signed is False:
            raise Exception("Cannot send non-signed entity")
        if self._is_sent:
            raise Exception("Entity transaction has already been sent.")
        self._transaction.send()
        self._is_sent = True

    def _create_non_persisted_entity(self, wallet: Wallet, transaction_data: str):
        self._transaction = Transaction(wallet, data=transaction_data)
        self._transaction.add_tag(TAG_ENTITY, self.type)
        self._transaction.add_tag(TAG_SEPARATOR, self._tag_separator)

