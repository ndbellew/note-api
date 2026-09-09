def test_index_returns_success(client):
    response = client.get("/api/health")

    assert response.status_code == 200


def test_unknown_route_returns_404(client):
    response = client.get("/does-not-exist")

    assert response.status_code == 404
