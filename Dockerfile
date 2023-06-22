FROM php:8.1-apache

RUN a2enmod headers && a2enmod rewrite && docker-php-ext-install pdo pdo_mysql
COPY ./000-default.conf /etc/apache2/sites-available/000-default.conf

EXPOSE 80
