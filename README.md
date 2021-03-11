# Taylor Construction

[Taylor Construction, Exeter, Devon](http://www.miketaylorltd.co.uk/). Reliable and flexible building maintenance and project management services for your home or business throughout the Exeter area including Kenton, Exminster and Topsham.

A server-based static site using the TACS PHP Templating and Caching System.

Launch site with PHP 8.x using Docker:

```bash
docker run -it --rm -p 8080:80 -p 443:443 --name tpm -v "$PWD":/var/www/html php8
```

or

```bash
docker-compose up
```
