#!/bin/bash -e
echo $(date) > force-build
set +e
docker rmi serverlesscmsadmin_build-helper-web
set -e
docker-compose -f docker-compose-acentera.yml build
#aws ecr get-login --no-include-email --region us-east-1
docker tag  serverless-cms-admin_build-helper-web:latest 356769441913.dkr.ecr.us-east-1.amazonaws.com/logging:admin-website-v0.0.5
docker push 356769441913.dkr.ecr.us-east-1.amazonaws.com/logging:admin-website-v0.0.5
