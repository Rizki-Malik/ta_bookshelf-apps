const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const MOVED_EVENT = "moved-book";
const DELETED_EVENT = "deleted-book";
const UPDATED_EVENT = "updated-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const books = [];

document.addEventListener(RENDER_EVENT, () => {
    const blmDbca = document.getElementById("belumDibaca");
    blmDbca.innerHTML = "";

    const sdhDbca = document.getElementById("sudahDibaca");
    sdhDbca.innerHTML = "";

    for (const bookItem of books) {
        const bookElement = makeBookElement(bookItem);
        if (!bookItem.isComplete) {
            blmDbca.append(bookElement);
        } else {
            sdhDbca.append(bookElement);
        }
    }
});

document.addEventListener(SAVED_EVENT, () => {
    showSuccessToast("Berhasil Disimpan!");
});

document.addEventListener(MOVED_EVENT, () => {
    showSuccessToast("Berhasil Dipindahkan");
});

document.addEventListener(UPDATED_EVENT, () => {
    showSuccessToast("Data telah dimasukkan ke form!");
});

const showSuccessToast = (message) => {
    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        },
    });
    Toast.fire({
        icon: "success",
        title: message,
    });
};

const loadDataFromStorage = () => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (data !== null) {
        for (const item of data) {
            books.push(item);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
};

const saveData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
};

const moveData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(MOVED_EVENT));
    }
};

const deleteData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(DELETED_EVENT));
    }
};

const editData = () => {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(UPDATED_EVENT));
    }
};

const addBook = () => {
    const bookTitle = document.getElementById("judul");
    const bookAuthor = document.getElementById("penulis");
    const bookYear = document.getElementById("tahun");
    const bookHasFinished = document.getElementById("isRead");
    let bookStatus;

    if (bookHasFinished.checked) {
        bookStatus = true;
    } else {
        bookStatus = false;
    }

    const bookId = +new Date();
    const newBook = {
        id: bookId,
        title: bookTitle.value,
        author: bookAuthor.value,
        year: Number(bookYear.value),
        isComplete: bookStatus,
    };

    const existingBookIndex = findBookIndex(bookId);

    if (existingBookIndex !== -1) {
        books[existingBookIndex] = newBook;
    } else {
        books.push(newBook);
    }

    bookTitle.value = null;
    bookAuthor.value = null;
    bookYear.value = null;
    bookHasFinished.checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

const editBook = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    const editModal = document.getElementById('editModal');
    const editModalOverlay = document.getElementById('editModalOverlay');

    const editbookTitle = document.getElementById("editJudul");
    const editbookAuthor = document.getElementById("editPenulis");
    const editbookYear = document.getElementById("editTahun");
    const editbookHasFinished = document.getElementById("editIsRead");

    editbookTitle.value = bookTarget.title;
    editbookAuthor.value = bookTarget.author;
    editbookYear.value = bookTarget.year;
    editbookHasFinished.checked = bookTarget.isComplete;

    editModal.classList.add('active');
    editModalOverlay.classList.add('active');

    const editForm = document.getElementById("formEdit");

    function onSubmitEditBook(event) {
        event.preventDefault();

        bookTarget.title = editbookTitle.value;
        bookTarget.author = editbookAuthor.value;
        bookTarget.year = editbookYear.value;
        bookTarget.isComplete = editbookHasFinished.checked;

        editbookTitle.value = '';
        editbookAuthor.value = '';
        editbookYear.value = '';
        editbookHasFinished.checked = false;

        editModal.classList.remove('active');
        editModalOverlay.classList.remove('active');

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        editForm.removeEventListener('submit', onSubmitEditBook);
    }

    editForm.addEventListener('submit', onSubmitEditBook);
    editData();
};

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    const editModalOverlay = document.getElementById('editModalOverlay');

    editModal.classList.remove('active');
    editModalOverlay.classList.remove('active');
}

const makeBookElement = (bookObject) => {
    const elementBookTitle = document.createElement("p");
    elementBookTitle.classList.add("item-title");
    elementBookTitle.innerHTML = `${bookObject.title} <span>(${bookObject.year})</span>`;

    const elementBookAuthor = document.createElement("p");
    elementBookAuthor.classList.add("item-writer");
    elementBookAuthor.innerText = bookObject.author;

    const descContainer = document.createElement("div");
    descContainer.classList.add("item-desc");
    descContainer.append(elementBookTitle, elementBookAuthor);

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("item-action");

    const container = document.createElement("div");
    container.classList.add("item");
   

    container.append(descContainer);
    container.setAttribute("id", `book-${bookObject.id}`);

    if (bookObject.isComplete) {
        const returnBtn = createButton("kembalikan-btn", "bx bx-undo", () => {
            returnBookFromFinished(bookObject.id);
        });

        const deleteBtn = createButton("hapus-btn", "bx bx-trash", () => {
            deleteBook(bookObject.id);
        });

        const editBtn = createButton("edit-btn", "bx bxs-edit", () => {
            editBook(bookObject.id);
        });

        actionContainer.append(returnBtn, deleteBtn, editBtn);
        container.append(actionContainer);
    } else {
        const finishBtn = createButton("selesai-btn", "bx bx-check", () => {
            addBookToFinished(bookObject.id);
        });
        
        const deleteBtn = createButton("hapus-btn", "bx bx-trash", () => {
            deleteBook(bookObject.id);
        });

        const editBtn = createButton("edit-btn", "bx bxs-edit", () => {
            editBook(bookObject.id);
        });

        actionContainer.append(finishBtn, deleteBtn, editBtn);
        container.append(actionContainer);
    }

    return container;
};

function toggleAccordion(containerId) {
    const container = document.getElementById(containerId);
    container.classList.toggle('collapsed');
}

const createButton = (className, iconClass, clickHandler) => {
    const button = document.createElement("button");
    button.classList.add(className);
    button.innerHTML = `<i class='${iconClass}'></i>`;
    button.addEventListener("click", clickHandler);
    return button;
};

const addBookToFinished = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    moveData();
};

const returnBookFromFinished = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    moveData();
};

const deleteBook = (bookId) => {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    Swal.fire({
        title: "Hapus data?",
        text: "Data tidak bisa diminta kembali lagi!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes"
    }).then((result) => {
        if (result.isConfirmed) {
            const bookIndex = books.indexOf(bookTarget);

            if (bookIndex !== -1) {
                books.splice(bookIndex, 1);
                deleteData();
                document.dispatchEvent(new Event(RENDER_EVENT));
            }

            showSuccessToast("Berhasil Dihapus!");
        }
    });
};

const findBook = (bookId) => {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
};

const findBookIndex = (bookId) => {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
};

const searchBook = () => {
  const searchInput = document.getElementById("pencarian").value.toLowerCase();
  const bookItems = document.getElementsByClassName("item");

  for (let i = 0; i < bookItems.length; i++) {
      const itemTitle = bookItems[i].querySelector(".item-title");
      const itemAuthor = bookItems[i].querySelector(".item-writer");
      const titleText = itemTitle.textContent.toLowerCase();
      const authorText = itemAuthor.textContent.toLowerCase();

      if (titleText.includes(searchInput) || authorText.includes(searchInput)) {
          bookItems[i].classList.remove("hidden");
      } else {
          bookItems[i].classList.add("hidden");
      }
  }
};

document.addEventListener("DOMContentLoaded", () => {
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const simpanForm = document.getElementById("formDataBuku");
    simpanForm.addEventListener("submit", (event) => {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById("formSearch");
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        searchBook();
    });

    const resetBtn = document.querySelector(".reset-btn");
    resetBtn.addEventListener("click", () => {
        document.getElementById("pencarian").value = "";
        searchBook();
    });
});


function isStorageExist() {
    return typeof Storage !== "undefined";
}