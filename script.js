const searchForm = document.querySelectorAll(".search-form");
const displayContainer = document.querySelector(".display-page");
const resultsContainer = document.querySelector('.row-results-container');
const bookExistingError = document.querySelector(".book-exist-alert");
const closeButton = document.querySelector(".btn-close");

let readingListBooks = JSON.parse(localStorage.getItem('readingListBooks')) || [];


for (const form of searchForm) {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        removeAllAlerts();
        fetchBookData();
    });
}

for (const form of searchForm) {
    form.addEventListener("click", (event) => {
        removeAllAlerts();
    });
}

closeButton.addEventListener("click", (event) => {
    removeAllAlerts();
});

async function fetchBookData(sortBy) {
    console.log("fetching book data...");
    let bookInputValue = "";
    let endpoint = "";

    if (sortBy === "byTitle") {
        bookInputValue = document.getElementById("bookInputTitle").value;
        endpoint = `https://openlibrary.org/search.json?title=${bookInputValue}`;
    } else if (sortBy === "byAuthor") {
        bookInputValue = document.getElementById("bookInputAuthor").value;
        endpoint = `https://openlibrary.org/search.json?author=${bookInputValue}`;
    } else {
        bookInputValue = document.getElementById("bookInputTitle").value;
        endpoint = `https://openlibrary.org/search.json?q=${bookInputValue}`;
    }

    removeAllAlerts();

    if (!bookInputValue) {
        console.log("No input");
        return;
    }

    try {
        const response = await fetch(endpoint); // Fetch data from the endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Parse JSON response
        const bookDocs = data.docs;

        // Clear the results section before searching
        resultsContainer.innerHTML = "";

        // Display the top 10 results 
        for (let i = 0; i < 10; i++) {
            const bookDoc = bookDocs[i];
            console.log(`Iteration ${i}`);
            if (!bookDoc) {
                console.warn(`No book document found at index ${i}`);
                continue; // Skip if the current document is undefined
            }

            const bookDetails = {
                // Initial View
                title: bookDoc.title || "Unknown Title",
                image: bookDoc.isbn ? `https://covers.openlibrary.org/b/isbn/${bookDoc.isbn[0]}-L.jpg` : "https://via.placeholder.com/150", // String
                author: bookDoc.author_name ? bookDoc.author_name[0] : "Unknown Author", // String
                // Detailed View
                publisher: bookDoc.publisher ? bookDoc.publisher[0] : "Unknown Publisher", // String
                numberOfPages: bookDoc.number_of_pages_median || "N/A", // Number
                originalPublishDate: bookDoc.publish_date ? bookDoc.publish_date[0] : "Unknown Original Publish Date", // String
                editionCount: bookDoc.edition_count || "N/A", // Number
                amazonLink: bookDoc.id_amazon ? bookDoc.id_amazon[0] : "No Amazon Link", // String
            };

            const bookRowData = createRow(bookDetails);
            const accordionRowData = createAccordionComponent(i + 1, "View Additional Details", bookDetails);
            resultsContainer.appendChild(bookRowData);
            bookRowData.appendChild(accordionRowData);

            console.log(bookDoc); // Console debugging
        }

        if (bookDocs.length !== 0) {
            displayResults();
        } else {
            displayResults();
            displayResultsMessage("No Books Found");
        }

    } catch (error) {
        console.error("Error fetching book data: ", error);
    }
}

function displayResults() {
    displayContainer.style.display = "block";
}

function displayResultsMessage(message = "") {
    resultsContainer.innerHTML = `${message}`;
}

function clearResults() {
    displayContainer.style.display = "none";
    bookInputField.value = "";
    resultsContainer.innerHTML = "";
    removeAllAlerts();
}

function isExistInReadingList(bookTitle) {
    for (const book of readingListBooks) {
        if (book.title === bookTitle) {
           bookExistingError.classList.remove("d-none");
           return true;
        }
    }
    removeAllAlerts();
    return false;
}


function removeAllAlerts() {
    bookExistingError.classList.add("d-none");
}

function createRow(bookData) { 
    const row = document.createElement('div');

    row.className = '.bg-secondary row-result row';
    row.innerHTML = `
        <div class="col">${bookData.title}</div>
        <div class="col"><img src="${bookData.image}" alt="bookImage" class="img-fluid"></div>
        <div class="col">${bookData.author}</div>
        <div class="col">${bookData.publisher}</div>
        <div class="col">
            <button type="button" class="btn btn-outline-primary btn-sm">+ Add To Reading List</button>
        </div>
    `
        // Add click event for the button
    const button = row.querySelector('button');
    button.addEventListener('click', (event) => {
        event.stopPropagation();
        saveToReadingList(bookData);
    });

    return row;
}

function saveToReadingList(bookData) {
    removeAllAlerts();

    const readingListBookData = {
        id: new Date().getTime(),
        status: "Want To Read",
        ...bookData,
    }

    if (isExistInReadingList(bookData.title)) {
        return;
    }

    // Validate localStorage cast it to an array
    if (!Array.isArray(readingListBooks)) {
        readingListBooks = [];
    }

    console.log("Current readingListBooks:", readingListBooks);

    readingListBooks.push(readingListBookData);
    localStorage.setItem("readingListBooks", JSON.stringify(readingListBooks));

    showNotification("Saved to reading list!");
}

function showNotification(message = "") {
    const notification = document.createElement('div');
    notification.className = "position-fixed bottom-0 end-0 p-3";
    notification.style.zIndex = "11";

    // Create toast div
    const toast = document.createElement("div");
    toast.className = "toast hide";
    toast.id = "liveToast";
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    // Create toast header
    const header = document.createElement("div");
    header.className = "toast-header";

    // const img = document.createElement("img");
    // img.src = "...";
    // img.className = "rounded me-2";
    // img.alt = "...";

    const strong = document.createElement("strong");
    strong.className = "me-auto";
    strong.textContent = "Reading Tracker";

    const small = document.createElement("small");
    small.textContent = "Just now";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-close";
    button.setAttribute("data-bs-dismiss", "toast");
    button.setAttribute("aria-label", "Close");

    // Append header elements
    // header.appendChild(img);
    header.appendChild(strong);
    header.appendChild(small);
    header.appendChild(button);

    // Create toast body
    const body = document.createElement("div");
    body.className = "toast-body";
    body.textContent = `${message}`;

    // Append header and body to toast
    toast.appendChild(header);
    toast.appendChild(body);

    // Append toast to notification
    notification.appendChild(toast);

    // Add to the DOM
    document.body.appendChild(notification);

    // Show toast
    const bootstrapToast = new bootstrap.Toast(toast);
    bootstrapToast.show();
}

function createAccordionComponent(id, title, additionalBookData) {
    console.log(additionalBookData);

    // Create accordion wrapper
    const accordionWrapper = document.createElement('div');
    accordionWrapper.className = 'accordion accordion-flush';
    accordionWrapper.id = `accordionFlushExample${id}`;

    // Create accordion item
    const accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    accordionItem.style.backgroundColor = '#f8f9fa';

    // Create header
    const accordionHeader = document.createElement('h2');
    accordionHeader.className = 'accordion-header';
    accordionHeader.id = `flush-heading${id}`;

    // Create button
    const button = document.createElement('button');
    button.className = 'accordion-button collapsed';
    button.type = 'button';
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', `#flush-collapse${id}`);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', `flush-collapse${id}`);
    button.textContent = title;

    // Append button to header
    accordionHeader.appendChild(button);

    // Create collapse div
    const collapseDiv = document.createElement('div');
    collapseDiv.id = `flush-collapse${id}`;
    collapseDiv.className = 'accordion-collapse collapse';
    collapseDiv.setAttribute('aria-labelledby', `flush-heading${id}`);
    collapseDiv.setAttribute('data-bs-parent', `#accordionFlushExample${id}`);

    // Create accordion body
    const accordionBody = document.createElement('div');
    accordionBody.className = 'accordion-body';

    const amazonLinkDOM = additionalBookData.amazonLink ? `
        <a href="https://www.amazon.com/dp/${additionalBookData.amazonLink}" class="d-flex align-items-center text-decoration-none">
            <img class="me-2" style="width: 2rem; height: 2rem;" src="./static/amazon-logo.png" alt="amazonIcon" />
            Buy in Amazon
        </a>` 
        : "No Amazon Link Available"
    ;

    accordionBody.innerHTML = `
        <div class="row headers">
            <div class="col">Number Of Pages: </div>
            <div class="col">Original Publish Date: </div>
            <div class="col">Edition Count: </div>
            <div class="col"></div>
        </div>
        <div class="row">
            <div class="col">${additionalBookData.numberOfPages}</div>
            <div class="col">${additionalBookData.originalPublishDate}</div>
            <div class="col">${additionalBookData.editionCount}</div>
            <div class="col">${amazonLinkDOM}</div>
        </div>
    `;

    // Append body to collapse div
    collapseDiv.appendChild(accordionBody);

    // Append header and collapse div to accordion item
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(collapseDiv);

    // Append accordion item to wrapper
    accordionWrapper.appendChild(accordionItem);

    // Return the DOM element
    return accordionWrapper;
}