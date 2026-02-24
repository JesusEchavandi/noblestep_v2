# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY backend/NobleStep.Api.csproj backend/
RUN dotnet restore backend/NobleStep.Api.csproj

# Copy everything else and build
COPY backend/ backend/
RUN dotnet publish backend/NobleStep.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Expose port (Railway uses PORT env variable)
EXPOSE 8080

# Run the application
# Use shell form to properly expand environment variables
CMD ["sh", "-c", "dotnet NobleStep.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]
