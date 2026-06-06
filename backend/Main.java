import myclasses.HotelManager;
import myinterface.HotelService;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        HotelService hotel = new HotelManager();
        Scanner scanner = new Scanner(System.in);

        System.out.println("Hotel Management System");
        while (true) {
            System.out.println();
            System.out.println("1. List available rooms");
            System.out.println("2. Book a room");
            System.out.println("3. Show bookings");
            System.out.println("0. Exit");
            System.out.print("Select an option: ");

            String input = scanner.nextLine().trim();
            switch (input) {
                case "1" -> hotel.listRooms();
                case "2" -> {
                    System.out.print("Enter room number: ");
                    int roomNumber = Integer.parseInt(scanner.nextLine().trim());
                    System.out.print("Enter guest name: ");
                    String guestName = scanner.nextLine().trim();
                    boolean success = hotel.bookRoom(roomNumber, guestName);
                    System.out.println(success ? "Room booked successfully." : "Room booking failed.");
                }
                case "3" -> hotel.showBookings();
                case "0" -> {
                    System.out.println("Goodbye!");
                    scanner.close();
                    return;
                }
                default -> System.out.println("Invalid option. Please choose 0-3.");
            }
        }
    }
}
