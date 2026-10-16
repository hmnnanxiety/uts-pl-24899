# syntax=docker/dockerfile:1

# Stage 1: FrankenPHP + PHP extensions
FROM dunglas/frankenphp:1.12.7-php8.4-alpine AS base

WORKDIR /app

RUN install-php-extensions \
    pdo_pgsql \
    intl \
    zip

COPY --from=composer:2.8 /usr/bin/composer /usr/local/bin/composer


# Stage 2: Install Composer dependencies
FROM base AS vendor

RUN apk add --no-cache git unzip

# Copy dependency manifests first for layer caching
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts \
    --no-autoloader


# Stage 3: Production runtime
FROM base AS runner

COPY --from=vendor /app/vendor /app/vendor

COPY . /app

RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && php artisan package:discover --ansi \
    && mkdir -p \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

RUN cp "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

ENV SERVER_NAME=:80 \
    APP_ENV=production \
    APP_DEBUG=false

EXPOSE 80

CMD ["frankenphp", "php-server", "--listen", ":80", "--root", "/app/public"]