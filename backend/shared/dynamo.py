import boto3
import os

dynamodb = boto3.resource("dynamodb")


def get_table(table_env_var):
    """Retorna referência a uma tabela DynamoDB pelo nome da variável de ambiente."""
    table_name = os.environ.get(table_env_var)
    if not table_name:
        raise ValueError(f"Variável de ambiente '{table_env_var}' não definida.")
    return dynamodb.Table(table_name)
