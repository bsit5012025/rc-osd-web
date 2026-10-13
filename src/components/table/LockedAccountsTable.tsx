import { useEffect, useState } from "react";

import { usePolling } from "../../hooks/usePolling";
import { getLockedAccounts, reactivateAccount } from "../../services/accountApi";
import type { LockedAccount } from "../../services/accountApi";

function LockedAccountsTable() {
    const [accounts, setAccounts] = useState<LockedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [busyUser, setBusyUser] = useState<string | null>(null);

    const load = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const data = await getLockedAccounts();
            setAccounts(Array.isArray(data) ? data : []);
            if (!silent) setError("");
        } catch (err) {
            console.error("Failed to load locked accounts:", err);
            if (!silent) setError("Failed to load locked accounts.");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    usePolling(() => load(true), 15000);

    const handleReactivate = async (username: string) => {
        const confirmed = window.confirm(
            `Reactivate ${username}? Their password will be reset to their lowercase surname.`
        );
        if (!confirmed) return;

        try {
            setBusyUser(username);
            await reactivateAccount(username);
            await load(true);
        } catch (err) {
            console.error("Failed to reactivate account:", err);
            setError("Failed to reactivate the account. Please try again.");
        } finally {
            setBusyUser(null);
        }
    };

    return (
        <div className="admin-table-card">
            <div className="table-title-row">
                <h5>Locked / Inactive Accounts</h5>
            </div>

            {error && <p className="text-danger">{error}</p>}

            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Failed Attempts</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5}>Loading...</td>
                            </tr>
                        ) : accounts.length === 0 ? (
                            <tr>
                                <td colSpan={5}>No locked or inactive accounts.</td>
                            </tr>
                        ) : (
                            accounts.map((account) => (
                                <tr key={account.username}>
                                    <td>{account.username}</td>
                                    <td>{account.role ?? "—"}</td>
                                    <td>{account.failedLoginAttempts}</td>
                                    <td>{account.locked ? "Locked" : "Inactive"}</td>
                                    <td>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleReactivate(account.username)}
                                            disabled={busyUser === account.username}
                                        >
                                            {busyUser === account.username ? "Reactivating..." : "Reactivate"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default LockedAccountsTable;
