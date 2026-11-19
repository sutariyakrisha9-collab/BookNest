
import { useEffect, useState } from "react";
import API from "../services/api";
import { NavLink } from "react-router-dom";

import {
    BookOpen,
    Library,
    Heart,
    BookCheck,
    LogOut,
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from "lucide-react";

function Dashboard({ view = "dashboard" }) {

    const isMyBooksPage = view === "my-books";

    const [user, setUser] = useState({});
    const [books, setBooks] = useState([]);
    const [favorites, setFavorites] = useState([]);

    const [totalBooks, setTotalBooks] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [refresh, setRefresh] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [form, setForm] = useState({
        title: "",
        author: "",
        category: "",
        description: "",
        isbn: "",
        publishedYear: "",
        totalCopies: "1"
    });

    // Load User
    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                setUser({});
            }
        }
    }, []);

    // Fetch Books
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await API.get("/books", {
                    params: {
                        search,
                        category,
                        page,
                        limit: 8
                    }
                });

                setBooks(response.data.books || []);
                setTotalBooks(response.data.totalBooks || 0);

                setTotalPages(
                    Math.max(1, response.data.totalPages || 1)
                );

            } catch (err) {
                console.error("Fetch Books Error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load books. Please try again."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchBooks();

    }, [search, category, page, refresh]);

    // Fetch Favorites
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await API.get("/favorites");

                setFavorites(response.data.favorites || []);

            } catch (err) {
                console.error("Fetch Favorites Error:", err);
            }
        };

        fetchFavorites();

    }, [refresh]);

    // Check Favorite
    const isFavorite = (bookId) => {
        return favorites.some((favorite) => {
            const favoriteBookId =
                typeof favorite.bookId === "object"
                    ? favorite.bookId?._id
                    : favorite.bookId;

            return favoriteBookId === bookId;
        });
    };

    // Available Copies
    const availableCopies = books.reduce(
        (total, book) =>
            total + Number(book.availableCopies || 0),
        0
    );

    // Reset Form
    const resetForm = () => {
        setForm({
            title: "",
            author: "",
            category: "",
            description: "",
            isbn: "",
            publishedYear: "",
            totalCopies: "1"
        });

        setEditingBook(null);
        setFormError("");
    };

    // Open Add Modal
    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (book) => {
        setEditingBook(book);

        setForm({
            title: book.title || "",
            author: book.author || "",
            category: book.category || "",
            description: book.description || "",
            isbn: book.isbn || "",
            publishedYear: book.publishedYear || "",
            totalCopies: String(book.totalCopies || 1)
        });

        setFormError("");
        setShowModal(true);
    };

    // Handle Form Input
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Add or Update Book
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (
            !form.title.trim() ||
            !form.author.trim() ||
            !form.category.trim()
        ) {
            setFormError(
                "Title, author and category are required."
            );
            return;
        }

        setSaving(true);

        try {
            const bookData = {
                ...form
            };

            if (editingBook) {
                await API.put(
                    `/books/${editingBook._id}`,
                    bookData
                );

                alert("Book updated successfully!");

            } else {
                await API.post("/books", bookData);

                alert("Book added successfully!");
            }

            setShowModal(false);
            resetForm();
            setPage(1);
            setRefresh((prev) => prev + 1);

        } catch (err) {
            console.error("Save Book Error:", err);

            setFormError(
                err.response?.data?.message ||
                err.response?.data?.errors?.[0]?.msg ||
                "Unable to save book. Please try again."
            );

        } finally {
            setSaving(false);
        }
    };

    // Delete Book
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this book?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/books/${id}`);

            alert("Book deleted successfully!");

            setRefresh((prev) => prev + 1);

        } catch (err) {
            console.error("Delete Book Error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to delete book."
            );
        }
    };

    // Add or Remove Favorite
    const handleToggleFavorite = async (bookId) => {
        try {
            const existingFavorite = favorites.find((favorite) => {
                const favoriteBookId =
                    typeof favorite.bookId === "object"
                        ? favorite.bookId?._id
                        : favorite.bookId;

                return favoriteBookId === bookId;
            });

            if (existingFavorite) {
                await API.delete(
                    `/favorites/${existingFavorite._id}`
                );

                setFavorites((prev) =>
                    prev.filter(
                        (favorite) =>
                            favorite._id !== existingFavorite._id
                    )
                );

                alert("Book removed from Favorites successfully!");

            } else {
                await API.post("/favorites", { bookId });

                const response = await API.get("/favorites");

                setFavorites(response.data.favorites || []);

                alert("Book added to Favorites successfully!");
            }

        } catch (err) {
            console.error("Toggle Favorite Error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to update Favorites."
            );
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.replace("/login");
    };

    // Reset Filters
    const resetFilters = () => {
        setSearch("");
        setCategory("");
        setPage(1);
    };

    return (
        <div className="dashboard-layout">

            {/* SIDEBAR */}
            <aside className="sidebar">

                <h3 className="sidebar-brand">
                    <BookOpen size={28} />
                    BookNest
                </h3>

                <p className="sidebar-label">
                    MAIN MENU
                </p>

                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <Library size={19} />
                    Dashboard
                </NavLink>

                <NavLink
                    to="/my-books"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <BookOpen size={19} />
                    My Books
                </NavLink>

                <NavLink
                    to="/issues"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <BookCheck size={19} />
                    Issue Management
                </NavLink>

                <NavLink
                    to="/favorites"
                    className={({ isActive }) =>
                        `sidebar-link ${isActive ? "active" : ""}`
                    }
                >
                    <Heart size={19} />
                    Favorites
                </NavLink>

                <div className="sidebar-bottom">

                    <div className="user-info">

                        <div className="user-avatar">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>

                        <div>
                            <strong>
                                {user.name || "Library Member"}
                            </strong>

                            <small>
                                {user.email || "BookNest User"}
                            </small>
                        </div>

                    </div>

                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className="dashboard-main">

                {/* TOPBAR */}
                <div className="dashboard-topbar">

                    <div>
                        <h4>
                            {isMyBooksPage ? "My Books" : "Dashboard"}
                        </h4>

                        <p>
                            Welcome back, {user.name || "Reader"}!
                        </p>
                    </div>

                    <div className="profile-circle">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                </div>

                {/* DASHBOARD CONTENT */}
                {!isMyBooksPage && (
                    <>
                        <div className="welcome-banner">

                            <div>
                                <h2>Your Personal Library</h2>

                                <p>
                                    Discover, organize and manage your
                                    favorite books.
                                </p>

                                <button
                                    className="btn btn-light mt-3"
                                    onClick={openAddModal}
                                >
                                    <Plus size={18} />
                                    Add New Book
                                </button>
                            </div>

                            <BookOpen size={75} />

                        </div>

                        <h5 className="section-heading">
                            Library Overview
                        </h5>

                        <div className="stats-grid">

                            <div className="stat-card">
                                <div className="stat-icon teal">
                                    <BookOpen />
                                </div>

                                <h3>{totalBooks}</h3>
                                <p>Total Books</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon blue">
                                    <BookCheck />
                                </div>

                                <h3>{availableCopies}</h3>
                                <p>Available Copies</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orange">
                                    <Heart />
                                </div>

                                <h3>{favorites.length}</h3>
                                <p>Favorites</p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon green">
                                    <Library />
                                </div>

                                <h3>{books.length}</h3>
                                <p>Books on This Page</p>
                            </div>

                        </div>
                    </>
                )}

                {/* BOOK COLLECTION */}
                <div className="books-heading">

                    <div>
                        <h5 className="section-heading mb-1">
                            {isMyBooksPage
                                ? "My Personal Books"
                                : "My Book Collection"}
                        </h5>

                        <p className="text-muted small">
                            {isMyBooksPage
                                ? "View and manage all the books in your personal library."
                                : "Manage your personal library collection."}
                        </p>
                    </div>

                    <button
                        className="btn btn-booknest"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add Book
                    </button>

                </div>

                {/* SEARCH AND FILTER */}
                <div className="book-filters">

                    <div className="search-box">
                        <Search size={19} />

                        <input
                            type="text"
                            placeholder="Search by title, author or category..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <select
                        className="form-select category-select"
                        value={category}
                        onChange={(e) => {
                            setCategory(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">All Categories</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Non-Fiction">Non-Fiction</option>
                        <option value="Education">Education</option>
                        <option value="Technology">Technology</option>
                        <option value="Self Help">Self Help</option>
                        <option value="Finance">Finance</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                    </select>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setRefresh((prev) => prev + 1)}
                        title="Refresh books"
                    >
                        <RefreshCw size={18} />
                    </button>

                    {(search || category) && (
                        <button
                            className="btn btn-outline-secondary"
                            onClick={resetFilters}
                        >
                            <X size={17} />
                            Clear
                        </button>
                    )}

                </div>

                {/* BOOK COUNT */}
                {isMyBooksPage && !loading && !error && (
                    <p className="text-muted small mb-3">
                        Showing {books.length} books on this page
                        {" "}of {totalBooks} total books
                    </p>
                )}

                {/* ERROR */}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* LOADING */}
                {loading ? (
                    <div className="loading-books">
                        <div className="spinner-border text-success"></div>
                        <p>Loading your books...</p>
                    </div>
                ) : (
                    <>
                        {books.length > 0 ? (

                            <div className="books-grid">

                                {books.map((book) => (

                                    <div
                                        className="book-card"
                                        key={book._id}
                                    >

                                        {/* BOOK ICON - NO COVER IMAGE */}
                                        <div className="book-image">

                                            <BookOpen size={65} />

                                            {/* FAVORITE HEART */}
                                            <button
                                                type="button"
                                                className={`favorite-heart-btn ${
                                                    isFavorite(book._id)
                                                        ? "favorited"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleToggleFavorite(book._id)
                                                }
                                                title={
                                                    isFavorite(book._id)
                                                        ? "Remove from Favorites"
                                                        : "Add to Favorites"
                                                }
                                            >
                                                <Heart
                                                    size={23}
                                                    fill={
                                                        isFavorite(book._id)
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                />
                                            </button>

                                        </div>

                                        {/* BOOK DETAILS */}
                                        <div className="book-details">

                                            <span className="book-category">
                                                {book.category}
                                            </span>

                                            <h6>{book.title}</h6>

                                            <p className="book-author">
                                                By {book.author}
                                            </p>

                                            <div className="book-stock">

                                                <span>
                                                    Total: {book.totalCopies}
                                                </span>

                                                <span>
                                                    Available: {book.availableCopies}
                                                </span>

                                            </div>

                                            {/* EDIT AND DELETE */}
                                            <div className="book-actions">

                                                <button
                                                    className="edit-book-btn"
                                                    onClick={() =>
                                                        openEditModal(book)
                                                    }
                                                >
                                                    <Pencil size={16} />
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-book-btn"
                                                    onClick={() =>
                                                        handleDelete(book._id)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        ) : (

                            <div className="empty-books">

                                <BookOpen size={55} />

                                <h4>
                                    {search || category
                                        ? "No Matching Books Found"
                                        : "No Books Found"}
                                </h4>

                                <p>
                                    {search || category
                                        ? "Try changing your search or category filter."
                                        : "Start building your personal library by adding a book."}
                                </p>

                                {search || category ? (
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={resetFilters}
                                    >
                                        Clear Filters
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-booknest"
                                        onClick={openAddModal}
                                    >
                                        <Plus size={18} />
                                        Add Your First Book
                                    </button>
                                )}

                            </div>

                        )}

                        {/* PAGINATION */}
                        {books.length > 0 && (
                            <div className="pagination-area">

                                <button
                                    className="btn btn-outline-secondary"
                                    disabled={page <= 1}
                                    onClick={() =>
                                        setPage((prev) => prev - 1)
                                    }
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>

                                <span>
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    className="btn btn-outline-secondary"
                                    disabled={page >= totalPages}
                                    onClick={() =>
                                        setPage((prev) => prev + 1)
                                    }
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>

                            </div>
                        )}

                    </>
                )}

            </main>

            {/* ADD / EDIT BOOK MODAL */}
            {showModal && (

                <div
                    className="book-modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target === e.currentTarget &&
                            !saving
                        ) {
                            setShowModal(false);
                            resetForm();
                        }
                    }}
                >

                    <div className="book-modal">

                        <div className="modal-heading">

                            <div>
                                <h4>
                                    {editingBook
                                        ? "Edit Book"
                                        : "Add New Book"}
                                </h4>

                                <p>
                                    Enter your book details below.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                disabled={saving}
                            >
                                <X />
                            </button>

                        </div>

                        {formError && (
                            <div className="alert alert-danger">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>

                            <div className="modal-form-grid">

                                {/* TITLE */}
                                <div>
                                    <label className="form-label">
                                        Book Title *
                                    </label>

                                    <input
                                        className="form-control"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter book title"
                                        required
                                    />
                                </div>

                                {/* AUTHOR */}
                                <div>
                                    <label className="form-label">
                                        Author *
                                    </label>

                                    <input
                                        className="form-control"
                                        name="author"
                                        value={form.author}
                                        onChange={handleChange}
                                        placeholder="Enter author name"
                                        required
                                    />
                                </div>

                                {/* CATEGORY */}
                                <div>
                                    <label className="form-label">
                                        Category *
                                    </label>

                                    <select
                                        className="form-select"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Category
                                        </option>

                                        <option value="Fiction">Fiction</option>
                                        <option value="Non-Fiction">Non-Fiction</option>
                                        <option value="Education">Education</option>
                                        <option value="Technology">Technology</option>
                                        <option value="Self Help">Self Help</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Science">Science</option>
                                        <option value="History">History</option>
                                    </select>
                                </div>

                                {/* ISBN */}
                                <div>
                                    <label className="form-label">
                                        ISBN
                                    </label>

                                    <input
                                        className="form-control"
                                        name="isbn"
                                        value={form.isbn}
                                        onChange={handleChange}
                                        placeholder="Enter ISBN"
                                    />
                                </div>

                                {/* PUBLISHED YEAR */}
                                <div>
                                    <label className="form-label">
                                        Published Year
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        name="publishedYear"
                                        value={form.publishedYear}
                                        onChange={handleChange}
                                        placeholder="e.g. 2020"
                                        min="1000"
                                        max="2100"
                                    />
                                </div>

                                {/* TOTAL COPIES */}
                                <div>
                                    <label className="form-label">
                                        Total Copies *
                                    </label>

                                    <input
                                        type="number"
                                        className="form-control"
                                        name="totalCopies"
                                        value={form.totalCopies}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>

                            </div>

                            {/* DESCRIPTION */}
                            <div className="mt-3">

                                <label className="form-label">
                                    Description
                                </label>

                                <textarea
                                    className="form-control"
                                    name="description"
                                    rows="3"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter book description"
                                ></textarea>

                            </div>

                            {/* MODAL ACTIONS */}
                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-booknest"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingBook
                                            ? "Update Book"
                                            : "Add Book"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Dashboard;
