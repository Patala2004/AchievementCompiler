# pull official base image
FROM python:3.14.0-alpine


# set work directory
WORKDIR /home/app/

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install dependencies
RUN apk add -u zlib-dev jpeg-dev gcc musl-dev
RUN python3 -m pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt
WORKDIR /home/app/

# copy project
COPY . .