import argparse
import sys
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    import azure.cosmos.cosmos_client as cosmos_client
    from azure.cosmos.exceptions import CosmosHttpResponseError
except ImportError:
    logging.error("The 'azure-cosmos' library is not installed. Please install it using pip:")
    logging.error("pip install azure-cosmos")
    sys.exit(1)

def clone_container(key, endpoint, database_name, source_container_name, dest_container_name):
    """
    Clones a Cosmos DB container.

    Args:
        key (str): The Cosmos DB account key.
        endpoint (str): The Cosmos DB endpoint URL.
        database_name (str): The name of the database.
        source_container_name (str): The name of the source container.
        dest_container_name (str): The name of the destination container.
    """
    print(f"You are about to clone the container '{source_container_name}' to '{dest_container_name}'.")
    choice = input("Are you sure you want to continue? (y/n): ")
    if choice.lower() != 'y':
        print("Cloning cancelled.")
        return

    try:
        client = cosmos_client.CosmosClient(endpoint, {"masterKey": key})
        database = client.get_database_client(database_name)
        source_container = database.get_container_client(source_container_name)
        dest_container = database.get_container_client(dest_container_name)

        logging.info(f"Cloning container '{source_container_name}' to '{dest_container_name}'...")

        items = list(source_container.read_all_items())
        total_items = len(items)
        logging.info(f"Found {total_items} items to clone.")

        for i, item in enumerate(items):
            dest_container.upsert_item(item)
            logging.info(f"Cloned item {i+1}/{total_items}")

        logging.info("Cloning complete.")

    except CosmosHttpResponseError as e:
        logging.error(f"An error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clone a Cosmos DB container.")
    parser.add_argument("--key", required=True, help="Cosmos DB account key.")
    parser.add_argument("--endpoint", required=True, help="Cosmos DB endpoint URL.")
    parser.add_argument("--database", required=True, help="Database name.")
    parser.add_argument("--source-container", required=True, help="Source container name.")
    parser.add_argument("--dest-container", required=True, help="Destination container name.")

    args = parser.parse_args()

    clone_container(args.key, args.endpoint, args.database, args.source_container, args.dest_container)
