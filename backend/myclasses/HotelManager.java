package myclasses;

import myinterface.HotelService;
import java.util.ArrayList;
import java.util.List;

public class HotelManager implements HotelService {
    private final List<Room> rooms = new ArrayList<>();

    public HotelManager() {
        // 4-bed rooms: max 8 guests, $80/day
        rooms.add(new Room(101, "4-bed", 4, 8, 80.0));
        rooms.add(new Room(102, "4-bed", 4, 8, 80.0));
        rooms.add(new Room(103, "4-bed", 4, 8, 80.0));
        rooms.add(new Room(104, "4-bed", 4, 8, 80.0));
        rooms.add(new Room(105, "4-bed", 4, 8, 80.0));
        // 6-bed rooms: max 12 guests, $120/day
        rooms.add(new Room(201, "6-bed", 6, 12, 120.0));
        rooms.add(new Room(202, "6-bed", 6, 12, 120.0));
        rooms.add(new Room(203, "6-bed", 6, 12, 120.0));
        rooms.add(new Room(204, "6-bed", 6, 12, 120.0));
        rooms.add(new Room(205, "6-bed", 6, 12, 120.0));
        // 8-bed rooms: max 16 guests, $160/day
        rooms.add(new Room(301, "8-bed", 8, 16, 160.0));
        rooms.add(new Room(302, "8-bed", 8, 16, 160.0));
        // 6-bed rooms
        rooms.add(new Room(601, "6-bed", 6, 12, 120.0));
        rooms.add(new Room(602, "6-bed", 6, 12, 120.0));
        // 8-bed rooms
        rooms.add(new Room(603, "8-bed", 8, 16, 160.0));
        rooms.add(new Room(604, "8-bed", 8, 16, 160.0));
        // 4-bed rooms
        rooms.add(new Room(606, "4-bed", 4, 8, 80.0));
        rooms.add(new Room(607, "4-bed", 4, 8, 80.0));
        // 12-bed rooms: max 24 guests, $240/day
        rooms.add(new Room(608, "12-bed", 12, 24, 240.0));
        rooms.add(new Room(609, "12-bed", 12, 24, 240.0));
    }

    @Override
    public void listRooms() {
        System.out.println("Available rooms:");
        boolean anyAvailable = false;
        for (Room room : rooms) {
            if (!room.isBooked()) {
                System.out.println("  " + room.toString());
                anyAvailable = true;
            }
        }
        if (!anyAvailable) {
            System.out.println("  No available rooms.");
        }
    }

    @Override
    public boolean bookRoom(int roomNumber, String guestName) {
        return bookRoom(roomNumber, guestName, 1);
    }

    @Override
    public boolean bookRoom(int roomNumber, String guestName, int days) {
        Room room = findRoom(roomNumber);
        if (room == null) {
            System.out.println("Room number " + roomNumber + " does not exist.");
            return false;
        }
        if (room.isBooked()) {
            System.out.println("Room " + roomNumber + " is already booked.");
            return false;
        }
        room.book(guestName, days);
        return true;
    }

    @Override
    public boolean cancelBooking(int roomNumber) {
        Room room = findRoom(roomNumber);
        if (room == null) return false;
        if (!room.isBooked()) return false;
        room.cancelBooking();
        return true;
    }

    @Override
    public void showBookings() {
        System.out.println("Current bookings:");
        boolean anyBooked = false;
        for (Room room : rooms) {
            if (room.isBooked()) {
                System.out.println("  " + room.toString());
                anyBooked = true;
            }
        }
        if (!anyBooked) {
            System.out.println("  No rooms are booked yet.");
        }
    }

    private Room findRoom(int roomNumber) {
        for (Room room : rooms) {
            if (room.getNumber() == roomNumber) {
                return room;
            }
        }
        return null;
    }

    public List<Room> getRooms() {
        return rooms;
    }
}
