# Build and Run
```
docker build -t keer2345/sinatra .
```

```
chmod +x webapp/bin/webapp
```

```
docker run -d -p 4567 --name webapp \
-v $PWD/webapp:/opt/webapp keer2345/sinatra
```

# Log and Top
```
docker logs webapp
docker logs -f webapp

docker top webapp
```

# Json
```
curl -i -H 'Accept: application/json' \
-d 'name=Foo&status=Bar' http://localhost:32778/json
HTTP/1.1 200 OK 
Content-Type: text/html;charset=utf-8
Content-Length: 29
X-Xss-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Server: WEBrick/1.4.2 (Ruby/2.5.1/2018-03-29)
Date: Sun, 07 Apr 2019 22:58:56 GMT
Connection: Keep-Alive

{"name":"Foo","status":"Bar"}
```
