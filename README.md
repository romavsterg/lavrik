# lavrik

run backend and serve frontend using nginx:
```bash
docker compose --profile nginx up -d
```

run frontend and backend without nginx:
```bash
docker compose --profile app up -d
```