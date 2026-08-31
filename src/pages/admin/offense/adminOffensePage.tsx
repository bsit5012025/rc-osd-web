import { useEffect, useState, FormEvent } from "react";

import {
    getOffenses,
    createOffense,
    updateOffense,
    deleteOffense,
} from "../../../services/offenseApi";
import type { Offense } from "../../../types/offense";
import type { OffenseInput } from "../../../services/offenseApi";

import "./adminOffensePage.css";

const offenseTypes = ["Minor Offense", "Major Offense"];

const emptyForm: OffenseInput = { offense: "", type: offenseTypes[0], description: "" };

function AdminOffensePage() {

    const [offenses, setOffenses] = useState<Offense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [search, setSearch] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<OffenseInput>(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchOffenses = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getOffenses();
            setOffenses(data);
        } catch (err) {
            console.error("Failed to fetch offenses:", err);
            setError("Failed to load offenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffenses();
    }, []);

    const types = Array.from(new Set(offenses.map((o) => o.type).filter(Boolean))).sort();

    const filteredOffenses = offenses
        .filter((o) => (typeFilter ? o.type === typeFilter : true))
        .filter((o) =>
            search.trim()
                ? o.offense.toLowerCase().includes(search.trim().toLowerCase())
                : true
        );

    const openAddModal = () => {
        setEditingId(null);
        setForm(emptyForm);
        setFormError("");
        setShowModal(true);
    };

    const openEditModal = (offense: Offense) => {
        setEditingId(offense.offenseId);
        setForm({
            offense: offense.offense,
            type: offense.type,
            description: offense.description,
        });
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!form.offense.trim() || !form.type.trim()) {
            setFormError("Offense name and type are required.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            if (editingId !== null) {
                await updateOffense(editingId, form);
            } else {
                await createOffense(form);
            }

            setShowModal(false);
            await fetchOffenses();
        } catch (err) {
            console.error("Failed to save offense:", err);
            setFormError("Failed to save offense. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (offense: Offense) => {
        if (!window.confirm(`Delete "${offense.offense}"? This cannot be undone.`)) {
            return;
        }

        try {
            await deleteOffense(offense.offenseId);
            await fetchOffenses();
        } catch (err) {
            console.error("Failed to delete offense:", err);
            setError("Failed to delete offense. It may still be referenced by existing records.");
        }
    };

    return (
        <div className="admin-offense-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <main className="admin-offense-content">

                    <div className="admin-page-header mt-2 mb-4">
                        <h2 className="admin-page-title">Offense Categories</h2>
                        <button type="button" className="btn btn-primary fw-bold" onClick={openAddModal}>
                            <i className="bi bi-plus-lg me-1"></i> Add Offense
                        </button>
                    </div>

                    {error && <p className="text-danger mb-3">{error}</p>}

                    <div className="admin-filter-row mb-3">
                        <input
                            type="text"
                            className="form-control"
                            style={{ maxWidth: 260 }}
                            placeholder="Search offense..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="form-select"
                            style={{ maxWidth: 220 }}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">All Types</option>
                            {types.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-table-section">
                        <div className="admin-table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "26%" }}>Offense</th>
                                        <th style={{ width: "18%" }}>Type</th>
                                        <th>Description</th>
                                        <th style={{ width: "90px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan={4} className="admin-table-empty">Loading offenses...</td>
                                        </tr>
                                    )}
                                    {!loading && filteredOffenses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="admin-table-empty">No offenses to show.</td>
                                        </tr>
                                    )}
                                    {!loading && filteredOffenses.map((offense) => (
                                        <tr key={offense.offenseId}>
                                            <td>{offense.offense}</td>
                                            <td>{offense.type}</td>
                                            <td>{offense.description || "—"}</td>
                                            <td>
                                                <div className="admin-row-actions">
                                                    <button
                                                        type="button"
                                                        className="admin-icon-btn"
                                                        aria-label="Edit"
                                                        onClick={() => openEditModal(offense)}
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-icon-btn danger"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(offense)}
                                                    >
                                                        <i className="bi bi-trash-fill"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </main>

            </div>

            {showModal && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <h5 className="admin-modal-title">
                            {editingId !== null ? "Edit Offense" : "Add Offense"}
                        </h5>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="offenseName">Offense</label>
                                <input
                                    id="offenseName"
                                    type="text"
                                    className="form-control"
                                    value={form.offense}
                                    onChange={(e) => setForm({ ...form, offense: e.target.value })}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="offenseType">Type</label>
                                <select
                                    id="offenseType"
                                    className="form-select"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                >
                                    {offenseTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold" htmlFor="offenseDescription">Description</label>
                                <textarea
                                    id="offenseDescription"
                                    className="form-control"
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            {formError && <p className="text-danger mb-0">{formError}</p>}

                            <div className="admin-modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary fw-bold"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary fw-bold" disabled={saving}>
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminOffensePage;
