[docker-curriculum.com](https://docker-curriculum.com/)

# INTRODUCTION
- What is Docker?
- What are containers?
- Why use containers?
- What will this tutorial teach me? We'll be using [Amazon Web Services](http://aws.amazon.com/) to deploy a static website, and two dynamic webapps on [EC2](https://aws.amazon.com/ec2/) using [Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) and [Elastic Container Service](https://aws.amazon.com/ecs/). Even if you have no prior experience with deployments, this tutorial should be all you need to get started.

# GETTING STARTED
> [Github repo](http://github.com/prakhar1989/docker-curriculum)

## Prerequisites
- [Amazon Web Services](http://aws.amazon.com/)
- [Docker Hub](https://hub.docker.com/)
## Setting up your computer
```
docker pull hello-world
docker run hello-world
```
```
Hello from Docker.
This message shows that your installation appears to be working correctly.
...
```

# HELLO WORLD
## Playing with Busybox
```
docker pull busybox
```

See a list of all images on your system:
```
$ docker images
```
## Docker Run
```
docker run busybox
```
Shows you all containers that are currently running:
```
docker ps
```
```
$ docker run -it busybox sh
/ # ls
bin   dev   etc   home  proc  root  sys   tmp   usr   var
/ # uptime
 05:45:21 up  5:58,  0 users,  load average: 0.00, 0.01, 0.04
```

Deletes all containers that have a status of `exited`:
```
docker rm $(docker ps -a -q -f status=exited)
```
or
```
docker container prune
```

## Terminology
- Images
- Container
- Docker Daemon
- Docker Client, such as [Kitematic](https://kitematic.com/) which provide a GUI to the users.
- Docker Hub

# WEBAPPS WITH DOCKER
## Static Sites
```
docker run -d -P --name static-site prakhar1989/static-site
docker port static-site

docker run -p 8888:80 prakhar1989/static-site
```
- `-d` will detach our terminal,
- `-P` will publish all exposed ports to random ports and finally
- `--name` corresponds to a name we want to give

## Docker Images
```
docker images
```
```
docker pull ubuntu:18.04
```
## Our First Image
```
git clone https://github.com/prakhar1989/docker-curriculum
cd docker-curriculum/flask-app
```
```
docker build -t keer2345/flask-app .
docker run -p 8888:5000 keer2345/flask-app
```

## Docker on AWS
Use AWS [Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) to deploy our awesome application to the cloud so that we can share it with our friends!

### Docker push
```
docker push keer2345/flask-app
```

### Beanstalk
- Login to your AWS [console](http://console.aws.amazon.com/)
- Click on [Elastic Beanstalk](https://console.aws.amazon.com/elasticbeanstalk)
- Click on "Create New Application" in the top right
- Give your app a memorable (but unique) name and provide an (optional) description
- In the **New Environment screen**, create a new environment and choose the **Web Server Environment**
- Fill in the environment information by choosing a domain
- Under base configuration section. Choose **Docker** from the **predefined platform**
- Upload our application code file `Dockerrun.aws.json`

```
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "keer2345/flask-app",
    "Update": "true"
  },
  "Ports": [
    {
      "ContainerPort": "5000"
    }
  ],
  "Logging": "/var/log/nginx"
}
```

We have deployed our first Docker application! That might seem like a lot of steps, but with the [command-line tool for EB](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html) we can almost mimic the functionality of Heroku in a few keystrokes! I would encourage you to read the AWS [documentation](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/docker-singlecontainer-deploy.html) on single-container Docker environments to get an idea of what features exist.

# MULTI-CONTAINER ENVIRONMENTS
## SF Food Trucks
The app that we're going to Dockerize is called SF Food Trucks. The app's backend is written in Python (Flask) and for search it uses [Elasticsearch](https://www.elastic.co/products/elasticsearch). Like everything else in this tutorial, the entire source is available on [Github](http://github.com/prakhar1989/FoodTrucks).

```
$ git clone https://github.com/prakhar1989/FoodTrucks
$ cd FoodTrucks
$ tree -L 2
.
├── Dockerfile
├── README.md
├── aws-compose.yml
├── docker-compose.yml
├── flask-app
│   ├── app.py
│   ├── package-lock.json
│   ├── package.json
│   ├── requirements.txt
│   ├── static
│   ├── templates
│   └── webpack.config.js
├── setup-aws-ecs.sh
├── setup-docker.sh
├── shot.png
└── utils
    ├── generate_geojson.py
    └── trucks.geojson
```

[Elasticsearch Image](https://www.docker.elastic.co/):
```
docker pull docker.elastic.co/elasticsearch/elasticsearch:6.3.2
```

Run it in development mode by specifying ports and setting an environment variable that configures Elasticsearch cluster to run as a single-node:
```
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2
```

```
$ curl 0.0.0.0:9200
{
  "name" : "ijJDAOm",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "a_nSV3XmTCqpzYYzb-LhNw",
  "version" : {
    "number" : "6.3.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "053779d",
    "build_date" : "2018-07-20T05:20:23.451332Z",
    "build_snapshot" : false,
    "lucene_version" : "7.3.1",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

Since we need a custom build step, we'll start from the `ubuntu` base image to build our `Dockerfile` from scratch.
```
# start from base
FROM ubuntu:18.04
MAINTAINER Keer Qin <keer2345@gmail.com>

# install system-wide deps for python and node
RUN apt-get -yqq update
RUN apt-get -yqq install python-pip python-dev curl gnupg
RUN curl -sL http://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -yq nodejs

# copy our application code
ADD flask-app /opt/flask-app
WORKDIR /opt/flask-app

# fetch app specific deps
RUN npm install
RUN npm run build
RUN pip install -r requirements.txt

# expose port
EXPOSE 5000

# start app
CMD ["python", "./app.py"]
```

Add file:
- package.json
- webpack.config.js

```
docker build -t keer2345/foodtrucks-web .
docker run -P --rm keer2345/foodtrucks-web
```
Oops! Our flask app was unable to run since it was unable to connect to Elasticsearch. How do we tell one container about the other container and get them to talk to each other? The answer lies in the next section.

## Docker Network
```
$ docker ps                                                                                                                                                               master!
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED             STATUS              PORTS                                            NAMES
cd60f7a39458        docker.elastic.co/elasticsearch/elasticsearch:6.3.2   "/usr/local/bin/dock…"   About an hour ago   Up About an hour    0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   es
```


Now is a good time to start our exploration of networking in Docker. When docker is installed, it creates three networks automatically.

```
$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
c2c695315b3a        bridge              bridge              local
a875bec5d6fd        host                host                local
ead0e804a67b        none                null                local
```
The **bridge** network is the network in which containers are run by default. So that means that when I ran the ES container, it was running in this bridge network. To validate this, let's inspect the network

```
$ docker network inspect bridge
[
    {
        "Name": "bridge",
        "Id": "2bf6d77e21984f84fa9356903de0cd9bcfdad34bf7fc98f29562b1e2eb30ff51",
        "Created": "2019-04-06T23:40:10.305462454Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.17.0.0/16",
                    "Gateway": "172.17.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "cd60f7a394588d3be8dafe154a5f35b0c2f4d847da83b5e8146295ce4f5acd92": {
                "Name": "es",
                "EndpointID": "2d389b16dbc6ad2d394376998d7d41f64058578a9ab462c211b975090b091be9",
                "MacAddress": "02:42:ac:11:00:02",
                "IPv4Address": "172.17.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {
            "com.docker.network.bridge.default_bridge": "true",
            "com.docker.network.bridge.enable_icc": "true",
            "com.docker.network.bridge.enable_ip_masquerade": "true",
            "com.docker.network.bridge.host_binding_ipv4": "0.0.0.0",
            "com.docker.network.bridge.name": "docker0",
            "com.docker.network.driver.mtu": "1500"
        },
        "Labels": {}
    }
]
```


```
$ docker run -it --rm keer2345/foodtrucks-web bash
root@34d677d77824:/opt/flask-app# curl 172.17.0.2:9200
{
  "name" : "-ziGxB5",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "uhaZBrF9QvWiXkcywVDZUw",
  "version" : {
    "number" : "6.3.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "053779d",
    "build_date" : "2018-07-20T05:20:23.451332Z",
    "build_snapshot" : false,
    "lucene_version" : "7.3.1",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
root@34d677d77824:/opt/flask-app# exit
```

There are still two problems with this approach -
1. How do we tell the Flask container that es hostname stands for 172.17.0.2 or some other IP since the IP can change?
1. Since the bridge network is shared by every container by default, this method is not secure. How do we isolate our network?


Let's first go ahead and create our own network.
```
$ docker network create foodtrucks-net
0815b2a3bb7a6608e850d05553cc0bda98187c4528d94621438f31d97a6fea3c

$ docker network ls
NETWORK ID          NAME                DRIVER              SCOPE
c2c695315b3a        bridge              bridge              local
0815b2a3bb7a        foodtrucks-net      bridge              local
a875bec5d6fd        host                host                local
ead0e804a67b        none                null                local
```
Now that we have a network, we can launch our containers inside this network using the `--net` flag. Let's do that - but first, we will stop and delete our ES container that is running in the bridge (default) network.
```
$ docker container stop es
es

$ docker rm es
es

$ docker run -d --name es --net foodtrucks-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2
13d6415f73c8d88bddb1f236f584b63dbaf2c3051f09863a3f1ba219edba3673

$ docker network inspect foodtrucks-net
[
    {
        "Name": "foodtrucks-net",
        "Id": "0815b2a3bb7a6608e850d05553cc0bda98187c4528d94621438f31d97a6fea3c",
        "Created": "2018-07-30T00:01:29.1500984Z",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "172.18.0.0/16",
                    "Gateway": "172.18.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "13d6415f73c8d88bddb1f236f584b63dbaf2c3051f09863a3f1ba219edba3673": {
                "Name": "es",
                "EndpointID": "29ba2d33f9713e57eb6b38db41d656e4ee2c53e4a2f7cf636bdca0ec59cd3aa7",
                "MacAddress": "02:42:ac:12:00:02",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]
```

As you can see, our `es` container is now running inside the `foodtrucks-net` bridge network. Now let's inspect what happens when we launch in our `foodtrucks-net` network.
```
$ docker run -it --rm --net foodtrucks-net keer2345/foodtrucks-web bash
root@9d2722cf282c:/opt/flask-app# curl es:9200
{
  "name" : "wWALl9M",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "BA36XuOiRPaghPNBLBHleQ",
  "version" : {
    "number" : "6.3.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "053779d",
    "build_date" : "2018-07-20T05:20:23.451332Z",
    "build_snapshot" : false,
    "lucene_version" : "7.3.1",
    "minimum_wire_compatibility_version" : "5.6.0",
    "minimum_index_compatibility_version" : "5.0.0"
  },
  "tagline" : "You Know, for Search"
}
root@53af252b771a:/opt/flask-app# ls
app.py  node_modules  package.json  requirements.txt  static  templates  webpack.config.js
root@53af252b771a:/opt/flask-app# python app.py
Index not found...
Loading data in elasticsearch ...
Total trucks loaded:  733
 * Running on http://0.0.0.0:5000/ (Press CTRL+C to quit)
root@53af252b771a:/opt/flask-app# exit
```
Wohoo! That works! On user-defined networks like foodtrucks-net, containers can not only communicate by IP address, but can also resolve a container name to an IP address. This capability is called automatic service discovery. Great! Let's launch our Flask container for real now :
```
$ docker run -d --net foodtrucks-net -p 5000:5000 --name foodtrucks-web keer2345/foodtrucks-web
852fc74de2954bb72471b858dce64d764181dca0cf7693fed201d76da33df794

$ docker container ls
CONTAINER ID        IMAGE                                                 COMMAND                  CREATED              STATUS              PORTS                                            NAMES
852fc74de295        keer2345/foodtrucks-web                            "python ./app.py"        About a minute ago   Up About a minute   0.0.0.0:5000->5000/tcp                           foodtrucks-web
13d6415f73c8        docker.elastic.co/elasticsearch/elasticsearch:6.3.2   "/usr/local/bin/dock…"   17 minutes ago       Up 17 minutes       0.0.0.0:9200->9200/tcp, 0.0.0.0:9300->9300/tcp   es

$ curl -I 0.0.0.0:5000
HTTP/1.0 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 3697
Server: Werkzeug/0.11.2 Python/2.7.6
Date: Sun, 10 Jan 2016 23:58:53 GMT
```
Although that might have seemed like a lot of work, we actually just typed 4 commands to go from zero to running. I've collated the commands in a [bash script](https://github.com/prakhar1989/FoodTrucks/blob/master/setup-docker.sh).
```
#!/bin/bash

# build the flask container
docker build -t keer2345/foodtrucks-web .

# create the network
docker network create foodtrucks-net

# start the ES container
docker run -d --name es --net foodtrucks-net -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:6.3.2

# start the flask app container
docker run -d --net foodtrucks-net -p 5000:5000 --name foodtrucks-web keer2345/foodtrucks-web
```
Now imagine you are distributing your app to a friend, or running on a server that has docker installed. You can get a whole app running with just one command!
```
$ git clone https://github.com/prakhar1989/FoodTrucks
$ cd FoodTrucks
$ ./setup-docker.sh
```
And that's it! If you ask me, I find this to be an extremely awesome, and a powerful way of sharing and running your applications!

## Docker Compose
