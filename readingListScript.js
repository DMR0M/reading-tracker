const readingListContainer = document.querySelector(".row-reading-list-container");
let readingListBooks = JSON.parse(localStorage.getItem("readingListBooks")) || [];

console.log(readingListBooks);


// Function to render the reading list page
function renderPage() {
    readingListContainer.innerHTML = '';
    let readingListBooks = JSON.parse(localStorage.getItem('readingListBooks')) || [];
    readingListBooks.forEach(bookData => {
        const bookRowData = createRow(bookData);
        readingListContainer.appendChild(bookRowData);
    });
}

// Function to create a row for each book
function createRow(bookData) {
    const row = document.createElement('div');
    row.className = 'row-result row';

    let badgeStatus = "secondary";
    let badgeText = "Want To Read";
    switch (bookData.status) {
        case "Currently Reading":
            badgeStatus = "primary";
            badgeText = "Currently Reading";
            break;
        case "Done Reading":
            badgeStatus = "success";
            badgeText = "Done Reading";
            break;
        default:
            badgeStatus = "secondary";
    }

    row.innerHTML = `
        <div class="col">${bookData.title}</div>
        <div class="col"><img src="${bookData.image}" alt="bookImage" class="img-fluid"></div>
        <div class="col">${bookData.author}</div>
        <div class="col">${bookData.publisher}</div>
        <div class="col"><span id="${bookData.id}" class="badge bg-${badgeStatus}">${badgeText}</span></div>
        <div class="col button-group d-flex flex-column">
            <button type="button" class="btn btn-sm btn-outline-secondary reset-btn mb-2">Reset</button>
            <button type="button" class="btn btn-sm btn-outline-primary reading-btn mb-2">Reading</button>
            <button type="button" class="btn btn-sm btn-outline-success done-btn mb-2">Done</button>
        </div>
        <div class="col">
            <button type="button" class="btn btn-sm btn-outline-danger remove-btn d-block mb-2">Remove</button>
        </div>
    `;

    // Add the remove button functionality
    const removeBtn = row.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (event) => {
        removeBookRowData(bookData.id);
        renderPage(); // Re-render the page after removal
    });

    // Button event to set status to "Want To Read"
    const resetBtn = row.querySelector('.reset-btn');
    resetBtn.addEventListener('click', (event) => {
        updateStatus("Want To Read", bookData.id);
        console.log(readingListBooks);
    });

    // Button event to set status to "Currently Reading"
    const readingBtn = row.querySelector('.reading-btn');
    readingBtn.addEventListener('click', (event) => {
        updateStatus("Currently Reading", bookData.id);
        console.log(readingListBooks);
    });

    // Button event to set status to "Done Reading"
    const doneBtn = row.querySelector('.done-btn');
    doneBtn.addEventListener('click', (event) => {
        updateStatus("Done Reading", bookData.id);
        console.log(readingListBooks);
    });

    return row;
}

// Function to remove the book from localStorage
function removeBookRowData(bookId) {
    let storedItems = JSON.parse(localStorage.getItem('readingListBooks')) || [];
    let updatedReadingListBooks = storedItems.filter(book => book.id !== bookId);
    localStorage.setItem("readingListBooks", JSON.stringify(updatedReadingListBooks));
}

function updateStatus(status, bookId) {
    const statusBadge = document.getElementById(bookId);
    let storedItems = JSON.parse(localStorage.getItem('readingListBooks')) || [];

    switch (status) {
        case "Want To Read":
            if (statusBadge) {
                while (statusBadge.classList.length > 0) {
                    statusBadge.classList.remove(statusBadge.classList.item(0));
                }
            }
            statusBadge.innerText = "Want To Read";
            statusBadge.classList.add('badge', 'bg-secondary');
            break
        case "Currently Reading":
            if (statusBadge) {
                while (statusBadge.classList.length > 0) {
                    statusBadge.classList.remove(statusBadge.classList.item(0));
                }
            }
            statusBadge.innerText = "Currently Reading";
            statusBadge.classList.add('badge', 'bg-primary');
            break;
        case "Done Reading":
            if (statusBadge) {
                while (statusBadge.classList.length > 0) {
                    statusBadge.classList.remove(statusBadge.classList.item(0));
                }
            }
            statusBadge.innerText = "Done Reading";
            statusBadge.classList.add('badge', 'bg-success');
            break;
        default:
            statusBadge.classList.add('badge', 'bg-secondary');
    }

    const bookIndex = storedItems.findIndex(book => book.id === bookId);

    if (bookIndex !== -1) {
        storedItems[bookIndex].status = status;
    }

    localStorage.setItem("readingListBooks", JSON.stringify(storedItems));
}

// Call renderPage initially to display the list
renderPage();