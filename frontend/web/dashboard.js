function getCurrentUserEmail() { return localStorage.getItem('hotel_current_user'); }
function getUsers(){ return JSON.parse(localStorage.getItem('hotel_users')||'{}'); }

const userName = document.getElementById('userName');
const userNameDropdown = document.getElementById('userNameDropdown');
const accountButton = document.getElementById('accountButton');
const accountDropdown = document.getElementById('accountDropdown');
const signOut = document.getElementById('signOut');
const accountHome = document.getElementById('accountHome');
const accountPayments = document.getElementById('accountPayments');
const accountBookings = document.getElementById('accountBookings');
const accountCancelBooking = document.getElementById('accountCancelBooking');
const availableCountDash = document.getElementById('availableCountDash');
const availableRoomsListDash = document.getElementById('availableRoomsListDash');
const bookingCard = document.getElementById('bookingCard');
const availableRoomsCard = document.getElementById('availableRoomsCard');
const btnBookRoomDash = document.getElementById('btnBookRoomDash');
const btnAvailableRoomsDash = document.getElementById('btnAvailableRoomsDash');
const roomBookingForm = document.getElementById('roomBookingForm');
const bookRoomNumber = document.getElementById('bookRoomNumber');
const bookPersonCount = document.getElementById('bookPersonCount');
const bookGuestName = document.getElementById('bookGuestName');
const bookContactNumber = document.getElementById('bookContactNumber');
const bookIdType = document.getElementById('bookIdType');
const bookIdNumber = document.getElementById('bookIdNumber');
const bookGuestLimitInfo = document.getElementById('bookGuestLimitInfo');
const verifyRoomIdBtn = document.getElementById('verifyRoomIdBtn');
const bookVerifyStatus = document.getElementById('bookVerifyStatus');
const paymentCard = document.getElementById('paymentCard');
const paymentRoomLabel = document.getElementById('paymentRoomLabel');
const paymentAmount = document.getElementById('paymentAmount');
const payNowBtn = document.getElementById('payNowBtn');
const bookingStatus = document.getElementById('bookingStatus');
const paymentSection = document.getElementById('paymentSection');
const dashboardPayRoomNumber = document.getElementById('dashPayRoomNumber');
const dashboardPayGuestName = document.getElementById('dashPayGuestName');
const dashboardPayContact = document.getElementById('dashPayContact');
const dashboardPayGuests = document.getElementById('dashPayGuests');
const dashboardPaySubtotal = document.getElementById('dashPaySubtotal');
const dashboardPayGST = document.getElementById('dashPayGST');
const dashboardPayTotal = document.getElementById('dashPayTotal');
const dashboardCouponApplied = document.getElementById('dashCouponApplied');
const dashboardCouponDiscount = document.getElementById('dashCouponDiscount');
const dashboardCouponCode = document.getElementById('dashboardCouponCode');
const dashboardApplyCouponBtn = document.getElementById('dashboardApplyCouponBtn');
const dashboardCouponMessage = document.getElementById('dashboardCouponMessage');
const dashboardPaymentDetailsForm = document.getElementById('dashboardPaymentDetailsForm');
const dashboardPaymentMethodTitle = document.getElementById('dashboardPaymentMethodTitle');
const dashboardPaymentOptionButtons = document.querySelectorAll('.dashboard-payment-option-btn');
const dashboardUpiDetails = document.getElementById('dashboardUpiDetails');
const dashboardCreditCardDetails = document.getElementById('dashboardCreditCardDetails');
const dashboardAmazonPayDetails = document.getElementById('dashboardAmazonPayDetails');
const dashboardPaymentForm = document.getElementById('dashboardPaymentForm');
const dashboardCompletePaymentBtn = document.getElementById('dashboardCompletePaymentBtn');
const dashboardCancelPaymentBtn = document.getElementById('dashboardCancelPaymentBtn');
const dashboardPaymentMessage = document.getElementById('dashboardPaymentMessage');
const dashboardVerifyPaymentBtn = document.getElementById('dashboardVerifyPaymentBtn');
const dashboardProcessingSection = document.getElementById('dashboardProcessingSection');
const dashboardReceiptSection = document.getElementById('dashboardReceiptSection');
const dashboardReceiptDate = document.getElementById('dashboardReceiptDate');
const dashboardReceiptGuestName = document.getElementById('dashboardReceiptGuestName');
const dashboardReceiptContact = document.getElementById('dashboardReceiptContact');
const dashboardReceiptRoomNumber = document.getElementById('dashboardReceiptRoomNumber');
const dashboardReceiptRoomType = document.getElementById('dashboardReceiptRoomType');
const dashboardReceiptGuests = document.getElementById('dashboardReceiptGuests');
const dashboardReceiptSubtotal = document.getElementById('dashboardReceiptSubtotal');
const dashboardReceiptGST = document.getElementById('dashboardReceiptGST');
const dashboardReceiptTotal = document.getElementById('dashboardReceiptTotal');
const dashboardReceiptCouponLine = document.getElementById('dashboardReceiptCouponLine');
const dashboardReceiptCouponDiscount = document.getElementById('dashboardReceiptCouponDiscount');
const dashboardReceiptPaymentMethod = document.getElementById('dashboardReceiptPaymentMethod');
const dashboardDownloadReceiptBtn = document.getElementById('dashboardDownloadReceiptBtn');
const dashboardBackToHomeBtn = document.getElementById('dashboardBackToHomeBtn');

let currentRooms = [];
let idVerified = false;
let selectedRoom = null;
let selectedPaymentMethod = null;
let dashboardCouponUsed = false;
let pendingBooking = null;
let paymentDetailsVerified = false;

function ensureSignedIn() {
    const email = getCurrentUserEmail();
    if (!email) {
        alert('Please sign in first.');
        window.open('login.html', '_self');
        return false;
    }
    const users = getUsers();
    const user = users[email];
    if (!user) {
        alert('User not found. Please sign in.');
        window.open('login.html', '_self');
        return false;
    }
    userName.textContent = user.name || user.email;
    return true;
}

async function loadRoomsDash() {
    try {
        const resp = await fetch('/api/rooms');
        const rooms = await resp.json();
        currentRooms = rooms;
        const available = rooms.filter(r => !r.booked);
        availableCountDash.textContent = available.length;
        if (available.length === 0) {
            availableRoomsListDash.innerHTML = '<p>No rooms available</p>';
            return;
        }
        availableRoomsListDash.innerHTML = available.map(r=>`
            <div class="room-item">
                <strong>Room ${r.number}</strong>
                <span>Type: ${r.type}</span>
                <span>Price: ₹${getRoomPrice(r)}/day</span>
                <span>Status: Available</span>
                <button type="button" class="small-btn select-room-btn" data-room="${r.number}">Select</button>
            </div>
        `).join('');
        document.querySelectorAll('.select-room-btn').forEach(button => {
            button.addEventListener('click', () => {
                const roomNumber = parseInt(button.dataset.room, 10);
                selectRoom(roomNumber);
            });
        });
    } catch(e) {
        availableRoomsListDash.innerHTML = '<p>Failed to load rooms: '+e+'</p>';
    }
}

function findRoom(number) {
    return currentRooms.find(r => r.number === number);
}

function isValidAadhaar(value) {
    const cleaned = value.replace(/\s+/g, '');
    return /^\d{12}$/.test(cleaned);
}

function isValidDrivingLicence(value) {
    const cleaned = value.replace(/[\s-]+/g, '').toUpperCase();
    return /^[A-Z]{2}\d{2}[A-Z0-9]{4,14}$/.test(cleaned);
}

function isValidContactNumber(value) {
    const cleaned = value.replace(/\D/g, '');
    return /^\d{10}$/.test(cleaned);
}

function getRoomPrice(room) {
    if (!room) return 0;
    if (room.type.includes('12')) return 3200;
    if (room.type.includes('8')) return 2200;
    if (room.type.includes('6')) return 1600;
    if (room.type.includes('4')) return 1100;
    return 1000;
}

function updatePaymentAmount() {
    if (!selectedRoom) {
        paymentAmount.textContent = '0';
        return;
    }
    const days = parseInt(document.getElementById('bookDays').value, 10) || 1;
    const total = getRoomPrice(selectedRoom) * days;
    paymentAmount.textContent = total;
}

function selectRoom(number) {
    const room = findRoom(number);
    if (!room || room.booked) {
        setStatus('Selected room is not available.', '#f87171');
        return;
    }
    selectedRoom = room;
    bookRoomNumber.value = room.number;
    bookPersonCount.max = room.maxGuests;
    bookGuestLimitInfo.textContent = `Max ${room.maxGuests} guests allowed`;
    paymentRoomLabel.textContent = `Room ${room.number} (${room.type})`;
    updatePaymentAmount();
    paymentCard.classList.remove('hidden');
    setStatus('Room selected. Verify your ID to pay.', '#34d399');
}

bookPersonCount.addEventListener('change', () => {
    if (!selectedRoom) return;
    let guestCount = parseInt(bookPersonCount.value, 10);
    if (Number.isNaN(guestCount) || guestCount < 1) {
        bookPersonCount.value = 1;
        guestCount = 1;
    }
    if (guestCount > selectedRoom.maxGuests) {
        alert(`Limit exceeded! This room allows maximum ${selectedRoom.maxGuests} guests.`);
        bookPersonCount.value = selectedRoom.maxGuests;
    }
});

function setStatus(text, color='#fbbf24') {
    bookingStatus.textContent = text;
    bookingStatus.style.color = color;
}

document.getElementById('bookDays').addEventListener('input', () => {
    updatePaymentAmount();
});

verifyRoomIdBtn.addEventListener('click', () => {
    if (!bookIdType.value || !bookIdNumber.value.trim()) {
        bookVerifyStatus.textContent = 'Choose an ID type and enter your ID number.';
        bookVerifyStatus.style.color = '#f87171';
        idVerified = false;
        payNowBtn.disabled = true;
        return;
    }
    const idType = bookIdType.value;
    const idNumber = bookIdNumber.value.trim();
    let valid = false;
    if (idType === 'Aadhaar Card') {
        valid = isValidAadhaar(idNumber);
    } else if (idType === 'Driving Licence') {
        valid = isValidDrivingLicence(idNumber);
    }
    if (!valid) {
        bookVerifyStatus.textContent = `Invalid ${idType} format.`;
        bookVerifyStatus.style.color = '#f87171';
        idVerified = false;
        payNowBtn.disabled = true;
        return;
    }
    bookVerifyStatus.textContent = `Verified ${idType}`;
    bookVerifyStatus.style.color = '#34d399';
    idVerified = true;
    payNowBtn.disabled = false;
});

payNowBtn.addEventListener('click', () => {
    if (!selectedRoom) {
        setStatus('Select a room first.', '#f87171');
        return;
    }
    if (!idVerified) {
        setStatus('Verify your ID before paying.', '#f87171');
        return;
    }
    const guestName = bookGuestName.value.trim();
    const guestCount = parseInt(bookPersonCount.value, 10);
    const contactNumber = bookContactNumber.value.trim();
    if (!guestName || !guestCount || guestCount <= 0 || !contactNumber) {
        setStatus('Enter your name, contact number, and number of guests.', '#f87171');
        return;
    }
    if (guestCount > selectedRoom.maxGuests) {
        setStatus(`This room allows maximum ${selectedRoom.maxGuests} guests.`, '#f87171');
        return;
    }
    if (!isValidContactNumber(contactNumber)) {
        setStatus('Enter a valid 10-digit contact number.', '#f87171');
        return;
    }
    const days = parseInt(document.getElementById('bookDays').value, 10) || 1;
    pendingBooking = {
        roomNumber: selectedRoom.number,
        roomType: selectedRoom.type,
        guestName,
        guestCount,
        contactNumber,
        days,
        idType: bookIdType.value,
        idNumber: bookIdNumber.value.trim(),
        amount: getRoomPrice(selectedRoom) * days
    };
    openPaymentSection();
});

function openPaymentSection() {
    dashboardCouponUsed = false;
    selectedPaymentMethod = null;
    dashboardCouponCode.value = '';
    dashboardCouponMessage.textContent = '';
    dashboardCouponApplied.style.display = 'none';
    dashboardPayRoomNumber.textContent = pendingBooking.roomNumber;
    dashboardPayGuestName.textContent = pendingBooking.guestName;
    dashboardPayDays.textContent = pendingBooking.days || 1;
    dashboardPayContact.textContent = pendingBooking.contactNumber;
    dashboardPayGuests.textContent = pendingBooking.guestCount;
    dashboardPaySubtotal.textContent = pendingBooking.amount.toFixed(2);
    dashboardPayGST.textContent = (pendingBooking.amount * 0.18).toFixed(2);
    dashboardPayTotal.textContent = (pendingBooking.amount * 1.18).toFixed(2);
    dashboardPaymentDetailsForm.style.display = 'none';
    dashboardUpiDetails.style.display = 'none';
    dashboardCreditCardDetails.style.display = 'none';
    dashboardAmazonPayDetails.style.display = 'none';
    dashboardPaymentOptionButtons.forEach(b => b.classList.remove('selected-payment'));
    bookingCard.classList.add('hidden');
    paymentSection.classList.remove('hidden');
    availableRoomsCard.classList.add('hidden');
    setStatus('', '#fbbf24');
}

function closePaymentSection() {
    paymentSection.classList.add('hidden');
    bookingCard.classList.remove('hidden');
    availableRoomsCard.classList.remove('hidden');
}

function applyDashboardCoupon() {
    const couponCode = dashboardCouponCode.value.trim();
    const subtotal = pendingBooking.amount;
    if (couponCode === 'Naman@25') {
        dashboardCouponUsed = true;
        const discount = subtotal * 0.25;
        const discountedSubtotal = subtotal - discount;
        const gst = discountedSubtotal * 0.18;
        const total = discountedSubtotal + gst;
        dashboardCouponDiscount.textContent = discount.toFixed(2);
        dashboardCouponApplied.style.display = 'block';
        dashboardPayGST.textContent = gst.toFixed(2);
        dashboardPayTotal.textContent = total.toFixed(2);
        setStatus('✔ Coupon applied! 25% off total.', '#34d399');
    } else if (couponCode === '') {
        setStatus('Please enter coupon code.', '#f87171');
    } else {
        dashboardCouponUsed = false;
        dashboardCouponApplied.style.display = 'none';
        dashboardPayGST.textContent = (subtotal * 0.18).toFixed(2);
        dashboardPayTotal.textContent = (subtotal * 1.18).toFixed(2);
        setStatus('Invalid coupon code.', '#f87171');
    }
}


function updateDashboardPriceDisplay() {
    const subtotal = pendingBooking.amount;
    if (dashboardCouponUsed) {
        const discount = subtotal * 0.25;
        const discountedSubtotal = subtotal - discount;
        const gst = discountedSubtotal * 0.18;
        const total = discountedSubtotal + gst;
        dashboardPayGST.textContent = gst.toFixed(2);
        dashboardPayTotal.textContent = total.toFixed(2);
    } else {
        dashboardPayGST.textContent = (subtotal * 0.18).toFixed(2);
        dashboardPayTotal.textContent = (subtotal * 1.18).toFixed(2);
    }
}

function resetDashboardPaymentForm() {
    dashboardPaymentDetailsForm.style.display = 'none';
    dashboardUpiDetails.style.display = 'none';
    dashboardCreditCardDetails.style.display = 'none';
    dashboardAmazonPayDetails.style.display = 'none';
    selectedPaymentMethod = null;
    dashboardPaymentOptionButtons.forEach(b => b.classList.remove('selected-payment'));
}

function showDashboardReceipt(booking) {
    dashboardReceiptDate.textContent = new Date().toLocaleString();
    dashboardReceiptGuestName.textContent = booking.guestName;
    dashboardReceiptContact.textContent = booking.contactNumber;
    dashboardReceiptRoomNumber.textContent = booking.roomNumber;
    dashboardReceiptRoomType.textContent = booking.roomType;
    dashboardReceiptGuests.textContent = booking.guestCount;
    dashboardReceiptSubtotal.textContent = booking.subtotal.toFixed(2);
    dashboardReceiptGST.textContent = booking.gst.toFixed(2);
    dashboardReceiptTotal.textContent = booking.total.toFixed(2);
    dashboardReceiptPaymentMethod.textContent = booking.paymentMethod.toUpperCase();
    if (booking.discount > 0) {
        dashboardReceiptCouponLine.style.display = 'block';
        dashboardReceiptCouponDiscount.textContent = booking.discount.toFixed(2);
    } else {
        dashboardReceiptCouponLine.style.display = 'none';
    }
    paymentSection.classList.add('hidden');
    dashboardProcessingSection.classList.add('hidden');
    dashboardReceiptSection.classList.remove('hidden');
}

async function processDashboardPayment() {
    paymentSection.classList.add('hidden');
    dashboardProcessingSection.classList.remove('hidden');
    setTimeout(async () => {
        const subtotal = pendingBooking.amount;
        const discount = dashboardCouponUsed ? subtotal * 0.25 : 0;
        const discountedSubtotal = subtotal - discount;
        const gst = discountedSubtotal * 0.18;
        const total = discountedSubtotal + gst;
        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomNumber: pendingBooking.roomNumber, guestName: pendingBooking.guestName, days: pendingBooking.days || 1 })
            });
            const result = await response.json();
            if (!result.success) {
                dashboardProcessingSection.classList.add('hidden');
                paymentSection.classList.remove('hidden');
                dashboardPaymentMessage.textContent = result.message || 'Booking failed during payment.';
                dashboardPaymentMessage.style.color = '#f87171';
                return;
            }
        } catch (error) {
            dashboardProcessingSection.classList.add('hidden');
            paymentSection.classList.remove('hidden');
            dashboardPaymentMessage.textContent = 'Unable to complete booking. Please try again.';
            dashboardPaymentMessage.style.color = '#f87171';
            return;
        }
        const booking = {
            ...pendingBooking,
            date: new Date().toISOString(),
            paymentMethod: selectedPaymentMethod,
            subtotal,
            discount,
            gst,
            total,
            status: 'Paid'
        };
        saveBooking(booking);
        // store last receipt and navigate to separate receipt page
        try {
            localStorage.setItem('hotel_last_receipt', JSON.stringify(booking));
        } catch (e) { /* ignore */ }
        dashboardProcessingSection.classList.add('hidden');
        window.open('receipt.html', '_self');
    }, 3000);
}

function saveBooking(booking) {
    const email = getCurrentUserEmail();
    if (!email) return;
    const bookings = JSON.parse(localStorage.getItem(`hotel_bookings_${email}`) || '[]');
    bookings.unshift(booking);
    localStorage.setItem(`hotel_bookings_${email}`, JSON.stringify(bookings));
}

dashboardApplyCouponBtn.addEventListener('click', applyDashboardCoupon);

dashboardPaymentOptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedPaymentMethod = btn.dataset.method;
        dashboardPaymentOptionButtons.forEach(b => b.classList.toggle('selected-payment', b === btn));
        dashboardPaymentDetailsForm.style.display = 'block';
        dashboardUpiDetails.style.display = 'none';
        dashboardCreditCardDetails.style.display = 'none';
        dashboardAmazonPayDetails.style.display = 'none';
        if (selectedPaymentMethod === 'upi') {
            dashboardPaymentMethodTitle.textContent = 'UPI Payment Details';
            dashboardUpiDetails.style.display = 'block';
        } else if (selectedPaymentMethod === 'creditCard') {
            dashboardPaymentMethodTitle.textContent = 'Credit Card Details';
            dashboardCreditCardDetails.style.display = 'block';
        } else if (selectedPaymentMethod === 'amazonPay') {
            dashboardPaymentMethodTitle.textContent = 'Amazon Pay Details';
            dashboardAmazonPayDetails.style.display = 'block';
        }
    });
});

function handleDashboardPaymentSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    console.log('dashboardPaymentForm submit handler invoked. selectedPaymentMethod=', selectedPaymentMethod);
    if (!selectedPaymentMethod) {
        dashboardPaymentMessage.textContent = 'Please choose a payment method.';
        dashboardPaymentMessage.style.color = '#f87171';
        return;
    }
    let detailsValid = false;
    if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('dashboardUpiId').value.trim();
        const left = upiId.includes('@') ? upiId.split('@')[0] : upiId;
        detailsValid = /^[\w.-]{2,}$/.test(left);
    } else if (selectedPaymentMethod === 'creditCard') {
        const cardNumber = document.getElementById('dashboardCardNumber').value.trim().replace(/\s+/g, '');
        const expiry = document.getElementById('dashboardCardExpiry').value.trim();
        const cvv = document.getElementById('dashboardCardCVV').value.trim();
        const name = document.getElementById('dashboardCardHolderName').value.trim();
        detailsValid = /^\d{16}$/.test(cardNumber) && /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3}$/.test(cvv) && name.length > 0;
    } else if (selectedPaymentMethod === 'amazonPay') {
        const email = document.getElementById('dashboardAmazonEmail').value.trim();
        detailsValid = /^\S+@\S+\.\S+$/.test(email);
    }
    if (!detailsValid) {
        dashboardPaymentMessage.textContent = 'Please enter valid payment details.';
        dashboardPaymentMessage.style.color = '#f87171';
        return;
    }
    dashboardPaymentMessage.textContent = '';
    console.log('payment details valid, calling processDashboardPayment()');
    if (!paymentDetailsVerified) {
        dashboardPaymentMessage.textContent = 'Please verify payment details before completing payment.';
        dashboardPaymentMessage.style.color = '#f87171';
        return;
    }
    processDashboardPayment();
}

dashboardPaymentForm.addEventListener('submit', handleDashboardPaymentSubmit);

// Ensure the Complete Payment button triggers submit in all cases
if (dashboardCompletePaymentBtn) {
    dashboardCompletePaymentBtn.addEventListener('click', (e) => {
        console.log('Complete Payment button clicked — forwarding to form submit');
        // Call the handler directly to avoid browser constraint-validation blocking synthetic submits
        try {
            handleDashboardPaymentSubmit();
        } catch (err) {
            console.error('Error invoking payment submit handler:', err);
        }
    });
}

// Verify payment details button behavior
if (dashboardVerifyPaymentBtn) {
    dashboardVerifyPaymentBtn.addEventListener('click', () => {
        dashboardPaymentMessage.textContent = '';
        // perform same validation as submit without processing
        if (!selectedPaymentMethod) {
            dashboardPaymentMessage.textContent = 'Please choose a payment method to verify.';
            dashboardPaymentMessage.style.color = '#f87171';
            paymentDetailsVerified = false;
            dashboardCompletePaymentBtn.disabled = true;
            return;
        }
        let valid = false;
            if (selectedPaymentMethod === 'upi') {
                const upiId = document.getElementById('dashboardUpiId').value.trim();
                const left = upiId.includes('@') ? upiId.split('@')[0] : upiId;
                valid = /^[\w.-]{2,}$/.test(left);
        } else if (selectedPaymentMethod === 'creditCard') {
            const cardNumber = document.getElementById('dashboardCardNumber').value.trim().replace(/\s+/g, '');
            const expiry = document.getElementById('dashboardCardExpiry').value.trim();
            const cvv = document.getElementById('dashboardCardCVV').value.trim();
            const name = document.getElementById('dashboardCardHolderName').value.trim();
            valid = /^\d{16}$/.test(cardNumber) && /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3}$/.test(cvv) && name.length > 0;
        } else if (selectedPaymentMethod === 'amazonPay') {
            const email = document.getElementById('dashboardAmazonEmail').value.trim();
            valid = /^\S+@\S+\.\S+$/.test(email);
        }
        if (!valid) {
            dashboardPaymentMessage.textContent = 'Payment details verification failed. Please correct the fields.';
            dashboardPaymentMessage.style.color = '#f87171';
            paymentDetailsVerified = false;
            dashboardCompletePaymentBtn.disabled = true;
            return;
        }
        paymentDetailsVerified = true;
        dashboardCompletePaymentBtn.disabled = false;
        dashboardPaymentMessage.textContent = 'Payment details verified. You can now complete the payment.';
        dashboardPaymentMessage.style.color = '#34d399';
    });
}

dashboardCancelPaymentBtn.addEventListener('click', () => {
    closePaymentSection();
});

dashboardDownloadReceiptBtn.addEventListener('click', () => {
    const receiptText = document.getElementById('dashboardReceiptContent').innerText;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptText));
    element.setAttribute('download', `hotel_receipt_${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
});

dashboardBackToHomeBtn.addEventListener('click', () => {
    window.open('index.html', '_self');
});

btnBookRoomDash.addEventListener('click', () => {
    btnBookRoomDash.classList.add('active');
    btnAvailableRoomsDash.classList.remove('active');
    bookingCard.classList.remove('hidden');
    availableRoomsCard.classList.add('hidden');
});

btnAvailableRoomsDash.addEventListener('click', () => {
    btnAvailableRoomsDash.classList.add('active');
    btnBookRoomDash.classList.remove('active');
    bookingCard.classList.add('hidden');
    availableRoomsCard.classList.remove('hidden');
});

accountButton.addEventListener('click', () => {
    accountDropdown.classList.toggle('hidden');
});

window.addEventListener('click', event => {
    if (!document.getElementById('userArea').contains(event.target)) {
        accountDropdown.classList.add('hidden');
    }
});

signOut.addEventListener('click', ()=>{
    localStorage.removeItem('hotel_current_user');
    window.open('index.html', '_self');
});

window.addEventListener('load', ()=>{
    if (!ensureSignedIn()) return;
    userNameDropdown.textContent = userName.textContent;
    loadRoomsDash();
});

// Account menu links
if (accountHome) accountHome.addEventListener('click', ()=> window.open('index.html','_self'));
if (accountPayments) accountPayments.addEventListener('click', ()=> window.open('payment_history.html','_self'));
if (accountBookings) accountBookings.addEventListener('click', ()=> window.open('bookings.html','_self'));
if (accountCancelBooking) {
    accountCancelBooking.addEventListener('click', () => {
        const email = getCurrentUserEmail();
        if (!email) { alert('Please sign in first.'); return; }
        const bookings = JSON.parse(localStorage.getItem(`hotel_bookings_${email}`) || '[]');
        if (!bookings || bookings.length === 0) { alert('No bookings to cancel.'); return; }

        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.55)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';

        const box = document.createElement('div');
        box.style.background = '#fff';
        box.style.padding = '20px';
        box.style.maxWidth = '640px';
        box.style.width = '92%';
        box.style.maxHeight = '84%';
        box.style.overflow = 'auto';
        box.style.borderRadius = '16px';
        box.style.color = '#0f172a';
        box.style.boxShadow = '0 24px 80px rgba(0,0,0,0.24)';

        const title = document.createElement('h3');
        title.textContent = 'Select bookings to cancel';
        box.appendChild(title);

        const list = document.createElement('div');
        bookings.forEach((b, idx) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.padding = '10px 0';
            row.style.borderBottom = '1px solid rgba(15,23,42,0.08)';

            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '10px';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.dataset.idx = idx;
            left.appendChild(cb);
            left.appendChild(document.createTextNode(`Room ${b.roomNumber} — ${b.guestName} (${b.days || b.bookingDays || 1} day(s))`));
            row.appendChild(left);

            const info = document.createElement('div');
            info.style.fontSize = '0.9em';
            info.style.color = '#475569';
            info.textContent = b.date ? new Date(b.date).toLocaleString() : 'Unknown date';
            row.appendChild(info);

            list.appendChild(row);
        });
        box.appendChild(list);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '12px';
        actions.style.marginTop = '16px';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.className = 'small-btn';
        closeBtn.addEventListener('click', () => document.body.removeChild(modal));

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel Selected';
        cancelBtn.className = 'small-btn';
        cancelBtn.style.background = '#f87171';
        cancelBtn.addEventListener('click', async () => {
            const checked = Array.from(list.querySelectorAll('input[type=checkbox]:checked'));
            if (checked.length === 0) { alert('Select at least one booking to cancel.'); return; }
            if (!confirm(`Cancel ${checked.length} selected booking(s)?`)) return;
            cancelBtn.disabled = true;
            let anyFailed = false;
            const removeIdx = [];
            for (const cb of checked) {
                const idx = parseInt(cb.dataset.idx, 10);
                const booking = bookings[idx];
                try {
                    const resp = await fetch(new URL('/api/cancel', window.location.origin).href, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ roomNumber: booking.roomNumber })
                    });
                    const text = await resp.text();
                    if (!resp.ok) {
                        alert(`Server returned ${resp.status}: ${text}`);
                        anyFailed = true;
                        continue;
                    }
                    let data = null;
                    try { data = JSON.parse(text); } catch(e) { alert('Invalid server response: '+text); anyFailed = true; continue; }
                    if (data.success) {
                        removeIdx.push(idx);
                    } else if (data.message && data.message.toLowerCase().includes('not currently booked')) {
                        removeIdx.push(idx);
                    } else {
                        anyFailed = true;
                    }
                } catch (e) {
                    alert('Cancellation failed: '+e);
                    anyFailed = true;
                }
            }
            if (removeIdx.length > 0) {
                removeIdx.sort((a,b)=>b-a).forEach(i => bookings.splice(i,1));
                localStorage.setItem(`hotel_bookings_${email}`, JSON.stringify(bookings));
            }
            if (removeIdx.length > 0) alert(`${removeIdx.length} booking(s) cancelled or cleaned up.`);
            if (anyFailed) alert('Some cancellations failed. Refresh and try again.');
            document.body.removeChild(modal);
            loadRoomsDash();
        });

        actions.appendChild(closeBtn);
        actions.appendChild(cancelBtn);
        box.appendChild(actions);
        modal.appendChild(box);
        document.body.appendChild(modal);
    });
}
