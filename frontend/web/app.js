const sections = {
    home: document.getElementById('homePage'),
    login: document.getElementById('loginPage'),
    register: document.getElementById('registerPage'),
    dashboard: document.getElementById('dashboardPage')
};

let selectedRoomData = null;
let bookingData = null;
let couponApplied = false;
let selectedPaymentMethod = null;
let idVerified = false;

const navLinks = document.querySelectorAll('.nav-link');
const accountArea = document.getElementById('accountArea');
const accountButton = document.getElementById('accountButton');
const accountDropdown = document.getElementById('accountDropdown');
const accountName = document.getElementById('accountName');
const accountEmail = document.getElementById('accountEmail');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const bookingForm = document.getElementById('bookingForm');
const refreshRoomsButton = document.getElementById('refreshRooms');
const availableRoomsSection = document.getElementById('availableRoomsSection');
const availableRoomsList = document.getElementById('availableRoomsList');
const availableCount = document.getElementById('availableCount');
const bookingMessage = document.getElementById('bookingMessage');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const verifyIdBtn = document.getElementById('verifyIdBtn');
const verifyStatus = document.getElementById('verifyStatus');
const submitBookingBtn = document.getElementById('submitBookingBtn');
const guestContactInput = document.getElementById('guestContact');
const btnBookRoom = document.getElementById('btnBookRoom');
const btnAvailableRooms = document.getElementById('btnAvailableRooms');
const bookingSection = document.getElementById('bookingSection');
const paymentSection = document.getElementById('paymentSection');
const processingSection = document.getElementById('processingSection');
const receiptSection = document.getElementById('receiptSection');
const historySection = document.getElementById('historySection');
const historyList = document.getElementById('historyList');
const paymentList = document.getElementById('paymentList');
const signOutBtn = document.getElementById('signOutBtn');
const accountHomeBtn = document.getElementById('accountHomeBtn');
const accountPaymentsBtn = document.getElementById('accountPaymentsBtn');
const accountBookingsBtn = document.getElementById('accountBookingsBtn');
const accountCancelBookingBtn = document.getElementById('accountCancelBookingBtn');
const couponCodeInput = document.getElementById('couponCode');
const couponMessage = document.getElementById('couponMessage');
const couponAppliedLine = document.getElementById('couponApplied');
const couponDiscountSpan = document.getElementById('couponDiscount');
const paymentDetailsForm = document.getElementById('paymentDetailsForm');
const paymentMethodTitle = document.getElementById('paymentMethodTitle');
const paymentForm = document.getElementById('paymentForm');
const upiDetails = document.getElementById('upiDetails');
const creditCardDetails = document.getElementById('creditCardDetails');
const amazonPayDetails = document.getElementById('amazonPayDetails');
const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const paymentOptionButtons = document.querySelectorAll('.payment-option-btn');

function getUsers() {
    return JSON.parse(localStorage.getItem('hotel_users') || '{}');
}

function saveUsers(users) {
    localStorage.setItem('hotel_users', JSON.stringify(users));
}

function getCurrentUserEmail() {
    return localStorage.getItem('hotel_current_user');
}

function setCurrentUserEmail(email) {
    localStorage.setItem('hotel_current_user', email);
}

function clearCurrentUser() {
    localStorage.removeItem('hotel_current_user');
}

function getCurrentUser() {
    const email = getCurrentUserEmail();
    if (!email) return null;
    return getUsers()[email] || null;
}

function getUserBookings(email) {
    return JSON.parse(localStorage.getItem(`hotel_bookings_${email}`) || '[]');
}

function saveUserBooking(email, booking) {
    const bookings = getUserBookings(email);
    bookings.unshift(booking);
    localStorage.setItem(`hotel_bookings_${email}`, JSON.stringify(bookings));
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

function route() {
    const hash = (location.hash || '#home').replace('#', '');
    if (hash === 'dashboard' && !getCurrentUser()) {
        showSection('login');
        location.hash = '#login';
        return;
    }
    if (!['home', 'login', 'register', 'dashboard'].includes(hash)) {
        showSection('home');
        location.hash = '#home';
        return;
    }
    showSection(hash);
}

function showSection(name) {
    const sectionMap = {
        home: document.getElementById('homePage'),
        login: document.getElementById('loginPage'),
        register: document.getElementById('registerPage'),
        dashboard: document.getElementById('dashboardPage')
    };
    Object.entries(sectionMap).forEach(([key, section]) => {
        section.classList.toggle('active', key === name);
        section.classList.toggle('hidden', key !== name);
    });
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.target === name));
    if (name === 'dashboard') {
        showDashboardPanels('available');
        loadRooms();
        updateHistory();
    }
}

function updateAccountArea() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        accountArea.classList.remove('hidden');
        accountName.textContent = currentUser.name;
        accountEmail.textContent = currentUser.email;
        navLinks.forEach(link => {
            if (link.dataset.target === 'login' || link.dataset.target === 'register') {
                link.classList.add('hidden');
            }
        });
    } else {
        accountArea.classList.add('hidden');
        navLinks.forEach(link => link.classList.remove('hidden'));
    }
}

// account dropdown links (index page)
if (accountHomeBtn) accountHomeBtn.addEventListener('click', ()=> window.open('index.html','_self'));
if (accountPaymentsBtn) accountPaymentsBtn.addEventListener('click', ()=> window.open('payment_history.html','_self'));
if (accountBookingsBtn) accountBookingsBtn.addEventListener('click', ()=> window.open('bookings.html','_self'));
if (accountCancelBookingBtn) {
    accountCancelBookingBtn.addEventListener('click', () => {
        const email = getCurrentUserEmail();
        if (!email) { alert('Please sign in first.'); return; }
        const bookings = getUserBookings(email);
        if (!bookings || bookings.length === 0) { alert('No bookings to cancel.'); return; }

        // Build modal
        const modal = document.createElement('div');
        modal.id = 'cancelModal';
        modal.style.position = 'fixed';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';

        const box = document.createElement('div');
        box.style.background = '#fff';
        box.style.padding = '20px';
        box.style.maxWidth = '600px';
        box.style.width = '90%';
        box.style.maxHeight = '80%';
        box.style.overflow = 'auto';
        box.style.borderRadius = '8px';
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
            row.style.padding = '8px 0';
            row.style.color = '#0f172a';
            row.style.borderBottom = '1px solid rgba(15,23,42,0.1)';
            const left = document.createElement('div');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.dataset.idx = idx;
            left.appendChild(cb);
            left.appendChild(document.createTextNode(` Room ${b.roomNumber} — ${b.guestName} (${b.bookingDays || 1} day(s))`));
            row.appendChild(left);
            const info = document.createElement('div');
            info.style.fontSize = '0.9em';
            info.style.color = '#475569';
            info.textContent = new Date(b.date || Date.now()).toLocaleString();
            row.appendChild(info);
            list.appendChild(row);
        });
        box.appendChild(list);

        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.style.gap = '10px';
        actions.style.marginTop = '12px';

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
            if (!confirm(`Cancel ${checked.length} booking(s)? This will release the room(s).`)) return;
            cancelBtn.disabled = true;
            let anyFailed = false;
            // Collect indices to remove from bookings
            const removeIdx = [];
            for (const cb of checked) {
                const idx = parseInt(cb.dataset.idx, 10);
                const booking = bookings[idx];
                try {
                    const cancelUrl = new URL('/api/cancel', window.location.origin).href;
                    const resp = await fetch(cancelUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ roomNumber: booking.roomNumber }) });
                    const text = await resp.text();
                    if (!resp.ok) {
                        alert(`Server returned ${resp.status}: ${text}`);
                        anyFailed = true;
                        continue;
                    }
                    // Try to parse JSON only when server returned OK
                    let data = null;
                    try { data = JSON.parse(text); } catch(e) { alert('Server response parse error: '+e+'\n'+text); anyFailed = true; continue; }
                    if (data && data.success) {
                        removeIdx.push(idx);
                    } else {
                        if (data && data.message && data.message.toLowerCase().includes('not currently booked')) {
                            // stale local booking entry; remove it from local storage
                            removeIdx.push(idx);
                        } else {
                            anyFailed = true;
                        }
                    }
                } catch (e) {
                    alert('Network or fetch error: '+e);
                    anyFailed = true;
                }
            }
            // Remove cancelled bookings from localStorage (by indices)
            if (removeIdx.length > 0) {
                // remove in descending order to keep indices valid
                removeIdx.sort((a,b)=>b-a).forEach(i => bookings.splice(i,1));
                localStorage.setItem(`hotel_bookings_${email}`, JSON.stringify(bookings));
            }
            if (removeIdx.length > 0) alert(`${removeIdx.length} booking(s) cancelled.`);
            if (anyFailed) alert('Some cancellations failed. Refresh and try again.');
            document.body.removeChild(modal);
            // Refresh rooms on dashboard
            if (location.pathname.endsWith('dashboard.html')) loadRooms();
        });

        actions.appendChild(closeBtn);
        actions.appendChild(cancelBtn);
        box.appendChild(actions);
        modal.appendChild(box);
        document.body.appendChild(modal);
    });
}

async function loadRooms() {
    try {
        const response = await fetch('/api/rooms');
        currentRooms = await response.json();
        renderRooms(currentRooms);
    } catch (error) {
        availableRoomsList.innerHTML = `<p>Unable to load rooms: ${error}</p>`;
    }
}

function renderRooms(rooms) {
    const availableRooms = rooms.filter(room => !room.booked);
    availableCount.textContent = availableRooms.length;
    if (availableRooms.length === 0) {
        availableRoomsList.innerHTML = '<p>No rooms are currently available.</p>';
        return;
    }
    availableRoomsList.innerHTML = availableRooms.map(room => `
        <div class="room-item">
            <strong>Room ${room.number}</strong>
            <span>Type: ${room.type}</span>
            <span>Max Guests: ${room.maxGuests}</span>
            <span>Price: ₹${room.pricePerDay}/day (excl. GST)</span>
            <span>Status: Available</span>
            <button type="button" class="small-btn select-room-btn" data-room-number="${room.number}">Select</button>
        </div>
    `).join('');
    document.querySelectorAll('.select-room-btn').forEach(btn => {
        btn.addEventListener('click', () => selectRoom(parseInt(btn.dataset.roomNumber, 10)));
    });
}

function selectRoom(roomNumber) {
    const room = currentRooms.find(r => r.number === roomNumber && !r.booked);
    if (!room) return;
    selectedRoomData = room;
    document.getElementById('roomNumber').value = room.number;
    document.getElementById('guestLimitInfo').textContent = `Max ${room.maxGuests} guests allowed`;
    toggleActiveSidebar(btnBookRoom);
    showDashboardPanels('book');
    setTimeout(() => bookingSection.scrollIntoView({ behavior: 'smooth' }), 100);
}

function toggleActiveSidebar(button) {
    [btnBookRoom, btnAvailableRooms].forEach(btn => btn.classList.toggle('active', btn === button));
}

function showDashboardPanels(panel) {
    bookingSection.classList.toggle('hidden', panel !== 'book');
    availableRoomsSection.classList.toggle('hidden', panel !== 'available');
    historySection.classList.toggle('hidden', panel !== 'history');
    paymentSection.classList.toggle('hidden', panel !== 'payment');
    processingSection.classList.toggle('hidden', panel !== 'processing');
    receiptSection.classList.toggle('hidden', panel !== 'receipt');
}

function updateHistory() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        historyList.innerHTML = '<p>Please sign in to view bookings.</p>';
        paymentList.innerHTML = '<p>Please sign in to view payments.</p>';
        return;
    }
    const bookings = getUserBookings(currentUser.email);
    if (bookings.length === 0) {
        historyList.innerHTML = '<p>No bookings yet.</p>';
    } else {
        historyList.innerHTML = bookings.map(b => {
            const days = b.bookingDays || 1;
            const dateText = b.date ? new Date(b.date).toLocaleString() : 'Unknown date';
            const amountText = b.total !== undefined ? `₹${b.total.toFixed(2)}` : 'N/A';
            return `
            <div class="history-item">
                <strong>Room ${b.roomNumber}</strong>
                <span>Guest: ${b.guestName}</span>
                <span>Days: ${days}</span>
                <span>Guests: ${b.guestCount}</span>
                <span>ID: ${b.idType}</span>
                <span>Date: ${dateText}</span>
                <span>Amount: ${amountText}</span>
                <span>Status: ${b.status || 'Paid'}</span>
            </div>
        `;
        }).join('');
    }
    paymentList.innerHTML = '<div class="payment-item"><strong>No payment records yet.</strong><span>Your payment history will appear here after booking.</span></div>';
}

function setMessage(element, text, color = '#fbbf24') {
    element.textContent = text;
    element.style.color = color;
}

registerForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim().toLowerCase();
    const password = document.getElementById('registerPassword').value;
    if (!name || !email || !password) {
        setMessage(registerMessage, 'Please complete all sign-up fields.', '#f87171');
        return;
    }
    const users = getUsers();
    if (users[email]) {
        setMessage(registerMessage, 'This email already has an account.', '#f87171');
        return;
    }
    users[email] = { name, email, password };
    saveUsers(users);
    setMessage(registerMessage, 'Account created. Redirecting to login...', '#34d399');
    setTimeout(() => {
        location.hash = '#login';
        route();
    }, 1100);
});

loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();
    const user = users[email];
    if (!user || user.password !== password) {
        setMessage(loginMessage, 'Invalid email or password.', '#f87171');
        return;
    }
    setCurrentUserEmail(email);
    updateAccountArea();
    setMessage(loginMessage, 'Signed in successfully. Loading dashboard...', '#34d399');
    setTimeout(() => {
        location.hash = '#dashboard';
        route();
    }, 700);
});

document.getElementById('roomNumber').addEventListener('change', () => {
    const roomNumber = parseInt(document.getElementById('roomNumber').value, 10);
    const room = currentRooms.find(r => r.number === roomNumber);
    if (room) {
        selectedRoomData = room;
        document.getElementById('guestLimitInfo').textContent = `Max ${room.maxGuests} guests allowed`;
        const guestCountInput = document.getElementById('guestCount');
        guestCountInput.max = room.maxGuests;
        if (parseInt(guestCountInput.value, 10) > room.maxGuests) {
            guestCountInput.value = room.maxGuests;
        }
    }
});

document.getElementById('guestCount').addEventListener('change', () => {
    if (!selectedRoomData) return;
    const guestCountInput = document.getElementById('guestCount');
    let guestCount = parseInt(guestCountInput.value, 10);
    if (Number.isNaN(guestCount) || guestCount < 1) {
        guestCountInput.value = 1;
        guestCount = 1;
    }
    if (guestCount > selectedRoomData.maxGuests) {
        alert(`Limit exceeded! This room allows maximum ${selectedRoomData.maxGuests} guests.`);
        guestCountInput.value = selectedRoomData.maxGuests;
    }
});

verifyIdBtn.addEventListener('click', () => {
    const idType = document.getElementById('guestIdType').value;
    const idNumber = document.getElementById('guestIdNumber').value.trim();
    if (!idType || !idNumber) {
        verifyStatus.textContent = 'Select an ID type and enter the ID number.';
        verifyStatus.style.color = '#f87171';
        idVerified = false;
        submitBookingBtn.disabled = true;
        return;
    }
    let valid = false;
    if (idType === 'Aadhaar Card') {
        valid = isValidAadhaar(idNumber);
    } else if (idType === 'Driving Licence') {
        valid = isValidDrivingLicence(idNumber);
    }
    if (!valid) {
        verifyStatus.textContent = `Invalid ${idType} format.`;
        verifyStatus.style.color = '#f87171';
        idVerified = false;
        submitBookingBtn.disabled = true;
        return;
    }
    const masked = idNumber.length > 4 ? '****' + idNumber.slice(-4) : idNumber;
    const confirmMsg = `Please confirm the ${idType} to verify:\nType: ${idType}\nID: ${masked}\n\nProceed?`;
    if (!window.confirm(confirmMsg)) {
        verifyStatus.textContent = `${idType} verification cancelled.`;
        verifyStatus.style.color = '#f87171';
        idVerified = false;
        submitBookingBtn.disabled = true;
        return;
    }
    verifyStatus.textContent = `Verified ${idType}`;
    verifyStatus.style.color = '#34d399';
    idVerified = true;
    submitBookingBtn.disabled = false;
});

bookingForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!idVerified) {
        setMessage(bookingMessage, 'Please verify your guest ID before proceeding.', '#f87171');
        return;
    }
    const roomNumber = parseInt(document.getElementById('roomNumber').value, 10);
    const guestName = document.getElementById('guestName').value.trim();
    const guestContact = guestContactInput.value.trim();
    const guestCount = parseInt(document.getElementById('guestCount').value, 10);
    const bookingDays = parseInt(document.getElementById('bookingDays').value, 10);
    const idType = document.getElementById('guestIdType').value;
    const idNumber = document.getElementById('guestIdNumber').value.trim();
    if (!roomNumber || !guestName || !guestContact || !guestCount || !bookingDays || !idType || !idNumber) {
        setMessage(bookingMessage, 'Please complete all booking details.', '#f87171');
        return;
    }
    if (!isValidContactNumber(guestContact)) {
        setMessage(bookingMessage, 'Please enter a valid 10-digit contact number.', '#f87171');
        return;
    }
    if (!selectedRoomData || selectedRoomData.number !== roomNumber) {
        setMessage(bookingMessage, 'Selected room does not match.', '#f87171');
        return;
    }
    if (guestCount > selectedRoomData.maxGuests) {
        alert(`Limit exceeded! This room allows maximum ${selectedRoomData.maxGuests} guests.`);
        return;
    }
    bookingData = {
        roomNumber,
        guestName,
        guestContact,
        guestCount,
        bookingDays,
        idType,
        idNumber,
        pricePerDay: selectedRoomData.pricePerDay,
        roomType: selectedRoomData.type
    };
    goToPaymentPage();
});

function goToPaymentPage() {
    const subtotal = bookingData.pricePerDay * bookingData.bookingDays;
    document.getElementById('payRoomNumber').textContent = bookingData.roomNumber;
    document.getElementById('payGuestName').textContent = bookingData.guestName;
    document.getElementById('payDays').textContent = bookingData.bookingDays;
    document.getElementById('paySubtotal').textContent = subtotal.toFixed(2);
    document.getElementById('payGST').textContent = (subtotal * 0.18).toFixed(2);
    document.getElementById('payTotal').textContent = (subtotal * 1.18).toFixed(2);
    couponApplied = false;
    couponCodeInput.value = '';
    couponAppliedLine.style.display = 'none';
    couponMessage.textContent = '';
    paymentDetailsForm.style.display = 'none';
    selectedPaymentMethod = null;
    paymentOptionButtons.forEach(btn => btn.classList.remove('selected-payment'));
    showDashboardPanels('payment');
    setTimeout(() => paymentSection.scrollIntoView({ behavior: 'smooth' }), 100);
}

document.getElementById('applyCouponBtn').addEventListener('click', () => {
    const couponCode = couponCodeInput.value.trim();
    const subtotal = bookingData.pricePerDay * bookingData.bookingDays;
    if (couponCode === 'Naman@25') {
        couponApplied = true;
        const discount = subtotal * 0.25;
        const discountedSubtotal = subtotal - discount;
        const gst = discountedSubtotal * 0.18;
        const total = discountedSubtotal + gst;
        couponAppliedLine.style.display = 'block';
        couponDiscountSpan.textContent = discount.toFixed(2);
        document.getElementById('paySubtotal').textContent = subtotal.toFixed(2);
        document.getElementById('payGST').textContent = gst.toFixed(2);
        document.getElementById('payTotal').textContent = total.toFixed(2);
        setMessage(couponMessage, '✔ Coupon applied! 25% off total.', '#34d399');
    } else if (couponCode === '') {
        setMessage(couponMessage, 'Please enter coupon code.', '#f87171');
    } else {
        couponApplied = false;
        couponAppliedLine.style.display = 'none';
        const gst = subtotal * 0.18;
        document.getElementById('paySubtotal').textContent = subtotal.toFixed(2);
        document.getElementById('payGST').textContent = gst.toFixed(2);
        document.getElementById('payTotal').textContent = (subtotal + gst).toFixed(2);
        setMessage(couponMessage, 'Invalid coupon code.', '#f87171');
    }
});

paymentOptionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedPaymentMethod = btn.dataset.method;
        paymentOptionButtons.forEach(b => b.classList.toggle('selected-payment', b === btn));
        paymentDetailsForm.style.display = 'block';
        upiDetails.style.display = 'none';
        creditCardDetails.style.display = 'none';
        amazonPayDetails.style.display = 'none';
        if (selectedPaymentMethod === 'upi') {
            paymentMethodTitle.textContent = 'UPI Payment Details';
            upiDetails.style.display = 'block';
        } else if (selectedPaymentMethod === 'creditCard') {
            paymentMethodTitle.textContent = 'Credit Card Details';
            creditCardDetails.style.display = 'block';
        } else if (selectedPaymentMethod === 'amazonPay') {
            paymentMethodTitle.textContent = 'Amazon Pay Details';
            amazonPayDetails.style.display = 'block';
        }
    });
});

paymentForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!selectedPaymentMethod) {
        alert('Please choose a payment method.');
        return;
    }
    let detailsValid = false;
    if (selectedPaymentMethod === 'upi') {
        const upiId = document.getElementById('upiId').value.trim();
        detailsValid = /^[\w.-]+@[\w.-]+$/.test(upiId);
    } else if (selectedPaymentMethod === 'creditCard') {
        const cardNumber = document.getElementById('cardNumber').value.trim().replace(/\s+/g, '');
        const expiry = document.getElementById('cardExpiry').value.trim();
        const cvv = document.getElementById('cardCVV').value.trim();
        const name = document.getElementById('cardHolderName').value.trim();
        detailsValid = /^\d{16}$/.test(cardNumber) && /^\d{2}\/\d{2}$/.test(expiry) && /^\d{3}$/.test(cvv) && name.length > 0;
    } else if (selectedPaymentMethod === 'amazonPay') {
        const email = document.getElementById('amazonEmail').value.trim();
        detailsValid = /^\S+@\S+\.\S+$/.test(email);
    }
    if (!detailsValid) {
        alert('Please enter valid payment details.');
        return;
    }
    processPayment();
});

function processPayment() {
    showDashboardPanels('processing');
    processingSection.classList.toggle('hidden', false);
    setTimeout(() => completePayment(), 3000);
}

async function completePayment() {
    const subtotal = bookingData.pricePerDay * (bookingData.bookingDays || 1);
    const discount = couponApplied ? subtotal * 0.25 : 0;
    const discountedSubtotal = subtotal - discount;
    const gst = discountedSubtotal * 0.18;
    const total = discountedSubtotal + gst;
    const bookingDays = bookingData.bookingDays || 1;
    const booking = {
        roomNumber: bookingData.roomNumber,
        guestName: bookingData.guestName,
        contactNumber: bookingData.guestContact,
        guestCount: bookingData.guestCount,
        bookingDays,
        idType: bookingData.idType,
        idNumber: bookingData.idNumber,
        date: new Date().toISOString(),
        paymentMethod: selectedPaymentMethod,
        subtotal,
        discount,
        gst,
        total,
        status: 'Paid'
    };

    try {
        const response = await fetch(new URL('/api/book', window.location.origin).href, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomNumber: booking.roomNumber, guestName: booking.guestName, days: booking.bookingDays })
        });
        const resultText = await response.text();
        if (!response.ok) {
            const message = resultText || 'Booking request failed.';
            alert(`Booking failed: ${message}`);
            processingSection.classList.add('hidden');
            showDashboardPanels('payment');
            return;
        }
        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            alert('Unexpected booking response from server.');
            processingSection.classList.add('hidden');
            showDashboardPanels('payment');
            return;
        }
        if (!result.success) {
            alert(`Booking failed: ${result.message || 'Unknown error.'}`);
            processingSection.classList.add('hidden');
            showDashboardPanels('payment');
            return;
        }
    } catch (error) {
        alert('Unable to complete booking. Please try again.');
        processingSection.classList.add('hidden');
        showDashboardPanels('payment');
        return;
    }

    saveUserBooking(getCurrentUser().email, booking);
    showReceipt(booking);
}

function showReceipt(booking) {
    document.getElementById('receiptDate').textContent = new Date().toLocaleString();
    document.getElementById('receiptGuestName').textContent = booking.guestName;
    document.getElementById('receiptContact').textContent = booking.contactNumber || 'N/A';
    document.getElementById('receiptRoomNumber').textContent = booking.roomNumber;
    document.getElementById('receiptRoomType').textContent = bookingData.roomType;
    document.getElementById('receiptDays').textContent = booking.bookingDays;
    document.getElementById('receiptGuests').textContent = booking.guestCount;
    document.getElementById('receiptSubtotal').textContent = booking.subtotal.toFixed(2);
    document.getElementById('receiptGST').textContent = booking.gst.toFixed(2);
    document.getElementById('receiptTotal').textContent = booking.total.toFixed(2);
    document.getElementById('receiptPaymentMethod').textContent = booking.paymentMethod.toUpperCase();
    if (booking.discount > 0) {
        document.getElementById('receiptCouponLine').style.display = 'block';
        document.getElementById('receiptCouponDiscount').textContent = booking.discount.toFixed(2);
    } else {
        document.getElementById('receiptCouponLine').style.display = 'none';
    }
    showDashboardPanels('receipt');
    setTimeout(() => receiptSection.scrollIntoView({ behavior: 'smooth' }), 100);
}

downloadReceiptBtn.addEventListener('click', () => {
    const receiptText = document.getElementById('receiptContent').innerText;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptText));
    element.setAttribute('download', `hotel_receipt_${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
});

backToHomeBtn.addEventListener('click', () => {
    location.hash = '#home';
    route();
    loadRooms();
});

cancelPaymentBtn.addEventListener('click', () => {
    showDashboardPanels('book');
    setTimeout(() => bookingSection.scrollIntoView({ behavior: 'smooth' }), 100);
});

refreshRoomsButton.addEventListener('click', () => loadRooms());

accountButton.addEventListener('click', () => {
    accountDropdown.classList.toggle('hidden');
});

btnBookRoom.addEventListener('click', () => {
    toggleActiveSidebar(btnBookRoom);
    showDashboardPanels('book');
});

btnAvailableRooms.addEventListener('click', () => {
    toggleActiveSidebar(btnAvailableRooms);
    showDashboardPanels('available');
});

signOutBtn.addEventListener('click', () => {
    clearCurrentUser();
    updateAccountArea();
    location.hash = '#home';
    route();
});

window.addEventListener('click', event => {
    if (!accountArea.contains(event.target)) {
        accountDropdown.classList.add('hidden');
    }
});

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
    updateAccountArea();
    route();
    loadRooms();
});
