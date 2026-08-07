import TopBar from "../../components/navigation/TopBar";
import BottomNavigationBar from "../../components/navigation/BottomNavigationBar";
import OffenseCard from "../../components/cards/OffenseCard";

function OffensesPage() {
    const offenses = [
        {
            id: 1,
            offense: "Public Display of Affection",
            level: "Major",
            dateFiled: "July 01, 2026",
            status: "Pending",
        },
        {
            id: 2,
            offense: "Tardy",
            level: "Minor",
            dateFiled: "July 01, 2026",
            status: "Approved",
        },
    ];

    return (
        <div className="offenses-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <TopBar>
                    <div className="student-profile d-flex align-items-center">

                        <div
                            className="student-avatar rounded d-flex align-items-center justify-content-center"
                            style={{
                                background: "#6d6adf",
                                fontWeight: "bold",
                                fontSize: "1.5rem",
                            }}
                        >
                            LR
                        </div>

                        <div className="ms-3 text-white student-info">

                            <h4 className="mb-1 fw-bold">
                                Leeane Glazel N. Reyes
                            </h4>

                            <div className="student-details">
                                Student ID:
                                <strong className="ms-2">
                                    CT23-0000
                                </strong>

                                <span className="mx-2">•</span>

                                BSIT
                            </div>

                        </div>

                    </div>
                </TopBar>

                <main className="offenses-content">

                    <h2 className="mt-4 mt-md-5 mb-4 fw-bold">
                        My Offenses
                    </h2>

                    {/* Filters */}
                    <div className="offense-filters d-flex gap-2 gap-md-3 mb-4 mb-md-5">

                        <button className="btn btn-primary fw-bold">
                            All
                        </button>

                        <button className="btn border border-black fw-bold">
                            Pending
                        </button>

                        <button className="btn border border-black fw-bold">
                            Approved
                        </button>

                        <button className="btn border border-black fw-bold">
                            Denied
                        </button>

                    </div>

                    {/* Offenses */}
                    <div className="offense-list">

                        {offenses.map((offense) => (
                            <OffenseCard
                                key={offense.id}
                                offense={offense.offense}
                                level={offense.level}
                                dateFiled={offense.dateFiled}
                                status={offense.status}
                            />
                        ))}

                    </div>

                </main>

            </div>

            <BottomNavigationBar />

        </div>
    );
}

export default OffensesPage;