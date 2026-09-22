import type { Offense } from "../../types/offense";

interface OffenseTableProps {
    offenses: Offense[];
    paginatedOffenses: Offense[];
    loading: boolean;
    offenseSearch: string;
    offenseTypeFilter: string;
    offenseTypes: string[];
    savingStatusIds?: Set<number>;
    onSearchChange: (value: string) => void;
    onTypeChange: (value: string) => void;
    onAdd: () => void;
    onImport: () => void;
    onToggleStatus: (offense: Offense) => void;
}

function OffenseTable({
                          offenses,
                          paginatedOffenses,
                          loading,
                          offenseSearch,
                          offenseTypeFilter,
                          offenseTypes,
                          savingStatusIds,
                          onSearchChange,
                          onTypeChange,
                          onAdd,
                          onImport,
                          onToggleStatus,
                      }: OffenseTableProps) {
    return (
        <>
            <div className="dashboard-table-header">
                <div>
                    <div className="table-title-row">
                        <h3>Offense Categories</h3>

                        <span className="total-count offense-count">
                            Total number:
                            <strong>{loading ? "—" : offenses.length}</strong>
                        </span>
                    </div>

                    <p>Manage offense categories.</p>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        type="button"
                        className="import-btn"
                        onClick={onImport}
                    >
                        <i className="bi bi-file-earmark-arrow-up-fill"></i>
                        <span>Import</span>
                    </button>

                    <button
                        type="button"
                        className="add-btn"
                        onClick={onAdd}
                    >
                        <i className="bi bi-plus-lg"></i>
                        <span>Add Offense</span>
                    </button>
                </div>
            </div>

            <div className="admin-filter-row">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search offense..."
                    value={offenseSearch}
                    onChange={(e) => onSearchChange(e.target.value)}
                />

                <select
                    className="form-select"
                    value={offenseTypeFilter}
                    onChange={(e) => onTypeChange(e.target.value)}
                >
                    <option value="">All Types</option>

                    {offenseTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            <div className="dashboard-table-container">
                <table className="admin-table offense-table">
                    <colgroup>
                        <col style={{ width: "22%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "45%" }} />
                        <col style={{ width: "15%" }} />
                    </colgroup>

                    <thead>
                    <tr>
                        <th>Offense</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={4} className="admin-table-empty">
                                Loading offenses...
                            </td>
                        </tr>
                    )}

                    {!loading && paginatedOffenses.length === 0 && (
                        <tr>
                            <td colSpan={4} className="admin-table-empty">
                                No offenses found.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        paginatedOffenses.map((offense) => (
                            <tr key={offense.offenseId}>
                                <td data-label="Offense">
                                    {offense.offense}
                                </td>

                                <td data-label="Type">
                                        <span className="offense-type-badge">
                                            {offense.type || "—"}
                                        </span>
                                </td>

                                <td data-label="Description">
                                    {offense.description || "—"}
                                </td>

                                <td data-label="Status">
                                    <label
                                        className={
                                            offense.isActive
                                                ? "status-switch is-active"
                                                : "status-switch"
                                        }
                                    >
                                        <input
                                            type="checkbox"
                                            checked={offense.isActive}
                                            disabled={savingStatusIds?.has(
                                                offense.offenseId
                                            )}
                                            onChange={() =>
                                                onToggleStatus(offense)
                                            }
                                        />

                                        <span className="status-switch-track">
                                            <span className="status-switch-thumb"></span>
                                        </span>

                                        <span className="status-switch-label">
                                            {savingStatusIds?.has(
                                                offense.offenseId
                                            )
                                                ? "Saving..."
                                                : offense.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                        </span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default OffenseTable;