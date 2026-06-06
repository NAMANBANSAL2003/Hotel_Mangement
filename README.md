# Hotel Management System

This project is a minimal Java hotel management console application.

## Structure

- `backend/` — contains all Java backend source files and server logic.
- `frontend/` — contains all HTML, CSS, JavaScript, and image assets.

### Backend structure

- `backend/Main.java` — application entrypoint.
- `backend/HotelWebServer.java` — web server entrypoint.
- `backend/myinterface/HotelService.java` — service interface.
- `backend/myclasses/Room.java` — room model.
- `backend/myclasses/HotelManager.java` — manager implementation.

### Frontend structure

- `frontend/web/` — static pages and JavaScript.
- `frontend/images/` — image assets used by the frontend.

## Run

### Console application

From the project root:

```powershell
javac -d bin Main.java myclasses\*.java myinterface\*.java
java -cp bin Main
```

### Web UI

From the project root:

```powershell
javac -d bin Main.java HotelWebServer.java myclasses\*.java myinterface\*.java
java -cp bin HotelWebServer
```

Then open the browser at:

```text
http://localhost:8080
```

If `bin/` does not exist, the compiler will create it automatically.
