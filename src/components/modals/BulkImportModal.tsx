import { useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import * as XLSX from "xlsx";

export interface BulkImportColumn {
    key: string;
    label: string;
    required: boolean;
    validate?: (value: string) => string | null;
}

interface ParsedRow {
    index: number;
    data: Record<string, string>;
    errors: string[];
}

type Stage = "upload" | "preview" | "importing" | "done";

interface BulkImportModalProps {
    show: boolean;
    title: string;
    subtitle?: string;
    columns: BulkImportColumn[];
    templateFileName: string;
    existingKeys: Set<string>;
    getRowKey: (row: Record<string, string>) => string;
    onImportRow: (row: Record<string, string>) => Promise<void>;
    onClose: () => void;
    onComplete: () => void;
}

function normalizeHeader(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function BulkImportModal({
                              show,
                              title,
                              subtitle,
                              columns,
                              templateFileName,
                              existingKeys,
                              getRowKey,
                              onImportRow,
                              onClose,
                              onComplete,
                          }: BulkImportModalProps) {
    const [stage, setStage] = useState<Stage>("upload");
    const [fileName, setFileName] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [parseError, setParseError] = useState("");
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [showOnlyErrors, setShowOnlyErrors] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState<{
        success: number;
        failed: { row: number; reason: string }[];
    }>({ success: 0, failed: [] });

    if (!show) {
        return null;
    }

    const resetState = () => {
        setStage("upload");
        setFileName("");
        setParseError("");
        setRows([]);
        setShowOnlyErrors(false);
        setProgress({ current: 0, total: 0 });
        setResults({ success: 0, failed: [] });
    };

    const handleClose = () => {
        if (stage === "importing") {
            return;
        }

        resetState();
        onClose();
    };

    const handleDone = () => {
        resetState();
        onComplete();
        onClose();
    };

    function normalizeDate(value: string): string {
        if (!value) {
            return "";
        }

        const parts = value.split("/");

        if (parts.length !== 3) {
            return value;
        }

        const [month, day, year] = parts;

        const monthNumber = Number(month);
        const dayNumber = Number(day);
        let yearNumber = Number(year);

        if (
            !Number.isInteger(monthNumber) ||
            !Number.isInteger(dayNumber) ||
            !Number.isInteger(yearNumber)
        ) {
            return value;
        }

        if (yearNumber < 100) {
            yearNumber += yearNumber >= 50 ? 1900 : 2000;
        }

        return [
            yearNumber.toString().padStart(4, "0"),
            monthNumber.toString().padStart(2, "0"),
            dayNumber.toString().padStart(2, "0"),
        ].join("-");
    }

    const parseFile = async (file: File) => {
        setFileName(file.name);
        setParseError("");

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];

            if (!firstSheetName) {
                setParseError("That file doesn't contain any sheets.");
                return;
            }

            const sheet = workbook.Sheets[firstSheetName];
            const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                sheet,
                {
                    defval: "",
                    raw: false,
                }
            );

            if (raw.length === 0) {
                setParseError("No data rows were found in that file.");
                return;
            }

            const sourceHeaders = Object.keys(raw[0]);
            const headerLookup = new Map<string, string>();

            sourceHeaders.forEach((header) => {
                headerLookup.set(normalizeHeader(header), header);
            });

            const missingColumns = columns.filter(
                (col) =>
                    col.required &&
                    !headerLookup.has(normalizeHeader(col.label))
            );

            if (missingColumns.length > 0) {
                setParseError(
                    `Missing required column${
                        missingColumns.length > 1 ? "s" : ""
                    }: ${missingColumns.map((c) => c.label).join(", ")}`
                );
                return;
            }

            const seenKeys = new Set<string>();

            const parsedRows: ParsedRow[] = raw.map((rawRow, i) => {
                const data: Record<string, string> = {};

                columns.forEach((col) => {
                    const sourceHeader = headerLookup.get(
                        normalizeHeader(col.label)
                    );

                    let value = sourceHeader
                        ? String(rawRow[sourceHeader] ?? "").trim()
                        : "";

                    if (col.key === "dateOfBirth") {
                        value = normalizeDate(value);
                    }

                    data[col.key] = value;
                });

                const errors: string[] = [];

                columns.forEach((col) => {
                    const value = data[col.key];

                    if (col.required && !value) {
                        errors.push(`${col.label} is required`);
                        return;
                    }

                    if (value && col.validate) {
                        const validationError = col.validate(value);

                        if (validationError) {
                            errors.push(`${col.label}: ${validationError}`);
                        }
                    }
                });

                const rowKey = getRowKey(data);

                if (rowKey) {
                    if (existingKeys.has(rowKey)) {
                        errors.push("Already exists in the system");
                    } else if (seenKeys.has(rowKey)) {
                        errors.push("Duplicate row within this file");
                    } else {
                        seenKeys.add(rowKey);
                    }
                }

                return { index: i + 2, data, errors };
            });

            setRows(parsedRows);
            setStage("preview");
        } catch (err) {
            console.error("Failed to parse import file:", err);
            setParseError(
                "Couldn't read that file. Please make sure it's a valid Excel (.xlsx) or CSV file."
            );
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            void parseFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            void parseFile(file);
        }
        e.target.value = "";
    };

    const handleDownloadTemplate = () => {
        const headerRow = columns.map((col) => col.label);
        const worksheet = XLSX.utils.aoa_to_sheet([headerRow]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
        XLSX.writeFile(workbook, templateFileName);
    };

    const validRows = rows.filter((row) => row.errors.length === 0);
    const errorCount = rows.length - validRows.length;
    const visibleRows = showOnlyErrors
        ? rows.filter((row) => row.errors.length > 0)
        : rows;

    const handleImport = async () => {
        setStage("importing");
        setProgress({ current: 0, total: validRows.length });

        const failed: { row: number; reason: string }[] = [];
        let success = 0;

        for (const row of validRows) {
            try {
                await onImportRow(row.data);
                success += 1;
            } catch (err: any) {
                const message =
                    err?.response?.data?.message ||
                    (typeof err?.response?.data === "string"
                        ? err.response.data
                        : "") ||
                    "Failed to save this record.";

                failed.push({ row: row.index, reason: message });
            }

            setProgress((previous) => ({
                ...previous,
                current: previous.current + 1,
            }));
        }

        setResults({ success, failed });
        setStage("done");
    };

    return (
        <div className="admin-modal-overlay" onClick={handleClose}>
            <div
                className="admin-modal bulk-import-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-modal-header">
                    <div>
                        <h4>{title}</h4>
                        {subtitle && (
                            <p className="bulk-import-subtitle">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={stage === "importing"}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {stage === "upload" && (
                    <div className="bulk-import-upload">
                        <div
                            className={
                                isDragging
                                    ? "bulk-dropzone is-dragging"
                                    : "bulk-dropzone"
                            }
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <div className="bulk-dropzone-icon">
                                <i className="bi bi-cloud-arrow-up-fill"></i>
                            </div>

                            <p className="bulk-dropzone-title">
                                Drag & drop your file here
                            </p>

                            <p className="bulk-dropzone-subtitle">or</p>

                            <label className="bulk-browse-btn">
                                Browse Files
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileInputChange}
                                    hidden
                                />
                            </label>

                            <p className="bulk-dropzone-hint">
                                Supports .xlsx, .xls, .csv
                            </p>
                        </div>

                        {parseError && (
                            <div
                                className="alert alert-danger mt-3"
                                role="alert"
                            >
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {parseError}
                            </div>
                        )}

                        <button
                            type="button"
                            className="bulk-template-link"
                            onClick={handleDownloadTemplate}
                        >
                            <i className="bi bi-download"></i>
                            <span>Download a blank template</span>
                        </button>
                    </div>
                )}

                {stage === "preview" && (
                    <div className="bulk-import-preview">
                        <div className="bulk-summary-row">
                            <div className="bulk-summary-chip bulk-chip-total">
                                <i className="bi bi-file-earmark-spreadsheet-fill"></i>
                                <span>
                                    {fileName || "File"} · {rows.length} row
                                    {rows.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            <div className="bulk-summary-chip bulk-chip-valid">
                                <i className="bi bi-check-circle-fill"></i>
                                <span>{validRows.length} ready</span>
                            </div>

                            {errorCount > 0 && (
                                <div className="bulk-summary-chip bulk-chip-error">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <span>
                                        {errorCount} need attention
                                    </span>
                                </div>
                            )}

                            <label className="bulk-filter-toggle">
                                <input
                                    type="checkbox"
                                    checked={showOnlyErrors}
                                    onChange={(e) =>
                                        setShowOnlyErrors(e.target.checked)
                                    }
                                    disabled={errorCount === 0}
                                />
                                <span>Show only errors</span>
                            </label>
                        </div>

                        <div className="bulk-preview-table-wrap">
                            <table className="bulk-preview-table">
                                <thead>
                                <tr>
                                    <th className="bulk-row-num-col">
                                        #
                                    </th>
                                    {columns.map((col) => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                    <th className="bulk-status-col">
                                        Status
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {visibleRows.map((row) => (
                                    <tr
                                        key={row.index}
                                        className={
                                            row.errors.length > 0
                                                ? "bulk-row-error"
                                                : undefined
                                        }
                                    >
                                        <td className="bulk-row-num-col">
                                            {row.index}
                                        </td>

                                        {columns.map((col) => (
                                            <td key={col.key}>
                                                {row.data[col.key] || "—"}
                                            </td>
                                        ))}

                                        <td className="bulk-status-col">
                                            {row.errors.length === 0 ? (
                                                <span className="bulk-status-badge bulk-status-ok">
                                                    <i className="bi bi-check-lg"></i>
                                                    Ready
                                                </span>
                                            ) : (
                                                <span
                                                    className="bulk-status-badge bulk-status-bad"
                                                    title={row.errors.join(
                                                        "; "
                                                    )}
                                                >
                                                    <i className="bi bi-exclamation-lg"></i>
                                                    {row.errors[0]}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {stage === "importing" && (
                    <div className="bulk-import-progress">
                        <div className="bulk-progress-icon">
                            <i className="bi bi-arrow-repeat"></i>
                        </div>

                        <p className="bulk-progress-text">
                            Importing {progress.current} of{" "}
                            {progress.total}...
                        </p>

                        <div className="bulk-progress-bar">
                            <div
                                className="bulk-progress-fill"
                                style={{
                                    width: `${
                                        progress.total === 0
                                            ? 0
                                            : (progress.current /
                                                  progress.total) *
                                              100
                                    }%`,
                                }}
                            ></div>
                        </div>
                    </div>
                )}

                {stage === "done" && (
                    <div className="bulk-import-done">
                        <div
                            className={
                                results.failed.length === 0
                                    ? "bulk-done-icon"
                                    : "bulk-done-icon bulk-done-icon-partial"
                            }
                        >
                            <i
                                className={
                                    results.failed.length === 0
                                        ? "bi bi-check-circle-fill"
                                        : "bi bi-exclamation-triangle-fill"
                                }
                            ></i>
                        </div>

                        <p className="bulk-done-title">
                            {results.success} record
                            {results.success === 1 ? "" : "s"} imported
                            successfully
                        </p>

                        {results.failed.length > 0 && (
                            <>
                                <p className="bulk-done-subtitle">
                                    {results.failed.length} row
                                    {results.failed.length === 1
                                        ? ""
                                        : "s"}{" "}
                                    couldn't be imported:
                                </p>

                                <ul className="bulk-failed-list">
                                    {results.failed.map((f) => (
                                        <li key={f.row}>
                                            <strong>Row {f.row}:</strong>{" "}
                                            {f.reason}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                )}

                <div className="admin-modal-actions">
                    {stage === "upload" && (
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                    )}

                    {stage === "preview" && (
                        <>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={resetState}
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                className="save-btn"
                                onClick={handleImport}
                                disabled={validRows.length === 0}
                            >
                                Import {validRows.length} record
                                {validRows.length === 1 ? "" : "s"}
                            </button>
                        </>
                    )}

                    {stage === "importing" && (
                        <button type="button" className="save-btn" disabled>
                            Importing...
                        </button>
                    )}

                    {stage === "done" && (
                        <>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={resetState}
                            >
                                Import More
                            </button>

                            <button
                                type="button"
                                className="save-btn"
                                onClick={handleDone}
                            >
                                Done
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BulkImportModal;