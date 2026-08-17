import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import "./fileAppealPage.css";

interface OffenseOption {
    id: string;
    label: string;
}

function fileAppealPage() {

    // TODO: replace with real offense list from API
    const [offenseOptions] = useState<OffenseOption[]>([]);

    const [selectedOffenseId, setSelectedOffenseId] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        
    };

    const canSubmit = selectedOffenseId !== "" && selectedFile !== null;

    return (
        <div className="new-appeal-page">

            <div className="container-fluid px-3 px-md-4 py-3 py-md-4">

                <div className="new-appeal-content">

                    <div className="new-appeal-header mb-4">
                        <Link to="/appeals" className="new-appeal-back">
                            <i className="bi bi-chevron-left"></i>
                        </Link>
                        <h5 className="new-appeal-title">File a New Appeal</h5>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="mb-4">
                            <label className="new-appeal-section-label" htmlFor="offenseSelect">
                                Select Offense to Appeal
                            </label>
                            <select
                                id="offenseSelect"
                                className="form-select new-appeal-select"
                                value={selectedOffenseId}
                                onChange={(e) => setSelectedOffenseId(e.target.value)}
                            >
                                <option value="" disabled>
                                    Tap to choose offense
                                </option>
                                {offenseOptions.map((offense) => (
                                    <option key={offense.id} value={offense.id}>
                                        {offense.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="new-appeal-section-label">Appeal Letter</label>
                            <p className="new-appeal-hint mb-2">Attach letter here</p>

                            <div className="upload-box">

                                <div className="upload-icon">
                                    <i className="bi bi-upload"></i>
                                </div>

                                <div className="upload-text">
                                    {selectedFile ? selectedFile.name : "No file attached yet"}
                                </div>

                                <div className="upload-subtext">
                                    PDF, DOCX, JPG &nbsp;•&nbsp; Max 10MB per file
                                </div>

                                <button
                                    type="button"
                                    className="upload-browse-btn"
                                    onClick={handleBrowseClick}
                                >
                                    Browse Files
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.jpg,.jpeg"
                                    className="d-none"
                                    onChange={handleFileChange}
                                />

                            </div>
                        </div>

                        <button type="submit" className="submit-appeal-btn" disabled={!canSubmit}>
                            Submit Appeal
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default fileAppealPage;