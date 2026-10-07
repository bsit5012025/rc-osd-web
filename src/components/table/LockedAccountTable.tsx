import type { LockedAccount } from "../../services/lockedAccountApi";

interface LockedAccountTableProps {
    accounts: LockedAccount[];
    loading: boolean;
    onUnlock: (username: string) => void;
    unlockingUsername: string | null;
}

function LockedAccountTable({
    accounts,
    loading,
    onUnlock,
    unlockingUsername,
}: LockedAccountTableProps) {

    return (
        <div className="table-responsive">

            <table className="table align-middle mb-0">

                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Failed Attempts</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                    </tr>
                </thead>

                <tbody>

                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">
                                Loading locked accounts...
                            </td>
                        </tr>
                    ) : accounts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">
                                No locked accounts.
                            </td>
                        </tr>
                    ) : (
                        accounts.map((account) => {

                            const isUnlocking =
                                unlockingUsername === account.username;

                            return (
                                <tr key={account.username}>

                                    <td className="fw-semibold">
                                        {account.username}
                                    </td>

                                    <td>
                                        {account.role
                                            ?.replace("ROLE_", "")
                                            .replace("_", " ") || "—"}
                                    </td>

                                    <td>
                                        {account.failedLoginAttempts}
                                    </td>

                                    <td>
                                        <span className="badge bg-danger">
                                            Locked
                                        </span>
                                    </td>

                                    <td className="text-end">

                                        <button
                                            type="button"
                                            className="btn btn-sm btn-success"
                                            disabled={isUnlocking}
                                            onClick={() =>
                                                onUnlock(account.username)
                                            }
                                        >
                                            {isUnlocking ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-1"
                                                        role="status"
                                                    />
                                                    Unlocking...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-unlock-fill me-1"></i>
                                                    Unlock
                                                </>
                                            )}
                                        </button>

                                    </td>

                                </tr>
                            );
                        })
                    )}

                </tbody>

            </table>

        </div>
    );
}

export default LockedAccountTable;