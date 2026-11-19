
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import API from "../services/api";

import {
    BookOpen,
    Library,
    Heart,
    BookCheck,
    LogOut,
    Trash2,
    RefreshCw
} from "lucide-react";

function Favorites() {
    const [user, setUser] = useState({});
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(0);

    const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000";

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

    // Fetch Favorites
    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await API.get("/favorites");

                setFavorites(response.data.favorites || []);

            } catch (err) {
                console.error("Fetch Favorites Error:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load Favorites. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [refresh]);

    // Remove Favorite
    const handleRemoveFavorite = async (favoriteId) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this book from Favorites?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/favorites/${favoriteId}`);

            setFavorites((prev) =>
                prev.filter((item) => item._id !== favoriteId)
            );

            alert("Book removed from Favorites successfully!");

        } catch (err) {
            console.error("Remove Favorite Error:", err);

            alert(
                err.response?.data?.message ||
                "Unable to remove Favorite."
            );
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.replace("/login");
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
                        <h4>My Favorites</h4>

                        <p>
                            Welcome back, {user.name || "Reader"}!
                        </p>
                    </div>

                    <div className="profile-circle">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                </div>

                {/* PAGE HEADING */}
                <div className="books-heading">

                    <div>
                        <h5 className="section-heading mb-1">
                            <Heart
                                size={21}
                                style={{
                                    display: "inline",
                                    marginRight: "8px"
                                }}
                            />
                            My Favorite Books
                        </h5>

                        <p className="text-muted small">
                            All the books you have saved to your Favorites.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => setRefresh(prev => prev + 1)}
                        title="Refresh Favorites"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>

                </div>

                <p className="text-muted small mb-3">
                    Total Favorites: {favorites.length}
                </p>

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
                        <p>Loading your Favorites...</p>
                    </div>

                ) : (

                    <>
                        {/* FAVORITES GRID */}
                        {favorites.length > 0 ? (

                            <div className="books-grid">

                                {favorites.map((favorite) => {

                                    const book = favorite.bookId;

                                    // Book may have been deleted
                                    if (!book || typeof book !== "object") {
                                        return null;
                                    }

                                    return (
                                        <div
                                            className="book-card"
                                            key={favorite._id}
                                        >

                                            {/* BOOK COVER */}
                                            <div className="book-image">

                                                {book.coverImage ? (

                                                    <img
                                                        src={`${API_URL}${book.coverImage}`}
                                                        alt={book.title}
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = "none";
                                                        }}
                                                    />

                                                ) : (

                                                    <BookOpen size={55} />

                                                )}

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

                                                {/* REMOVE FAVORITE */}
                                                <div className="book-actions">

                                                    <button
                                                        className="delete-book-btn"
                                                        onClick={() =>
                                                            handleRemoveFavorite(favorite._id)
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                        Remove Favorite
                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>

                        ) : (

                            /* EMPTY FAVORITES */
                            <div className="empty-books">

                                <Heart size={55} />

                                <h4>No Favorite Books Yet</h4>

                                <p>
                                    Visit My Books and add your favorite books
                                    using the heart button.
                                </p>

                                <NavLink
                                    to="/my-books"
                                    className="btn btn-booknest"
                                >
                                    <BookOpen size={18} />
                                    Explore My Books
                                </NavLink>

                            </div>

                        )}

                    </>

                )}

            </main>

        </div>
    );
}

export default Favorites;
