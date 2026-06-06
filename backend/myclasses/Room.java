package myclasses;

public class Room {
    private final int number;
    private final String type;
    private final int bedCount;
    private final int maxGuests;
    private final double pricePerDay;
    private boolean booked;
    private String guestName;
    private long bookedUntilMillis;

    public Room(int number, String type, int bedCount, int maxGuests, double pricePerDay) {
        this.number = number;
        this.type = type;
        this.bedCount = bedCount;
        this.maxGuests = maxGuests;
        this.pricePerDay = pricePerDay;
        this.booked = false;
        this.guestName = null;
        this.bookedUntilMillis = 0L;
    }

    public int getNumber() {
        return number;
    }

    public String getType() {
        return type;
    }

    public int getBedCount() {
        return bedCount;
    }

    public int getMaxGuests() {
        return maxGuests;
    }

    public double getPricePerDay() {
        return pricePerDay;
    }

    public boolean isBooked() {
        if (!booked) return false;
        if (bookedUntilMillis <= 0) return booked;
        if (System.currentTimeMillis() > bookedUntilMillis) {
            // booking expired
            booked = false;
            guestName = null;
            bookedUntilMillis = 0L;
            return false;
        }
        return true;
    }

    public String getGuestName() {
        return guestName;
    }

    public void book(String guestName, int days) {
        this.booked = true;
        this.guestName = guestName;
        if (days <= 0) days = 1;
        long millis = System.currentTimeMillis() + (long) days * 24L * 60L * 60L * 1000L;
        this.bookedUntilMillis = millis;
    }

    public void cancelBooking() {
        this.booked = false;
        this.guestName = null;
        this.bookedUntilMillis = 0L;
    }

    public long getBookedUntilMillis() {
        return bookedUntilMillis;
    }

    @Override
    public String toString() {
        if (booked) {
            return String.format("Room %d (%s, %d beds, max %d guests, $%.2f/day) - Booked by %s", number, type, bedCount, maxGuests, pricePerDay, guestName);
        }
        return String.format("Room %d (%s, %d beds, max %d guests, $%.2f/day) - Available", number, type, bedCount, maxGuests, pricePerDay);
    }
}
