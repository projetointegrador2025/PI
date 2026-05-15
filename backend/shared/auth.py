def get_user_groups(event):
    """Extrai os grupos do usuário a partir do token JWT (claims do Cognito)."""
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        groups = claims.get("cognito:groups", "")
        if isinstance(groups, str):
            return [g.strip() for g in groups.split(",") if g.strip()]
        return groups
    except (KeyError, TypeError):
        return []


def get_user_id(event):
    """Extrai o user_id (sub) do token JWT."""
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        return claims.get("sub")
    except (KeyError, TypeError):
        return None


def require_groups(event, allowed_groups):
    """Verifica se o usuário pertence a um dos grupos permitidos."""
    user_groups = get_user_groups(event)
    return any(group in allowed_groups for group in user_groups)
