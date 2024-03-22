#!/bin/sh

echo Local Server Start

sudo cp -f /workspace/resources/authlete.properties /workspace/java-oauth-server

cd /workspace/java-oauth-server/
mvn jetty:run