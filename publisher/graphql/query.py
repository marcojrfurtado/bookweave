import requests
from typing import List

GRAPHQL_ENDPOINT = "https://arweave.net/arql"

SINGLE_TX_QUERY = """
{
  transaction(id: "%s") {
    id,
    tags {
      name,
      value 
    }
  }
}
"""

COLLECTION_NAME_QUERY = """
{
  transactions(from: ["%s"], tags: [{name: "entity", value: "Collection"}, {name: "name", value: "%s"}]) {
    id
  }
}
"""

BOOK_NAME_QUERY = """
{
  transactions(from: %s, tags: [{name: "entity", value: "Book"}, {name: "belongs", value: "%s"}]) {
    id,
    tags {
        name,
        value
    }
  }
}
"""


def _graphql_request(query: str) -> dict:
    request = requests.post(GRAPHQL_ENDPOINT, json={'query': query })
    if request.status_code == 200:
        json_result = request.json()
        if 'errors' in json_result:
            raise Exception("GraphQL request failed, reason: '%s'" % str(json_result['errors']))
        return json_result
    else:
        raise Exception("Query failed to run by returning code of {}. {}".format(request.status_code, query))


def query_tx(transaction_id: str) -> dict:
    """
    Query single permaweb transaction
    :param transaction_id: Id of transaction
    :return: If rquest is successful, returns a dictionary containing all transaction tags.
    :except Throws if arweave does not return success
    """
    return _graphql_request(SINGLE_TX_QUERY % transaction_id)


def get_tag_value_from_query( query_result: dict, tag_name: str) -> str:
    if "data" not in query_result:
        return None
    query_data = query_result["data"]
    if "transaction" not in query_data or "tags" not in query_data['transaction']:
        return None
    for tag in query_data['transaction']['tags']:
        if tag_name == tag['name']:
            return tag['value']
    return None


def get_transactions_from_query(query_result: dict) -> List[dict]:
    if "data" not in query_result or "transactions" not in query_result['data']:
        raise Exception("Unexpected query result format")
    return query_result['data']['transactions']


def find_collection_ids(owner_address: str, name: str):
    query_result = _graphql_request(COLLECTION_NAME_QUERY % (owner_address, name))
    return get_transactions_from_query(query_result)


def find_books_from_collection(trusted_sources: List[str], collection_id: str):
    trusted_sources_str = str(trusted_sources).replace('\'','"')
    query_result = _graphql_request(BOOK_NAME_QUERY % (trusted_sources_str, collection_id))
    return query_result["data"]["transactions"]