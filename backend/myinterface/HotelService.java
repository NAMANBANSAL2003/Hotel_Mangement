package myinterface;

public interface HotelService {
    void listRooms();
    boolean bookRoom(int roomNumber, String guestName);
    boolean bookRoom(int roomNumber, String guestName, int days);
    boolean cancelBooking(int roomNumber);
    void showBookings();
}
