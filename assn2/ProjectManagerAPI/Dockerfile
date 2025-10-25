# Stage 1: Build
# We use the 8.0 SDK (LTS) as it's stable and will compile your code
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the project file and restore dependencies
COPY *.csproj .
RUN dotnet restore

# Copy the rest of the source code and publish the app
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Final Runtime
# Use the smaller ASP.NET runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# The .NET base image automatically listens on port 8080.
# Render will detect this and route traffic to it.
ENTRYPOINT ["dotnet", "ProjectManagerAPI.dll"]