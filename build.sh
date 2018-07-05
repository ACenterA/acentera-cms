#!/bin/bash -e
docker-compose -f docker-compose-acentera.yml build
#aws ecr get-login --no-include-email --region us-east-1
docker tag  serverlesscmsadmin_build-helper-web:latest 356769441913.dkr.ecr.us-east-1.amazonaws.com/logging:admin-website-v0.0.1
docker push 356769441913.dkr.ecr.us-east-1.amazonaws.com/logging:admin-website-v0.0.1
