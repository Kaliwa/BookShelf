.PHONY: first_launch up down seed

first_launch:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env cree depuis .env.example"; \
	else \
		echo ".env deja present"; \
	fi
	docker compose up -d --build
	docker compose exec -T app pnpm prisma db seed

up:
	docker compose up -d --build

down:
	docker compose down

seed:
	docker compose exec -T app pnpm prisma db seed
