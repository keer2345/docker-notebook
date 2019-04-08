```
docker build -t keer2345/nginx .
```

```
docker run -d -p 80 --name website \
-v $PWD/website:/var/www/html/website \
keer2345/nginx nginx
```

