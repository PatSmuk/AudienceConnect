@echo off
echo DROP DATABASE IF EXISTS audience_connect; | psql -U postgres
echo CREATE DATABASE audience_connect; | psql -U postgres
psql -U postgres audience_connect < schema.sql
psql -U postgres audience_connect < users.sql