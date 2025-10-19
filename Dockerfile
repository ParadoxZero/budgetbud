# ===========================
# STAGE 1 - Frontend Build
# ===========================
FROM node:20-alpine AS frontend
WORKDIR /app

# Copy only what's needed for faster caching
# COPY package.json vite.config.ts ./
# COPY ui ./ui
# COPY app.html index.html demo.html ./
COPY . .

RUN npm install
RUN npm run build

# ===========================
# STAGE 2 - Backend Build
# ===========================
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

COPY *.csproj ./
RUN dotnet restore

# Copy everything else
COPY . .
# Bring in prebuilt frontend from Stage 1
COPY --from=frontend /app/wwwroot ./wwwroot

RUN dotnet publish -c Release -o /app/publish

# ===========================
# STAGE 3 - Runtime
# ===========================
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose the app port
EXPOSE 8080

# Start the web server
ENTRYPOINT ["dotnet", "budgetbud.dll"]
