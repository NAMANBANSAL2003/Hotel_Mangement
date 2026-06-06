import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import myclasses.HotelManager;
import myclasses.Room;
import myinterface.HotelService;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.Executors;

public class HotelWebServer {
    private static final int PORT = 8080;
    private final HotelService hotel = new HotelManager();
    private final Path webRoot = Paths.get("web");

    public static void main(String[] args) throws IOException {
        new HotelWebServer().start();
    }

    private final Path imageRoot = Paths.get("images");

    private void start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", PORT), 0);
        server.createContext("/", new RootHandler());
        server.createContext("/api/rooms", new RoomsHandler());
        server.createContext("/api/book", new BookHandler());
        server.createContext("/api/cancel", new CancelHandler());
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
        System.out.println("Hotel web UI available at http://localhost:" + PORT);
    }

    private class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }
            Path root = webRoot;
            Path filePath;
            if (path.startsWith("/images/")) {
                root = imageRoot;
                filePath = imageRoot.resolve(path.substring(8)).normalize();
            } else {
                filePath = webRoot.resolve(path.substring(1)).normalize();
            }
            if (!filePath.startsWith(root) || !Files.exists(filePath)) {
                sendNotFound(exchange);
                return;
            }
            byte[] bytes = Files.readAllBytes(filePath);
            exchange.getResponseHeaders().add("Content-Type", contentType(filePath.toString()));
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private class RoomsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendMethodNotAllowed(exchange);
                return;
            }
            List<myclasses.Room> rooms = ((HotelManager) hotel).getRooms();
            String json = buildRoomJson(rooms);
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            addCors(exchange);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private class BookHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendMethodNotAllowed(exchange);
                return;
            }
            String body = readBody(exchange.getRequestBody());
            int roomNumber = parseInt(field(body, "roomNumber"));
            String guestName = field(body, "guestName");
            int days = 1;
            try { days = Integer.parseInt(field(body, "days")); } catch(Exception e) { days = 1; }
            boolean success = hotel.bookRoom(roomNumber, guestName, days);
            String message = success ? "Room booked successfully." : "Room booking failed.";
            String json = String.format("{\"success\":%s,\"message\":\"%s\"}", success, escapeJson(message));
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            addCors(exchange);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private class CancelHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendMethodNotAllowed(exchange);
                return;
            }
            String body = readBody(exchange.getRequestBody());
            int roomNumber = parseInt(field(body, "roomNumber"));
            boolean success;
            String message;
            Room room = ((HotelManager) hotel).getRooms().stream()
                .filter(r -> r.getNumber() == roomNumber)
                .findFirst()
                .orElse(null);
            if (room == null) {
                success = false;
                message = "Room not found.";
            } else if (!room.isBooked()) {
                success = false;
                message = "Room not currently booked.";
            } else {
                success = hotel.cancelBooking(roomNumber);
                message = success ? "Room cancelled." : "Cancellation failed.";
            }
            String json = String.format("{\"success\":%s,\"message\":\"%s\"}", success, escapeJson(message));
            byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            addCors(exchange);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }

    private void sendNotFound(HttpExchange exchange) throws IOException {
        byte[] bytes = "404 Not Found".getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(404, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendMethodNotAllowed(HttpExchange exchange) throws IOException {
        byte[] bytes = "405 Method Not Allowed".getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(405, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void addCors(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
    }

    private String contentType(String fileName) {
        if (fileName.endsWith(".html")) return "text/html; charset=UTF-8";
        if (fileName.endsWith(".js")) return "application/javascript; charset=UTF-8";
        if (fileName.endsWith(".css")) return "text/css; charset=UTF-8";
        return "application/octet-stream";
    }

    private String buildRoomJson(List<myclasses.Room> rooms) {
        StringBuilder builder = new StringBuilder();
        builder.append("[");
        for (int i = 0; i < rooms.size(); i++) {
            myclasses.Room room = rooms.get(i);
            builder.append("{");
            builder.append("\"number\":").append(room.getNumber()).append(',');
            builder.append("\"type\":\"").append(escapeJson(room.getType())).append("\",");
            builder.append("\"bedCount\":").append(room.getBedCount()).append(',');
            builder.append("\"maxGuests\":").append(room.getMaxGuests()).append(',');
            builder.append("\"pricePerDay\":").append(room.getPricePerDay()).append(',');
            builder.append("\"booked\":").append(room.isBooked()).append(',');
            builder.append("\"guestName\":");
            if (room.getGuestName() == null) {
                builder.append("null");
            } else {
                builder.append("\"").append(escapeJson(room.getGuestName())).append("\"");
            }
            builder.append("}");
            if (i < rooms.size() - 1) builder.append(',');
        }
        builder.append("]");
        return builder.toString();
    }

    private String readBody(InputStream stream) throws IOException {
        return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
    }

    private int parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return -1;
        }
    }

    private String field(String body, String name) {
        String token = "\"" + name + "\"";
        int index = body.indexOf(token);
        if (index < 0) return "";
        int colon = body.indexOf(':', index);
        if (colon < 0) return "";
        String raw = body.substring(colon + 1).trim();
        if (raw.startsWith("\"")) {
            int end = raw.indexOf('"', 1);
            if (end < 0) return raw.substring(1);
            return raw.substring(1, end);
        }
        int comma = raw.indexOf(',');
        if (comma > 0) raw = raw.substring(0, comma);
        int end = raw.indexOf('}');
        if (end > 0) raw = raw.substring(0, end);
        return raw.trim();
    }

    private String escapeJson(String text) {
        return text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r");
    }
}
