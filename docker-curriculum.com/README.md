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
