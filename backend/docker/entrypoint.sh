#!/bin/sh

echo "⏳ Esperando o banco de dados..."

while ! nc -z $POSTGRES_HOST 5432; do
    sleep 1
done

echo "✅ Banco de dados conectado."

echo "⚙️ Aplicando migrations..."
python manage.py migrate --noinput

echo "📦 Coletando static files..."
python manage.py collectstatic --noinput

echo "🚀 Iniciando Django..."
exec "$@"