FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY backend backend
COPY frontend frontend
RUN javac -d backend/bin backend/Main.java backend/HotelWebServer.java backend/myclasses/*.java backend/myinterface/*.java

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/bin backend/bin
COPY --from=build /app/frontend frontend
ENV PORT=8080
EXPOSE 8080
CMD ["java", "-cp", "backend/bin", "HotelWebServer"]
