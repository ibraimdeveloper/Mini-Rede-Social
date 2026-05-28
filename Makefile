.PHONY: all build up run down clean fclean re logs shell_backend shell_frontend superuser migrate status

all: build up

build:
	docker compose build --no-cache
	@echo "🔨 Build das imagens concluído."

up:
	docker compose up -d
	@echo "✅ Projeto iniciado."
	@echo "🌐 Acesse: https://localhost:8443"

run:
	docker compose up --build

down:
	docker compose down -v --remove-orphans
	@echo "⏹️ Projeto parado."

clean:
	docker compose down --remove-orphans
	@echo "🧹 Containers limpos."

fclean:
	docker compose down -v --remove-orphans --rmi all
	@echo "🚨 LIMPEZA TOTAL REALIZADA."

re: fclean all

prune:
	docker system prune -af

logs:
	docker compose logs -f

status:
	docker compose ps
	@echo ""
	@echo "📍 Endpoints:"
	@echo "  🌐 Frontend: https://localhost:8443"
	@echo "  🔌 Backend API: https://localhost:8443/api"
	@echo "  👨‍💼 Admin: https://localhost:8443/admin"

shell_backend:
	docker compose exec backend sh

shell_frontend:
	docker compose exec frontend sh

superuser:
	docker compose exec backend python manage.py createsuperuser

migrate:
	docker compose exec backend python manage.py migrate

collectstatic:
	docker compose exec backend python manage.py collectstatic --noinput
