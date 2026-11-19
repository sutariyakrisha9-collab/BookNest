import { useEffect, useState } from "react";
import API from "../services/api";
import "./IssueManagement.css";
function IssueManagement() {
    const [issues, setIssues] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        bookId: "",
        borrowerName: "",
        borrowerEmail: "",
        dueDate: ""
    });

    // Load books and issue records
    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [bookResponse, issueResponse] = await Promise.all([
                API.get("/books"),
                API.get("/issues")
            ]);

            setBooks(bookResponse.data.books || []);
            setIssues(issueResponse.data.issues || []);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load issue records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Update form fields
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Issue a book
    const handleIssue = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setMessage("");

            await API.post("/issues", form);

            setMessage("Book issued successfully!");

            setForm({
                bookId: "",
                borrowerName: "",
                borrowerEmail: "",
                dueDate: ""
            });

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to issue book."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Return a book
    const handleReturn = async (issueId) => {
        const confirmed = window.confirm(
            "Are you sure you want to return this book?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await API.put(`/issues/${issueId}/return`);

            setMessage("Book returned successfully!");

            await loadData();

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to return book."
            );
        }
    };

    // Search issue records
    const filteredIssues = issues.filter((issue) => {
        const name = issue.borrowerName || "";
        const email = issue.borrowerEmail || "";
        const title = issue.bookId?.title || "";

        const value = search.toLowerCase();

        return (
            name.toLowerCase().includes(value) ||
            email.toLowerCase().includes(value) ||
            title.toLowerCase().includes(value)
        );
    });

    const issuedCount = issues.filter(
        (issue) => issue.status === "Issued"
    ).length;

    const returnedCount = issues.filter(
        (issue) => issue.status === "Returned"
    ).length;

    return (
        <div className="issue-page">

            <div className="issue-header">
                <div>
                    <h1>Issue Management</h1>
                    <p>Manage book borrowing and returns.</p>
                </div>
            </div>

            {message && (
                <div className="issue-success">{message}</div>
            )}

            {error && (
                <div className="issue-error">{error}</div>
            )}

            {/* Statistics */}
            <div className="issue-stats">
                <div className="issue-stat-card">
                    <h3>Total Records</h3>
                    <h2>{issues.length}</h2>
                </div>

                <div className="issue-stat-card">
                    <h3>Currently Issued</h3>
                    <h2>{issuedCount}</h2>
                </div>

                <div className="issue-stat-card">
                    <h3>Returned</h3>
                    <h2>{returnedCount}</h2>
                </div>
            </div>

            {/* Issue Book Form */}
            <div className="issue-form-card">
                <h2>Issue a New Book</h2>

                <form onSubmit={handleIssue}>

                    <div className="issue-form-grid">

                        <div>
                            <label>Select Book</label>

                            <select
                                name="bookId"
                                value={form.bookId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Choose a book</option>

                                {books
                                    .filter(book => book.availableCopies > 0)
                                    .map(book => (
                                        <option
                                            key={book._id}
                                            value={book._id}
                                        >
                                            {book.title} — {book.availableCopies} available
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label>Borrower Name</label>

                            <input
                                type="text"
                                name="borrowerName"
                                placeholder="Enter borrower name"
                                value={form.borrowerName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Borrower Email</label>

                            <input
                                type="email"
                                name="borrowerEmail"
                                placeholder="Enter borrower email"
                                value={form.borrowerEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Return Due Date</label>

                            <input
                                type="date"
                                name="dueDate"
                                min={new Date().toISOString().split("T")[0]}
                                value={form.dueDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="issue-submit-btn"
                    >
                        {submitting ? "Issuing..." : "Issue Book"}
                    </button>

                </form>
            </div>

            {/* Issue Records */}
            <div className="issue-table-card">

                <div className="issue-table-header">
                    <h2>Borrowing Records</h2>

                    <input
                        type="search"
                        placeholder="Search book or borrower..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p>Loading issue records...</p>
                ) : (
                    <div className="issue-table-wrapper">
                        <table className="issue-table">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Borrower</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredIssues.length === 0 ? (
                                    <tr>
                                        <td colSpan="6">
                                            No issue records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredIssues.map(issue => (
                                        <tr key={issue._id}>
                                            <td>
                                                {issue.bookId?.title || "Book unavailable"}
                                            </td>

                                            <td>
                                                <strong>{issue.borrowerName}</strong>
                                                <br />
                                                <small>{issue.borrowerEmail}</small>
                                            </td>

                                            <td>
                                                {new Date(issue.issueDate).toLocaleDateString()}
                                            </td>

                                            <td>
                                                {new Date(issue.dueDate).toLocaleDateString()}
                                            </td>

                                            <td>
                                                <span className={
                                                    issue.status === "Issued"
                                                        ? "issue-badge"
                                                        : "returned-badge"
                                                }>
                                                    {issue.status}
                                                </span>
                                            </td>

                                            <td>
                                                {issue.status === "Issued" ? (
                                                    <button
                                                        className="return-btn"
                                                        onClick={() => handleReturn(issue._id)}
                                                    >
                                                        Return
                                                    </button>
                                                ) : (
                                                    <span>Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}

export default IssueManagement;
